import { defineCollection, defineContentConfig } from "@nuxt/content";
import { z } from "zod/v4";

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: "page",
      source: "blog/*.md",
      schema: z.object({
        draft: z.optional(z.boolean()),
        date: z.optional(z.string()),
        updated: z.optional(z.string()),
        description: z.optional(z.string()),
        excerpt: z.object({
          type: z.string(),
          children: z.any(),
        }),
      }),
    }),

    projects: defineCollection({
      type: "page",
      source: "projects/*.md",
      schema: z.object({
        name: z.string(),
        role: z.string(),
        date: z.string(),
        endDate: z.optional(z.string()),
        description: z.string(),
        technologies: z.array(z.string()).default([]),
        github: z.optional(z.string()),
        link: z.optional(z.string()),
      }),
    }),
  },
});
