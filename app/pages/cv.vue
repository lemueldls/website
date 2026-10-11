<script setup lang="ts">
import keywords from "~/assets/keywords.json";

useSeoMeta({ title: "Curriculum Vitae" });

const route = useRoute();
const presetKey = useRouteQuery<string>("p", "default");
const { preset, education, relevantCourses, experiences, projects, affiliations, talks } =
  useAbout(presetKey);

const listFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

const cvSpan = computed(() => {
  const years = education.value
    .map((entry) => Number(entry.from.split(" ").pop()))
    .filter((year) => Number.isFinite(year));
  const first = years.length > 0 ? Math.min(...years) : null;
  return first ? `${first} — present` : "lem.my";
});

defineOgImage(
  "Root",
  {
    label: "curriculum vitae",
    title: "Curriculum Vitae",
    description:
      "Education, research, and engineering experience — set in Besley and Asterism, print-ready.",
    meta: cvSpan,
  },
  { alt: "Curriculum Vitae — Lemuel De Los Santos" },
);

const FONTS = [
  { label: "Besley", value: "besley" },
  { label: "Besley condensed", value: "besley-narrow" },
  { label: "Asterism Code", value: "mono" },
] as const;

type FontValue = (typeof FONTS)[number]["value"];

const formState = reactive({
  font: "besley" as FontValue,
  mergeResearch: false,
  hideDescriptions: true,
  hideQualifications: false,
  density: 1,
});

const isResearch = (entry: object) => "research" in entry && entry.research === true;

const research = computed(() =>
  formState.mergeResearch
    ? []
    : [...experiences.value.filter(isResearch), ...projects.value.filter(isResearch)],
);

const visibleExperiences = computed(() =>
  formState.mergeResearch ? experiences.value : experiences.value.filter((e) => !isResearch(e)),
);

const visibleProjects = computed(() =>
  formState.mergeResearch ? projects.value : projects.value.filter((p) => !isResearch(p)),
);

const densityStyle = computed(() => ({
  fontSize: `${10.5 * formState.density}pt`,
}));

const showPreview = ref(false);

const pdfHref = computed(() =>
  route.query.p ? `/cv.pdf?p=${encodeURIComponent(String(route.query.p))}` : "/cv.pdf",
);
</script>

<template>
  <div class="cv-root">
    <div class="cv sheet-grid" :class="{ 'cv--preview': showPreview }">
      <div class="no-print cv__controls">
        <XSheet>
          <div class="cv__controls-grid">
            <XSelect
              v-model="formState.font"
              label="Body font"
              :options="FONTS.map((f) => ({ label: f.label, value: f.value }))"
            />

            <XSelect
              v-model="presetKey"
              label="Preset"
              :options="[
                { label: 'Default', value: 'default' },
                { label: 'Research', value: 'research' },
              ]"
            />

            <XSelect
              v-model="formState.density"
              label="Density"
              :options="[
                { label: 'Comfortable', value: 1 },
                { label: 'Fits one page', value: 0.92 },
                { label: 'Two pages', value: 1.06 },
              ]"
            />
          </div>

          <div class="cv__controls-row">
            <div class="cv__toggles">
              <XCheckbox v-model="formState.mergeResearch" label="Merge research" />
              <XCheckbox v-model="formState.hideDescriptions" label="Hide descriptions" />
              <XCheckbox v-model="formState.hideQualifications" label="Hide qualifications" />
            </div>

            <div class="cv__actions">
              <XButton
                :variant="showPreview ? 'sheet' : 'rule'"
                @click="showPreview = !showPreview"
              >
                <XIcon
                  :name="
                    showPreview
                      ? 'material-symbols:close-sharp'
                      : 'material-symbols:visibility-sharp'
                  "
                  size="md"
                />
                {{ showPreview ? "Exit preview" : "Print preview" }}
              </XButton>

              <XButton :href="pdfHref" variant="accent" size="lg" download>
                <XIcon name="material-symbols:download-sharp" size="md" />
                Download PDF
              </XButton>
            </div>
          </div>
        </XSheet>
      </div>

      <XSheet class="print-sheet cv__sheet" :flush="true">
        <div class="cv__page" :class="`cv__page--${formState.font}`" :style="densityStyle">
          <header class="cv__head">
            <div class="cv__identity">
              <h1>Lemuel De Los Santos</h1>
              <address>
                <span>New York, NY</span>
                <span aria-hidden="true">·</span>
                <a href="mailto:hello@lemueldls.dev">hello@lemueldls.dev</a>
              </address>
            </div>

            <ul class="cv__links">
              <li>
                <XIcon name="simple-icons:github" class="cv__link-icon" size="xs" />
                <a href="https://github.com/lemueldls/">github.com/lemueldls</a>
              </li>
              <li>
                <XIcon name="simple-icons:linkedin" class="cv__link-icon" size="xs" />
                <a href="https://www.linkedin.com/in/lemueldls/">linkedin.com/in/lemueldls</a>
              </li>
            </ul>
          </header>

          <XSectionHead label="Summary" />
          <p class="cv__summary">
            Research student and software engineer with extensive experience in advanced mathematics
            and computer science. Particularly interested in web development, systems programming,
            compiler design, and reverse engineering. Proficient in managing large and complex
            projects, improving performance, and fostering community engagement.
          </p>

          <template v-for="entry of education" :key="entry.slug">
            <XSectionHead v-if="!entry.hidePrint" label="Education" />
            <article v-if="!entry.hidePrint" class="cv__entry">
              <div class="cv__entry-row">
                <h2 class="cv__entry-name">{{ entry.name }}</h2>
                <span class="cv__entry-date">{{ entry.status }} {{ entry.to }}</span>
              </div>
              <div class="cv__entry-row cv__entry-row--sub">
                <em>{{ entry.description }}</em>
                <span v-if="entry.award"
                  >Honored <em>{{ entry.award }}</em></span
                >
              </div>
            </article>
          </template>

          <XSectionHead
            v-show="preset.education.length"
            label="Relevant courses"
            class="no-print"
          />
          <p class="cv__courses no-print">
            <span v-for="(course, i) in relevantCourses" :key="course.title">
              {{ course.title }}<span v-if="i < relevantCourses.length - 1"> · </span>
            </span>
          </p>

          <template v-if="!formState.hideQualifications">
            <XSectionHead label="Qualifications" />

            <div class="cv__quals">
              <h3>Technical Skills</h3>
              <ul class="cv__quals-list">
                <li>
                  <strong>Languages:</strong>
                  {{ qualifications.languages.join(", ") }}
                </li>
                <li>
                  <strong>Frameworks:</strong>
                  {{ qualifications.frameworks.join(", ") }}
                </li>
                <li>
                  <strong>Infrastructure:</strong>
                  {{ qualifications.infrastructure.join(", ") }}
                </li>
              </ul>
            </div>

            <div class="cv__quals no-print">
              <h3>Linguistic Proficiencies</h3>
              <ul class="cv__quals-list">
                <li>Native in speaking and writing in fluent English and Spanish.</li>
                <li>Elementary understanding of French, Mandarin Chinese, and Japanese.</li>
              </ul>
            </div>

            <div class="cv__quals">
              <h3>Leadership Qualities</h3>
              <ul class="cv__quals-list">
                <li>
                  Proven ability to manage and contribute to open-source, demonstrating initiative
                  and commitment to community.
                </li>
                <li>
                  Active host and participant of various math and computer science communities in
                  both online and offline spaces.
                </li>
              </ul>
            </div>
          </template>

          <XSectionHead label="Experience" :count="visibleExperiences.length + research.length" />
          <article v-for="e of visibleExperiences" :key="e.slug" class="cv__entry">
            <div class="cv__entry-row">
              <h2 class="cv__entry-name">{{ e.name }}</h2>
              <span class="cv__entry-date">{{ e.from }} — {{ e.to ?? "Present" }}</span>
            </div>
            <div class="cv__entry-row cv__entry-row--sub">
              <em>{{ e.description }}</em>
              <span v-if="e.role" class="cv__entry-role">{{ e.role }}</span>
            </div>
            <ul class="cv__bullets">
              <li v-for="(c, i) of e.contributions" :key="i">{{ c }}</li>
            </ul>
            <ul v-if="!formState.hideDescriptions" class="cv__tech no-print">
              <li v-for="t of e.technologies" :key="t">{{ t }}</li>
            </ul>
          </article>

          <template v-if="research.length">
            <XSectionHead label="Research" :count="research.length" />
            <article v-for="r of research" :key="r.slug" class="cv__entry">
              <div class="cv__entry-row">
                <h2 class="cv__entry-name">{{ r.name }}</h2>
                <span class="cv__entry-date">{{ r.from }} — {{ r.to ?? "Present" }}</span>
              </div>
              <div class="cv__entry-row cv__entry-row--sub">
                <em>{{ r.description }}</em>
                <span v-if="r.role" class="cv__entry-role">{{ r.role }}</span>
              </div>
              <ul class="cv__bullets">
                <li v-for="(c, i) of r.contributions" :key="i">{{ c }}</li>
              </ul>
            </article>
          </template>

          <XSectionHead label="Projects" :count="visibleProjects.length" />
          <article v-for="p of visibleProjects" :key="p.slug" class="cv__entry">
            <div class="cv__entry-row">
              <h2 class="cv__entry-name">{{ p.name }}</h2>
              <span class="cv__entry-date">{{ p.from }} — {{ p.to ?? "Present" }}</span>
            </div>
            <div class="cv__entry-row cv__entry-row--sub">
              <em>{{ p.description }}</em>
              <span class="cv__entry-role">{{ p.role }}</span>
            </div>
            <a v-if="p.github" :href="p.github.href" class="cv__repo">{{ p.github.text }}</a>
            <ul class="cv__bullets">
              <li v-for="(c, i) of p.contributions" :key="i">{{ c }}</li>
            </ul>
          </article>

          <XSectionHead label="Affiliations" :count="affiliations.length" />
          <article v-for="a of affiliations" :key="a.slug" class="cv__entry">
            <div class="cv__entry-row">
              <h2 class="cv__entry-name">{{ a.name }}</h2>
              <span class="cv__entry-date">{{ a.from }} — {{ a.to ?? "Present" }}</span>
            </div>
            <div class="cv__entry-row cv__entry-row--sub">
              <em>{{ a.description }}</em>
              <span class="cv__entry-role">{{ a.role }}</span>
            </div>
            <ul class="cv__bullets">
              <li v-for="(c, i) of a.contributions" :key="i">{{ c }}</li>
            </ul>
          </article>

          <div class="no-print">
            <XSectionHead label="Talks" />
            <ul class="cv__bullets">
              <li v-for="t of talks" :key="t.slug">
                <strong>{{ t.title }}</strong> — {{ t.description }} ({{ t.date }})
              </li>
            </ul>
          </div>

          <div class="print-only cv__keywords">
            <XSectionHead label="Keywords" />
            <p class="cv__keywords-list">
              {{ listFormatter.format(keywords) }}
            </p>
          </div>
        </div>
      </XSheet>
    </div>

    <Transition name="fade">
      <div v-if="showPreview" class="cv__preview-bar no-print">
        <span class="label">Print preview</span>
        <span class="meta cv__preview-note">What the PDF will look like</span>
        <XButton variant="accent" size="sm" @click="showPreview = false">
          <XIcon name="material-symbols:close-sharp" size="xs" />
          Exit preview
        </XButton>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-root {
  display: contents;
}

.cv {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
  --cv-rule: #313244;
}

.cv__controls-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5) var(--space-7);
  align-items: flex-end;
}

.cv__toggles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-5);
}

.cv__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  gap: var(--space-3);
  border-top: var(--rule-width) solid var(--c-rule);
}

.cv__sheet {
  background: var(--c-sheet);
}

.cv__page {
  padding: clamp(var(--space-6), 4vw, var(--space-9));
  color: var(--c-fg);
  font-size: 10.5pt;
  line-height: 1.45;
}

.cv__page--besley {
  font-family: var(--f-display);
  font-variant-numeric: oldstyle-nums;
}

.cv__page--besley-narrow {
  font-family: var(--f-display);
  letter-spacing: -0.008em;
  line-height: 1.32;
}

.cv__page--mono {
  font-family: var(--f-mono);
  font-size: 0.94em;
}

.cv__page h1,
.cv__page h2,
.cv__page h3 {
  font-family: var(--f-display);
}

.cv__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4) var(--space-7);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--c-rule-strong);
}

.cv__identity h1 {
  font-size: 1.5em;
  line-height: 1.1;
}

.cv__identity address {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 0.3em;
  font-size: 0.85em;
  font-style: normal;
  color: var(--c-dim);
}

.cv__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
  font-size: 0.8em;
}

.cv__links li {
  display: flex;
  align-items: center;
  gap: 0.4em;
}

.cv__link-icon {
  color: var(--c-dimmer);
}

.cv__summary {
  margin-top: 0.85em;
  max-width: var(--measure-text);
}

.cv__courses {
  margin-top: 0.4em;
  font-size: 0.86em;
  color: var(--c-dim);
}

.cv__entry {
  margin-top: 0.6em;
}

.cv__entry-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.25em 1em;
}

.cv__entry-row--sub {
  color: var(--c-dim);
  font-size: 0.88em;
}

.cv__entry-name {
  font-size: 1em;
  font-weight: 600;
}

.cv__entry-role {
  font-weight: 600;
}

.cv__repo {
  display: inline-block;
  font-size: 0.8em;
  color: var(--c-dim);
}

.cv__bullets {
  margin: 0.25em 0 0;
  padding-left: 1.3em;
}

.cv__bullets li {
  font-size: 0.9em;
}

.cv__bullets li + li {
  margin-top: 0.15em;
}

.cv__tech {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.2em 0.9em;
  margin-top: 0.35em;
  padding: 0;
  font-family: var(--f-label);
  font-size: 0.72em;
  letter-spacing: 0.04em;
  text-transform: lowercase;
  color: var(--c-dimmer);
}

.cv__quals {
  margin-top: 0.5em;
}

.cv__quals h3 {
  font-size: 0.95em;
  font-weight: 600;
}

.cv__quals-list {
  margin: 0.2em 0 0;
  padding-left: 1.3em;
  font-size: 0.9em;
}

.cv__qual-list li + li {
  margin-top: 0.15em;
}

.cv__keywords-list {
  margin-top: 0.4em;
  font-size: 0.78em;
  color: var(--c-dim);
  max-width: var(--measure-text);
}

.cv--preview .no-print,
.cv--preview .print-only {
  display: none !important;
}

.cv--preview .cv__sheet,
.cv--preview .cv__sheet .cv__page {
  background: #ffffff !important;
  border-width: 0 !important;
}

.cv--preview .cv__page,
.cv--preview .cv__page *,
.cv--preview .cv__page *::before,
.cv--preview .cv__page *::after {
  color: #1e1e2e !important;
  background: transparent !important;
  background-image: none !important;
  border-width: 0 !important;
}

.cv--preview .cv__page .section-head__leader {
  background-image: radial-gradient(circle at center, #bcc0cc 0.5px, transparent 0.6px) !important;
  background-size: 0.35em 1px !important;
  border-bottom-width: 1px !important;
  border-bottom-style: solid !important;
  border-bottom-color: #bcc0cc !important;
}

.cv--preview .cv__page .mark {
  display: none !important;
}

.cv--preview .cv__page img {
  max-width: var(--space-8) !important;
}

.cv--preview .cv__sheet {
  border: none;
  box-shadow: none;
}

.cv__preview-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-command);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: color-mix(in srgb, var(--c-sheet) 94%, transparent);
  border-top: var(--rule-width) solid var(--c-accent);
  backdrop-filter: blur(6px);
}

.cv__preview-bar .label {
  color: var(--c-accent);
}

.cv__preview-note {
  color: var(--c-dimmer);
}

@media (max-width: 640px) {
  .cv__preview-note {
    display: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity var(--dur) var(--ease),
    translate var(--dur) var(--ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  translate: 0 100%;
}
</style>
