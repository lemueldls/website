<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 9 });
</script>

<template>
  <span
    class="fold no-print-chrome"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
  />
</template>

<style>
.fold {
  position: absolute;

  top: 0.4em;

  right: calc(min(12px, 3vw) * -1);
  translate: 0 -50%;
  z-index: var(--z-sheet);
  pointer-events: none;
  transition: scale var(--dur) var(--ease-folio);
}

.fold::before,
.fold::after {
  content: "";
  position: absolute;
  background: var(--c-rule-strong);

  /* The color lives on the two rules rather than on `.fold`, so the transition
     has to sit beside it: on the parent it is a transition for a property
     nothing there ever changes, and the accent snaps instead of easing in. */
  transition: background-color var(--dur-fast) var(--ease);
}

.fold::before {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  translate: 0 -50%;
}

.fold::after {
  left: 50%;
  top: 0;
  height: 100%;
  width: 1px;
  translate: -50% 0;
}

.section-head:hover > .fold,
.section-head:focus-within > .fold,
.section:hover .fold,
.section:focus-within .fold {
  scale: 1.5;
}

.section-head:hover > .fold::before,
.section-head:hover > .fold::after,
.section-head:focus-within > .fold::before,
.section-head:focus-within > .fold::after,
.section:hover .fold::before,
.section:hover .fold::after,
.section:focus-within .fold::before,
.section:focus-within .fold::after {
  background: var(--c-accent);
}

@media print {
  .fold {
    display: none;
  }
}
</style>
