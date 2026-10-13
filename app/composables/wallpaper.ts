import { createSharedComposable } from "@vueuse/core";

import { hashString } from "../lib/rand";

import wallsMeta from "~/assets/walls.meta.json";

import { wallpaperThumbUrl, type WallpaperVariant, type WallpaperMeta } from "#shared/assets";

export type { WallpaperVariant };

const BACKGROUND_WIDTH = 1920;

export const wallpapers = wallsMeta as Record<string, WallpaperMeta>;

export const wallpaperFiles = Object.keys(wallpapers);

export const variants: WallpaperVariant[] = ["base", "light", "dark"];

const wallpaperTally = wallpaperFiles
  .flatMap((file) => wallpapers[file]!.tags)
  .reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});

export const sortedWallpaperTags = Object.entries(wallpaperTally)
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);

type RGB = [number, number, number];

function parseHex(hex: string): RGB {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(rgb: RGB): string {
  return (
    "#" +
    rgb
      .map((c) =>
        Math.round(Math.min(255, Math.max(0, c)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function relativeLuminance(hex: string): number {
  const lin = parseHex(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as RGB;
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function shiftTowards(hex: string, amount: number, towards: "white" | "black"): string {
  return toHex(
    parseHex(hex).map((c) =>
      towards === "white" ? c + (255 - c) * amount : c * (1 - amount),
    ) as RGB,
  );
}

export function clampAccent(accent: string, ground: string, min = 4.5): string {
  if (contrastRatio(accent, ground) >= min) return accent;

  const towards = relativeLuminance(ground) < 0.5 ? "white" : "black";
  let closest = accent;
  let bestRatio = contrastRatio(accent, ground);

  for (let step = 1; step <= 24; step++) {
    const candidate = shiftTowards(accent, step / 24, towards);
    const ratio = contrastRatio(candidate, ground);
    if (ratio >= min) return candidate;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      closest = candidate;
    }
  }

  return closest;
}

interface WallpaperState {
  selected: ComputedRef<string | null>;

  meta: ComputedRef<WallpaperMeta | null | undefined>;
  src: ComputedRef<string>;

  files: ComputedRef<string[]>;
  backgroundStyle: ComputedRef<{ backgroundImage: string; opacity: string }>;
  accentOverride: ComputedRef<string>;
  setWallpaper: (file: string | null) => void;
  randomWallpaper: () => string | null;

  dailyWallpaper: () => string | null;

  applyDaily: () => string | null;

  untouched: ComputedRef<boolean>;
}

const useSharedWallpaper = createSharedComposable(() => {
  const { resolvedTheme } = useTheme();

  const NONE = "";

  const wallpaperCookie = useCookie<string>("x-wallpaper", {
    default: () => NONE,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });

  const selected = computed<string | null>(() => {
    const file = wallpaperCookie.value;
    return file && file in wallpapers ? file : null;
  });

  const untouched = computed(() => wallpaperCookie.value === NONE);

  const meta = computed(() => (selected.value ? wallpapers[selected.value] : null));

  const src = computed(() =>
    selected.value ? wallpaperThumbUrl(selected.value, "base", BACKGROUND_WIDTH) : "",
  );

  const backgroundStyle = computed(() => ({
    backgroundImage: src.value ? `url(${src.value})` : "none",
    opacity: src.value ? "var(--wallpaper-opacity)" : "0",
  }));

  const accentOverride = computed<string>(() => {
    if (!meta.value) return "";

    const accent =
      resolvedTheme.value === "ink"
        ? meta.value.accent
        : (meta.value.accentPaper ?? meta.value.accent);
    return `--c-accent: ${accent};`;
  });

  function setWallpaper(file: string | null) {
    wallpaperCookie.value = file && file in wallpapers ? file : NONE;
  }

  function randomWallpaper(): string | null {
    const file = wallpaperFiles[Math.floor(Math.random() * wallpaperFiles.length)];
    setWallpaper(file ?? null);
    return selected.value;
  }

  function dailyWallpaper(): string | null {
    const day = Math.floor(Date.now() / 86_400_000);
    const file = wallpaperFiles[hashString(`day:${day}`) % wallpaperFiles.length] ?? null;
    setWallpaper(file);
    return file;
  }

  function applyDaily(): string | null {
    if (untouched.value) dailyWallpaper();
    return selected.value;
  }

  return {
    selected,
    meta,
    src,
    files: computed(() => wallpaperFiles),
    backgroundStyle,
    accentOverride,
    setWallpaper,
    randomWallpaper,
    dailyWallpaper,
    applyDaily,
    untouched,
  };
});

export const useWallpaper: () => WallpaperState = useSharedWallpaper;

export const WALLPAPERS_PATH = "/wallpapers";

export function wallpaperPermalink(file: string): string {
  return `${WALLPAPERS_PATH}?i=${encodeURIComponent(file)}`;
}

export function useWallpaperPermalink(): ComputedRef<string> {
  const { selected } = useWallpaper();
  return computed(() => (selected.value ? wallpaperPermalink(selected.value) : WALLPAPERS_PATH));
}
export const useWallpapers = createSharedComposable(() => wallpapers);
export const useWallpaperFiles = createSharedComposable(() => wallpaperFiles);
export const useWallpaperTags = createSharedComposable(() => sortedWallpaperTags);

export function useWallpaperBackground() {
  const { backgroundStyle } = useWallpaper();
  return computed(() => backgroundStyle.value);
}

export type { WallpaperMeta };
