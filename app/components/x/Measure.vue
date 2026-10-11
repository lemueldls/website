<script setup lang="ts">
const FONT_SIZE_PT = 10.5;
const LEADING = 1.55;

const PERIOD_ONE = ((FONT_SIZE_PT * 96) / 72) * LEADING;

const PERIOD = PERIOD_ONE * 2;

const DASH = 5;

const MARK_EVERY = 20;

const MARK = 9;

const SHEET_MAX = 78 * 16;
const GUTTER = 10 * 16;
const COLUMN_MAX = SHEET_MAX - GUTTER * 2;

const INSET = 18;

const MIN_CLEARANCE = 12;

const mounted = ref(false);
const viewport = ref({ width: 1440, height: 900 });

onMounted(() => {
  mounted.value = true;

  const update = () => {
    viewport.value = { width: window.innerWidth, height: window.innerHeight };
  };
  update();

  window.addEventListener("resize", update);
  onScopeDispose(() => window.removeEventListener("resize", update));
});

const inset = computed(() => {
  const column = Math.min(COLUMN_MAX, viewport.value.width);
  const gutter = (viewport.value.width - column) / 2;

  return Math.min(Math.max(gutter - INSET, MIN_CLEARANCE), gutter - MIN_CLEARANCE);
});

const marks = computed(() => {
  const height = viewport.value.height;
  const count = Math.ceil(height / PERIOD);
  const out: { y: number }[] = [];

  for (let i = MARK_EVERY / 2; i <= count; i += MARK_EVERY / 2) {
    out.push({ y: i * PERIOD });
  }

  return out;
});

const layerStyle = computed(() => ({
  height: `${viewport.value.height}px`,
  "--period": `${PERIOD}px`,
  "--dash": `${DASH}px`,
}));
</script>

<template>
  <div v-if="mounted" class="measure no-print-chrome" :style="layerStyle">
    <div class="measure__side measure__side--left" :style="{ left: `${inset}px` }">
      <span class="measure__line" />
      <span
        v-for="(mark, i) in marks"
        :key="i"
        class="measure__mark measure__mark--left"
        :style="{ top: `${mark.y}px`, width: `${MARK}px` }"
      />
    </div>

    <div class="measure__side measure__side--right" :style="{ right: `${inset}px` }">
      <span class="measure__line" />
      <span
        v-for="(mark, i) in marks"
        :key="i"
        class="measure__mark measure__mark--right"
        :style="{ top: `${mark.y}px`, width: `${MARK}px` }"
      />
    </div>
  </div>
</template>

<style scoped>
.measure {
  position: fixed;

  left: 0;
  right: 0;
  z-index: var(--z-ground);
  pointer-events: none;
  will-change: transform;
}

.measure__side {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
}

.measure__line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;

  background-image: repeating-linear-gradient(
    to bottom,
    var(--c-rule) 0,
    var(--c-rule) var(--dash),
    transparent var(--dash),
    transparent var(--period)
  );
}

.measure__mark {
  position: absolute;
  height: 1px;
}

.measure__mark--left {
  left: 0;
  background: var(--c-rule-strong);
}

.measure__mark--right {
  right: 0;
  background: var(--c-rule-strong);
}

@media (max-width: 1399px) {
  .measure {
    display: none;
  }
}

@media print {
  .measure {
    display: none;
  }
}
</style>
