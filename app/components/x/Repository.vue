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
    <XSectionHead label="Repository">
      <template v-if="meta.archived" #tail>
        <span class="meta">archived</span>
      </template>
    </XSectionHead>

    <XSheet class="repo__sheet">
      <dl class="repo__facts">
        <div class="repo__fact">
          <dt class="label">Stars</dt>
          <dd class="repo__value num">{{ meta.stars }}</dd>
        </div>

        <div class="repo__fact">
          <dt class="label">Forks</dt>
          <dd class="repo__value num">{{ meta.forks }}</dd>
        </div>

        <div class="repo__fact">
          <dt class="label">Open issues</dt>
          <dd class="repo__value num">{{ meta.openIssues }}</dd>
        </div>

        <div class="repo__fact">
          <dt class="label">Licence</dt>
          <dd class="repo__value">
            {{ meta.license ?? "None" }}
          </dd>
        </div>

        <div class="repo__fact">
          <dt class="label">Language</dt>
          <dd class="repo__value">{{ meta.language ?? "—" }}</dd>
        </div>

        <div class="repo__fact">
          <dt class="label">Last push</dt>
          <dd class="repo__value num">{{ pushed }}</dd>
        </div>
      </dl>

      <div v-if="languageShares.length" class="repo__langs">
        <span class="label">Breakdown</span>

        <ul class="repo__lang-list">
          <li v-for="lang in languageShares" :key="lang.name" class="repo__lang">
            <span class="repo__lang-name">{{ lang.name }}</span>
            <span class="repo__lang-track" aria-hidden="true">
              <span class="repo__lang-fill" :style="{ inlineSize: `${lang.percent}%` }" />
            </span>
            <span class="repo__lang-percent num">{{ lang.percent.toFixed(1) }}%</span>
          </li>
        </ul>
      </div>

      <ul v-if="meta.topics.length" class="repo__topics">
        <li v-for="topic in meta.topics" :key="topic" class="repo__topic">
          {{ topic }}
        </li>
      </ul>

      <template v-if="readmeBody">
        <div class="repo__rule" aria-hidden="true" />

        <h2 class="repo__readme-heading label">README</h2>

        <div class="prose prose--wide repo__readme">
          <ContentRenderer :value="{ body: readmeBody, title: 'README' }" />
        </div>
      </template>
    </XSheet>
  </section>
</template>

<style scoped>
.repo__sheet {
  padding: 0;
  overflow: hidden;
}

.repo__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  margin: 0;
}

.repo__fact {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-4);
}

.repo__fact + .repo__fact {
  border-left: var(--rule-width) solid var(--c-rule);
}

.repo__value {
  margin: 0;
  font-family: var(--f-display);
  font-size: var(--t-12);
  font-weight: 600;
  color: var(--c-fg);
  font-variant-numeric: tabular-nums;
}

.repo__langs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-4);
  border-top: var(--rule-width) solid var(--c-rule);
}

.repo__lang-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.repo__lang {
  display: grid;
  grid-template-columns: minmax(5rem, 10rem) minmax(0, 1fr) 3.5rem;
  align-items: center;
  gap: 0 var(--space-3);
  font-size: var(--t-9);
}

@media (max-width: 640px) {
  .repo__lang {
    grid-template-columns: minmax(var(--space-10), 7rem) minmax(0, 1fr) 3.25rem;
  }
}

.repo__lang-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--c-dim);
}

.repo__lang-track {
  position: relative;
  height: 2px;
  background: var(--c-rule);
}

.repo__lang-fill {
  position: absolute;
  inset-block: 0;
  left: 0;
  background: var(--c-accent);
}

.repo__lang-percent {
  text-align: right;
  color: var(--c-fg);
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
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dim);
}

.repo__rule {
  height: 0;
  border-top: var(--rule-width) solid var(--c-rule);
}

.repo__readme-heading {
  font-family: var(--f-display);
  font-size: var(--t-12);
  font-weight: 600;
  margin: 0;
  padding: var(--space-6) var(--space-4) 0;
}

.repo__readme {
  padding: var(--space-4);
}
</style>
