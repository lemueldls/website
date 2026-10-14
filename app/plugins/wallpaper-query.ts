import { WALLPAPER_APPLIED_KEY, WALLPAPER_APPLY_KEY } from "#shared/assets";

const APPLY_KEYS = [WALLPAPER_APPLY_KEY, WALLPAPER_APPLIED_KEY] as const;

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const router = useRouter();
  const route = useRoute();
  const { setWallpaper } = useWallpaper();

  function requested(): string | null {
    for (const key of APPLY_KEYS) {
      const raw = route.query[key];
      if (typeof raw !== "string") continue;

      const file = resolveWallpaperRef(raw);
      if (file) return file;
    }

    return null;
  }

  function stripApplyKeys() {
    const query = { ...route.query };
    if (!APPLY_KEYS.some((key) => query[key] !== undefined)) return;

    for (const key of APPLY_KEYS) delete query[key];

    router.replace({ query });
  }

  const file = requested();
  if (file) setWallpaper(file);

  onMounted(stripApplyKeys);

  watch(
    () => route.query,
    () => {
      const next = requested();
      if (next) setWallpaper(next);

      stripApplyKeys();
    },
  );
});
