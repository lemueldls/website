<script setup lang="ts">
import {
  wallpaperThumbUrl,
  wallpaperSrcSet,
  wallpaperUrl,
  wallpaperPlaceholder,
  aspect,
  resolutionLabel,
  byteLabel,
  TILE_WIDTHS,
  HERO_WIDTHS,
  HERO_QUALITY,
  VIEW_WIDTHS,
  VIEW_QUALITY,
  type WallpaperVariant,
} from "#shared/assets";

// Plain re-exports rather than the shared composables: they hold static module
// data, so there is nothing to share and no Nuxt instance is involved.
import { wallpapers, wallpaperFiles, sortedWallpaperTags, variants } from "~/composables/wallpaper";

useSeoMeta({ title: "Wallpapers" });

defineOgImage(
  "Root",
  {
    label: "collection",
    title: "Wallpapers",
    description:
      "Every wallpaper published in light and dark, each one able to retint the whole site.",
    meta: `${wallpaperFiles.length} wallpapers`,
  },
  { alt: "Wallpapers // the collection, and the site's accent palette" },
);

const {
  selected,
  setWallpaper,
  randomWallpaper,
  dailyWallpaper,
  meta: currentMeta,
} = useWallpaper();

const { resolvedTheme } = useTheme();

const activeTag = ref<string | null>(null);
const search = ref("");

const route = useRoute();
const router = useRouter();

function syncPermalink() {
  if (!import.meta.client) return;
  if (!selected.value && !route.query.i) return;

  const query = { ...route.query };
  if (selected.value) query.i = selected.value;
  else delete query.i;

  router.replace({ query });
}

onMounted(() => {
  const file = route.query.i;
  if (typeof file === "string" && file in wallpapers) setWallpaper(file);

  syncPermalink();
});

watch(selected, syncPermalink);

const variant = ref<WallpaperVariant>(resolvedTheme.value === "paper" ? "light" : "dark");

const PAGE_SIZE = 24;
const shown = ref(PAGE_SIZE);

const TILE_SIZES =
  "(min-width: 48rem) 16.8rem, (min-width: 30rem) 16rem, (min-width: 22rem) 20rem, 100vw";

const HERO_SIZES = "(min-width: 720px) 20rem, 92vw";

const matches = computed(() => {
  const needle = search.value.trim().toLowerCase();
  return wallpaperFiles
    .filter((file) => (activeTag.value ? wallpapers[file]!.tags.includes(activeTag.value) : true))
    .filter((file) => (needle ? file.toLowerCase().includes(needle) : true))
    .sort((a, b) => a.localeCompare(b));
});

const visible = computed(() => matches.value.slice(0, shown.value));

const remaining = computed(() => matches.value.length - shown.value);

const previewFile = ref<string | null>(null);

watch([activeTag, search, variant], () => {
  shown.value = PAGE_SIZE;
});

const lightboxOpen = ref(false);
const lightboxFile = ref<string | null>(null);
const lightboxVariant = ref<WallpaperVariant>("base");

const lightboxMeta = computed<WallpaperMeta | null>(() =>
  lightboxFile.value ? (wallpapers[lightboxFile.value] ?? null) : null,
);

function openLightbox(file: string) {
  lightboxFile.value = file;
  lightboxVariant.value =
    variant.value === "base" ? (resolvedTheme.value === "paper" ? "light" : "dark") : variant.value;
  lightboxOpen.value = true;
}

function stepLightbox(delta: number) {
  const list = matches.value;
  const index = lightboxFile.value ? list.indexOf(lightboxFile.value) : -1;
  if (index < 0 || list.length === 0) return;
  const next = list[(index + delta + list.length) % list.length];
  if (next) lightboxFile.value = next;
}

function onLightboxApply(apply: boolean) {
  setWallpaper(apply ? lightboxFile.value : null);
}

const ASPECT_MIN = 0.75;
const ASPECT_MAX = 2;

function setTileAccent(el: HTMLElement, file: string) {
  const accent = wallpapers[file]?.accent;
  if (accent) el.style.setProperty("--tile-accent", accent);
}

function frameAspect(file: string): number {
  const meta = wallpapers[file];
  if (!meta) return 16 / 9;
  return Math.min(Math.max(aspect(meta), ASPECT_MIN), ASPECT_MAX);
}

function frameStyle(file: string) {
  const meta = wallpapers[file]!;
  return {
    aspectRatio: `${frameAspect(file)}`,
    background: wallpaperPlaceholder(meta),
  };
}

interface Placement {
  x: number;
  y: number;
}

function pack(
  heights: readonly number[],
  cols: number,
  gap: number,
  colWidth: number,
): { placements: Placement[]; height: number } {
  const column = Array.from<number>({ length: cols }).fill(0);
  const placements: Placement[] = [];

  for (const h of heights) {
    let best = 0;
    let shortest = column[0] ?? 0;
    for (let c = 1; c < cols; c++) {
      const candidate = column[c] ?? 0;
      if (candidate < shortest) {
        best = c;
        shortest = candidate;
      }
    }
    placements.push({ x: best * (colWidth + gap), y: shortest });
    column[best] = shortest + h + gap;
  }

  let height = 0;
  for (const c of column) height = Math.max(height, c);

  return { placements, height: height > 0 ? height - gap : 0 };
}

const gridEl = ref<HTMLElement>();

const appliedImageEl = ref<HTMLImageElement>();

let lastKey = "";

function layoutGrid() {
  const grid = gridEl.value;
  if (!grid) return;

  const style = getComputedStyle(grid);
  const rootPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const rem = (name: string) => {
    const raw = style.getPropertyValue(name).trim();
    return raw.endsWith("rem") ? Number.parseFloat(raw) * rootPx : Number.parseFloat(raw) || 0;
  };

  const cols = Math.max(1, Number(style.getPropertyValue("--masonry-cols")) || 1);
  const gap = rem("--masonry-gap");
  const width = grid.clientWidth;
  if (width <= 0) return;

  const items = Array.from(grid.children) as HTMLElement[];
  const key = `${cols}@${width}@${items.length}`;
  if (key === lastKey) return;
  lastKey = key;

  const colWidth = (width - gap * (cols - 1)) / cols;

  for (const el of items) el.style.width = `${colWidth}px`;

  const heights = items.map((el) => el.offsetHeight);
  const { placements, height } = pack(heights, cols, gap, colWidth);

  for (let i = 0; i < items.length; i++) {
    const p = placements[i];
    if (p) {
      items[i]!.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    }
  }

  grid.style.height = `${height}px`;
  grid.setAttribute("data-packed", "");
}

onMounted(() => {
  layoutGrid();
  if (!("ResizeObserver" in window)) return;
  const ro = new ResizeObserver(() => layoutGrid());
  ro.observe(gridEl.value!);
  onScopeDispose(() => ro.disconnect());
});

watch(visible, () => nextTick(layoutGrid));

const warmed = new Set<string>();

function warm(...urls: (string | undefined)[]) {
  for (const url of urls) {
    if (!url || warmed.has(url)) continue;
    warmed.add(url);
    new Image().src = url;
  }
}

const HOVER_INTENT_MS = 140;

const WARM_WIDTH = VIEW_WIDTHS[0]!;
const WARM_QUALITY = VIEW_QUALITY;

let hoverTimer: number | undefined;

function onTileEnter(file: string, event: Event) {
  previewFile.value = file;
  const el = event.currentTarget as HTMLElement | null;
  if (el) setTileAccent(el, file);

  clearTimeout(hoverTimer);
  hoverTimer = window.setTimeout(() => {
    warm(wallpaperThumbUrl(file, lightboxVariant.value, WARM_WIDTH, { quality: WARM_QUALITY }));
  }, HOVER_INTENT_MS);
}

function onTileLeave() {
  previewFile.value = null;
  clearTimeout(hoverTimer);
}

let variantsWarmed = false;

watch(variant, (next, previous) => {
  if (next === previous) return;
  if (variantsWarmed) return;
  variantsWarmed = true;

  const targets = visible.value.slice(0, PAGE_SIZE);
  const others = variants.filter((name) => name !== next);

  const run = () => {
    for (const file of targets) {
      warm(
        ...others.map((name) =>
          wallpaperThumbUrl(file, name, HERO_WIDTHS[0]!, { quality: HERO_QUALITY }),
        ),
      );
    }
  };

  if (window.requestIdleCallback) window.requestIdleCallback(run);
  else window.setTimeout(run, 200);
});

watch(lightboxFile, (file) => {
  if (!file) return;
  const list = matches.value;
  const index = list.indexOf(file);
  if (index < 0) return;
  for (const delta of [-1, 1]) {
    const neighbour = list[(index + delta + list.length) % list.length];
    if (neighbour) {
      warm(
        wallpaperThumbUrl(neighbour, lightboxVariant.value, WARM_WIDTH, { quality: WARM_QUALITY }),
      );
    }
  }
});

const sentinel = ref<HTMLElement>();

let appending = false;

function loadMore() {
  if (appending || remaining.value <= 0) return;
  appending = true;
  shown.value = Math.min(shown.value + PAGE_SIZE, matches.value.length);
  nextTick(() => {
    appending = false;
  });
}

onMounted(() => {
  const target = sentinel.value;
  if (!target || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    },
    { rootMargin: "0px 0px 800px 0px" },
  );

  io.observe(target);
  onScopeDispose(() => io.disconnect());
});

function markLoaded(event: Event) {
  (event.target as HTMLElement).setAttribute("data-loaded", "");
}

function settle(img: HTMLImageElement | undefined) {
  if (img && img.complete && img.naturalWidth > 0) img.setAttribute("data-loaded", "");
}

function markLoadedComplete() {
  for (const img of gridEl.value?.querySelectorAll<HTMLImageElement>(".tile__image") ?? []) {
    settle(img);
  }

  settle(appliedImageEl.value);
}

const mounted = useMounted();

onMounted(markLoadedComplete);

watch([selected, variant], async () => {
  const img = appliedImageEl.value;
  if (!img) return;

  img.removeAttribute("data-loaded");
  await nextTick();
  settle(img);
});

const heroLink = computed(() => {
  if (!selected.value) return { link: [] };
  return {
    link: [
      {
        rel: "preload" as const,
        as: "image" as const,
        fetchpriority: "high" as const,
        href: wallpaperThumbUrl(selected.value, variant.value, HERO_WIDTHS[1]!, {
          quality: HERO_QUALITY,
        }),
        imagesrcset: wallpaperSrcSet(selected.value, variant.value, HERO_WIDTHS, {
          quality: HERO_QUALITY,
        }),
        imagesizes: HERO_SIZES,
      },
    ],
  };
});

useHead(heroLink);
</script>

<template>
  <div class="gallery sheet-grid">
    <header class="gallery__head" data-reveal-group>
      <XLabel variant="accent">Collection</XLabel>
      <h1 class="gallery__title">Wallpapers</h1>

      <div class="gallery__rule" aria-hidden="true" />
    </header>

    <section v-if="mounted && currentMeta" class="gallery__applied" data-reveal>
      <XSheet class="gallery__applied-sheet">
        <div class="gallery__applied-grid">
          <button
            type="button"
            class="gallery__applied-hit"
            :title="`Inspect ${selected}`"
            @click="openLightbox(selected!)"
          >
            <img
              :src="wallpaperThumbUrl(selected!, 'base', HERO_WIDTHS[0], { quality: HERO_QUALITY })"
              :srcset="wallpaperSrcSet(selected!, 'base', HERO_WIDTHS, { quality: HERO_QUALITY })"
              :sizes="HERO_SIZES"
              :alt="selected!"
              :width="currentMeta.width"
              :height="currentMeta.height"
              class="gallery__applied-image"
              :style="{
                background: wallpaperPlaceholder(currentMeta),
                aspectRatio: `${aspect(currentMeta)}`,
              }"
              ref="appliedImageEl"
              @load="markLoaded"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </button>

          <div class="gallery__applied-body">
            <XLabel variant="accent">Currently applied</XLabel>
            <h2 class="gallery__applied-name">{{ selected }}</h2>
            <p class="meta gallery__applied-meta">
              {{ resolutionLabel(currentMeta) }} &middot; {{ byteLabel(currentMeta.bytes) }}
            </p>

            <div class="gallery__swatches">
              <span
                v-for="colour in currentMeta.palette"
                :key="colour"
                class="gallery__swatch"
                :style="{ background: colour }"
                :title="colour"
              />
            </div>

            <!-- <p class="gallery__applied-note">
              Accent set to <code>{{ currentMeta.accent }}</code
              >, clamped for contrast on both themes.
            </p> -->

            <div class="gallery__applied-actions">
              <XButton :href="wallpaperUrl(selected!, 'base')" variant="sheet" external>
                Download
                <template #trailing>
                  <XIcon name="material-symbols:download-sharp" />
                </template>
              </XButton>
              <XButton variant="ghost" @click="setWallpaper(null)">Remove</XButton>
            </div>
          </div>
        </div>
      </XSheet>
    </section>

    <XSheet class="gallery__controls" data-reveal>
      <div class="gallery__controls-grid">
        <label class="gallery__search">
          <span class="label">Search</span>
          <span class="gallery__search-field">
            <XIcon name="material-symbols:search-sharp" size="lg" />
            <input v-model="search" type="search" placeholder="file name..." />
          </span>
        </label>

        <XSelect
          v-model="variant"
          label="Variant"
          :options="variants.map((name) => ({ label: name, value: name }))"
        />

        <div class="gallery__actions">
          <span class="label">Surprise</span>
          <div class="gallery__action-group">
            <XButton variant="ghost" @click="randomWallpaper()">
              <XIcon name="material-symbols:casino-sharp" />
              Random
            </XButton>
            <XButton variant="ghost" @click="dailyWallpaper()">
              <XIcon name="material-symbols:today-sharp" />
              Today&rsquo;s
            </XButton>
          </div>
        </div>
      </div>

      <ul class="gallery__tags">
        <li>
          <button
            type="button"
            class="chip"
            :class="{ 'chip--active': activeTag === null }"
            @click="activeTag = null"
          >
            All
          </button>
        </li>
        <li v-for="tag in sortedWallpaperTags" :key="tag">
          <button
            type="button"
            class="chip"
            :class="{ 'chip--active': activeTag === tag }"
            @click="activeTag = activeTag === tag ? null : tag"
          >
            {{ tag }}
          </button>
        </li>
      </ul>
    </XSheet>

    <XSectionHead label="Gallery" :count="matches.length">
      <template #tail>
        <span class="meta" aria-live="polite">showing {{ visible.length }}</span>
      </template>
    </XSectionHead>

    <ul ref="gridEl" class="gallery__grid" data-reveal-group>
      <li
        v-for="file in visible"
        :key="file"
        class="tile"
        :class="{
          'tile--selected': selected === file,
          'tile--previewing': previewFile === file,
        }"
        @mouseenter="onTileEnter(file, $event)"
        @mouseleave="onTileLeave()"
        @focusin="onTileEnter(file, $event)"
        @focusout="onTileLeave()"
      >
        <div class="tile__foot">
          <button
            type="button"
            class="tile__hit"
            :title="`Inspect ${file}`"
            @click="openLightbox(file)"
          >
            <span class="tile__frame" :style="frameStyle(file)">
              <img
                :src="wallpaperThumbUrl(file, variant, HERO_WIDTHS[0]!)"
                :srcset="wallpaperSrcSet(file, variant, TILE_WIDTHS)"
                :sizes="TILE_SIZES"
                :alt="file"
                :width="wallpapers[file]!.width"
                :height="wallpapers[file]!.height"
                class="tile__image"
                loading="lazy"
                decoding="async"
                @load="markLoaded"
              />

              <span v-if="selected === file" class="tile__badge">
                <XIcon name="material-symbols:check-sharp" size="sm" />
                In use
              </span>
            </span>
          </button>

          <div class="tile__caption">
            <span class="tile__name" :title="file">{{ file }}</span>

            <XButton
              v-if="selected !== file"
              variant="sheet"
              size="sm"
              :title="`Set ${file} as the site wallpaper`"
              @click="setWallpaper(file)"
            >
              Apply
            </XButton>
            <XButton
              v-else
              variant="ghost"
              size="sm"
              :title="`Stop using ${file}`"
              @click="setWallpaper(null)"
            >
              Remove
            </XButton>
          </div>
        </div>
      </li>
    </ul>

    <p v-if="matches.length === 0" class="gallery__empty meta">Nothing matches that filter.</p>

    <div class="gallery__more">
      <div ref="sentinel" class="gallery__sentinel" aria-hidden="true" />

      <XButton v-if="remaining > 0" variant="rule" @click="loadMore">
        Load {{ Math.min(PAGE_SIZE, remaining) }} more
      </XButton>
      <p v-else-if="matches.length > 0" class="meta">all {{ matches.length }} shown</p>
    </div>

    <XWallpaperLightbox
      v-model:open="lightboxOpen"
      v-model:variant="lightboxVariant"
      :meta="lightboxMeta"
      :applied="lightboxFile !== null && lightboxFile === selected"
      @step="stepLightbox"
      @apply="onLightboxApply"
    />
  </div>
</template>

<style scoped>
.gallery {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.gallery__head {
  position: relative;
}

.gallery__title {
  font-family: var(--f-display);
  font-size: var(--t-36);
  margin-block: var(--space-3) var(--space-4);
  max-width: 62ch;
}

.gallery__lede {
  font-family: var(--f-display);
  font-size: var(--t-14);
  color: var(--c-dim);
  line-height: 1.55;
  max-width: 62ch;
}

.gallery__note {
  top: 15rem;
}

.gallery__rule {
  margin-block: var(--space-7) var(--space-5);
  border-top: 1px solid var(--c-rule-strong);
  position: relative;
  height: 3px;
}

.gallery__rule::after,
.gallery__rule::before {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
}

.gallery__rule::before {
  top: 2px;
  border-top: 1px solid var(--c-rule);
}

.gallery__rule::after {
  top: 5px;
  border-top: 1px solid var(--c-rule-faint);
}

.gallery__applied {
  margin-bottom: var(--space-2);
}

.gallery__applied-grid {
  display: grid;
  grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}

@media (max-width: 720px) {
  .gallery__applied-grid {
    grid-template-columns: 1fr;
  }
}

.gallery__applied-hit {
  display: block;
  appearance: none;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  cursor: zoom-in;
  min-width: 0;
}

.gallery__applied-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  background: var(--c-code);
  border: var(--rule-width) solid var(--c-rule);
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
}

.gallery__applied-image[data-loaded] {
  opacity: 1;
}

.gallery__applied-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-3) var(--space-3) 0;
}

@media (max-width: 720px) {
  .gallery__applied-body {
    padding: var(--space-1) var(--space-3) var(--space-3);
  }
}

.gallery__applied-name {
  font-family: var(--f-label);
  font-size: var(--t-14);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.gallery__applied-meta {
  margin-bottom: var(--space-1);
}

.gallery__applied-note {
  font-size: var(--t-9);
  color: var(--c-dim);
  max-width: var(--measure-narrow);
}

.gallery__applied-note code {
  font-size: 0.9em;
}

.gallery__applied-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.gallery__swatches {
  display: flex;
  height: var(--space-6);
  border: var(--rule-width) solid var(--c-rule);
}

.gallery__swatch {
  flex: 1;
  min-width: 0;
}

.gallery__controls-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-4) var(--space-7);
}

.gallery__search {
  flex: 1 1 16rem;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}

.gallery__search-field {
  display: flex;
  align-items: center;
  gap: 0.45em;
  background: var(--c-sheet-2);
  border: var(--rule-width) solid var(--c-rule);
  padding: 0.3em 0.8em;
}

.gallery__search-field:focus-within {
  border-color: var(--c-accent);
}

.gallery__search-field :deep(svg) {
  width: 0.95em;
  height: 0.95em;
  flex-shrink: 0;
  color: var(--c-dimmer);
}

.gallery__search-field input {
  appearance: none;
  background: none;
  border: none;
  outline: none;
  color: var(--c-fg);
  font-family: var(--f-label);
  font-size: var(--t-9);
  min-width: 10rem;
  width: 100%;
}

.gallery__controls-grid {
  --control-h: 2.4rem;
}

/* .gallery__controls-grid :deep(.xselect__trigger),
.gallery__search-field,
.gallery__action-group {
  min-height: var(--control-h);
} */

.gallery__actions {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  flex: 0 0 auto;
}

.gallery__action-group {
  display: flex;
  align-items: stretch;
  border: var(--rule-width) solid var(--c-rule);
  background: var(--c-sheet-2);
}

.gallery__action-group :deep(.xbtn) {
  border-color: transparent;
  background: transparent;
}

.gallery__action-group :deep(.xbtn + .xbtn) {
  border-inline-start: var(--rule-width) solid var(--c-rule);
}

.gallery__action-group :deep(.xbtn:hover:not(:disabled)) {
  border-color: transparent;
  background: var(--c-sheet);
  color: var(--c-fg);
}

@media (max-width: 640px) {
  .gallery__actions {
    flex: 1 1 100%;
  }

  .gallery__action-group {
    width: 100%;
  }

  .gallery__action-group :deep(.xbtn) {
    flex: 1;
  }
}

.gallery__tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin: var(--space-4) 0 0;
  padding: 0;
}

.chip {
  padding: 0.25em 0.6em;
  border: var(--rule-width) solid var(--c-rule);
  background: transparent;
  color: var(--c-dim);
  font-family: var(--f-label);
  font-size: var(--t-6);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease);
}

.chip:hover {
  border-color: var(--c-rule-strong);
  color: var(--c-fg);
}

.chip--active {
  border-color: var(--c-accent);
  background: var(--c-accent);
  color: var(--c-accent-contrast);
}

.gallery__grid {
  list-style: none;
  padding: 0;
  margin: var(--space-5) 0 0;
  position: relative;
  --masonry-cols: 1;
  --masonry-gap: var(--space-5);
}

@media (min-width: 30rem) {
  .gallery__grid {
    --masonry-cols: 2;
  }
}

@media (min-width: 48rem) {
  .gallery__grid {
    --masonry-cols: 3;
  }
}

.gallery__grid:not([data-packed]) > .tile {
  position: static;
  width: 100%;
  margin-block-end: var(--space-5);
}

.gallery__grid[data-packed] > .tile {
  position: absolute;
  top: 0;
  left: 0;
}

.tile {
  --tile-accent: var(--c-rule-strong);

  --tile-foot: 1.9rem;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--c-sheet);
  border: var(--rule-width) solid var(--c-rule);

  transition:
    border-color var(--dur) var(--ease),
    opacity var(--dur-slow) var(--ease-folio) var(--reveal-delay, 0s),
    translate var(--dur) var(--ease),
    box-shadow var(--dur) var(--ease);
}

.tile--previewing {
  border-color: var(--tile-accent);
  translate: 0 -2px;
  box-shadow: 0 var(--space-2) var(--space-6) color-mix(in srgb, var(--c-bg) 45%, transparent);
}

.tile--previewing .tile__badge,
.tile--previewing .tile__name {
  color: var(--tile-accent);
}

.tile--previewing .tile__badge {
  border-color: var(--tile-accent);
  background: var(--tile-accent);
  color: var(--c-accent-contrast);
}

.tile--selected {
  border-color: var(--c-accent);
  box-shadow: inset 0 0 0 1px var(--c-accent);
}

.tile__hit {
  display: block;
  width: 100%;
  appearance: none;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  cursor: zoom-in;
  min-width: 0;
}

.tile__foot {
  display: block;
  width: 100%;
}

.tile__frame {
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
  background: var(--c-code);
  aspect-ratio: 16 / 9;
}

.tile__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition:
    opacity var(--dur) var(--ease),
    scale var(--dur-slow) var(--ease);
}
.tile__image[data-loaded] {
  opacity: 1;
}

.tile--previewing .tile__image {
  scale: 1.03;
}

.tile__badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.2em 0.5em;
  background: var(--c-accent);
  color: var(--c-accent-contrast);
  font-family: var(--f-label);
  font-size: var(--t-6);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: lowercase;
}

.tile__badge :deep(svg) {
  width: 0.9em;
  height: 0.9em;
}

.tile__caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  height: var(--tile-foot);
  padding: 0 var(--space-1p5);
  min-width: 0;
}

.tile__name {
  font-family: var(--f-label);
  font-size: var(--t-8);
  font-weight: 600;
  color: var(--c-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  flex-shrink: 0;
  transition: color var(--dur-fast) var(--ease);
}

.tile__caption :deep(.xbtn) {
  flex-shrink: 0;
}

.gallery__more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-8);
}

.gallery__sentinel {
  height: 1px;
}

.gallery__empty {
  text-align: center;
}

@media print {
  .tile__image,
  .gallery__applied-image {
    opacity: 1 !important;
  }

  .gallery__grid {
    height: auto !important;
    columns: 3;
    column-gap: var(--space-5);
  }

  .gallery__grid > .tile {
    position: static !important;
    transform: none !important;
    width: 100% !important;
  }
}
</style>
