---
name: Mnemo
role: Creator
date: 2023-06-01
endDate: present
description: Mnemo is a local-first note-taking app built on the Typst ecosystem, designed to minimize distractions.
technologies:
  - Sass
  - TypeScript
  - Vue.js
  - Rust
  - Typst
  - CodeMirror
  - Nuxt
  - UnoCSS
  - Tauri
  - Git
  - Cloudflare
link: https://mnemo.world/
github: https://github.com/lemueldls/mnemo
---

Mnemo has no preview pane. There is no split view and no render button. You type Typst, and the
second your cursor leaves a paragraph, that paragraph turns into the document it describes.

People who use it usually assume there is a clever trick swapping a canvas for a textarea
underneath. There is, sort of. But that part is not actually hard.

What's hard is that Typst wants a complete, valid document before it will compile anything, and it
stops at the first thing that's wrong. An editor that renders live has the opposite problem. The
document is basically always broken, because you are always mid-keystroke on something.

## The first version, which was wrong

The renderer I shipped first worked through a note's top-level blocks one at a time. For each block,
it appended that block's compiled text to a source it had been building up, then recompiled the
entire thing from scratch and measured how much taller the page got to work out the block's height.

Picture a note with thirty paragraphs. Opening it meant running the Typst compiler thirty separate
times, each one re-laying out everything before it, just to answer one question: how tall did the
page get this time.

There was a small fossil from that era still sitting in the diff, on the line deciding where an
inline block's content actually ends: twenty-nine bytes. No name, no derivation, and a comment
confessing, politely, that nobody was sure this was right. I remembered it working on the documents
I happened to be testing with at the time, which is the kind of sentence that should worry you. It
worried me too, eventually.

## The block cache that never had a chance

What actually killed that design was not the magic number. It was that none of it could be cached.

Caching a function's output only works if its inputs mean something stable on their own. Here, the
unit of work per block was "the compiled state of the entire document up to and including this
block," produced by mutating one shared source object inside a loop. There's no clean box you can
draw around that and say: given exactly this, you'll always get exactly that. Every block's render
depended on the accumulated side effects of every block before it, so there was no value you could
hash and compare. It was a history.

Say you tried to cache it anyway. The cache key would have to be something like "all the text from
the start of the document up to this point." Change one character in paragraph two, and every cache
entry for paragraph three onward goes stale at once, even though paragraphs three through thirty
never changed. That's the one workload that matters for an editor: someone typing into a single
paragraph while the rest of the document sits still. The cache would have been useless for exactly
the thing it needed to be useful for.

## What survived

The idea of blanking a broken range with whitespace of the same length crossed two rewrites
untouched, and it is still the heart of how a live renderer tolerates a half-typed document. The
replacement is deliberately the same length as what it replaces, so no downstream offset shifts.
Everything from that paragraph on still sits exactly where it always sat. Only the paragraph itself
blinks out of view for as long as the typo exists.

The parts that were wrong taught me more than the parts that were right. Thirty full compiles to
find a page break has a way of making the actual problem obvious, even if it took longer than I'd
like to admit before I stopped patching the symptom and started fixing the shape of the thing
underneath it.

That second half lives in [Typbase](/projects/typbase), which is where this work went next.
