<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const language = computed(() => {
  const classes = String(attrs.class ?? "");
  const found = /(?:^|\s)language-([\w+-]+)/.exec(classes);

  return found?.[1] ?? null;
});
</script>

<template>
  <div class="code">
    <span v-if="language" class="code__lang">{{ language }}</span>
    <pre v-bind="attrs"><slot /></pre>
  </div>
</template>

<style scoped>
.code__lang {
  display: block;
  text-align: end;
  font-family: var(--f-label);
  font-size: var(--t-7);
  letter-spacing: 0.06em;
  color: var(--c-dimmer);
  margin-block-end: 0.35em;
  user-select: none;
}

.code > pre {
  margin-top: 0;
}
</style>
