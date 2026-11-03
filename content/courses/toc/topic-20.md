---
title: "Linear bounded automata"
topic: 20
co: "CO3"
description: "A Turing machine that may only use the tape cells holding its input. It accepts exactly the context-sensitive languages."
outcomes: ["Define a linear bounded automaton and its end markers", "Explain why LBAs accept exactly the context-sensitive languages", "Explain why membership is decidable for LBAs, and why some questions about them are not", "Compare LBAs with PDAs and Turing machines"]
reading: ["Textbook 3, §11.4 (linear bounded automata)", "Textbook 1, §5.1 (linear bounded automata, in the reducibility chapter)"]
videos: [{"title": "NPTEL: Theory of Automata, Formal Languages and Computation, IIT Madras", "url": "https://nptel.ac.in/courses/106106049"}]
---

### Key ideas

**A linear bounded automaton (LBA)** is a nondeterministic Turing machine (topic 21) whose head may only visit the cells that hold the input.

- The input is written between two end markers: **⊢ w ⊣**.
- The head may not move left of ⊢ or right of ⊣, and the markers may not be overwritten.
- Inside that region, the LBA can read and write freely.

"Linear" means the memory is bounded by a linear function of the input length. A larger tape alphabet lets you pack k symbols into each cell, so the memory is effectively c·|w| for any constant c.

**What LBAs accept.** Nondeterministic LBAs accept **exactly the context-sensitive languages**.

- **CSG → LBA:** the LBA works backwards from w, guessing a reverse derivation. Because the rules never shrink the string, every intermediate form fits in |w| cells.
- **LBA → CSG:** the grammar encodes the LBA's tape, state and head position into the variables of a sentential form, and simulates the run without growing the string beyond |w| plus constants.

**Decidable and undecidable questions.**

- **Membership is decidable.** An LBA on input w has only finitely many configurations: q states × |w| head positions × |Γ|^|w| tape contents. A run longer than that must repeat a configuration, so it loops. A simulator can detect this and stop.
- **Emptiness** (does the LBA accept any string at all?) is **undecidable**.
- **The LBA problem** asks whether deterministic LBAs are as powerful as nondeterministic ones. It is still **open**. It is known, though, that the context-sensitive languages are closed under complement (the Immerman–Szelepcsényi theorem).

**Where LBAs sit:**

| Machine | Memory | Languages |
| --- | --- | --- |
| Finite automaton | none beyond the state | regular |
| PDA | a stack | context-free |
| LBA | tape the size of the input | context-sensitive |
| Turing machine | unlimited tape | recursively enumerable |

### Worked example

**An LBA for {aⁿbⁿcⁿ | n ≥ 1}.** The input is ⊢ aabbcc ⊣.

1. Check the shape a⁺b⁺c⁺ in one left-to-right pass, as a DFA would.
2. Go back to ⊢. Cross off the first unmarked a (write X), then the first unmarked b (Y), then the first unmarked c (Z).
3. Repeat step 2. If the a's, b's and c's run out at the same time, **accept**. If one runs out early, **reject**.

```text
⊢ a a b b c c ⊣    start
⊢ X a Y b Z c ⊣    after round 1
⊢ X X Y Y Z Z ⊣    after round 2: everything matched, accept
```

The machine never needed a cell outside the input, so it is an LBA. A PDA cannot do this, because its stack can match only one pair of counts.

### Common mistakes

- **Treating an LBA as a PDA.** An LBA can move both ways and overwrite cells. A PDA reads its input once and sees only the top of its stack.
- **Thinking every question about LBAs is decidable.** Membership is, but emptiness is not.
- **Calling the LBA problem solved.** Whether deterministic LBAs equal nondeterministic ones is still open.

### Tutorial problems

1. Describe an LBA for {ww | w ∈ {a, b}\*}. (Hint: first find and mark the middle.)
2. Describe an LBA for {a<sup>n²</sup> | n ≥ 1}.
3. An LBA has q states and tape alphabet Γ. How many configurations can it have on an input of length n? Why does this make membership decidable?
4. Explain how an LBA can check whether w ∈ L(G) for a context-sensitive grammar G, by running the derivation backwards.

### Viva questions

1. What is a linear bounded automaton? How does it differ from a Turing machine?
2. What class of languages do LBAs accept?
3. What is the "LBA problem"?
