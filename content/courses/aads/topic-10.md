---
title: "Boyer–Moore string matching"
topic: 10
co: "CO1"
description: "Compare the pattern from right to left, and use what the mismatch reveals to jump the pattern forward by many positions at once. On ordinary text Boyer–Moore often reads only a fraction of the characters."
outcomes: ["Build the bad-character table and apply the bad-character rule", "Explain the good-suffix rule and combine the two shifts", "Trace Boyer–Moore on a text and count the alignments tried", "Compare Boyer–Moore with KMP: worst case, typical case and when each wins"]
reading: ["Reference book 2, §13.2.2 The Boyer-Moore algorithm", "Textbook 1, Ch. 32 String matching (and its problems)", "Textbook 5, Ch. on string matching"]
videos: [{"title": "NPTEL: Data Structures and Algorithms, IIT Delhi (string matching)", "url": "https://archive.nptel.ac.in/courses/106/102/106102064/"}]
---

### Intuition

Look for `NEEDLE` in a long text. Line the pattern up and compare its **last** letter first. If the text has a `Z` there — a letter that does not appear in `NEEDLE` at all — then no alignment covering that `Z` can match, so the pattern can jump **6 positions** at once. KMP never skips text; Boyer–Moore skips a lot, which is why `grep` and text editors use it.

### How it works

Align P with the text and compare **right to left**. On a mismatch at pattern position j (text character c), shift by the larger of two suggestions:

**1. Bad-character rule.** Let last[c] be the rightmost index of c in P (−1 if c is not in P). Shift so that this occurrence lines up with the mismatched text character:

> shift = max(1, j − last[c])

**2. Good-suffix rule.** The part already matched, t = P[j+1..m−1], is a "good suffix". Shift to the next place where t (or the longest prefix of P that is a suffix of t) appears in P again. This is what saves Boyer–Moore on repetitive patterns.

On a full match, shift by the pattern's period (good-suffix of the whole pattern).

**Bad-character table for P = `EXAMPLE`:**

| c | E | X | A | M | P | L | any other |
| --- | --- | --- | --- | --- | --- | --- | --- |
| last[c] | 6 | 1 | 2 | 3 | 4 | 5 | −1 |

**Trace:** T = `HERE IS A SIMPLE EXAMPLE`, P = `EXAMPLE` (m = 7).

| Alignment at | Compare | Mismatch | Bad-char shift |
| --- | --- | --- | --- |
| 0 | T[6] = `S` vs E | j = 6, `S` not in P | 6 − (−1) = **7** |
| 7 | T[13] = `P` vs E | j = 6, last[P] = 4 | 6 − 4 = **2** |
| 9 | `MPLE` matches (T[12..15]), then T[11] = `I` vs A | j = 2, `I` not in P | 2 − (−1) = 3, but the good suffix gives 6 → **6** |
| 15 | T[21] = `P` vs E | j = 6, last[P] = 4 | **2** |
| 17 | all 7 match → **found at 17** | | |

Only 5 alignments for a 24-character text; the naive method would try 18.

### Python implementation

```python
def bad_char_table(p):
    return {c: i for i, c in enumerate(p)}             # rightmost index of each character


def good_suffix_table(p):
    """shift[j] = how far to slide when the mismatch happens at j-1 (shift[0] = full-match shift)."""
    m = len(p)
    shift, border = [0] * (m + 1), [0] * (m + 1)
    i, j = m, m + 1
    border[i] = j
    while i > 0:                                       # case 1: the matched suffix occurs again in p
        while j <= m and p[i - 1] != p[j - 1]:
            if shift[j] == 0:
                shift[j] = j - i
            j = border[j]
        i, j = i - 1, j - 1
        border[i] = j
    j = border[0]
    for i in range(m + 1):                             # case 2: only a prefix of p matches the suffix
        if shift[i] == 0:
            shift[i] = j
        if i == j:
            j = border[j]
    return shift


def boyer_moore(text, p):
    n, m = len(text), len(p)
    last, good = bad_char_table(p), good_suffix_table(p)
    found, s = [], 0                                   # s = current alignment
    while s <= n - m:
        j = m - 1
        while j >= 0 and p[j] == text[s + j]:
            j -= 1                                     # compare right to left
        if j < 0:
            found.append(s)
            s += good[0]
        else:
            s += max(good[j + 1], j - last.get(text[s + j], -1))
    return found


if __name__ == "__main__":
    print(bad_char_table("EXAMPLE"))                          # {'E': 6, 'X': 1, 'A': 2, 'M': 3, 'P': 4, 'L': 5}
    print(boyer_moore("HERE IS A SIMPLE EXAMPLE", "EXAMPLE"))  # [17]
    print(boyer_moore("abababab", "abab"))                    # [0, 2, 4]
```

### Complexity

| | Boyer–Moore | KMP |
| --- | --- | --- |
| preprocessing | O(m + |Σ|) | O(m) |
| best / typical | **O(n/m)** alignments — sub-linear | Θ(n) |
| worst case | O(n·m) with bad-character only; O(n + m) with good-suffix and the Galil rule | O(n + m) |
| reads text | right to left within each alignment, jumping ahead | strictly left to right |

Boyer–Moore gets **faster as the pattern gets longer** (bigger jumps) and when the alphabet is large (mismatched characters are often absent from P). KMP suits streams and tiny alphabets such as DNA.

### Common mistakes

- **Comparing left to right.** The rules assume right-to-left comparison within an alignment.
- **Negative bad-character shifts.** If c's last occurrence is to the right of j, j − last[c] is negative: always shift at least 1 (or use the good-suffix shift).
- **Using only the bad-character rule and expecting linear time.** On `aaaa…` with pattern `baaa` it degrades to O(n·m).
- **Forgetting to take the maximum** of the two rules — each rule alone is safe, so the larger shift is safe too.

### Problems

1. Build the bad-character table for `ABCDABD` and trace Boyer–Moore (bad-character rule only) on `ABC ABCDAB ABCDABCDABDE`.
2. Count the alignments tried when searching `GCAGAGAG` in `GCATCGCAGAGAGTATACAGTACG` using both rules.
3. **Lab:** implement **Horspool's** simplification (always shift by the bad-character value of the text character under the pattern's **last** position) and compare its speed with KMP on English text.
4. Give a text and pattern for which Boyer–Moore with only the bad-character rule takes Θ(n·m) time.
5. Explain why Boyer–Moore is usually faster than KMP for searching a word in an English document.
