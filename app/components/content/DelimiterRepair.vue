<script setup lang="ts">
type Rule = "dollar" | "attachment" | "grouping" | "content" | "codeblock" | "raw" | "string";

interface Case {
  key: string;
  label: string;
  text: string;
}

interface Fix {
  rule: Rule;
  /** Offset the insertion is written at, in the text as typed. */
  offset: number;
  insert: string;
}

const props = withDefaults(defineProps<{ preset?: string }>(), { preset: "" });

const CASES: Case[] = [
  {
    key: "attachment",
    label: "math with a bare attachment",
    text: "The limit is $x_",
  },
  {
    key: "content",
    label: "content block inside a call",
    text: "#f(1, [hello",
  },
  {
    key: "boundary",
    label: "closer lands at the blank line",
    text: "Open an equation $a + b\n\nand a paragraph after it.",
  },
  {
    key: "nested",
    label: "two closers, one offset",
    text: "#f(1, [hello\n\nand a paragraph after it.",
  },
];

const MESSAGES: Record<Rule, string> = {
  dollar: "unclosed math equation; inserted a closing `$`",
  attachment: "empty math attachment; inserted `#none`",
  grouping: "unclosed grouping; inserted a closing `)`",
  content: "unclosed content block; inserted a closing `]`",
  codeblock: "unclosed code block; inserted a closing `}`",
  raw: "unclosed raw text; inserted a closing backtick",
  string: "unclosed string; inserted a closing quote",
};

const RULE_OF: Record<string, Rule> = {
  "(": "grouping",
  "[": "content",
  "{": "codeblock",
};

const CLOSER_OF: Record<Rule, string> = {
  dollar: "$",
  attachment: "#none",
  grouping: ")",
  content: "]",
  codeblock: "}",
  raw: "`",
  string: '"',
};

const initial = CASES.find((item) => item.key === props.preset) ?? CASES[0]!;

const source = ref(initial.text);
const active = ref(initial.key);

function choose(key: string | number | undefined) {
  if (typeof key !== "string") return;

  const found = CASES.find((item) => item.key === key);
  if (!found) return;

  active.value = found.key;
  source.value = found.text;
}

/** The first blank line at or after `from`, or the end of the text. */
function boundary(text: string, from: number): number {
  const lf = text.indexOf("\n\n", from);
  const crlf = text.indexOf("\r\n\r\n", from);
  const at = [lf, crlf].filter((value) => value >= 0).sort((a, b) => a - b)[0];

  return at === undefined ? text.length : at;
}

const repaired = computed(() => {
  const text = source.value;
  const fixes: Fix[] = [];
  const open: { rule: Rule; offset: number }[] = [];
  let inMath = false;
  let inString = false;

  for (let at = 0; at < text.length; at += 1) {
    const char = text[at]!;

    if (char === "\\") {
      at += 1;
      continue;
    }

    if (inString) {
      if (char === '"') inString = false;
      continue;
    }

    if (inMath) {
      if (char === '"') inString = true;
      else if (char === "_" || char === "^") {
        const next = text[at + 1];
        const missing = next === undefined || next === "\n" || ")]}|_^$".includes(next);

        if (missing) fixes.push({ rule: "attachment", offset: at + 1, insert: "#none" });
      } else if (char === "$") inMath = false;

      continue;
    }

    if (char === "$") inMath = true;
    else if (char === '"' && !inString) {
      const close = text.indexOf('"', at + 1);

      if (close === -1) fixes.push({ rule: "string", offset: text.length, insert: '"' });
    } else if (char === "`" && text[at + 1] !== "`") {
      const close = text.indexOf("`", at + 1);

      if (close === -1) fixes.push({ rule: "raw", offset: text.length, insert: "`" });
    } else if (char === "(" || char === "[" || char === "{") {
      const rule = RULE_OF[char]!;
      open.push({ rule, offset: at });
    } else if (char === ")" || char === "]" || char === "}") {
      const last = open.pop();
      void last;
    }
  }

  if (inMath) fixes.push({ rule: "dollar", offset: boundary(text, 0), insert: "$" });

  // Inner first, so the deepest construct's closer is written before the
  // construct that contains it. A stable sort by offset then keeps that order
  // for the closers that share one offset, which is the whole rule.
  for (const item of [...open].reverse()) {
    fixes.push({
      rule: item.rule,
      offset: boundary(text, item.offset),
      insert: CLOSER_OF[item.rule],
    });
  }

  const sorted = [...fixes].sort((a, b) => a.offset - b.offset);

  let out = "";
  let at = 0;

  for (const fix of sorted) {
    if (fix.offset < at) continue;

    out += text.slice(at, fix.offset) + fix.insert;
    at = fix.offset;
  }

  out += text.slice(at);

  return { text: out, fixes: sorted };
});

/** The repaired text, cut into the bytes the user typed and the inserted ones. */
const pieces = computed(() => {
  const out: { text: string; inserted: boolean }[] = [];
  const { fixes } = repaired.value;
  let at = 0;

  for (const fix of fixes) {
    if (fix.offset < at) continue;

    if (fix.offset > at) out.push({ text: source.value.slice(at, fix.offset), inserted: false });
    out.push({ text: fix.insert, inserted: true });
    at = fix.offset;
  }

  if (at < source.value.length) out.push({ text: source.value.slice(at), inserted: false });

  return out;
});
</script>

<template>
  <figure class="repair">
    <XTabs
      :model-value="active"
      :tabs="CASES.map((item) => ({ label: item.label, value: item.key }))"
      label="A broken construct to repair"
      @update:model-value="choose"
    />

    <label class="repair__field">
      <span class="repair__label">type something broken</span>
      <textarea
        v-model="source"
        class="repair__source"
        spellcheck="false"
        rows="3"
        aria-label="Source fragment"
      />
    </label>

    <div class="repair__out">
      <p class="repair__caption">
        repaired, inserted bytes marked<span class="num">
          // {{ repaired.fixes.length }} repairs</span
        >
      </p>
      <code class="repair__text">
        <span
          v-for="(piece, at) in pieces"
          :key="at"
          class="repair__byte"
          :class="{ 'repair__byte--inserted': piece.inserted }"
          >{{ piece.text }}</span
        >
      </code>
    </div>

    <div class="repair__out">
      <p class="repair__caption">
        the warnings the user gets<span class="num"> // one per repair</span>
      </p>
      <ol class="repair__warnings">
        <li v-for="(fix, at) in repaired.fixes" :key="at" class="repair__warning">
          <span class="num repair__at">byte {{ fix.offset }}</span>
          <span>{{ MESSAGES[fix.rule] }}</span>
        </li>
        <li v-if="repaired.fixes.length === 0" class="repair__warning repair__warning--none">
          nothing to close
        </li>
      </ol>
    </div>

    <div class="repair__out">
      <p class="repair__caption">inserted bytes, in the order they were written</p>
      <code class="repair__text">
        <span v-for="(fix, at) in repaired.fixes" :key="at" class="repair__closer">{{
          fix.insert
        }}</span>
        <span v-if="repaired.fixes.length === 0" class="repair__none">none</span>
      </code>
    </div>

    <figcaption class="repair__foot">
      <span class="num">{{ source.length }} bytes in // {{ repaired.text.length }} bytes out</span>
      <span class="repair__note"
        >The scanner covers these four cases, not the full pass. It exists so the two rules can be
        watched: a closer lands at the first blank line, and closers sharing an offset come out
        inner-first.</span
      >
    </figcaption>
  </figure>
</template>

<style scoped>
.repair {
  margin-block: 1.75em;
  background: var(--c-code);
  border: var(--rule-width) solid var(--c-rule);
  padding: var(--space-4);
}

.repair__field {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  margin-block: var(--space-4);
}

.repair__label,
.repair__caption {
  font-family: var(--f-label);
  font-size: var(--t-8);
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: var(--c-dim);
}

.repair__source {
  width: 100%;
  resize: vertical;
  background: var(--c-sheet-2);
  border: var(--rule-width) solid var(--c-rule-faint);
  color: var(--c-code-fg);
  font-family: var(--f-mono);
  font-size: var(--t-9);
  line-height: 1.5;
  padding: var(--space-3);
}

.repair__source:focus-visible {
  outline: none;
  border-color: var(--c-accent);
}

.repair__out {
  margin-block-end: var(--space-4);
}

.repair__text {
  display: block;
  background: var(--c-sheet-2);
  border-left: 2px solid var(--c-rule);
  font-family: var(--f-mono);
  font-size: var(--t-9);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  padding: var(--space-3);
  color: var(--c-fg);
  margin-block-start: var(--space-2);
}

.repair__byte--inserted {
  color: var(--c-danger);
  background: color-mix(in srgb, var(--c-danger) 14%, transparent);
  border-block-end: 1px solid var(--c-danger);
}

.repair__closer {
  color: var(--c-danger);
}

.repair__none {
  color: var(--c-dimmer);
}

.repair__warnings {
  list-style: none;
  margin: var(--space-2) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-family: var(--f-label);
  font-size: var(--t-8);
  color: var(--c-fg);
}

.repair__warning {
  display: flex;
  gap: var(--space-3);
  align-items: baseline;
}

.repair__at {
  color: var(--c-dimmer);
  flex: none;
}

.repair__warning--none {
  color: var(--c-dimmer);
}

.repair__foot {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-block-start: var(--space-3);
  border-block-start: var(--rule-width) solid var(--c-rule-faint);
  font-family: var(--f-label);
  font-size: var(--t-7);
  color: var(--c-fg);
}

.repair__note {
  color: var(--c-dimmer);
  max-width: 70ch;
}
</style>
