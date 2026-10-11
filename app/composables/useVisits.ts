import { createSharedComposable } from "@vueuse/core";

import type { VisitCounts } from "#shared/visits";

const useSharedVisits = createSharedComposable(() => {
  const { data, error } = useFetch<VisitCounts>("/api/visits", {
    key: "visits",
    server: false,
  });

  return {
    visits: computed(() => data.value ?? null),
    error: computed(() => error.value ?? null),

    loading: computed(() => !data.value && !error.value),
  };
});

export const useVisits = useSharedVisits;
