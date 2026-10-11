<script setup lang="ts">
definePageMeta({
  middleware: [
    (to) => {
      const slug = to.params.slug;
      return navigateTo(slug ? `/writing/${slug}` : "/writing");
    },
  ],
});
</script>

<template>
  <div />
</template>
