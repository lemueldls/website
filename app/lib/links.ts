export function isExternalHref(href?: string | null): boolean {
  if (!href) return false;

  if (href.startsWith("//")) return true;
  if (href.startsWith("/") || href.startsWith("#")) return false;

  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(href)?.[1]?.toLowerCase();

  return scheme === "http" || scheme === "https";
}

export function newTabAttrs(blank: boolean): { target?: string; rel?: string } {
  if (!blank) return {};

  return { target: "_blank", rel: "noopener noreferrer" };
}
