<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "default" | "strong" | "accent";
  }>(),
  { variant: "default" },
);
</script>

<template>
  <span class="label" :class="variant === 'accent' ? 'label--accent' : `label--${variant}`">
    <slot />
  </span>
</template>
