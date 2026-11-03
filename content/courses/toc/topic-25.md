---
title: "Chomsky hierarchy, universal TM and the halting problem"
topic: 25
co: "CO4"
description: "The four levels of grammars and machines, one machine that can run every other machine, and the problem that no machine can solve: will a program halt?"
outcomes: ["Classify a language or grammar into the Chomsky hierarchy, with its matching machine", "Explain how a universal Turing machine simulates any TM from its description", "Prove the halting problem undecidable by diagonalisation", "Use reductions from the halting problem to show other problems undecidable"]
reading: ["Textbook 1, §4.2 Undecidability (the diagonalisation method; the acceptance problem for TMs is undecidable)", "Textbook 2, §9.2 An undecidable problem that is RE (the universal language)", "Textbook 3, §11.4–11.5 The Chomsky hierarchy; §12.1 Some problems that cannot be solved by Turing machines"]
videos: [{"title": "MIT 18.404J, Lecture 8: Undecidability", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/lecture-8-undecidability/"}, {"title": "MIT 18.404J, Lecture 9: Reducibility", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/lecture-9-reducibility/"}]
---

### Key ideas

**The Chomsky hierarchy** (A, B are variables, a a terminal, α, β, γ strings):

| Type | Grammar | Rule form | Machine | Example |
| --- | --- | --- | --- | --- |
| 0 | unrestricted | α → β (α ≠ ε) | Turing machine | A<sub>TM</sub>, HALT |
| 1 | context-sensitive | α → β with \|α\| ≤ \|β\| | linear bounded automaton | aⁿbⁿcⁿ |
| 2 | context-free | A → γ | pushdown automaton | aⁿbⁿ |
| 3 | regular | A → aB \| a \| ε | finite automaton | a\*b\* |

Each class strictly contains the one below:

> regular ⊂ context-free ⊂ context-sensitive ⊂ recursively enumerable

(The recursive languages fit between the context-sensitive and RE classes.)

**The universal Turing machine U.** A TM M can itself be written as a string ⟨M⟩, by listing its states, symbols and transitions in some fixed code. U takes ⟨M, w⟩ as input and **simulates M on w**, step by step, accepting if M accepts. One machine runs every machine. This is the idea behind the stored-program computer. It also shows that A<sub>TM</sub> is RE.

**The halting problem is undecidable.** HALT = {⟨M, w⟩ : M halts on w} has no decider.

**Proof by diagonalisation.**

1. Suppose a TM H decides HALT.
2. Build a machine D that, on input ⟨M⟩:
    - runs H on ⟨M, ⟨M⟩⟩;
    - if H says "M halts on ⟨M⟩", D **loops forever**;
    - if H says "M does not halt on ⟨M⟩", D **halts**.
3. Now run D on its own description ⟨D⟩:
    - D halts on ⟨D⟩ ⇔ H says D does not halt on ⟨D⟩ ⇔ D does not halt on ⟨D⟩.
4. That is a contradiction, so H cannot exist. ∎

**Reductions.** To show a problem P is undecidable, show that a decider for P would give a decider for HALT (or A<sub>TM</sub>). Problems shown undecidable this way include:

- does M accept ε?
- is L(M) empty?
- is L(M) regular?
- do two TMs accept the same language?
- **Rice's theorem:** every non-trivial property of the language of a TM is undecidable.

### Worked example

**The halting problem for a restricted class.** Suppose a tool decides halting for programs with no loops and no recursion. That does **not** contradict the theorem. Such programs always halt, so the question is trivial. The halting problem is undecidable **in general**. Deciding it for a restricted class says nothing about all TMs.

**What does δ(q₁, a) = (q₂, b, R) mean for U?** It is one line in the code ⟨M⟩. When the simulated M is in q₁ and reading a, U looks up this line, writes b on the part of its tape that holds M's tape, moves M's head one cell right, and records q₂ as M's new state.

### Common mistakes

- **"Undecidable means no program can ever answer it."** For specific machines, you can often answer. The claim is that **no single algorithm** answers correctly for **every** ⟨M, w⟩.
- **Mixing up the levels.** Every regular language is also context-free, context-sensitive and RE. The hierarchy is nested.
- **Confusing RE with recursive.** HALT is RE (simulate, and accept if M halts), but it is not recursive.

### Tutorial problems

1. Suppose a Turing machine could decide whether any TM halts on any input. What would follow? Explain the contradiction.
2. Give a problem that is equivalent to the halting problem, and sketch a reduction in each direction.
3. A Universal TM simulates M, and M has the transition δ(q₁, a) = (q₂, b, R). What does this transition mean? How does the UTM carry it out?
4. What must the input to a UTM contain, if it is to simulate a machine M on an input w?
5. Place each language in the highest level of the Chomsky hierarchy it belongs to:
    - a\*b\*
    - aⁿbⁿ
    - aⁿbⁿcⁿ
    - wwᴿ
    - A<sub>TM</sub>
6. Describe the relationship between the halting problem and recursive (computable) functions.

### Viva questions

1. Explain the characteristics of context-free grammars, and the types of languages they generate.
2. How do regular languages relate to context-free languages in the Chomsky hierarchy?
3. How does a universal Turing machine differ from a standard Turing machine?
4. Why is the halting problem RE but not recursive?
