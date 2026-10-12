<script setup lang="ts">
import type { Font } from "#shared/assets";

import { byteLabel, fontUrl, sampleFor } from "#shared/assets";

const { fonts } = useAssets();

const route = useRoute();
const slug = String(route.params.family);

const faces = computed<Font[]>(() => {
  const key = familyFromSlug(fonts, slug);
  return key ? (fonts[key] ?? []) : [];
});

if (!faces.value.length) {
  throw createError({ statusCode: 404, statusMessage: `No family named ${slug}` });
}

const family = computed(() => faces.value[0]!.name);

const metrics = computed(() => faces.value[0]!.metrics);

useSeoMeta({ title: () => family.value });

const normalFaces = computed(() => faces.value.filter((f) => f.style !== "italic"));
const italicFaces = computed(() => faces.value.filter((f) => f.style === "italic"));

const weights = computed(() =>
  [...new Set(faces.value.map((f) => f.weight))].sort((a, b) => a - b),
);

defineOgImage(
  "Root",
  {
    label: "font",
    title: family.value,
    description: `A live specimen: size, leading, tracking, weight, style, and OpenType features.`,
    meta: `${metrics.value.glyphs.toLocaleString()} glyphs // ${metrics.value.spacing} // n ${metrics.value.measure}em`,
  },
  { alt: `${family.value} // a live type specimen` },
);

const style = ref<"normal" | "italic">("normal");
const weight = ref(normalFaces.value[0]?.weight ?? weights.value[0] ?? 400);
const size = ref(24);
const leading = ref(1.5);
const tracking = ref(0);
const measure = ref(68);

const requestedWeight = Number(useRoute().query.w);
const requestedStyle = useRoute().query.s;

if (Number.isFinite(requestedWeight) && weights.value.includes(requestedWeight)) {
  weight.value = requestedWeight;
}
if (requestedStyle === "italic" && italicFaces.value.length) {
  style.value = "italic";
}

const FEATURE_LABELS: Record<string, string> = {
  THND: "Thin width",

  frac: "Fractions",
  dnom: "Denominators",
  numr: "Numerators",
  onum: "Old-style figures",
  dlig: "Ligatures",

  ss01: "Alternate g",
  ss02: "Alternate l",
  ss03: "Straight tails",
  cv01: "Alternate a",
};

const features = computed(() => {
  const shipped = faces.value[0]?.features ?? [];
  return Object.keys(FEATURE_LABELS)
    .filter((tag) => shipped.includes(tag))
    .map((tag) => ({ tag, label: FEATURE_LABELS[tag]! }));
});
const activeFeatures = ref<string[]>([]);

const defaultSample = computed(() => sampleFor(faces.value));

const sampleText = useLocalStorage(`x-font-sample-${slug}`, () => defaultSample.value);

const activeFace = computed(
  () =>
    faces.value.find((f) => f.weight === weight.value && (f.style ?? "normal") === style.value) ??
    faces.value[0],
);

const previewStyle = computed(() => ({
  fontFamily: `'${family.value}'`,
  fontWeight: weight.value,
  fontStyle: style.value,
  fontSize: `${size.value}px`,
  lineHeight: leading.value,
  letterSpacing: `${tracking.value}em`,
  maxWidth: `${measure.value}ch`,
  fontFeatureSettings: activeFeatures.value.map((f) => `"${f}" 1`).join(", ") || undefined,
}));

watchEffect(async () => {
  if (import.meta.server || !activeFace.value) return;

  const face = new FontFace(family.value, `url(${fontUrl(activeFace.value.src[0]!.url)})`, {
    weight: String(activeFace.value.weight),
    style: activeFace.value.style ?? "normal",
  });

  try {
    document.fonts.add(await face.load());
  } catch {}
});

const glyphRows =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]{};:,.<>/?|\\\"'`~_+=";

function isActive(face: Font): boolean {
  return face === activeFace.value;
}

function useAsDisplayFace() {
  const root = document.documentElement;
  root.style.setProperty("--f-display", `"${family.value}", Georgia, serif`);
  root.style.setProperty("--f-display-weight", "600");
}
</script>

<template>
  <div class="family sheet-grid">
    <header class="family__head">
      <XLabel variant="accent">Specimen</XLabel>
      <h1 class="family__name" :style="{ fontFamily: `'${family}'` }">{{ family }}</h1>

      <p class="meta family__metrics">
        <span class="num">{{ metrics.glyphs.toLocaleString() }}</span> glyphs //
        <span class="num">{{ metrics.spacing }}</span> //
        <span class="num">n {{ metrics.measure }}em</span> //
        <span class="num">{{ metrics.unitsPerEm }}</span> upm // asc
        <span class="num">{{ metrics.ascender }}</span> / desc
        <span class="num">{{ metrics.descender }}</span> //
        <template v-if="metrics.xHeight">
          x-height <span class="num">{{ metrics.xHeight }}</span>
        </template>
      </p>

      <div class="family__rule" aria-hidden="true" />
    </header>

    <XSheet class="family__controls no-print">
      <div class="family__controls-grid">
        <XSelect
          v-model="weight"
          label="Weight"
          :options="weights.map((w) => ({ label: String(w), value: w }))"
        />

        <XSelect
          v-if="italicFaces.length"
          v-model="style"
          label="Style"
          :options="[
            { label: 'Normal', value: 'normal' },
            { label: 'Italic', value: 'italic' },
          ]"
        />

        <XSlider v-model="size" label="Size" :min="8" :max="96" :step="1" :display="`${size}px`" />

        <XSlider
          v-model="leading"
          label="Leading"
          :min="0.8"
          :max="2.4"
          :step="0.05"
          :display="`${leading}`"
        />

        <XSlider
          v-model="tracking"
          label="Tracking"
          :min="-0.05"
          :max="0.2"
          :step="0.005"
          :display="`${tracking}`"
        />

        <XSlider
          v-model="measure"
          label="Measure"
          :min="20"
          :max="120"
          :step="2"
          :display="`${measure}ch`"
        />
      </div>

      <label class="family__sample">
        <span class="label">Sample</span>
        <textarea v-model="sampleText" rows="2" />
      </label>

      <div v-if="features.length" class="family__features">
        <span class="label">Features</span>
        <div class="family__feature-list">
          <XCheckbox
            v-for="f in features"
            :key="f.tag"
            :label="f.label"
            :model-value="activeFeatures.includes(f.tag)"
            @update:model-value="
              (v) =>
                (activeFeatures = v
                  ? [...activeFeatures, f.tag]
                  : activeFeatures.filter((t) => t !== f.tag))
            "
          />
        </div>
      </div>
    </XSheet>

    <XSheet class="family__preview">
      <p :style="previewStyle">{{ sampleText || "Type something..." }}</p>
    </XSheet>

    <XSectionHead label="Faces" :count="faces.length" />
    <div class="family__inventory">
      <table>
        <thead>
          <tr>
            <th>Patch</th>
            <th>Weight</th>
            <th>Style</th>
            <th>Format</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="face in faces"
            :key="`${face.patch}-${face.weight}-${face.style ?? 'normal'}`"
            :class="{ 'family__inventory-row--active': isActive(face) }"
          >
            <td>{{ face.patch }}</td>
            <td class="num">{{ face.weight }}</td>
            <td>{{ face.style ?? "normal" }}</td>
            <td>{{ face.format }}</td>
            <td class="num">{{ byteLabel(face.bytes) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <XSectionHead label="Glyphs" />
    <XSheet class="family__glyphs">
      <p :style="{ ...previewStyle, fontSize: `${Math.min(size, 28)}px`, maxWidth: 'none' }">
        {{ glyphRows }}
      </p>
    </XSheet>

    <XLink to="/fonts" class="family__back">
      <XIcon name="material-symbols:arrow-back-sharp" size="xs" />All fonts
    </XLink>

    <!-- <div class="family__actions no-print">
      <XLink v-if="activeFace" :href="activeFace.src[0]!.url" external>
        Download
        {{
          [
            activeFace.patch === "base" ? null : activeFace.patch,
            weight,
            activeFace.style ?? "normal",
          ]
            .filter(Boolean)
            .join(" ")
        }}
        · {{ byteLabel(activeFace.bytes) }}
      </XLink>

      <XButton variant="sheet" size="sm" @click="useAsDisplayFace">
        Set as the display face
      </XButton>
      <span class="meta"
        >Swaps <span class="num">--f-display</span> to {{ family }} for this browser.</span
      >
    </div> -->
  </div>
</template>

<style scoped>
.family {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.family__name {
  font-size: var(--t-60);
  line-height: 1;
  margin-block: var(--space-3) var(--space-2);
}

.family__metrics {
  margin-top: var(--space-3);
}

.family__rule {
  margin-block: var(--space-7) var(--space-5);
  border-top: 1px solid var(--c-rule-strong);
  position: relative;
  height: 3px;
}

.family__rule::after,
.family__rule::before {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
}

.family__rule::before {
  top: 2px;
  border-top: 1px solid var(--c-rule);
}

.family__rule::after {
  top: 5px;
  border-top: 1px solid var(--c-rule-faint);
}

.family__controls-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-4) var(--space-7);
}

.family__controls-grid > :deep(.slider) {
  flex: 1 1 9rem;
  min-width: 8rem;
}

.family__sample {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-5);
}

.family__sample textarea {
  appearance: none;
  background: var(--c-sheet-2);
  border: var(--rule-width) solid var(--c-rule);
  color: var(--c-fg);
  font-family: var(--f-label);
  font-size: var(--t-9);
  padding: 0.5em;
  resize: vertical;
}

.family__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-5);
}

.family__feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-5);
}

.family__preview {
  margin-top: var(--space-4);
}

.family__preview p {
  overflow-wrap: anywhere;
}

.family__glyphs p {
  overflow-wrap: break-word;
  line-height: 1.7;
  color: var(--c-dim);
}

.family__back {
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
}

.family__inventory {
  margin-top: var(--space-4);
  overflow-x: auto;
}

.family__inventory table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--f-label);
  font-size: var(--t-7);
}

.family__inventory th {
  text-align: left;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dimmer);
  padding: 0.35em 0.75em 0.35em 0;
  border-bottom: var(--rule-width) solid var(--c-rule-strong);
  white-space: nowrap;
}

.family__inventory td {
  padding: 0.3em 0.75em;
  border-bottom: var(--rule-width) solid var(--c-rule-faint);
  white-space: nowrap;
}

.family__inventory-row--active {
  background: var(--c-sheet-2);
  box-shadow: inset 2px 0 0 var(--c-accent);
}

.family__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2) var(--space-4);
  margin-top: var(--space-7);
}
</style>
