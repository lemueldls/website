<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from "reka-ui";

const model = defineModel<boolean>();

defineProps<{ label?: string }>();

const uid = useId();
</script>

<template>
  <div class="check">
    <CheckboxRoot :id="uid" v-model="model" v-bind="$attrs" class="check__box">
      <CheckboxIndicator force-mount class="check__tick" aria-hidden="true" />
    </CheckboxRoot>

    <label v-if="$slots.default || label" :for="uid" class="check__label">
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>

<style scoped>
.check {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
  cursor: pointer;
  font-size: var(--t-9);
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

.check__box[data-state="checked"] {
  border-color: var(--c-accent);
  background: var(--c-accent);
}

.check__tick {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 0.5rem;
  height: 0.22rem;
  border-left: 1.5px solid var(--c-accent-contrast);
  border-bottom: 1.5px solid var(--c-accent-contrast);
  rotate: -45deg;
  translate: 0 -0.05rem;
  transition:
    opacity var(--dur-fast) var(--ease),
    scale var(--dur-fast) var(--ease);
}

.check__tick[data-state="unchecked"] {
  opacity: 0;
  scale: 0.5;
}

.check__box:focus-visible {
  outline: var(--rule-width) solid var(--c-accent);
  outline-offset: 2px;
}

.check:hover .check__box:not([data-disabled]) {
  border-color: var(--c-accent);
}

.check__label {
  color: var(--c-dim);
  transition: color var(--dur-fast) var(--ease);
}

.check:hover .check__label {
  color: var(--c-fg);
}

.check__box[data-disabled] {
  border-color: var(--c-rule);
  background: var(--c-sheet-2);
  cursor: not-allowed;
}

.check__box[data-disabled] ~ .check__label {
  color: var(--c-dimmer);
}
</style>
