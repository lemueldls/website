<script setup lang="ts">
import type { Language } from "#shared/github";

const props = defineProps<{
  languages: Language[];
}>();

const REST_MIN = 0.5;

const rest = computed(() => {
  const shown = props.languages.reduce((sum, lang) => sum + lang.percent, 0);
  return Math.round((100 - shown) * 10) / 10;
});

const showRest = computed(() => props.languages.length > 0 && rest.value >= REST_MIN);
</script>

<template>
  <div v-if="languages.length" class="share">
    <div class="share__strip" aria-hidden="true">
      <span
        v-for="lang in languages"
        :key="lang.name"
        class="share__seg"
        :style="{ flexGrow: `${lang.percent}` }"
      />

      <span v-if="showRest" class="share__seg share__seg--rest" :style="{ flexGrow: `${rest}` }" />
    </div>

    <ul class="share__rows">
      <li v-for="lang in languages" :key="lang.name" class="share__row">
        <span class="share__name">{{ lang.name }}</span>
        <span class="share__percent num">{{ lang.percent.toFixed(1) }}%</span>
      </li>

      <li v-if="showRest" class="share__row share__row--rest">
        <span class="share__name">other</span>
        <span class="share__percent num">{{ rest.toFixed(1) }}%</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.share {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.share__strip {
  display: flex;
  gap: var(--rule-width);
  height: 2px;
}

.share__seg {
  background: var(--c-accent);
}

.share__seg--rest {
  background: var(--c-rule);
}

.share__rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1p5);
  font-size: var(--t-9);
}

.share__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.share__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--c-dim);
}

.share__percent {
  flex-shrink: 0;
  color: var(--c-fg);
}

.share__row--rest .share__name {
  color: var(--c-dimmer);
}
</style>
