---
title: "Quicksort"
topic: 21
co: "CO3"
description: "Pick a pivot, put smaller elements to its left and larger ones to its right, and sort the two sides. Fast in practice and in place — but the pivot choice decides between Θ(n log n) and Θ(n²)."
outcomes: ["Trace the Lomuto partition step and state where the pivot ends up", "Analyse quicksort's best, average and worst case with recurrences", "Explain why a random pivot gives expected Θ(n log n) on every input", "Compare quicksort with merge sort"]
reading: ["Textbook 1, Ch. 7 Quicksort", "Textbook 2, §3.5 Quicksort", "Textbook 3, §7.7 Quicksort"]
videos: [{"title": "Coursera: Algorithmic Toolbox (divide and conquer: quicksort)", "url": "https://www.coursera.org/learn/algorithmic-toolbox"}]
---

### Intuition

Choose one element, the **pivot**. Walk through the array and move everything **smaller** than the pivot to the left and everything **larger** to the right; then drop the pivot between the two groups. The pivot is now in its **final sorted position**. Sort the left and right parts the same way. Unlike merge sort, all the work happens **before** the recursive calls, and no extra array is needed.

### How it works

**Lomuto partition** of a[lo..hi] with pivot = a[hi]: keep a boundary i so that a[lo..i] holds elements ≤ pivot; scan j from lo to hi − 1, and whenever a[j] ≤ pivot, grow the boundary and swap a[j] into it. Finally swap the pivot to position i + 1.

**Trace:** partition [10, 80, 30, 90, 40, 50, 70], pivot 70.

| j | a[j] | ≤ 70? | Action | Array |
| --- | --- | --- | --- | --- |
| 0 | 10 | yes | i = 0, swap a[0], a[0] | 10 80 30 90 40 50 70 |
| 1 | 80 | no | — | 10 80 30 90 40 50 70 |
| 2 | 30 | yes | i = 1, swap a[1], a[2] | 10 30 80 90 40 50 70 |
| 3 | 90 | no | — | |
| 4 | 40 | yes | i = 2, swap a[2], a[4] | 10 30 40 90 80 50 70 |
| 5 | 50 | yes | i = 3, swap a[3], a[5] | 10 30 40 50 80 90 70 |
| end | | | swap pivot into a[4] | 10 30 40 50 **70** 90 80 |

The pivot 70 is at index 4 — exactly where it belongs in sorted order. Left part [10 30 40 50], right part [90 80] are sorted recursively.

**Analysis.** Partitioning n elements costs Θ(n) (n − 1 comparisons).

| Case | When | Recurrence | Time |
| --- | --- | --- | --- |
| best | pivot always the median | T(n) = 2T(n/2) + n | Θ(n log n) |
| average / random pivot | any input, expected | — | **Θ(n log n)** (about 1.39 n log₂ n comparisons) |
| worst | pivot always the smallest or largest (e.g. sorted input with last-element pivot) | T(n) = T(n − 1) + n | **Θ(n²)** |

Choosing the pivot **at random** (or median-of-three) makes the worst case extremely unlikely for **every** input.

### Python implementation

```python
import random


def partition(a, lo, hi):
    """Lomuto partition around a[hi]; returns the pivot's final index."""
    pivot, i = a[hi], lo - 1
    for j in range(lo, hi):
        if a[j] <= pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[hi] = a[hi], a[i + 1]
    return i + 1


def quicksort(a, lo=0, hi=None, randomized=True):
    if hi is None:
        hi = len(a) - 1
    if lo < hi:
        if randomized:                                # random pivot: expected O(n log n) on any input
            r = random.randint(lo, hi)
            a[r], a[hi] = a[hi], a[r]
        p = partition(a, lo, hi)
        quicksort(a, lo, p - 1, randomized)
        quicksort(a, p + 1, hi, randomized)
    return a


if __name__ == "__main__":
    a = [10, 80, 30, 90, 40, 50, 70]
    print(partition(a, 0, len(a) - 1), a)      # 4 [10, 30, 40, 50, 70, 90, 80]
    print(quicksort([38, 27, 43, 3, 9, 82, 10]))  # [3, 9, 10, 27, 38, 43, 82]
```

### Complexity

| | Quicksort | Merge sort |
| --- | --- | --- |
| average | Θ(n log n), small constants | Θ(n log n) |
| worst | Θ(n²) (rare with random pivots) | Θ(n log n) |
| extra space | O(log n) stack on average (in place) | Θ(n) |
| stable | no | yes |

In practice quicksort is often the fastest comparison sort for arrays in memory, because it works in place and has excellent cache behaviour.

### Common mistakes

- **Last-element pivot on sorted data** — the classic Θ(n²) trap. Randomise or use median-of-three.
- **Including the pivot in a recursive call** (`quicksort(a, lo, p)`) — on some inputs this never shrinks and recurses forever.
- **Many equal keys.** Lomuto puts all equal keys on one side, which degrades to Θ(n²) on an array of identical values; three-way partitioning fixes this.
- **Deep recursion.** Recurse on the smaller side first (and loop on the larger) to keep the stack O(log n).

### Problems

1. Partition [7, 2, 1, 6, 8, 5, 3, 4] with Lomuto (pivot = last element). Show the array after each swap and the pivot's final index.
2. Count the comparisons quicksort (last-element pivot, no randomisation) makes on [1, 2, 3, 4, 5, 6].
3. **Lab:** implement three-way partitioning (< pivot, = pivot, > pivot) and time it against the two-way version on an array with only 3 distinct values.
4. **Lab:** use partition to find the **k-th smallest** element in expected O(n) time (quickselect).
5. Why is quicksort usually faster than heapsort in practice, though both are Θ(n log n) on average?
