import { createSharedComposable } from "@vueuse/core";
import type { FontArchive } from "#shared/assets";

import fontsIndex from "~/assets/fonts.meta.json";

import type { Font, FontsIndex } from "#shared/assets";

const useSharedAssets = createSharedComposable<
  () => {
    index: FontsIndex;
    fonts: Record<string, Font[]>;
    archives: Record<string, FontArchive[]>;
    faces: Font[];
  }
>(() => {
  const index = fontsIndex as unknown as FontsIndex;
  const fonts = index.families;
  const faces = Object.values(fonts).flat() as Font[];

  return { index, fonts, archives: index.archives, faces };
});

export const useAssets = useSharedAssets;

export function familyFromSlug(fonts: Record<string, Font[]>, slug: string): string | undefined {
  return Object.keys(fonts).find((name) => name.toLowerCase().replace(/\s+/g, "-") === slug);
}

export function slugFromFamily(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}
