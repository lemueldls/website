import { Octokit } from "octokit";

import { parseMarkdown } from "@nuxtjs/mdc/runtime";

const MAX_AGE = 60 * 60;

const SEGMENT_RE = /^[\w][\w.-]{0,99}$/;

interface StatsPayload {
  name: string;
  fullName: string;
  description: string | null;
  homepage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  license: string | null;
  licenseSpdx: string | null;
  topics: string[];
  language: string | null;
  languages: Record<string, number>;
  defaultBranch: string;
  createdAt: string;
  pushedAt: string;
  archived: boolean;
  fork: boolean;
  readme: string | null;
  readmeAst: unknown;
}

const loadRepo = defineCachedFunction(
  async (owner: string, repo: string): Promise<StatsPayload | null> => {
    const octokit = new Octokit({
      auth: useRuntimeConfig().github.token || undefined,
      retry: { limit: 1 },
    });

    const [repoRes, readmeRes, languagesRes] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }).catch(() => null),
      octokit.rest.repos.getReadme({ owner, repo, mediaType: { format: "raw" } }).catch(() => null),
      octokit.rest.repos.listLanguages({ owner, repo }).catch(() => null),
    ]);

    if (!repoRes?.data) return null;

    const data = repoRes.data;
    const rawReadme = typeof readmeRes?.data === "string" ? readmeRes.data : null;

    const readme = rawReadme
      ? resolveRelativeImages(rawReadme, owner, data.name, data.default_branch)
      : null;

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description ?? null,
      homepage: data.homepage || null,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      watchers: data.watchers_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      license: data.license?.name ?? null,
      licenseSpdx: data.license?.spdx_id ?? null,
      topics: data.topics ?? [],
      language: data.language ?? null,
      languages: languagesRes?.data ?? {},
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      pushedAt: data.pushed_at,
      archived: data.archived,
      fork: data.fork,
      readme,

      readmeAst: readme ? await parseMarkdown(readme) : null,
    };
  },
  {
    base: "cache",
    group: "repo",
    name: "meta",
    maxAge: MAX_AGE,
    swr: true,
  },
);

function resolveRelativeImages(
  markdown: string,
  owner: string,
  repo: string,
  branch: string,
): string {
  const root = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;

  return markdown.replace(
    /(!\[[^\]]*\]\()\s*([^)\s]+)(\s+(?:"[^"]*"|'[^']*'))?\s*\)/g,
    (match, prefix, src, title) => {
      if (/^([a-z][a-z0-9+.-]*:|\/\/|#|data:)/i.test(src)) return match;
      return prefix + new URL(src, root).toString() + (title ?? "") + ")";
    },
  );
}

export default defineEventHandler(async (event) => {
  // `[...path]` carries `<owner>/<repo>` so the section works for a project hosted
  // anywhere, not only under the site owner's account.
  const segments = String(event.context.params?.path ?? "")
    .split("/")
    .filter(Boolean);

  if (segments.length !== 2 || !segments.every((segment) => SEGMENT_RE.test(segment))) {
    throw createError({ statusCode: 400, statusMessage: "Invalid repository path" });
  }

  const [owner, repo] = segments as [string, string];
  const payload = await loadRepo(owner, repo);

  if (!payload) {
    throw createError({ statusCode: 404, statusMessage: "No such repository" });
  }

  return payload;
});
