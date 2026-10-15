<script setup lang="ts">
defineProps<{
  label?: string;
  count?: number | string;
}>();
</script>

<template>
  <div :class="['section-head', $attrs.class]">
    <XFoldMark />

    <span v-if="label" class="section-head__label">{{ label }}</span>
    <span class="section-head__leader" aria-hidden="true" />
    <span v-if="count !== undefined || $slots.tail" class="section-head__tail">
      <span v-if="count !== undefined" class="num">{{ count }}</span>
      <slot name="tail" />
    </span>
  </div>
</template>

<style>
.section-head {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 0.75em;
  padding-block: 0.4em;
}

.section-head__label {
  display: inline-block;
  font-family: var(--f-display);
  font-size: var(--t-11);
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.4;
  font-variant: small-caps;
  color: var(--c-accent);
  white-space: nowrap;
  transition: color var(--dur) var(--ease);
}

.section-head__leader {
  flex: 1;
  min-width: 1em;
  height: 1px;
  align-self: end;
  background-image: radial-gradient(
    circle at center,
    var(--c-rule-strong) 0.5px,
    transparent 0.6px
  );
  background-size: 0.35em 1px;
  background-repeat: repeat-x;
}

.section-head__tail {
  flex-shrink: 0;
  align-self: baseline;

  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
}
</style>
