<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = defineProps<{ id?: string }>();
const attrs = useAttrs();

const { headings } = useRuntimeConfig().public.mdc;
const linked = computed(() => {
  const links = headings?.anchorLinks;

  return Boolean(props.id && typeof links === "object" && links?.h2);
});
</script>

<template>
  <h2 :id="props.id" v-bind="attrs" class="prose-h2">
    <a v-if="linked" :href="`#${props.id}`" class="prose-h2__link">
      <span class="prose-h2__mark" aria-hidden="true">##</span>
      <span class="prose-h2__content"><slot /></span>
    </a>
    <span v-else class="prose-h2__content"><slot /></span>
  </h2>
</template>

<style scoped>
.prose-h2__link {
  text-decoration: none;
}

/* .prose-h2__link:hover .prose-h2__mark {
  color: var(--c-accent);
} */

.prose-h2__link:hover .prose-h2__content {
  text-decoration: underline;
}

.prose-h2__mark {
  font-family: var(--f-label);
  /* line-height: 1; */
  color: var(--c-dimmer);
  margin-inline-end: 0.5rem;
  user-select: none;
}
</style>
