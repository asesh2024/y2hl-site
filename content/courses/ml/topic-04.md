---
title: "The ID3 algorithm"
keywords: "id3"
topic: 4
co: "CO1"
description: "ID3 builds a tree from the top down: pick the attribute with the highest gain, split, and repeat on each branch until the groups are pure."
outcomes: ["Write the ID3 algorithm from memory", "Trace ID3 on a small dataset by hand", "Implement ID3 from scratch in Python", "Use a learned tree to classify a new example"]
reading: ["Textbook 1, §3.4 The basic decision tree learning algorithm", "Textbook 2, Ch. on decision trees"]
---

### Intuition

ID3 is a greedy recursive idea. Find the best question for the whole group. Split. Each smaller group is now the same problem, so do it again. Stop when a group is pure or no questions are left.

It never goes back to change an earlier question.

### How it works

```text
ID3(Examples, Target, Attributes):
  if all Examples have the same label: return a leaf with that label
  if Attributes is empty:              return a leaf with the most common label
  A ← the attribute in Attributes with the highest gain on Examples
  make a node that tests A
  for each value v of A:
      Sv ← Examples where A = v
      if Sv is empty: add a leaf with the most common label in Examples
      else: add the subtree ID3(Sv, Target, Attributes − {A})
  return the node
```

**Trace on the 14-day data from topic 3.** At the root, Outlook has the highest gain (0.247).

- **Overcast** (4 days, all Yes): becomes a leaf, Yes.
- **Sunny** (5 days: 2 Yes, 3 No, entropy 0.971):

| Attribute | Gain on the Sunny days |
| --- | --- |
| **Humidity** | **0.971** |
| Temp | 0.571 |
| Wind | 0.020 |

Humidity gives a perfect split: High is all No, and Normal is all Yes.

- **Rain** (5 days: 3 Yes, 2 No, entropy 0.971):

| Attribute | Gain on the Rain days |
| --- | --- |
| **Wind** | **0.971** |
| Temp | 0.020 |
| Humidity | 0.020 |

Wind gives a perfect split: Weak is all Yes, and Strong is all No.

The result is the tree drawn in topic 3. Temperature is never used, which shows that ID3 also selects features.

### Run it: ID3 from scratch

This is the whole algorithm in plain Python. It prints the tree and classifies a new day.

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
    counts = Counter(r[-1] for r in rows)
    return -sum(c / len(rows) * log2(c / len(rows)) for c in counts.values())

def gain(rows, col):
    total = entropy(rows)
    for value in set(r[col] for r in rows):
        part = [r for r in rows if r[col] == value]
        total -= len(part) / len(rows) * entropy(part)
    return total

def id3(rows, attributes):
    labels = [r[-1] for r in rows]
    if len(set(labels)) == 1:
        return labels[0]
    if not attributes:
        return Counter(labels).most_common(1)[0][0]
    best = max(attributes, key=lambda a: gain(rows, a))
    rest = [a for a in attributes if a != best]
    branches = {}
    for value in sorted(set(r[best] for r in rows)):
        branches[value] = id3([r for r in rows if r[best] == value], rest)
    return (best, branches)

def show(tree, indent=""):
    if isinstance(tree, str):
        print(indent + "=> " + tree)
        return
    col, branches = tree
    for value, sub in branches.items():
        print(f"{indent}{COLUMNS[col]} = {value}")
        show(sub, indent + "    ")

def classify(tree, example):
    while not isinstance(tree, str):
        col, branches = tree
        tree = branches[example[col]]
    return tree

tree = id3(DATA, list(range(len(COLUMNS))))
show(tree)
day = ("Sunny", "Cool", "Normal", "Strong")
print("\nNew day", day, "->", classify(tree, day))
```

**Try this:** add a contradictory row such as `("Overcast", "Hot", "High", "Weak", "No")` and run it again. See how one noisy example changes the tree.

### Common mistakes

- **Reusing an attribute on the same path.** A discrete attribute cannot help twice, because every example on the branch already has the same value.
- **Skipping the empty-branch case.** The full algorithm needs the most-common-label fallback. Our short program branches only on values it has seen, so `classify` would raise a `KeyError` for a new value.
- **Expecting the best possible tree.** ID3 is greedy and finds a good tree, not necessarily the smallest.

### Problems

1. Trace ID3 by hand on the Rain days and confirm the table above.
2. Change `classify` so that an unseen value returns the most common label instead of raising an error.
3. Add a "Day number" attribute to the data. What does ID3 pick at the root, and why is that a disaster?
4. Print the number of nodes in the learned tree.
5. Make up a 6-row dataset of your own for "Should I carry an umbrella?". Run ID3 on it and read off the rules.
