<script setup lang="ts">
import { TOTAL_LABELS } from "#shared/github";

const { stats, loading } = useGithubStats();

const totals = computed(() => {
  if (!stats.value) return [];

  return TOTAL_LABELS.map((entry) => ({
    key: entry.key,
    label: entry.label,
    icon: entry.icon,
    value: stats.value!.totals[entry.key],
  }));
});

const repoNote = computed(() => {
  const repos = stats.value?.profile.publicRepos;
  return repos ? `across ${repos} repositories` : undefined;
});

const fetchedNote = computed(() => {
  const at = stats.value?.fetchedAt;
  if (!at) return undefined;
  return new Date(at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});
</script>

<template>
  <section v-if="stats || loading" class="ghstats">
    <XSection label="GitHub" icon="simple-icons:github">
      <template v-if="stats?.stale" #tail>
        <span class="meta">last known</span>
      </template>

      <XSheet class="ghstats__sheet">
        <div class="ghstats__totals">
          <XStatCard
            v-for="entry in totals"
            :key="entry.key"
            :label="entry.label"
            :icon="entry.icon"
            :value="entry.value"
            :note="entry.key === 'commits' ? repoNote : undefined"
          />
        </div>

        <template v-if="stats && stats.languages.length">
          <div class="ghstats__rule" aria-hidden="true" />

          <div class="ghstats__row">
            <div class="ghstats__col">
              <XLabel variant="accent" icon="material-symbols:code-outline-sharp">Languages</XLabel>
              <!-- <p class="meta ghstats__caption">Share of all bytes, by primary language</p> -->
              <XLanguageShare :languages="stats.languages" />
            </div>

            <div class="ghstats__col">
              <XLabel variant="accent" icon="material-symbols:star-outline-sharp"
                >Most starred</XLabel
              >
              <p class="meta ghstats__caption">Open source, by stars</p>

              <ol class="repos">
                <li v-for="repo in stats.topRepos" :key="repo.name" class="repo">
                  <span class="repo__name">{{ repo.name }}</span>
                  <span class="repo__stars">
                    <XIcon name="material-symbols:star-outline-sharp" />
                    <span class="num">{{ repo.stars }}</span>
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </template>

        <!-- <div v-if="fetchedNote" class="ghstats__foot meta">
        {{ fetchedNote }}
        <span v-if="stats?.stale" class="ghstats__stale"> // unavailable, showing cached</span>
      </div> -->
      </XSheet>
    </XSection>
  </section>
</template>

<style scoped>
.ghstats__sheet {
  padding: 0;
  overflow: visible;
}

.ghstats__totals {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.ghstats__totals > * {
  border-left: var(--rule-width) solid var(--c-rule);
}

.ghstats__totals > :nth-child(4n + 1) {
  border-left: none;
}

.ghstats__totals > :nth-child(n + 5) {
  border-top: var(--rule-width) solid var(--c-rule);
}

.ghstats__rule {
  height: 0;
  border-top: var(--rule-width) solid var(--c-rule);
}

.ghstats__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: var(--space-7);
  padding: var(--space-6);
}

@media (max-width: 640px) {
  .ghstats__totals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ghstats__totals > :nth-child(2n + 1) {
    border-left: none;
  }

  .ghstats__totals > :nth-child(n + 3) {
    border-top: var(--rule-width) solid var(--c-rule);
  }

  .ghstats__row {
    gap: var(--space-6);
    padding: var(--space-5) var(--space-4);
  }
}

.ghstats__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.ghstats__caption {
  margin: 0;
}

.ghstats__foot {
  padding: var(--space-3) var(--space-6);
  border-top: var(--rule-width) solid var(--c-rule);
  background: var(--c-sheet-2);
}

.ghstats__stale {
  color: var(--c-warning);
}

.repos {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.repo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3) var(--space-4);
  padding-block: var(--space-2);
  border-bottom: var(--rule-width) solid var(--c-rule);
  font-size: var(--t-9);
}

.repo:last-child {
  border-bottom: none;
}

.repo__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--c-dim);
}

.repo__stars {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--c-dim);
}
</style>
