<script setup lang="ts"></script>

<template>
  <XHeader class="no-print-chrome" />

  <main class="ground">
    <slot />
  </main>

  <XFooter class="no-print-chrome" />
</template>

<style scoped>
.ground {
  display: block;
  min-height: calc(100dvh - var(--header-h));
  padding-block: clamp(var(--space-7), 6vw, 5rem);
}
</style>
