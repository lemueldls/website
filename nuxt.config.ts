import { readFileSync } from "node:fs";

import { createResolver } from "nuxt/kit";

import { sampleFor } from "./shared/assets";
import type { FontsIndex } from "./shared/assets";
import type { FontStyles } from "unifont";

const { resolve } = createResolver(import.meta.url);

const fontsMeta = JSON.parse(
  readFileSync(new URL("./app/assets/fonts.meta.json", import.meta.url), "utf-8"),
) as FontsIndex;

const SAMPLE_CUTS = [
  // "Asterism Text",
  "Asterism Slim",
  // "Asterism Code",
  // "Asterism Term",
  "Asterism Ruby",
] as const;

const sampleGlyphs = Object.fromEntries(
  SAMPLE_CUTS.flatMap((name) => {
    const faces = fontsMeta.families[name];
    return faces ? [[name, [...new Set(sampleFor(faces) + name)].join("")]] : [];
  }),
);

const sampleStyles: FontStyles[] = ["normal"];

const sampleFontFamilies = SAMPLE_CUTS.map((name) => ({
  name,
  provider: "assets",
  weights: [400],
  styles: sampleStyles,
  glyphs: sampleGlyphs[name],
  global: true,
}));

export default defineNuxtConfig({
  modules: [
    "@nuxt/content",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/seo",
    "@vueuse/nuxt",
    "nuxt-og-image",
    "reka-ui/nuxt",
    "./modules/fonts",
  ],

  compatibilityDate: "2026-10-09",

  app: {
    head: {
      templateParams: { separator: "//" },
      htmlAttrs: { lang: "en" },
      link: [{ key: "icon", rel: "icon", type: "image/svg+xml", href: "/icon.svg" }],
      script: [
        {
          innerHTML:
            "(function(){try{" +
            "var m=document.cookie.match(/(?:^|;\\s*)x-theme=([^;]+)/);" +
            'var p=m?decodeURIComponent(m[1]):"";' +
            'var light=p==="light"||(p!=="dark"&&window.matchMedia("(prefers-color-scheme: light)").matches);' +
            "var e=document.documentElement;" +
            'e.setAttribute("data-theme",light?"light":"dark");' +
            'e.style.colorScheme=light?"light":"dark";' +
            "}catch(_){}})();",
        },
      ],
    },
  },

  css: ["~/assets/css/main.css", "katex/dist/katex.min.css"],

  site: {
    url: "https://lem.my",
    name: "Lemuel De Los Santos",
    description: "Personal website and portfolio.",
    defaultLocale: "en",
    identity: { type: "Person" },
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "catppuccin-mocha",
            dark: "catppuccin-mocha",
            light: "catppuccin-latte",
          },

          langs: [
            JSON.parse(readFileSync(new URL("./app/assets/lmt.json", import.meta.url), "utf-8")),
            JSON.parse(
              readFileSync(new URL("./app/assets/synquid.json", import.meta.url), "utf-8"),
            ),
            "rust",
            "haskell",
            "typst",
          ],
        },
        remarkPlugins: {
          "remark-math": {},
          "remark-smartypants": {},
        },
        rehypePlugins: {
          "rehype-katex": {},
        },
      },
    },
  },

  runtimeConfig: {
    cloudflare: { apiToken: "", accountId: "" },
    github: { token: "" },
    assets: { baseUrl: "https://assets.lemueldls.dev" },
    cvPdfStamp: Date.now().toString(36),
  },

  nitro: {
    preset: "cloudflare-module",
    cloudflare: {
      deployConfig: true,
      wrangler: {
        name: "website",
        compatibility_date: "2026-10-09",
        compatibility_flags: ["nodejs_compat"],
        kv_namespaces: [
          {
            binding: "CACHE",
            id: "2967152ad5cf43efb3e2a324caf7f492",
          },
        ],
        d1_databases: [
          {
            binding: "DB",
            database_name: "website",
            database_id: "967e2689-1c69-48e1-8fa4-e75fc8126bcf",
          },
        ],
        browser: { binding: "BROWSER" },
      },
    },

    storage: {
      cache: {
        driver: "cloudflare-kv-binding",
        binding: "CACHE",
      },
      views: {
        driver: "cloudflare-kv-binding",
        binding: "CACHE",
      },
    },

    devStorage: {
      cache: { driver: "memory" },
      views: { driver: "memory" },
    },
    prerender: {
      routes: ["/"],
      crawlLinks: true,
      ignore: ["/cv.pdf", "/cv"],
    },
  },

  routeRules: {
    "/cv.pdf": { prerender: false },

    "/p/**": { redirect: "/projects/**" },
    "/project/**": { redirect: "/projects/**" },

    "/b/**": { redirect: "/writing/**" },
    "/blog/**": { redirect: "/writing/**" },
    "/l/**": { redirect: "/writing/**" },
    "/log/**": { redirect: "/writing/**" },

    "/f/**": { redirect: "/fonts/**" },
    "/font/**": { redirect: "/fonts/**" },

    "/w/**": { redirect: "/wallpapers/**" },
    "/wall/**": { redirect: "/wallpapers/**" },
    "/walls/**": { redirect: "/wallpapers/**" },
    "/wallpaper/**": { redirect: "/wallpapers/**" },
  },

  fonts: {
    families: [
      {
        name: "Besley",
        provider: "google",
        weights: [400, 600],
        global: true,
      },
      {
        name: "Asterism Text",
        provider: "assets",
        weights: [400, 600],
        global: true,
      },
      {
        name: "Asterism Code",
        provider: "assets",
        weights: [400, 600],
        global: true,
        preload: false,
      },
      {
        name: "Asterism Term",
        provider: "assets",
        weights: [400, 600],
        global: true,
      },
      ...sampleFontFamilies,
    ],
  },

  icon: {
    mode: "svg",
    serverBundle: "local",
    clientBundle: {
      scan: { globInclude: ["**/*.vue", "**/*.md"] },
    },
    customCollections: [
      {
        prefix: "local",
        dir: resolve("./app/assets/icons"),
      },
    ],
  },

  image: {
    domains: ["assets.lemueldls.dev"],
    cloudflare: { baseURL: "https://assets.lemueldls.dev" },
  },

  ogImage: {
    zeroRuntime: false,

    runtimeCacheStorage: {
      driver: "cloudflare-kv-binding",
      binding: "CACHE",
    },

    defaults: {
      width: 1200,
      height: 630,
      extension: "png",
    },
    browser: {
      provider: "cloudflare",
      binding: "BROWSER",
    },
  },

  sitemap: { zeroRuntime: true },

  linkChecker: {
    excludeLinks: [/^\/cv\.pdf(\?|$)/, /^\/fonts\/[\w-]+\?/],
  },

  aiReady: false,
  skewProtection: false,

  nuxtseo: { tips: false },
});
