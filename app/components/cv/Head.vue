<script setup lang="ts">
defineProps<{
  label: string;
  id?: string;
}>();
</script>

<template>
  <a v-if="id" :href="`#${id}`" class="cv-head">
    <span class="cv-head__label">{{ label }}</span>
    <span class="cv-head__mark no-print" aria-hidden="true">#</span>
  </a>

  <div v-else class="cv-head">
    <span class="cv-head__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.cv-head {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  /* margin-block: var(--space-2) var(--space-1); */
  padding-bottom: var(--space-1);
  font-size: 0.8em;
  font-family: var(--f-display);
  font-weight: 600;
  letter-spacing: 0.02em;
  font-variant: small-caps;
  text-decoration: none;
  color: var(--c-fg);
  border-bottom: var(--rule-width) solid var(--c-rule-strong);
}

.cv-head__label {
  white-space: nowrap;
}

.cv-head__mark {
  margin-left: auto;
  font-family: var(--f-label);
  font-weight: 400;
  font-size: var(--t-8);
  color: var(--c-dimmer);
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease);
}

.cv-head:hover .cv-head__mark,
.cv-head:focus-visible .cv-head__mark {
  opacity: 1;
}

.cv-head:hover .cv-head__label,
.cv-head:focus-visible .cv-head__label {
  text-decoration: underline;
  text-underline-offset: var(--space-1);
}
</style>
