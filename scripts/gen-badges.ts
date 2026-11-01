import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Renderer, type Node } from "@takumi-rs/core";

import { SIGIL_PATH, SIGIL_TRANSFORM, SIGIL_VIEWBOX } from "../app/lib/sigil.ts";

import fontsMeta from "../app/assets/fonts.meta.json" with { type: "json" };

const ROOT = resolve(import.meta.dirname, "..");

const PALETTE = {
  sheet: "#1e1e2e",
  rule: "#45475a",
  ruleStrong: "#6c7086",
  ruleFaint: "#313244",
  fg: "#cdd6f4",
  accent: "#00a896",
  glow: "#4bd8c8",
} as const;

const WIDE = { width: 88, height: 31 };
const SQUARE = { width: 31, height: 31 };

const SIGIL_WIDE = 22;
const SIGIL_SQUARE = 23;
const WORD_SIZE = 16;

const RULE_TOP = 23;

const FPS = 25;

const WAVE_FRAMES = 40;

const FACES = { family: "Asterism Slim", weight: 600 } as const;

const sigilStars = SIGIL_PATH.split("Z")
  .filter((part) => part.trim())
  .map((part) => part.trim() + "Z");

if (sigilStars.length !== 3) {
  console.error(`[gen:badges] expected 3 subpaths in U+2042, found ${sigilStars.length}.`);
  process.exit(1);
}

const sigilUrl = (fills: readonly string[]): string => {
  const paths = sigilStars
    .map(
      (d, i) =>
        `<path d="${d}" transform="${SIGIL_TRANSFORM}" fill="${fills[i] ?? PALETTE.accent}"/>`,
    )
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SIGIL_VIEWBOX}" width="24" height="24">` +
    `<g>${paths}</g></svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

interface FaceMeta {
  patch: string;
  weight: number;
  style?: string;
  src: { url: string; format: string }[];
}

function faceUrl(family: string, weight: number): string {
  const faces = (fontsMeta.families as unknown as Record<string, FaceMeta[]>)[family] ?? [];
  const face = faces.find((f) => f.patch === "base" && f.weight === weight && !f.style);
  const truetype = face?.src.find((s) => s.format === "truetype");
  if (truetype) return truetype.url;
  const woff2 = face?.src.find((s) => s.format === "woff2");
  if (woff2) return woff2.url.replace("/woff2/", "/truetype/").replace(/\.woff2$/, ".ttf");
  console.error(`[gen:badges] ${family} ${weight} is not in the manifest.`);
  process.exit(1);
}

async function loadWordmarkFont(): Promise<{ bytes: Uint8Array; source: string }> {
  const local = [
    process.env.ASTERISM_SLIM_TTF,
    "/home/lemuel/.nix-profile/share/fonts/truetype/IosevkaSlim-SemiBold.ttf",
  ]
    .filter((p): p is string => Boolean(p))
    .find((p) => existsSync(p));

  if (local) return { bytes: new Uint8Array(await readFile(local)), source: local };

  const url = faceUrl(FACES.family, FACES.weight);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(
      `[gen:badges] ${url} returned ${res.status}. ` +
        `Set ASTERISM_SLIM_TTF to cut from a local face instead.`,
    );
    process.exit(1);
  }
  return { bytes: new Uint8Array(await res.arrayBuffer()), source: url };
}

const { bytes, source } = await loadWordmarkFont();

const renderer = new Renderer();
const [registered] = await renderer.registerFont(bytes);

if (!registered) {
  console.error(`[gen:badges] ${source} registered no family.`);
  process.exit(1);
}

const FAMILY = registered.name;

const tripleRule = (): Node => ({
  type: "container",
  style: { display: "flex", flexDirection: "column", gap: 1, width: "100%" },
  children: [
    { type: "container", style: { height: 1, background: PALETTE.ruleStrong } },
    { type: "container", style: { height: 1, background: PALETTE.rule } },
    { type: "container", style: { height: 1, background: PALETTE.ruleFaint } },
  ],
});

const frame = (children: Node[]): Node => ({
  type: "container",
  style: {
    width: "100%",
    height: "100%",
    display: "flex",
    position: "relative",
    boxSizing: "border-box",
    backgroundColor: PALETTE.sheet,
    border: `1px solid ${PALETTE.rule}`,
  },
  children,
});

const channels = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const mix = (from: string, to: string, t: number): string => {
  const [ar, ag, ab] = channels(from);
  const [br, bg, bb] = channels(to);
  const channel = (x: number, y: number): string =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`;
};

const WORD = [..."lem.my"];

const ELEMENTS = sigilStars.length + WORD.length;

const glow = (index: number, head: number, count: number, span: number): number => {
  const raw = Math.abs(index - head);
  const distance = Math.min(raw, count - raw);
  return Math.max(0, 1 - distance / span);
};

const starFills = (head: number | null, count: number, span: number): string[] =>
  sigilStars.map((_, i) =>
    head === null ? PALETTE.accent : mix(PALETTE.accent, PALETTE.glow, glow(i, head, count, span)),
  );

const charNodes = (head: number | null): Node[] =>
  WORD.map((char, i) => ({
    type: "text",
    text: char,
    style: {
      fontFamily: FAMILY,
      fontSize: WORD_SIZE,
      letterSpacing: "-0.03em",
      color:
        head === null
          ? PALETTE.fg
          : mix(PALETTE.fg, PALETTE.glow, glow(sigilStars.length + i, head, ELEMENTS, 2.2)),
    },
  }));

const wide = (head: number | null): Node =>
  frame([
    {
      type: "container",
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      },
      children: [
        {
          type: "image",
          src: sigilUrl(starFills(head, ELEMENTS, 2.2)),
          width: SIGIL_WIDE,
          height: SIGIL_WIDE,
        },
        {
          type: "container",
          style: { display: "flex", alignItems: "center" },
          children: charNodes(head),
        },
      ],
    },
    {
      type: "container",
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        top: RULE_TOP,
        display: "flex",
      },
      children: [tripleRule()],
    },
  ]);

const square = (head: number | null): Node =>
  frame([
    {
      type: "container",
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      children: [
        {
          type: "image",
          src: sigilUrl(starFills(head, sigilStars.length, 1.2)),
          width: SIGIL_SQUARE,
          height: SIGIL_SQUARE,
        },
      ],
    },
  ]);

const FRAME_MS = 1000 / FPS;

const beat = (node: Node, frames: number): { node: Node; durationMs: number } => ({
  node,
  durationMs: frames * FRAME_MS,
});

const scenes: { node: Node; durationMs: number }[] = Array.from({ length: WAVE_FRAMES }, (_, f) =>
  beat(wide((f / WAVE_FRAMES) * ELEMENTS), 1),
);

const squareScenes: { node: Node; durationMs: number }[] = Array.from(
  { length: WAVE_FRAMES },
  (_, f) => beat(square((f / WAVE_FRAMES) * sigilStars.length), 1),
);

const animate = (
  scenes: { node: Node; durationMs: number }[],
  size: { width: number; height: number },
  format: "webp" | "gif",
): Promise<Buffer> => renderer.renderAnimation({ scenes, ...size, format, fps: FPS });

const outputs: Record<string, Buffer> = {
  "badge.png": await renderer.render(wide(null), { ...WIDE, format: "png" }),
  "badge-31.png": await renderer.render(square(null), { ...SQUARE, format: "png" }),
  "badge.webp": await animate(scenes, WIDE, "webp"),
  "badge-31.webp": await animate(squareScenes, SQUARE, "webp"),
  "badge.gif": await animate(scenes, WIDE, "gif"),
  "badge-31.gif": await animate(squareScenes, SQUARE, "gif"),
};

await mkdir(resolve(ROOT, "public"), { recursive: true });

for (const [file, buf] of Object.entries(outputs)) {
  await writeFile(resolve(ROOT, "public", file), buf);
}

const loopMs = scenes.reduce((total, scene) => total + scene.durationMs, 0);
const frames = (list: { durationMs: number }[]): number =>
  Math.round(list.reduce((total, scene) => total + scene.durationMs, 0) / FRAME_MS);

const report = (size: string): string =>
  `${size}: ${outputs[`badge${size === "wide" ? "" : "-31"}.png`]!.length} B still, ` +
  `${outputs[`badge${size === "wide" ? "" : "-31"}.webp`]!.length} B webp, ` +
  `${outputs[`badge${size === "wide" ? "" : "-31"}.gif`]!.length} B gif`;

console.log(
  `[gen:badges] ${source === faceUrl(FACES.family, FACES.weight) ? "fetched" : "local"} ${FAMILY} ` +
    `(${source}) → public/badge* · ${report("wide")} · ${report("31")} · ` +
    `${frames(scenes)} and ${frames(squareScenes)} frames over ` +
    `${(loopMs / 1000).toFixed(2)}s and ` +
    `${(squareScenes.reduce((t, s) => t + s.durationMs, 0) / 1000).toFixed(2)}s at ${FPS}fps`,
);
