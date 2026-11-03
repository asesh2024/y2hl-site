---
title: "Context-sensitive grammars"
topic: 19
co: "CO3"
description: "Grammars whose rules may depend on neighbouring symbols, as long as they never shrink the string. Enough to generate aⁿbⁿcⁿ, and still decidable."
outcomes: ["Define context-sensitive (noncontracting) grammars and explain how they differ from CFGs", "Write and trace a context-sensitive grammar for aⁿbⁿcⁿ", "Place context-sensitive languages in the Chomsky hierarchy", "Explain why membership in a context-sensitive language is decidable"]
reading: ["Textbook 3, §11.4 Context-sensitive grammars and languages", "Reference book 2, Ch. 4 (the Chomsky classification; type 1 grammars)"]
videos: [{"title": "NPTEL: Theory of Automata, Formal Languages and Computation, IIT Madras", "url": "https://nptel.ac.in/courses/106106049"}]
---

### Key ideas

**Context-sensitive grammar (type 1).** Every production has the form

> α → β, with |α| ≤ |β|,

where α contains at least one variable. Such rules are called **noncontracting**: a derivation never makes the string shorter. As a special case, S → ε is allowed if S never appears on a right-hand side.

An equivalent form writes every rule as **αAβ → αγβ**, with γ ≠ ε: A may be rewritten to γ, but only in the context α…β. That is where the name *context-sensitive* comes from.

A language is **context-sensitive (a CSL)** if some context-sensitive grammar generates it.

**Where CSLs sit:**

> regular ⊂ context-free ⊂ context-sensitive ⊂ recursive ⊂ recursively enumerable

- Every CFL without ε is a CSL. Convert to CNF, whose rules A → BC and A → a never shrink.
- {aⁿbⁿcⁿ}, {ww} and {a<sup>2ⁿ</sup>} are context-sensitive but not context-free.

**Membership is decidable.** Since no rule shrinks the string, a derivation of w only passes through sentential forms of length ≤ |w|. There are finitely many of those, so a program can search them all. This is why every CSL is recursive (topic 24).

**Machine model.** CSLs are exactly the languages accepted by **linear bounded automata** (topic 20).

### Worked example

**A context-sensitive grammar for {aⁿbⁿcⁿ | n ≥ 1}:**

| Rule | Purpose |
| --- | --- |
| 1. S → aSBC \| aBC | lay down the a's, each with a B and a C |
| 2. CB → BC | sort: move the B's in front of the C's |
| 3. aB → ab | the first B after the a's becomes b |
| 4. bB → bb | each later B becomes b |
| 5. bC → bc | the first C after the b's becomes c |
| 6. cC → cc | each later C becomes c |

**Derivation of `aabbcc`:**

| Step | Rule | Sentential form |
| --- | --- | --- |
| 0 | | S |
| 1 | 1 | aSBC |
| 2 | 1 | aaBCBC |
| 3 | 2 (CB → BC) | aaBBCC |
| 4 | 3 (aB → ab) | aabBCC |
| 5 | 4 (bB → bb) | aabbCC |
| 6 | 5 (bC → bc) | aabbcC |
| 7 | 6 (cC → cc) | aabbcc |

No rule shortens the string, so the grammar is context-sensitive. The rules only turn B into b right after an a or b, and C into c right after a b or c. That forces every B in front of every C.

### Common mistakes

- **Writing a contracting rule**, such as AB → A. That makes the grammar unrestricted (type 0), not context-sensitive.
- **Assuming every CSL is context-free.** aⁿbⁿcⁿ is the standard counterexample.
- **Forgetting the ε special case.** S → ε is allowed only when S does not appear on any right-hand side.

### Tutorial problems

1. Derive `abc` and `aaabbbccc` with the grammar above.
2. Write a context-sensitive grammar for {aⁿbⁿcⁿdⁿ | n ≥ 1}.
3. Explain why S → aSb | ab, though context-free, also satisfies the definition of a context-sensitive grammar.
4. Is the rule AB → BA context-sensitive in the noncontracting sense? Rewrite it as a sequence of rules of the form αAβ → αγβ.
5. Explain the algorithm that decides whether w ∈ L(G) for a context-sensitive grammar G. Why does it always halt?

### Viva questions

1. What makes a grammar context-sensitive, as opposed to context-free?
2. Give a language that is context-sensitive but not context-free.
3. Why is membership decidable for context-sensitive grammars, but not for unrestricted grammars?
