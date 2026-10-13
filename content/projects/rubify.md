---
name: Rubify
role: Creator
date: 2026-01-01
endDate: 2026-03-31
description: Rubify is a program made to automatically annotate any font with ruby characters.
technologies:
  - Rust
  - Git
github: https://github.com/lemueldls/rubify
---

Ruby characters are the small annotations that sit above or beside a base character to show how it
pronounces or romanises: the pinyin over a Mandarin character, or the furigana over kanji. For
anyone learning either language from text, they are the difference between reading and guessing.

The problem is that you cannot just render them as normal text. Ruby is a _font-level_ feature,
because the annotation has to be positioned precisely relative to its base glyph, across every
character the annotation might attach to, in every combination. You are not annotating a document.
You are rebuilding a font.

Rubify takes any font and produces an annotated version of it.

## The arithmetic of a glyph that carries another glyph

A base glyph with a ruby annotation is not a glyph with text drawn over it. The base character is
narrower than the space it occupies, because the annotation it carries needs room above it. The
outline has to shift, the advance width has to change, and the relationship between the two has to
be consistent across the entire character set. Otherwise a character that gets a short annotation in
one place looks fine and the same character with a long annotation collides in another.

Getting that wrong does not look like a font bug. It looks like a font.

## Every romanization, all at once

The romanisation methods differ in ways that matter if you read with them: Pinyin for Mandarin, with
its tones, and romaji for Japanese. A person learning Mandarin wants the Mandarin one, and a person
learning Japanese wants the other, and rarely wants both at once.

Rubify builds the fonts annotated with each supported romanisation independently, so what you install
matches what you are learning. The distribution is multiple families, multiple weight and style
combinations, all annotated, all usable.

## The part nobody warns you about

A font with all of these annotations, across all the supported weights and styles, is enormous.
Distribution size needed its own tooling: a custom collection builder that produces font collections
(`ttc`) rather than separate font binaries, plus optimization passes so the shipped artifact is not
the intermediate one.

That last part is the least glamorous thing in the project and probably the thing most users notice.

The fonts are generated with [Rubify](https://github.com/lemueldls/rubify) and are available from the
[specimen library](/fonts).
