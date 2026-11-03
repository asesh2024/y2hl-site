---
title: "Greedy method: coin change and activity selection"
topic: 23
co: "CO3"
description: "Make the choice that looks best right now and never look back. Sometimes that is provably optimal (activity selection); sometimes it fails (coin change with unusual coins) — knowing which is the skill."
outcomes: ["Describe the greedy method and its two requirements: the greedy-choice property and optimal substructure", "Solve activity selection by earliest finish time, and prove it optimal", "Apply greedy coin change and show a coin system where it fails", "Decide when a greedy algorithm is safe, and when dynamic programming is needed"]
reading: ["Textbook 1, §16.1–16.2 An activity-selection problem; elements of the greedy strategy", "Textbook 2, Ch. 4 The greedy method", "Textbook 5, Ch. on greedy algorithms"]
videos: [{"title": "Coursera: Algorithmic Toolbox (greedy algorithms week)", "url": "https://www.coursera.org/learn/algorithmic-toolbox"}]
---

### Intuition

A **greedy algorithm** builds a solution step by step, each time taking the locally best option, and never undoes a choice. It is simple and fast — but it is only correct when two things hold:

1. **Greedy-choice property:** some optimal solution starts with the greedy choice.
2. **Optimal substructure:** after that choice, what remains is a smaller instance of the same problem.

### How it works

**Activity selection.** One lecture hall, many requested talks (start, finish). Choose the **largest number** of non-overlapping talks.

Greedy rule: **always pick the talk that finishes earliest**, then repeat on the talks that start after it finishes.

| Talk | a1 | a2 | a3 | a4 | a5 | a6 | a7 | a8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| start | 1 | 3 | 0 | 5 | 3 | 5 | 6 | 8 |
| finish | 4 | 5 | 6 | 7 | 9 | 9 | 10 | 11 |

Sorted by finish: a1 (1–4) ✓ → next start ≥ 4: a4 (5–7) ✓ → next start ≥ 7: a8 (8–11) ✓. **Three talks**: a1, a4, a8.

*Why earliest finish is safe:* swap the first talk of any optimal schedule for the earliest-finishing talk — it finishes no later, so it cannot clash with the rest. The schedule stays valid and the same size.

(Other "obvious" rules fail: shortest talk first, or earliest start first, can both give fewer talks.)

**Coin change.** Pay an amount with the fewest coins. Greedy: take the largest coin that fits, repeat.

| Coin system | Amount | Greedy | Optimal |
| --- | --- | --- | --- |
| ₹ {1, 2, 5, 10, 20, 50} | 93 | 50 + 20 + 20 + 2 + 1 = **5 coins** | 5 coins ✓ |
| {1, 3, 4} | 6 | 4 + 1 + 1 = **3 coins** | 3 + 3 = **2 coins** ✗ |

Greedy is optimal for "canonical" systems like Indian rupees, but **not** for every system. When it fails, use dynamic programming (topic 25 onward).

### Python implementation

```python
def activity_selection(talks):
    """talks: list of (name, start, finish). Maximum set of non-overlapping talks."""
    chosen, last_finish = [], float("-inf")
    for name, start, finish in sorted(talks, key=lambda t: t[2]):   # earliest finish first
        if start >= last_finish:
            chosen.append(name)
            last_finish = finish
    return chosen


def greedy_coins(coins, amount):
    used = []
    for c in sorted(coins, reverse=True):
        while amount >= c:
            amount -= c
            used.append(c)
    return used if amount == 0 else None


def min_coins_dp(coins, amount):
    """Exact answer for comparison: fewest coins by dynamic programming."""
    best = [0] + [float("inf")] * amount
    for x in range(1, amount + 1):
        best[x] = min((best[x - c] + 1 for c in coins if c <= x), default=float("inf"))
    return best[amount]


if __name__ == "__main__":
    talks = [("a1", 1, 4), ("a2", 3, 5), ("a3", 0, 6), ("a4", 5, 7),
             ("a5", 3, 9), ("a6", 5, 9), ("a7", 6, 10), ("a8", 8, 11)]
    print(activity_selection(talks))                         # ['a1', 'a4', 'a8']
    print(greedy_coins([1, 2, 5, 10, 20, 50], 93))           # [50, 20, 20, 2, 1]
    print(greedy_coins([1, 3, 4], 6), min_coins_dp([1, 3, 4], 6))   # [4, 1, 1] 2
```

### Complexity

| Problem | Time |
| --- | --- |
| activity selection | O(n log n) for sorting, then O(n) |
| greedy coin change | O(k + number of coins used) after sorting the k denominations |
| exact coin change (DP) | O(k · amount) |

### Common mistakes

- **Sorting activities by start time or by length.** Only earliest **finish** time is safe.
- **Assuming greedy coin change always works.** Test the coin system — {1, 3, 4} or {1, 10, 25} with amount 30 break it.
- **Using `>` instead of `>=`** for compatibility: a talk may start exactly when the previous one ends.
- **No proof.** A greedy algorithm without an exchange argument is just a guess.

### Problems

1. Talks (start, finish): (1, 2), (3, 4), (0, 6), (5, 7), (8, 9), (5, 9). Select the maximum number of talks. Show that "shortest first" also works here, then find an input where it fails.
2. With coins {1, 10, 25}, compute greedy and optimal for amount 30. What is the smallest amount where greedy fails for {1, 3, 4}?
3. **Lab:** fractional knapsack — items have weight and value, and you may take fractions. Show that taking items in decreasing value/weight order is optimal.
4. **Lab:** minimum number of platforms needed at a station, given arrival and departure times of trains.
5. Prove the greedy-choice property for activity selection with an exchange argument.
