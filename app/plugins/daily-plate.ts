export default defineNuxtPlugin(() => {
  const { untouched, applyDaily } = useWallpaper();

  if (untouched.value) {
    applyDaily();
  }
});
