---
title: "Dynamic programming and matrix-chain multiplication"
keywords: "dp mcm"
topic: 25
co: "CO3"
description: "When a recursive solution keeps solving the same subproblems, store each answer once and reuse it. Matrix-chain multiplication shows the full method: define subproblems, write the recurrence, fill a table, and trace back the choice."
outcomes: ["Recognise the two signs that call for dynamic programming: optimal substructure and overlapping subproblems", "Write a recurrence and compute it top-down (memoisation) or bottom-up (tabulation)", "Fill the matrix-chain table m[i][j] and recover the optimal parenthesisation from s[i][j]", "State the Θ(n³) time and Θ(n²) space of matrix-chain DP"]
reading: ["Textbook 1, §15.1–15.3 Rod cutting; matrix-chain multiplication; elements of dynamic programming", "Textbook 2, Ch. 5 Dynamic programming", "Textbook 5, Ch. on dynamic programming"]
videos: [{"title": "Coursera: Algorithmic Toolbox (dynamic programming weeks)", "url": "https://www.coursera.org/learn/algorithmic-toolbox"}]
---

### Intuition

The naive recursive Fibonacci, fib(n) = fib(n−1) + fib(n−2), recomputes fib(3) and fib(2) again and again — exponential time for a problem with only n different subproblems. **Dynamic programming (DP)** fixes this by solving each subproblem **once** and storing the answer.

DP applies when a problem has

1. **optimal substructure** — an optimal solution is built from optimal solutions to subproblems, and
2. **overlapping subproblems** — the same subproblems recur many times.

Two ways to organise it:

| Style | How | |
| --- | --- | --- |
| top-down (memoisation) | write the recursion, cache each result in a dictionary | easy to write |
| bottom-up (tabulation) | fill a table from the smallest subproblems upward | no recursion, often faster |

**The DP recipe:** (1) define what a subproblem is, (2) write the recurrence, (3) choose an order to fill the table, (4) store choices so the solution itself — not just its value — can be reconstructed.

### How it works

**Matrix-chain multiplication.** Multiplying a p × q matrix by a q × r matrix costs p·q·r scalar multiplications. A chain A₁A₂…Aₙ can be bracketed in many ways; the result is the same, but the cost is not:

For A₁ (10 × 30), A₂ (30 × 5), A₃ (5 × 60):

- (A₁A₂)A₃ costs 10·30·5 + 10·5·60 = 1500 + 3000 = **4500**
- A₁(A₂A₃) costs 30·5·60 + 10·30·60 = 9000 + 18000 = **27000** — six times more.

With dimensions p₀, p₁, …, pₙ (Aᵢ is p_{i−1} × pᵢ), let **m[i][j]** = minimum cost to compute Aᵢ…Aⱼ:

> m[i][i] = 0  
> m[i][j] = min over i ≤ k < j of ( m[i][k] + m[k+1][j] + p_{i−1}·p_k·p_j )

and **s[i][j]** = the best split k. Fill the table by increasing chain length.

**Example:** p = [5, 10, 3, 12, 5] (four matrices: 5×10, 10×3, 3×12, 12×5).

| m[i][j] | j = 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| i = 1 | 0 | 150 | 330 | **405** |
| 2 | | 0 | 360 | 330 |
| 3 | | | 0 | 180 |
| 4 | | | | 0 |

For instance m[1][3] = min( m[1][1] + m[2][3] + 5·10·12 = 0 + 360 + 600 = 960, m[1][2] + m[3][3] + 5·3·12 = 150 + 0 + 180 = **330** ).

Minimum cost **405** with bracketing **(A₁A₂)(A₃A₄)**.

### Python implementation

```python
from functools import lru_cache


@lru_cache(maxsize=None)
def fib(n):
    """Top-down DP: each fib(k) is computed once."""
    return n if n < 2 else fib(n - 1) + fib(n - 2)


def matrix_chain(p):
    """p: dimensions, matrix i is p[i-1] x p[i]. Returns (min cost, bracketing)."""
    n = len(p) - 1
    m = [[0] * (n + 1) for _ in range(n + 1)]
    s = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):                  # chain length
        for i in range(1, n - length + 2):
            j = i + length - 1
            m[i][j] = float("inf")
            for k in range(i, j):                   # try every split
                cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]
                if cost < m[i][j]:
                    m[i][j], s[i][j] = cost, k

    def bracket(i, j):
        return f"A{i}" if i == j else "(" + bracket(i, s[i][j]) + bracket(s[i][j] + 1, j) + ")"

    return m[1][n], bracket(1, n)


if __name__ == "__main__":
    print(fib(50))                                  # 12586269025
    print(matrix_chain([10, 30, 5, 60]))            # (4500, '((A1A2)A3)')
    print(matrix_chain([5, 10, 3, 12, 5]))          # (405, '((A1A2)(A3A4))')
```

### Complexity

| | Time | Space |
| --- | --- | --- |
| trying every bracketing (Catalan many) | exponential | — |
| matrix-chain DP | **Θ(n³)** — n² table cells, up to n splits each | Θ(n²) |
| Fibonacci, naive recursion | Θ(φⁿ) | — |
| Fibonacci, DP | Θ(n) | Θ(n) (or Θ(1) keeping two values) |

### Common mistakes

- **Wrong fill order.** m[i][j] needs all shorter chains first — loop over **length**, not over i then j naively.
- **Index slips with p.** Matrix Aᵢ is p_{i−1} × pᵢ, so the split cost is p_{i−1}·p_k·p_j.
- **Forgetting to store the choice** s[i][j] — then you know the cost but not the bracketing.
- **Using DP when subproblems don't overlap.** Merge sort's subproblems are disjoint; plain divide and conquer is enough there.

### Problems

1. Fill the m and s tables for p = [4, 10, 3, 12, 20, 7] and give the optimal bracketing.
2. **Lab:** implement `matrix_chain` top-down with `lru_cache` and check it against the bottom-up version.
3. How many different bracketings does a chain of 5 matrices have? (Catalan number.)
4. **Lab:** rod cutting — a rod of length n and prices for each length; maximise revenue with DP.
5. Explain why greedy "multiply the cheapest adjacent pair first" does not always give the optimum.
