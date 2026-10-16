import type { LocationQuery, LocationQueryRaw } from "vue-router";

import { WALLPAPER_APPLIED_KEY, WALLPAPER_APPLY_KEY, WALLPAPER_NONE } from "#shared/assets";

const APPLY_KEYS = [WALLPAPER_APPLY_KEY, WALLPAPER_APPLIED_KEY] as const;

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const router = useRouter();
  const { setWallpaper } = useWallpaper();

  function command(query: LocationQuery): { file: string | null } | null {
    for (const key of APPLY_KEYS) {
      const raw = query[key];
      if (typeof raw !== "string") continue;

      if (raw === WALLPAPER_NONE) return { file: null };

      const file = resolveWallpaperRef(raw);
      if (file) return { file };
    }

    return null;
  }

  function cleaned(query: LocationQuery): LocationQueryRaw {
    const next = { ...query };
    for (const key of APPLY_KEYS) delete next[key];
    return next;
  }

  router.beforeEach((to) => {
    const present = APPLY_KEYS.some((key) => to.query[key] !== undefined);
    if (!present) return;

    const request = command(to.query);
    if (request) setWallpaper(request.file);

    return { path: to.path, query: cleaned(to.query), hash: to.hash, replace: true };
  });
});
