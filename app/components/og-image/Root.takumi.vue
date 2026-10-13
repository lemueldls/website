<script setup lang="ts">
import type { CSSProperties } from "vue";

import { SIGIL_PATH, SIGIL_TRANSFORM, SIGIL_VIEWBOX } from "~/lib/sigil";

const PALETTES = {
  dark: {
    bg: "#11111b",
    fg: "#cdd6f4",
    dim: "#9399b2",
    dimmer: "#6c7086",
    rule: "#45475a",
    ruleStrong: "#6c7086",
    ruleFaint: "#313244",
    accent: "#00a896",
  },
  light: {
    bg: "#eff1f5",
    fg: "#1e1e2e",
    dim: "#4c4f69",
    dimmer: "#6c7086",
    rule: "#dce0e8",
    ruleStrong: "#acb0be",
    ruleFaint: "#eef0f5",
    accent: "#00a896",
  },
} as const;

const GROUND = { dark: "dark", light: "light" } as const;

const props = withDefaults(
  defineProps<{
    colorMode?: keyof typeof GROUND;

    label?: string;

    title?: string;

    description?: string;

    meta?: string;
  }>(),
  {
    colorMode: "dark",
    label: "front sheet",
    title: "Lemuel De Los Santos",
    description: "Math and Computer Science research student.",
    meta: "lem.my",
  },
);

const theme = computed(() => GROUND[props.colorMode]);

const C = computed(() => PALETTES[theme.value]);

const W = 1200;
const H = 630;
const PAD_X = 84;
const PAD_TOP = 72;
const MARK = 36;
const MARK_ARM = 11;
const MASTHEAD = 44;
const RULE_Y = PAD_TOP + MASTHEAD + 36;

const LEADER_STEP = 16;
const LEADER_DOTS = Array.from(
  { length: Math.floor((W - PAD_X * 2) / LEADER_STEP) + 1 },
  (_, i) => PAD_X + i * LEADER_STEP,
);

const brandStyle = computed<CSSProperties>(() => ({
  height: `${MASTHEAD}px`,
  display: "flex",
  alignItems: "center",
  gap: "20px",
}));

const wordmarkStyle = computed<CSSProperties>(() => ({
  fontFamily: "Besley",
  fontSize: "30px",
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: C.value.dim,
}));

const eyebrowStyle = computed<CSSProperties>(() => ({
  fontFamily: "Asterism Text",
  fontSize: "22px",
  fontWeight: 400,

  lineHeight: 1.2,
  color: C.value.accent,
}));

const titleStyle = computed<CSSProperties>(() => ({
  fontFamily: "Besley",
  fontSize: "55px",
  fontWeight: 600,

  lineHeight: 1.25,
  color: C.value.fg,
  marginTop: "69px",
  lineClamp: 2,
  textOverflow: "ellipsis",
  textWrap: "balance",
}));

const descriptionStyle = computed<CSSProperties>(() => ({
  fontFamily: "Asterism Text",
  fontSize: "27px",
  fontWeight: 400,
  lineHeight: 1.5,
  color: C.value.dim,
  marginTop: "26px",
  // maxWidth: "880px",
  textWrap: "pretty",
  lineClamp: 3,
  textOverflow: "ellipsis",
}));

const metaStyle = computed<CSSProperties>(() => ({
  fontFamily: "Asterism Text",
  fontSize: "21px",
  fontWeight: 400,
  letterSpacing: "0.08em",
  color: C.value.dimmer,
}));

const rootStyle = computed<CSSProperties>(() => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: `${W}px`,
  height: `${H}px`,
  padding: `${PAD_TOP}px ${PAD_X}px 60px`,
  background: C.value.bg,
  fontFamily: "Asterism Text",
}));
</script>

<template>
  <div :data-theme="theme" :style="rootStyle">
    <svg
      :width="W"
      :height="H"
      :viewBox="`0 0 ${W} ${H}`"
      style="position: absolute; top: 0; left: 0"
      aria-hidden="true"
      focusable="false"
    >
      <g :stroke="C.ruleStrong" :stroke-width="1.5">
        <path :d="`M${MARK} ${MARK - MARK_ARM}V${MARK + MARK_ARM}`" />
        <path :d="`M${MARK - MARK_ARM} ${MARK}H${MARK + MARK_ARM}`" />
        <path :d="`M${W - MARK} ${MARK - MARK_ARM}V${MARK + MARK_ARM}`" />
        <path :d="`M${W - MARK - MARK_ARM} ${MARK}H${W - MARK + MARK_ARM}`" />
        <path :d="`M${MARK} ${H - MARK - MARK_ARM}V${H - MARK + MARK_ARM}`" />
        <path :d="`M${MARK - MARK_ARM} ${H - MARK}H${MARK + MARK_ARM}`" />
        <path :d="`M${W - MARK} ${H - MARK - MARK_ARM}V${H - MARK + MARK_ARM}`" />
        <path :d="`M${W - MARK - MARK_ARM} ${H - MARK}H${W - MARK + MARK_ARM}`" />
      </g>

      <g stroke-width="1">
        <path :d="`M${PAD_X} ${RULE_Y}H${W - PAD_X}`" :stroke="C.ruleStrong" />
        <path :d="`M${PAD_X} ${RULE_Y + 3}H${W - PAD_X}`" :stroke="C.rule" />
        <path :d="`M${PAD_X} ${RULE_Y + 6}H${W - PAD_X}`" :stroke="C.ruleFaint" />
      </g>
    </svg>

    <div :style="brandStyle">
      <svg
        :width="44"
        :height="44"
        :viewBox="SIGIL_VIEWBOX"
        :style="{ color: C.accent }"
        aria-hidden="true"
        focusable="false"
      >
        <g fill="currentColor">
          <path :d="SIGIL_PATH" :transform="SIGIL_TRANSFORM" />
        </g>
      </svg>

      <span :style="wordmarkStyle">Lemuel De Los Santos</span>
    </div>

    <h1 :style="titleStyle">{{ title }}</h1>

    <p v-if="description" :style="descriptionStyle">{{ description }}</p>

    <div style="flex-grow: 1" />

    <svg
      :width="W - PAD_X * 2"
      height="6"
      :viewBox="`0 0 ${W - PAD_X * 2} 6`"
      style="margin-top: 24px"
      aria-hidden="true"
      focusable="false"
    >
      <g :fill="C.rule">
        <circle v-for="(x, i) in LEADER_DOTS" :key="i" :cx="x - PAD_X" :cy="3" r="1.3" />
      </g>
    </svg>

    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        marginTop: '26px',
      }"
    >
      <span :style="metaStyle">{{ meta }}</span>
      <span :style="{ ...metaStyle }">@lem.my</span>
    </div>
  </div>
</template>
