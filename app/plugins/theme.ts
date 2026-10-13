export default defineNuxtPlugin(() => {
  const { resolvedTheme } = useTheme();
  const { accentOverride } = useWallpaper();
  const faviconHref = useFaviconHref();

  watchEffect(() => {
    const dark = resolvedTheme.value === "dark";

    useHead({
      htmlAttrs: {
        "data-theme": dark ? "dark" : "light",
        style: `color-scheme: ${dark ? "dark" : "light"};${accentOverride.value}`,
      },
      link: [
        {
          key: "icon",
          rel: "icon",
          type: "image/svg+xml",
          href: faviconHref.value,
        },
      ],
    });
  });
});
