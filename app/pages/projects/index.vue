<script setup lang="ts">
useSeoMeta({ title: "Projects" });

const { projects } = useAbout();

const allTechnologies = computed(() => {
  const counts: Record<string, number> = {};
  for (const p of projects.value) {
    for (const t of p.technologies) counts[t] = (counts[t] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
});

defineOgImage(
  "Root",
  {
    label: "projects",
    title: "Projects",
    description:
      "Compilers, type systems, synthesis engines, tooling, and the typography to write about them.",
    meta: `${projects.value.length} projects // ${allTechnologies.value.length} technologies`,
  },
  { alt: "Projects // the register of work" },
);

const active = reactive(new Set<string>());
const query = useRouteQuery<string>("t", "");

watchImmediate(query, (value) => {
  active.clear();
  for (const item of String(value).split(",").filter(Boolean)) {
    active.add(decodeURIComponent(item));
  }
});

watch(active, (set) => {
  query.value = Array.from(set)
    .map((t) => encodeURIComponent(t))
    .join(",");
});

const filtered = computed(() =>
  active.size === 0
    ? projects.value
    : projects.value.filter((p) => p.technologies.some((t) => active.has(t))),
);

function toggleTechnology(name: string) {
  if (active.has(name)) active.delete(name);
  else active.add(name);
}
</script>

<template>
  <div class="projects sheet-grid">
    <header class="projects__head">
      <p class="label label--accent">Register</p>
      <h1 class="projects__title">Projects</h1>
    </header>

    <XSectionHead label="Technologies" :count="allTechnologies.length" />

    <ul class="projects__tags">
      <li v-for="t of allTechnologies" :key="t.name">
        <button
          type="button"
          class="tag"
          :class="{ 'tag--active': active.has(t.name) }"
          :aria-pressed="active.has(t.name)"
          @click="toggleTechnology(t.name)"
        >
          {{ t.name }}
          <span class="num tag__count">{{ t.count }}</span>
        </button>
      </li>
    </ul>

    <div class="projects__toolbar">
      <span class="meta">
        <strong class="num">{{ filtered.length }}</strong>
        of <span class="num">{{ projects.length }}</span>
      </span>
      <XButton variant="ghost" size="sm" :disabled="active.size === 0" @click="active.clear()">
        Clear filters
      </XButton>
    </div>

    <ol class="projects__list" data-reveal-group>
      <li v-for="p of filtered" :key="p.slug" class="project">
        <div class="project__spine" aria-hidden="true" />

        <div class="project__body">
          <div class="project__head">
            <h2 class="project__name">
              <XLink :to="`/projects/${p.slug}`">{{ p.name }}</XLink>
            </h2>
            <span class="meta project__dates num">{{ p.from }}&ndash;{{ p.to ?? "Present" }}</span>
          </div>

          <div class="project__meta">
            <span class="project__role">{{ p.role }}</span>
            <XLink v-if="p.link" :href="p.link.href" external class="project__link">
              {{ p.link.text }}
            </XLink>
            <XLink v-if="p.github" :href="p.github.href" external class="project__link">
              {{ p.github.text }}
            </XLink>
          </div>

          <p class="project__description">{{ p.description }}</p>

          <ul class="project__tech">
            <li v-for="t of p.technologies" :key="t">{{ t }}</li>
          </ul>

          <ul class="project__bullets">
            <li v-for="(c, i) of p.contributions" :key="i">{{ c }}</li>
          </ul>
        </div>
      </li>
    </ol>

    <XGithubStats />
  </div>
</template>

<style scoped>
.projects {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.projects__head {
  max-width: 62ch;
}

.projects__title {
  font-family: var(--f-display);
  font-size: var(--t-36);
  margin-block: var(--space-3) var(--space-4);
}

.projects__lede {
  font-family: var(--f-display);
  font-size: var(--t-14);
  color: var(--c-dim);
  line-height: 1.5;
}

.projects__tags {
  list-style: none;
  padding: 0;
  margin: var(--space-4) 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.25em 0.6em;
  border: var(--rule-width) solid var(--c-rule);
  background: transparent;
  color: var(--c-dim);
  font-family: var(--f-label);
  font-size: var(--t-6);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease);
}

.tag:hover {
  border-color: var(--c-rule-strong);
  color: var(--c-fg);
}

.tag--active {
  border-color: var(--c-accent);
  background: var(--c-accent);
  color: var(--c-accent-contrast);
}

.tag__count {
  opacity: 0.6;
}

.projects__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-bottom: var(--space-2);
  border-bottom: var(--rule-width) solid var(--c-rule-strong);
}

.projects__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.project {
  position: relative;
  display: grid;
  grid-template-columns: var(--space-6) minmax(0, 1fr);
  gap: 0 var(--space-4);
}

.project__spine {
  position: relative;
  border-left: var(--rule-width) solid var(--c-rule);
}

.project__spine::before {
  content: "";
  position: absolute;
  top: var(--space-8);
  left: 0;
  width: 0.45rem;
  height: 0.45rem;
  translate: -50% 0;
  background: var(--c-accent);
}

.project__body {
  padding-block: var(--space-6);
  border-bottom: var(--rule-width) solid var(--c-rule);
}

.project__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-1) var(--space-4);
}

.project__name {
  font-family: var(--f-display);
  font-size: var(--t-18);
  font-weight: 600;
}

.project__dates {
  flex-shrink: 0;
}

.project__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-1) var(--space-4);
  margin-top: var(--space-1);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dimmer);
}

.project__role {
  color: var(--c-accent);
}

.project__description {
  margin-top: var(--space-3);
  max-width: var(--measure-text);
  font-family: var(--f-display);
  font-style: italic;
  color: var(--c-dim);
}

.project__tech {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  margin: var(--space-3) 0 0;
  padding: 0;
  font-family: var(--f-label);
  font-size: var(--t-6);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dimmer);
}

.project__bullets {
  margin: var(--space-3) 0 0;
  padding-left: 1.3em;
  max-width: var(--measure-text);
}

.project__bullets li {
  font-size: var(--t-9);
}

.project__bullets li + li {
  margin-top: var(--space-1);
}
</style>
