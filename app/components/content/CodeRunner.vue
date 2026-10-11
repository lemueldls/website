<script setup lang="ts">
import type { VNode } from "vue";

const props = withDefaults(defineProps<{ compiled?: boolean }>(), { compiled: false });

const slots = useSlots();

const PANEL_GOAL = "goal";
const PANEL_RESULT = "compiled";

function textOf(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "object" && "children" in node) return textOf(node.children);
  return "";
}

const parts = computed<{ goal: VNode[]; result: VNode[] }>(() => {
  const nodes = (slots.default?.() ?? []).filter(Boolean) as VNode[];
  const marker = nodes.findIndex((node) => textOf(node).trim() === "#compiled");

  if (marker === -1) return { goal: nodes, result: [] };

  return { goal: nodes.slice(0, marker), result: nodes.slice(marker + 1) };
});

const panel = ref(props.compiled ? PANEL_RESULT : PANEL_GOAL);
const hasResult = computed(() => parts.value.result.length > 0);
</script>

<template>
  <div v-if="parts.goal.length || hasResult" class="runner">
    <XTabs
      v-if="hasResult"
      v-model="panel"
      :tabs="[
        { label: 'Goal', value: PANEL_GOAL },
        { label: 'Compiled', value: PANEL_RESULT },
      ]"
      class="runner__tabs"
    />

    <div class="runner__panel">
      <template v-for="(node, i) in panel === PANEL_RESULT ? parts.result : parts.goal" :key="i">
        <component :is="node" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.runner {
  margin-block: 1.75em;
}

.runner__tabs {
  margin-bottom: -1px;
}

.runner__panel {
  border: var(--rule-width) solid var(--c-rule);
  background: var(--c-code);
  padding: var(--space-3) var(--space-4);
  overflow-x: auto;
}

.runner__panel :deep(pre) {
  border: none;
  background: none;
  margin: 0;
  padding: 0;
}

.runner__panel :deep(code) {
  background: none;
  padding: 0;
}
</style>
