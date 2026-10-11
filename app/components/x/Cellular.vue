<script setup lang="ts">
import { hashString, mulberry32, pick, range } from "~/lib/rand";

const CELL = 9;

const ROWS = 12;

const TICK_MS = 110;

const GLYPH = "*";

const ALPHA = 0.4;

type Row = number[];

function ruleTable(rule: number): number[] {
  return Array.from({ length: 8 }, (_, i) => (rule >> i) & 1);
}

function step(row: Row, table: number[]): Row {
  const n = row.length;
  const out: number[] = [];

  for (let i = 0; i < n; i++) {
    const left = row[(i - 1 + n) % n]!;
    const self = row[i]!;
    const right = row[(i + 1) % n]!;
    out.push(table[(left << 2) | (self << 1) | right]!);
  }

  return out;
}

const RULES = [
  30, 45, 54, 57, 60, 62, 73, 90, 94, 102, 105, 106, 110, 122, 126, 146, 150, 158, 182, 188, 190,
  220, 222, 246, 250,
] as const;

const DAY = Math.floor(Date.now() / 86_400_000);
const RULE = pick(() => hashString(`ca-rule:${DAY}`) / 2 ** 53, RULES);
const TABLE = ruleTable(RULE);

function seed(width: number): Row {
  const rand = mulberry32(hashString(`ca-seed:${DAY}`));
  return Array.from({ length: width }, () => (range(rand, 0, 1) < 0.3 ? 1 : 0));
}

function paintRow(ctx: CanvasRenderingContext2D, row: Row, rowIndex: number) {
  const y = rowIndex * CELL + CELL / 2;

  ctx.font = `${CELL - 3}px "Asterism Code"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let c = 0; c < row.length; c++) {
    if (!row[c]) continue;
    ctx.fillText(GLYPH, c * CELL + CELL / 2, y);
  }
}

const mounted = ref(false);
const width = ref(1440);

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");

const cols = computed(() => Math.max(8, Math.floor(width.value / CELL)));

let row: Row = [];
let ctx: CanvasRenderingContext2D | undefined;
let timer: ReturnType<typeof setInterval> | undefined;

function stop() {
  if (timer) clearInterval(timer);
  timer = undefined;
}

function start() {
  const el = canvas.value;
  if (!el) return;

  stop();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const count = cols.value;

  el.width = Math.floor(count * CELL * dpr);
  el.height = Math.floor(ROWS * CELL * dpr);

  const context = el.getContext("2d");
  if (!context) return;

  ctx = context;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "var(--color-rule-strong, currentColor)";
  ctx.globalAlpha = ALPHA;

  row = seed(count);
  const seeded: Row[] = [row];
  for (let i = 1; i < ROWS; i++) {
    row = step(row, TABLE);
    seeded.push(row);
  }

  for (let i = 0; i < seeded.length; i++) paintRow(ctx, seeded[i]!, i);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  timer = setInterval(() => {
    if (!ctx) return;

    ctx.globalAlpha = 1;
    ctx.drawImage(canvas.value!, 0, 0, el.width, el.height, 0, -CELL, el.width, el.height);
    ctx.globalAlpha = ALPHA;

    row = step(row, TABLE);
    paintRow(ctx, row, ROWS - 1);
  }, TICK_MS);
}

onMounted(async () => {
  mounted.value = true;
  await nextTick();
  start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  const onResize = () => {
    const next = window.innerWidth;
    if (next === width.value) return;
    width.value = next;

    start();
  };

  window.addEventListener("resize", onResize);
  onScopeDispose(() => {
    stop();
    window.removeEventListener("resize", onResize);
  });
});

onScopeDispose(stop);
</script>

<template>
  <div v-if="mounted" class="ca no-print-chrome" aria-hidden="true">
    <canvas ref="canvas" class="ca__canvas" />
  </div>
</template>

<style scoped>
.ca {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-ground);
  height: calc(v-bind("ROWS") * 1px * v-bind("CELL"));
  pointer-events: none;

  color: var(--c-rule-strong);
}

.ca__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@media print {
  .ca {
    display: none;
  }
}
</style>
