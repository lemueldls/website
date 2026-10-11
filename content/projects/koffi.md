---
name: Koffi
role: Creator
date: 2026-05-01
endDate: 2026-09-30
description: Koffi is a novel cross-platform framework and integrated ecosystem for Rust × Kotlin Multiplatform projects.
technologies:
  - Rust
  - Kotlin
  - Java
  - WebAssembly
  - C
  - Git
github: https://github.com/lemueldls/koffi
---

Rust and Kotlin Multiplatform are both good at being the layer everything else talks to, which means
people eventually want them in the same project. The standard solutions for that involve a hand-written
header file and a bindings layer that gets committed, drifts, and someone regenerates by hand six months
later after a signature change.

Koffi is a framework and ecosystem for making Rust available to Kotlin Multiplatform without the
hand-written header file. You write Rust, you describe the surface you want exposed, and the interop
definitions are extracted from what actually compiled rather than written twice by a human.

## Extracting from the binary, not from a file

The core insight is that the information you need to write a C header is _already in the compiled
artifact_. A Rust library that is going to be called across an FFI boundary has, by construction,
already declared every type and function it intends to expose — it just declares them in a
language-specific form that dies at codegen.

Koffi's metadata extraction engine runs at link time and reads that declared surface back out of the
binary, then generates the C interop definitions and the Kotlin wrappers from it directly. The
signatures are derived from the thing that compiled, so they cannot drift from it.

This is the part I like most, because the usual failure mode of bindings generators is that they are
parsing the _source_ — which makes them a second compiler that has to track the first one's syntax
forever. Reading the artifact skips that entire class of problem.

## What the calls actually cost

Correctness first, but the calls also just cost too much otherwise. Native memory layouts were
optimised for the shapes Rust and Kotlin each expect, and data marshalling was tightened so that
values crossing the boundary move in the representation the receiving side already uses rather than
being reshaped on every hop.

## Two targets, two real worlds

Rust → JVM is genuinely two problems, not one. The Java Foreign Function Memory API (FFM) gives you
a supported, panics-in-the-right-place path on the JVM, and JNI gives you the portability that older
toolchains still require. Both are supported, which means the same Koffi definition produces
something usable whether you are on a modern JVM or not.

WebAssembly is a third world again — different pointer model, different costs, different idea of what
a "host function" even is — and it is supported too, because an ecosystem framework that works on two
of three targets is a trap for the third.

## The distributed version of a header

Once you no longer need a header file in the repository, the next question is what the layer of shared
definitions looks like. The ecosystem half of Koffi handles that: definitions that can be published,
depended on, and versioned, rather than a build artifact you accidentally commit.
