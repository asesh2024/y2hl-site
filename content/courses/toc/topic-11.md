---
title: "Derivations, parse trees and ambiguity"
topic: 11
co: "CO2"
description: "Leftmost and rightmost derivations, parse trees that show a string's structure, and ambiguous grammars that give one string two different structures."
outcomes: ["Write leftmost and rightmost derivations of a string", "Draw the parse tree for a derivation and read off its yield", "Decide whether a grammar is ambiguous by finding two parse trees for one string", "Rewrite an ambiguous expression grammar as an unambiguous one that respects precedence"]
reading: ["Textbook 1, §2.1 (Ambiguity)", "Textbook 2, §5.2 Parse trees and §5.4 Ambiguity in grammars and languages", "Textbook 3, §5.2 Parsing and ambiguity"]
videos: [{"title": "NPTEL: Theory of Computation, IIT Kanpur (see the parse trees and ambiguity lectures)", "url": "https://nptel.ac.in/courses/106104148"}]
---

### Key ideas

**Leftmost and rightmost derivations.**

- A **leftmost derivation (LMD)** always rewrites the leftmost variable in the current string.
- A **rightmost derivation (RMD)** always rewrites the rightmost variable.

Both produce the same strings. They only fix the order in which the variables are expanded.

**Parse tree (derivation tree):**

- The root is the start symbol.
- Every internal node is a variable, and its children, read left to right, are the right side of the production used there.
- The leaves are terminals or ε.
- Reading the leaves left to right gives the **yield**, which is the derived string.

A parse tree records **which** productions were used and **where**, but not the order. Every parse tree has exactly one LMD and exactly one RMD.

**Ambiguity.** A grammar is *ambiguous* if some string has **two different parse trees**. Equivalently, the string has two different LMDs (or two different RMDs). An ambiguous grammar gives that string two meanings. This matters to a compiler: is `id + id * id` read as (id + id) \* id, or as id + (id \* id)?

**Removing ambiguity.** Often you can rewrite the grammar. For expressions, add one variable per precedence level:

> E → E + T | T  
> T → T \* F | F  
> F → ( E ) | id

Now \* is always grouped under a T, below the +, so it binds tighter. Some languages, however, are **inherently ambiguous**: every grammar for them is ambiguous. An example is {aⁱbʲcᵏ | i = j or j = k}. In general, deciding whether a CFG is ambiguous is **undecidable**.

### Worked example

**The grammar S → S + S | S \* S | id is ambiguous.** The string `id + id * id` has two leftmost derivations:

| Tree 1 (+ at the root) | Tree 2 (\* at the root) |
| --- | --- |
| S ⇒ S + S | S ⇒ S \* S |
| ⇒ id + S | ⇒ S + S \* S |
| ⇒ id + S \* S | ⇒ id + S \* S |
| ⇒ id + id \* S | ⇒ id + id \* S |
| ⇒ id + id \* id | ⇒ id + id \* id |

The two trees mean id + (id \* id) and (id + id) \* id. The unambiguous E/T/F grammar above has only the first.

```dot
digraph {
  rankdir=TB;
  node [shape=plaintext];
  edge [dir=none];
  S1 [label="S"]; S2 [label="S"]; P [label="+"]; S3 [label="S"];
  I1 [label="id"]; S4 [label="S"]; M [label="*"]; S5 [label="S"]; I2 [label="id"]; I3 [label="id"];
  S1 -> S2; S1 -> P; S1 -> S3; S2 -> I1; S3 -> S4; S3 -> M; S3 -> S5; S4 -> I2; S5 -> I3;
}
```

*Tree 1: \* sits lower in the tree, so it is applied first.*

### Common mistakes

- **Two derivations do not make a grammar ambiguous.** An LMD and an RMD of the same tree are just two orders of expansion. You need two different **trees**, or two different **leftmost** derivations.
- **Confusing ambiguous grammars and ambiguous languages.** Most languages with an ambiguous grammar also have an unambiguous one. Only inherently ambiguous languages have none.
- **Drawing trees with terminals as internal nodes.** Only variables have children.

### Tutorial problems

1. Construct a CFG for L = { wcwᴿ | w ∈ {a, b}\* }. Give leftmost and rightmost derivations of `abbcbba`.
2. Take the grammar S → ASB | c, A → ε | aA, B → ε | bB. Derive `acb` by a leftmost and a rightmost derivation, and draw the parse tree. Is the grammar ambiguous? (Try `ac`.)
3. Show that S → aS | A, A → aA | b is ambiguous. Then give an unambiguous grammar for the same language.
4. Show that S → aSbS | bSaS | ε is ambiguous, using the string `abab`.
5. For E → E + T | T, T → T \* F | F, F → ( E ) | id, draw the unique parse tree of `id * (id + id)`.

### Viva questions

1. What is a context-free grammar, and how is it defined?
2. How do you build a parse tree for a string from a grammar?
3. What is the difference between a leftmost and a rightmost derivation? Can they give different parse trees?
4. What is an ambiguous grammar? Why does ambiguity matter in compiler design?
