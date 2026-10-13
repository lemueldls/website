export default defineNuxtPlugin(() => {
  const { resolvedTheme } = useTheme();
  const { accentOverride } = useWallpaper();

  watchEffect(() => {
    const dark = resolvedTheme.value === "dark";

    useHead({
      htmlAttrs: {
        "data-theme": dark ? "dark" : "light",
        style: `color-scheme: ${dark ? "dark" : "light"};${accentOverride.value}`,
      },
    });
  });
});
