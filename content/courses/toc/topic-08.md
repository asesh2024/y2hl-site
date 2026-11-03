---
title: "Closure properties and regular grammars"
topic: 8
co: "CO2"
description: "Which operations keep a language regular, how to use them to prove things about languages, and regular grammars: a third way to describe regular languages."
outcomes: ["List the operations under which regular languages are closed, with the construction behind each", "Use closure properties to show a language is regular, or (combined with a known non-regular language) that it is not", "Write a right-linear or left-linear grammar for a regular language and convert it to a finite automaton"]
reading: ["Textbook 2, §4.2 Closure properties of regular languages", "Textbook 3, §3.3 Regular grammars and §4.1 Closure properties", "Textbook 1, §1.1–1.2 (closure under the regular operations)"]
videos: [{"title": "MIT 18.404J, Lecture 2: Nondeterminism, closure properties", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/nondeterminism-closure-properties-regular-expressions-2192-finite-automata/"}]
---

### Key ideas

**Closure.** A class of languages is *closed* under an operation when applying the operation to languages in the class always gives a language in the class. Regular languages are closed under all of these:

| Operation | Why the result is regular |
| --- | --- |
| Union L₁ ∪ L₂ | RE R₁ + R₂, or product DFA with "either final" |
| Concatenation L₁L₂ | RE R₁R₂, or ε-move from M₁'s final states to M₂'s start |
| Star L\* | RE R\* |
| Complement Σ\* − L | complete DFA, swap final and non-final states |
| Intersection L₁ ∩ L₂ | product DFA with "both final", or De Morgan |
| Difference L₁ − L₂ | L₁ ∩ (complement of L₂) |
| Reversal L<sup>R</sup> | reverse every arrow, swap start and final (an NFA) |
| Homomorphism h(L) | replace each symbol in the RE by its image string |
| Inverse homomorphism h⁻¹(L) | the DFA reads a, then simulates M on h(a) |

**What closure does not say.** A **subset** of a regular language need not be regular: {aⁿbⁿ} ⊆ a\*b\*. An **infinite** union of regular languages need not be regular: each {aⁿbⁿ} is finite, so regular, but their union is not.

**Proving non-regularity with closure.** Suppose L is regular. Combine it with regular languages using closure operations until you reach a language already known to be non-regular. That is a contradiction. For example, if L = {w : equal numbers of 0s and 1s} were regular, then L ∩ 0\*1\* = {0ⁿ1ⁿ} would be regular too. It is not, so L is not regular.

**Regular grammars.** A grammar G = (V, T, P, S) is

- **right-linear** if every production has the form A → aB, A → a or A → ε;
- **left-linear** if every production has the form A → Ba, A → a or A → ε.

(A, B are variables and a is a terminal. Many books also allow a string of terminals in place of a.) Both kinds generate exactly the regular languages. Mixing left and right rules in one grammar can produce non-regular languages.

**Right-linear grammar ⇄ finite automaton.** A variable is a state, and the start symbol is the start state.

- A → aB is a transition A —a→ B.
- A → ε makes A a final state.
- A → a is a transition to a new final state.

Going the other way, read a DFA's transitions off as productions.

### Worked example

**A regular grammar for the strings over {a, b} in which the number of a's is divisible by 3.**

Use three variables for "number of a's so far, mod 3": S (0), A (1), B (2). A b changes nothing, and an a moves to the next count. Only S may stop.

> S → bS | aA | ε
> A → bA | aB
> B → bB | aS

**Derivation of `abaa`:** S ⇒ aA ⇒ abA ⇒ abaB ⇒ abaaS ⇒ abaa. That has three a's, so it is accepted. The matching DFA has states S (start, final), A and B, with exactly these transitions.

### Common mistakes

- **"L ⊆ regular, so L is regular."** False. Subsets of regular languages can be anything.
- **Complementing an NFA by swapping its final states.** That does not work for NFAs. Convert to a complete DFA first.
- **Mixing left- and right-linear rules** in one grammar and calling it regular. S → aA, A → Sb | b (mixed) generates {aⁿbⁿ | n ≥ 1}, which is not regular.

### Tutorial problems

1. Find a regular grammar for the strings over {a, b} in which the number of a's is divisible by 3. Convert it into a DFA.
2. Let L₁ and L₂ be languages with L₁ ⊆ L₂. Under what condition **must** L₂ be regular? Under what condition must L₁ be regular? (Think carefully: the answer to one of these is "none in general".)
3. Consider the grammar S → aS | bA, A → bA | ε.
    - Is it a regular grammar? If so, is it right-linear or left-linear?
    - Write the language it generates, both as a regular expression and in words.
4. Using closure properties and the fact that {0ⁿ1ⁿ} is not regular, show that L = {w ∈ {0, 1}\* : n₀(w) = n₁(w)} is not regular.
5. Show that if L is regular, then so is half(L) = { x : xy ∈ L for some y with |y| = |x| }. (Hint: run M forwards on x while guessing a path backwards from F.)

### Viva questions

1. What does it mean for a class of languages to be closed under an operation?
2. Why is closure under complement easy for DFAs but not immediate for NFAs?
3. Is every subset of a regular language regular? Give an example.
4. How do you convert a right-linear grammar into a finite automaton?
