import { Octokit } from "octokit";

const USERNAME = "lemueldls";

const MAX_AGE = 60 * 60;

const CACHE_KEY = ["stats", "github", "stats", "v1.json"].join(":");

const CACHE_KEY_RELATIVE = CACHE_KEY.slice("stats:".length);

const REPO_LIMIT = 100;

const MAX_PAGES = 5;

const LANG_CONCURRENCY = 8;

const RETRY_LIMIT = 1;

const IGNORED_LANGUAGES = new Set([
  "HTML",
  "CSS",
  "SCSS",
  "Sass",
  "Less",
  "Makefile",
  "Shell",
  "Batchfile",
  "Dockerfile",
  "Just",
  "Nix",
  "Terraform",
  "Jupyter Notebook",
]);

const MIN_PERCENT = 0.5;

interface Totals {
  commits: number;
  stars: number;
  pullRequests: number;
  issues: number;
  reviews: number;
}

interface Language {
  name: string;
  percent: number;
}

interface TopRepo {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
}

interface Profile {
  name: string | null;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
}

interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
}

interface StatsPayload {
  username: string;
  profile: Profile;
  totals: Totals;
  languages: Language[];
  topRepos: TopRepo[];
  fetchedAt: string;
}

const loadStats = defineCachedFunction(
  async (): Promise<StatsPayload> => {
    const octokit = new Octokit({
      auth: useRuntimeConfig().github.token || undefined,
      retry: { limit: RETRY_LIMIT },
    });

    const repos = await listRepos(octokit);
    const authenticated = Boolean(useRuntimeConfig().github.token);

    const [profile, totals, languages, topRepos] = await Promise.all([
      fetchProfile(octokit),
      fetchTotals(octokit, repos),
      fetchLanguages(octokit, repos, { full: authenticated }),
      Promise.resolve(rankRepos(repos)),
    ]);

    return {
      username: USERNAME,
      profile,
      totals,
      languages,
      topRepos,
      fetchedAt: new Date().toISOString(),
    };
  },
  {
    base: "stats",
    group: "github",
    name: "stats",

    getKey: () => "v1",
    maxAge: MAX_AGE,
    swr: true,
  },
);

export default defineEventHandler(async (event) => {
  try {
    return { ...(await loadStats()), stale: false };
  } catch (error) {
    const lastGood = await readLastGood();

    if (lastGood) {
      return { ...lastGood, stale: true };
    }

    throw createError({
      statusCode: 503,
      statusMessage: "GitHub statistics are temporarily unavailable",
      cause: error,
    });
  }
});

async function readLastGood(): Promise<StatsPayload | null> {
  const entry = await useStorage("stats")
    .getItem<{ value?: StatsPayload }>(CACHE_KEY_RELATIVE)
    .catch(() => null);

  return entry?.value ?? null;
}

async function fetchProfile(octokit: Octokit) {
  const { data } = await octokit.rest.users.getByUsername({ username: USERNAME });

  return {
    name: data.name ?? null,
    avatarUrl: data.avatar_url,
    publicRepos: data.public_repos,
    followers: data.followers,
    following: data.following,
  };
}

async function fetchTotals(octokit: Octokit, repos: Repo[]) {
  const author = `author:${USERNAME}`;

  const [commits, pullRequests, issues, reviews] = await Promise.all([
    searchCount(octokit, "/search/commits", { q: author }),
    searchCount(octokit, "/search/issues", { q: `${author} is:pr is:merged` }),
    searchCount(octokit, "/search/issues", { q: `${author} is:issue` }),
    searchCount(octokit, "/search/issues", { q: `reviewed-by:${USERNAME} is:pr` }),
  ]);

  const stars = repos.reduce((sum, repo) => sum + repo.stars, 0);

  return { commits, stars, pullRequests, issues, reviews };
}

async function searchCount(
  octokit: Octokit,
  route: "/search/commits" | "/search/issues",
  params: { q: string },
): Promise<number> {
  const { data } = (await octokit.request(`GET ${route}`, params)) as {
    data: { total_count: number };
  };
  return data.total_count;
}

const UNAUTH_LANG_LIMIT = 8;

async function fetchLanguages(octokit: Octokit, repos: Repo[], { full }: { full: boolean }) {
  const bytes = new Map<string, number>();
  let total = 0;

  if (!full) {
    for (const repo of repos.slice(0, UNAUTH_LANG_LIMIT * 4)) {
      if (!repo.language) continue;

      add(bytes, repo.language, 1);
      total += 1;
    }

    return rankLanguages(bytes, total);
  }

  const queue = [...repos];
  const workers = Array.from({ length: Math.min(LANG_CONCURRENCY, queue.length) }, async () => {
    while (queue.length > 0) {
      const repo = queue.shift()!;

      try {
        const { data } = await octokit.rest.repos.listLanguages({
          owner: USERNAME,
          repo: repo.name,
        });

        for (const [name, size] of Object.entries(data)) {
          add(bytes, name, size);
          total += size;
        }
      } catch {}
    }
  });

  await Promise.all(workers);

  return rankLanguages(bytes, total);
}

function rankLanguages(bytes: Map<string, number>, total: number): Language[] {
  if (total === 0) return [];

  return [...bytes.entries()]
    .filter(([name]) => !IGNORED_LANGUAGES.has(name))
    .map(([name, size]) => ({ name, percent: (size / total) * 100 }))
    .filter((entry) => entry.percent >= MIN_PERCENT)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 8)
    .map((entry) => ({ ...entry, percent: Math.round(entry.percent * 10) / 10 }));
}

function rankRepos(repos: Repo[]): TopRepo[] {
  return [...repos]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stars,
      language: repo.language,
    }));
}

async function listRepos(octokit: Octokit): Promise<Repo[]> {
  const byName = new Map<string, Repo>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data } = await octokit.rest.repos.listForUser({
      username: USERNAME,
      per_page: REPO_LIMIT,
      page,
      sort: "updated",
    });

    for (const repo of data) {
      if (byName.has(repo.name)) continue;

      byName.set(repo.name, {
        name: repo.name,
        description: repo.description ?? null,
        language: repo.language ?? null,
        stars: repo.stargazers_count ?? 0,
      });
    }

    if (data.length < REPO_LIMIT) break;
  }

  return [...byName.values()];
}

function add(map: Map<string, number>, key: string, value: number) {
  map.set(key, (map.get(key) ?? 0) + value);
}
