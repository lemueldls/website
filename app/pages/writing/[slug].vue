<script setup lang="ts">
import { useDateFormatter } from "reka-ui";

const route = useRoute();
const slug = String(route.params.slug);

const { data: post } = await useAsyncData(`writing-${slug}`, () =>
  queryCollection("blog").path(`/blog/${slug}`).first(),
);

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: `No article named ${slug}` });
}

function parsePostDate(value: string): Date | undefined {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

const title = post.value.title;
const description = post.value.description?.replaceAll("\n", " ");
const date = post.value.date ? parsePostDate(post.value.date) : undefined;
const updated = post.value.updated ? parsePostDate(post.value.updated) : undefined;

useSeoMeta({ title, description, ogTitle: title, ogDescription: description });

const { locale } = useI18n();
const dateFormatter = useDateFormatter(locale.value);

const { readingTime } = useReadingTime();

const cardMeta = computed(() =>
  [
    date ? dateFormatter.custom(date, { dateStyle: "long" }) : null,
    `${readingTime(post.value?.body)} min read`,
  ]
    .filter(Boolean)
    .join(" // "),
);

defineOgImage(
  "Root",
  {
    label: "article",
    title,
    description,
    meta: cardMeta,
  },
  { alt: `${title} — an article by Lemuel De Los Santos` },
);
</script>

<template>
  <article class="article sheet-grid">
    <header class="article__head">
      <p class="label label--accent">Article</p>

      <h1 class="article__title">{{ title }}</h1>

      <p v-if="date" class="article__meta meta">
        <span class="num">
          {{ dateFormatter.custom(date, { dateStyle: "long" }) }}
          <span v-if="updated">
            // updated {{ dateFormatter.custom(updated, { dateStyle: "long" }) }}</span
          >
        </span>
      </p>

      <div class="article__rule" aria-hidden="true" />
    </header>

    <XSheet>
      <div class="prose prose--wide article__body">
        <ContentRenderer v-if="post" :value="post" />

        <XLink to="/writing" class="article__back">
          <XIcon name="material-symbols:arrow-back-sharp" size="xs" />All writing
        </XLink>
      </div>
    </XSheet>
  </article>
</template>

<style scoped>
.article {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.article__title {
  font-family: var(--f-display);
  font-size: var(--t-30);
  margin-block: var(--space-3) var(--space-2);
  max-width: 34ch;
}

.article__note {
  top: 13rem;
}

.article__rule {
  margin-block: var(--space-7) var(--space-5);
  border-top: 1px solid var(--c-rule-strong);
  position: relative;
  height: 3px;
}

.article__rule::after,
.article__rule::before {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
}

.article__rule::before {
  top: 2px;
  border-top: 1px solid var(--c-rule);
}

.article__rule::after {
  top: 5px;
  border-top: 1px solid var(--c-rule-faint);
}

.article__body {
  font-size: var(--t-105);
  line-height: 1.6;
}

.article__back {
  display: inline-block;
  width: 100%;
  margin-top: var(--space-9);
  padding-top: var(--space-5);
  /* border-top: var(--rule-width) solid var(--c-rule); */
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
}

/* .article__body :deep(.katex-display) {
  margin-block: 1.5em;
  padding-block: 1em;
  border-block: var(--rule-width) solid var(--c-rule);
}

.article__body :deep(.katex-display > .katex) {
  text-align: left;
} */

@media (max-width: 640px) {
  .article__title {
    font-size: var(--t-24);
  }
}
</style>
