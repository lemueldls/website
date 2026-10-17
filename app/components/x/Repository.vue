<script setup lang="ts">
import type { RepoMeta } from "#shared/github";

const props = defineProps<{
  repo: string;
}>();

const { repo } = toRefs(props);

const { data, error } = await useAsyncData<RepoMeta | null>(
  () => `repo:${repo.value}`,
  () => $fetch<RepoMeta>(`/api/repo/${repo.value}`).catch(() => null),
  { server: false },
);

const meta = computed(() => data.value ?? null);

const readmeBody = computed(() => {
  const parsed = meta.value?.readmeAst as { body?: unknown } | null;
  return parsed?.body ?? null;
});

const readmeLength = computed(() => JSON.stringify(readmeBody.value ?? {}).length);

const languageShares = computed(() => {
  const languages = meta.value?.languages ?? {};
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(languages)
    .map(([name, bytes]) => ({ name, percent: (bytes / total) * 100 }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6);
});

const created = computed(() => (meta.value ? formatYear(meta.value.createdAt) : ""));
const pushed = computed(() => (meta.value ? formatYear(meta.value.pushedAt) : ""));

function formatYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}
</script>

<template>
  <section v-if="meta" class="repo">
    <XSection label="Repository" icon="material-symbols:folder-outline-sharp">
      <template v-if="meta.archived" #tail>
        <span class="meta">archived</span>
      </template>

      <XSheet class="repo__sheet">
        <dl class="repo__facts">
          <div class="repo__fact">
            <dt class="label label--icon">
              <XIcon name="material-symbols:star-outline-sharp" class="label__icon" />Stars
            </dt>
            <dd class="repo__value num">{{ meta.stars }}</dd>
          </div>

          <div class="repo__fact">
            <dt class="label label--icon">
              <XIcon name="material-symbols:fork-right-outline-sharp" class="label__icon" />Forks
            </dt>
            <dd class="repo__value num">{{ meta.forks }}</dd>
          </div>

          <div class="repo__fact">
            <dt class="label label--icon">
              <XIcon name="material-symbols:bug-report-outline-sharp" class="label__icon" />Open
              issues
            </dt>
            <dd class="repo__value num">{{ meta.openIssues }}</dd>
          </div>

          <div class="repo__fact">
            <dt class="label label--icon">
              <XIcon name="material-symbols:license-outline-sharp" class="label__icon" />License
            </dt>
            <dd class="repo__value">
              {{ meta.license ?? "None" }}
            </dd>
          </div>

          <div class="repo__fact">
            <dt class="label label--icon">
              <XIcon name="material-symbols:code-outline-sharp" class="label__icon" />Language
            </dt>
            <dd class="repo__value">{{ meta.language ?? "—" }}</dd>
          </div>

          <div class="repo__fact">
            <dt class="label label--icon">
              <XIcon name="material-symbols:history-outline-sharp" class="label__icon" />Last push
            </dt>
            <dd class="repo__value num">{{ pushed }}</dd>
          </div>
        </dl>

        <div v-if="languageShares.length" class="repo__langs">
          <span class="label label--icon">
            <XIcon name="material-symbols:bar-chart-outline-sharp" class="label__icon" />Breakdown
          </span>

          <XLanguageShare :languages="languageShares" />
        </div>

        <ul v-if="meta.topics.length" class="repo__topics">
          <li v-for="topic in meta.topics" :key="topic" class="repo__topic">
            {{ topic }}
          </li>
        </ul>

        <template v-if="readmeBody">
          <div class="repo__rule" aria-hidden="true" />

          <h2 class="repo__readme-heading label label--icon">
            <!-- <XIcon name="material-symbols:menu-book-outline-sharp" class="label__icon" /> -->
            README
          </h2>

          <div class="prose prose--wide repo__readme">
            <ContentRenderer :value="{ body: readmeBody, title: 'README' }" />
          </div>
        </template>
      </XSheet>
    </XSection>
  </section>
</template>

<style scoped>
.repo__sheet {
  padding: 0;
  overflow: visible;
}

.repo__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
}

.repo__fact {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-4);
  border-left: var(--rule-width) solid var(--c-rule);
}

.repo__fact:nth-child(3n + 1) {
  border-left: none;
}

.repo__fact:nth-child(n + 4) {
  border-top: var(--rule-width) solid var(--c-rule);
}

.repo__value {
  margin: 0;
  font-family: var(--f-display);
  font-size: var(--t-12);
  font-weight: 600;
  color: var(--c-fg);
  /* font-variant-numeric: tabular-nums; */
}

.repo__langs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-4);
  border-top: var(--rule-width) solid var(--c-rule);
}

@media (max-width: 640px) {
  .repo__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .repo__fact:nth-child(3n + 1) {
    border-left: var(--rule-width) solid var(--c-rule);
  }

  .repo__fact:nth-child(2n + 1) {
    border-left: none;
  }

  .repo__fact:nth-child(n + 3) {
    border-top: var(--rule-width) solid var(--c-rule);
  }
}

.repo__topics {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin: 0;
  padding: 0 var(--space-4) var(--space-4);
}

.repo__topic {
  padding: 0.2em 0.55em;
  border: var(--rule-width) solid var(--c-rule);
  font-family: var(--f-label);
  font-size: var(--t-6);
  /* letter-spacing: 0.06em; */
  text-transform: lowercase;
  color: var(--c-dim);
}

.repo__rule {
  height: 0;
  border-top: var(--rule-width) solid var(--c-rule);
}

.repo__readme-heading {
  /* font-family: var(--f-display); */
  /* font-size: var(--t-12); */
  font-weight: 600;
  margin: 0;
  padding: var(--space-6) var(--space-4) 0;
}

.repo__readme {
  padding: var(--space-4);
}
</style>
