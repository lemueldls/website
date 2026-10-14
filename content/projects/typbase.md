---
name: Typbase
role: Creator
date: 2026-08-28
endDate: present
description: Typbase is a local-first knowledge base made for the Typst language and the Atmosphere protocol.
technologies:
  - Rust
  - Typst
  - WebAssembly
  - CodeMirror
  - TypeScript
  - Nuxt
  - Loro
  - atproto
  - SQLite
  - Tauri
  - Harper
github: https://github.com/lemueldls/typbase
---

Mnemo taught me how to build an editor that renders Typst as you type. Typbase is what happens when
you take the parts of that which worked, throw away the parts that did not, and rebuild the
application on top of a reusable core.

The short version: everything in Typbase is a document you can query. Pages, categories, daily
notes, and sections are all readable from _inside_ a document, through `#typbase.query` and
`#typbase.page-link`. The workspace is not a filesystem that happens to have an index bolted on. It
is the index, and the filesystem is derived from it.

## Why not just improve Mnemo

Mnemo's renderer worked by compiling the note over and over, once per top-level block, and measuring
how much taller the page got each time to work out where the block boundaries fell. A
thirty-paragraph note meant thirty full Typst compiles on open. It worked, which is the dangerous
part, and it took shipping it and watching a laptop fan spin up over a grocery list before the shape
of the problem became obvious.

That approach had a second, deeper flaw. Each block's render depended on the accumulated side
effects of every block before it, mutating one shared source object inside a loop. There is no
clean box you can draw around that and call a function. Change one character in paragraph two, and
the output for paragraph three is invalidated by association, even though nothing in paragraph three
moved. A content-addressed cache wants a value, and this produced a history.

## The split that fixes it

Every note is now two Typst files. The **manuscript** is exactly what you typed, and it is the
coordinate system for everything the editor cares about: cursor positions, hover ranges,
diagnostics. The **galley** is synthesised from the manuscript on each recompile and is what Typst
actually receives: the prelude with page geometry and theme variables, plus a wrapper around each
top-level run of content.

That split is what makes the cache possible, because now each rendered block is a pure value rather
than a snapshot of mutable state. Typst compiles the galley once, hands back a laid-out frame tree,
and the renderer walks that tree and sorts the frame items into buckets by which manuscript range
each one came from. One compile, then a sort. `comemo` catches the collisions, so typing in
paragraph four leaves paragraphs one through three untouched.

## Registration marks

The awkward part of maintaining two parallel byte streams is answering one question continuously:
this byte in the galley, where does it live in the manuscript? Diagnostics and hover text come back
from Typst speaking galley coordinates, and the editor only understands manuscript coordinates.
Somewhere in between, there has to be a translator that stays correct while the galley is rebuilt
underneath it dozens of times a minute.

Every place the transform inserts or removes text, it drops a **registration mark**, a pair of
numbers recording that this manuscript position and this galley position used to be the same place.
Manuscript byte 0 lands at galley byte 70 because the prelude and the wrapper are 70 bytes. The mark
is `(0, 70)`. When Typst reports an error at galley byte 76, the lookup finds the nearest mark
_before_ that position, and does the arithmetic: 76 − 70, so the manuscript position is byte six.

The same list of marks reads in both directions, and which direction you read matters. Finding
something from the outside searches backward for the nearest mark and extrapolates forward.
Stepping into content from the inside walks forward until it finds the pair of marks bracketing the
position you are actually within. One sorted list, two readings, depending on whether you are
locating a thing or entering one.

## Neutralising broken documents

A renderer that lives inside a text editor has to accept that the document is wrong far more often
than it is right. Half of what you typed used to be a syntax error a tenth of a second ago. A
renderer that shows nothing the instant one diagnostic fires is unusable.

So a failed compile is treated as a starting point rather than a verdict. Find what is broken,
overwrite just that range with whitespace, recompile, repeat, up to 32 retries in the SVG renderer
so a document that cannot be repaired does not spin forever.

There are two granularities. Blanking a whole block is too blunt for equations, because a single
wrong variable name in a multi-line formula would take out the whole expression while you are still
typing the next term. So math gets a scalpel instead: splice a color wrapper around only the broken
identifier, and the healthy half of the equation keeps rendering in its normal styling while the
broken half renders visibly broken.

## Notebooks, plugins, and leaving

Once the workspace was a queryable document, the rest followed from the same premise. Notebook pages
split their source into cells on `//%` attribute lines. The plugin system is written in Typst
itself. The sidebar widgets, panes, and floating windows are in the same language as the notes,
because a document that can be queried can probably also be extended.

And export produces a compilable Typst project: plain `.typ` files with the library, the resolved
data, and the plugin modules they need. `typst compile --root .` works on the result, outside the
app, with nothing from Typbase required to build it.
