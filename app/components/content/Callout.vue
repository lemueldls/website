<script setup lang="ts">
const props = withDefaults(defineProps<{ color?: string; icon?: string }>(), {
  color: "accent",
});

const tone = computed(() => {
  switch (props.color) {
    case "info":
      return "callout--info";
    case "warning":
      return "callout--warning";
    default:
      return "callout--accent";
  }
});
</script>

<template>
  <aside class="callout" :class="tone">
    <XIcon v-if="icon" :name="icon" class="callout__icon" size="xs" />
    <div class="callout__body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.callout {
  display: flex;
  gap: 0.75em;
  margin-block: 1.75em;
  padding: var(--space-3) var(--space-4);
  background: var(--c-code);
  border: var(--rule-width) solid var(--c-rule);
  border-left: 2px solid var(--c-accent);
  font-size: var(--t-10);
}

.callout--info {
  border-left-color: var(--c-info);
}
.callout--warning {
  border-left-color: var(--c-warning);
}

.callout__icon {
  flex-shrink: 0;
  margin-top: 0.25em;
  color: var(--c-dimmer);
}

.callout__body > * + * {
  margin-top: 0.75em;
}
</style>
