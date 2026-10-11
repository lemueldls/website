<script setup lang="ts">
const year = new Date().getFullYear();

const { socials, email, rings } = useAbout();

const elsewhere = computed(() => [...socials]);
</script>

<template>
  <footer class="ftr">
    <div class="ftr__rule" aria-hidden="true" />

    <div class="ftr__inner">
      <div class="ftr__col">
        <XLabel>Webrings</XLabel>
        <div class="ftr__rings">
          <span v-for="ring in rings" :key="ring.name" class="ftr__ring">
            <XButton
              variant="ghost"
              size="sm"
              square
              :href="ring.prev"
              :title="`Previous in ${ring.name}`"
            >
              <XIcon name="material-symbols:keyboard-double-arrow-left-sharp" size="xs" />
            </XButton>
            <XLink :href="ring.home">{{ ring.name }}</XLink>
            <XButton
              variant="ghost"
              size="sm"
              square
              :href="ring.next"
              :title="`Next in ${ring.name}`"
            >
              <XIcon name="material-symbols:keyboard-double-arrow-right-sharp" size="xs" />
            </XButton>
          </span>
        </div>
      </div>

      <div class="ftr__col">
        <XLabel>Elsewhere</XLabel>
        <ul class="ftr__socials">
          <li v-for="social in elsewhere" :key="social.title">
            <XLink class="ftr__social-link" :href="social.href" external>
              <XIcon class="ftr__social-icon" :name="social.icon" size="xs" />
              {{ social.title }}
            </XLink>
          </li>
        </ul>
      </div>

      <div class="ftr__col">
        <XPaletteGrid />
      </div>

      <p class="ftr__meta">
        <span class="ftr__meta-id">
          <span class="meta">© {{ year }}</span>
          <span class="ftr__dot" aria-hidden="true">·</span>
          <span class="meta">lem.my</span>
        </span>

        <XVisitorCounter />
      </p>
    </div>
  </footer>
</template>

<style scoped>
.ftr {
  margin-top: auto;

  background: var(--c-bg);
}

.ftr__rule {
  height: 0;
  border-top: 1px solid var(--c-rule-strong);
  position: relative;
  margin-bottom: var(--space-7);
}

.ftr__rule::after {
  content: "";
  position: absolute;
  top: -3px;
  left: 0;
  width: 100%;
  height: 0;
  border-top: 1px solid var(--c-rule);
}

.ftr__inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: var(--space-6) var(--space-7);
  max-width: var(--sheet-max);
  margin-inline: auto;
  padding: 0 clamp(var(--space-4), 3vw, var(--space-8)) var(--space-7);
}

.ftr__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ftr__note {
  font-size: var(--t-8);
  line-height: 1.6;
  color: var(--c-dimmer);
  max-width: 22rem;
}

.ftr__rings {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ftr__ring {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--t-8);
}

.ftr__socials {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--t-8);
}

.ftr__social-icon {
  display: inline-flex;
  margin-left: 0.5em;
  margin-right: 0.25em;
  color: var(--c-dimmer);
}

.ftr__social-link:hover .ftr__social-icon {
  color: var(--c-accent);
}

.ftr__meta {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);

  justify-content: space-between;
  padding-top: var(--space-4);
  border-top: 1px solid var(--c-rule);
  color: var(--c-dimmer);
}

.ftr__meta-id {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
}

.ftr__dot {
  color: var(--c-rule-strong);
}
</style>
