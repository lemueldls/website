import { readFileSync } from "node:fs";

import { defineNuxtModule, createResolver } from "nuxt/kit";
import { defineFontProvider } from "unifont";

import type { Font } from "../shared/assets";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtModule({
  meta: { name: "x:fonts" },
  setup(_options, nuxt) {
    const metaPath = resolve("../app/assets/fonts.meta.json");

    nuxt.hook("fonts:providers", (providers) => {
      providers.assets = defineFontProvider("assets", async () => {
        let families: Record<string, Font[]> = {};

        try {
          families = JSON.parse(readFileSync(metaPath, "utf-8"));
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
          async resolveFont(fontFamily) {
            const fonts = families[fontFamily];

            return fonts ? { fonts } : undefined;
          },
        };
      });
    });
  },
});
