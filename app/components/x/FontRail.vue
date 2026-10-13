<script setup lang="ts">
const open = ref(false);

const families = ["Besley", "Asterism Text", "Asterism Term", "Asterism Code", "Asterism Slim"];

const family = useLocalStorage("x-specimen-family", "Besley");
const weight = useLocalStorage("x-specimen-weight", 600);
const size = useLocalStorage("x-specimen-size", 14);
const leading = useLocalStorage("x-specimen-leading", 1.55);

const familyOptions = families.map((f) => ({ label: f, value: f }));
const weightOptions = [400, 600, 700].map((w) => ({ label: String(w), value: w }));

function reset() {
  family.value = "Besley";
  weight.value = 600;
  size.value = 14;
  leading.value = 1.55;
}

onMounted(() => {
  watchEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--f-display", `"${family.value}", Georgia, serif`);
    root.style.setProperty("--f-display-weight", String(weight.value));
    root.style.setProperty("--t-14", `${size.value / 14}rem`);
    root.style.setProperty("--t-36", `${(size.value / 14) * 2.5}rem`);
    root.style.setProperty("--leading", String(leading.value));
  });
});
</script>

<template>
  <div class="rail" :class="{ 'rail--open': open }">
    <XButton
      variant="ghost"
      size="sm"
      square
      :title="open ? 'Close specimen rail' : 'Open specimen rail'"
      @click="open = !open"
    >
      <XIcon
        :name="open ? 'material-symbols:menu-open-sharp' : 'material-symbols:type-specimen-sharp'"
      />
    </XButton>

    <Transition name="slide">
      <div v-if="open" class="rail__panel">
        <XLabel variant="accent">Specimen</XLabel>

        <XSelect v-model="family" label="Display" :options="familyOptions" class="rail__field" />
        <XSelect v-model="weight" label="Weight" :options="weightOptions" class="rail__field" />

        <XSlider v-model="size" label="Size" :min="10" :max="36" :step="1" :display="`${size}pt`" />

        <XSlider
          v-model="leading"
          label="Leading"
          :min="1"
          :max="2"
          :step="0.05"
          :display="`${leading}`"
        />

        <XButton variant="ghost" size="sm" block @click="reset">Reset to default</XButton>

        <p class="rail__hint">
          This page is set in fonts built here. <XLink to="/fonts">Specimen library</XLink>
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.rail {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.rail__panel {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: var(--z-command);

  width: min(15rem, calc(100vw - var(--space-8)));
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--c-sheet);
  border: var(--rule-width) solid var(--c-rule-strong);
  box-shadow: 0 var(--space-2) var(--space-7) color-mix(in srgb, var(--c-bg) 55%, transparent);
}

.rail__field {
  width: 100%;
}

.rail__hint {
  font-size: var(--t-6);
  color: var(--c-dimmer);
  line-height: 1.5;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity var(--dur) var(--ease-folio),
    translate var(--dur) var(--ease-folio);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  translate: var(--space-2) 0;
}
</style>
