<script setup lang="ts">
import { onKeyDown } from "@vueuse/core";

import {
  wallpaperThumbUrl,
  wallpaperSrcSet,
  wallpaperUrl,
  resolutionLabel,
  byteLabel,
  wallpaperPlaceholder,
  VIEW_WIDTHS,
  VIEW_QUALITY,
  type WallpaperMeta,
  type WallpaperVariant,
} from "#shared/assets";

import { variants, wallpaperFiles, wallpaperNumber } from "~/composables/wallpaper";

const open = defineModel<boolean>("open", { required: true });
const variant = defineModel<WallpaperVariant>("variant", { required: true });
const props = defineProps<{
  meta: WallpaperMeta | null;
  applied: boolean;
  activeTag?: string | null;
}>();

const emit = defineEmits<{
  step: [delta: number];
  apply: [apply: boolean];
  filter: [tag: string];
}>();

const { resolvedTheme } = useTheme();

const total = wallpaperFiles.length;

const number = computed(() => (props.meta ? wallpaperNumber(props.meta.file) : null));

onKeyDown(["ArrowLeft", "ArrowRight"], (event) => {
  if (!open.value) return;
  emit("step", event.key === "ArrowLeft" ? -1 : 1);
});

const paletteVars = computed<Record<string, string>>(() => {
  const meta = props.meta;
  if (!meta) return {};
  const vars: Record<string, string> = {};
  meta.palette.forEach((color, i) => {
    vars[`--lb-p${i + 1}`] = color;
  });
  vars["--lb-accent"] =
    resolvedTheme.value === "dark" ? meta.accent : (meta.accentLight ?? meta.accent);
  vars["--lb-ribbon"] =
    meta.palette.length > 1 ? `linear-gradient(90deg, ${meta.palette.join(", ")})` : "none";
  return vars;
});

const stageImage = ref<HTMLImageElement>();

function settle(img: HTMLImageElement | undefined) {
  if (img && img.complete && img.naturalWidth > 0) img.setAttribute("data-loaded", "");
}

function markLoaded(event: Event) {
  settle(event.target as HTMLImageElement);
}

onMounted(() => settle(stageImage.value));

watch([() => props.meta?.file, variant], async () => {
  const img = stageImage.value;
  if (!img) return;

  img.removeAttribute("data-loaded");
  await nextTick();
  settle(img);
});
</script>

<template>
  <XDialog v-model:open="open" :title="meta?.file ?? ''" size="wide">
    <div v-if="meta" class="lightbox" :style="paletteVars">
      <figure class="lightbox__stage">
        <img
          :src="wallpaperThumbUrl(meta.file, variant, VIEW_WIDTHS[0]!, { quality: VIEW_QUALITY })"
          :srcset="wallpaperSrcSet(meta.file, variant, VIEW_WIDTHS, { quality: VIEW_QUALITY })"
          :alt="meta.file"
          :width="meta.width"
          :height="meta.height"
          class="lightbox__image"
          ref="stageImage"
          @load="markLoaded"
          loading="eager"
          decoding="async"
        />
      </figure>

      <div class="lightbox__side">
        <dl class="lightbox__facts">
          <div class="lightbox__fact">
            <dt class="label">Size</dt>
            <dd>{{ resolutionLabel(meta) }}</dd>
          </div>
          <div class="lightbox__fact">
            <dt class="label">Weight</dt>
            <dd>{{ byteLabel(meta.bytes) }}</dd>
          </div>
          <div class="lightbox__fact">
            <dt class="label">Variant</dt>
            <dd>{{ variant }}</dd>
          </div>
          <div class="lightbox__fact">
            <dt class="label">Color</dt>
            <dd>{{ meta.hue }}</dd>
          </div>
          <div class="lightbox__fact">
            <dt class="label">Index</dt>
            <dd>
              {{ number }} <span class="lightbox__of">of {{ total }}</span>
            </dd>
          </div>
        </dl>

        <div v-if="meta.palette.length" class="lightbox__swatches">
          <span
            v-for="color in meta.palette"
            :key="color"
            class="lightbox__swatch"
            :style="{ background: color }"
            :title="color"
          />
        </div>

        <div class="lightbox__group">
          <span class="label">Variant</span>
          <div class="segmented" role="group" aria-label="Variant">
            <button
              v-for="name in variants"
              :key="name"
              type="button"
              class="segmented__item"
              :class="{ 'segmented__item--on': variant === name }"
              :aria-pressed="variant === name"
              @click="variant = name"
            >
              {{ name }}
            </button>
          </div>
        </div>

        <!-- <p v-if="applied" class="lightbox__note">
          Applied now. Accent clamped to
          <code>{{
            resolvedTheme === "dark" ? meta.accent : (meta.accentLight ?? meta.accent)
          }}</code>
          for this theme.
        </p> -->

        <div class="lightbox__tags" v-if="meta.tags.length">
          <XChip
            v-for="tag in meta.tags"
            :key="tag"
            :active="activeTag === tag"
            :title="`Show only ${tag} wallpapers`"
            @click="emit('filter', tag)"
          >
            {{ tag }}
          </XChip>
        </div>

        <div class="lightbox__actions">
          <XButton v-if="!applied" variant="accent" block @click="emit('apply', true)">
            <XIcon name="material-symbols:check-sharp" />
            Apply
          </XButton>
          <XButton v-else variant="rule" block @click="emit('apply', false)">Remove</XButton>

          <XButton
            :href="wallpaperUrl(meta.file, variant)"
            class="lightbox__download"
            variant="sheet"
            block
            download
          >
            <XIcon name="material-symbols:download-sharp" />
            Download
          </XButton>
        </div>

        <div class="lightbox__nav">
          <XButton
            variant="ghost"
            title="Previous wallpaper"
            aria-label="Previous wallpaper"
            class="lightbox__prev"
            @click="emit('step', -1)"
          >
            <XIcon name="material-symbols:chevron-left-sharp" size="lg" />
            Previous
          </XButton>
          <XButton
            variant="ghost"
            title="Next wallpaper"
            aria-label="Next wallpaper"
            class="lightbox__next"
            @click="emit('step', 1)"
          >
            Next
            <XIcon name="material-symbols:chevron-right-sharp" size="lg" />
          </XButton>
        </div>
      </div>
    </div>
  </XDialog>
</template>

<style scoped>
.lightbox {
  display: grid;
  height: 100%;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: var(--space-6);
  align-items: start;
}

.lightbox,
.lightbox__stage,
.lightbox__side {
  min-width: 0;
}

.lightbox :deep(svg) {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .lightbox {
    grid-template-columns: minmax(0, 1fr);
  }
}

.lightbox__label {
  font-family: var(--f-label);
  font-size: var(--t-6);
  letter-spacing: 0.08em;
  text-transform: lowercase;
  color: var(--c-dimmer);
}

.lightbox__stage {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.lightbox__image {
  width: 100%;
  height: auto;
  max-height: min(70dvh, 40rem);
  object-fit: contain;
  background: var(--c-code);
  border: var(--rule-width) solid var(--c-rule);
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
}

.lightbox__image[data-loaded] {
  opacity: 1;
}

.lightbox__facts {
  display: grid;
  gap: var(--space-1);
  margin: 0;
  padding: var(--space-2) 0;
  border-block: var(--rule-width) solid var(--c-rule);
}

.lightbox__fact {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;
}

.lightbox__fact .label {
  flex-shrink: 0;
}

.lightbox__fact dd {
  margin: 0;
  font-family: var(--f-label);
  font-size: var(--t-8);
  color: var(--c-fg);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.lightbox__of {
  color: var(--c-dim);
}

.lightbox__facts {
  margin: 0;
}

.lightbox__side {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding: var(--space-4);
  gap: var(--space-3);
}

.lightbox__swatches {
  display: flex;
  height: 1.75rem;
  border: var(--rule-width) solid var(--c-rule);

  background: var(--lb-ribbon, transparent);
}

.lightbox__swatch {
  flex: 1;
  min-width: 0;

  opacity: 0.72;
  transition: opacity var(--dur-fast) var(--ease);
}

.lightbox__swatch:hover {
  opacity: 1;
}

.lightbox__group {
  --c-accent: var(--lb-accent, var(--c-accent));
  --c-accent-contrast: var(--c-bg);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.lightbox__note {
  font-size: var(--t-9);
  color: var(--c-dim);
  line-height: 1.5;
}

.lightbox__note code {
  font-size: 0.85em;
}

.lightbox__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.lightbox__nav {
  display: flex;
  /* align-self: flex-end; */
  /* justify-content: flex-end; */
  gap: var(--space-2);
}

.lightbox__prev {
  flex: 1;
}

.lightbox__next {
  flex: 1;
}

.lightbox__actions {
  --c-accent: var(--lb-accent, var(--c-accent));
  --c-accent-contrast: var(--c-bg);
  margin-top: var(--space-1);
  display: flex;
  gap: var(--space-2);
}

.segmented {
  display: inline-flex;
  border: var(--rule-width) solid var(--c-rule);
  background: var(--c-sheet-2);
}

.segmented__item {
  appearance: none;
  border: none;
  border-inline-start: var(--rule-width) solid var(--c-rule);
  background: transparent;
  color: var(--c-dim);
  font-family: var(--f-label);
  font-size: var(--t-8);
  /* letter-spacing: 0.06em; */
  text-transform: lowercase;
  padding: var(--space-2);
  cursor: pointer;
  flex: 1;
  transition:
    border-color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}

.segmented__item:first-child {
  border-inline-start: none;
}

.segmented__item:hover {
  color: var(--c-fg);
}

.segmented__item--on {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: var(--c-accent-contrast);
}
</style>
