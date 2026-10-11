interface Social {
  title: string;
  href: string;
  icon: string;
}

interface Ring {
  name: string;
  home: string;
  next: string;
  prev: string;
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

export interface Project extends Experience {
  github: { href: string; text: string };
}

export const socials: Social[] = [
  { title: "Bluesky", href: "https://bsky.app/profile/lem.my", icon: "simple-icons:bluesky" },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/lemueldls",
    icon: "simple-icons:linkedin",
  },
  { title: "GitHub", href: "https://github.com/lemueldls", icon: "simple-icons:github" },
];

export const email: Social = {
  title: "hi@lem.my",
  href: "mailto:hi@lem.my",
  icon: "material-symbols:mail-outline-sharp",
};

export const rings: Ring[] = [
  {
    name: "Catppuccin Webring",
    home: "https://ctp-webr.ing",
    prev: "https://ctp-webr.ing/lem.my/previous",
    next: "https://ctp-webr.ing/lem.my/next",
  },
  {
    name: "Nix Webring",
    home: "https://nixwebr.ing",
    prev: "https://nixwebr.ing/prev/lem.my",
    next: "https://nixwebr.ing/next/lem.my",
  },
  {
    name: "Recurse Webring",
    home: "https://ring.recurse.com",
    prev: "https://ring.recurse.com/prev?id=89",
    next: "https://ring.recurse.com/next?id=89",
  },
];

export const education = [
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

export const relevantCourses = [
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

export const qualifications = {
  languages: [
    "HTML5",
    "CSS",
    "Sass",
    "JavaScript",
    "TypeScript",
    "Rust",
    "C++",
    "Dart",
    "Python",
    "Haskell",
  ],
  frameworks: [
    "Tailwind CSS",
    "Vue.js",
    "React",
    "Lit",
    "Nuxt",
    "Next.js",
    "Electron",
    "Tauri",
    "Ionic",
    "Flutter",
  ],
  infrastructure: [
    "Linux",
    "Cloudflare",
    "AWS",
    "Docker",
    "GitHub Actions",
    "Supabase",
    "Firebase",
    "Convex",
  ],
} as const;

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

export const experiences = [
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

export const projects = [
  {
    name: "Typbase",
    slug: "typbase",
    link: { href: "https://typbase.at", text: "typbase.at" },
    github: { href: "https://github.com/lemueldls/typbase", text: "github.com/lemueldls/typbase" },
    description:
      "Typbase is a local-first knowledge base made for the Typst language and the Atmosphere protocol.",
    role: "Creator",
    from: "August 2026",
    to: "Present",
    contributions: [
      "Designed the workspace as a queryable document model, so pages, categories, daily notes, and sections can be read from inside a document with #typbase.query.",
      "Built an inline WYSIWYG editor where compiled output replaces the source as you type, on CodeMirror 6 with a Typst 0.15 WebAssembly engine.",
      "Extracted Mnemo's editor and engine into a reusable core, then rebuilt the application on top of it with Loro CRDTs, atproto Spaces sync, and a plugin system written in Typst itself.",
      "Shipped standalone export to HTML, PDF, SVG, and a compilable Typst project, so a page is portable outside the app with typst compile --root ..",
    ],
    technologies: [
      "Rust",
      "Typst",
      "WebAssembly",
      "CodeMirror",
      "TypeScript",
      "Nuxt",
      "Loro",
      "atproto",
      "SQLite",
      "Tauri",
      "Harper",
    ],
  },
  {
    name: "Koffi",
    slug: "koffi",
    github: { href: "https://github.com/lemueldls/koffi/", text: "github.com/lemueldls/koffi" },
    description:
      "Koffi is a novel cross-platform framework and integrated ecosystem for Rust × Kotlin Multiplatform projects.",
    role: "Creator",
    from: "May 2026",
    to: "September 2026",
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
    description:
      "Rubify is a program made to automatically annotate any font with ruby characters.",
    role: "Creator",
    from: "January 2026",
    to: "March 2026",
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
    from: "March 2024",
    to: "February 2025",
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
    from: "June 2023",
    to: "Present",
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
    from: "May 2024",
    to: "August 2024",
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
    from: "March 2024",
    to: "June 2024",
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
    from: "April 2023",
    to: "January 2024",
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
    from: "February 2023",
    to: "January 2024",
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
    from: "April 2022",
    to: "January 2024",
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
    from: "November 2019",
    to: "January 2025",
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
    from: "January 2018",
    to: "May 2022",
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
    from: "May 2021",
    to: "October 2021",
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
    from: "June 2021",
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
    from: "May 2020",
    to: "September 2020",
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
    from: "February 2020",
    to: "February 2020",
    github: { href: "https://github.com/lemueldls/iridis/", text: "github.com/lemueldls/iridis" },
    contributions: [
      "Built a Discord bot that used early artificial intelligence to respond to user messages.",
    ],
    technologies: ["JavaScript", "Discord", "Git"],
  },
] as const satisfies Project[];

export type ProjectSlug = (typeof projects)[number]["slug"];

export const affiliations = [
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

export const talks = [
  {
    slug: "tbsscrg.pdf",
    title: "Type-Based Synthesis of Sound and Complete Random Generators",
    description:
      "A Presentation for the Penn REPL 2024 REU, Advised by Harry Goldstein and Benjamin Pierce.",
    date: "August 1, 2024",
  },
];

export interface Preset {
  education: EducationSlug[];
  experiences: ExperienceSlug[];
  projects: ProjectSlug[];
  affiliations: AffiliationSlug[];
}

export const presets: Record<string, Preset> = {
  default: {
    education: ["ccny", "afse"],
    experiences: ["taylor-graham", "upenn-repl", "woven-toyota"],
    projects: ["mnemo", "kaetram", "my-afse"],
    affiliations: ["acm-ccny"],
  },
  research: {
    education: ["ccny"],
    experiences: ["upenn-repl"],
    projects: ["koffi", "ezno", "mnemo", "synquid", "lmt", "pyret-rs"],
    affiliations: ["acm-ccny"],
  },
};

export function useAbout(presetKey: MaybeRefOrGetter<string> = "default") {
  const preset = computed(() => presets[toValue(presetKey)] ?? presets.default!);

  return {
    preset,
    socials,
    email,
    rings,

    education: computed<Education[]>(() =>
      education.map<Education>((e) => ({
        ...e,
        hidePrint: !preset.value.education.includes(e.slug),
      })),
    ),
    relevantCourses,
    qualifications,
    experiences: computed<Experience[]>(() =>
      experiences.map<Experience>((e) => ({
        ...e,
        hidePrint: !preset.value.experiences.includes(e.slug),
      })),
    ),
    projects: computed<Project[]>(() =>
      projects.map<Project>((p) => ({ ...p, hidePrint: !preset.value.projects.includes(p.slug) })),
    ),
    affiliations: computed<Experience[]>(() =>
      affiliations.map<Experience>((a) => ({
        ...a,
        hidePrint: !preset.value.affiliations.includes(a.slug),
      })),
    ),
    talks,
  };
}
