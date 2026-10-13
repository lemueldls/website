export default defineNuxtPlugin((nuxtApp) => {
  const { untouched, applyDaily } = useWallpaper();

  if (import.meta.client) {
    nuxtApp.hook("app:mounted", () => {
      if (untouched.value) applyDaily();
    });
  }
});
