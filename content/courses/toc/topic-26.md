---
title: "Variants of Turing machines: multi-tape and nondeterministic"
topic: 26
co: "CO4"
description: "More tapes, or the power to guess, make Turing machines faster or easier to design, but never more powerful. Every reasonable variant recognises the same languages."
outcomes: ["Define multi-tape and nondeterministic Turing machines", "Explain how a single-tape TM simulates a k-tape TM, and the cost of doing so", "Explain how a deterministic TM simulates a nondeterministic TM by breadth-first search", "Recognise other equivalent variants (multi-track, semi-infinite tape, two-stack machines, enumerators)"]
reading: ["Textbook 1, §3.2 Variants of Turing machines", "Textbook 2, §8.4 Extensions to the basic Turing machine", "Textbook 3, §10.1–10.3 Minor variations; TMs with more complex storage; nondeterministic TMs"]
videos: [{"title": "MIT 18.404J, Lecture 6: TM variants, Church–Turing thesis", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/tm-variants-church-turing-thesis/"}]
---

### Key ideas

**Multi-tape TM.** There are k tapes, each with its own head. The input starts on tape 1, and the other tapes start blank. One move reads all k symbols, then writes on every tape and moves every head independently (L, R, or S for stay):

> δ : Q × Γᵏ → Q × Γᵏ × {L, R, S}ᵏ

**It is equivalent to a single-tape TM.** A single tape can hold all k tapes, side by side, separated by markers. A dot over a symbol marks where each head is. To simulate one move, the single-tape machine:

1. sweeps the tape to read the k marked symbols;
2. sweeps again to update them;
3. shifts the contents right if one virtual tape needs more room.

If the k-tape machine takes t steps, the simulation takes **O(t²)** steps. The cost is time, not power.

**Nondeterministic TM (NDTM).** δ(q, X) is a **set** of possible moves. The machine accepts if **some** branch of the computation accepts.

**It is equivalent to a deterministic TM.** The deterministic machine explores the tree of computations **breadth-first**, level by level. If any branch accepts, it eventually finds it.

- It must not search depth-first. One infinite branch would block the search forever.
- With branching factor b and an accepting branch at depth t, the search can take about b^t steps: **exponential time**. Whether this blow-up can be avoided is essentially the **P vs NP** question.

**Other equivalent models:**

- multi-track TMs;
- TMs whose tape is infinite in one direction only (semi-infinite);
- TMs that may stay put as well as move;
- PDAs with **two** stacks;
- enumerators;
- real programming languages with unbounded memory.

Every one of them recognises exactly the RE languages. This robustness is strong evidence for the Church–Turing thesis.

### Worked example

**Multiplication on a 3-tape TM.** Tape 1 holds 1ᵐ, tape 2 holds 1ⁿ, and tape 3 is for the output.

1. For each 1 on tape 1, move one cell right on tape 1.
2. Each time, sweep tape 2 from left to right, writing a 1 on tape 3 for every 1 read.
3. Rewind tape 2's head to its start.
4. When tape 1 runs out, tape 3 holds 1ᵐⁿ.

This takes about m·n steps. A single-tape machine needs repeated back-and-forth trips to copy n beside the input each time, so it is far slower. Yet it computes exactly the same function.

**A problem that suits nondeterminism:** "Is the binary number n composite?" An NDTM **guesses** a factor d with 1 < d < n, then checks that d divides n. If any guess succeeds, it accepts. A deterministic machine has to try the candidates one by one.

### Common mistakes

- **"Multi-tape TMs can solve more problems."** No: they are faster, not more powerful.
- **Simulating an NDTM depth-first.** One infinite branch would hide an accepting branch elsewhere. Search breadth-first.
- **"NDTMs are physical parallel computers."** They are a mathematical model. Simulating one deterministically costs exponential time, as far as anyone knows.

### Tutorial problems

1. What is the main advantage of a multi-tape Turing machine over a single-tape one? Is it more powerful?
2. Explain how multiplication of two integers can be done on a multi-tape Turing machine.
3. Give an example of a problem that is easier to solve with an NDTM, and describe the guess-and-check strategy.
4. Describe how a single-tape TM stores the contents and head positions of a 3-tape TM.
5. Can a Turing machine with a finite number of states recognise all recursively enumerable languages? Explain.

### Viva questions

1. Explain the multi-tape Turing machine and its advantages over a single-tape Turing machine.
2. Why must the deterministic simulation of an NDTM use breadth-first search?
3. Why are so many different models of computation equivalent to the Turing machine, and what does that suggest?
