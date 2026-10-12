<script setup lang="ts">
type Lane = "raw" | "synth" | "laid";
type BlockKind = "heading" | "item" | "text";
type SegmentKind = "source" | "wrapper" | "separator";
type Style = "plain" | "strong" | "emph" | "code" | "math";

interface Segment {
  text: string;
  kind: SegmentKind;
}

interface Span {
  text: string;
  style: Style;
}

interface Block {
  index: number;
  kind: BlockKind;
  rawStart: number;
  rawEnd: number;
  /** Source bytes as they land in the synth, excluding the wrappers. */
  synthStart: number;
  synthEnd: number;
  /** Blank lines that were dropped immediately before this block. */
  dropped: number;
  segments: Segment[];
  spans: Span[];
}

const props = withDefaults(defineProps<{ lane?: Lane }>(), { lane: "synth" });

const WRAPPER_PREFIX = "#block(stroke:0pt,width:100%)[";
const WRAPPER_SUFFIX = "\n]";
const SEPARATOR = "\n";

const NOTE = `= A note about blocks

This paragraph is one top-level block, and it renders as one box with its own
bounds. Nothing else in the note can land inside it.

A second paragraph, separated by a blank line. The blank line is gone from the
compiled text. The gap comes from the wrapper.

- the first item
- the second item

A block with an inline equation $a_n = a_(n-1) + a_(n-2)$ in the middle of a
sentence, which is why a block is not the same thing as a line.`;

const source = ref(NOTE);
const lane = ref<Lane>(props.lane);
const textarea = useTemplateRef<HTMLTextAreaElement>("textarea");
const caret = ref(NOTE.indexOf("bounds") + 4);

const lines = computed(() => {
  const bounds: { start: number; end: number; text: string; blank: boolean }[] = [];
  let at = 0;

  for (const text of source.value.split("\n")) {
    bounds.push({ start: at, end: at + text.length, text, blank: text.trim() === "" });
    at += text.length + 1;
  }

  return bounds;
});

const blocks = computed<Block[]>(() => {
  const out: Block[] = [];
  let current: string[] = [];
  let start = 0;
  let dropped = 0;
  let at = 0;
  let synthAt = 0;

  const flush = (end: number) => {
    if (current.length === 0) return;

    const text = current.join("\n");
    const heading = current[0]?.startsWith("=") ?? false;
    const item = current.every((line) => /^\s*[-+]\s/.test(line));
    const synthStart = synthAt + WRAPPER_PREFIX.length;

    out.push({
      index: out.length,
      kind: heading ? "heading" : (item && "item") || "text",
      rawStart: start,
      rawEnd: end,
      synthStart,
      synthEnd: synthStart + text.length,
      dropped,
      segments: [
        { text: WRAPPER_PREFIX, kind: "wrapper" },
        { text, kind: "source" },
        { text: WRAPPER_SUFFIX, kind: "wrapper" },
        { text: SEPARATOR, kind: "separator" },
      ],
      spans: markup(text),
    });

    synthAt += WRAPPER_PREFIX.length + text.length + WRAPPER_SUFFIX.length + SEPARATOR.length;
    dropped = 0;
    current = [];
  };

  for (const line of lines.value) {
    if (line.blank) {
      flush(line.start);
      if (current.length === 0) dropped += 1;
      at = line.end;
      continue;
    }

    const opens = line.text.startsWith("=") || /^\s*[-+]\s/.test(line.text);

    if (opens && current.length > 0) flush(line.start);
    if (current.length === 0) start = line.start;

    current.push(line.text);
    at = line.end;
  }

  flush(at);

  return out;
});

/** The five inline styles the article mentions, nothing more. */
function markup(text: string): Span[] {
  const out: Span[] = [];
  const pattern = /(\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|\$[^$\n]+\$)/g;
  let last = 0;

  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;

    if (at > last) out.push({ text: text.slice(last, at), style: "plain" });

    const raw = match[0];

    if (raw.startsWith("*")) out.push({ text: raw.slice(1, -1), style: "strong" });
    else if (raw.startsWith("_")) out.push({ text: raw.slice(1, -1), style: "emph" });
    else if (raw.startsWith("`")) out.push({ text: raw.slice(1, -1), style: "code" });
    else out.push({ text: raw.slice(1, -1), style: "math" });

    last = at + raw.length;
  }

  if (last < text.length) out.push({ text: text.slice(last), style: "plain" });

  return out.length > 0 ? out : [{ text, style: "plain" }];
}

const caretBlock = computed(() =>
  blocks.value.find((block) => caret.value >= block.rawStart && caret.value <= block.rawEnd),
);

const totalDropped = computed(() => blocks.value.reduce((sum, block) => sum + block.dropped, 0));
const generatedBytes = computed(
  () => blocks.value.length * (WRAPPER_PREFIX.length + WRAPPER_SUFFIX.length + SEPARATOR.length),
);

const LANES: { label: string; value: Lane }[] = [
  { label: "raw", value: "raw" },
  { label: "synth", value: "synth" },
  { label: "laid out", value: "laid" },
];

function trackCaret() {
  caret.value = textarea.value?.selectionStart ?? caret.value;
}

/** The click gesture: a click in the render lands the caret in the source. */
function jumpTo(block: Block) {
  const target = caret.value >= block.rawStart && caret.value <= block.rawEnd ? 0 : block.rawStart;

  textarea.value?.focus();
  textarea.value?.setSelectionRange(target, target);
  caret.value = target;
}

function listing(block: Block) {
  return block.segments.map((segment) => segment.text).join("");
}
</script>

<template>
  <figure class="partition">
    <XTabs v-model="lane" :tabs="LANES" label="Which text you are looking at" />

    <div class="partition__grid">
      <div class="partition__pane">
        <p class="partition__caption">what you type</p>
        <textarea
          ref="textarea"
          v-model="source"
          class="partition__source"
          spellcheck="false"
          aria-label="Source note"
          @keyup="trackCaret"
          @click="trackCaret"
          @select="trackCaret"
        />
      </div>

      <div class="partition__pane">
        <template v-if="lane === 'raw'">
          <p class="partition__caption">raw text, byte for byte</p>
          <ol class="partition__list">
            <li v-for="block in blocks" :key="block.index" class="partition__row">
              <span class="partition__range num"> {{ block.rawStart }}..{{ block.rawEnd }} </span>
              <span v-if="block.dropped" class="partition__drop">
                {{ block.dropped }} blank line{{ block.dropped > 1 ? "s" : "" }} before this block
              </span>
            </li>
          </ol>
        </template>

        <template v-else-if="lane === 'synth'">
          <p class="partition__caption">the text the compiler actually sees</p>
          <ol class="partition__list">
            <li v-for="block in blocks" :key="block.index" class="partition__row">
              <span class="partition__range num">
                {{ block.synthStart }}..{{ block.synthEnd }}
              </span>
              <code class="partition__synth">
                <span
                  v-for="(segment, at) in block.segments"
                  :key="at"
                  class="partition__seg"
                  :class="`partition__seg--${segment.kind}`"
                  >{{ segment.text }}</span
                >
              </code>
            </li>
          </ol>
        </template>

        <template v-else>
          <p class="partition__caption">what the editor puts on screen</p>
          <div class="partition__stage">
            <template v-for="block in blocks" :key="block.index">
              <p v-if="block.dropped" class="partition__gap" :data-count="block.dropped">
                <span class="partition__gap-label num">{{ block.dropped }} dropped</span>
              </p>

              <div
                class="partition__block"
                :class="{
                  'partition__block--source': caretBlock?.index === block.index,
                  [`partition__block--${block.kind}`]: true,
                }"
                @click="jumpTo(block)"
              >
                <template v-if="caretBlock?.index === block.index">
                  <code class="partition__source-line">{{ listing(block) }}</code>
                  <p class="partition__reserved">
                    <span class="num">height reserved for the render</span>
                  </p>
                </template>
                <template v-else>
                  <component
                    :is="block.kind === 'heading' ? 'h5' : block.kind === 'item' ? 'li' : 'p'"
                    class="partition__mark"
                    :class="`partition__mark--${block.kind}`"
                  >
                    <template v-for="(span, at) in block.spans" :key="at">
                      <strong v-if="span.style === 'strong'">{{ span.text }}</strong>
                      <em v-else-if="span.style === 'emph'">{{ span.text }}</em>
                      <code v-else-if="span.style === 'code'">{{ span.text }}</code>
                      <span v-else-if="span.style === 'math'" class="partition__math">{{
                        span.text
                      }}</span>
                      <template v-else>{{ span.text }}</template>
                    </template>
                  </component>
                </template>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>

    <figcaption class="partition__foot">
      <span class="num"
        >{{ blocks.length }} blocks // {{ generatedBytes }} generated bytes //
        {{ totalDropped }} dropped blank lines</span
      >
      <span class="partition__note"
        >The block split and the markup styling here are the article's rules running on a textarea,
        not the Typst compiler. The offsets are real for this split, and they are why the wrapper's
        thirty bytes have to be mapped.</span
      >
    </figcaption>
  </figure>
</template>

<style scoped>
.partition {
  margin-block: 1.75em;
  background: var(--c-code);
  border: var(--rule-width) solid var(--c-rule);
  padding: var(--space-4);
}

.partition__grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  margin-top: var(--space-4);
}

@media (max-width: 640px) {
  .partition__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.partition__pane {
  min-width: 0;
}

.partition__caption {
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dimmer);
  margin-block-end: var(--space-2);
}

.partition__source {
  width: 100%;
  min-height: 14rem;
  resize: vertical;
  background: var(--c-sheet-2);
  border: var(--rule-width) solid var(--c-rule-faint);
  color: var(--c-code-fg);
  font-family: var(--f-mono);
  font-size: var(--t-9);
  line-height: 1.4;
  padding: var(--space-3);
}

.partition__source:focus-visible {
  outline: none;
  border-color: var(--c-accent);
}

.partition__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.partition__row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.partition__range {
  font-family: var(--f-label);
  font-size: var(--t-7);
  color: var(--c-accent);
}

.partition__drop {
  font-family: var(--f-label);
  font-size: var(--t-7);
  color: var(--c-dimmer);
}

.partition__synth {
  display: block;
  background: var(--c-sheet-2);
  border-left: 2px solid var(--c-rule);
  font-family: var(--f-mono);
  font-size: var(--t-8);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  padding: var(--space-2) var(--space-3);
  color: var(--c-fg);
}

.partition__seg--source {
  color: var(--c-fg);
}

/* Generated bytes are the whole reason a map exists, so they are the only
   thing on this pane that is not the user's own text. */
.partition__seg--wrapper,
.partition__seg--separator {
  color: var(--c-mark);
}

.partition__stage {
  display: flex;
  flex-direction: column;
}

.partition__gap {
  margin: 0;
  padding-block: var(--space-1);
  border-bottom: 1px dashed var(--c-rule-faint);
  text-align: end;
}

.partition__gap-label {
  font-family: var(--f-label);
  font-size: var(--t-7);
  color: var(--c-dimmer);
}

.partition__block {
  cursor: text;
  /* 1.2em, Typst's own default for a block, which is what the gap is made of. */
  margin-block: 0.6em;
}

.partition__block--source {
  border-left: 2px solid var(--c-accent);
  padding-inline-start: var(--space-3);
  cursor: default;
}

.partition__mark {
  margin: 0;
  color: var(--c-fg);
}

.partition__mark--heading {
  font-family: var(--f-display);
  font-size: var(--t-18);
  font-weight: var(--f-display-weight);
  list-style: none;
}

.partition__mark--item {
  list-style: disc;
  margin-inline-start: var(--space-5);
}

.partition__mark code,
.partition__source-line {
  font-family: var(--f-mono);
  font-size: var(--t-9);
  background: var(--c-sheet-2);
  padding: 0.1em 0.3em;
}

.partition__source-line {
  display: block;
  background: none;
  padding: 0;
  color: var(--c-fg);
  white-space: pre-wrap;
  word-break: break-word;
}

.partition__math {
  font-style: italic;
}

.partition__reserved {
  margin-block: var(--space-1) 0;
  font-family: var(--f-label);
  font-size: var(--t-7);
  color: var(--c-dimmer);
}

.partition__foot {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-block-start: var(--space-4);
  padding-block-start: var(--space-3);
  border-block-start: var(--rule-width) solid var(--c-rule-faint);
  font-family: var(--f-label);
  font-size: var(--t-7);
  color: var(--c-fg);
}

.partition__note {
  color: var(--c-dimmer);
  max-width: 70ch;
}
</style>
