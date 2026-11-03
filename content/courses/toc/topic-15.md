---
title: "PDA acceptance: final state and empty stack"
topic: 15
co: "CO3"
description: "Two ways for a PDA to say yes: finish in a final state, or empty its stack. For nondeterministic PDAs they accept exactly the same class of languages."
outcomes: ["Define acceptance by final state L(P) and by empty stack N(P)", "Convert a PDA that accepts by empty stack into one that accepts by final state, and back", "Design PDAs that use either acceptance method", "Explain why the two methods differ for deterministic PDAs"]
reading: ["Textbook 2, §6.2 The languages of a PDA", "Textbook 3, §7.1 (acceptance by final state and by empty stack)", "Textbook 1, §2.2"]
videos: [{"title": "MIT 18.404J, Lecture 4: Pushdown automata", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/pushdown-automata-cfg-2194-pda/"}]
---

### Key ideas

**Acceptance by final state:**

> L(P) = { w | (q₀, w, Z₀) ⊢\* (q, ε, γ) for some q ∈ F and any stack γ }

The whole input must be read, and the PDA must end in a final state. What is left on the stack does not matter.

**Acceptance by empty stack:**

> N(P) = { w | (q₀, w, Z₀) ⊢\* (q, ε, ε) for any state q }

The whole input must be read, and the stack must be completely empty, Z₀ included. The states do not matter, so F is often left empty.

**The two are equivalent for nondeterministic PDAs.**

- **Empty stack → final state.**
  1. Put a new bottom marker X₀ under Z₀.
  2. Run the old PDA.
  3. Whenever X₀ is uncovered (the old stack is empty), take an ε-move to a new final state.
- **Final state → empty stack.**
  1. Put a new bottom marker X₀ under Z₀, so that the old PDA cannot empty the stack by accident.
  2. From every old final state, take an ε-move to a new "drain" state.
  3. The drain state pops everything, X₀ included.

So "the languages accepted by PDAs" means the same class, whichever method is used: the **context-free languages**.

**Deterministic PDAs are different.** A DPDA accepting by empty stack can only accept a **prefix-free** language, one in which no word is a proper prefix of another. Once the stack is empty, it cannot move any further. So for DPDAs, final-state acceptance is the more powerful method. For example, {a, aa} is easy by final state, but impossible by empty stack for a DPDA.

### Worked example

**{aⁿbⁿ | n ≥ 1} by empty stack.** State q₀ reads the a's and q₁ reads the b's:

| Transition | Meaning |
| --- | --- |
| δ(q₀, a, Z₀) = {(q₀, AZ₀)} | first a: push A |
| δ(q₀, a, A) = {(q₀, AA)} | more a's: push A |
| δ(q₀, b, A) = {(q₁, ε)} | first b: pop, switch to "b mode" |
| δ(q₁, b, A) = {(q₁, ε)} | more b's: pop |
| δ(q₁, ε, Z₀) = {(q₁, ε)} | all matched: pop Z₀, so the stack is empty |

**Trace on `aabb`:** (q₀, aabb, Z₀) ⊢ (q₀, abb, AZ₀) ⊢ (q₀, bb, AAZ₀) ⊢ (q₁, b, AZ₀) ⊢ (q₁, ε, Z₀) ⊢ (q₁, ε, ε). The input is used up and the stack is empty, so the string is **accepted**.

**Why two states?** A one-state version ("push A on a, pop A on b, pop Z₀ at the end") would also accept `aababb`, since nothing stops an a from coming after a b. Here, q₁ has no move on a, so `aababb` gets stuck after `aab` and is rejected.

Compare this with the **final-state** PDA for the same language in topic 14. The only difference is the last move: there it goes to a final state and leaves Z₀ on the stack; here it pops Z₀.

### Common mistakes

- **Empty stack means Z₀ is gone too.** A stack holding only Z₀ is not empty.
- **Accepting before the input is used up.** Both definitions require the remaining input to be ε.
- **Converting without a new bottom marker.** The old PDA might empty the stack in the middle of a run. X₀ makes sure the conversion notices only when it should.
- **Assuming DPDAs behave like NPDAs.** For DPDAs, empty-stack acceptance is weaker.

### Tutorial problems

1. Design a PDA that accepts {wcwᴿ | w ∈ {a, b}\*} by **empty stack**. Then convert it to one that accepts by **final state**.
2. Design a PDA for balanced parentheses that accepts by empty stack.
3. Design a PDA that accepts {aⁿb²ⁿ | n ≥ 1} by final state.
4. Explain why no DPDA can accept {a, aa} by empty stack, while a DPDA accepting by final state can.
5. Describe in detail the construction that turns a final-state PDA P into an empty-stack PDA P′ with N(P′) = L(P). Why is the new bottom marker needed?

### Viva questions

1. What is the difference between acceptance by final state and acceptance by empty stack?
2. Are the two acceptance methods equivalent? For which kind of PDA?
3. Why does the conversion add a new bottom-of-stack symbol?
