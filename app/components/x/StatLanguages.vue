<script setup lang="ts">
import type { TopLanguage } from "#shared/github";

defineProps<{
  languages: TopLanguage[];
}>();
</script>

<template>
  <ul class="langs">
    <li v-for="lang in languages" :key="lang.name" class="lang">
      <span class="lang__name">{{ lang.name }}</span>

      <span class="lang__track" aria-hidden="true">
        <span class="lang__fill" :style="{ inlineSize: `${lang.percent}%` }" />
      </span>

      <span class="lang__percent num">{{ lang.percent.toFixed(1) }}%</span>
    </li>
  </ul>
</template>

<style scoped>
.langs {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lang {
  display: grid;
  grid-template-columns: minmax(5rem, 9rem) minmax(0, 1fr) 3.5rem;
  align-items: center;
  gap: 0 var(--space-3);
  font-size: var(--t-9);
}

@media (max-width: 640px) {
  .lang {
    grid-template-columns: minmax(var(--space-10), 7rem) minmax(0, 1fr) 3.25rem;
  }
}

.lang__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--c-dim);
}

.lang__track {
  position: relative;
  height: 2px;
  background: var(--c-rule);
}

.lang__fill {
  position: absolute;
  inset-block: 0;
  left: 0;
  background: var(--c-accent);
}

.lang__percent {
  text-align: right;
  color: var(--c-fg);
}
</style>
