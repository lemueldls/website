<script setup lang="ts">
const { data: posts } = await useAsyncData("writing-posts", () =>
  queryCollection("blog").order("date", "DESC").all(),
);

const sorted = computed(() =>
  (posts.value ?? [])
    .filter((p) => !p.draft)
    .sort((a, b) => String(b.date).localeCompare(String(a.date))),
);

const slugOf = (post: { path: string }) => post.path.replace(/^\/blog\/?/, "");

const { readingTime } = useReadingTime();

useSeoMeta({ title: "Writing" });

defineOgImage(
  "Root",
  {
    label: "blog",
    title: "Writing",
    description: "Long-form pieces on compilers, type systems, and the tools built around them.",
    meta: `${sorted.value.length} articles`,
  },
  { alt: "Writing // every article on the site" },
);
</script>

<template>
  <div class="writing sheet-grid">
    <header class="writing__head" data-reveal-group>
      <XLabel variant="accent">blog</XLabel>
      <h1 class="writing__title">Writing</h1>

      <div class="writing__rule" aria-hidden="true" />
    </header>

    <XSectionHead label="Articles" :count="sorted.length" />

    <ol class="writing__list" data-reveal-group>
      <li v-for="post in sorted" :key="post.path" class="entry">
        <NuxtLink :to="`/writing/${slugOf(post)}`" class="entry__link">
          <div class="entry__meta">
            <span class="meta entry__date num">{{ post.date }}</span>
            <span class="meta entry__dot" aria-hidden="true">//</span>
            <span class="meta entry__time num">{{ readingTime(post.body) }} min read</span>
          </div>

          <h2 class="entry__title">{{ post.title }}</h2>

          <p v-if="post.description" class="entry__description">{{ post.description }}</p>

          <span class="entry__more">
            Read
            <XIcon name="material-symbols:arrow-forward-sharp" size="xs" />
          </span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.writing {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.writing__title {
  font-family: var(--f-display);
  font-size: var(--t-36);
  margin-block: var(--space-3) var(--space-4);
}

.writing__lede {
  font-family: var(--f-display);
  font-size: var(--t-14);
  color: var(--c-dim);
  max-width: 52ch;
  line-height: 1.55;
}

.writing__rule {
  margin-block: var(--space-7) var(--space-5);
  border-top: 1px solid var(--c-rule-strong);
  position: relative;
  height: 3px;
}

.writing__rule::after,
.writing__rule::before {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
}

.writing__rule::before {
  top: 2px;
  border-top: 1px solid var(--c-rule);
}

.writing__rule::after {
  top: 5px;
  border-top: 1px solid var(--c-rule-faint);
}

.writing__list {
  list-style: none;
  padding: 0;
  margin: var(--space-6) 0 0;
}

.entry {
  border-bottom: var(--rule-width) solid var(--c-rule);
}

.entry__link {
  display: block;
  padding: var(--space-7);
  text-decoration: none;
  border: none;
  transition: background-color var(--dur-fast) var(--ease);
}

.entry__link:hover {
  background: var(--c-sheet-2);
}

.entry__meta {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
  letter-spacing: 0.06em;
}

.entry__dot {
  color: var(--c-rule-strong);
}

.entry__title {
  font-family: var(--f-display);
  font-size: var(--t-18);
  margin-top: var(--space-2);
  /* max-width: var(--measure-narrow); */
  text-wrap: pretty;
  transition: color var(--dur-fast) var(--ease);
}

.entry__link:hover .entry__title {
  color: var(--c-accent);
}

.entry__description {
  margin-top: var(--space-3);
  font-size: var(--t-10);
  color: var(--c-dim);
  max-width: var(--measure-text);
  line-height: 1.6;
}

.entry__more {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  margin-top: var(--space-4);
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-accent);
}

.entry__more :deep(svg) {
  transition: translate var(--dur-fast) var(--ease);
}

.entry__link:hover .entry__more :deep(svg) {
  translate: 0.2em 0;
}
</style>
