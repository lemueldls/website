import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import sharp from "sharp";

const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL ?? "https://assets.lemueldls.dev";
const OUT = resolve(import.meta.dirname, "../app/assets/walls.meta.json");

const QUANTISE_URL = (file: string) =>
  `${ASSETS_BASE_URL}/cdn-cgi/image/width=256,quality=32,fit=scale-down/wallpapers/${file}`;

const ORIGINAL_URL = (file: string) => `${ASSETS_BASE_URL}/wallpapers/${file}`;

const K = 6;

const TAG_RULES: { pattern: RegExp; tag: string }[] = [
  { pattern: /^dominik-mayer/, tag: "dominik-mayer" },
  { pattern: /^voyager/, tag: "voyager" },
  { pattern: /^flowers/, tag: "flowers" },
  { pattern: /^pixel-/, tag: "pixel-art" },
  { pattern: /^voxel/, tag: "voxel" },
  { pattern: /^sjml-/, tag: "anime" },
  {
    pattern: /frieren|mushishi|kusuriya|koishi|maji-no-tabitabi|fumo|koi|lain|komorebi/,
    tag: "anime",
  },
  { pattern: /touhou|sakura/, tag: "anime" },
  { pattern: /hollow-knight|kaiju|dragon|samurai|knight|excalibur|sword/, tag: "fantasy" },
  { pattern: /lake-hylia|outset-island|zelda/, tag: "gaming" },
  { pattern: /space|jupiter|black-hole|galaxy|eclipse|stars|comets|planet/, tag: "space" },
  { pattern: /city|street|market|station|subway|trolley|bus/, tag: "urban" },
  {
    pattern: /forest|tree|valley|mountain|lake|river|sea|ocean|beach|cloud|wave/,
    tag: "landscape",
  },
  { pattern: /sunset|sunrise|bluehour|horizon|glow/, tag: "sunset" },
];

function tagsFor(file: string): string[] {
  const stem = file.replace(/\.[^.]+$/, "").toLowerCase();
  return [...new Set(TAG_RULES.filter((r) => r.pattern.test(stem)).map((r) => r.tag))];
}

type RGB = [number, number, number];

const INK = "#11111b";
const PAPER = "#eff1f5";

function parseHex(hex: string): RGB {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(rgb: RGB): string {
  return (
    "#" +
    rgb
      .map((c) =>
        Math.round(Math.min(255, Math.max(0, c)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function relativeLuminance(hex: string): number {
  const lin = parseHex(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as RGB;
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function shiftTowards(hex: string, amount: number, towards: "white" | "black"): string {
  return toHex(
    parseHex(hex).map((c) =>
      towards === "white" ? c + (255 - c) * amount : c * (1 - amount),
    ) as RGB,
  );
}

export function clampAccent(accent: string, ground: string, min = 4.5): string {
  if (contrastRatio(accent, ground) >= min) return accent;

  const towards = relativeLuminance(ground) < 0.5 ? "white" : "black";
  let closest = accent;
  let best = contrastRatio(accent, ground);

  for (let step = 1; step <= 24; step++) {
    const candidate = shiftTowards(accent, step / 24, towards);
    const ratio = contrastRatio(candidate, ground);
    if (ratio >= min) return candidate;
    if (ratio > best) {
      best = ratio;
      closest = candidate;
    }
  }

  return closest;
}

function chroma([r, g, b]: RGB): number {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function luminanceOf([r, g, b]: RGB): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

function accentScore(c: RGB): number {
  const lum = luminanceOf(c);
  return chroma(c) * Math.exp(-((lum - 0.45) ** 2) / 0.06);
}

function kmeans(
  pixels: RGB[],
  k: number,
  iterations = 12,
): { centroid: RGB; population: number }[] {
  if (pixels.length === 0) return [];

  const centroids = Array.from(
    { length: k },
    (_, i) => pixels[Math.floor((i * pixels.length) / k)]!,
  );

  let assignment = Array.from<number>({ length: pixels.length }).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    let changed = false;

    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i]!;
      let best = 0;
      let bestDist = Infinity;

      for (let c = 0; c < centroids.length; c++) {
        const q = centroids[c]!;

        const d = 2 * (p[0] - q[0]) ** 2 + 4 * (p[1] - q[1]) ** 2 + 3 * (p[2] - q[2]) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }

      if (assignment[i] !== best) {
        assignment[i] = best;
        changed = true;
      }
    }

    for (let c = 0; c < centroids.length; c++) {
      const members = pixels.filter((_, i) => assignment[i] === c);
      if (members.length === 0) continue;
      centroids[c] = [
        members.reduce((s, p) => s + p[0], 0) / members.length,
        members.reduce((s, p) => s + p[1], 0) / members.length,
        members.reduce((s, p) => s + p[2], 0) / members.length,
      ];
    }

    if (!changed) break;
  }

  return centroids.map((centroid, c) => ({
    centroid,
    population: assignment.filter((a) => a === c).length,
  }));
}

async function fetchIndex(): Promise<string[]> {
  const res = await fetch(`${ASSETS_BASE_URL}/index.json`);
  if (!res.ok) throw new Error(`index.json: ${res.status}`);
  return (await res.json()) as string[];
}

async function probe(
  url: string,
): Promise<{ width: number; height: number; bytes: number } | null> {
  const head = await fetch(url, { method: "HEAD" });
  if (!head.ok) return null;

  const bytes = Number(head.headers.get("content-length") ?? "0");

  const partial = await fetch(url, { headers: { Range: "bytes=0-131071" } });
  if (!partial.ok) return null;

  const meta = await sharp(await partial.arrayBuffer()).metadata();
  if (!meta.width || !meta.height) return null;

  return { width: meta.width, height: meta.height, bytes };
}

async function quantise(file: string): Promise<string[]> {
  const buffer = await (await fetch(QUANTISE_URL(file))).arrayBuffer();
  const { data, info } = await sharp(buffer)
    .resize(64, 64, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: RGB[] = [];
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    pixels.push([data[o]!, data[o + 1]!, data[o + 2]!]);
  }

  return kmeans(pixels, K)
    .sort((a, b) => b.population - a.population)
    .map((c) => toHex(c.centroid));
}

async function main() {
  console.log("[gen:walls] fetching asset index");
  const index = await fetchIndex();

  const baseFiles = index
    .filter((p) => p.startsWith("wallpapers/") && p.split("/").length === 2)
    .map((p) => p.replace("wallpapers/", ""))
    .sort();

  console.log(`[gen:walls] ${baseFiles.length} wallpapers`);

  const out: Record<string, unknown> = {};
  let done = 0;

  const LIMIT = 8;

  for (let i = 0; i < baseFiles.length; i += LIMIT) {
    const batch = baseFiles.slice(i, i + LIMIT);

    await Promise.all(
      batch.map(async (file) => {
        const [dims, palette] = await Promise.all([probe(ORIGINAL_URL(file)), quantise(file)]);

        if (!dims || palette.length === 0) return;

        const mostCharacterful = [...palette].sort(
          (a, b) => accentScore(parseHex(b)) - accentScore(parseHex(a)),
        )[0]!;

        out[file] = {
          file,
          width: dims.width,
          height: dims.height,
          bytes: dims.bytes,
          palette,
          accent: clampAccent(mostCharacterful, INK),
          accentPaper: clampAccent(mostCharacterful, PAPER),
          tags: tagsFor(file),
        };

        done++;
        process.stdout.write(`\r[gen:walls] ${done}/${baseFiles.length}${" ".repeat(16)}`);
      }),
    );
  }

  process.stdout.write("\n");

  await mkdir(resolve(import.meta.dirname, "../app/data"), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(out, null, 2)}\n`);

  console.log(`[gen:walls] wrote ${OUT} (${done} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
