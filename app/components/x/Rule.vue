<script setup lang="ts">
withDefaults(defineProps<{ variant?: "default" | "strong" | "faint" }>(), {
  variant: "default",
});
</script>

<template>
  <hr :class="['rule', variant !== 'default' ? `rule--${variant}` : '']" />
</template>

<style>
.rule {
  border: 0;
  border-top: var(--rule-width) solid var(--c-rule);
  width: 100%;
}

.rule--strong {
  border-top-color: var(--c-rule-strong);
}

.rule--faint {
  border-top-color: var(--c-rule-faint);
}
</style>
