<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = defineProps<{ id?: string }>();
const attrs = useAttrs();

const { headings } = useRuntimeConfig().public.mdc;
const linked = computed(() => {
  const links = headings?.anchorLinks;

  return Boolean(props.id && (links === true || (typeof links === "object" && links?.h4 === true)));
});
</script>

<template>
  <h4 :id="props.id" v-bind="attrs" class="prose-h4">
    <a v-if="linked" :href="`#${props.id}`" class="prose-h4__link">
      <span class="prose-h4__mark" aria-hidden="true">####</span>
      <span class="prose-h4__content"><slot /></span>
    </a>
    <span v-else class="prose-h4__content"><slot /></span>
  </h4>
</template>

<style scoped>
.prose-h4__link {
  text-decoration: none;
}

/* .prose-h4__link:hover .prose-h4__mark {
  color: var(--c-accent);
} */

.prose-h4__link:hover .prose-h4__content {
  text-decoration: underline;
}

.prose-h4__mark {
  font-family: var(--f-label);
  line-height: 1;
  color: var(--c-dimmer);
  margin-inline-end: 0.5rem;
  user-select: none;
}
</style>
