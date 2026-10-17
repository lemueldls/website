<script setup lang="ts">
withDefaults(
  defineProps<{
    active?: boolean;
    swatch?: string;
  }>(),
  { active: false },
);
</script>

<template>
  <button type="button" class="xchip" :class="{ 'xchip--active': active }" :aria-pressed="active">
    <span v-if="swatch" class="xchip__dot" :style="{ background: swatch }" aria-hidden="true" />
    <slot />
  </button>
</template>

<style>
.xchip {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  padding: 0.25em 0.6em;
  border: var(--rule-width) solid var(--c-rule);
  background: transparent;
  color: var(--c-dim);
  font-family: var(--f-label);
  font-size: var(--t-6);
  /* letter-spacing: 0.06em; */
  text-transform: lowercase;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease);
}

.xchip__dot {
  width: 0.45rem;
  height: 0.45rem;
  flex-shrink: 0;
  border: var(--rule-width) solid var(--c-rule-strong);
}

.xchip:hover {
  border-color: var(--c-rule-strong);
  color: var(--c-fg);
}

.xchip--active {
  border-color: var(--c-accent);
  background: var(--c-accent);
  color: var(--c-accent-contrast);
}
</style>
