---
name: Language of Meaning & Types
role: Creator
since: 2024-03
lastActive: 2024-06
status: archived
description: Language of Meaning and Types (LMT) is a proof-oriented meta-programming and specification language.
technologies:
  - Rust
  - Git
github: https://github.com/lemueldls/lmt
---

Every programmer eventually collides with the limitations of their type system. If you write
TypeScript, you have probably found yourself using runtime validation libraries to make sure an
incoming network integer is actually positive. If you write Rust, you might wrap a primitive in a
tuple struct and expose a constructor that returns a `Result`, so the invariant cannot be violated
down the line.

Both patterns work, but they draw a sharp line between compile-time checking and runtime
verification. We spend runtime cycles asserting facts we feel our code should already clearly state.

On the other end of the spectrum sit formal verification environments like Rocq and Lean. You can
prove absolute mathematical correctness about your algorithms with them, but they live in a separate
ecosystem, and working there means behaving more like a mathematician proving theorems than a
developer writing application logic.

I wanted a middle ground, so I started building **LMT**, short for Language of Meaning & Types and
pronounced _limit_. It is a proof-oriented specification and meta-programming language where types
and values live in the same logical space.

## Types as sets, values as singletons

In traditional languages, a type classifies data and a value is an instance of it. LMT collapses
that distinction: types are sets, and individual values are singleton sets containing one element.

With types as sets, type checking becomes a question of set inclusion. If `A` is a subtype of `B`,
the set for `A` is a subset of the set for `B`. The top type, holding all possible values, is `Any`.
The bottom type is the empty set: `Never`.

For real programs that model only gets you so far, so LMT leans on **refinement types**. A
refinement type pairs a base type with a logical predicate that restricts its domain:

```lmt
let Positive = Int | it > 0
let SmallEven = Int | it > 0 and it < 20 and it mod 2 == 0

let x: Positive = 7

let y = 12 :: SmallEven
```

The variable `it` refers to the value being checked. The `::` operator is a verification ascription.
It tells the compiler that a proof obligation must be formally discharged right at that point before
compilation can succeed. You are not asking nicely. You are demanding.

Subtyping between two refined types requires proving that the premise of one predicate logically
implies the other within the current typing context. So subtyping checks cannot be done entirely by
structural induction over type trees. The compiler has to extract the predicates, substitute the
variables, and hand the resulting implication to a constraint solver.

## Making the machine do the proving

The work goes to an SMT (Satisfiability Modulo Theories) solver, which decides whether a formula is
satisfiable within a specific theory: integers, bit-vectors, arrays, strings. Take a function with a
precondition and a return type:

```lmt
let AbsoluteInt = Int | it >= 0

let double(n: Int | it > 5): AbsoluteInt = {
    n * 2
}
```

To verify the body, the type checker collects the precondition as an assumption and tries to prove
the postcondition. It hands the solver `(n > 5) && !((n * 2) >= 0)`. If the solver finds that
unsatisfiable, no integer `n` can satisfy the assumptions and violate the postcondition, so the code
is correct in the strict mathematical sense. If it comes back satisfiable, the solver returns a
counterexample that becomes a compilation error.

Hand arbitrary, unguided expressions to an SMT solver and it slows down fast. So LMT uses a
**bidirectional type system** with two operational modes. In synthesis mode the compiler infers a
type from an expression's structure. In checking mode it is given an expression and an expected type,
and it pushes refinement conditions down, wrapping the terminal leaves in verification obligations.

The solver never has to discover types from scratch. The bidirectional pass pins down exactly where
verification conditions get generated, which keeps the formulas small and the round trips fast.

## Asking the solver to write the code

Once the compiler can send logical constraints to an SMT solver, you can ask the solver to discover
the missing code for you.

LMT supports two kinds of holes. The **type hole** (`?`) asks for standard inference to fill in a
missing type or basic value from structural rules. The **synthesis hole** (`??`) translates the whole
specification into a Syntax-Guided Synthesis problem and delegates the search to the solver:

```lmt
let target = Int | it > 10 and it < 20
let a: target = ?

let square(n: Int) = n * n
let root: Int | square(it) == 16 = ??
```

When the compiler hits `??`, it analyses the constraint (`it * it = 16`) and asks the solver to find
an existential assignment: discover the witness `4`, or `-4`, and insert it directly.

That's what makes LMT a cross-language synthesis engine. Define a data structure constraint, or a
mathematical property a host function needs, and the compiler generates logic that satisfies it.

## Making compilation incremental

External SMT solvers are slow. If every keystroke meant re-parsing the whole codebase, regenerating
every verification condition, and restarting the solver process, the edit loop would be unusable.

So incremental computation is built into the pipeline from the start. Parsing uses _token windowing_
to keep text processing local, so editing a line only re-evaluates tokens within that window. When
an AST fragment changes, the change flows through a query-based dependency graph that handles
memoization and dependency tracking, so upstream work is reused rather than repeated.

## Where it went

LMT was a slow slog through formal verification, compiler design, and type theory. The parser rules,
the development goals, and the implementation itself live at
[github.com/lemueldls/lmt](https://github.com/lemueldls/lmt).
