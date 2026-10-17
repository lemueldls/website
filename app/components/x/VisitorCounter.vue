<script setup lang="ts">
const DIGIT_RE = /\d/;

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

const { visits } = useVisits();

const formatted = computed(() => NUMBER_FORMAT.format(visits.value?.total ?? 0));

const since = computed(() => {
  if (!visits.value) return "";
  return new Date(`${visits.value.since}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
});

const cells = computed(() =>
  [...formatted.value].map((char) => ({ char, digit: DIGIT_RE.test(char) })),
);

const reading = computed(() => `${formatted.value} visitors since ${since.value}`);

const note = computed(() => {
  if (!visits.value) return "";

  return `${reading.value} // ${NUMBER_FORMAT.format(visits.value.today)} today`;
});
</script>

<template>
  <span v-if="visits" class="folio" :title="note">
    <span class="folio__digits" aria-hidden="true">
      <template v-for="(cell, i) in cells" :key="i">
        <span v-if="cell.digit" class="folio__cell num">
          <span class="mark mark--tl" />
          <span class="mark mark--tr" />
          <span class="mark mark--bl" />
          <span class="mark mark--br" />
          {{ cell.char }}
        </span>
        <span v-else class="folio__sep">{{ cell.char }}</span>
      </template>
    </span>

    <span class="sr-only">{{ reading }}</span>
  </span>
</template>

<style scoped>
.folio {
  display: inline-flex;
  align-items: center;

  animation: folio-in var(--dur) var(--ease-folio) both;
}

@keyframes folio-in {
  from {
    opacity: 0;
    translate: 0 2px;
  }
}

.folio__digits {
  display: inline-flex;
  align-items: stretch;

  gap: 0.5em;
}

.folio__cell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6em;
  padding: 0.16em 0.28em;
  font-size: var(--t-12);
  /* line-height: 1.2; */
  color: var(--c-fg);
  background: var(--c-sheet);
  border: var(--rule-width) solid var(--c-rule);
  /* font-variant-numeric: tabular-nums; */
  transition: border-color var(--dur-fast) var(--ease);
}

.folio__sep {
  display: inline-flex;
  align-items: center;
  font-family: var(--f-label);
  font-size: var(--t-12);
  color: var(--c-dimmer);
}

.folio .mark {
  --mark-size: 7px;
}

.folio:hover .mark,
.folio:focus-within .mark {
  scale: 1.4;
  --mark-color: var(--c-accent);
}

.folio:hover .folio__cell {
  border-color: var(--c-rule-strong);
}
</style>
