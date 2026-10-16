export interface Totals {
  commits: number;
  stars: number;
  pullRequests: number;
  issues: number;
  reviews: number;
}

export interface Language {
  name: string;
  percent: number;
}

export interface TopRepo {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
}

export interface Profile {
  name: string | null;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
}

export interface GitHubStats {
  username: string;
  profile: Profile;
  totals: Totals;
  languages: TopLanguage[];
  topRepos: TopRepo[];

  fetchedAt: string;

  stale: boolean;
}

export type TopLanguage = Language;

export interface RepoActivity {
  pushedAt: string;
  archived: boolean;
}

export interface RepoMeta {
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

export const TOTAL_LABELS: { key: keyof Totals; label: string }[] = [
  { key: "commits", label: "Commits" },
  { key: "stars", label: "Stars" },
  { key: "pullRequests", label: "Pull requests" },
  { key: "issues", label: "Issues" },
];

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
