<script setup lang="ts">
import { formatCount } from "#shared/github";

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;

    note?: string;
  }>(),
  {},
);

const { label, value, note } = toRefs(props);
</script>

<template>
  <div class="stat">
    <XLabel>{{ label }}</XLabel>

    <strong class="stat__value num">{{ formatCount(value) }}</strong>

    <p v-if="note" class="stat__note meta">{{ note }}</p>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-4) var(--space-4);
  container-type: inline-size;
}

.stat__value {
  font-family: var(--f-display);
  font-size: clamp(var(--t-14), 28cqi, var(--t-36));
  font-weight: var(--f-display-weight);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--c-fg);
  /* font-variant-numeric: tabular-nums; */
}

.stat__note {
  margin: 0;
}

@media (max-width: 640px) {
  .stat .label {
    white-space: normal;
  }
}
</style>
