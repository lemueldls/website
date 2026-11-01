<script setup lang="ts">
const year = new Date().getFullYear();

const { socials, email, rings } = useAbout();
</script>

<template>
  <footer class="ftr">
    <div class="ftr__rule" aria-hidden="true" />

    <div class="ftr__inner">
      <div class="ftr__col">
        <XLabel icon="material-symbols:public-outline-sharp">Webrings</XLabel>
        <div class="ftr__rings no-print-chrome">
          <div v-for="ring in rings" :key="ring.name" class="ftr__ring">
            <div class="ftr__ring-nav">
              <XButton
                variant="ghost"
                size="sm"
                square
                :href="ring.prev"
                target="_self"
                :title="`Previous in ${ring.name}`"
              >
                <XIcon name="material-symbols:keyboard-double-arrow-left-outline-sharp" />
              </XButton>
              <XLink class="ftr__ring-link" :href="ring.home" target="_self">{{ ring.name }}</XLink>
              <!-- <XButton
                variant="ghost"
                size="sm"
                square
                :href="ring.rand"
                target="_self"
                :title="`Random site in ${ring.name}`"
              >
                <XIcon name="material-symbols:ifl-outline-sharp"  />
              </XButton> -->
              <XButton
                variant="ghost"
                size="sm"
                square
                :href="ring.next"
                target="_self"
                :title="`Next in ${ring.name}`"
              >
                <XIcon name="material-symbols:keyboard-double-arrow-right-outline-sharp" />
              </XButton>
            </div>
          </div>
        </div>
      </div>

      <div class="ftr__col">
        <XLabel icon="material-symbols:share-outline-sharp">Socials</XLabel>
        <ul class="ftr__socials">
          <li v-for="social in socials" :key="social.title">
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
    </div>

    <div class="ftr__meta">
      <span class="ftr__meta-id">
        <!-- <span class="text">Copyright © {{ year }}</span> -->
        <!-- <span class="ftr__dot" aria-hidden="true">·</span> -->
        <!-- <span class="meta">lem.my</span> -->
      </span>

      <span class="ftr__meta-badges">
        <!-- <XSiteBadge to="/badges" /> -->

        <XVisitorCounter />
      </span>
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
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-7) var(--space-10);
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
  /* line-height: 1.6; */
  color: var(--c-dimmer);
  max-width: 22rem;
}

.ftr__rings {
  display: flex;
  flex-direction: column;
  /* gap: var(--space-1); */
}

.ftr__ring {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--t-8);
}

.ftr__ring-badge {
  align-self: flex-start;
}

.ftr__ring-nav {
  display: flex;
  align-items: center;
  /* gap: var(--space-1); */
  flex-wrap: wrap;
}

.ftr__ring-link {
  margin: 0 var(--space-1);
}

.ftr__socials {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--t-8);
}

.ftr__social-icon {
  display: inline-flex;
  margin-left: 0.25em;
  margin-right: 0.125em;
  color: var(--c-dimmer);
  transition: color var(--dur-fast) var(--ease);
}

.ftr__social-link:hover .ftr__social-icon {
  color: var(--c-accent);
}

.ftr__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  justify-content: space-between;
  border-top: 1px solid var(--c-rule);
  color: var(--c-dimmer);
  margin-inline: auto;
  max-width: var(--sheet-max);
  padding: var(--space-4);
}

.ftr__meta-id {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
}

.ftr__meta-badges {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.ftr__dot {
  color: var(--c-rule-strong);
}
</style>
