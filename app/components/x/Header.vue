<script setup lang="ts">
const { toggleTheme, resolvedTheme } = useTheme();

const isDark = computed(() => resolvedTheme.value === "dark");
const themeLabel = computed(() => (isDark.value ? "Switch to Light" : "Switch to Dark"));

const nav = [
  { to: "/cv", label: "Curriculum Vitae" },
  { to: "/projects", label: "Projects" },
  { to: "/writing", label: "Writing" },
  { to: "/fonts", label: "Fonts" },
  { to: "/wallpapers", label: "Wallpapers" },
];

const menuOpen = ref(false);
const menuLabel = computed(() => (menuOpen.value ? "Close menu" : "Open menu"));

const route = useRoute();
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);

const headerEl = useTemplateRef<HTMLElement>("headerEl");

const wordmarkStepped = ref(route.path === "/");

let nameplateEl: HTMLElement | null = null;
let mutations: MutationObserver | null = null;

function syncWordmark() {
  if (import.meta.server) return;

  if (nameplateEl && !nameplateEl.isConnected) nameplateEl = null;
  nameplateEl ??= document.querySelector<HTMLElement>("[data-nameplate]");

  if (!nameplateEl || !headerEl.value) {
    wordmarkStepped.value = false;
    return;
  }

  wordmarkStepped.value =
    nameplateEl.getBoundingClientRect().bottom >= headerEl.value.getBoundingClientRect().bottom;
}

let frame = 0;
function scheduleSync() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    syncWordmark();
  });
}

onMounted(() => {
  syncWordmark();

  window.addEventListener("scroll", scheduleSync, { passive: true });
  window.addEventListener("resize", scheduleSync);

  mutations = new MutationObserver(scheduleSync);
  mutations.observe(document.body, { childList: true, subtree: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleSync);
  window.removeEventListener("resize", scheduleSync);
  mutations?.disconnect();
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
});
</script>

<template>
  <header ref="headerEl" class="hdr">
    <PopoverRoot v-model:open="menuOpen">
      <PopoverAnchor as-child>
        <div class="hdr__inner">
          <NuxtLink
            to="/"
            class="hdr__mark"
            :class="{ 'hdr__mark--stepped': wordmarkStepped }"
            title="Lemuel De Los Santos"
          >
            <XSigil class="hdr__sigil" size="1.5em" />
            <span class="hdr__wordmark"
              >Lemuel <span class="hdr__last-name">De Los Santos</span></span
            >
          </NuxtLink>

          <nav class="hdr__nav" aria-label="Primary">
            <NuxtLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="hdr__link"
              active-class="hdr__link--active"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="hdr__tools">
            <XButton variant="ghost" square :title="themeLabel" @click="toggleTheme()">
              <XIcon
                :name="
                  isDark
                    ? 'material-symbols:dark-mode-outline-sharp'
                    : 'material-symbols:light-mode-outline-sharp'
                "
              />
            </XButton>

            <PopoverTrigger as-child>
              <XButton
                class="hdr__menu"
                variant="ghost"
                square
                :title="menuLabel"
                aria-label="Menu"
              >
                <XIcon
                  :name="menuOpen ? 'material-symbols:close-sharp' : 'material-symbols:menu-sharp'"
                />
              </XButton>
            </PopoverTrigger>
          </div>
        </div>
      </PopoverAnchor>

      <PopoverPortal>
        <PopoverContent
          class="hdr__sheet"
          side="bottom"
          align="start"
          :side-offset="8"
          :align-offset="12"
          :collision-padding="12"
        >
          <span class="mark mark--tl" />
          <span class="mark mark--tr" />
          <span class="mark mark--bl" />
          <span class="mark mark--br" />

          <nav class="hdr__popnav" aria-label="Primary">
            <NuxtLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="hdr__link"
              active-class="hdr__link--active"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
    <div class="hdr__rule" aria-hidden="true" />
  </header>
</template>

<style>
.hdr {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  backdrop-filter: blur(6px) saturate(1.1);
}

.hdr__inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-6);
  max-width: var(--sheet-max);
  margin-inline: auto;
  padding: var(--space-2);
}

.hdr__mark {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  text-decoration: none;
  border: none;
  flex: 1 0 auto;
}

.hdr__sigil {
  color: var(--c-accent);
  margin-left: var(--space-1);
}

.hdr__wordmark {
  font-family: var(--f-display);
  font-size: var(--t-12);
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition:
    opacity var(--dur) var(--ease-folio),
    translate var(--dur) var(--ease-folio);
}

.hdr__last-name {
  color: var(--c-dim);
}

.hdr__mark:hover .hdr__last-name {
  color: var(--c-accent);
}

.hdr__mark--stepped .hdr__wordmark {
  opacity: 0;
  translate: 0 0.25em;
}

.hdr__rule {
  position: relative;
  height: 0;
  border-top: 1px solid var(--c-rule-strong);
}

.hdr__rule::after {
  content: "";
  position: absolute;
  top: 1px;
  left: 0;
  width: 100%;
  height: 0;
  border-top: 1px solid var(--c-rule);
}

.hdr__nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-left: auto;
}

.hdr__link {
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dim);
  text-decoration: none;
  padding: 0.35em 0.5em;
  border: none;
  white-space: nowrap;
  transition: color var(--dur-fast) var(--ease);
}

.hdr__link:hover {
  color: var(--c-fg);
}

.hdr__link--active {
  color: var(--c-accent);
  box-shadow: inset 0 -2px 0 var(--c-accent);
}

.hdr__tools {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.hdr__menu {
  display: none !important;
}

@media (max-width: 720px) {
  .hdr__inner {
    gap: var(--space-3);
  }

  .hdr__menu {
    display: inline-flex !important;
  }

  .hdr__nav {
    display: none;
  }
}

@media (max-width: 360px) {
  .hdr__wordmark {
    display: none;
  }
}

.hdr__sheet {
  position: relative;
  z-index: var(--z-command);
  margin-top: var(--space-2);
  width: calc(var(--reka-popover-trigger-width) - 1.5rem);
  background: var(--c-sheet);
  border: var(--rule-width) solid var(--c-rule-strong);
  box-shadow: 0 var(--space-3) var(--space-8) color-mix(in srgb, var(--c-bg) 45%, transparent);
}

.hdr__sheet > .mark {
  --mark-color: var(--c-rule-strong);
}

.hdr__sheet[data-state="open"] {
  animation: hdr-sheet-in var(--dur) var(--ease-folio) both;
}

@keyframes hdr-sheet-in {
  from {
    opacity: 0;
    translate: 0 calc(var(--space-2) * -1);
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

.hdr__popnav {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

.hdr__popnav .hdr__link {
  padding: var(--space-3) var(--space-4);
  font-size: var(--t-9);
  border-bottom: var(--rule-width) solid var(--c-rule);
}

.hdr__popnav .hdr__link:last-of-type {
  border-bottom: none;
}

.hdr__popnav .hdr__link--active {
  color: var(--c-accent);
  background: var(--c-sheet-2);
  box-shadow: inset 3px 0 0 var(--c-accent);
}
</style>
