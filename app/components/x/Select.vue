<script setup lang="ts">
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from "reka-ui";

export interface SelectOption {
  label: string;
  value: string | number;
}

const model = defineModel<string | number>();

const props = withDefaults(
  defineProps<{
    label?: string;
    options: SelectOption[];

    placeholder?: string;
    size?: "sm" | "md";
  }>(),
  { size: "md" },
);

const { label, options, placeholder, size } = toRefs(props);

const selectedLabel = computed(
  () => options.value.find((o) => o.value === model.value)?.label ?? "",
);
</script>

<template>
  <div class="xselect">
    <span v-if="label" class="xselect__label">{{ label }}</span>

    <SelectRoot v-model="model">
      <SelectTrigger class="xselect__trigger" :class="size === 'sm' && 'xselect__trigger--sm'">
        <SelectValue class="xselect__value" :placeholder="placeholder ?? 'Select...'">
          {{ selectedLabel }}
        </SelectValue>
        <SelectIcon class="xselect__icon">
          <XIcon name="material-symbols:arrow-drop-down-sharp" size="lg" />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal class="xselect__portal">
        <SelectContent
          class="xselect__content"
          position="popper"
          :side-offset="4"
          position-strategy="fixed"
          update-position-strategy="always"
          :body-lock="false"
        >
          <span class="mark mark--tl" />
          <span class="mark mark--tr" />
          <span class="mark mark--bl" />
          <span class="mark mark--br" />

          <SelectViewport class="xselect__viewport">
            <SelectItem
              v-for="opt in options"
              :key="opt.value"
              :value="opt.value"
              class="xselect__item"
            >
              <span class="xselect__indicator">
                <SelectItemIndicator>
                  <XIcon name="material-symbols:check-sharp" />
                </SelectItemIndicator>
              </span>
              <SelectItemText>{{ opt.label }}</SelectItemText>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<style>
.xselect {
  display: inline-flex;
  flex-direction: column;
  gap: 0.3em;
}

.xselect__label {
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dim);
}

.xselect__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  min-width: 7rem;
  appearance: none;
  background: var(--c-sheet);
  border: var(--rule-width) solid var(--c-rule);
  color: var(--c-fg);
  font-family: var(--f-label);
  font-size: var(--t-9);
  padding: 0.35em 0.5em;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease);
}

.xselect__trigger--sm {
  font-size: var(--t-8);
  padding: 0.3em 0.45em;
}

.xselect__trigger:hover {
  border-color: var(--c-rule-strong);
}

.xselect__trigger[data-state="open"] {
  border-color: var(--c-accent);
}

.xselect__trigger[data-placeholder] {
  color: var(--c-dimmer);
}

.xselect__value {
  flex: 1;
  text-align: left;
  margin-left: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xselect__icon {
  display: inline-flex;
  color: var(--c-dimmer);
  transition: rotate var(--dur-fast) var(--ease);
}

.xselect__trigger[data-state="open"] .xselect__icon {
  rotate: 180deg;
}

.xselect__content {
  margin: var(--space-1) 0;
  z-index: var(--z-command);
  min-width: var(--reka-select-trigger-width);
  max-height: var(--reka-select-content-available-height);
  background: var(--c-sheet);
  border: var(--rule-width) solid var(--c-rule-strong);
  box-shadow: 0 var(--space-2) var(--space-7) color-mix(in srgb, var(--c-bg) 55%, transparent);
  overflow: visible;
}

.xselect__viewport {
  padding: var(--space-1);
}

.xselect__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--f-label);
  font-size: var(--t-9);
  color: var(--c-dim);
  padding: var(--space-2);
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}

.xselect__item[data-highlighted] {
  background: var(--c-sheet-2);
  color: var(--c-fg);
}

.xselect__item[data-state="checked"] {
  color: var(--c-accent);
}

.xselect__indicator {
  display: inline-grid;
  place-items: center;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.xselect__content > .mark {
  --mark-color: var(--c-rule-strong);
}

.xselect__content[data-state="open"] {
  animation: xselect-in var(--dur-fast) var(--ease) both;
}

@keyframes xselect-in {
  from {
    opacity: 0;
    scale: 0.98;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
</style>
