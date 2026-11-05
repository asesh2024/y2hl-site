---
title: "Turing machines: model and notation"
keywords: "tm"
topic: 21
co: "CO4"
description: "A finite control with an unlimited tape that it can read, write and move along in both directions: the standard model of what an algorithm is."
outcomes: ["Define a Turing machine as a 7-tuple and read its transition function", "Write instantaneous descriptions in the form αqβ and trace a run", "Design a Turing machine that marks off symbols to recognise a language such as aⁿbⁿ", "Explain why a Turing machine is more powerful than a PDA"]
reading: ["Textbook 1, §3.1 Turing machines", "Textbook 2, §8.2 The Turing machine", "Textbook 3, §9.1 The standard Turing machine"]
videos: [{"title": "MIT 18.404J, Lecture 5: Turing machines", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/cf-pumping-lemma-turing-machines/"}]
---

### Key ideas

**A Turing machine (TM)** is a 7-tuple M = (Q, Σ, Γ, δ, q₀, B, F):

| Part | Meaning |
| --- | --- |
| Q | a finite set of states |
| Σ | the input alphabet |
| Γ ⊇ Σ | the tape alphabet, which also contains the blank B (B ∉ Σ) |
| δ : Q × Γ → Q × Γ × {L, R} | the transition function; it may be left undefined in places |
| q₀ | the start state |
| B | the blank symbol, which fills every cell not holding input |
| F ⊆ Q | the accepting (final) states |

**How it runs.** The input sits on an otherwise blank tape, which is unbounded to the right. The head starts on the first input symbol, in state q₀. One move δ(q, X) = (p, Y, D) means:

- in state q, reading X,
- write Y in place of X,
- move the head one cell in direction D (L or R),
- and go to state p.

The machine **halts** when no move is defined. It **accepts** if it enters a final state. On some inputs it may **run forever**.

**Instantaneous description.** Write **α q β**:

- the tape to the left of the head is α;
- the machine is in state q;
- the head is on the first symbol of β;
- β continues to the last non-blank cell.

⊢ is one move, and ⊢\* means zero or more moves.

**More powerful than a PDA.** A TM can move both ways, read what it wrote, and overwrite. That lets it compare three counts, as in aⁿbⁿcⁿ, copy strings, and do arithmetic. As far as anyone knows, it can carry out **any algorithm** (the Church–Turing thesis, topic 23).

### Worked example

**A TM for {aⁿbⁿ | n ≥ 1}.** Repeatedly mark one a with X and the matching b with Y.

| State | a | b | X | Y | B |
| --- | --- | --- | --- | --- | --- |
| q₀ (find next a) | q₁, X, R | | | q₃, Y, R | |
| q₁ (find a b) | q₁, a, R | q₂, Y, L | | q₁, Y, R | |
| q₂ (return left) | q₂, a, L | | q₀, X, R | q₂, Y, L | |
| q₃ (check only Y's are left) | | | | q₃, Y, R | **q<sub>acc</sub>**, B, R |

Blank cells mean "no move", so the machine halts and rejects.

**Run on `aabb`:**

> q₀aabb ⊢ Xq₁abb ⊢ Xaq₁bb ⊢ Xq₂aYb ⊢ q₂XaYb ⊢ Xq₀aYb ⊢ XXq₁Yb ⊢ XXYq₁b ⊢ XXq₂YY ⊢ Xq₂XYY ⊢ XXq₀YY ⊢ XXYq₃Y ⊢ XXYYq₃B ⊢ XXYYB q<sub>acc</sub>

That is 13 moves, ending in the accepting state.

**On `aab`:**

> q₀aab ⊢ Xq₁ab ⊢ Xaq₁b ⊢ Xq₂aY ⊢ q₂XaY ⊢ Xq₀aY ⊢ XXq₁Y ⊢ XXYq₁B

The second a finds no b to match: q₁ reads a blank, where it has no move. The machine halts outside a final state, so it **rejects**.

### Common mistakes

- **Writing α q β with the head in the wrong place.** The head is on the **first symbol of β**, to the right of the state.
- **Forgetting that halting is not accepting.** A TM accepts only by entering a final state. Halting anywhere else is a rejection.
- **Leaving out the blank column.** Most machines need moves on B, to detect the end of the input.
- **Assuming a TM always halts.** It may loop forever. Topic 24 builds on exactly this.

### Tutorial problems

1. Construct a Turing machine for L = {aⁿbⁿcⁿ | n ≥ 0}. Trace it on `abc` and `aabbc`.
2. Create a Turing machine that accepts the binary numbers divisible by 3. (Hint: it never needs to write. Why is that already possible with a DFA?)
3. Write the full sequence of IDs of the worked-example machine on `ab` and on `abb`.
4. Modify the worked-example machine so that it also accepts ε (n = 0).

### Viva questions

1. Describe the components of a Turing machine.
2. What is the difference between halting, accepting and looping?
3. Why is a Turing machine more powerful than a pushdown automaton?
