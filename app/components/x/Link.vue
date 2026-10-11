<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string;
    href?: string;

    external?: boolean;
  }>(),
  { external: false },
);
</script>

<template>
  <NuxtLink v-if="to" :to class="xlink">
    <slot />
    <XIcon
      v-if="external"
      name="material-symbols:arrow-outward-sharp"
      size="xs"
      class="xlink__icon"
    />
  </NuxtLink>
  <a v-else :href class="xlink">
    <slot />
    <XIcon
      v-if="external"
      name="material-symbols:arrow-outward-sharp"
      size="xs"
      class="xlink__icon"
    />
  </a>
</template>

<style>
.xlink {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25em;
  color: var(--c-fg);
  text-decoration: none;
  border-bottom: var(--rule-width) solid var(--c-rule);
  transition:
    border-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}

.xlink:hover {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
}

.xlink__icon {
  flex-shrink: 0;
  color: var(--c-dimmer);
  translate: 0 0.05em;
  transition: color var(--dur-fast) var(--ease);
}

.xlink:hover .xlink__icon {
  color: var(--c-accent);
}
</style>
