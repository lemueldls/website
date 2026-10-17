<script setup lang="ts">
defineProps<{
  label?: string;
  count?: number | string;
  icon?: string;
}>();
</script>

<template>
  <section class="section">
    <XSectionHead :label="label" :count="count" :icon="icon">
      <template v-if="$slots.tail" #tail>
        <slot name="tail" />
      </template>
    </XSectionHead>

    <slot />
  </section>
</template>
