<script setup lang="ts">
import { isExternalHref, newTabAttrs } from "~/lib/links";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ href?: string }>();

const attrs = useAttrs();

const root = computed(() => ({
  ...attrs,
  href: props.href,
  ...newTabAttrs(isExternalHref(props.href)),
}));
</script>

<template>
  <a v-bind="root">
    <slot />
  </a>
</template>
