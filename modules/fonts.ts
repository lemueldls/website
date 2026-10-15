import { readFileSync } from "node:fs";

import { defineNuxtModule, createResolver } from "nuxt/kit";
import { defineFontProvider } from "unifont";

import type { Font, FontsIndex } from "../shared/assets";

const { resolve } = createResolver(import.meta.url);

const NERD_FONT_PATCH = "Nerd Fonts";

const WEIGHT_NAMES: Record<string, number> = {
  thin: 100,
  hairline: 100,
  "extra-light": 200,
  extralight: 200,
  "ultra-light": 200,
  ultralight: 200,
  light: 300,
  normal: 400,
  regular: 400,
  medium: 500,
  "semi-bold": 600,
  semibold: 600,
  "demi-bold": 600,
  demibold: 600,
  bold: 700,
  "extra-bold": 800,
  extrabold: 800,
  "ultra-bold": 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
};

/** A single weight, or a `min max` range, as inclusive numeric bounds. */
function weightBounds(request: string): [number, number] | undefined {
  const key = request.trim().toLowerCase();

  const named = WEIGHT_NAMES[key];
  if (named !== undefined) return [named, named];

  const values = key
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => WEIGHT_NAMES[token] ?? Number(token));
  if (!values.length || values.some((value) => !Number.isFinite(value))) return undefined;

  return [Math.min(...values), Math.max(...values)];
}

export default defineNuxtModule({
  meta: { name: "x:fonts" },
  setup(_options, nuxt) {
    const metaPath = resolve("../app/assets/fonts.meta.json");

    nuxt.hook("fonts:providers", (providers) => {
      providers.assets = defineFontProvider("assets", async () => {
        let index: FontsIndex = { families: {}, archives: {} };

        try {
          const parsed = JSON.parse(readFileSync(metaPath, "utf-8")) as FontsIndex;
          index = { families: parsed.families ?? {}, archives: parsed.archives ?? {} };
        } catch {
          nuxt.options.watch.push(metaPath);
          console.warn(
            "[x:fonts] app/assets/fonts.meta.json not found // it is a vendored artifact, " +
              "refresh it with `pnpm fetch:meta` (it is generated in lemueldls/assets).",
          );
          return {
            async resolveFont() {
              return undefined;
            },
          };
        }

        return {
          async resolveFont(fontFamily, options) {
            const faces: Font[] | undefined = index.families[fontFamily];
            if (!faces) return undefined;

            const patch = faces.find((face) => face.patch !== NERD_FONT_PATCH)?.patch;

            const bounds = options.weights.map(weightBounds);
            const wanted = faces.filter((face) => {
              if (face.patch !== patch) return false;
              if (options.styles.length && !options.styles.includes(face.style ?? "normal"))
                return false;
              if (bounds.length && bounds.every(Boolean)) {
                if (!bounds.some((b) => face.weight >= b![0] && face.weight <= b![1])) return false;
              }
              return true;
            });

            return wanted.length ? { fonts: wanted } : undefined;
          },
        };
      });
    });
  },
});
