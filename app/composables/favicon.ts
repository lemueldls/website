import { SIGIL_PATH, SIGIL_TRANSFORM, SIGIL_VIEWBOX } from "~/lib/sigil";

const NEUTRAL_ICON = "/icon.svg";

const SIZE = 24;

export function useFaviconHref(): ComputedRef<string> {
  const { accent } = useWallpaper();

  return computed(() => (accent.value ? sigilIcon(accent.value) : NEUTRAL_ICON));
}

function sigilIcon(fill: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SIGIL_VIEWBOX}"` +
    ` width="${SIZE}" height="${SIZE}">` +
    `<g fill="${fill}"><path d="${SIGIL_PATH}" transform="${SIGIL_TRANSFORM}"/></g>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
