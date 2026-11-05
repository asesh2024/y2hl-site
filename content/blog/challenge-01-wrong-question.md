---
title: "Weekly challenge 1: why does this decision tree ask the wrong question?"
series: "weekly-challenge"
date: "2026-11-05"
description: "A tiny bug makes this program choose the wrong attribute, and it raises no error. Run it, find the bug, and fix it right here on the page."
---

Should we play outside today? A decision tree answers by asking one question at a time, and it should start with the most useful question. This program is meant to pick that question from 14 days of weather records.

It runs without any error. **It also gives the wrong answer.** The right first question is about `Outlook`, but it chooses something else.

### The challenge

Press **Run** to see the mistake. Then press **Edit**, find the one line that's wrong, fix it, and press **Run** again. You've solved it when the program prints `Best question: Outlook`.

```python
from math import log2
from collections import Counter

COLUMNS = ["Outlook", "Temp", "Humidity", "Wind"]
DATA = [
    ("Sunny", "Hot", "High", "Weak", "No"), ("Sunny", "Hot", "High", "Strong", "No"),
    ("Overcast", "Hot", "High", "Weak", "Yes"), ("Rain", "Mild", "High", "Weak", "Yes"),
    ("Rain", "Cool", "Normal", "Weak", "Yes"), ("Rain", "Cool", "Normal", "Strong", "No"),
    ("Overcast", "Cool", "Normal", "Strong", "Yes"), ("Sunny", "Mild", "High", "Weak", "No"),
    ("Sunny", "Cool", "Normal", "Weak", "Yes"), ("Rain", "Mild", "Normal", "Weak", "Yes"),
    ("Sunny", "Mild", "Normal", "Strong", "Yes"), ("Overcast", "Mild", "High", "Strong", "Yes"),
    ("Overcast", "Hot", "Normal", "Weak", "Yes"), ("Rain", "Mild", "High", "Strong", "No"),
]

def entropy(rows):
    """How mixed the Yes and No answers are: 0 means all the same, 1 means an even split."""
    counts = Counter(r[-1] for r in rows)
    return -sum(c / len(rows) * log2(c / len(rows)) for c in counts.values())

def gain(rows, col):
    """How much a question reduces the mix."""
    total = entropy(rows)
    for value in set(r[col] for r in rows):
        part = [r for r in rows if r[col] == value]
        total -= entropy(part)
    return total

scores = {name: gain(DATA, i) for i, name in enumerate(COLUMNS)}
for name, score in scores.items():
    print(f"{name:9} {score:7.3f}")
print("Best question:", max(scores, key=scores.get))
```

### Stuck? Try these hints

<details markdown="1">
<summary>Hint 1</summary>

Look at the scores. They're all negative. Can asking a question make the answers *more* mixed, on average?

</details>

<details markdown="1">
<summary>Hint 2</summary>

Each answer to a question leads to a group of days. Should a group of 2 days count for as much as a group of 8?

</details>

### Solution

Try it yourself before you open this.

<details markdown="1">
<summary>Show the solution</summary>

The bug is in `gain`. Each group's entropy must be weighted by the share of days in that group:

```py
total -= len(part) / len(rows) * entropy(part)
```

Without that weight, a question is punished for simply having more possible answers, whatever their sizes. With it, the scores become:

| Question | Gain |
| --- | --- |
| **Outlook** | **0.247** |
| Humidity | 0.152 |
| Wind | 0.048 |
| Temp | 0.029 |

</details>

### Why this matters

Nothing crashed here, and the program printed a neat answer. Many of the hardest bugs in machine learning look just like this, so it pays to check whether results make sense. A negative gain was the clue.

**Want to go further?** Read the whole idea step by step in [Topic 3 of Machine Learning Fundamentals](/courses/ml/topic-03.html), and then build the full tree in [Topic 4](/courses/ml/topic-04.html).
