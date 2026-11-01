<script setup lang="ts">
import { isExternalHref, newTabAttrs } from "~/lib/links";

const props = withDefaults(
  defineProps<{
    title: string;
    src: string;
    href?: string;
    note?: string;
    scale: number;
  }>(),
  { scale: 1 },
);

const attrs = computed(() =>
  props.href
    ? { href: props.href, title: props.title, ...newTabAttrs(isExternalHref(props.href)) }
    : {},
);
</script>

<template>
  <component :is="props.href ? 'a' : 'span'" class="badge" v-bind="attrs">
    <span class="badge__frame">
      <span class="mark mark--tl" />
      <span class="mark mark--tr" />
      <span class="mark mark--bl" />
      <span class="mark mark--br" />

      <img
        class="badge__img"
        :src="src"
        :alt="title"
        width="88"
        height="31"
        loading="lazy"
        decoding="async"
      />
    </span>

    <!-- <span v-if="note" class="badge__note">{{ note }}</span> -->
  </component>
</template>

<style scoped>
.badge {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);

  border: none;
  text-decoration: none;
  color: var(--c-fg);
}

.badge__frame {
  position: relative;
  display: block;
  line-height: 0;
}

.badge .mark {
  --mark-size: 7px;
}

.badge__img {
  display: block;
  image-rendering: pixelated;
  opacity: 0.82;
  transition:
    opacity var(--dur-fast) var(--ease),
    filter var(--dur-fast) var(--ease);
  width: calc(88px * v-bind(scale));
  height: calc(31px * v-bind(scale));
}

.badge:hover .badge__img,
.badge:focus-visible .badge__img {
  opacity: 1;
}

.badge:hover .mark,
.badge:focus-visible .mark {
  scale: 1.4;
  --mark-color: var(--c-accent);
}

.badge__note {
  font-family: var(--f-label);
  font-size: var(--t-8);
  line-height: 1.5;
  color: var(--c-dimmer);
  max-width: 7rem;
}
</style>
