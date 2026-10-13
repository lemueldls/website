<script setup lang="ts">
const route = useRoute();
const slug = String(route.params.slug);

const { projects, socials } = useAbout();

const entry = computed(() => projects.value.find((p) => p.slug === slug));

const repoName = computed(() => {
  const href = entry.value?.github?.href ?? "";
  return href.replace(/\/+$/, "").split("/").pop() ?? null;
});

const { data: page } = await useAsyncData(`project-${slug}`, () =>
  queryCollection("projects").path(`/projects/${slug}`).first(),
);

if (!entry.value) {
  throw createError({ statusCode: 404, statusMessage: `No project named ${slug}` });
}

useSeoMeta({
  title: `${entry.value!.name} // Projects`,
  description: entry.value!.description,
});

defineOgImage(
  "Root",
  {
    label: entry.value!.role,
    title: entry.value!.name,
    description: entry.value!.description,
    meta: `from ${entry.value!.from} to ${entry.value!.to ?? "present"}`,
  },
  { alt: `${entry.value!.name} // ${entry.value!.role}` },
);

const neighbours = computed(() => {
  const p = projects.value;
  const index = p.findIndex((p) => p.slug === slug);
  return {
    prev: p[(index - 1 + p.length) % p.length],
    next: p[(index + 1) % p.length],
  };
});
</script>

<template>
  <article v-if="entry" class="detail sheet-grid">
    <header class="detail__head">
      <p class="label label--accent">{{ entry.role }}</p>

      <h1 class="detail__title">{{ entry.name }}</h1>

      <p class="detail__dates meta">{{ entry.from }}&ndash;{{ entry.to ?? "Present" }}</p>

      <div class="detail__rule" aria-hidden="true" />

      <div class="detail__links">
        <XLink v-if="entry.link" :href="entry.link.href" external>{{ entry.link.text }}</XLink>
        <XLink v-if="entry.github" :href="entry.github.href" external>{{
          entry.github.text
        }}</XLink>
      </div>

      <p class="detail__description">{{ entry.description }}</p>

      <ul class="detail__tech">
        <li v-for="t of entry.technologies" :key="t">{{ t }}</li>
      </ul>
    </header>

    <XRepository v-if="repoName" :repo="repoName" />

    <nav class="detail__nav" aria-label="More projects">
      <XLink v-if="neighbours.prev" :to="`/projects/${neighbours.prev.slug}`">
        <XIcon name="material-symbols:arrow-back-sharp" size="xs" />{{ neighbours.prev.name }}
      </XLink>
      <XLink
        v-if="neighbours.next"
        :to="`/projects/${neighbours.next.slug}`"
        class="detail__nav-next"
      >
        {{ neighbours.next.name }}<XIcon name="material-symbols:arrow-forward-sharp" size="xs" />
      </XLink>
    </nav>
  </article>
</template>

<style scoped>
.detail {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.detail__title {
  font-family: var(--f-display);
  font-size: var(--t-36);
  margin-block: var(--space-3) var(--space-2);
}

.detail__note {
  top: 12rem;
}

.detail__rule {
  margin-block: var(--space-7) var(--space-5);
  border-top: 1px solid var(--c-rule-strong);
  position: relative;
  height: 3px;
}

.detail__rule::after,
.detail__rule::before {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
}

.detail__rule::before {
  top: 2px;
  border-top: 1px solid var(--c-rule);
}

.detail__rule::after {
  top: 5px;
  border-top: 1px solid var(--c-rule-faint);
}

.detail__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-6);
  font-family: var(--f-label);
  font-size: var(--t-8);
}

.detail__description {
  margin-top: var(--space-5);
  font-family: var(--f-display);
  font-size: var(--t-12);
  font-style: italic;
  color: var(--c-dim);
  max-width: var(--measure-text);
}

.detail__tech {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  margin-top: var(--space-5);
  padding: 0;
  font-family: var(--f-label);
  font-size: var(--t-6);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dimmer);
}

.detail__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-4);
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
}

.detail__nav-next {
  margin-left: auto;
}
</style>
