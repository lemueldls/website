<script setup lang="ts">
export interface TabItem {
  label: string;
  value: string | number;
  icon?: string;
  count?: number | string;
  disabled?: boolean;
}

const model = defineModel<string | number>();

const props = defineProps<{
  tabs: TabItem[];
  label?: string;
}>();

const { tabs, label: ariaLabel } = toRefs(props);

function onChange(value: unknown) {
  if (typeof value === "string" || typeof value === "number") model.value = value;
}
</script>

<template>
  <TabsRoot
    :model-value="model"
    class="tabs"
    activation-mode="manual"
    @update:model-value="onChange"
  >
    <TabsList class="tabs__list" :aria-label="ariaLabel">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :disabled="tab.disabled"
        class="tabs__trigger"
      >
        <XIcon v-if="tab.icon" :name="tab.icon" class="tabs__icon" size="xs" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.count !== undefined" class="num tabs__count">{{ tab.count }}</span>
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>

<style scoped>
.tabs {
  display: block;
  width: 100%;
}

.tabs__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border-bottom: var(--rule-width) solid var(--c-rule);
  background: transparent;
  padding: 0;
  margin: 0;
}

.tabs__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--c-dimmer);
  cursor: pointer;
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  padding: 0.5em 0.7em;
  margin-bottom: -1px;
  transition:
    color var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease);
}

.tabs__trigger:hover:not([data-disabled]) {
  color: var(--c-fg);
}

.tabs__trigger[data-state="active"] {
  color: var(--c-fg);
  border-bottom-color: var(--c-accent);
}

.tabs__trigger[data-disabled] {
  opacity: 0.35;
  cursor: not-allowed;
}

.tabs__count {
  color: var(--c-dimmer);
}

.tabs__trigger[data-state="active"] .tabs__count {
  color: var(--c-accent);
}
</style>
