---
title: "Knuth–Morris–Pratt string matching"
keywords: "kmp"
topic: 9
co: "CO1"
description: "Find a pattern in a text without ever moving backwards in the text: a precomputed failure table tells the algorithm how far it can slide the pattern after a mismatch, giving O(n + m) time."
outcomes: ["Compute the prefix (failure) function of a pattern by hand and in code", "Trace KMP on a text, showing every shift after a mismatch", "Explain why KMP never re-reads a text character and runs in O(n + m)", "Compare KMP with the naive O(n·m) algorithm"]
reading: ["Textbook 1, §32.4 The Knuth-Morris-Pratt algorithm", "Reference book 2, §13.2.3 The Knuth-Morris-Pratt algorithm", "Textbook 5, Ch. on string matching"]
videos: [{"title": "NPTEL: Data Structures and Algorithms, IIT Delhi (string matching)", "url": "https://archive.nptel.ac.in/courses/106/102/106102064/"}]
---

### Intuition

The naive method slides the pattern P one position at a time and compares from scratch — up to O(n·m) work. But after a partial match we **already know** what the last few text characters were: they are the pattern's own prefix. KMP uses that knowledge.

Suppose P = `ababaca` and we have matched `ababa` before a mismatch. The longest proper prefix of `ababa` that is also a suffix of it is `aba`. So we can slide P forward so that its first `aba` lines up with the `aba` we just read — no need to compare those three characters again, and **the text pointer never moves back**.

### How it works

**The prefix function** π (also called the failure function):

> π[q] = length of the longest **proper** prefix of P[0..q] that is also a suffix of P[0..q].

For P = `ababaca`:

| q | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P[q] | a | b | a | b | a | c | a |
| π[q] | 0 | 0 | 1 | 2 | 3 | 0 | 1 |

Read π[4] = 3 as: "`ababa` ends with `aba`, which is also how it starts".

**Matching.** Keep q = number of pattern characters currently matched. For each text character c:

1. While q > 0 and P[q] ≠ c, fall back: **q ← π[q − 1]**.
2. If P[q] = c, increase q.
3. If q = m, report a match at position i − m + 1, then set q ← π[q − 1] to look for overlapping matches.

**Trace:** T = `bacbabababacaab`, looking for P = `ababaca` (indices from 0):

| Text index | Char | q before | Action | q after |
| --- | --- | --- | --- | --- |
| 4–8 | a b a b a | 0→5 | five matches in a row | 5 |
| 9 | b | 5 | P[5] = c ≠ b → q = π[4] = 3; P[3] = b = b → match | 4 |
| 10 | a | 4 | P[4] = a → match | 5 |
| 11 | c | 5 | P[5] = c → match | 6 |
| 12 | a | 6 | P[6] = a → match → **found at 6** | 7 = m |

After the mismatch at index 9, KMP did not restart; it reused the `aba` it had already seen.

### Python implementation

```python
def prefix_function(p):
    pi = [0] * len(p)
    k = 0                                    # length of the current border
    for q in range(1, len(p)):
        while k > 0 and p[k] != p[q]:
            k = pi[k - 1]                    # fall back to a shorter border
        if p[k] == p[q]:
            k += 1
        pi[q] = k
    return pi


def kmp_search(text, p):
    """Start positions of every occurrence of p in text."""
    pi, q, found = prefix_function(p), 0, []
    for i, c in enumerate(text):
        while q > 0 and p[q] != c:
            q = pi[q - 1]
        if p[q] == c:
            q += 1
        if q == len(p):
            found.append(i - len(p) + 1)
            q = pi[q - 1]                    # allow overlapping matches
    return found


if __name__ == "__main__":
    print(prefix_function("ababaca"))                 # [0, 0, 1, 2, 3, 0, 1]
    print(kmp_search("bacbabababacaab", "ababaca"))   # [6]
    print(kmp_search("aaaaa", "aa"))                  # [0, 1, 2, 3]
```

### Complexity

| Phase | Time | Why |
| --- | --- | --- |
| prefix function | O(m) | k increases at most m times in total, and each fall-back decreases it |
| matching | O(n) | the text index only moves forward; q's total decrease ≤ total increase ≤ n |
| total | **O(n + m)** | compared with O(n·m) for the naive method |

Extra space is O(m) for the π array.

### Common mistakes

- **Using the whole string as its own border.** π uses *proper* prefixes: π[q] < q + 1, so π[0] = 0 always.
- **Falling back only once.** The fall-back is a `while` loop — you may need several steps (π[π[q−1]−1] …).
- **Forgetting overlapping matches.** After a full match, continue from q = π[m−1], not from 0.
- **Off-by-one between π[q] and π[q−1].** On a mismatch with q characters matched, fall back to **π[q − 1]**.

### Problems

1. Compute the prefix function of `aabaaab`, `abcabcab` and `aaaa`.
2. Trace KMP for P = `abab` in T = `abababab`. List every match and every fall-back.
3. **Lab:** use the prefix function to find the **shortest period** of a string s (the smallest p such that s is a prefix of the infinite repetition of s[0..p−1]). (Hint: n − π[n−1].)
4. **Lab:** count how many times each prefix of a string occurs in the string, using π.
5. Show a text and pattern on which the naive algorithm does Θ(n·m) comparisons but KMP does O(n + m).
