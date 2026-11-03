---
title: "Longest common subsequence"
topic: 26
co: "CO3"
description: "The longest sequence of characters that appears, in order but not necessarily together, in two strings. A two-dimensional DP table gives its length in O(m·n), and a walk back through the table gives the subsequence itself."
outcomes: ["Distinguish subsequences from substrings", "Write the LCS recurrence and fill the DP table by hand", "Trace back through the table to recover an LCS", "Relate LCS to applications such as diff tools and DNA comparison"]
reading: ["Textbook 1, §15.4 Longest common subsequence", "Textbook 2, §5.6 (string editing) and Ch. 5 Dynamic programming", "Textbook 5, Ch. on dynamic programming"]
videos: [{"title": "Coursera: Algorithmic Toolbox (dynamic programming: edit distance and alignment)", "url": "https://www.coursera.org/learn/algorithmic-toolbox"}]
---

### Intuition

A **subsequence** keeps characters in their original order but may skip some: `ONE` is a subsequence of `STONE` and of `LONGEST`. (A **substring** must be contiguous — `ONE` is not a substring of `LONGEST`.) The **longest common subsequence (LCS)** of two strings measures how similar they are. `git diff` uses this idea to show which lines stayed the same between two versions of a file; biologists use it to compare DNA.

Trying all 2ᵐ subsequences of one string is hopeless. But the problem has optimal substructure: look at the **last characters**.

### How it works

Let L[i][j] = length of an LCS of the first i characters of X and the first j characters of Y:

> L[i][0] = L[0][j] = 0  
> if X[i] = Y[j]: L[i][j] = L[i−1][j−1] + 1  (the matching character extends an LCS)  
> otherwise:     L[i][j] = max( L[i−1][j], L[i][j−1] )  (drop the last character of one string)

**Table for X = STONE, Y = LONGEST:**

| | ∅ | L | O | N | G | E | S | T |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ∅ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| S | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| T | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 2 |
| O | 0 | 0 | **1** | 1 | 1 | 1 | 1 | 2 |
| N | 0 | 0 | 1 | **2** | 2 | 2 | 2 | 2 |
| E | 0 | 0 | 1 | 2 | 2 | **3** | 3 | 3 |

LCS length = L[5][7] = **3**.

**Trace back** from the bottom-right corner: if the characters match, take that character and move diagonally up-left; otherwise move to the neighbour (up or left) holding the larger value. The bold cells are where characters matched: O, N, E — so an LCS is **`ONE`**. (`ST` is another common subsequence, but only of length 2.)

### Python implementation

```python
def lcs(x, y):
    """Return (length, one longest common subsequence)."""
    m, n = len(x), len(y)
    L = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if x[i - 1] == y[j - 1]:
                L[i][j] = L[i - 1][j - 1] + 1
            else:
                L[i][j] = max(L[i - 1][j], L[i][j - 1])
    out, i, j = [], m, n                            # trace back from the corner
    while i > 0 and j > 0:
        if x[i - 1] == y[j - 1]:
            out.append(x[i - 1])
            i, j = i - 1, j - 1
        elif L[i - 1][j] >= L[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return L[m][n], "".join(reversed(out))


if __name__ == "__main__":
    print(lcs("STONE", "LONGEST"))       # (3, 'ONE')
    print(lcs("AGGTAB", "GXTXAYB"))      # (4, 'GTAB')
```

### Complexity

| | Time | Space |
| --- | --- | --- |
| brute force (all subsequences of x) | O(2ᵐ · n) | — |
| DP table | **Θ(m · n)** | Θ(m · n) |
| length only, keeping two rows | Θ(m · n) | **Θ(min(m, n))** |

### Common mistakes

- **Confusing subsequence and substring.** The longest common **substring** needs a different recurrence (reset to 0 on a mismatch).
- **Off-by-one with indices.** Row i of the table refers to character x[i − 1] in 0-based code.
- **Expecting a unique LCS.** Several different subsequences can have the maximum length; the trace-back finds one of them.
- **Saving memory and then trying to trace back.** The two-row version gives the length only.

### Problems

1. Fill the LCS table for X = PROGRAM, Y = PARAGRAPH, and find an LCS.
2. **Lab:** a simple `diff`: given two lists of lines, print each line of the LCS with a space, lines only in the first file with `-`, and lines only in the second with `+`.
3. **Lab:** compute the **edit distance** (insertions, deletions, substitutions) between two words with a similar table.
4. Show that the shortest common supersequence of x and y has length |x| + |y| − LCS(x, y).
5. How can LCS find the longest **palindromic** subsequence of a string? (Hint: compare it with its reverse.)
