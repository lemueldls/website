<script setup lang="ts">
import { presets, useAbout } from "~/composables/about";

import {
  CV_FONTS,
  CV_SECTIONS,
  cvEntryKey,
  isCvKeyOn,
  parseCvOptions,
  serializeCvOptions,
  toggleCvKey,
  type CvOptions,
  type CvSectionKey,
} from "#shared/cv";

useSeoMeta({ title: "Curriculum Vitae" });

const route = useRoute();
const router = useRouter();

const options = reactive(parseCvOptions(route.query));

watch(
  options,
  () => {
    router.replace({ query: serializeCvOptions(options) });
  },
  { deep: true },
);

const { education } = useAbout(() => options.preset);

const cvSpan = computed(() => {
  const years = education.value
    .map((entry) => Number(entry.from.split(" ").pop()))
    .filter((year) => Number.isFinite(year));

  const first = years.length > 0 ? Math.min(...years) : null;
  return first ? `since ${first}` : "lem.my";
});

defineOgImage("Root", {
  label: "curriculum vitae",
  title: "Curriculum Vitae",
  description: "Education, research, and engineering experience.",
  meta: cvSpan,
});

const showPreview = ref(false);
const pickerOpen = ref(false);

const on = (key: string) => isCvKeyOn(options, key);
const toggle = (key: string) => toggleCvKey(options, key);

const presetOptions = Object.entries(presets).map(([value, preset]) => ({
  label: preset.label,
  value,
}));

const pdfHref = computed(() => {
  const search = new URLSearchParams(serializeCvOptions(options)).toString();
  return `/cv.pdf${search ? `?${search}` : ""}`;
});
</script>

<template>
  <div class="cv-root">
    <div class="cv sheet-grid" :class="{ 'cv--preview': showPreview }">
      <div class="no-print cv__controls">
        <XSheet>
          <div class="cv__controls-grid">
            <XSelect
              v-model="options.font"
              label="Body font"
              :options="CV_FONTS.map((f) => ({ label: f.label, value: f.value }))"
            />

            <XSelect v-model="options.preset" label="Preset" :options="presetOptions" />

            <XButton class="cv__controls-sections" variant="sheet" @click="pickerOpen = true">
              <XIcon name="material-symbols:tune-outline-sharp" />
              Sections
            </XButton>
          </div>

          <div class="cv__controls-row">
            <div class="cv__toggles">
              <XCheckbox v-model="options.mergeResearch" label="Merge research" />
              <XCheckbox v-model="options.showTech" label="Technology lists" />
              <XCheckbox v-model="options.hideDescriptions" label="Hide descriptions" />
            </div>

            <div class="cv__actions">
              <XButton variant="sheet" @click="showPreview = !showPreview">
                <XIcon
                  :name="
                    showPreview
                      ? 'material-symbols:close-outline-sharp'
                      : 'material-symbols:visibility-outline-sharp'
                  "
                />
                {{ showPreview ? "Exit preview" : "Print preview" }}
              </XButton>

              <XButton :href="pdfHref" target="_blank" variant="accent" size="lg">
                <XIcon name="material-symbols:download-outline-sharp" size="lg" />
                Download PDF
              </XButton>
            </div>
          </div>
        </XSheet>
      </div>

      <XSheet class="print-sheet cv__sheet" :flush="true">
        <CvDocument :options="options" />
      </XSheet>
    </div>

    <Transition name="fade">
      <div v-if="showPreview" class="cv__preview-bar no-print">
        <XLabel icon="material-symbols:print-outline-sharp">Print preview</XLabel>
        <span class="meta cv__preview-note">What the PDF will look like</span>

        <XButton variant="accent" :href="pdfHref" target="_blank">
          <XIcon name="material-symbols:download-outline-sharp" />
          PDF
        </XButton>

        <XButton variant="sheet" @click="showPreview = false">
          <XIcon name="material-symbols:close-outline-sharp" />
          Exit preview
        </XButton>
      </div>
    </Transition>

    <CvSectionPicker v-model:open="pickerOpen" :options="options" @toggle="toggle" />
  </div>
</template>

<style scoped>
.cv__controls-sections {
  margin-left: auto;
}

.cv-root {
  display: contents;
}

.cv {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.cv__controls-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5) var(--space-7);
  align-items: flex-end;
}

.cv__controls-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3) var(--space-5);
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: var(--rule-width) solid var(--c-rule);
}

.cv__toggles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-5);
}

.cv__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-3);
}

.cv__sheet {
  background: var(--c-sheet);
}

.cv--preview :deep(.cv__page .no-print) {
  display: none !important;
}

.cv--preview :deep(.cv__page .print-only:not(.no-print)) {
  display: revert !important;
}

.cv--preview :deep(.cv__sheet),
.cv--preview :deep(.cv__sheet .cv__page) {
  background: var(--c-print-bg) !important;
  border-width: 0 !important;
  box-shadow: none !important;
}

.cv--preview :deep(.cv__page) {
  padding: var(--space-8) !important;
}

.cv--preview :deep(.cv__sheet .mark),
.cv--preview :deep(.cv__page .mark) {
  display: none !important;
}

.cv--preview :deep(.cv__page),
.cv--preview :deep(.cv__page *),
.cv--preview :deep(.cv__page *::before),
.cv--preview :deep(.cv__page *::after) {
  color: var(--c-print-fg) !important;
  background: transparent !important;
  background-image: none !important;
  border-width: 0 !important;
}

.cv--preview :deep(.cv__page .cv-head) {
  border-bottom-width: 1px !important;
  border-bottom-style: solid !important;
  border-bottom-color: #bcc0cc !important;
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
  transition: color var(--dur) var(--ease);
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
