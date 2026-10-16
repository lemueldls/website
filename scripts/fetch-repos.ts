import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ABOUT = resolve(ROOT, "app/composables/about.ts");
const OUT = resolve(ROOT, "app/assets/repos.meta.json");
const CHECK = process.argv.includes("--check");

const TOKEN = process.env.GITHUB_TOKEN ?? process.env.NUXT_GITHUB_TOKEN ?? "";

const HREF_RE = /https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/g;

const source = await readFile(ABOUT, "utf8");
const repos = new Set<string>();

for (const match of source.matchAll(HREF_RE)) {
  repos.add(`${match[1]}/${match[2]}`);
}

if (repos.size === 0) throw new Error("no github.com/<owner>/<repo> links found in about.ts");

const entries = [...repos].sort();
const manifest: Record<string, { pushedAt: string; archived: boolean }> = {};

for (const slug of entries) {
  const res = await fetch(`https://api.github.com/repos/${slug}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "lemueldls/website",
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`${slug} → ${res.status} ${res.statusText}`);

  const data = (await res.json()) as { pushed_at?: unknown; archived?: unknown };

  if (typeof data.pushed_at !== "string") throw new Error(`${slug}: no pushed_at`);

  manifest[slug] = { pushedAt: data.pushed_at, archived: Boolean(data.archived) };
}

const body = `${JSON.stringify(manifest, null, 2)}\n`;
const current = await readFile(OUT, "utf8").catch(() => "");

if (current === body) {
  console.log(`[fetch:repos] repos.meta.json unchanged // ${entries.length} repos`);
  process.exit(0);
}

if (CHECK) {
  console.error("[fetch:repos] repos.meta.json is out of date // run `pnpm fetch:repos`");
  process.exit(1);
}

await mkdir(resolve(ROOT, "app/assets"), { recursive: true });
await writeFile(OUT, body, "utf8");
console.log(`[fetch:repos] wrote repos.meta.json // ${entries.length} repos`);
