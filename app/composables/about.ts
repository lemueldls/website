import { computed, toValue } from "vue";
import type { ComputedRef, MaybeRefOrGetter } from "vue";

import type { CvQualificationVisibility } from "#shared/cv";
import type { RepoActivity } from "#shared/github";

import reposMeta from "~/assets/repos.meta.json";

interface Social {
  title: string;
  href: string;
  icon: string;
}

export type RingSlug = "catppuccin" | "nix" | "recurse";

export interface RingLink {
  slug: RingSlug;
  short: string;
  name: string;
  home: string;
  next: string;
  prev: string;
  rand: string;
}

export type BadgeGroup = "tools" | "web" | "found" | "elsewhere";

export interface Badge {
  title: string;
  href?: string;
  src: string;
  group: BadgeGroup;
  note?: string;
}

export interface Education {
  name: string;
  slug: string;
  link: { href: string; text: string };
  description: string;
  status: string;
  from: string;
  to?: string;
  img?: { src: string; alt: string };
  award?: string;
  hidePrint?: boolean;
}

export interface Experience {
  name: string;
  slug: string;
  link?: { href: string; text: string };
  description: string;
  role?: string;
  from: string;
  to?: string;
  img?: { src: string; alt: string };
  contributions: string[];
  technologies: string[];
  research?: boolean;
  hidePrint?: boolean;
}

export type ProjectStatus = "active" | "maintained" | "dormant" | "archived";

export interface Project extends Omit<Experience, "from" | "to"> {
  github: { href: string; text: string };
  tangled?: { href: string; text: string };
  since: string;
  lastActive?: string;
  status?: ProjectStatus;
}

export type ProjectDateParts =
  | { kind: "open"; since: string; lastActive?: string }
  | { kind: "range"; from: string; to: string }
  | { kind: "point"; at: string };

export function projectDateParts(project: Project): ProjectDateParts {
  const { since, lastActive } = project;
  const status = project.status ?? "active";

  if (status === "archived") {
    return lastActive && lastActive !== since
      ? { kind: "range", from: since, to: lastActive }
      : { kind: "point", at: since };
  }

  if (status !== "active" && lastActive && lastActive !== since) {
    return { kind: "open", since, lastActive };
  }

  return { kind: "open", since };
}

export function formatProjectDates(project: Project): string {
  const parts = projectDateParts(project);

  switch (parts.kind) {
    case "range":
      return `${parts.from} to ${parts.to}`;
    case "point":
      return parts.at;
    case "open":
      return `since ${parts.since}${parts.lastActive ? ` // last active ${parts.lastActive}` : ""}`;
  }
}

export const isActiveProject = (project: Pick<Project, "status">): boolean =>
  (project.status ?? "active") === "active";

const OWN_GITHUB_OWNER = "lemueldls";

export function githubSlug(href: string): string | null {
  const match = href.match(/github\.com\/([^/]+)\/([^/]+?)\/?$/);
  return match ? `${match[1]}/${match[2]}` : null;
}

const repoActivity = reposMeta as Record<string, RepoActivity>;

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthYear(iso: string): string {
  return MONTH_YEAR.format(new Date(iso));
}

function monthOrdinal(label: string): number {
  const [month, year] = label.split(" ");
  const index = MONTHS.indexOf(month ?? "");
  return index < 0 ? -1 : Number(year) * 12 + index;
}

function mostRecent(a: string | undefined, b: string | undefined): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return monthOrdinal(b) > monthOrdinal(a) ? b : a;
}

function resolveProject(source: Project): Project {
  const slug = githubSlug(source.github.href);
  const meta = slug ? repoActivity[slug] : undefined;
  const owned = slug?.startsWith(`${OWN_GITHUB_OWNER}/`) ?? false;

  const lastActive =
    owned && meta ? mostRecent(source.lastActive, monthYear(meta.pushedAt)) : source.lastActive;

  return {
    ...source,
    lastActive,
    status: meta?.archived ? "archived" : source.status,
  };
}

const socials: Social[] = [
  { title: "Bluesky", href: "https://bsky.app/profile/lem.my", icon: "griddy-icons:bluesky" },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/lemueldls",
    icon: "griddy-icons:linkedin",
  },
  { title: "GitHub", href: "https://github.com/lemueldls", icon: "griddy-icons:github" },
];

const email: Social = {
  title: "hi@lem.my",
  href: "mailto:hi@lem.my",
  icon: "material-symbols:mail-outline-sharp",
};

const rings: RingLink[] = [
  {
    slug: "catppuccin",
    short: "Catppuccin",
    name: "Catppuccin Webring",
    home: "https://ctp-webr.ing",
    prev: "https://ctp-webr.ing/lem.my/previous",
    next: "https://ctp-webr.ing/lem.my/next",
    rand: "https://ctp-webr.ing/random",
  },
  {
    slug: "nix",
    short: "Nix",
    name: "Nix Webring",
    home: "https://nixwebr.ing",
    prev: "https://nixwebr.ing/prev/lem.my",
    next: "https://nixwebr.ing/next/lem.my",
    rand: "https://nixwebr.ing/rand",
  },
  {
    slug: "recurse",
    short: "Recurse",
    name: "Recurse Webring",
    home: "https://ring.recurse.com",
    prev: "https://ring.recurse.com/prev?id=89",
    next: "https://ring.recurse.com/next?id=89",
    rand: "https://ring.recurse.com/rand",
  },
];

const badges: Badge[] = [
  // tools
  // { title: "7-Zip", href: "https://www.7-zip.org/", src: "/badges/7zip.gif", group: "tools" },
  {
    title: "uBlock Origin",
    href: "https://ublockorigin.com/",
    src: "/badges/ublock-origin.png",
    group: "tools",
  },
  // {
  //   title: "Firefox",
  //   href: "https://www.firefox.com/en-US/",
  //   src: "/badges/firefox.png",
  //   group: "tools",
  // },
  // {
  //   title: "VSCodium",
  //   href: "https://vscodium.com/",
  //   src: "/badges/vscodium.gif",
  //   group: "tools",
  //   note: "made with",
  // },
  // { title: "Jellyfin", href: "https://jellyfin.org/", src: "/badges/jellyfin.gif", group: "tools" },
  {
    title: "qBittorrent",
    href: "https://www.qbittorrent.org/",
    src: "/badges/qbittorrent.png",
    group: "tools",
    note: "don't forget to seed",
  },
  { title: "Astro", href: "https://astro.build/", src: "/badges/astro.png", group: "tools" },
  { title: "GNU/Linux", src: "/badges/linux.gif", group: "tools", note: "made on" },
  // {
  //   title: "Bitwarden",
  //   href: "https://bitwarden.com/",
  //   src: "https://reduxflakes.nekoweb.org/img/1pnLk_fmO--88.webp",
  //   group: "tools",
  // },
  {
    title: "VS Code",
    href: "https://code.visualstudio.com/",
    src: "https://reduxflakes.nekoweb.org/img/mnc2sJ2LeM-88.webp",
    group: "tools",
    note: "made with",
  },

  // the web
  { title: "Got HTML?", src: "/badges/got-html.gif", group: "web" },
  // {
  //   title: "I dream in HTML",
  //   src: "/badges/dream.gif",
  //   group: "web",
  // },
  // {
  //   title: "Viewable with any browser",
  //   src: "/badges/any88x31.gif",
  //   group: "web",
  // },
  {
    title: "Responsive website",
    src: "/badges/responsive.png",
    group: "web",
  },
  { title: "Flexbox", src: "/badges/flexbox.gif", group: "web" },
  { title: "Source missing", src: "/badges/source-missing.gif", group: "web" },
  // {
  //   title: "Tom Scott",
  //   href: "https://www.tomscott.com/",
  //   src: "/badges/tom-scott.webp",
  //   group: "web",
  //   note: "I am in an 88×31 badge",
  // },
  // {
  //   title: "Made for Dark Mode!",
  //   src: "https://reduxflakes.nekoweb.org/img/7aZrZJcDOu-88.jpeg",
  //   group: "web",
  // },
  // {
  //   title: "Mobile Friendly",
  //   src: "https://reduxflakes.nekoweb.org/img/N7o-z86AwS-88.jpeg",
  //   group: "web",
  // },
  {
    title: "Made with CSS Grid",
    src: "https://reduxflakes.nekoweb.org/img/sNgMP5_uUx-88.jpeg",
    group: "web",
  },

  // found
  { title: "I like computer", src: "/badges/computer.jpg", group: "found" },
  // { title: "Homer", src: "/badges/homer.gif", group: "found" },
  // { title: "Windows XP", src: "/badges/windows-xp.gif", group: "found" },
  // { title: "Wii", src: "/badges/wii.gif", group: "found" },
  // { title: "Stardew Valley", src: "/badges/stardew-valley.gif", group: "found" },
  { title: "Nyan Cat", src: "/badges/nyan-cat.gif", group: "found" },
  // { title: "Plastic Love", src: "/badges/plastic-love.gif", group: "found" },
  {
    title: "Hatsune Miku",
    href: "https://ec.crypton.co.jp/pages/prod/virtualsinger/cv01_us",
    src: "/badges/miku.gif",
    group: "found",
  },
  // { title: "Blåhaj", src: "/badges/love-blahaj.gif", group: "found" },
  { title: "Aperture Laboratories", src: "/badges/aperture.jpg", group: "found" },
  // { title: "blends", src: "/badges/blends.gif", group: "found" },
  // {
  //   title: "Trans rights now!",
  //   src: "https://reduxflakes.nekoweb.org/img/aLNEopZsGj-88.jpeg",
  //   group: "found",
  // },
  // {
  //   title: "Bring back the headphone jack",
  //   src: "https://reduxflakes.nekoweb.org/img/IasK7Yn36d-88.jpeg",
  //   group: "found",
  // },
  // {
  //   title: "Don't feed the AI!",
  //   src: "https://reduxflakes.nekoweb.org/img/2eYhf4t8UA-88.webp",
  //   group: "found",
  // },
  {
    title: "Catppuccin",
    href: "https://catppuccin.com/",
    src: "https://reduxflakes.nekoweb.org/img/AJrswBS-HA-88.webp",
    group: "found",
  },
  // {
  //   title: "Bookmark this page!",
  //   src: "https://reduxflakes.nekoweb.org/img/Irdy-mWv3s-88.jpeg",
  //   group: "found",
  // },

  // elsewhere
  {
    title: "trafficlunar",
    href: "https://trafficlunar.net/",
    src: "https://trafficlunar.net/88x31.gif",
    group: "elsewhere",
  },
  {
    title: "melankorin",
    href: "https://melankorin.net/",
    src: "https://melankorin.net/assets/img/buttons/button-1.gif",
    group: "elsewhere",
  },
  {
    title: "dimden",
    href: "https://dimden.dev/",
    src: "https://dimden.dev/services/images/88x31.gif",
    group: "elsewhere",
  },
  { title: "Daudix", href: "https://daudix.one", src: "/badges/daudix.gif", group: "elsewhere" },
  {
    title: "reduc",
    href: "https://reduxflakes.nekoweb.org/",
    src: "/badges/reduxflakes.gif",
    group: "elsewhere",
  },
  // {
  //   title: "ellen's den",
  //   href: "https://ellenthekat.nekoweb.org",
  //   src: "https://ellenthekat.nekoweb.org/Images/oc%20headshot%20style.png",
  //   group: "elsewhere",
  // },
  // {
  //   title: "Neocities",
  //   href: "https://neocities.org/",
  //   src: "https://reduxflakes.nekoweb.org/img/EuAHx5TWy9-88.webp",
  //   group: "elsewhere",
  // },
  // {
  //   title: "Nekoweb",
  //   href: "https://nekoweb.org/",
  //   src: "https://reduxflakes.nekoweb.org/img/wKShg4ul8V-88.webp",
  //   group: "elsewhere",
  // },
  // {
  //   title: "OpenBooks",
  //   href: "https://openbooks.neocities.org",
  //   src: "https://reduxflakes.nekoweb.org/img/AL6DZ4SaiH-88.webp",
  //   group: "elsewhere",
  // },
  // {
  //   title: "nkko",
  //   href: "https://nkko.link/",
  //   src: "https://reduxflakes.nekoweb.org/img/YwRB-p439O-88.webp",
  //   group: "elsewhere",
  // },
  // {
  //   title: "plasma",
  //   href: "https://plasma.nekoweb.org/",
  //   src: "https://reduxflakes.nekoweb.org/img/XtU6IkO_-f-88.webp",
  //   group: "elsewhere",
  // },
  // {
  //   title: "webchnl",
  //   href: "https://webchnl.com/",
  //   src: "https://reduxflakes.nekoweb.org/img/YPQobGjtx7-88.webp",
  //   group: "elsewhere",
  // },
];

const education = [
  {
    name: "The City College of New York",
    slug: "ccny",
    link: { href: "https://www.ccny.cuny.edu/", text: "ccny.cuny.edu" },
    description: "Bachelor of Science in Pure Mathematics, Minor in Computer Science",
    from: "August 2022",
    to: "May 2028",
    status: "Expected",
  },
  {
    name: "Academy for Software Engineering",
    slug: "afse",
    link: { href: "https://www.afsenyc.org/", text: "afsenyc.org" },
    description: "High School Diploma",
    from: "September 2018",
    to: "June 2022",
    status: "Graduated",
    award: "The Computer Science Master Engineer Award",
  },
] as const satisfies Education[];

export type EducationSlug = (typeof education)[number]["slug"];

const relevantCourses = [
  { subjectArea: "CSC", catalogNumber: "10400", title: "Discrete Mathematical Structures" },
  { subjectArea: "CSC", catalogNumber: "21200", title: "Data Structures" },
  { subjectArea: "CSC", catalogNumber: "22000", title: "Algorithms" },
  { subjectArea: "CSC", catalogNumber: "22100", title: "Software Design Laboratory" },
  {
    subjectArea: "CSC",
    catalogNumber: "30400",
    title: "Introduction to Theoretical Computer Science",
  },
  { subjectArea: "MATH", catalogNumber: "32800", title: "Methods of Numerical Analysis" },
  { subjectArea: "CSC", catalogNumber: "33500", title: "Programming Language Paradigms" },
  { subjectArea: "MATH", catalogNumber: "34500", title: "Theory of Numbers" },
  { subjectArea: "MATH", catalogNumber: "34600", title: "Elements of Linear Algebra" },
  { subjectArea: "MATH", catalogNumber: "36500", title: "Elements of Combinatorics" },
  { subjectArea: "CSC", catalogNumber: "42000", title: "Compiler Construction" },
  { subjectArea: "CSC", catalogNumber: "42200", title: "Computability" },
  { subjectArea: "CSC", catalogNumber: "42800", title: "Formal Languages and Automata" },
  { subjectArea: "CSC", catalogNumber: "44600", title: "Mathematical Optimization Techniques" },
  { subjectArea: "CSC", catalogNumber: "48000", title: "Computer Security" },
] as const;

const qualifications = {
  languages: [
    "HTML5",
    "CSS",
    "Sass",
    "JavaScript",
    "TypeScript",
    "Rust",
    // "C",
    "C++",
    "Dart",
    "Python",
    // "Ruby",
    "Haskell",
    // "Rocq",
    // "Kotlin",
    // "Swift",
    // "Go",
    // "Ocaml",
    // "Pyret",
  ],
  tooling: [
    "Git",

    "PostgreSQL",
    "MongoDB",

    "Node.js",
    "Deno",
    "Bun",
    // "Tailwind CSS",
    // "Postman",

    "Vite",
    "Esbuild",
    "Rollup.js",
    "Webpack",
  ],
  frameworks: [
    "Tailwind CSS",
    // "UnoCSS",

    "Vue.js",
    "React",
    "Lit",

    // "Nitrojs",
    "Nuxt",
    "Next.js",
    // "Astro",

    "Electron",
    "Tauri",
    // "Leptos",
    "Ionic",
    // "Apache Cordova",
    "Flutter",

    // "UV",
  ],
  infrastructure: [
    "Linux",
    // "NixOS",
    "Cloudflare",
    // "Cloudflare Pages",
    // "Cloudflare Workers",
    // "Vercel",
    "AWS",
    "Docker",
    // "GitHub Pages",
    "GitHub Actions",
    // "Heroku",
    // "Travis CI",
    // "CircleCI",
    "Supabase",
    "Firebase",
    "Convex",
  ],
} as const;

const flagged = (entry: object, flag: string): boolean =>
  flag in entry && (entry as Record<string, unknown>)[flag] === true;

const isResearchEntry = (entry: object): boolean => flagged(entry, "research");

export { isResearchEntry };

const acmCcny = {
  slug: "acm-ccny",
  name: "Association for Computing Machinery",
  link: { href: "https://ccny.acm.org/", text: "ccny.acm.org" },
  description:
    "ACM @ CCNY is a student-led computer science club and ACM college chapter at the City College of New York.",
  from: "August 2024",
  to: "May 2028",
  contributions: [
    "Board member of the Association for Computing Machinery chapter at the City College of New York.",
    "Developed a workshop creation platform that features a website editor, multiple choice question games, synchronized slides presentations, and personal subdomains for individual students to host on.",
    "Created entire website with a fully integrated admin dashboard used to create and manage club events.",
  ],
  technologies: [
    "CSS",
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Supabase",
    "Convex",
    "Git",
    "Vercel",
  ],
} as const satisfies Experience;

const experiences = [
  {
    name: "Taylor | Graham",
    slug: "taylor-graham",
    link: { href: "https://taylorandgraham.com", text: "taylorandgraham.com" },
    description:
      "Taylor Graham is a fine art gallery with an extensive history in curating artworks since the late 19th century.",
    role: "Full Stack Developer",
    from: "June 2025",
    to: "Present",
    contributions: [
      "Created an entirely new frontend website and backend server focusing on better performance and global accessibility while keeping complete feature parity with the previous website’s forms and page routes.",
      "Engineered automated backend services to enhance customization and manageability for internal staff.",
      "Migrated all artwork and artist information from old CMS using incremental and durable workflows.",
    ],
    technologies: [
      "CSS",
      "TypeScript",
      "React",
      "React Router",
      "Vite",
      "Remix",
      "GraphQL",
      "Shopify",
      "Git",
      "Cloudflare",
    ],
  },
  {
    name: "Pincast",
    slug: "pincast",
    link: { href: "https://pincast.fm", text: "pincast.fm" },
    description: "Pincast is a location-based social platform played out in the real world.",
    role: "Full Stack Developer",
    from: "April 2025",
    to: "August 2025",
    contributions: [
      "Coordinated the design and development of the website and mobile application to ensure a cohesive experience.",
    ],
    technologies: [
      "JavaScript",
      "TypeScript",
      "Vue.js",
      "Nuxt",
      "Mapbox",
      "Capacitor",
      "PostgreSQL",
      "Git",
      "Vercel",
    ],
  },
  {
    name: "UPenn REPL",
    slug: "upenn-repl",
    link: { href: "https://penn-repl.github.io/", text: "penn-repl.github.io" },
    description:
      "UPenn REPL is a research experience in programming languages for undergraduate students pursuing a PhD.",
    role: "Undergraduate Student Researcher",
    from: "May 2024",
    to: "August 2024",
    contributions: [
      "Collaborated with leading researchers to develop new novel methods for property-based testing.",
      "Conducted comprehensive research on advanced topics in practical and theoretical computer science with experts in the field, focusing on innovative type systems and various kinds of lambda calculi.",
      "Created interactive presentations to teach concepts to undergraduates, graduates, and professors.",
    ],
    technologies: [
      "Haskell",
      "Rocq",
      "OCaml",
      "TypeScript",
      "Vue.js",
      "Rust",
      "C++",
      "Python",
      "UnoCSS",
      "Git",
    ],
    research: true,
  },
  {
    name: "Spot Pet Market",
    slug: "spot-pet-market",
    link: { href: "https://spotpetmarket.com/", text: "spotpetmarket.com" },
    description:
      "Spot Pet Market is a marketplace for pets, where users can buy and sell multiple breeds and kinds of pets.",
    role: "Founding Developer",
    from: "June 2023",
    to: "Present",
    contributions: [
      "Aggregated and localized information about multiple breeds and kinds of pets into a unified database.",
      "Created an entire marketplace platform, complete with multiple account types, public listings, private messaging, internal content moderation, and secure financial transactions for buying and selling pets.",
      "Developed an admin and moderation dashboard to manage users, listings, posts, and transactions.",
    ],
    technologies: [
      "TypeScript",
      "Sass",
      "Vue.js",
      "Nuxt",
      "Tailwind CSS",
      "Supabase",
      "Stripe",
      "PWA",
      "Git",
      "Vercel",
    ],
  },
  {
    name: "The Recurse Center",
    slug: "recurse-center",
    link: { href: "https://www.recurse.com/", text: "recurse.com" },
    description:
      "The Recurse Center is a highly selective, self-directed, educational retreat for programmers.",
    role: "Fellow",
    from: "June 2022",
    to: "August 2022",
    contributions: [
      "Focused on improving my technical and speaking skills while supporting a community of developers.",
      "Hosted topics such as end-to-end testing for web applications to teach to industry professionals.",
      "Competitively innovated new domain-specific languages, and procedural compile-time code generation.",
    ],
    technologies: [
      "HTML5",
      "CSS",
      "JavaScript",
      "TypeScript",
      "Rust",
      "Haskell",
      "Ruby",
      "Python",
      "Git",
      "NixOS",
    ],
  },
  {
    name: "Woven by Toyota",
    slug: "woven-toyota",
    link: { href: "https://woven.toyota/en/", text: "woven.toyota" },
    description:
      "Woven by Toyota is an innovative company that builds a platform for mobility and location intelligence.",
    role: "Software Engineering Intern",
    from: "January 2022",
    to: "March 2022",
    contributions: [
      "Developed a fully responsive analytics dashboard featuring interactive maps with corresponding video recordings and error logs that identifies real-world changes and events for autonomous vehicles.",
      "Presented solutions to issues within existing website wireframe diagrams and user interface designs.",
      "Engineered new back-end services to process and manage data for other services and products.",
    ],
    technologies: [
      "HTML5",
      "CSS",
      "JavaScript",
      "Vue.js",
      "Python",
      "Mapbox",
      "PostgreSQL",
      "Git",
      "AWS Lambda",
    ],
  },
] as const satisfies Experience[];

export type ExperienceSlug = (typeof experiences)[number]["slug"];

const projects = [
  {
    name: "Typbase",
    slug: "typbase",
    link: { href: "https://typbase.at", text: "typbase.at" },
    github: { href: "https://github.com/lemueldls/typbase", text: "github.com/lemueldls/typbase" },
    tangled: { href: "https://tangled.org/lem.my/typbase", text: "tangled.org/lem.my/typbase" },
    description:
      "Typbase is a local-first knowledge base made for the Typst language and the Atmosphere protocol.",
    role: "Creator",
    since: "August 2026",
    status: "active",
    contributions: [
      "Designed the workspace as a queryable document model so pages and categories can be read from inside.",
      "Built an inline WYSIWYG editor where compiled output replaces the source as typed with a custom engine.",
      "Extracted editor and engine into a reusable core so any other application can be built on top of it.",
      "Shipped standalone exports to HTML, PDF, SVG, and Typst projects, so pages are portable outside the app.",
    ],
    technologies: [
      "Rust",
      "Typst",
      "WebAssembly",
      "CodeMirror",
      "TypeScript",
      "Nuxt",
      // "Loro",
      // "atproto",
      "SQLite",
      "Tauri",
      // "Harper",
    ],
  },
  {
    name: "Koffi",
    slug: "koffi",
    github: { href: "https://github.com/lemueldls/koffi/", text: "github.com/lemueldls/koffi" },
    description:
      "Koffi is a novel cross-platform framework and integrated ecosystem for Rust × Kotlin Multiplatform projects.",
    role: "Creator",
    since: "May 2026",
    status: "active",
    contributions: [
      "Created an FFI bindings generator for Rust/Kotlin interoperability across JVM (FFM/JNI) and native targets.",
      "Invented a static metadata extraction engine that embeds type/function descriptors into compiled binaries using link-time reflection, generating C interop definitions and Kotlin wrappers without manual header maintenance.",
      "Optimized native memory layouts, calls, and data marshalling to reduce cross-language execution latency.",
    ],
    technologies: ["Rust", "Kotlin", "Java", "WebAssembly", "C", "Git"],
  },
  {
    name: "Rubify",
    slug: "rubify",
    github: { href: "https://github.com/lemueldls/rubify", text: "github.com/lemueldls/rubify" },
    tangled: { href: "https://tangled.org/lem.my/rubify", text: "tangled.org/lem.my/rubify" },
    description:
      "Rubify is a program made to automatically annotate any font with ruby characters.",
    role: "Creator",
    since: "January 2026",
    lastActive: "March 2026",
    status: "maintained",
    contributions: [
      "Implemented annotations of ruby characters for the romanization of Mandarin Chinese and Japanese.",
      "Published fonts compiled from multiple different families annotated with all supported romanizations.",
      "Engineered a custom font collection builder and optimizations to manage distribution of large files.",
    ],
    technologies: ["Rust", "Git"],
  },
  {
    name: "Ezno",
    slug: "ezno",
    github: { href: "https://github.com/kaleidawave/ezno/", text: "github.com/kaleidawave/ezno" },
    description:
      "Ezno is a correct and efficient TypeScript type checker and compiler with additional experiments.",
    role: "Contributor",
    since: "March 2024",
    lastActive: "February 2025",
    status: "dormant",
    contributions: [
      "Diagnosed and fixed issues with property checking and subtype comparisons for class and object assignments.",
      "Added type checks for object destructuring patterns and handled context unbinding during property extractions.",
      "Implemented complete support for regular expressions and introduced constant string pattern evaluations.",
      "Extended functionality of internal language server to support use and development on multiple platforms.",
    ],
    technologies: ["Rust", "TypeScript", "Git"],
  },
  {
    name: "Mnemo",
    slug: "mnemo",
    link: { href: "https://mnemo.world/", text: "mnemo.world" },
    github: { href: "https://github.com/lemueldls/mnemo/", text: "github.com/lemueldls/mnemo" },
    description:
      "Mnemo is a local-first note-taking app leveraging the Typst ecosystem, designed to minimize distractions.",
    role: "Creator",
    since: "June 2023",
    status: "active",
    contributions: [
      "Implemented a custom rich text editor leveraging the Typst ecosystem for writing and styling notes.",
      "Used mnemonic memory techniques to help users remember information and improve overall learning.",
      "Created a builtin calendar and tasks manager deeply integrated with UI for faster reminder creation.",
      "Developed cloud-based synchronization system that allows accessing notes across multiple devices.",
    ],
    technologies: [
      "Sass",
      "TypeScript",
      "Vue.js",
      "Rust",
      "Typst",
      "CodeMirror",
      "Nuxt",
      "UnoCSS",
      "Tauri",
      "Git",
      "Cloudflare",
    ],
  },
  {
    name: "Synquid",
    slug: "synquid",
    github: {
      href: "https://github.com/lemueldls/synquid-rs/",
      text: "github.com/lemueldls/synquid-rs",
    },
    description:
      "Synquid is a program synthesizer that uses refinement types to generate functional programs.",
    role: "Creator",
    since: "May 2024",
    lastActive: "August 2024",
    status: "maintained",
    contributions: [
      "Reimplemented Synquid in Rust, improving memory and performance of the original Haskell implementation.",
      "Achieved complete byte-identical parity against the Haskell implementation across all 64 PLDI '16 programs.",
      "Completed a working prototype around type-based synthesis of random generators for property-based testing.",
    ],
    technologies: ["Rust", "Haskell", "Git"],
  },
  {
    name: "Language of Meaning and Types",
    slug: "lmt",
    github: { href: "https://github.com/lemueldls/lmt/", text: "github.com/lemueldls/lmt" },
    description:
      "Language of Meaning and Types (LMT) is a proof-oriented meta-programming and specification language.",
    role: "Creator",
    since: "March 2024",
    lastActive: "June 2024",
    status: "maintained",
    contributions: [
      "Designed a novel theory and programming language where types and values can live in the same logical space.",
      "Engineered a dual-mode program synthesis backend leveraging enumerative search to infer and discover goals.",
      "Built a cross-language contract and host-agnostic specification tooling enabling legacy or multi-language codebases to adopt formal verification without modifying existing host compilers or build systems.",
    ],
    technologies: ["Rust", "Git"],
  },
  {
    name: "avast",
    slug: "avast",
    github: { href: "https://github.com/lemueldls/avast", text: "github.com/lemueldls/avast" },
    description:
      "avast is an error reporting library that specializes in easy to read and write error construction.",
    role: "Creator",
    since: "April 2023",
    lastActive: "January 2024",
    status: "maintained",
    contributions: [
      "Designed an ergonomic API for constructing and reporting errors in Rust applications.",
    ],
    technologies: ["Rust", "Git"],
  },
  {
    name: "re-set",
    slug: "re-set",
    link: { href: "https://crates.io/crates/re-set", text: "crates.io/crates/re-set" },
    github: { href: "https://github.com/lemueldls/re-set", text: "github.com/lemueldls/re-set" },
    description:
      "re-set is a regular expression (regex) set compiler that validates and constructs regexes at compile-time.",
    role: "Creator",
    since: "February 2023",
    lastActive: "January 2024",
    status: "maintained",
    contributions: [
      "Beat the performance of the regex crate in certain benchmarks when testing speed and memory usage.",
      "Utilized compile-time pattern expansion to improve safety and performance of matching string data at runtime.",
    ],
    technologies: ["Rust", "Git"],
  },
  {
    name: "pyret-rs",
    slug: "pyret-rs",
    github: {
      href: "https://github.com/lemueldls/pyret-rs",
      text: "github.com/lemueldls/pyret-rs",
    },
    description:
      "pyret-rs is a port of an educational programming language originally developed at Brown University.",
    role: "Creator",
    since: "April 2022",
    lastActive: "January 2024",
    status: "maintained",
    contributions: [
      "Ported the language to Rust, improving the overall performance and extensibility of the language.",
      "Created a custom non-deterministic finite automaton (NFA) for regular expressions, taking advantage of compile-time pattern expansion to improve performance of matching string data at runtime.",
      "Invented a novel lexer and parser abstraction using the NFA to allow for a completely modular design.",
    ],
    technologies: ["Pyret", "Rust", "WebAssembly", "TypeScript", "Git"],
  },
  {
    name: "Kaetram",
    slug: "kaetram",
    link: { href: "https://kaetram.com", text: "kaetram.com" },
    github: {
      href: "https://github.com/Kaetram/Kaetram-Open",
      text: "github.com/Kaetram/Kaetram-Open",
    },
    description:
      "Kaetram was an open-source MMORPG game built with modern web standards and cutting-edge technologies.",
    role: "Core Developer",
    since: "November 2019",
    lastActive: "January 2025",
    status: "dormant",
    contributions: [
      "Maintained the project as a core developer, working on the game engine and it’s multiple clients.",
      "Managed a community of more than 4,000 users worldwide, and organized global development efforts.",
      "Predominantly led the long-term development and maintenance of core game engine components, first introducing testing, linting, and documentation, improving game performance and stability.",
    ],
    technologies: [
      "HTML5",
      "CSS",
      "Sass",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "Vite",
      "Astro",
      "MongoDB",
      "Cypress",
      "Git",
    ],
  },
  {
    name: "My AFSE",
    slug: "my-afse",
    github: { href: "https://github.com/lemueldls/my_afse", text: "github.com/lemueldls/my_afse" },
    description:
      "My AFSE was an application that helped students better navigate at the Academy for Software Engineering.",
    role: "Creator",
    since: "January 2018",
    lastActive: "May 2022",
    status: "archived",
    contributions: [
      "Provided students with a holistic view of their academic standing and visual areas for improvement.",
      "Developed a web and mobile application that integrated grading systems, attendance tracking, class schedules, news, and events, improving student organization when better options were not available.",
      "Adapted to remote learning by moving the community online and automating reminders for classes.",
    ],
    technologies: [
      "Dart",
      "HTML5",
      "TypeScript",
      "Vue.js",
      "Kotlin",
      "Swift",
      "Flutter",
      "Nuxt",
      "Deno",
      "Git",
      "Firebase",
    ],
  },
  {
    name: "Switchcord",
    slug: "switchcord",
    description:
      "Switchcord was a desktop application that allowed Discord Rich Presence for Nintendo Switch games.",
    role: "Creator",
    since: "May 2021",
    lastActive: "October 2021",
    status: "archived",
    github: {
      href: "https://github.com/lemueldls/switchcord",
      text: "github.com/lemueldls/switchcord",
    },
    contributions: [
      "Imported game data to Discord, allowing users to showcase their gameplay activity in real-time.",
    ],
    technologies: [
      "Sass",
      "TypeScript",
      "Vue.js",
      "Vuetify",
      "Material Design",
      "Nuxt",
      "Electron",
      "Discord",
      "Git",
    ],
  },
  {
    name: "discordo",
    slug: "discordo",
    description:
      "discordo was a collection of BetterDiscord plugins, most notably, the DeveloperOptions plugin.",
    role: "Creator",
    since: "June 2021",
    status: "archived",
    github: {
      href: "https://github.com/lemueldls/discordo/",
      text: "github.com/lemueldls/discordo",
    },
    contributions: [
      "Created a plugin for developer options, allowing users to inspect elements and debug plugins/themes.",
    ],
    technologies: ["TypeScript", "Discord", "BetterDiscord", "Git"],
  },
  {
    name: "due",
    slug: "due",
    description: "due was one of the first frameworks for Vue.js 3 built using Deno 1.",
    role: "Creator",
    since: "May 2020",
    lastActive: "September 2020",
    status: "archived",
    github: { href: "https://github.com/lemueldls/due/", text: "github.com/lemueldls/due" },
    contributions: [
      "Developed a lightweight framework for building Vue.js 3 applications using Deno 1 and Skypack.",
    ],
    technologies: ["TypeScript", "Vue.js", "Deno", "Skypack", "Git"],
  },
  {
    name: "Iridis",
    slug: "iridis",
    description: "Iridis was a Discord bot that was built using early artificial intelligence.",
    role: "Creator",
    since: "February 2020",
    status: "archived",
    github: { href: "https://github.com/lemueldls/iridis/", text: "github.com/lemueldls/iridis" },
    contributions: [
      "Built a Discord bot that used early artificial intelligence to respond to user messages.",
    ],
    technologies: ["JavaScript", "Discord", "Git"],
  },
] as const satisfies Project[];

export type ProjectSlug = (typeof projects)[number]["slug"];

const resolvedProjects: Project[] = projects.map((source) => resolveProject(source));

const affiliations = [
  { ...acmCcny, role: "Vice President" },
  {
    name: "Google Developer Groups on Campus",
    slug: "gdg-on-campus",
    link: {
      href: "https://gdg.community.dev/gdg-on-campus-the-city-college-of-new-york-new-york-united-states/",
      text: "gdg.community.dev",
    },
    description:
      "Google Developer Groups are community groups for developers to learn, share, and get help.",
    role: "Organizer",
    from: "January 2024",
    to: "Present",
    contributions: [
      "Organized events and workshops for students to learn about modern technology and communication.",
    ],
    technologies: [],
  },
  {
    name: "BYTE Hacks 2025",
    slug: "byte-hacks-2025",
    link: { href: "https://www.bytehacks.org/", text: "bytehacks.org" },
    description:
      "BYTE Hacks 2025 was a 24-hour hackathon hosted by the BYTE cohort leaders of the ACM chapter at CCNY.",
    role: "Organizer",
    from: "September 2025",
    contributions: [
      "Organized food, check-in, signage, and relocations for incoming and existing hackathon partitipants.",
      "Mentored hackathon participants with insights about software and hardware industry technologies.",
    ],
    technologies: [],
  },
] as const satisfies Experience[];

export type AffiliationSlug = (typeof affiliations)[number]["slug"];

const talks = [
  {
    slug: "tbsscrg.pdf",
    title: "Type-Based Synthesis of Sound and Complete Random Generators",
    description:
      "A Presentation for the Penn REPL 2024 REU, Advised by Harry Goldstein and Benjamin Pierce.",
    date: "August 1, 2024",
  },
];

export type Carried<T extends string> = T | "all";

export interface Preset {
  education: Carried<EducationSlug>[];
  experiences: Carried<ExperienceSlug>[];
  projects: Carried<ProjectSlug>[];
  affiliations: Carried<AffiliationSlug>[];
  mergeResearch: boolean;
  showTech: boolean;
  hideDescriptions: boolean;
  qualifications: CvQualificationVisibility;
  label: string;
  download: string;
}

export const presets: Record<string, Preset> = {
  resume: {
    education: ["ccny"],
    experiences: ["upenn-repl", "woven-toyota"],
    projects: ["typbase", "kaetram", "my-afse"],
    affiliations: ["acm-ccny"],
    mergeResearch: true,
    showTech: false,
    hideDescriptions: true,
    qualifications: {
      technical: true,
      linguistic: false,
      leadership: false,
    },
    label: "Résumé",
    download: "lemuel-de-los-santos-resume.pdf",
  },
  full: {
    education: ["all"],
    experiences: ["all"],
    projects: ["all"],
    affiliations: ["all"],
    mergeResearch: false,
    showTech: true,
    hideDescriptions: false,
    qualifications: {
      technical: true,
      linguistic: true,
      leadership: true,
    },
    label: "Full CV",
    download: "lemuel-de-los-santos-cv.pdf",
  },
  research: {
    education: ["ccny"],
    experiences: ["upenn-repl"],
    projects: ["koffi", "ezno", "mnemo", "synquid", "lmt", "pyret-rs"],
    affiliations: ["acm-ccny"],
    mergeResearch: true,
    showTech: false,
    hideDescriptions: false,
    qualifications: {
      technical: false,
      linguistic: false,
      leadership: true,
    },
    label: "Research",
    download: "lemuel-de-los-santos-research.pdf",
  },
};

const printHiddenFor = (
  preset: ComputedRef<Preset>,
  key: "education" | "experiences" | "projects" | "affiliations",
): (<T extends { slug: string }>(entry: T) => T & { hidePrint: boolean }) => {
  const carried = (slug: string) => {
    const slugs: readonly string[] = preset.value[key];
    return slugs.includes("all") || slugs.includes(slug);
  };

  const hidden = (entry: { slug: string }) => flagged(entry, "hidePrint") || !carried(entry.slug);

  return <T extends { slug: string }>(entry: T) =>
    ({ ...entry, hidePrint: hidden(entry) }) as T & { hidePrint: boolean };
};

export function useAbout(presetKey: MaybeRefOrGetter<string> = "default") {
  const preset = computed(() => presets[toValue(presetKey)] ?? presets.resume!);

  return {
    preset,
    socials,
    email,
    rings,
    badges,

    education: computed<Education[]>(() => education.map(printHiddenFor(preset, "education"))),
    relevantCourses,
    qualifications,
    experiences: computed<Experience[]>(() =>
      experiences.map(printHiddenFor(preset, "experiences")),
    ),
    projects: computed<Project[]>(() => resolvedProjects.map(printHiddenFor(preset, "projects"))),
    affiliations: computed<Experience[]>(() =>
      affiliations.map(printHiddenFor(preset, "affiliations")),
    ),
    talks,
  };
}
