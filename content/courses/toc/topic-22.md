---
title: "Turing machine construction techniques"
topic: 22
co: "CO4"
description: "Practical tricks for building Turing machines, and machines that compute functions: unary arithmetic, binary increment and copying."
outcomes: ["Use the standard construction techniques: storage in the state, multiple tracks, checking off symbols, shifting, and subroutines", "Design Turing machines that compute functions on unary and binary numbers", "Explain what it means for a function to be Turing-computable"]
reading: ["Textbook 2, §8.3 Programming techniques for Turing machines", "Textbook 3, §9.1–9.2 Turing machines as transducers; combining Turing machines", "Textbook 1, §3.1 (examples)"]
videos: [{"title": "NPTEL: Theory of Computation, IIT Kanpur (see the Turing machine construction lectures)", "url": "https://nptel.ac.in/courses/106104148"}]
---

### Key ideas

**Computing a function.** A TM computes f if, started with w on the tape, it halts with f(w) on the tape. A function is **Turing-computable** if some TM computes it.

Numbers are usually written in **unary**: n is 1ⁿ. Arguments are separated by a 0 or another marker, so the pair (3, 2) is written `111 0 11`.

**Construction techniques:**

| Technique | Idea | Example |
| --- | --- | --- |
| **Storage in the state** | Use states like q[a] to remember a symbol, a finite amount of memory | "the first symbol was a; now look for a matching a" |
| **Multiple tracks** | One tape symbol is a tuple, giving several "rows" | track 1 holds the input, track 2 a ✓ mark |
| **Checking off** | Replace a symbol by a marked version (X, Y) once it is used | aⁿbⁿ in topic 21 |
| **Shifting over** | Move part of the tape one cell to make room | inserting a symbol |
| **Subroutines** | A group of states that does one job, then returns | "copy", "compare", "add 1" |

None of these adds power. They only make machines easier to design and describe.

### Worked example

**Unary addition: f(m, n) = m + n.** The input is 1ᵐ 0 1ⁿ, and the output should be 1ᵐ⁺ⁿ.

The idea: turn the separating 0 into a 1. That joins the two blocks but adds one 1 too many, so erase the last 1.

| State | 1 | 0 | B |
| --- | --- | --- | --- |
| q₀ (skip the first block) | q₀, 1, R | q₁, 1, R | |
| q₁ (skip the second block) | q₁, 1, R | | q₂, B, L |
| q₂ (erase the last 1) | q₃, B, L | | |
| q₃ (return to the start) | q₃, 1, L | | **q<sub>halt</sub>**, B, R |

**Run on `111011`** (3 + 2): the 0 becomes 1, giving `111111`. The machine then erases the last 1 and halts with **`11111`**, which is 5. The same machine works when m or n is 0. For example, `0` (0 + 0) ends with an empty tape.

**Binary increment, least significant bit first** (as in the workbook problem). Scan right, turning 1 into 0 (each carry). At the first 0 or blank, write 1 and halt.

- `101` is 5, written LSB first. It becomes `011`, which is 6 written LSB first.

### Common mistakes

- **Unary off-by-one errors.** Decide whether n is 1ⁿ or 1ⁿ⁺¹, and stay consistent. With the convention 1ⁿ, zero is the empty block.
- **Not saying where the head ends.** For functions, state the final tape **and** the head position.
- **Forgetting the zero cases.** Test m = 0 and n = 0.
- **Proper subtraction.** m ∸ n is max(m − n, 0), so make sure the machine never "goes negative".

### Tutorial problems

1. Design a TM for addition of two unary numbers. Trace it on `11011`.
2. Design a TM for proper subtraction m ∸ n of two unary numbers. (Hint: repeatedly cross off one 1 from each side.)
3. Design a TM for multiplication of two unary numbers. (Hint: for each 1 of m, copy n to the end.)
4. Design a TM that increments a binary number given with the least significant bit on the left. For example, `101` (5) becomes `011` (6).
5. Construct a TM that copies a binary string: `011` becomes `011011`. Which techniques from the table does it use?

### Viva questions

1. Define a computable function.
2. Why is unary notation convenient for Turing machine arithmetic, even though it is wasteful?
3. Do multiple tracks or storage in the state make Turing machines more powerful? Why not?
