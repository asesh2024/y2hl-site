---
title: "Closure properties of context-free languages"
topic: 18
co: "CO3"
description: "Context-free languages survive union, concatenation and star, but not intersection or complement. Intersecting with a regular language is always safe."
outcomes: ["List the operations under which CFLs are closed, with the grammar or PDA construction for each", "Show by counterexample that CFLs are not closed under intersection or complement", "Use closure with regular languages to prove that a language is not context-free"]
reading: ["Textbook 2, §7.3 Closure properties of context-free languages", "Textbook 3, §8.2 Closure properties and decision algorithms for CFLs", "Textbook 1, §2.3 (exercises on closure)"]
videos: [{"title": "NPTEL: Theory of Automata and Formal Languages, IIT Guwahati (see the CFL closure lectures)", "url": "https://nptel.ac.in/courses/106103070"}]
---

### Key ideas

**Closed.** If L₁ and L₂ are context-free, then so are:

| Operation | Construction (S₁, S₂ are the start symbols of the two grammars) |
| --- | --- |
| Union L₁ ∪ L₂ | new start S → S₁ \| S₂ |
| Concatenation L₁L₂ | S → S₁S₂ |
| Star L₁\* | S → S₁S \| ε |
| Reversal L₁ᴿ | reverse the right side of every production |
| Homomorphism h(L₁) | replace each terminal a by the string h(a) |
| **L ∩ R, R regular** | run a PDA for L and a DFA for R together: product states, one stack |

**Not closed.**

- **Intersection.** L₁ = {aⁿbⁿcᵐ} and L₂ = {aᵐbⁿcⁿ} are both context-free, but L₁ ∩ L₂ = {aⁿbⁿcⁿ} is not.
- **Complement.** If CFLs were closed under complement, then by De Morgan, L₁ ∩ L₂ = complement of (L̄₁ ∪ L̄₂) would always be context-free. It is not, so they are not.
- **Difference** L₁ − L₂ fails for the same reason. (L − R, with R regular, is fine: it is L ∩ R̄.)

**Deterministic CFLs** (accepted by DPDAs) **are** closed under complement, but not under union or intersection.

**Using closure to prove non-context-freeness.** If L were context-free, then L ∩ R would be too, for any regular R. Choose R to strip L down to a known non-CFL. For example: {w ∈ {a, b, c}\* : equal numbers of a's, b's and c's} ∩ a\*b\*c\* = {aⁿbⁿcⁿ}. So the first language is not context-free either.

### Worked example

**L₁ = {0ⁿ1ⁿ2ⁱ | n, i ≥ 1} and L₂ = {0ⁱ1ⁿ2ⁿ | n, i ≥ 1}. Are they context-free? Is L₁ ∩ L₂?**

**L₁ is context-free:**

> S → AC  
> A → 0A1 | 01  
> C → 2C | 2

**L₂** is similar: S → DB, D → 0D | 0, B → 1B2 | 12.

**L₁ ∩ L₂:** a string in both must have #0 = #1 (from L₁) and #1 = #2 (from L₂). So

> L₁ ∩ L₂ = {0ⁿ1ⁿ2ⁿ | n ≥ 1},

which is **not** context-free (topic 17). Two context-free languages have produced a non-context-free intersection. This is the standard proof that CFLs are not closed under intersection.

### Common mistakes

- **Assuming De Morgan works.** It does for regular languages, but CFLs are not closed under complement.
- **Confusing L ∩ R with L₁ ∩ L₂.** Intersecting with a **regular** language is always safe. Intersecting two CFLs is not.
- **Thinking ∪ and ∩ behave alike for DPDAs.** DCFLs are closed under complement, but not under union.

### Tutorial problems

1. Show that L = {aⁿbᵐ | n ≠ m} is context-free. (Hint: it is the union of n > m and n < m.)
2. Let L₁ = {aⁿbⁿ | n ≥ 0} and L₂ = {bⁿaⁿ | n ≥ 0}. Prove that L₁ ∪ L₂ is context-free by giving a grammar.
3. If L is a CFL and R is a regular language, what kind of language is L ∩ R? Will it be context-free, or regular? Why?
4. For L₁ = {0ⁿ1ⁿ2ⁱ : n ≥ 1, i ≥ 1} and L₂ = {0ⁱ1ⁿ2ⁿ : n ≥ 1, i ≥ 1}:
    - Are L₁ and L₂ context-free?
    - Is L = L₁ ∩ L₂ context-free?
    - Write L in set notation.
5. Use closure with a regular language to prove that {w ∈ {a, b, c}\* : n_a(w) = n_b(w) = n_c(w)} is not context-free.

### Viva questions

1. Under which operations are CFLs closed? Under which are they not?
2. Why does closure under union, but not under intersection, rule out closure under complement?
3. Why is the intersection of a CFL with a regular language always context-free?
