<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = defineProps<{ id?: string }>();
const attrs = useAttrs();

const { headings } = useRuntimeConfig().public.mdc;
const linked = computed(() => {
  const links = headings?.anchorLinks;

  return Boolean(props.id && typeof links === "object" && links?.h3);
});
</script>

<template>
  <h3 :id="props.id" v-bind="attrs" class="prose-h3">
    <a v-if="linked" :href="`#${props.id}`" class="prose-h3__link">
      <span class="prose-h3__mark" aria-hidden="true">###</span>
      <span class="prose-h3__content"><slot /></span>
    </a>
    <span v-else class="prose-h3__content"><slot /></span>
  </h3>
</template>

<style scoped>
.prose-h3__link {
  text-decoration: none;
}

/* .prose-h3__link:hover .prose-h3__mark {
  color: var(--c-accent);
} */

.prose-h3__link:hover .prose-h3__content {
  text-decoration: underline;
}

.prose-h3__mark {
  font-family: var(--f-label);
  line-height: 1;
  color: var(--c-dimmer);
  margin-inline-end: 0.5rem;
  user-select: none;
}
</style>
