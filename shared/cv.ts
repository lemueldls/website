export type CvSectionKey =
  | "summary"
  | "education"
  | "courses"
  | "qualifications"
  | "experience"
  | "research"
  | "projects"
  | "affiliations"
  | "talks"
  | "keywords";

export interface CvQualificationVisibility {
  technical: boolean;
  linguistic: boolean;
  leadership: boolean;
}

export type CvFont = "besley" | "besley-narrow" | "text" | "mono";

export type CvEntrySource =
  | "education"
  | "experience"
  | "research"
  | "projects"
  | "affiliations"
  | "talks";

export interface CvSubsectionDefinition {
  key: string;
  label: string;
  hint: string;
  printDefault: boolean;
}

export interface CvSectionDefinition {
  key: CvSectionKey;
  label: string;
  link?: { href: string; text: string };
  hint: string;
  printDefault: boolean;
  subsections?: CvSubsectionDefinition[];
  entries?: CvEntrySource;
  printOnly?: boolean;
  requiresSplitResearch?: boolean;
}

export const CV_SECTIONS: readonly CvSectionDefinition[] = [
  {
    key: "summary",
    label: "Summary",
    hint: "The standfirst under the name // good on a screen, redundant on a page.",
    printDefault: false,
  },
  {
    key: "education",
    label: "Education",
    hint: "Schools and degrees.",
    printDefault: true,
    entries: "education",
  },
  {
    key: "courses",
    label: "Relevant courses",
    hint: "The course list under education.",
    printDefault: false,
  },
  {
    key: "qualifications",
    label: "Qualifications",
    hint: "Technical skills, languages, and leadership.",
    printDefault: false,
    subsections: [
      {
        key: "technical",
        label: "Technical skills",
        hint: "Languages, frameworks, infrastructure.",
        printDefault: true,
      },
      {
        key: "linguistic",
        label: "Linguistic proficiencies",
        hint: "Spoken and written languages.",
        printDefault: false,
      },
      {
        key: "leadership",
        label: "Leadership qualities",
        hint: "Community, hosting, open source.",
        printDefault: false,
      },
    ],
  },
  {
    key: "experience",
    label: "Experience",
    link: { href: "https://lem.my/cv#experience", text: "lem.my/cv" },
    hint: "Roles, and what each one shipped.",
    printDefault: true,
    entries: "experience",
  },
  {
    key: "research",
    label: "Research",
    hint: "Research roles and projects, split out of experience and projects.",
    printDefault: true,
    entries: "research",
    requiresSplitResearch: true,
  },
  {
    key: "projects",
    label: "Projects",
    link: { href: "https://lem.my/projects", text: "lem.my/projects" },
    hint: "Everything built under a personal name.",
    printDefault: true,
    entries: "projects",
  },
  {
    key: "affiliations",
    label: "Affiliations",
    hint: "Clubs, communities, and organizing.",
    printDefault: true,
    entries: "affiliations",
  },
  {
    key: "talks",
    label: "Talks",
    hint: "Presentations and invited talks.",
    printDefault: false,
    entries: "talks",
  },
  {
    key: "keywords",
    label: "Keywords",
    hint: "The keyword footer a parser scans and a reader skips.",
    printDefault: false,
    printOnly: true,
  },
];

export const CV_FONTS: readonly { label: string; value: CvFont }[] = [
  { label: "Besley", value: "besley" },
  { label: "Besley condensed", value: "besley-narrow" },
  { label: "Asterism Text", value: "text" },
  { label: "Asterism Code", value: "mono" },
];

const STATIC_KEYS = new Map<string, boolean>(
  CV_SECTIONS.flatMap((section) => [
    [section.key, section.printDefault] as const,
    ...(section.subsections ?? []).map(
      (sub) => [`${section.key}:${sub.key}`, sub.printDefault] as const,
    ),
  ]),
);

export function cvEntryKey(section: CvSectionKey, slug: string): string {
  return `${section}:${slug}`;
}

const SECTIONS_WITH_ENTRIES = new Set<CvSectionKey>(
  CV_SECTIONS.filter((section) => section.entries).map((section) => section.key),
);

function isEntryKey(key: string): boolean {
  const at = key.indexOf(":");
  if (at === -1) return false;

  const section = key.slice(0, at);
  return SECTIONS_WITH_ENTRIES.has(section as CvSectionKey) && !STATIC_KEYS.has(key);
}

function isKnownKey(key: string): boolean {
  return STATIC_KEYS.has(key) || isEntryKey(key);
}

export interface CvOptions {
  preset: string;
  font: CvFont;
  mergeResearch: boolean;
  showTech: boolean;
  hideDescriptions: boolean;
  qualifications: CvQualificationVisibility;
  off: string[];
}

export const CV_DEFAULT_OPTIONS: CvOptions = {
  preset: "resume",
  font: "besley",
  mergeResearch: true,
  showTech: false,
  hideDescriptions: true,
  qualifications: {
    technical: false,
    linguistic: false,
    leadership: false,
  },
  off: [],
};

const OFF_LIMIT = 96;

function parseList(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseBool(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return fallback;
}

export function parseCvOptions(
  query: Record<string, unknown>,
  defaults: Pick<
    CvOptions,
    "mergeResearch" | "showTech" | "hideDescriptions" | "qualifications"
  > = CV_DEFAULT_OPTIONS,
): CvOptions {
  return {
    preset:
      typeof query.p === "string" && /^[\w-]+$/.test(query.p) ? query.p : CV_DEFAULT_OPTIONS.preset,

    font: CV_FONTS.some((f) => f.value === query.f) ? (query.f as CvFont) : CV_DEFAULT_OPTIONS.font,

    mergeResearch: parseBool(query.m, defaults.mergeResearch),
    showTech: parseBool(query.t, defaults.showTech),
    hideDescriptions: parseBool(query.hd, defaults.hideDescriptions),
    qualifications: defaults.qualifications,

    off: [...new Set(parseList(query.off))].filter(isKnownKey).slice(0, OFF_LIMIT),
  };
}

export function serializeCvOptions(options: CvOptions): Record<string, string> {
  const query: Record<string, string> = {};

  if (options.preset !== CV_DEFAULT_OPTIONS.preset) query.p = options.preset;
  if (options.font !== CV_DEFAULT_OPTIONS.font) query.f = options.font;
  if (options.mergeResearch !== CV_DEFAULT_OPTIONS.mergeResearch) query.m = "1";
  if (options.showTech !== CV_DEFAULT_OPTIONS.showTech) query.t = "1";
  if (options.hideDescriptions !== CV_DEFAULT_OPTIONS.hideDescriptions) query.hd = "1";
  if (options.off.length > 0) query.off = options.off.join(",");

  return query;
}

export function isCvKeyOn(options: CvOptions, key: string): boolean {
  if (!isKnownKey(key)) return false;
  if (options.off.includes(key)) return false;

  if (key === "qualifications") return Object.values(options.qualifications).some(Boolean);

  const at = key.indexOf(":");
  if (at !== -1 && !isCvKeyOn(options, key.slice(0, at))) return false;

  if (key.startsWith("qualifications:")) {
    const qualification = key.slice("qualifications:".length) as keyof CvQualificationVisibility;
    return options.qualifications[qualification] ?? false;
  }

  return STATIC_KEYS.get(key) ?? true;
}

export function toggleCvKey(options: CvOptions, key: string): void {
  if (!isKnownKey(key)) return;

  if (isCvKeyOn(options, key)) {
    options.off = [...options.off.filter((entry) => !entry.startsWith(`${key}:`)), key];
    return;
  }

  options.off = options.off.filter((entry) => entry !== key && !entry.startsWith(`${key}:`));
}
