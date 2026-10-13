<script setup lang="ts">
import { CV_SECTIONS, cvEntryKey, isCvKeyOn, type CvOptions, type CvSectionKey } from "#shared/cv";
import {
  isResearchEntry,
  useAbout,
  type Education,
  type Experience,
  type Project,
} from "~/composables/about";

const open = defineModel<boolean>("open", { required: true });

const props = defineProps<{
  options: CvOptions;
}>();

const emit = defineEmits<{
  toggle: [key: string];
}>();

const on = (key: string) => isCvKeyOn(props.options, key);
const toggle = (key: string) => emit("toggle", key);

const { education, experiences, projects, affiliations, talks } = useAbout(
  () => props.options.preset,
);

const talksEntries = computed(() => [...talks]);

const mergeResearch = computed(() => props.options.mergeResearch);

const sections = computed(() =>
  CV_SECTIONS.filter((section) => !section.requiresSplitResearch || !mergeResearch.value),
);

interface PickableEntry {
  slug: string;
  name: string;
  hidePrint?: boolean;
}

const pickable = (entry: PickableEntry): Required<PickableEntry> => ({
  slug: entry.slug,
  name: entry.name,
  hidePrint: entry.hidePrint ?? false,
});

const entriesOf = (section: CvSectionKey): Required<PickableEntry>[] => {
  switch (section) {
    case "education":
      return education.value.map(pickable);
    case "experience":
      return experiences.value
        .filter((e) => mergeResearch.value || !isResearchEntry(e))
        .map(pickable);
    case "research":
      return [...experiences.value, ...projects.value]
        .filter((entry) => isResearchEntry(entry))
        .map(pickable);
    case "projects":
      return projects.value.filter((p) => mergeResearch.value || !isResearchEntry(p)).map(pickable);
    case "affiliations":
      return affiliations.value.map(pickable);
    case "talks":
      return talksEntries.value.map((talk) => ({
        slug: talk.slug,
        name: talk.title,
        hidePrint: false,
      }));
    default:
      return [];
  }
};

interface PickerRow {
  key: string;
  name: string;
  hidePrint: boolean;
  checked: boolean;
}

const rowsOf = (section: CvSectionKey): PickerRow[] =>
  entriesOf(section).map((entry) => {
    const key = cvEntryKey(section, entry.slug);

    return {
      key,
      name: entry.name,
      hidePrint: entry.hidePrint,
      checked: !entry.hidePrint && on(key),
    };
  });

const printCount = (section: CvSectionKey) =>
  entriesOf(section).filter((e) => !e.hidePrint && on(cvEntryKey(section, e.slug))).length;

const heldBack = computed(
  () =>
    education.value.filter((e) => e.hidePrint).length +
    experiences.value.filter((e) => e.hidePrint).length +
    projects.value.filter((p) => p.hidePrint).length +
    affiliations.value.filter((a) => a.hidePrint).length,
);

const allOff = computed(() => CV_SECTIONS.every((section) => !on(section.key)));

const resetDefaults = () => {
  props.options.off = [];
};
</script>

<template>
  <XDialog v-model:open="open" title="Sections" size="wide">
    <ul class="picker">
      <li v-for="section of sections" :key="section.key" class="picker__section">
        <div class="picker__row picker__row--section">
          <XCheckbox
            :model-value="on(section.key)"
            :label="section.label"
            @update:model-value="toggle(section.key)"
          />

          <span v-if="section.entries" class="meta picker__count">{{
            printCount(section.key)
          }}</span>
        </div>

        <!-- <p class="picker__hint">{{ section.hint }}</p> -->

        <ul v-if="section.subsections" class="picker__children">
          <li v-for="sub of section.subsections" :key="sub.key" class="picker__row">
            <XCheckbox
              :model-value="on(`${section.key}:${sub.key}`)"
              :label="sub.label"
              @update:model-value="toggle(`${section.key}:${sub.key}`)"
            />
          </li>
        </ul>

        <ul v-else-if="section.entries" class="picker__children">
          <li v-for="row of rowsOf(section.key)" :key="row.key" class="picker__row">
            <XCheckbox
              :disabled="row.hidePrint"
              :model-value="row.checked"
              :label="row.hidePrint ? `${row.name} /\/ held back by the preset` : row.name"
              @update:model-value="toggle(row.key)"
            />
          </li>
        </ul>
      </li>
    </ul>

    <template #footer>
      <div class="picker__foot">
        <span class="meta">{{ heldBack }} entries held back by the preset</span>

        <XButton variant="ghost" :disabled="allOff" @click="resetDefaults">
          <XIcon name="material-symbols:restart-alt-sharp" />
          Reset
        </XButton>
      </div>
    </template>
  </XDialog>
</template>

<style scoped>
.picker {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.picker__section {
  padding: var(--space-4) var(--space-5);
  border-bottom: var(--rule-width) solid var(--c-rule);
}

.picker__section:first-child {
  padding-top: var(--space-5);
}

.picker__section:last-child {
  border-bottom: none;
  padding-bottom: var(--space-5);
}

.picker__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.picker__row--section {
  justify-content: space-between;
}

.picker__count {
  font-size: var(--t-8);
}

.picker__hint {
  margin-top: var(--space-1);
  padding-left: var(--space-4);
  font-size: var(--t-8);
  color: var(--c-dimmer);
}

.picker__children {
  list-style: none;
  margin: var(--space-1) 0 0 var(--space-1);
  padding: 0 0 0 var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border-left: var(--rule-width) solid var(--c-rule);
}

.picker__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
</style>
