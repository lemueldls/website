<script setup lang="ts">
import { byteLabel, fontArchiveUrl, sampleFor } from "#shared/assets";
import type { FontArchive } from "#shared/assets";
import type { Font } from "#shared/assets";

useSeoMeta({ title: "Fonts" });

const { fonts, archives } = useAssets();

const CUTS: { name: string; use: string | null }[] = [
  { name: "Asterism Text", use: "body text" },
  { name: "Asterism Slim", use: null },
  { name: "Asterism Code", use: "code" },
  { name: "Asterism Term", use: "labels" },
];

const VARIANTS: { name: string; use: string | null }[] = [{ name: "Asterism Ruby", use: null }];

function describe(entry: { name: string; use: string | null }) {
  const faces = fonts[entry.name]!;
  return {
    ...entry,
    faces,
    slug: slugFromFamily(entry.name),
    metrics: faces[0]!.metrics,
    features: faces[0]!.features,
    patches: [...new Set(faces.map((f) => f.patch))],
    weights: [...new Set(faces.map((f) => f.weight))].sort((a, b) => a - b),
    bytes: faces.reduce((sum, f) => sum + f.bytes, 0),
    web: faces.filter((f) => f.format === "woff2").length,
    archives: (archives[entry.name] ?? []) as FontArchive[],
  };
}

const cuts = computed(() => CUTS.filter((cut) => fonts[cut.name]).map(describe));

const variants = computed(() => VARIANTS.filter((v) => fonts[v.name]).map(describe));

const patches = computed(() => {
  const families = [...new Set(cuts.value.map((c) => c.name))];
  const withNerd = families
    .map((name) => {
      const faces = fonts[name]!;
      const base = faces.find((f) => f.patch === "base");
      const nerd = faces.find((f) => f.patch === "Nerd Fonts");
      return base && nerd ? nerd.metrics.glyphs - base.metrics.glyphs : 0;
    })
    .filter((delta) => delta > 0);

  return [
    {
      name: "base",
      note: "The design as drawn: Latin, Greek, Cyrillic, punctuation, and the box-drawing characters a terminal needs.",
      glyphs: null,
    },
    {
      name: "Nerd Fonts",
      note: "The base cut with icon glyphs added // powerline separators, file-type and brand marks. Same outlines, same measure.",
      glyphs: withNerd.length ? Math.max(...withNerd) : null,
    },
    {
      name: "Ruby",
      note: "CJK coverage with pinyin and romaji annotation characters above the line, compiled with rubify. Not published as a web build yet.",
      glyphs: null,
    },
  ];
});

const inventory = computed(() =>
  Object.entries(fonts)
    .flatMap(([name, faces]) => faces.map((face) => ({ face, name, slug: slugFromFamily(name) })))
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        a.face.patch.localeCompare(b.face.patch) ||
        a.face.weight - b.face.weight ||
        (a.face.style ?? "normal").localeCompare(b.face.style ?? "normal"),
    )
    .map((row, i, all) => ({ ...row, first: i === 0 || all[i - 1]!.name !== row.name })),
);

defineOgImage(
  "Root",
  {
    label: "collection",
    title: "Fonts",
    description:
      "Asterism // the type this site is set in. One design, four cuts, the patches on top of them, and the language variant beside them.",
    meta: `${cuts.value.length} cuts // ${inventory.value.length} faces`,
  },
  { alt: "Asterism // the font catalogue" },
);
</script>

<template>
  <div class="fonts sheet-grid">
    <header class="fonts__section fonts__head">
      <XLabel variant="accent">Collection</XLabel>
      <h1 class="fonts__title">Fonts</h1>
    </header>

    <section class="fonts__section">
      <XSectionHead label="Cuts" :count="cuts.length" />

      <ul class="fonts__list" data-reveal-group>
        <li v-for="cut in cuts" :key="cut.name" class="card">
          <NuxtLink :to="`/fonts/${cut.slug}`" class="card__link">
            <div class="card__head">
              <h2 class="card__name" :style="{ fontFamily: `'${cut.name}'` }">
                {{ cut.name }}
              </h2>

              <ul class="card__patches">
                <li v-for="patch in cut.patches" :key="patch" class="card__patch">{{ patch }}</li>
              </ul>
            </div>

            <p
              class="card__sample"
              :style="{ fontFamily: `'${cut.name}'`, fontWeight: cut.weights[0] }"
            >
              {{ sampleFor(cut.faces) }}
            </p>

            <p class="card__meta meta">
              <span class="num">{{ cut.metrics.spacing }}</span> //
              <span class="num">n {{ cut.metrics.measure }}em</span> //
              <span class="num">{{ cut.metrics.glyphs.toLocaleString() }}</span> glyphs //
              <span class="num">{{ cut.faces.length }}</span> faces //
              <span class="num">{{ byteLabel(cut.bytes) }}</span>
            </p>
            <!-- <p class="card__archive">
              <XLink
                v-for="a in cut.archives"
                :key="a.format"
                :href="fontArchiveUrl(cut.name, a)"
                external
              >
                Download {{ a.format }}
                <span class="meta"> // {{ byteLabel(a.bytes) }} // with the licence</span>
              </XLink>
            </p> -->
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section v-if="variants.length" class="fonts__section">
      <XSectionHead label="Language variant" :count="variants.length" />

      <ul class="fonts__list" data-reveal-group>
        <li v-for="variant in variants" :key="variant.name" class="card">
          <NuxtLink :to="`/fonts/${variant.slug}`" class="card__link">
            <div class="card__head">
              <h2 class="card__name" :style="{ fontFamily: `'${variant.name}'` }">
                {{ variant.name }}
              </h2>

              <ul class="card__patches">
                <li v-for="patch in variant.patches" :key="patch" class="card__patch">
                  {{ patch }}
                </li>
              </ul>
            </div>

            <p
              class="card__sample"
              :style="{ fontFamily: `'${variant.name}'`, fontWeight: variant.weights[0] }"
            >
              {{ sampleFor(variant.faces) }}
            </p>

            <p class="card__meta meta">
              <span class="num">{{ variant.metrics.spacing }}</span> //
              <span class="num">n {{ variant.metrics.measure }}em</span> //
              <span class="num">{{ variant.metrics.glyphs.toLocaleString() }}</span> glyphs //
              <span class="num">{{ variant.faces.length }}</span> faces //
              <span class="num">{{ byteLabel(variant.bytes) }}</span>
            </p>
            <!--
              One link per annotation set, because they are two different fonts
              rather than two weights of one.
            -->
            <p class="card__archive">
              <XLink
                v-for="a in variant.archives"
                :key="a.format + a.patch"
                :href="fontArchiveUrl(variant.name, a)"
                external
              >
                Download {{ a.patch.toLowerCase() }} {{ a.format }}
                <span class="meta"> // {{ byteLabel(a.bytes) }} // with the licence</span>
              </XLink>
            </p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- <section class="fonts__section">
      <XSectionHead label="Patches" :count="patches.length" />

      <ul class="patches" data-reveal-group>
        <li v-for="patch in patches" :key="patch.name" class="patch">
          <h3 class="patch__name">{{ patch.name }}</h3>

          <p class="patch__note">{{ patch.note }}</p>

          <p v-if="patch.glyphs" class="patch__meta meta">
            <span class="num">+{{ patch.glyphs.toLocaleString() }}</span> glyphs
          </p>
        </li>
      </ul>
    </section> -->

    <section class="fonts__section">
      <XSectionHead label="Faces" :count="inventory.length" />

      <div class="inventory">
        <table>
          <thead>
            <tr>
              <th>Family</th>
              <th>Patch</th>
              <th>Weight</th>
              <th>Style</th>
              <th>Format</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in inventory"
              :key="`${row.name}-${row.face.patch}-${row.face.weight}-${row.face.style ?? 'normal'}`"
              :class="{ 'inventory__row--group': row.first }"
            >
              <td>
                <NuxtLink
                  :to="{
                    path: `/fonts/${row.slug}`,
                    query: { w: row.face.weight, s: row.face.style ?? 'normal' },
                  }"
                >
                  {{ row.name }}
                </NuxtLink>
              </td>
              <td>{{ row.face.patch }}</td>
              <td class="num">{{ row.face.weight }}</td>
              <td>{{ row.face.style ?? "normal" }}</td>
              <td>{{ row.face.format }}</td>
              <td class="num inventory__file">
                <XLink :href="row.face.src[0]!.url" external>
                  {{ byteLabel(row.face.bytes) }}
                </XLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fonts {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.fonts__head {
  max-width: 80ch;
}

.fonts__title {
  font-family: var(--f-display);
  font-size: var(--t-36);
  margin-block: var(--space-3) var(--space-4);
}

.fonts__lede {
  font-family: var(--f-display);
  font-size: var(--t-14);
  color: var(--c-dim);
  line-height: 1.5;
}

.fonts__lede strong {
  color: var(--c-fg);
  font-weight: 600;
}

.fonts__list {
  list-style: none;
  padding: 0;
  margin: var(--space-5) 0 0;
  display: grid;
  gap: var(--space-4);
}

.card {
  border-bottom: var(--rule-width) solid var(--c-rule);
}

.card__link {
  display: block;
  padding-block: var(--space-6);
  text-decoration: none;
  border: none;
}

.card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-1) var(--space-4);
}

.card__name {
  font-size: var(--t-18);
  font-weight: 600;
  transition: color var(--dur-fast) var(--ease);
}

.card__link:hover .card__name {
  color: var(--c-accent);
}

.card__use {
  flex-shrink: 0;
}

.card__use .num {
  color: var(--c-fg);
}

.card__sample {
  margin-top: var(--space-2);
  font-size: var(--t-12);
  color: var(--c-dim);
  max-width: var(--measure-text);
  text-wrap: pretty;
}

.card__archive {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25em;
  margin-top: var(--space-2);
  font-size: var(--t-8);
}

.card__meta {
  margin-top: var(--space-2);
}

.card__patches {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em 0.75em;
  margin: var(--space-2) 0 0;
  padding: 0;
  font-family: var(--f-label);
  font-size: var(--t-6);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dimmer);
}

.card__patch {
  padding: 0.1em 0.5em;
  border: var(--rule-width) solid var(--c-rule);
}

.patches {
  list-style: none;
  padding: 0;
  margin: var(--space-5) 0 0;
  display: grid;
  gap: var(--space-4);
}

.patch {
  padding-bottom: var(--space-4);
  border-bottom: var(--rule-width) solid var(--c-rule);
}

.patch__name {
  font-family: var(--f-display);
  font-size: var(--t-11);
  font-weight: 600;
  letter-spacing: 0.08em;
  font-variant: small-caps;
  color: var(--c-accent);
}

.patch__note {
  margin-top: var(--space-1);
  font-size: var(--t-9);
  color: var(--c-dim);
  max-width: var(--measure-text);
}

.patch__meta {
  margin-top: var(--space-1);
}

.inventory {
  margin-top: var(--space-4);
  overflow-x: auto;
}

.inventory table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--f-label);
  font-size: var(--t-7);
}

.inventory th {
  text-align: left;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dimmer);
  padding: 0.35em 0.75em 0.35em 0;
  border-bottom: var(--rule-width) solid var(--c-rule-strong);
  white-space: nowrap;
}

.inventory td {
  padding: 0.3em 0.75em;
  border-bottom: var(--rule-width) solid var(--c-rule-faint);
  white-space: nowrap;
}

.inventory__row--group td {
  border-top: var(--rule-width) solid var(--c-rule-strong);
}

.inventory__row--group:first-child td {
  border-top: none;
}

.inventory a {
  text-decoration: none;
  border-bottom: var(--rule-width) solid transparent;
}

.inventory a:hover {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
}
</style>
