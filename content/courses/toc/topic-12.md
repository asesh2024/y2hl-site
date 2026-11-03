---
title: "Simplification of CFGs"
topic: 12
co: "CO2"
description: "Clean a grammar without changing its language: remove ε-productions, unit productions and useless symbols, in the right order."
outcomes: ["Find the nullable, generating and reachable variables of a grammar", "Eliminate ε-productions and unit productions", "Remove useless symbols in the correct order", "Explain why the order of the steps matters"]
reading: ["Textbook 2, §7.1 Normal forms for context-free grammars (eliminating useless symbols, ε- and unit productions)", "Textbook 3, §6.1 Methods for transforming grammars"]
videos: [{"title": "NPTEL: Theory of Computation, IIT Kanpur (see the CFG simplification lectures)", "url": "https://nptel.ac.in/courses/106104148"}]
---

### Key ideas

Simplification never changes the language, except that ε may need separate treatment. It prepares a grammar for the normal forms in topic 13. **Use this order:**

**1. Remove ε-productions** (A → ε).

- Find the **nullable** variables, those with A ⇒\* ε.
  - A is nullable if A → ε is a production.
  - A is also nullable if A → B₁B₂…Bₖ where every Bᵢ is nullable.
- For every production, add a version with each subset of its nullable variables left out. Never add an empty right-hand side.
- Delete all A → ε. If ε was in the language, add a new start symbol S₀ → S | ε at the end.

**2. Remove unit productions** (A → B, a single variable on the right).

- For each variable A, find every variable B reachable from A by unit productions alone.
- Copy all of B's non-unit productions to A, then delete the unit productions.

**3. Remove useless symbols.** A symbol is useful only if it is both **generating** (it derives some terminal string) and **reachable** (it appears in some sentential form derived from S).

- First remove the **non-generating** variables, and every production that uses one.
- **Then** remove the **unreachable** symbols.
- The order matters. Removing non-generating symbols can make other symbols unreachable, but not the other way round.

### Worked example

**Simplify S → AB | a, A → a, B → bB.**

- **No ε- or unit productions.**
- **Generating variables:** S (via a) and A (via a). B is **not** generating: every B-production contains B again, so B never finishes. Remove B and every production that mentions it. That leaves S → a and A → a.
- **Reachable variables:** from S we reach only a. A is unreachable, so remove it.
- **Result:** S → a.

**Removing ε:** S → aSb | ε. S is nullable. From S → aSb, add the version without S: **S → aSb | ab**. This generates {aⁿbⁿ | n ≥ 1}. Because ε was in the original language, add S₀ → S | ε if the empty string must be kept.

### Common mistakes

- **Wrong order for useless symbols.** Removing the unreachable ones first can leave useless symbols behind.
- **Missing combinations when removing ε.** With A → BCB and B, C both nullable, every subset must be listed: BCB, CB, BB, BC, B, C.
- **Creating new unit productions** while removing ε, for example A → B. Remove ε **before** unit productions.
- **Losing ε from the language.** Keep track of whether S was nullable.

### Tutorial problems

1. Simplify S → AB | AC, A → aB | BC | ε, B → b, C → c.
2. Simplify S → AB | ε, A → aB | ε, B → bA | b, C → cC. (Which symbol is useless, and why?)
3. Simplify S → ABCD | AC, A → aA | ε, B → bB | bC | b, C → cC | D, D → d.
4. Remove the unit productions from E → E + T | T, T → T \* F | F, F → ( E ) | id.
5. Find the nullable variables of S → AB, A → aA | ε, B → bB | ε, and remove the ε-productions.

### Viva questions

1. Why is it important to simplify context-free grammars?
2. Does simplification change the language a grammar generates? Why or why not?
3. Why must non-generating symbols be removed before unreachable ones?
4. What is a nullable variable, and how do you find all of them?
