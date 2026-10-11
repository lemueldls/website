<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{ error: NuxtError }>();
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />

  <div class="err">
    <XSheet class="err__sheet">
      <XLabel variant="accent">Error {{ error.statusCode }}</XLabel>
      <h1 class="err__title">{{ error.statusMessage || "Not found" }}</h1>
      <p class="err__note">That page does not exist. Try the <XLink to="/">home page</XLink>.</p>
    </XSheet>
  </div>
</template>

<style scoped>
.err {
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: var(--space-7);
}

.err__sheet {
  width: min(90vw, 34rem);
  text-align: center;
}

.err__title {
  font-family: var(--f-display);
  font-size: var(--t-36);
  margin-block: var(--space-3) var(--space-4);
}

.err__note {
  margin-inline: auto;
  color: var(--c-dim);
  font-size: var(--t-10);
}
</style>
