import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Font, FontMetrics, FontsMeta } from "../shared/assets";

const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL ?? "https://assets.lemueldls.dev";
const OUT = resolve(import.meta.dirname, "../app/assets/fonts.meta.json");

const MAX_FACE_BYTES = 8 * 1024 * 1024;

const FAMILY_NAMES: Record<string, string> = {
  AsterismText: "Asterism Text",
  AsterismSlim: "Asterism Slim",
  AsterismCode: "Asterism Code",
  AsterismTerm: "Asterism Term",
  IosevkaBook: "Asterism Text",
  IosevkaSlim: "Asterism Slim",
  IosevkaCode: "Asterism Code",
  IosevkaTerm: "Asterism Term",

  Sarasa: "Asterism Ruby",
};

function buildRank(face: Face): number {
  const stem = face.path.split("/").pop()!;
  return stem.startsWith("Asterism") ? 1 : 0;
}

const DEFAULT_ON_TAGS = new Set([
  "abvf",
  "abvs",
  "blwf",
  "blws",
  "calt",
  "ccmp",
  "cjct",
  "clig",
  "curs",
  "half",
  "kern",
  "liga",
  "locl",
  "mark",
  "mkmk",
  "pref",
  "pres",
  "pstf",
  "rclt",
  "rphf",
  "rvrn",
  "vatu",
]);

const STYLE_WEIGHTS: Record<string, number> = {
  Thin: 100,
  ExtraLight: 200,
  Light: 300,
  Regular: 400,
  Book: 450,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
  ExtraBold: 800,
  Heavy: 900,
  Black: 950,
};

interface Face {
  path: string;
  family: string;

  patch: string;
  weight: number;
  italic: boolean;
  format: "woff2" | "truetype";
}

interface TableDirectory {
  [tag: string]: { offset: number; length: number };
}

async function fetchRange(url: string, start: number, end: number): Promise<Buffer> {
  const res = await fetch(url, { headers: { range: `bytes=${start}-${end}` } });
  if (!res.ok && res.status !== 206) {
    throw new Error(`range request failed with ${res.status} for ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function faceFile(url: string) {
  const probe = await fetch(url, { headers: { range: "bytes=0-0" } });
  const range = probe.headers.get("content-range");
  await probe.arrayBuffer();
  const bytes = range ? Number(range.split("/")[1]) : Number.NaN;
  if (!Number.isFinite(bytes)) return undefined;

  const read = async (tag: string, need: number): Promise<Buffer | undefined> => {
    const record = directory[tag];
    if (!record) return undefined;
    return fetchRange(url, record.offset, Math.min(record.offset + need - 1, bytes - 1));
  };

  const header = await fetchRange(url, 0, 511);
  if (header.toString("latin1", 0, 4) === "ttcf") return { bytes, collection: true } as const;

  const numTables = header.readUInt16BE(4);
  const directory: TableDirectory = {};
  for (let i = 0; i < numTables; i++) {
    const record = 12 + i * 16;
    directory[header.toString("latin1", record, record + 4).trim()] = {
      offset: header.readUInt32BE(record + 8),
      length: header.readUInt32BE(record + 12),
    };
  }

  return { bytes, collection: false, directory, read } as const;
}

async function readCmap(url: string, directory: TableDirectory): Promise<Map<number, number>> {
  const record = directory.cmap;
  if (!record) return new Map();
  const table = await fetchRange(url, record.offset, record.offset + record.length - 1);

  const numTables = table.readUInt16BE(2);
  let best: { offset: number; score: number } | undefined;
  for (let i = 0; i < numTables; i++) {
    const entry = 4 + i * 8;
    const platform = table.readUInt16BE(entry);
    const encoding = table.readUInt16BE(entry + 2);
    const score =
      platform === 3 && (encoding === 10 || encoding === 1) ? 3 : platform === 0 ? 2 : 1;
    if (!best || score > best.score) {
      best = { offset: table.readUInt32BE(entry + 4), score };
    }
  }
  if (!best) return new Map();

  const map = new Map<number, number>();
  const sub = best.offset;
  const format = table.readUInt16BE(sub);

  if (format === 4) {
    const segCountX2 = table.readUInt16BE(sub + 6);
    const segCount = segCountX2 / 2;
    const endCodes = sub + 14;
    const startCodes = endCodes + segCountX2 + 2;
    const idDeltas = startCodes + segCountX2;
    const idRangeOffsets = idDeltas + segCountX2;
    for (let s = 0; s < segCount; s++) {
      const end = table.readUInt16BE(endCodes + s * 2);
      const start = table.readUInt16BE(startCodes + s * 2);
      const delta = table.readInt16BE(idDeltas + s * 2);
      const rangeOffset = table.readUInt16BE(idRangeOffsets + s * 2);
      for (let code = start; code <= end && code !== 0xffff; code++) {
        let glyph: number;
        if (rangeOffset === 0) {
          glyph = (code + delta) & 0xffff;
        } else {
          const at = idRangeOffsets + s * 2 + rangeOffset + (code - start) * 2;
          glyph = table.readUInt16BE(at);
          if (glyph) glyph = (glyph + delta) & 0xffff;
        }
        if (glyph) map.set(code, glyph);
      }
    }
  } else if (format === 12) {
    const groups = table.readUInt32BE(sub + 12);
    for (let g = 0; g < groups; g++) {
      const entry = sub + 16 + g * 12;
      const start = table.readUInt32BE(entry);
      const end = table.readUInt32BE(entry + 4);
      const first = table.readUInt32BE(entry + 8);
      for (let code = start; code <= end; code++) map.set(code, first + (code - start));
    }
  }

  return map;
}

async function readFacts(url: string): Promise<{
  features: string[];
  metrics: FontMetrics;
}> {
  const file = await faceFile(url);
  if (!file || file.collection) return { features: [], metrics: emptyMetrics() };

  const { read, directory } = file;

  const head = await read("head", 54);
  const hhea = await read("hhea", 36);
  const maxp = await read("maxp", 6);

  const unitsPerEm = head?.readUInt16BE(18) ?? 1000;
  const ascender = hhea?.readInt16BE(4) ?? 0;
  const descender = hhea?.readInt16BE(6) ?? 0;
  const glyphs = maxp?.readUInt16BE(4) ?? 0;

  let xHeight: number | undefined;
  let capHeight: number | undefined;
  const os2 = await read("OS/2", 4);
  if (os2 && os2.readUInt16BE(0) >= 2) {
    const vertical = await read("OS/2", 90);
    if (vertical && vertical.length >= 90) {
      xHeight = vertical.readInt16BE(86);
      capHeight = vertical.readInt16BE(88);
    }
  }

  const numberOfHMetrics = hhea?.readUInt16BE(34) ?? 0;
  const hmtx = numberOfHMetrics > 0 ? await read("hmtx", numberOfHMetrics * 4) : undefined;
  let measure: number | undefined;
  let spacing: FontMetrics["spacing"];
  if (hmtx) {
    const advanceOf = (glyph: number) => {
      const at = (glyph < numberOfHMetrics ? glyph : numberOfHMetrics - 1) * 4;
      return hmtx.readUInt16BE(at);
    };

    const cmap = await readCmap(url, directory);
    const probes = ["i", "n", "W", "0"]
      .map((ch) => cmap.get(ch.codePointAt(0)!))
      .filter((glyph): glyph is number => glyph !== undefined);

    const advances = new Set(probes.map(advanceOf));
    if (advances.size === 1) spacing = "monospaced";
    else if (advances.size > 1) spacing = "proportional";

    const n = cmap.get(0x6e);
    if (n !== undefined) measure = Number((advanceOf(n) / unitsPerEm).toFixed(3));
  }

  const metrics: FontMetrics = {
    unitsPerEm,
    glyphs,
    ascender,
    descender,
    ...(xHeight !== undefined ? { xHeight } : {}),
    ...(capHeight !== undefined ? { capHeight } : {}),
    ...(measure !== undefined ? { measure } : {}),
    ...(spacing !== undefined ? { spacing } : {}),
  };

  const features: string[] = [];
  const gsub = directory.GSUB;
  if (gsub?.length) {
    const table = await fetchRange(url, gsub.offset, gsub.offset + gsub.length - 1);

    const featureList = table.readUInt16BE(6);
    const count = table.readUInt16BE(featureList);
    for (let i = 0; i < count; i++) {
      const record = featureList + 2 + i * 6;
      const tag = table.toString("latin1", record, record + 4).trim();
      if (tag && !DEFAULT_ON_TAGS.has(tag)) features.push(tag);
    }
  }

  return { features, metrics };
}

function emptyMetrics(): FontMetrics {
  return { unitsPerEm: 0, glyphs: 0, ascender: 0, descender: 0 };
}

function parseFace(path: string): Face | undefined {
  const file = path.split("/").pop()!;
  const extension = file.slice(file.lastIndexOf(".")).toLowerCase();
  const format = extension === ".woff2" ? "woff2" : "truetype";

  const stem = file.slice(0, -extension.length);
  const cut = stem.lastIndexOf("-");
  let key = cut === -1 ? stem : stem.slice(0, cut);
  const styleWord = cut === -1 ? "Regular" : stem.slice(cut + 1);

  const italic = styleWord.endsWith("Italic");
  const base = italic ? styleWord.slice(0, -6) || "Regular" : styleWord;
  const weight = STYLE_WEIGHTS[base];
  if (!weight) return undefined;

  let patch = "base";
  if (key.endsWith("NerdFont")) {
    patch = "Nerd Fonts";
    key = key.slice(0, -8);
  }

  const family =
    FAMILY_NAMES[key] ??
    key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim();

  return { path, family, patch, weight, italic, format };
}

function toFont(
  face: Face,
  bytes: number,
  facts: { features: string[]; metrics: FontMetrics },
): Font {
  return {
    name: face.family,
    src: [
      {
        url: `${ASSETS_BASE_URL}/${face.path}`,
        format: face.format,
      },
    ],
    format: face.format,
    weight: face.weight,
    ...(face.italic ? { style: "italic" as const } : {}),
    patch: face.patch,
    features: facts.features,
    metrics: facts.metrics,
    bytes,
  };
}

const index = (await (await fetch(`${ASSETS_BASE_URL}/index.json`)).json()) as unknown;

if (!Array.isArray(index) || index.some((entry) => typeof entry !== "string")) {
  console.error(`[gen:fonts] ${ASSETS_BASE_URL}/index.json is not a list of paths.`);
  process.exit(1);
}

const paths = index as string[];

const published = paths
  .filter((path) => path.startsWith("fonts/") && /\.(woff2|ttf|ttc)$/i.test(path))
  .map(parseFace)
  .filter((face): face is Face => Boolean(face));

const skipped: string[] = [];

const chosen = new Map<string, Face>();
for (const face of published) {
  if (face.format === "truetype" && face.path.endsWith(".ttc")) {
    skipped.push(`${face.path} — a collection, not a web build`);
    continue;
  }
  const key = `${face.family}|${face.patch}|${face.weight}|${face.italic}`;
  const existing = chosen.get(key);
  if (
    !existing ||
    buildRank(face) > buildRank(existing) ||
    (buildRank(face) === buildRank(existing) &&
      existing.format === "truetype" &&
      face.format === "woff2")
  ) {
    chosen.set(key, face);
  }
}

const faces: { face: Face; bytes: number }[] = [];
for (const face of [...chosen.values()].sort(
  (a, b) =>
    a.family.localeCompare(b.family) ||
    a.patch.localeCompare(b.patch) ||
    a.weight - b.weight ||
    Number(a.italic) - Number(b.italic),
)) {
  const bytes = await contentLengthOf(`${ASSETS_BASE_URL}/${face.path}`);
  if (bytes === undefined) {
    skipped.push(`${face.path} — unreachable`);
    continue;
  }
  if (bytes > MAX_FACE_BYTES) {
    skipped.push(`${face.path} — ${(bytes / 1024 / 1024).toFixed(1)} MB`);
    continue;
  }
  faces.push({ face, bytes });
}

async function contentLengthOf(url: string): Promise<number | undefined> {
  try {
    const file = await faceFile(url);
    return file && !file.collection ? file.bytes : undefined;
  } catch {
    return undefined;
  }
}

const familyFacts = new Map<string, { features: string[]; metrics: FontMetrics }>();
for (const key of [...new Set(faces.map((f) => `${f.face.family}|${f.face.patch}`))].sort((a, b) =>
  a.localeCompare(b),
)) {
  const [family, patch] = key.split("|");
  const probe = published
    .filter(
      (p) =>
        p.family === family &&
        p.patch === patch &&
        !p.italic &&
        p.format === "truetype" &&
        !p.path.endsWith(".ttc"),
    )
    .sort((a, b) => a.weight - b.weight)[0];
  familyFacts.set(
    key,
    probe
      ? await readFacts(`${ASSETS_BASE_URL}/${probe.path}`)
      : { features: [], metrics: emptyMetrics() },
  );
}

const meta: FontsMeta = {};
for (const { face, bytes } of faces) {
  const facts = familyFacts.get(`${face.family}|${face.patch}`) ?? {
    features: [],
    metrics: emptyMetrics(),
  };
  (meta[face.family] ??= []).push(toFont(face, bytes, facts));
}

await mkdir(resolve(import.meta.dirname, "../app/assets"), { recursive: true });
await writeFile(OUT, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

const publishedBytes = faces.reduce((sum, { bytes }) => sum + bytes, 0);
const families = Object.keys(meta);
console.log(
  `[gen:fonts] ${families.length} families, ${faces.length} faces, ` +
    `${(publishedBytes / 1024 / 1024).toFixed(1)} MB → app/assets/fonts.meta.json`,
);
for (const family of families) {
  const list = meta[family]!;
  const patches = [...new Set(list.map((f) => f.patch ?? "base"))];
  const facts = list[0]?.metrics;
  const features = list[0]?.features ?? [];
  const spacing = facts?.spacing ?? "?";
  console.log(
    `  ${family.padEnd(18)} ${String(list.length).padStart(2)} faces  ` +
      `${spacing.padEnd(12)} n ${facts?.measure ?? "?"}em  ` +
      `${String(facts?.glyphs ?? 0).padStart(5)} glyphs  ` +
      `${features.length} features  [${patches.join(", ")}]`,
  );
}
if (skipped.length > 0) {
  console.log(
    `[gen:fonts] skipped ${skipped.length} published path${skipped.length === 1 ? "" : "s"}:`,
  );
  for (const line of new Set(skipped)) console.log(`  ${line}`);
}
