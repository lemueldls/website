import { readFileSync } from "node:fs";

import { createResolver } from "nuxt/kit";

const { resolve } = createResolver(import.meta.url);

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
      templateParams: { separator: "·" },
      htmlAttrs: { lang: "en" },
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
      stats: {
        driver: "cloudflare-kv-binding",
        binding: "CACHE",
      },
      views: {
        driver: "cloudflare-kv-binding",
        binding: "CACHE",
      },
    },

    devStorage: {
      stats: { driver: "memory" },
      views: { driver: "memory" },
    },
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
  },

  routeRules: {
    "/p": { redirect: "/projects" },
    "/project": { redirect: "/projects" },

    "/b": { redirect: "/writing" },
    "/blog": { redirect: "/writing" },

    "/f": { redirect: "/fonts" },
    "/font": { redirect: "/fonts" },

    "/w": { redirect: "/wallpapers" },
    "/wall": { redirect: "/wallpapers" },
    "/walls": { redirect: "/wallpapers" },
    "/wallpaper": { redirect: "/wallpapers" },
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
});
