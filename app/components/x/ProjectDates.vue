<script setup lang="ts">
import { projectDateParts, type Project } from "~/composables/about";

const props = defineProps<{ project: Project }>();

const parts = computed(() => projectDateParts(props.project));
</script>

<template>
  <span class="dates meta">
    <template v-if="parts.kind === 'range'">
      <span class="dates__sep">from </span>
      <span class="dates__value">{{ parts.from }}</span>
      <span class="dates__sep"> to </span>
      <span class="dates__value">{{ parts.to }}</span>
    </template>
    <template v-else-if="parts.kind === 'point'">
      <span class="dates__value">{{ parts.at }}</span>
    </template>
    <template v-else>
      since <span class="dates__value">{{ parts.since }}</span>
      <!-- <template v-if="parts.lastActive">
        <span class="dates__sep"> //</span> last active
        <span class="dates__value">{{ parts.lastActive }}</span>
      </template> -->
    </template>
  </span>
</template>

<style scoped>
.dates {
  font-size: var(--t-9);
  color: var(--c-dim);
  white-space: nowrap;
}

.dates__value {
  font-weight: 600;
  color: var(--c-fg);
}

.dates__sep {
  /* padding-inline: 0.35em; */
  color: var(--c-dimmer);
}
</style>
