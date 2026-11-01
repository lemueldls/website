<script setup lang="ts">
useSeoMeta({
  title: "Badges",
  description: "88×31 web badges: the tools, the craft, and the sites worth linking to.",
});

const { badges } = useAbout();

defineOgImage("Root", {
  label: "collection",
  title: "Badges",
  description: "88×31 web badges.",
  meta: `${badges.length} badges // 88 × 31`,
});

const GROUPS: { group: BadgeGroup; label: string; note: string }[] = [
  { group: "tools", label: "Tools", note: "What gets used, in the sizes it ships in." },
  {
    group: "web",
    label: "The web",
    note: "Badges about making the web, which is most of what badges have ever been.",
  },
  { group: "found", label: "Found", note: "Things liked, for no reason a page has to justify." },
  { group: "elsewhere", label: "Elsewhere", note: "Sites worth the trip." },
];

const sections = computed(() =>
  GROUPS.map(({ group, label, note }) => ({
    label,
    note,
    items: badges.filter((b) => b.group === group),
  })).filter((section) => section.items.length > 0),
);

const LINKME_SNIPPET = `<a href="https://lem.my">
  <img src="https://lem.my/badge.webp" width="88" height="31" alt="lem.my" />
</a>`;
</script>

<template>
  <div class="badges sheet-grid">
    <header class="badges__head" data-reveal-group>
      <p class="label label--accent">collection</p>
      <h1 class="badges__title">Badges</h1>
      <!-- <p class="badges__lede">
        Buttons at the size the format has always had it: 88 × 31 pixels, drawn by hand, shown at
        one-to-one. The wall started from
        <XLink href="https://trafficlunar.net/buttons/" external>trafficlunar's</XLink>, so the
        first pass is their taste as much as mine — tools, craft, and things worth linking out to.
      </p> -->
    </header>

    <template
      v-for="section in sections"
      :key="section.label"
      :label="section.label"
      :count="section.items.length"
    >
      <!-- <p class="badges__note">{{ section.note }}</p> -->

      <ul class="badges__grid" data-reveal-group>
        <li v-for="badge in section.items" :key="badge.src">
          <XBadge
            :title="badge.title"
            :src="badge.src"
            :href="badge.href"
            :note="badge.note"
            :scale="2"
          />
        </li>
      </ul>
    </template>

    <XSection label="Link to me">
      <div class="linkme">
        <!-- The real files, from scripts/gen-badges.ts. Shown at exactly 2× so they stay
             pixel-clean — the size is the format, and half a pixel is mush. The still
             leads: the loop spends most of its time composed, but a screenshot or a slow
             connection catches it mid-type, and an empty box is a poor first impression. -->
        <p class="linkme__specimen">
          <img
            class="linkme__wide"
            src="/badge.png"
            width="176"
            height="62"
            alt="The lem.my badge: the sigil, the wordmark, and the triple rule broken by the descender"
          />
          <img
            class="linkme__wide"
            src="/badge.webp"
            width="176"
            height="62"
            alt="The same badge animating: the rule rules in, the wordmark is typed, then the sigil's three asterisks land"
          />
          <img
            class="linkme__square"
            src="/badge-31.webp"
            width="62"
            height="62"
            alt="The 31 by 31 badge, the three asterisks of the sigil arriving one at a time"
          />
        </p>

        <!-- <div class="linkme__how">
          <p class="linkme__note">
            The badge for this site is not drawn yet. That is the frame it will land in — sigil,
            wordmark, this page's palette — and that is the snippet it will be offered with.
          </p>

          <pre><code>{{ LINKME_SNIPPET }}</code></pre>

          <p class="linkme__note linkme__note--dim">
            88 × 31, and it will not follow the theme of whoever links it. A hotlinked badge never
            sees this document's stylesheets, so it has to carry its own palette.
          </p>
        </div> -->
      </div>
    </XSection>
  </div>
</template>

<style scoped>
.badges {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.badges__head {
  max-width: 62ch;
}

.badges__title {
  font-family: var(--f-display);
  font-size: var(--t-36);
  margin-block: var(--space-3) var(--space-4);
}

.badges__lede {
  font-family: var(--f-display);
  font-size: var(--t-14);
  color: var(--c-dim);
  line-height: 1.5;
}

.badges__note {
  margin: var(--space-4) 0 0;
  font-size: var(--t-9);
  line-height: 1.6;
  color: var(--c-dim);
  max-width: var(--measure-medium);
  text-wrap: pretty;
}

.badges__grid {
  list-style: none;
  padding: 0;
  margin: var(--space-6) 0 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: var(--space-5) var(--space-3);
}

.badges__grid > li {
  display: flex;
}

.badges__grid:hover :deep(.badge:not(:hover) .badge__img),
.badges__grid:focus-within :deep(.badge:not(:focus-visible) .badge__img) {
  opacity: 0.4;
  filter: brightness(0.8);
}

.linkme {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
  align-items: flex-start;
  margin-top: var(--space-4);
}

.linkme__specimen {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-5);
  margin: 0;
}

.linkme__wide,
.linkme__square {
  display: block;
  /* Whole multiples of the source pixels, or the format turns to mush. */
  image-rendering: pixelated;
}

.linkme__how {
  flex: 1 1 24rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.linkme__note {
  margin: 0;
  font-size: var(--t-10);
  line-height: 1.6;
  color: var(--c-dim);
  max-width: var(--measure-medium);
  text-wrap: pretty;
}

.linkme__note--dim {
  font-size: var(--t-9);
  color: var(--c-dimmer);
}
</style>
