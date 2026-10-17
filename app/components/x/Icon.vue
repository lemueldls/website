<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    size?: "xs" | "sm" | "md" | "lg";
  }>(),
  { size: "sm" },
);

const iconName = computed(() => props.name.replace(/^i-/, ""));
</script>

<template>
  <Icon :name="iconName" :class="['xicon', `xicon--${size}`]" aria-hidden="true" />
</template>

<style>
.xicon {
  flex-shrink: 0;
  width: var(--icon-sm);
  height: var(--icon-sm);
}

.xicon--xs {
  width: var(--icon-xs);
  height: var(--icon-xs);
}

.xicon--md {
  width: var(--icon-md);
  height: var(--icon-md);
}

.xicon--lg {
  width: var(--icon-lg);
  height: var(--icon-lg);
}
</style>
