<script setup lang="ts">
withDefaults(
  defineProps<{
    open?: boolean;

    flush?: boolean;
    tight?: boolean;
  }>(),
  { open: false, flush: false, tight: false },
);
</script>

<template>
  <div :class="['sheet', open && 'sheet--open', $attrs.class]">
    <span class="mark mark--tl" />
    <span class="mark mark--tr" />
    <span class="mark mark--bl" />
    <span class="mark mark--br" />

    <div :class="['sheet__body', flush && 'sheet__body--flush', tight && 'sheet__body--tight']">
      <slot />
    </div>
  </div>
</template>

<style>
.sheet {
  position: relative;

  background: color-mix(in srgb, var(--c-sheet) 94%, transparent);
  border: var(--rule-width) solid var(--c-rule);
}

.sheet--open {
  background: transparent;
  border: none;
}

.sheet__body {
  padding: var(--space-6);
}

.sheet__body--tight {
  padding: var(--space-3);
}

.sheet__body--flush {
  padding: 0;
}

@media (max-width: 640px) {
  .sheet__body {
    padding: var(--space-4);
  }
}

.sheet:hover > .mark,
.sheet:focus-within > .mark {
  scale: 1.4;
  --mark-color: var(--c-accent);
}
</style>
