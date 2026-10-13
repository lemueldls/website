<script setup lang="ts">
useSeoMeta({
  titleTemplate: (title) => (title === "Lemuel De Los Santos" ? title : `${title} // lem.my`),
  themeColor: "#00a896",
  profileFirstName: "Lemuel",
  profileLastName: "De Los Santos",
  profileUsername: "lemueldls",
});

useHead({
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/icon.svg",
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/icon-on-light.svg",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/icon-on-dark.svg",
      media: "(prefers-color-scheme: dark)",
    },
  ],
});

useSchemaOrg([
  definePerson({
    name: "Lemuel De Los Santos",
    description: "Math and Computer Science Research Student",
    url: "https://lem.my",
    sameAs: [
      "https://lem.my",
      "https://lemueldls.dev",
      "https://bsky.app/profile/lem.my",
      "https://www.linkedin.com/in/lemueldls",
      "https://github.com/lemueldls",
    ],
  }),
]);

const { refresh: refreshReveal } = useReveal();

onMounted(refreshReveal);
</script>

<template>
  <NuxtRouteAnnouncer />

  <XGlyphGround />

  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" @after-enter="refreshReveal" />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity var(--dur) var(--ease),
    translate var(--dur) var(--ease);
}

.page-enter-from {
  opacity: 0;
  translate: 0 var(--space-2);
}

.page-leave-to {
  opacity: 0;
  translate: 0 calc(var(--space-1) * -1);
}
</style>
