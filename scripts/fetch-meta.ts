import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL ?? "https://assets.lemueldls.dev";
const OUT_DIR = resolve(import.meta.dirname, "../app/assets");
const CHECK = process.argv.includes("--check");

const EXPECTED = {
  "fonts.meta.json": (index: unknown) => {
    const { families, archives } = index as {
      families?: Record<string, unknown[]>;
      archives?: Record<string, unknown[]>;
    };
    if (!families || !archives) throw new Error("expected { families, archives }");

    const names = Object.keys(families);
    if (names.length === 0) throw new Error("no families");

    for (const family of names) {
      const faces = families[family]!;
      if (faces.length === 0) throw new Error(`${family}: no faces`);
      for (const face of faces as Record<string, unknown>[]) {
        for (const field of ["patch", "features", "metrics", "bytes", "weight"]) {
          if (face[field] === undefined) {
            throw new Error(`${family}: a face is missing ${field}`);
          }
        }
      }
    }

    for (const [family, entries] of Object.entries(archives)) {
      if (!families[family]) throw new Error(`${family}: archives for an unknown family`);
      for (const entry of entries as Record<string, unknown>[]) {
        for (const field of ["format", "bytes", "patch"]) {
          if (entry[field] === undefined) {
            throw new Error(`${family}: an archive is missing ${field}`);
          }
        }
      }
    }

    return names;
  },
  "walls.meta.json": (meta: unknown) => {
    const walls = meta as Record<string, Record<string, unknown>>;
    const entries = Object.keys(walls);
    if (entries.length === 0) throw new Error("no wallpapers");

    for (const [file, entry] of Object.entries(walls)) {
      for (const field of ["palette", "accent", "accentLight", "hue"]) {
        if (entry[field] === undefined) {
          const hint =
            field === "accentLight" ? " (is the origin still calling it accentPaper?)" : "";
          throw new Error(`${file}: missing ${field}${hint}`);
        }
      }

      if (typeof entry.hue !== "string" || entry.hue.length === 0) {
        throw new Error(`${file}: hue is not a family name`);
      }
    }

    return entries;
  },
} as const;

async function fetchManifest(file: string): Promise<string> {
  const url = `${ASSETS_BASE_URL}/${file}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

let drift = false;

for (const [file, validate] of Object.entries(EXPECTED)) {
  const body = await fetchManifest(file);

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch (error) {
    throw new Error(`${file} is not JSON: ${(error as Error).message}`);
  }

  const summary = validate(parsed);
  const path = resolve(OUT_DIR, file);
  const current = await readFile(path, "utf8").catch(() => "");

  if (current === body) {
    console.log(`[fetch:meta] ${file} unchanged // ${summary.length} entries`);
    continue;
  }

  drift = true;
  if (CHECK) {
    console.log(`[fetch:meta] ${file} has drifted (${summary.length} entries on the origin)`);
    continue;
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path, body, "utf8");
  console.log(`[fetch:meta] wrote ${file} // ${summary.length} entries`);
}

if (CHECK && drift) {
  console.error("[fetch:meta] manifests are out of date // run `pnpm fetch:meta`");
  process.exit(1);
}
