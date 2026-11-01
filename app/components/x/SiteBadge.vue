<script setup lang="ts">
const props = defineProps<{
  to?: string;
}>();

const attrs = computed(() => (props.to ? { href: props.to, title: "Badges" } : {}));
</script>

<template>
  <component :is="props.to ? 'a' : 'span'" class="sitebadge" v-bind="attrs">
    <XSigil class="sitebadge__sigil" size="1.375rem" />
    <span class="sitebadge__word">lem.my</span>
    <span class="sitebadge__rule" aria-hidden="true" />
  </component>
</template>

<style scoped>
.sitebadge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  width: 5.5rem;
  height: 1.9375rem;
  flex-shrink: 0;

  background: var(--c-sheet);
  border: var(--rule-width) solid var(--c-rule);
  text-decoration: none;
  transition: border-color var(--dur-fast) var(--ease);
}

.sitebadge:hover,
.sitebadge:focus-visible {
  border-color: var(--c-rule-strong);
}

.sitebadge__sigil {
  color: var(--c-accent);
}

.sitebadge__word {
  font-family: var(--f-label);
  font-size: var(--t-11);
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--c-fg);
  transition: color var(--dur-fast) var(--ease);
}

.sitebadge:hover .sitebadge__word,
.sitebadge:focus-visible .sitebadge__word {
  color: var(--c-accent);
}

.sitebadge__rule {
  position: absolute;
  inset-inline: 0;
  top: 1.4375rem;
  height: 5px;
  background: linear-gradient(
    to bottom,
    var(--c-rule-strong) 0 1px,
    transparent 1px 2px,
    var(--c-rule) 2px 3px,
    transparent 3px 4px,
    var(--c-rule-faint) 4px 5px
  );
}
</style>
