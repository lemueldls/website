<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    text: string;
    side?: "top" | "right" | "bottom" | "left";
    disabled?: boolean;
  }>(),
  { side: "bottom", disabled: false },
);
</script>

<template>
  <TooltipRoot :disabled="disabled || !text">
    <TooltipTrigger as-child v-bind="$attrs">
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent class="tooltip" :side="side" :side-offset="6">
        {{ text }}
        <TooltipArrow class="tooltip__arrow" :width="10" :height="5" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<style>
.tooltip {
  background: var(--c-bg);
  border: var(--rule-width) solid var(--c-rule);
  box-shadow: var(--shadow);
  padding: var(--space-2);
  font-size: var(--t-9);
  line-height: 1.2;
  color: var(--c-fg);
}

.tooltip__arrow {
  fill: var(--c-bg);
}
</style>
