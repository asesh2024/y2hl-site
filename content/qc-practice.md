---
title: "Quantum Computing Made Clear: practice problems"
description: "Free practice problems for every chapter of Quantum Computing Made Clear, from easy to harder, with answers you can open and Python programs you can run on the page."
---

<p class="lead">Practice for each chapter of <a href="https://www.amazon.in/dp/B0HP8D7WT3" rel="noopener"><em>Quantum Computing Made Clear</em></a>. Try each problem on paper first, then open the answer. Where there's a program, press <strong>▶ Run</strong> to check your working.</p>

**How to use this page**

- Problems go from easy (★) to harder (★★★). Do them in order.
- Every numerical answer here has been checked by running code.
- In the programs, the first qubit is the left bit: `|10⟩` means qubit 0 is 1 and qubit 1 is 0. If your notes order qubits the other way, swap the bits; the reasoning is the same.
- The first **Run** takes a few seconds while Python loads.

### Chapter 1 · Why Quantum Computing

**1.1 ★** How many complex numbers (amplitudes) are needed to write down the state of 10 qubits?

<details markdown="1"><summary>Show answer</summary>

**1,024.** An n-qubit state has 2ⁿ amplitudes, and 2¹⁰ = 1,024.
</details>

**1.2 ★★** A laptop stores each amplitude in 16 bytes. How much memory does it need to hold the full state of 30 qubits?

<details markdown="1"><summary>Show answer</summary>

2³⁰ × 16 bytes = 17,179,869,184 bytes = **16 GiB**. Every extra qubit doubles this, so 40 qubits would need 16 TiB. This is why classical computers struggle to simulate even modest quantum systems.
</details>

**1.3 ★★** True or false: *"A quantum computer tries every answer at once and then reads out the best one."*

<details markdown="1"><summary>Show answer</summary>

**False.** A measurement returns just one outcome, at random, according to the probabilities. Quantum algorithms work by arranging **interference**, so that wrong answers cancel out and right answers are reinforced before measuring.
</details>

**1.4 ★★★** You must find one marked item among N = 1,000,000 unsorted items. About how many checks does a classical search need on average, and about how many Grover iterations does a quantum search need?

<details markdown="1"><summary>Show answer</summary>

Classical: about N/2 = **500,000** checks on average.
Grover: about (π/4)·√N = (π/4)·1000 ≈ **785** iterations.
That's a quadratic speed-up, not an exponential one.
</details>

### Chapter 2 · The Mathematics We Need

**2.1 ★** Find |3 + 4i| and (1 + i)(1 − i).

<details markdown="1"><summary>Show answer</summary>

|3 + 4i| = √(9 + 16) = **5**. (1 + i)(1 − i) = 1 − i² = **2**.
</details>

**2.2 ★★** Normalise the vector (3, 4i). What probabilities do its two entries give?

<details markdown="1"><summary>Show answer</summary>

Its length is √(9 + 16) = 5, so the normalised vector is **(0.6, 0.8i)**. The probabilities are |0.6|² = **0.36** and |0.8i|² = **0.64**, which add up to 1.
</details>

**2.3 ★★** Multiply X·Z and Z·X, where X = [[0,1],[1,0]] and Z = [[1,0],[0,−1]]. Are they equal?

<details markdown="1"><summary>Show answer</summary>

X·Z = [[0, −1], [1, 0]] and Z·X = [[0, 1], [−1, 0]]. **They're not equal** (one is minus the other), so the order of gates matters.
</details>

**2.4 ★★★** Compute |0⟩ ⊗ |1⟩ and (1/√2, 1/√2) ⊗ (1, 0) as 4-entry vectors.

<details markdown="1"><summary>Show answer</summary>

|0⟩ ⊗ |1⟩ = **(0, 1, 0, 0)**, which is |01⟩.
(1/√2, 1/√2) ⊗ (1, 0) = **(0.7071, 0, 0.7071, 0)**, which is (|00⟩ + |10⟩)/√2.
</details>

Check 2.3 and 2.4 with NumPy:

```python
import numpy as np
X = np.array([[0, 1], [1, 0]])
Z = np.array([[1, 0], [0, -1]])
print("X·Z =", (X @ Z).tolist())
print("Z·X =", (Z @ X).tolist())

zero, one = np.array([1, 0]), np.array([0, 1])
plus = np.array([1, 1]) / np.sqrt(2)
print("|0>⊗|1> =", np.kron(zero, one))
print("|+>⊗|0> =", np.kron(plus, zero).round(4))
```

### Chapter 3 · Understanding a Qubit

**3.1 ★** A qubit is in the state (√3/2)|0⟩ + (1/2)|1⟩. What are the probabilities of measuring 0 and 1?

<details markdown="1"><summary>Show answer</summary>

P(0) = (√3/2)² = **0.75** and P(1) = (1/2)² = **0.25**.
</details>

**3.2 ★★** |+⟩ = (|0⟩ + |1⟩)/√2 and |−⟩ = (|0⟩ − |1⟩)/√2 give the same probabilities when measured. How are they different, and how could you tell them apart?

<details markdown="1"><summary>Show answer</summary>

Both give 0 or 1 with probability 0.5. They differ in the **relative phase** of |1⟩ (+ or −). Apply **H** before measuring: H|+⟩ = |0⟩ and H|−⟩ = |1⟩, so the outcome tells you which state it was.
</details>

**3.3 ★★** Where on the Bloch sphere is (|0⟩ + i|1⟩)/√2?

<details markdown="1"><summary>Show answer</summary>

Writing it as cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ gives θ = π/2 and φ = π/2. It sits **on the equator, pointing along the +y axis**.
</details>

**3.4 ★★★** Are |0⟩ and −|0⟩ different states physically?

<details markdown="1"><summary>Show answer</summary>

**No.** They differ only by a **global phase** (−1 = e^{iπ}), which changes no measurement probability. Only *relative* phases between amplitudes can be observed.
</details>

Measure the state from 3.1 a thousand times:

```python
import numpy as np
amp = np.array([np.sqrt(3) / 2, 1 / 2])
probs = np.abs(amp) ** 2
rng = np.random.default_rng()
results = rng.choice([0, 1], size=1000, p=probs)
print("Probabilities:", probs.round(2))
print("Counts: 0 ->", (results == 0).sum(), " 1 ->", (results == 1).sum())
```

Run it several times. The counts stay close to 750 and 250, but change from run to run.

### Chapter 4 · Quantum Gates

**4.1 ★** What is H|0⟩? What happens if you apply H twice?

<details markdown="1"><summary>Show answer</summary>

H|0⟩ = |+⟩ = (|0⟩ + |1⟩)/√2. Applying H twice gives back **|0⟩**, because H·H = I.
</details>

**4.2 ★★** What does the sequence H, then Z, then H do to |0⟩?

<details markdown="1"><summary>Show answer</summary>

H·Z·H = X, so the result is **|1⟩**. A phase flip sandwiched between two Hadamards becomes a bit flip.
</details>

**4.3 ★★** Apply Ry(π/3) to |0⟩. What is the probability of measuring 1?

<details markdown="1"><summary>Show answer</summary>

Ry(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩, so P(1) = sin²(π/6) = **0.25**.
</details>

**4.4 ★★★** Can the matrix [[1, 1], [0, 0]] be a quantum gate?

<details markdown="1"><summary>Show answer</summary>

**No.** Quantum gates must be unitary (U†U = I), and so reversible. This matrix sends |0⟩ and |1⟩ both to |0⟩, so you can't undo it. Its determinant is 0.
</details>

```python
import numpy as np
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
Z = np.array([[1, 0], [0, -1]])
print("H·H =\n", (H @ H).round(6) + 0)
print("H·Z·H =\n", (H @ Z @ H).round(6) + 0)

M = np.array([[1, 1], [0, 0]])
print("Is M unitary?", np.allclose(M.conj().T @ M, np.eye(2)))
```

### Chapter 5 · Two Qubits and Entanglement

**5.1 ★** Write |1⟩ ⊗ |0⟩ as a 4-entry vector.

<details markdown="1"><summary>Show answer</summary>

**(0, 0, 1, 0)**, which is |10⟩.
</details>

**5.2 ★★** Apply CNOT (qubit 0 controls qubit 1) to |10⟩, and then to |+⟩|0⟩.

<details markdown="1"><summary>Show answer</summary>

CNOT|10⟩ = **|11⟩**, since the control is 1, so the target flips.
CNOT|+⟩|0⟩ = **(|00⟩ + |11⟩)/√2**, a Bell state.
</details>

**5.3 ★★** For a two-qubit state a|00⟩ + b|01⟩ + c|10⟩ + d|11⟩, it is **not** entangled exactly when ad − bc = 0. Test (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2 and (|00⟩ + |11⟩)/√2.

<details markdown="1"><summary>Show answer</summary>

First state: ad − bc = 1/4 − 1/4 = **0**, so it's not entangled. It equals |+⟩|+⟩.
Bell state: ad − bc = 1/2 − 0 = **1/2**, so it's entangled.
</details>

**5.4 ★★★** Someone says CNOT copies a qubit, because CNOT|0⟩|0⟩ = |0⟩|0⟩ and CNOT|1⟩|0⟩ = |1⟩|1⟩. Show that it fails for |+⟩.

<details markdown="1"><summary>Show answer</summary>

A copy would be |+⟩|+⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2. But CNOT|+⟩|0⟩ = (|00⟩ + |11⟩)/√2, an entangled state. **No circuit can copy an unknown state.** That's the no-cloning theorem.
</details>

```python
import numpy as np
zero = np.array([1, 0])
plus = np.array([1, 1]) / np.sqrt(2)
CNOT = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]])

bell = CNOT @ np.kron(plus, zero)
print("CNOT|+>|0> =", bell.round(4))
print("Copy would be", np.kron(plus, plus).round(4))
a, b, c, d = bell
print("ad - bc =", round(a * d - b * c, 4), "(non-zero means entangled)")
```

### Chapter 6 · Reading and Building Circuits

**6.1 ★★** Start in |00⟩. Apply H to qubit 0, then CNOT (0 → 1), then X to qubit 1. What is the final state?

<details markdown="1"><summary>Show answer</summary>

|00⟩ → (|00⟩ + |10⟩)/√2 → (|00⟩ + |11⟩)/√2 → **(|01⟩ + |10⟩)/√2**.
</details>

**6.2 ★** Apply H to both qubits of |00⟩ and measure. What are the probabilities of the four outcomes?

<details markdown="1"><summary>Show answer</summary>

Each of 00, 01, 10 and 11 has probability **0.25**.
</details>

**6.3 ★★** In teleportation, how many classical bits must be sent? Why doesn't teleportation send information faster than light?

<details markdown="1"><summary>Show answer</summary>

**Two classical bits.** Until they arrive, the receiver's qubit looks completely random. The two bits travel by an ordinary channel, at or below the speed of light.
</details>

**6.4 ★★★** Alice and Bob share (|00⟩ + |11⟩)/√2. Alice applies Z to her qubit (qubit 0). What is the shared state now, and why does this matter for superdense coding?

<details markdown="1"><summary>Show answer</summary>

It becomes **(|00⟩ − |11⟩)/√2**, a different Bell state. By applying one of I, X, Z or both to her one qubit, Alice can create any of four Bell states. Bob can tell all four apart, so **one qubit carries two classical bits**.
</details>

Trace 6.1 step by step:

```python
import numpy as np
I = np.eye(2)
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
X = np.array([[0, 1], [1, 0]])
CNOT = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]])

state = np.array([1, 0, 0, 0])            # |00>
for name, gate in [("H on q0", np.kron(H, I)), ("CNOT", CNOT), ("X on q1", np.kron(I, X))]:
    state = gate @ state
    print(f"after {name:8}", state.round(4))
```

### Chapter 7 · How Quantum Algorithms Work

**7.1 ★★** Apply H twice to |0⟩. The amplitude of |1⟩ comes from two paths: one with amplitude (1/√2)(1/√2) and one with (1/√2)(−1/√2). Add them. What does this show?

<details markdown="1"><summary>Show answer</summary>

1/2 − 1/2 = **0**, so the two paths cancel. Meanwhile the |0⟩ paths add to 1/2 + 1/2 = 1. This is **destructive and constructive interference**, the engine of every quantum algorithm.
</details>

**7.2 ★★** In Deutsch's algorithm, the output is 0 when f is constant and 1 when f is balanced. What does it output for f(x) = NOT x? And for f(x) = 1?

<details markdown="1"><summary>Show answer</summary>

f(x) = NOT x is balanced, so the output is **1**. f(x) = 1 is constant, so the output is **0**. Either way it takes **one query** of f.
</details>

**7.3 ★★** For Deutsch–Jozsa with n = 3 input bits, how many queries does a classical computer need in the worst case to be certain? And the quantum algorithm?

<details markdown="1"><summary>Show answer</summary>

Classical worst case: 2ⁿ⁻¹ + 1 = **5** queries. Quantum: **1** query.
</details>

**7.4 ★★★** Grover search with N = 8 and one marked item. What is the chance of finding it after 1, 2 and 3 iterations?

<details markdown="1"><summary>Show answer</summary>

**0.7812, 0.9453 and 0.3301.** Two iterations is best (π/4 · √8 ≈ 2.2). A third iteration *overshoots* and the chance drops, so more iterations aren't always better.
</details>

Watch Grover's probability rise and fall:

```python
import numpy as np
N, marked = 8, 5
state = np.ones(N) / np.sqrt(N)
for k in range(1, 5):
    state[marked] *= -1                 # oracle: flip the sign of the marked item
    state = 2 * state.mean() - state    # diffusion: reflect about the average
    print(f"after {k} iteration(s): P(marked) = {state[marked] ** 2:.4f}")
```

### Chapter 8 · Factoring, Optimization and Learning

**8.1 ★★** Find the order r of 7 modulo 15 (the smallest r with 7ʳ mod 15 = 1). Then use gcd(7^(r/2) ± 1, 15) to factor 15.

<details markdown="1"><summary>Show answer</summary>

7, 49 mod 15 = 4, 28 mod 15 = 13, 91 mod 15 = 1, so **r = 4**.
gcd(7² − 1, 15) = gcd(48, 15) = **3** and gcd(7² + 1, 15) = gcd(50, 15) = **5**. So 15 = 3 × 5.
</details>

**8.2 ★★★** Do the same for a = 2 and N = 21.

<details markdown="1"><summary>Show answer</summary>

The order is **r = 6** (2⁶ = 64 = 3 × 21 + 1).
gcd(2³ − 1, 21) = gcd(7, 21) = **7** and gcd(2³ + 1, 21) = gcd(9, 21) = **3**. So 21 = 3 × 7.
</details>

**8.3 ★★** What is the Max-Cut value of a triangle, and of a square (a 4-cycle)?

<details markdown="1"><summary>Show answer</summary>

Triangle: **2**. With three nodes and two groups, one edge always stays inside a group.
Square: **4**. Alternate the groups around the square and every edge is cut.
</details>

**8.4 ★★** In a hybrid (variational) algorithm, what does the classical computer do, and what does the quantum circuit do?

<details markdown="1"><summary>Show answer</summary>

The **quantum circuit** prepares a state from adjustable angles and is measured to estimate a cost. The **classical optimiser** reads the cost and chooses new angles to lower it. The two take turns in a loop until the cost stops improving.
</details>

Check 8.1–8.3 by brute force:

```python
from math import gcd
from itertools import product

def order(a, n):
    r, x = 1, a % n
    while x != 1:
        x = x * a % n
        r += 1
    return r

for a, n in [(7, 15), (2, 21)]:
    r = order(a, n)
    h = pow(a, r // 2)
    print(f"a={a}, N={n}: r={r}, factors {gcd(h - 1, n)} and {gcd(h + 1, n)}")

def max_cut(nodes, edges):
    return max(sum(g[u] != g[v] for u, v in edges) for g in product([0, 1], repeat=nodes))

print("Triangle:", max_cut(3, [(0, 1), (1, 2), (0, 2)]))
print("Square:  ", max_cut(4, [(0, 1), (1, 2), (2, 3), (3, 0)]))
```

### Chapter 9 · Running Small Quantum Programs

**9.1 ★** A program runs a two-qubit circuit 1,000 times and reports `{'00': 502, '11': 498}`. Which state was probably prepared?

<details markdown="1"><summary>Show answer</summary>

The Bell state **(|00⟩ + |11⟩)/√2**: 00 and 11 about half the time each, and never 01 or 10.
</details>

**9.2 ★★** A student's program prints the probabilities 0.6 and 0.6 for a single qubit. What went wrong?

<details markdown="1"><summary>Show answer</summary>

Probabilities must add up to 1, and these add up to 1.2. Most likely the program printed **amplitudes instead of squared magnitudes**, or the state was **never normalised**.
</details>

**9.3 ★★** Why is it good practice to add a check like `assert abs(sum(probs) - 1) < 1e-9` to your programs?

<details markdown="1"><summary>Show answer</summary>

It catches mistakes such as a missing normalisation, a non-unitary gate or a wrong tensor order **as soon as they happen**, before they produce believable but wrong results.
</details>

**9.4 ★★★** Run the program below with `seed=7`. Then remove the seed and run it again. Why do the counts change, and why are 01 and 10 still 0?

<details markdown="1"><summary>Show answer</summary>

With `seed=7` you get 00 → 502 and 11 → 498 every time. Without a seed, sampling is random, so the counts vary around 500. But 01 and 10 have **amplitude 0**, so they can never appear.
</details>

```python
import numpy as np
bell = np.array([1, 0, 0, 1]) / np.sqrt(2)
probs = np.abs(bell) ** 2
assert abs(probs.sum() - 1) < 1e-9

rng = np.random.default_rng(seed=7)
shots = rng.choice(4, size=1000, p=probs)
print({format(k, "02b"): int((shots == k).sum()) for k in range(4)})
```

### Chapter 10 · Noise, Errors and Practical Limits

**10.1 ★★** You estimate a probability near 0.5 from N shots. The standard error is √(p(1 − p)/N). What is it for N = 100 and N = 1,000?

<details markdown="1"><summary>Show answer</summary>

N = 100: **0.05**. N = 1,000: **0.0158**. Ten times more shots makes the error only about 3.2 times (√10) smaller.
</details>

**10.2 ★★** A three-qubit repetition code with majority vote fails when 2 or 3 qubits flip. If each qubit flips with probability p = 0.1, what is the failure rate?

<details markdown="1"><summary>Show answer</summary>

3p²(1 − p) + p³ = 0.027 + 0.001 = **0.028**, much better than 0.1 for an unprotected qubit.
</details>

**10.3 ★★★** Repeat 10.2 for p = 0.6. What does this tell you?

<details markdown="1"><summary>Show answer</summary>

3(0.36)(0.4) + 0.216 = **0.648**, which is *worse* than 0.6. Error correction only helps when the hardware is already good enough (here p < 0.5). This is the idea behind the **threshold** in real quantum error correction.
</details>

**10.4 ★★** Why doesn't a 50-qubit noisy machine automatically beat a laptop?

<details markdown="1"><summary>Show answer</summary>

Noise limits how many gates can run before results become random. Many problems have no known quantum speed-up. Finite shots add uncertainty. And reading out an answer can cost more than it saves. An advantage needs a suitable problem, a good algorithm, and hardware with low enough error.
</details>

Simulate the repetition code and compare with the formula:

```python
import numpy as np
rng = np.random.default_rng(1)
for p in (0.1, 0.6):
    flips = rng.random((100_000, 3)) < p
    simulated = (flips.sum(axis=1) >= 2).mean()
    formula = 3 * p**2 * (1 - p) + p**3
    print(f"p={p}: simulated {simulated:.4f}, formula {formula:.4f}, unprotected {p}")
```

---

Found a mistake, or want problems on a topic not covered here? Email [asesh.tripathy@gmail.com](mailto:asesh.tripathy@gmail.com). For step-by-step courses with runnable code, see [all free courses](/courses/).
