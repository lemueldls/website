---
name: Synquid
role: Creator
date: 2024-05-01
endDate: 2024-08-31
description: Synquid is a program synthesizer that uses refinement types to generate functional programs.
technologies:
  - Rust
  - Haskell
  - Git
github: https://github.com/lemueldls/synquid-rs
---

In the summer of 2024 I sat in on [UPenn's REPL](https://penn-repl.github.io/), a research
experience for undergraduates heading toward PhDs, and spent it reimplementing Synquid — a program
synthesizer that reads a refinement type as a specification and returns code that satisfies it.

Synquid was written in Haskell. Mine was written in Rust. Both produce identical output on all 64 of
the PLDI '16 benchmark programs, which was the acceptance bar I set before I let myself believe the
port was real.

## What the program is for

The prototype I finished was aimed at property-based testing. A generator for `Nat` should never
produce a negative number, and a generator for binary search trees should be able to produce _any_
valid binary search tree — not just the convenient ones. Those two properties have names: soundness
and completeness, and getting both from a hand-written generator is largely a matter of hoping.

Write the refinement type, get back an implementation plus a generator that provably only produces
valid values and provably can produce any valid value. No more hand-writing generators and hoping
they cover the space.

## The interesting trick

Completeness is the hard half, because it asks the generator to reason about what it _must not_
produce. The mechanism I built works by partitioning the space with the negation of the
specification: define a version of the signature that also accepts the values which fail the
original refinement, then let synthesis find something that satisfies the predicate while routing
everything outside it to the negative branch. Soundness follows from the positive branch, and
completeness from the fact that nothing falls through the gap.

Flat numeric ranges work cleanly. Recursive structures with interlocking invariants — lists that
must stay sorted, trees that must stay balanced — are where this gets genuinely difficult, and where
I ran out of summer.

The longer writeup of the underlying theory is in [my notes on property-based
testing](/writing/tbsscrg).
