<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "default" | "strong" | "accent";
    icon?: string;
  }>(),
  { variant: "default" },
);
</script>

<template>
  <span
    class="label"
    :class="[variant === 'accent' ? 'label--accent' : `label--${variant}`, icon && 'label--icon']"
  >
    <!-- <XIcon v-if="icon" :name="icon" class="label__icon" /> -->
    <slot />
  </span>
</template>
