export const ASSETS_BASE_URL = "https://assets.lemueldls.dev";

export type WallpaperVariant = "base" | "light" | "dark";

export interface FontMetrics {
  unitsPerEm: number;
  glyphs: number;
  ascender: number;
  descender: number;

  xHeight?: number;
  capHeight?: number;

  measure?: number;

  spacing?: "monospaced" | "proportional";
}

export interface Font {
  name: string;
  src: { url: string; format: string }[];
  format: "woff2" | "truetype";
  weight: number;
  style?: "normal" | "italic";

  patch: string;

  features: string[];
  metrics: FontMetrics;

  bytes: number;
}

export interface WallpaperMeta {
  file: string;
  width: number;
  height: number;
  bytes: number;

  palette: string[];

  accent: string;

  accentPaper: string;

  tags: string[];
}

export type WallpapersMeta = Record<string, WallpaperMeta>;
export type FontsMeta = Record<string, Font[]>;

export function fontUrl(path: string): string {
  return new URL(path, `${ASSETS_BASE_URL}/`).toString();
}

function variantSegment(variant: WallpaperVariant): string {
  return variant === "base" ? "" : `${variant}/`;
}

export function wallpaperUrl(file: string, variant: WallpaperVariant = "base"): string {
  return `${ASSETS_BASE_URL}/wallpapers/${variantSegment(variant)}${file}`;
}

const RESIZE_URL = `${ASSETS_BASE_URL}/cdn-cgi/image`;

export const TILE_WIDTHS = [320, 640, 960] as const;
export const HERO_WIDTHS = [640, 1024] as const;
export const VIEW_WIDTHS = [1280, 1920] as const;

export const TILE_QUALITY = 72;
export const HERO_QUALITY = 76;
export const VIEW_QUALITY = 80;

export interface DerivativeOptions {
  quality?: number;
}

export function wallpaperThumbUrl(
  file: string,
  variant: WallpaperVariant = "base",
  width: number,
  { quality = TILE_QUALITY }: DerivativeOptions = {},
): string {
  return (
    `${RESIZE_URL}/width=${width},quality=${quality},fit=scale-down,format=auto` +
    `/wallpapers/${variantSegment(variant)}${file}`
  );
}

export function wallpaperSrcSet(
  file: string,
  variant: WallpaperVariant = "base",
  widths: readonly number[] = TILE_WIDTHS,
  { quality = TILE_QUALITY }: DerivativeOptions = {},
): string {
  return widths
    .map((width) => `${wallpaperThumbUrl(file, variant, width, { quality })} ${width}w`)
    .join(", ");
}

export function aspect(w: WallpaperMeta): number {
  if (!w.height) return 1;
  return w.width / w.height;
}

export function wallpaperPlaceholder(w: WallpaperMeta): string {
  const [a, b, c] = w.palette;
  if (!a) return "var(--c-code)";
  if (!b) return a;
  if (!c) return `linear-gradient(180deg, ${a} 0%, ${b} 100%)`;
  return `linear-gradient(180deg, ${a} 0%, ${b} 45%, ${c} 100%)`;
}

export function resolutionLabel(w: WallpaperMeta): string {
  return `${w.width}×${w.height}`;
}

export function byteLabel(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}
