export default defineNuxtPlugin(() => {
  const { resolvedTheme } = useTheme();
  const { accentOverride } = useWallpaper();

  watchEffect(() => {
    const ink = resolvedTheme.value === "ink";

    useHead({
      htmlAttrs: {
        "data-theme": ink ? "ink" : "paper",

        style: `color-scheme: ${ink ? "dark" : "light"};${accentOverride.value}`,
      },
    });
  });
});
