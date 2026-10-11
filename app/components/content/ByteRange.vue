<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    start?: number | string;
    end?: number | string;
    invalid?: boolean;
  }>(),
  { start: 0 },
);

const start = computed(() => Number(props.start) || 0);
const end = computed(() => Number(props.end) || 255);

const value = ref(start.value);
const mode = ref<"valid" | "invalid">(props.invalid ? "invalid" : "valid");

const verdict = computed(() => {
  const inRange = value.value >= start.value && value.value <= end.value;
  return mode.value === "valid" ? inRange : !inRange;
});

const position = computed(() => {
  const span = end.value - start.value;
  if (span <= 0) return 0;
  return ((value.value - start.value) / span) * 100;
});

const slots = useSlots();
const blocks = computed(() => {
  const nodes = (slots.default?.() ?? []).filter(Boolean) as VNode[];

  return { predicate: nodes[0], negation: nodes[1] };
});
</script>

<template>
  <figure class="range">
    <div class="range__track" :class="verdict ? 'range__track--ok' : 'range__track--bad'">
      <span class="range__fill" :style="{ width: `${position}%` }" />
      <span class="range__thumb" :style="{ left: `${position}%` }" />
    </div>

    <div class="range__controls">
      <label class="range__field">
        <span class="range__label"
          >Value <span class="num">{{ value }}</span></span
        >
        <input v-model.number="value" type="range" :min="start" :max="end" step="1" />
      </label>

      <XTabs
        v-model="mode"
        :tabs="[
          { label: 'Predicate', value: 'valid' },
          { label: 'Negation', value: 'invalid' },
        ]"
        class="range__tabs"
      />
    </div>

    <figcaption class="range__caption">
      <span class="num range__verdict">
        {{ value }} {{ verdict ? "satisfies" : "violates" }}
        {{ mode === "valid" ? start + " ≤ v ≤ " + end : "v < " + start + " or v > " + end }}
      </span>
    </figcaption>

    <div class="range__blocks">
      <component :is="blocks.predicate" v-if="blocks.predicate" />
      <component :is="blocks.negation" v-if="blocks.negation" />
    </div>
  </figure>
</template>

<style scoped>
.range {
  margin-block: 1.75em;
  padding: var(--space-4);
  background: var(--c-code);
  border: var(--rule-width) solid var(--c-rule);
}

.range__track {
  position: relative;
  height: var(--space-2);
  background: var(--c-rule);
  margin-block: var(--space-2) var(--space-4);
}

.range__fill {
  position: absolute;
  inset-block: 0;
  left: 0;
  background: var(--c-accent);
}

.range__track--bad .range__fill {
  background: var(--c-error);
}

.range__thumb {
  position: absolute;
  top: 50%;
  width: var(--space-2);
  height: var(--space-2);
  translate: -50% -50%;
  background: var(--c-fg);
  border: 1px solid var(--c-bg);
}

.range__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-5);
}

.range__field {
  flex: 1 1 14rem;
  display: flex;
  flex-direction: column;
  gap: 0.35em;
}

.range__label {
  display: flex;
  justify-content: space-between;
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dim);
}

.range__field input[type="range"] {
  accent-color: var(--c-accent);
  width: 100%;
}

.range__tabs {
  flex: 1 1 16rem;
}

.range__caption {
  margin-top: var(--space-3);
  font-family: var(--f-label);
  font-size: var(--t-8);
  color: var(--c-dimmer);
}

.range__verdict {
  color: var(--c-fg);
}

.range__blocks {
  margin-top: var(--space-3);
  font-size: var(--t-9);
  color: var(--c-dim);
}
</style>
