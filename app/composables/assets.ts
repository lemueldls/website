import { createSharedComposable } from "@vueuse/core";

import fontsMeta from "~/assets/fonts.meta.json";

import type { FontsMeta, Font } from "#shared/assets";

const useSharedAssets = createSharedComposable<() => { fonts: FontsMeta; faces: Font[] }>(() => {
  const fonts = fontsMeta as FontsMeta;
  const faces = Object.values(fonts).flat() as Font[];

  return { fonts, faces };
});

export const useAssets = useSharedAssets;

export function familyFromSlug(fonts: FontsMeta, slug: string): string | undefined {
  return Object.keys(fonts).find((name) => name.toLowerCase().replace(/\s+/g, "-") === slug);
}

export function slugFromFamily(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}
