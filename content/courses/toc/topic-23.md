---
title: "Turing machines as language acceptors"
topic: 23
co: "CO4"
description: "Accept, reject or loop: what it means for a Turing machine to recognise or to decide a language, how machines combine, and the Church–Turing thesis."
outcomes: ["Distinguish accepting, rejecting and looping, and define L(M)", "Explain the difference between recognising and deciding a language", "Design a Turing machine acceptor for a non-context-free language", "State the Church–Turing thesis and explain why it is a thesis, not a theorem"]
reading: ["Textbook 1, §3.1 (Turing-recognisable and decidable languages) and §3.3 The definition of algorithm", "Textbook 2, §8.2.5 The language of a Turing machine", "Textbook 3, §9.1 Turing machines as language accepters; §10.4 Combining Turing machines"]
videos: [{"title": "MIT 18.404J, Lecture 6: TM variants, Church–Turing thesis", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/tm-variants-church-turing-thesis/"}]
---

### Key ideas

**Three outcomes.** Run on an input w, a TM M does exactly one of these:

1. **accept:** it halts in a final state;
2. **reject:** it halts in a non-final state, because no move is defined;
3. **loop:** it runs forever.

The language of M is **L(M) = { w | M accepts w }**. Strings that are rejected and strings that loop are both outside L(M).

**Recogniser vs decider:**

- M **recognises** L if L(M) = L. On strings not in L, M may reject **or loop**.
- M **decides** L if L(M) = L **and** M halts on every input.

| Kind of language | Machine |
| --- | --- |
| **Turing-recognisable** (recursively enumerable) | some TM recognises it |
| **Decidable** (recursive) | some TM decides it |

Every decidable language is recognisable. Topic 24 shows that the converse fails.

**Combining machines.** Simple machines can be built into bigger ones:

- **Run one after another**, the second starting where the first stops.
- **Run on a copy of the input.**
- **Alternate steps between two machines.** This is how the union of two recognisable languages is recognised: if either machine accepts, accept. Running them one after the other would fail when the first one loops.

**The Church–Turing thesis.** Every function that can be computed by an *effective procedure* (an algorithm, in the intuitive sense) can be computed by a Turing machine.

It is a **thesis**, not a theorem, because "algorithm" has no formal definition to prove it against. The evidence: every model ever proposed has turned out equivalent to Turing machines. That includes λ-calculus, recursive functions, register machines and real programming languages.

### Worked example

**A TM that decides the palindromes over {0, 1}.**

1. If the tape is blank, **accept**.
2. Read and erase the leftmost symbol, remembering it in the state (q₁ for 0, q₂ for 1).
3. Move right to the end of the input.
4. Step left onto the last symbol:
    - If the tape is blank, there was only one symbol, so **accept**.
    - If the last symbol matches the remembered one, erase it.
    - If it does not match, **reject**.
5. Return to the left end and repeat from step 1.

| State | 0 | 1 | B |
| --- | --- | --- | --- |
| q₀ | q₁, B, R | q₂, B, R | **acc** |
| q₁ (first was 0) | q₁, 0, R | q₁, 1, R | q₃, B, L |
| q₂ (first was 1) | q₂, 0, R | q₂, 1, R | q₄, B, L |
| q₃ (need 0) | q₅, B, L | *reject* | **acc** |
| q₄ (need 1) | *reject* | q₅, B, L | **acc** |
| q₅ (go back) | q₅, 0, L | q₅, 1, L | q₀, B, R |

Each round erases two symbols, so the machine **always halts**. It is a **decider**, and the palindromes are a decidable language.

### Common mistakes

- **Treating "doesn't accept" as "rejects".** A recogniser may loop on strings outside L. Only a decider is guaranteed to halt.
- **Combining recognisers one after the other.** If the first machine loops, the second never runs. Alternate their steps instead.
- **Calling the Church–Turing thesis a theorem.** It cannot be proved, because "effective procedure" is an informal idea.

### Tutorial problems

1. Design a TM that decides {ww | w ∈ {a, b}\*}. Explain why it always halts.
2. Design a TM that recognises the binary strings with an equal number of 0s and 1s. Is it a decider?
3. L₁ and L₂ are recognised by M₁ and M₂. Describe a TM for L₁ ∪ L₂, and explain why simply running M₁ and then M₂ is wrong.
4. Give an example of a TM M and an input w on which M loops forever.

### Viva questions

1. What is the difference between a Turing machine that recognises a language and one that decides it?
2. State the Church–Turing thesis. Why is it called a thesis?
3. What is the difference between a deterministic and a nondeterministic Turing machine?
