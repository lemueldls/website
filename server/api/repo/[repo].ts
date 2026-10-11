import { Octokit } from "octokit";

import { parseMarkdown } from "@nuxtjs/mdc/runtime";

const OWNER = "lemueldls";

const MAX_AGE = 60 * 60;

const NAME_RE = /^[\w][\w.-]{0,99}$/;

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
  async (repo: string): Promise<StatsPayload | null> => {
    const octokit = new Octokit({
      auth: useRuntimeConfig().github.token || undefined,
      retry: { limit: 1 },
    });

    const [repoRes, readmeRes, languagesRes] = await Promise.all([
      octokit.rest.repos.get({ owner: OWNER, repo }).catch(() => null),
      octokit.rest.repos
        .getReadme({ owner: OWNER, repo, mediaType: { format: "raw" } })
        .catch(() => null),
      octokit.rest.repos.listLanguages({ owner: OWNER, repo }).catch(() => null),
    ]);

    if (!repoRes?.data) return null;

    const data = repoRes.data;
    const rawReadme = typeof readmeRes?.data === "string" ? readmeRes.data : null;

    const readme = rawReadme
      ? resolveRelativeImages(rawReadme, data.name, data.default_branch)
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
    base: "stats",
    group: "repo",
    name: "meta",
    maxAge: MAX_AGE,
    swr: true,
  },
);

function resolveRelativeImages(markdown: string, repo: string, branch: string): string {
  const root = `https://raw.githubusercontent.com/${OWNER}/${repo}/${branch}/`;

  return markdown.replace(
    /(!\[[^\]]*\]\()\s*([^)\s]+)(\s+(?:"[^"]*"|'[^']*'))?\s*\)/g,
    (match, prefix, src, title) => {
      if (/^([a-z][a-z0-9+.-]*:|\/\/|#|data:)/i.test(src)) return match;
      return prefix + new URL(src, root).toString() + (title ?? "") + ")";
    },
  );
}

export default defineEventHandler(async (event) => {
  const repo = String(event.context.params?.repo ?? "");

  if (!NAME_RE.test(repo)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid repository name" });
  }

  const payload = await loadRepo(repo);

  if (!payload) {
    throw createError({ statusCode: 404, statusMessage: "No such repository" });
  }

  return payload;
});
