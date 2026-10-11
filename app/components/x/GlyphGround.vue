<script setup lang="ts">
import { wallpaperUrl } from "#shared/assets";

const HEADROOM = 300;

const FONT_SIZE = 16;
const CELL_W = FONT_SIZE * 0.6;
const CELL_H = FONT_SIZE * 1.1;

const RAMP = " .·:-=+*#@";

const { selected } = useWallpaper();
const { resolvedTheme } = useTheme();

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

const parallax = ref(0);
let frame = 0;

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;

      parallax.value = Math.min(window.scrollY, 15000) * 0.02;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScopeDispose(() => {
    window.removeEventListener("scroll", onScroll);
    if (frame) cancelAnimationFrame(frame);
  });
});

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const asciiReady = ref(false);

const fading = ref(false);

const hasPlate = ref(false);

function thumbUrl(file: string): string {
  return `/api/thumb?file=${encodeURIComponent(file)}`;
}

const PRINT_MS = 820;

let runId = 0;

interface Plate {
  rows: number;
  cols: number;

  rgb: Uint8ClampedArray;

  chars: string[];
}

async function prepare(file: string): Promise<Plate | null> {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const cols = Math.max(2, Math.floor(w / CELL_W));
  const rows = Math.max(2, Math.floor(h / CELL_H));

  const sample = new OffscreenCanvas(cols, rows);
  const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
  if (!sampleCtx) return null;

  let image: ImageBitmap;
  try {
    const res = await fetch(thumbUrl(file));
    if (!res.ok) return null;
    image = await createImageBitmap(await res.blob());
  } catch {
    return null;
  }

  const boxAspect = w / h;
  const imageAspect = image.width / image.height;

  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (imageAspect > boxAspect) {
    sw = Math.round(image.height * boxAspect);
    sx = Math.round((image.width - sw) / 2);
  } else if (imageAspect < boxAspect) {
    sh = Math.round(image.width / boxAspect);
    sy = Math.round((image.height - sh) / 2);
  }

  sampleCtx.drawImage(image, sx, sy, sw, sh, 0, 0, cols, rows);
  image.close();

  const { data } = sampleCtx.getImageData(0, 0, cols, rows);

  const lum = new Float32Array(cols * rows);
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < lum.length; i++) {
    const o = i * 4;
    const value = 0.2126 * data[o]! + 0.7152 * data[o + 1]! + 0.0722 * data[o + 2]!;
    lum[i] = value;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  const span = max - min;
  const steps = RAMP.length - 1;
  const chars: string[] = [];

  for (let i = 0; i < lum.length; i++) {
    const t = span > 1e-3 ? (lum[i]! - min) / span : 0.5;
    chars.push(RAMP[Math.max(0, Math.min(steps, Math.floor(t * steps)))]!);
  }

  return { rows, cols, rgb: data, chars };
}

function paintRows(ctx: CanvasRenderingContext2D, plate: Plate, fromRow: number, toRow: number) {
  for (let row = fromRow; row < toRow; row++) {
    const y = row * CELL_H + CELL_H / 2;

    for (let col = 0; col < plate.cols; col++) {
      const i = row * plate.cols + col;
      const char = plate.chars[i]!;

      if (char === " ") continue;

      const o = i * 4;
      ctx.fillStyle = `rgb(${plate.rgb[o]!},${plate.rgb[o + 1]!},${plate.rgb[o + 2]!})`;
      ctx.fillText(char, col * CELL_W + CELL_W / 2, y);
    }
  }
}

function fadeOut(source: HTMLCanvasElement): boolean {
  const layer = document.querySelector<HTMLCanvasElement>(".glyph-ground__fade");
  if (!layer) return false;

  layer.width = source.width;
  layer.height = source.height;

  const ctx = layer.getContext("2d");
  if (!ctx) return false;

  ctx.clearRect(0, 0, layer.width, layer.height);
  ctx.drawImage(source, 0, 0);

  fading.value = true;

  const anim = layer.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 640,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    fill: "forwards",
  });

  anim.onfinish = () => {
    fading.value = false;
  };

  return true;
}

async function drawAscii(file: string) {
  const el = canvas.value;
  if (!el) return;

  const scan = stopScan();

  asciiReady.value = true;

  const plate = await prepare(file);
  if (!plate) {
    asciiReady.value = false;
    return;
  }

  await document.fonts.load(`${FONT_SIZE}px "Asterism Code"`);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight + HEADROOM * 2;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hasPlate.value && !reduced) {
    fadeOut(el);
  }

  const nextW = Math.floor(w * dpr);
  const nextH = Math.floor(h * dpr);
  if (el.width !== nextW || el.height !== nextH) {
    el.width = nextW;
    el.height = nextH;
  }

  const ctx = el.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, el.width, el.height);

  ctx.setTransform(dpr, 0, 0, dpr, 0, HEADROOM * dpr);

  ctx.font = `${FONT_SIZE}px "Asterism Code"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (reduced) {
    paintRows(ctx, plate, 0, plate.rows);
    hasPlate.value = true;
    return;
  }

  const id = ++runId;
  const start = performance.now();
  let painted = 0;

  const step = (now: number) => {
    if (id !== runId) return;

    const t = Math.min(1, (now - start) / PRINT_MS);

    const target = Math.round(t * plate.rows);

    if (target > painted) {
      paintRows(ctx, plate, painted, target);
      painted = target;
    }

    if (t < 1) requestAnimationFrame(step);
    else {
      hasPlate.value = true;

      startScan(scan, ctx, plate);
    }
  };

  requestAnimationFrame(step);
}

const SCAN_TRAIL = 4;

const SCAN_TICK_MS = 110;

const SCAN_REST_TICKS = 24;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

const GLOW_RADIUS = 140;
const GLOW_RADIUS_SQ = GLOW_RADIUS * GLOW_RADIUS;

const GLOW_LEAD = 0.09;

const GLOW_LEAD_MAX = GLOW_RADIUS * 0.75;

const GLOW_VEL_TAU = 0.14;

const GLOW_VEL_EPS = 8;

function approach(current: number, target: number, dt: number, tau: number): number {
  return current + (target - current) * (1 - Math.exp(-dt / tau));
}

function clamp(value: number, limit: number): number {
  return value < -limit ? -limit : value > limit ? limit : value;
}

function readInk(): [number, number, number] {
  const el = canvas.value?.parentElement;
  const found = el ? getComputedStyle(el).color.match(/[\d.]+/g) : null;
  if (!found || found.length < 3) return [255, 255, 255];

  return [Number(found[0]) || 0, Number(found[1]) || 0, Number(found[2]) || 0];
}

let scanFront = 0;

let scanGeneration = 0;
let scanTimer: ReturnType<typeof setInterval> | undefined;

let liveCtx: CanvasRenderingContext2D | null = null;
let livePlate: Plate | null = null;
let liveInk: [number, number, number] = [255, 255, 255];

function stopScan(): number {
  if (scanTimer) clearInterval(scanTimer);
  scanTimer = undefined;

  scanFront = -SCAN_TRAIL - 1;
  return ++scanGeneration;
}

onScopeDispose(stopScan);

function scanLift(row: number): number {
  const behind = scanFront - row;
  return behind >= 0 && behind <= SCAN_TRAIL ? smoothstep(1 - behind / SCAN_TRAIL) : 0;
}

function glowLift(x: number, y: number, glow: { x: number; y: number }): number {
  const dx = x - glow.x;
  const dy = y - glow.y;
  const distSq = dx * dx + dy * dy;
  if (distSq > GLOW_RADIUS_SQ) return 0;

  return smoothstep(1 - Math.sqrt(distSq) / GLOW_RADIUS);
}

function paintScannedRow(
  ctx: CanvasRenderingContext2D,
  plate: Plate,
  row: number,
  glow: { x: number; y: number } | null,
  ink: [number, number, number],
) {
  ctx.clearRect(0, row * CELL_H, plate.cols * CELL_W, CELL_H);

  ctx.font = `${FONT_SIZE}px "Asterism Code"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const sweep = scanLift(row);
  const y = row * CELL_H + CELL_H / 2;

  for (let col = 0; col < plate.cols; col++) {
    const i = row * plate.cols + col;
    const char = plate.chars[i]!;
    if (char === " ") continue;

    const o = i * 4;
    const r = plate.rgb[o]!;
    const g = plate.rgb[o + 1]!;
    const b = plate.rgb[o + 2]!;

    const lift = glow ? Math.max(sweep, glowLift(col * CELL_W + CELL_W / 2, y, glow)) : sweep;

    ctx.fillStyle =
      lift > 0
        ? `rgb(${Math.round(r + (ink[0] - r) * lift)},${Math.round(g + (ink[1] - g) * lift)},${Math.round(b + (ink[2] - b) * lift)})`
        : `rgb(${r},${g},${b})`;

    ctx.fillText(char, col * CELL_W + CELL_W / 2, y);
  }
}

let glowLight: { x: number; y: number } | null = null;

function startScan(generation: number, ctx: CanvasRenderingContext2D, plate: Plate) {
  if (generation !== scanGeneration) return;

  liveCtx = ctx;
  livePlate = plate;
  liveInk = readInk();

  scanFront = -SCAN_TRAIL - 1;
  let rest = 0;

  scanTimer = setInterval(() => {
    if (generation !== scanGeneration) return;

    if (rest > 0) {
      rest--;
      return;
    }

    scanFront++;

    const from = Math.max(0, scanFront - SCAN_TRAIL);
    const to = Math.min(plate.rows, scanFront + 1);
    for (let row = from; row < to; row++) {
      paintScannedRow(ctx, plate, row, glowLight, liveInk);
    }

    if (scanFront - SCAN_TRAIL >= plate.rows) {
      rest = SCAN_REST_TICKS;
      scanFront = -SCAN_TRAIL - 1;
    }
  }, SCAN_TICK_MS);
}

let pointerAt: { x: number; y: number } | null = null;

let pointerLast: { x: number; y: number } | null = null;

let pointerVelX = 0;
let pointerVelY = 0;

let glowNow = 0;

let glowRows: [number, number] | null = null;

let glowFrame = 0;

function glowStep() {
  glowFrame = 0;

  const now = performance.now();
  const dt = Math.min(Math.max((now - glowNow) / 1000, 0.001), 0.05);
  glowNow = now;

  const at = pointerAt && {
    x: pointerAt.x,
    y: pointerAt.y - parallax.value,
  };

  let instantX = 0;
  let instantY = 0;
  if (pointerAt && pointerLast) {
    instantX = (pointerAt.x - pointerLast.x) / dt;
    instantY = (pointerAt.y - pointerLast.y) / dt;
  }
  pointerLast = pointerAt ? { ...pointerAt } : null;

  pointerVelX = approach(pointerVelX, instantX, dt, GLOW_VEL_TAU);
  pointerVelY = approach(pointerVelY, instantY, dt, GLOW_VEL_TAU);

  const moving = Math.hypot(pointerVelX, pointerVelY) > GLOW_VEL_EPS;

  if (!at || !liveCtx || !livePlate) {
    const ctx = liveCtx;
    const plate = livePlate;
    if (ctx && plate && glowRows) {
      const [from, to] = glowRows;
      for (let row = from; row < to; row++) {
        paintScannedRow(ctx, plate, row, null, liveInk);
      }
      glowRows = null;
    }
    glowLight = null;
    return;
  }

  const light = {
    x: at.x + clamp(pointerVelX * GLOW_LEAD, GLOW_LEAD_MAX),
    y: at.y + clamp(pointerVelY * GLOW_LEAD, GLOW_LEAD_MAX),
  };

  const nextFrom = Math.max(0, Math.floor((light.y - GLOW_RADIUS) / CELL_H));
  const nextTo = Math.min(livePlate.rows, Math.ceil((light.y + GLOW_RADIUS) / CELL_H));

  const moved = glowLight ? Math.hypot(light.x - glowLight.x, light.y - glowLight.y) > 1 : true;

  if (!moved && !moving) {
    glowLight = light;
    return;
  }

  const from = glowRows ? Math.min(glowRows[0], nextFrom) : nextFrom;
  const to = glowRows ? Math.max(glowRows[1], nextTo) : nextTo;

  for (let row = from; row < to; row++) {
    paintScannedRow(liveCtx, livePlate, row, light, liveInk);
  }

  glowLight = light;
  glowRows = [nextFrom, nextTo];

  if (moving) glowFrame = requestAnimationFrame(glowStep);
}

function runGlowFrame() {
  if (glowFrame) return;
  glowNow = performance.now();
  glowFrame = requestAnimationFrame(glowStep);
}

function wakeGlow() {
  if (pointerAt && !glowFrame) {
    glowNow = performance.now();
    glowFrame = requestAnimationFrame(glowStep);
  }
}

onMounted(() => {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopScan();
      if (glowFrame) cancelAnimationFrame(glowFrame);
      glowFrame = 0;
    } else if (liveCtx && livePlate) {
      startScan(scanGeneration, liveCtx, livePlate);

      runGlowFrame();
    }
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const onMove = (event: PointerEvent) => {
    pointerAt = { x: event.clientX, y: event.clientY };

    if (Math.hypot(event.movementX, event.movementY) > 200) pointerLast = null;

    wakeGlow();
  };

  const onLeave = () => {
    pointerAt = null;
    pointerLast = null;

    runGlowFrame();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerleave", onLeave);
  window.addEventListener("pointercancel", onLeave);
  window.addEventListener("blur", onLeave);

  onScopeDispose(() => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("pointercancel", onLeave);
    window.removeEventListener("blur", onLeave);
    if (glowFrame) cancelAnimationFrame(glowFrame);
  });
});

watch(() => parallax.value, wakeGlow);

watch(
  () => resolvedTheme.value,
  () => {
    liveInk = readInk();
  },
);

watch(
  [selected, mounted, viewport],
  async ([file, isMounted]) => {
    if (!file || !isMounted) {
      stopScan();
      asciiReady.value = false;
      return;
    }

    await nextTick();

    await drawAscii(file);
  },
  { immediate: true },
);

const blendClass = computed(() => (resolvedTheme.value === "ink" ? "screen" : "multiply"));
</script>

<template>
  <div
    v-if="mounted"
    class="glyph-ground"
    :class="[selected && asciiReady ? blendClass : '']"
    :style="{
      top: `${-HEADROOM}px`,
      height: `${viewport.height + HEADROOM * 2}px`,
      transform: `translate3d(0, ${parallax}px, 0)`,
    }"
  >
    <canvas v-show="fading" class="glyph-ground__fade" aria-hidden="true" />

    <canvas v-show="selected && asciiReady" ref="canvas" class="glyph-ground__canvas" />
  </div>
</template>

<style scoped>
.glyph-ground {
  position: fixed;
  left: 0;
  right: 0;
  z-index: var(--z-ground);
  pointer-events: none;
  will-change: transform;

  color: var(--c-fg);
}

.glyph-ground {
  opacity: 0.08;
}

.glyph-ground.screen {
  mix-blend-mode: screen;
}

.glyph-ground.multiply {
  mix-blend-mode: multiply;
}

.glyph-ground__canvas,
.glyph-ground__fade {
  position: absolute;
  inset: 0;
  display: block;
}

@media print {
  .glyph-ground {
    display: none;
  }
}
</style>
