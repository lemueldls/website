import { createSharedComposable } from "@vueuse/core";

import type { GitHubStats } from "#shared/github";

const useSharedStats = createSharedComposable(() => {
  const { data, error } = useFetch<GitHubStats>("/api/github", {
    key: "github-stats",
    server: false,
  });

  return {
    stats: computed(() => data.value ?? null),
    error: computed(() => error.value ?? null),

    loading: computed(() => !data.value && !error.value),
  };
});

export const useGithubStats = useSharedStats;
