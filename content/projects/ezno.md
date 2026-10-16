---
name: Ezno
role: Contributor
since: 2024-03
lastActive: 2025-02
status: archived
description: Ezno is a correct and efficient TypeScript type checker and compiler with additional experiments.
technologies:
  - Rust
  - TypeScript
  - Git
github: https://github.com/kaleidawave/ezno
---

Ezno is a TypeScript type checker and compiler written in Rust. I was a contributor for just under a
year, working on the checker itself rather than on the surrounding tooling.

TypeScript's type system is unusually difficult to reimplement, because it is not a formal type
system that grew features. It is a set of behaviors that accumulated over a decade around whatever
real code was doing at the time, and a checker has to reproduce the _behavior_, including the
behavior nobody considers sensible, to be usable. The specification is the existing checker, and the
existing checker is a large, subtle TypeScript program.

So most of the work is behavior archaeology.

## Property checking and assignment

A chunk of my work was on property checking and subtype comparison for class and object assignments.
This sounds like one rule, but it is where a lot of TypeScript's incidental behavior collects:
optional properties, index signatures, fresh object literals, and the difference between a check
that fails and a check that fails _here but not at declaration site_.

## Object destructuring

Destructuring patterns interact with the checker in a way that is easy to underestimate. The pattern
is a source of bindings, but it is also a value being checked, and both things have to happen in the
right order for the types to come out right.

The part I enjoy about this kind of work is that the fix is often small and the failure it prevents
is subtle enough that you only find out you got it wrong six months later.

## Regular expressions, as actual types

The piece I am happiest about is complete support for regular expressions: not regex-_like_ syntax,
but `RegExp` types with real constant string pattern evaluation, so the checker can reason about a
pattern that is known statically in the ways it reasons about a literal type.

This is the part of TypeScript's type system where it stops being a type checker and starts being
something closer to a small proof system, which is exactly the kind of thing worth building in Rust.

## The language server

The other side of the project was internal: extending the language server so the project could be
developed and used on more platforms without fighting the toolchain. Not glamorous, but the thing you
notice when it is missing.

Ezno is at [github.com/kaleidawave/ezno](https://github.com/kaleidawave/ezno).
