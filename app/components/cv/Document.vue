<script setup lang="ts">
import keywords from "~/assets/keywords.json";

import { isExternalHref, newTabAttrs } from "~/lib/links";

import { CV_SECTIONS, cvEntryKey, isCvKeyOn, type CvOptions, type CvSectionKey } from "#shared/cv";
import {
  isResearchEntry,
  useAbout,
  type Education,
  type Experience,
  type Project,
} from "~/composables/about";

const MASTHEAD_LINKS: { icon: string; href: string; label: string }[] = [
  {
    icon: "simple-icons:github",
    href: "https://github.com/lemueldls/",
    label: "github.com/lemueldls",
  },
  {
    icon: "simple-icons:linkedin",
    href: "https://www.linkedin.com/in/lemueldls/",
    label: "linkedin.com/in/lemueldls",
  },
];

const props = defineProps<{
  options: CvOptions;
}>();

const listFormatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

const { education, relevantCourses, qualifications, experiences, projects, affiliations, talks } =
  useAbout(() => props.options.preset);

const on = (key: string) => isCvKeyOn(props.options, key);

const mergeResearch = computed(() => props.options.mergeResearch);
const showTech = computed(() => props.options.showTech);
const hideDescriptions = computed(() => props.options.hideDescriptions);

type CvDate =
  | { kind: "range"; from: string; to: string }
  | { kind: "status"; status: string; to: string }
  | { kind: "point"; at: string };

interface EntryBase {
  slug: string;
  name: string;

  description: string;
  contributions: string[];
  technologies: string[];
  link?: { href: string; text: string };
  github?: { href: string; text: string };
  href?: string;
  printable: boolean;
}

interface EducationEntry extends EntryBase {
  kind: "education";
  date: CvDate;
  award?: string;
}

interface RoleEntry extends EntryBase {
  kind: "role";
  date: CvDate;
  role?: string;
}

type EntryView = EducationEntry | RoleEntry;

type RoleInput = Omit<Experience, "from" | "to">;

const homeOf = (entry: RoleInput): string | undefined =>
  "github" in entry ? `/projects/${entry.slug}` : entry.link?.href;

const educationView = (entry: Education, section: CvSectionKey): EducationEntry => ({
  kind: "education",
  slug: entry.slug,
  name: entry.name,
  description: entry.description,
  award: entry.award,
  contributions: [],
  technologies: [],
  href: entry.link?.href,
  date: { kind: "status", status: entry.status, to: entry.to! },
  printable: !entry.hidePrint && on(cvEntryKey(section, entry.slug)),
});

const linkOf = (entry: RoleInput) =>
  "link" in entry ? (entry.link as { href: string; text: string }) : undefined;

const githubOf = (entry: RoleInput) =>
  "github" in entry ? (entry.github as { href: string; text: string }) : undefined;

const roleView = (entry: RoleInput, section: CvSectionKey, date: CvDate): RoleEntry => ({
  kind: "role",
  slug: entry.slug,
  name: entry.name,
  description: entry.description,
  role: entry.role,
  contributions: entry.contributions,
  technologies: entry.technologies,
  link: linkOf(entry),
  github: githubOf(entry),
  href: homeOf(entry),
  date,
  printable: !entry.hidePrint && on(cvEntryKey(section, entry.slug)),
});

const experienceDate = (entry: Experience): CvDate => ({
  kind: "range",
  from: entry.from,
  to: entry.to ?? "Present",
});

const projectDate = (project: Project): CvDate => {
  if ((project.status ?? "active") === "active") {
    return { kind: "range", from: project.since, to: "Present" };
  }

  return project.lastActive && project.lastActive !== project.since
    ? { kind: "range", from: project.since, to: project.lastActive }
    : { kind: "point", at: project.lastActive ?? project.since };
};

const experienceEntries = computed(() =>
  experiences.value.filter((e) => mergeResearch.value || !isResearchEntry(e)),
);

const projectEntries = computed(() =>
  projects.value.filter((p) => mergeResearch.value || !isResearchEntry(p)),
);

const researchEntries = computed(() =>
  [...experiences.value, ...projects.value].filter((entry): entry is Experience =>
    isResearchEntry(entry),
  ),
);

const sectionEntries = computed<Record<CvSectionKey, EntryView[]>>(() => {
  const role = <T extends RoleInput>(
    entries: readonly T[],
    section: CvSectionKey,
    date: (entry: T) => CvDate,
  ) => entries.map((entry) => roleView(entry, section, date(entry)));

  return {
    summary: [],
    courses: [],
    qualifications: [],
    keywords: [],
    talks: [],

    education: education.value.map((entry) => educationView(entry, "education")),
    experience: role(experienceEntries.value, "experience", experienceDate),
    projects: role(projectEntries.value, "projects", projectDate),
    affiliations: role(affiliations.value, "affiliations", experienceDate),

    research: researchEntries.value.map((entry) =>
      roleView(entry, "research", experienceDate(entry)),
    ),
  };
});

const sections = computed(() =>
  CV_SECTIONS.flatMap((definition) => {
    if (definition.requiresSplitResearch && mergeResearch.value) return [];

    const entries = sectionEntries.value[definition.key];

    return [
      {
        ...definition,
        entries,
        // count: definition.entries ? entries.filter((entry) => entry.printable).length : undefined,
        count: definition.entries ? entries.length : undefined,
      },
    ];
  }),
);

const qualificationBlocks = computed<
  { key: string; title: string; lines: { bold: string; rest: string }[] }[]
>(() => [
  {
    key: "qualifications:technical",
    title: "Technical Skills",
    lines: [
      { bold: "Languages: ", rest: qualifications.languages.join(", ") },
      { bold: "Frameworks: ", rest: qualifications.frameworks.join(", ") },
      { bold: "Infrastructure: ", rest: qualifications.infrastructure.join(", ") },
    ],
  },
  {
    key: "qualifications:linguistic",
    title: "Linguistic Proficiencies",
    lines: [
      { bold: "", rest: "Native in speaking and writing in fluent English and Spanish." },
      { bold: "", rest: "Elementary understanding of French, Mandarin Chinese, and Japanese." },
    ],
  },
  {
    key: "qualifications:leadership",
    title: "Leadership Qualities",
    lines: [
      {
        bold: "",
        rest: "Proven ability to manage and contribute to open-source, demonstrating initiative and commitment to community.",
      },
      {
        bold: "",
        rest: "Active host and participant of various math and computer science communities in both online and offline spaces.",
      },
    ],
  },
]);

const headWouldPrint = (section: {
  key: CvSectionKey;
  entries?: unknown;
  subsections?: unknown;
  count?: number;
}): boolean => {
  if (section.key === "qualifications") {
    return qualificationBlocks.value.some((block) => on(block.key));
  }

  if (section.entries) return (section.count ?? 0) > 0;

  return on(section.key);
};
</script>

<template>
  <div class="cv__page" :class="`cv__page--${options.font}`">
    <header class="cv__head">
      <div class="cv__identity">
        <h1>Lemuel De Los Santos</h1>
        <address>
          <span>New York, NY</span>
          <span class="meta" aria-hidden="true"> · </span>
          <a href="mailto:hello@lemueldls.dev">hello@lemueldls.dev</a>
          <span class="meta" aria-hidden="true"> · </span>
          <a href="https://lem.my">@lem.my</a>
        </address>
      </div>

      <ul class="cv__links">
        <li v-for="link in MASTHEAD_LINKS" :key="link.href">
          <XIcon :name="link.icon" class="cv__link-icon" size="xs" />
          <a :href="link.href" v-bind="newTabAttrs(isExternalHref(link.href))">{{ link.label }}</a>
        </li>
      </ul>
    </header>

    <section
      v-for="section of sections"
      :key="section.key"
      :id="section.key"
      class="cv__section"
      :class="{
        'no-print': !on(section.key),
        'print-only': Boolean(section.printOnly),
      }"
    >
      <CvHead
        :id="section.key"
        :label="section.label"
        :link="section.link"
        :count="section.count"
        :class="{ 'no-print': !headWouldPrint(section) }"
      />

      <div class="cv__section-body">
        <p v-if="section.key === 'summary'" class="cv__summary">
          Research student and software engineer with extensive experience in advanced mathematics
          and computer science. Particularly interested in web development, systems programming,
          compiler design, and reverse engineering. Proficient in managing large and complex
          projects, improving performance, and fostering community engagement.
        </p>

        <p v-else-if="section.key === 'courses'" class="cv__courses">
          <span v-for="(course, i) in relevantCourses" :key="course.title">
            {{ course.title }}<span v-if="i < relevantCourses.length - 1"> · </span>
          </span>
        </p>

        <template v-else-if="section.key === 'qualifications'">
          <div
            v-for="block of [
              {
                key: 'qualifications:technical',
                title: 'Technical Skills',
                lines: [
                  { bold: 'Languages: ', rest: qualifications.languages.join(', ') },
                  { bold: 'Frameworks: ', rest: qualifications.frameworks.join(', ') },
                  { bold: 'Infrastructure: ', rest: qualifications.infrastructure.join(', ') },
                ],
              },
              {
                key: 'qualifications:linguistic',
                title: 'Linguistic Proficiencies',
                lines: [
                  {
                    bold: '',
                    rest: 'Native in speaking and writing in fluent English and Spanish.',
                  },
                  {
                    bold: '',
                    rest: 'Elementary understanding of French, Mandarin Chinese, and Japanese.',
                  },
                ],
              },
              {
                key: 'qualifications:leadership',
                title: 'Leadership Qualities',
                lines: [
                  {
                    bold: '',
                    rest: 'Proven ability to manage and contribute to open-source, demonstrating initiative and commitment to community.',
                  },
                  {
                    bold: '',
                    rest: 'Active host and participant of various math and computer science communities in both online and offline spaces.',
                  },
                ],
              },
            ]"
            :key="block.key"
            class="cv__quals"
            :class="{ 'no-print': !on(block.key) }"
          >
            <h3>{{ block.title }}</h3>
            <ul class="cv__quals-list">
              <li v-for="line of block.lines" :key="line.rest">
                <span v-if="line.bold"
                  ><strong>{{ line.bold }}</strong></span
                >{{ line.rest }}
              </li>
            </ul>
          </div>
        </template>

        <ul v-else-if="section.key === 'talks'" class="cv__bullets">
          <li v-for="t of talks" :key="t.slug">
            <div class="cv__entry-row">
              <strong>{{ t.title }}</strong>
              <span class="cv__entry-date-value">{{ t.date }}</span>
            </div>
            <span>{{ t.description }}</span>
          </li>
        </ul>

        <p v-else-if="section.key === 'keywords'" class="cv__keywords-list">
          {{ listFormatter.format(keywords) }}
        </p>

        <article
          v-for="entry of section.entries"
          v-else
          :key="entry.slug"
          :id="entry.slug"
          class="cv__entry"
          :class="{ 'no-print': !entry.printable }"
        >
          <div class="cv__entry-row">
            <span>
              <component
                :is="entry.href ? 'a' : 'span'"
                :href="entry.href"
                v-bind="newTabAttrs(isExternalHref(entry.href))"
                class="cv__entry-name"
              >
                {{ entry.name }}
              </component>
              <!-- <a v-if="entry.link" :href="entry.link.href" class="cv__entry-link">
                {{ entry.link.text }}
              </a> -->
              <span v-if="entry.kind === 'role' && entry.role" class="cv__entry-role">
                {{ entry.role }}
              </span>
            </span>

            <span v-if="entry.date.kind === 'range'" class="cv__entry-date">
              From <span class="cv__entry-date-value">{{ entry.date.from }}</span> to
              <span class="cv__entry-date-value">{{ entry.date.to }}</span>
            </span>
            <span v-else-if="entry.date.kind === 'point'" class="cv__entry-date">
              <span class="cv__entry-date-value">{{ entry.date.at }}</span>
            </span>
            <span v-else class="cv__entry-date">
              {{ entry.date.status }}
              <span class="cv__entry-date-value">{{ entry.date.to }}</span>
            </span>
          </div>

          <div class="cv__entry-row cv__entry-row--sub">
            <em v-if="entry.kind === 'role'" :class="{ 'no-print': hideDescriptions }">
              {{ entry.description }}
            </em>
            <em v-else>{{ entry.description }}</em>
            <span v-if="entry.kind === 'education' && entry.award">
              Honored <em>{{ entry.award }}</em>
            </span>

            <ul v-if="showTech && entry.technologies.length" class="cv__tech">
              <li v-for="t of entry.technologies" :key="t">{{ t }}</li>
            </ul>

            <!-- <a v-if="entry.github" :href="entry.github.href" class="cv__repo print-only">{{
              entry.github.text
            }}</a> -->
          </div>

          <ul v-if="entry.contributions.length" class="cv__bullets">
            <li v-for="(c, i) of entry.contributions" :key="i">{{ c }}</li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cv__page {
  padding: clamp(var(--space-6), 4vw, var(--space-9));
  color: var(--c-fg);
  /* line-height: 1.45; */
  font-size: var(--t-14);

  --t-6: 0.5em;
  --t-7: 0.6111em;
  --t-8: 0.7222em;
  --t-8p5: 0.7778em;
  --t-9: 0.8em;
  --t-10: 0.8889em;
  --t-1p5: 0.9444em;
  --t-11: 0.9778em;
  --t-12: 1em;
  --t-14: 1.2222em;
  --t-16: 1.4444em;
  --t-18: 1.6111em;
  --t-24: 2.2222em;
  --t-30: 3.25em;
  --t-36: 3.3333em;
  --t-60: 5em;

  --space-1: 0.25em;
  --space-1p5: 0.375em;
  --space-2: 0.5em;
  --space-3: 0.75em;
  --space-4: 1em;
  --space-5: 1.25em;
  --space-6: 1.5em;
  --space-7: 2em;
  --space-8: 2.5em;
  --space-9: 3em;
  --space-10: 4em;
}

@media print {
  .cv__page {
    font-size: 12pt;
  }
}

@media (max-width: 640px) {
  .cv__page {
    padding: 0;
    font-size: var(--t-11);
  }
}

.cv__page--besley {
  font-family: var(--f-display);
  /* font-variant-numeric: oldstyle-nums; */
}

.cv__page--besley-narrow {
  font-family: var(--f-display);
  /* letter-spacing: -0.008em; */
  /* line-height: 1.32; */
}

.cv__page--text {
  font-family: var(--f-text);
  font-size: var(--t-8p5);
}

.cv__page--mono {
  font-family: var(--f-mono);
  font-size: var(--t-8p5);
}

.cv__page h1,
.cv__page h2,
.cv__page h3 {
  font-family: var(--f-display);
}

.cv__section + .cv__section {
  /* margin-top: var(--space-1); */
}

.cv__section-body {
  padding: 0 var(--space-2);
}

@media (max-width: 640px) {
  .cv__section-body {
    padding: 0;
  }
}

.cv__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-evenly;
  gap: var(--space-4) var(--space-7);
  padding-bottom: var(--space-1);
  /* border-bottom: 1px solid var(--c-rule-strong); */
}

.cv__identity {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cv__identity h1 {
  font-size: var(--t-18);
  /* line-height: 1.1; */
}

.cv__identity address {
  /* display: flex; */
  /* flex-wrap: wrap; */
  /* gap: var(--space-2); */
  margin-top: var(--space-1);
  font-size: var(--t-8);
  font-style: normal;
  color: var(--c-dim);
}

.cv__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--t-8);
}

.cv__links li {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.cv__link-icon {
  color: var(--c-dimmer);
}

.cv__summary {
  margin-top: var(--space-1);
  font-size: var(--t-8p5);
  /* max-width: var(--measure-text); */
}

.cv__courses {
  margin-top: var(--space-1);
  font-size: var(--t-8);
  color: var(--c-dim);
}

.cv__entry {
  /* margin-top: var(--space-1); */
}

.cv__entry-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  /* gap: var(--space-1) var(--space-3); */
}

.cv__entry-row--sub {
  color: var(--c-dim);
  font-size: var(--t-8p5);
  flex-direction: column;
}

.cv__entry-row--sub > * {
  min-width: 0;
}

.cv__entry-date {
  font-size: var(--t-8p5);
  color: var(--c-dim);
  white-space: nowrap;
}

.cv__entry-date-value {
  font-weight: 600;
  color: var(--c-fg);
}

.cv__entry-name {
  font-size: var(--t-10);
  font-weight: 600;
}

.cv__entry-role {
  font-weight: 400;
  color: var(--c-dim);
  font-style: italic;
  font-size: var(--t-8p5);
}

.cv__entry-role::before {
  content: " · ";
  font-weight: 400;
  color: var(--c-dimmer);
  font-family: var(--f-label);
  font-style: normal;
}

.cv__entry-link {
  font-weight: 400;
  color: var(--c-dim);
  font-style: italic;
  font-size: var(--t-8p5);
  text-decoration: none;
}

.cv__entry-link::before {
  content: " — ";
  font-weight: 400;
  color: var(--c-dimmer);
  font-family: var(--f-label);
  font-style: normal;
}

a.cv__entry-name {
  text-decoration: none;
  color: inherit;
}

a.cv__entry-name:hover {
  text-decoration: underline;
  text-underline-offset: var(--space-1);
}

.cv__tech {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-4);
  margin: 0;
  padding: 0 var(--space-2);
  font-family: var(--f-label);
  font-size: var(--t-7);
  /* letter-spacing: 0.04em; */
  /* text-transform: lowercase; */
  color: var(--c-dimmer);
}

.cv__repo {
  font-size: var(--t-8);
  color: var(--c-dim);
  white-space: nowrap;
}

.cv__bullets {
  /* margin: var(--space-1) 0 0; */
  padding-left: var(--space-4);
}

.cv__bullets li {
  font-size: var(--t-8p5);
}

/* .cv__bullets li + li {
  margin-top: var(--space-1);
} */

.cv__quals {
  margin-top: var(--space-1);
}

.cv__quals h3 {
  font-size: var(--t-8p5);
  font-weight: 600;
}

.cv__quals-list {
  /* margin: var(--space-1) 0 0; */
  padding-left: var(--space-4);
  font-size: var(--t-8p5);
}

/* .cv__quals-list li + li {
  margin-top: var(--space-1);
} */

.cv__keywords-list {
  margin-top: var(--space-1);
  font-size: var(--t-8);
  color: var(--c-dim);
  max-width: var(--measure-text);
}
</style>
