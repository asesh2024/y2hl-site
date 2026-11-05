---
title: "Recursive and recursively enumerable languages"
keywords: "re"
topic: 24
co: "CO4"
description: "Decidable (recursive) and recognisable (recursively enumerable) languages: their closure properties, and the link between them through complements."
outcomes: ["Define recursive and recursively enumerable languages", "State and prove: L is recursive if and only if L and its complement are both RE", "Use closure properties to classify languages", "Give examples of recursive, RE-but-not-recursive, and non-RE languages"]
reading: ["Textbook 1, §4.1 Decidable languages and §4.2 Undecidability (Turing-unrecognisable languages)", "Textbook 2, §9.1–9.2 A language that is not RE; an undecidable problem that is RE", "Textbook 3, §11.1 Recursive and recursively enumerable languages"]
videos: [{"title": "MIT 18.404J, Lecture 7: Decision problems for automata and grammars", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/decision-problems-for-automata-and-grammars/"}, {"title": "MIT 18.404J, Lecture 8: Undecidability", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/lecture-8-undecidability/"}]
---

### Key ideas

**Definitions:**

- L is **recursive** (decidable) if some TM halts on **every** input, accepting exactly the strings in L.
- L is **recursively enumerable**, RE for short (also called recognisable or semi-decidable), if some TM accepts exactly the strings in L. It may loop on strings outside L.
- *Enumerable*: L is RE exactly when some machine (an *enumerator*) can print a list of every string in L, in some order.

**The key theorem.** L is recursive **if and only if** both L and its complement L̄ are RE.

- **(⇒)** A decider for L gives a decider for L̄ by swapping accept and reject. Deciders are recognisers.
- **(⇐)** Run a recogniser for L and a recogniser for L̄ on w, alternating their steps. Every w is in exactly one of L and L̄, so one of the two machines must accept. Answer according to which one does. This always halts.

**Consequence.** If L is RE but not recursive, then L̄ is **not even RE**.

**Closure properties:**

| Operation | Recursive | RE |
| --- | --- | --- |
| Union, intersection | ✓ | ✓ |
| Concatenation, star | ✓ | ✓ |
| Complement | ✓ | ✗ |

**Examples:**

| Class | Examples |
| --- | --- |
| Recursive | every CSL, CFL and regular language; A<sub>DFA</sub> = {⟨D, w⟩ : DFA D accepts w}; A<sub>CFG</sub> |
| RE but not recursive | A<sub>TM</sub> = {⟨M, w⟩ : M accepts w}; HALT = {⟨M, w⟩ : M halts on w} |
| Not RE | the complement of A<sub>TM</sub>; E<sub>TM</sub> = {⟨M⟩ : L(M) = ∅} |

(For E<sub>TM</sub>, it is the **complement** that is RE: search for some accepted string, alternating steps across all inputs.)

### Worked example

**Show that the complement of A<sub>TM</sub> is not RE.**

1. A<sub>TM</sub> is RE. On input ⟨M, w⟩, simulate M on w, and accept if M accepts. This is the universal machine (topic 25).
2. A<sub>TM</sub> is **not** recursive. This is the undecidability of acceptance (topic 25).
3. Suppose the complement of A<sub>TM</sub> were RE. Then A<sub>TM</sub> and its complement would both be RE. By the key theorem, A<sub>TM</sub> would be recursive, contradicting step 2.
4. So the complement of A<sub>TM</sub> is not RE. ∎

The same argument places infinitely many languages outside RE. In fact, most languages are not RE. There are only countably many Turing machines, but uncountably many languages.

### Common mistakes

- **"RE languages are closed under complement."** They are not. If they were, every RE language would be recursive.
- **Treating "not recursive" as "not RE".** A<sub>TM</sub> is RE without being recursive.
- **Running two recognisers one after the other.** For the key theorem, they must be interleaved.

### Tutorial problems

1. Write the characteristics of recursive and recursively enumerable languages.
2. Give an example of a recursive language, and of a recursively enumerable language that is not recursive.
3. Discuss the properties of recursive and RE languages: closure under union, intersection, complement and concatenation.
4. Prove that if L₁ and L₂ are recursive, then L₁ ∩ L₂ and L₁ ∪ L₂ are recursive.
5. Consider L = {⟨M⟩ : the TM M accepts only the empty language}. Is L recursive, RE, or neither? Justify your answer.

### Viva questions

1. Give an example of a recursively enumerable language that is not recursive.
2. How are recursive languages related to the complexity class P?
3. Why does "L and L̄ are both RE" imply that L is recursive?
