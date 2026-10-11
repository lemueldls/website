export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function splitExtension(path: string): [string, string] {
  const file = path.split("/").pop() ?? "";
  const dot = file.lastIndexOf(".");
  if (dot <= 0) return [file, ""];
  return [file.slice(0, dot), file.slice(dot + 1)];
}

export function humanize(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
