---
title: "Chomsky and Greibach normal forms"
keywords: "cnf gnf"
topic: 13
co: "CO2"
description: "Two standard shapes for grammars: Chomsky normal form (A → BC | a), which makes parse trees binary, and Greibach normal form (A → aα), where every step produces a terminal."
outcomes: ["State the rules of CNF and GNF", "Convert a simplified CFG to Chomsky normal form", "Convert a CFG to Greibach normal form, removing left recursion along the way", "Use CNF to reason about derivation length and parse-tree shape"]
reading: ["Textbook 1, §2.1 Chomsky normal form", "Textbook 2, §7.1.5 Chomsky normal form, and Exercise 7.1.11 (Greibach normal form)", "Textbook 3, §6.2 Two important normal forms"]
videos: [{"title": "MIT 18.404J, Lecture 4: Pushdown automata, CFG ↔ PDA (uses CNF)", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/pushdown-automata-cfg-2194-pda/"}]
---

### Key ideas

**Chomsky normal form (CNF).** Every production is one of:

- **A → BC**, where B and C are variables;
- **A → a**, where a is a terminal;
- **S → ε**, only if ε ∈ L, and then S must not appear on any right-hand side.

**Converting to CNF:**

1. Simplify the grammar: remove ε-productions, unit productions and useless symbols (topic 12).
2. **Isolate terminals.** In every right side of length ≥ 2, replace each terminal a with a new variable Xₐ, and add Xₐ → a.
3. **Break long rules.** Replace A → B₁B₂…Bₖ (k ≥ 3) with a chain:
    - A → B₁C₁
    - C₁ → B₂C₂
    - …
    - Cₖ₋₂ → Bₖ₋₁Bₖ

**Why CNF helps:**

- Every parse tree is binary.
- A string of length n ≥ 1 takes **exactly 2n − 1 derivation steps**: n − 1 binary steps and n terminal steps.
- The CYK parsing algorithm and the CFL pumping lemma both rely on it.

**Greibach normal form (GNF).** Every production has the form **A → aα**: one terminal, then zero or more variables, so α ∈ V\*. (S → ε is again allowed when needed.)

- Every derivation step produces exactly one terminal, so a string of length n takes **exactly n steps**.
- This leads directly to a PDA that reads one input symbol per step (topic 16).

**Converting to GNF (outline):**

1. Start from CNF, and order the variables A₁, A₂, …, Aₘ.
2. Make every rule Aᵢ → Aⱼγ satisfy j > i, by substituting the rules of Aⱼ whenever j < i.
3. Remove **left recursion**: rewrite A → Aα | β as A → β | βA′ and A′ → α | αA′.
4. Substitute back from Aₘ down to A₁, so that every right side starts with a terminal.

### Worked example

**Convert S → aSb | ab to CNF.** The language is {aⁿbⁿ | n ≥ 1}.

1. The grammar is already simplified.
2. Isolate terminals, using Xₐ → a and X<sub>b</sub> → b: S → XₐSX<sub>b</sub> | XₐX<sub>b</sub>.
3. Break the long rule S → XₐSX<sub>b</sub> into S → XₐT and T → SX<sub>b</sub>.

**Result:**

> S → XₐT | XₐX<sub>b</sub>  
> T → SX<sub>b</sub>  
> Xₐ → a, X<sub>b</sub> → b

**Check with `aabb`** (n = 4, so it should take 2·4 − 1 = 7 steps):

S ⇒ XₐT ⇒ aT ⇒ aSX<sub>b</sub> ⇒ aXₐX<sub>b</sub>X<sub>b</sub> ⇒ aaX<sub>b</sub>X<sub>b</sub> ⇒ aabX<sub>b</sub> ⇒ aabb.

That is 7 steps, as predicted.

**The same language in GNF:** S → aSB | aB, B → b. Every rule starts with a terminal followed only by variables.

### Common mistakes

- **Converting before simplifying.** ε- and unit productions left in the grammar break CNF.
- **Leaving terminals in long rules**, such as A → aB. In CNF a terminal can only appear alone, as in A → a.
- **GNF with a terminal at the end**, such as S → aSb. In GNF, everything after the first terminal must be a variable.
- **Forgetting left recursion.** A → Aα can never start with a terminal. Remove the left recursion first.

### Tutorial problems

1. Convert to CNF: S → aAD, A → aB | bAB, B → b, D → d.
2. Convert to CNF: S → XSY, X → aXS | a | ε, Y → SbS | X | bb. (Simplify first.)
3. Convert to CNF: S → aAB, A → aB | bAB, B → aBB | bS | b.
4. Convert to GNF: S → AB, A → BS | a, B → SA | b.
5. Convert to GNF: E → E + T | T, T → T \* F | F, F → ( E ) | a. (Start by removing left recursion.)
6. Write the GNF productions for S → XA | BB, B → b | SB, X → b, A → a.

### Viva questions

1. What is Chomsky normal form, and what are its key characteristics?
2. Why must ε-productions be removed before converting to CNF?
3. What is Greibach normal form? What is it useful for?
4. If a grammar is in CNF, how many steps does it take to derive a string of length n? And in GNF?
