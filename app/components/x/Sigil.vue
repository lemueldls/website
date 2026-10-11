<script setup lang="ts">
import { SIGIL_PATH, SIGIL_TRANSFORM, SIGIL_VIEWBOX } from "~/lib/sigil";

withDefaults(
  defineProps<{
    size?: string;

    dim?: boolean;
  }>(),
  { size: "1.15em" },
);
</script>

<template>
  <svg
    class="sigil"
    :class="dim && 'sigil--dim'"
    :viewBox="SIGIL_VIEWBOX"
    :width="size"
    :height="size"
    aria-hidden="true"
    focusable="false"
  >
    <g fill="currentColor">
      <path :d="SIGIL_PATH" :transform="SIGIL_TRANSFORM" />
    </g>
  </svg>
</template>

<style scoped>
.sigil {
  display: block;
  flex-shrink: 0;

  margin-block: auto 0.1em;
}

.sigil--dim {
  color: var(--c-dimmer);
}
</style>
