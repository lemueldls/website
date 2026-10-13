<script setup lang="ts">
const { selected, meta } = useWallpaper();
const { resolvedTheme } = useTheme();
const permalink = useWallpaperPermalink();

const mounted = useMounted();

const ROLES = ["background", "surface", "primary", "secondary", "accent", "highlight"];

interface Swatch {
  hex: string;
  role: string;

  accent?: boolean;
}

const swatches = computed<Swatch[]>(() => {
  const m = meta.value;
  if (!m) return [];

  const accentColour = liveAccent.value ?? m.accent;
  const samples = (m.palette ?? []).map((hex, i) => ({
    hex,
    role: ROLES[i] ?? `extra ${i - ROLES.length + 1}`,
  }));

  return [{ hex: accentColour, role: "accent", accent: true }, ...samples];
});

const liveAccent = computed<string | null>(() => {
  const m = meta.value;
  if (!m) return null;
  return resolvedTheme.value === "ink" ? m.accent : (m.accentPaper ?? m.accent);
});
</script>

<template>
  <div class="palette">
    <XLabel>Palette</XLabel>

    <div v-if="mounted && swatches.length" class="palette__row">
      <span
        v-for="(s, i) in swatches"
        :key="i"
        class="palette__swatch"
        :class="{ 'palette__swatch--accent': s.accent }"
        :style="{ background: s.hex }"
        :title="`${s.role} // ${s.hex}`"
      />
    </div>

    <p v-else class="palette__empty meta">No wallpaper selected.</p>

    <XLabel v-if="mounted && selected">
      <XLink
        :to="mounted ? permalink : WALLPAPERS_PATH"
        :title="mounted && selected ? `Permalink for ${selected}` : 'The wallpaper collection'"
        >{{ selected }}
      </XLink>
    </XLabel>
  </div>
</template>

<style scoped>
.palette {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
}

.palette__row {
  display: flex;
  gap: var(--space-1);
}

.palette__swatch {
  flex: 1 1 0;
  min-width: 0;
  height: 0.85rem;
  border: var(--rule-width) solid var(--c-rule);
}

.palette__swatch--accent {
  border-color: var(--c-fg);
  box-shadow: inset 0 0 0 1px var(--c-accent-contrast);
}

.palette__hexes {
  font-size: var(--t-6);
  line-height: 1.35;
  color: var(--c-dim);
  word-break: break-all;
}

.palette__empty {
  font-size: var(--t-6);
}

@media print {
  .palette {
    display: none;
  }
}
</style>
