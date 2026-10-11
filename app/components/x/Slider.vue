<script setup lang="ts">
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from "reka-ui";

const model = defineModel<number>({ required: true });

const props = withDefaults(
  defineProps<{
    label?: string;
    min?: number;
    max?: number;
    step?: number;

    display?: string;
  }>(),
  { min: 0, max: 100, step: 1 },
);

const { label, min, max, step, display } = toRefs(props);

const unitId = useId();

const thumb = computed(() => [model.value]);
const onChange = (value: number[] | undefined) => {
  if (typeof value?.[0] === "number") model.value = value[0];
};
</script>

<template>
  <div class="slider">
    <span v-if="label" class="slider__label" :for="unitId">
      {{ label }}
      <span v-if="display" class="num slider__display">{{ display }}</span>
    </span>

    <SliderRoot
      :id="unitId"
      :model-value="thumb"
      class="slider__root"
      :min="min"
      :max="max"
      :step="step"
      @update:model-value="onChange"
    >
      <SliderTrack class="slider__track">
        <SliderRange class="slider__range" />
      </SliderTrack>
      <SliderThumb class="slider__thumb" />
    </SliderRoot>
  </div>
</template>

<style scoped>
.slider {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
}

.slider__label {
  display: flex;
  justify-content: space-between;
  gap: 0.75em;
  font-family: var(--f-label);
  font-size: var(--t-8);
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dim);
}

.slider__display {
  color: var(--c-fg);
}

.slider__root {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--space-4);
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.slider__track {
  position: relative;
  flex-grow: 1;
  height: 1px;
  background: var(--c-rule);
  transition: background-color var(--dur-fast) var(--ease);
}

.slider__root:hover .slider__track {
  background: var(--c-rule-strong);
}

.slider__range {
  position: absolute;
  height: 100%;
  background: var(--c-accent);
}

.slider__thumb {
  display: block;
  width: 0.55rem;
  height: 0.55rem;
  background: var(--c-accent);
  border: none;
  cursor: grab;
  transition:
    scale var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease);
}

.slider__thumb:hover {
  scale: 1.2;
}

.slider__thumb:active {
  cursor: grabbing;
  scale: 1.1;
}

.slider__thumb:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 1px var(--c-bg),
    0 0 0 2px var(--c-fg);
}
</style>
