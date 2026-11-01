<script setup lang="ts">
defineProps<{
  label: string;
  id: string;
  link?: { href: string; text: string };
  count?: number;
}>();
</script>

<template>
  <a :href="`#${id}`" class="cv-head">
    <span class="cv-head__label">{{ label }}</span>
    <a
      v-if="link"
      class="cv-head__link"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ link.text }}
    </a>
    <span v-if="count && count > 1" class="cv-head__count">[{{ count }}]</span>
  </a>
</template>

<style scoped>
.cv-head {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  /* margin-block: var(--space-2) var(--space-1); */
  /* padding-bottom: var(--space-1); */
  padding-right: var(--space-1);
  font-size: var(--t-9);
  font-family: var(--f-display);
  font-weight: 600;
  /* letter-spacing: 0.02em; */
  text-decoration: none;
  color: var(--c-dim);
  border-bottom: var(--rule-width) solid var(--c-rule-strong);
}

.cv-head__label:hover {
  color: var(--c-fg);
  text-decoration: none !important;
  /* border-color: var(--c-rule); */
}

.cv-head__label {
  flex: 1;
  white-space: nowrap;
  font-variant: small-caps;
}

.cv-head__link {
  font-weight: 400;
  font-size: var(--t-8);
  color: var(--c-dim);
  font-style: italic;
  transition: opacity var(--dur-fast) var(--ease);
  text-decoration: none;
}

.cv-head__count {
  font-weight: 400;
  font-size: var(--t-8);
  color: var(--c-dimmer);
}
</style>
