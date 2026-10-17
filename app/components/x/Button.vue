<script setup lang="ts">
import { isExternalHref, newTabAttrs } from "~/lib/links";

const props = withDefaults(
  defineProps<{
    to?: string;
    href?: string;
    type?: "button" | "submit" | "reset";
    variant?: "rule" | "sheet" | "accent" | "ghost";
    size?: "sm" | "md" | "lg";
    icon?: string;
    square?: boolean;
    block?: boolean;
    disabled?: boolean;
    target?: "_blank" | "_self";
  }>(),
  {
    type: "button",
    variant: "rule",
    size: "md",
    square: false,
    block: false,
    disabled: false,
  },
);

const tag = computed(() => {
  if (props.to) return resolveComponent("NuxtLink");
  if (props.href) return "a";
  return "button";
});

const leave = computed(() =>
  newTabAttrs(props.target ? props.target === "_blank" : isExternalHref(props.href)),
);
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    v-bind="leave"
    :class="[
      'xbtn',
      `xbtn--${variant}`,
      `xbtn--${size}`,
      square && 'xbtn--square',
      block && 'xbtn--block',
    ]"
  >
    <span v-if="icon || $slots.leading" class="xbtn__lead">
      <XIcon v-if="icon" :name="icon" :size="size === 'lg' ? 'sm' : 'xs'" />
      <slot name="leading" />
    </span>
    <slot />
    <span v-if="$slots.trailing" class="xbtn__trail"><slot name="trailing" /></span>
  </component>
</template>

<style scoped>
.xbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--f-label);
  font-size: var(--t-8);
  /* letter-spacing: 0.06em; */
  text-transform: lowercase;
  text-decoration: none;
  white-space: nowrap;
  border: var(--rule-width) solid var(--c-rule);
  background: transparent;
  color: var(--c-fg);
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}

.xbtn--sm {
  font-size: var(--t-6);
  /* padding: 0.3em 0.6em; */
  padding: 0.45em 0.9em;
}
.xbtn--md {
  padding: 0.45em 0.9em;
}
.xbtn--lg {
  font-size: var(--t-9);
  padding: 0.6em 1.2em;
}

.xbtn--block {
  display: flex;
  width: 100%;
}

.xbtn--square {
  padding: 0.5em;
  aspect-ratio: 1 / 1;
  gap: 0;
}

.xbtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.xbtn--rule:hover:not(:disabled) {
  border-color: var(--c-rule-strong);
}

.xbtn--sheet {
  background: var(--c-sheet-2);
}
.xbtn--sheet:hover:not(:disabled) {
  border-color: var(--c-rule-strong);
  background: var(--c-sheet);
}

.xbtn--accent {
  border: none;
  background: var(--c-accent);
  color: var(--c-accent-contrast);
}
.xbtn--accent:hover:not(:disabled) {
  filter: brightness(1.1);
}

.xbtn--ghost {
  border-color: transparent;
  color: var(--c-dim);
}
.xbtn--ghost:hover:not(:disabled) {
  border-color: var(--c-rule);
  color: var(--c-fg);
}

.xbtn__lead,
.xbtn__trail {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
