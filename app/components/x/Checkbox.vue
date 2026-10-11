<script setup lang="ts">
const model = defineModel<boolean>();

defineProps<{ label?: string }>();
</script>

<template>
  <label class="check">
    <input v-model="model" type="checkbox" class="check__input" v-bind="$attrs" />
    <span class="check__box" aria-hidden="true" />
    <span v-if="$slots.default || label" class="check__label"
      ><slot>{{ label }}</slot></span
    >
  </label>
</template>

<style scoped>
.check {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
  cursor: pointer;
  font-size: var(--t-9);
}

.check__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}

.check__box {
  position: relative;
  flex-shrink: 0;
  width: 0.85em;
  height: 0.85em;
  translate: 0 0.12em;
  border: var(--rule-width) solid var(--c-rule-strong);
  background: var(--c-sheet);
  transition:
    border-color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease);
}

.check__input:checked + .check__box {
  border-color: var(--c-accent);
  background: var(--c-accent);
}

.check__input:checked + .check__box::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 0.42em;
  height: 0.22em;
  border-left: 1.5px solid var(--c-accent-contrast);
  border-bottom: 1.5px solid var(--c-accent-contrast);
  rotate: -45deg;
  translate: 0 -0.05em;
}

.check__input:focus-visible + .check__box {
  outline: var(--rule-width) solid var(--c-accent);
  outline-offset: 2px;
}

.check:hover .check__box {
  border-color: var(--c-accent);
}

.check__label {
  color: var(--c-dim);
}

.check:hover .check__label {
  color: var(--c-fg);
}
</style>
