---
title: "Hypothesis space search and inductive bias"
topic: 5
co: "CO1"
description: "Every learner must assume something to generalise. ID3's assumption is a preference for short trees that put high-gain attributes near the root."
outcomes: ["Describe ID3 as a search through a space of trees", "Explain why a learner with no bias cannot generalise", "Distinguish restriction bias from preference bias", "Explain Occam's razor and its limits"]
reading: ["Textbook 1, §3.5 Hypothesis space search in decision tree learning", "Textbook 1, §3.6 Inductive bias in decision tree learning"]
---

### Intuition

Say your training data has only three examples. Infinitely many rules fit them exactly. Which one should you trust on a new case? The data cannot tell you. Something beyond the data must decide. That something is the learner's **inductive bias**.

Bias here is not a flaw. Without it, a learner could do nothing but memorise.

### How it works

**ID3 as search.** Think of the space of all possible decision trees. ID3 starts with an empty tree, and at each step adds one test, guided by information gain. It is hill climbing.

| Property | What it means |
| --- | --- |
| Complete hypothesis space | Any finite discrete function can be written as some tree, so the true target is in the space |
| One current hypothesis | It keeps a single tree, and cannot tell you how many other trees also fit |
| No backtracking | It can settle on a local optimum |
| Uses all examples at each step | It is robust to some errors, because decisions are statistical |

**Inductive bias of ID3.** It prefers:

1. shorter trees over longer ones, and
2. trees that place high-gain attributes close to the root.

**Two kinds of bias:**

| | Restriction (language) bias | Preference (search) bias |
| --- | --- | --- |
| Meaning | Some hypotheses cannot be expressed at all | All are available, but some are tried first |
| Example | A linear model cannot express XOR | ID3 prefers short trees |
| Risk | The target might be excluded | Can miss the target, but the space still contains it |

ID3 has a preference bias. Preference bias is usually safer, because the true target is never ruled out.

**Why prefer short hypotheses?** This is **Occam's razor**: prefer the simplest hypothesis that fits the data. An informal argument goes: there are far fewer short trees than long ones, so a short tree that happens to fit the data is unlikely to be a coincidence. A long tree that fits may just be fitting noise.

The argument has limits. "Short" depends on how the hypothesis is written, and one could pick other small sets of hypotheses with equal logic. Topic 10 returns to this with the minimum description length principle.

### Run it: many trees fit the same data

This program counts how many Boolean functions of 3 attributes agree with a few training examples. It shows the problem: with no bias, the data leaves the answer on unseen cases wide open.

```python
from itertools import product

inputs = list(product([0, 1], repeat=3))         # 8 possible examples
print("Possible inputs:", len(inputs))
print("Possible functions:", 2 ** len(inputs))

training = {(0, 0, 0): 0, (0, 1, 1): 1, (1, 0, 1): 1, (1, 1, 1): 1}

consistent = []
for outputs in product([0, 1], repeat=len(inputs)):
    f = dict(zip(inputs, outputs))
    if all(f[x] == y for x, y in training.items()):
        consistent.append(f)

print("Consistent with", len(training), "training examples:", len(consistent))

for x in inputs:
    if x not in training:
        ones = sum(f[x] for f in consistent)
        print(f"Unseen {x}: {ones} functions say 1, {len(consistent) - ones} say 0")
```

Half the consistent functions say 1 and half say 0 on every unseen input. With no bias, the training data gives no reason to prefer either answer. This is why a learner needs a bias at all.

### Common mistakes

- **Treating "bias" as prejudice or a bug.** Here it means the assumptions that make generalising possible.
- **Saying ID3 finds the shortest tree.** It only tends towards short trees. Finding the shortest is far too expensive.
- **Treating Occam's razor as a law.** It is a useful preference, not a proof.

### Problems

1. Is the bias of a linear classifier a restriction bias or a preference bias? Explain.
2. How many Boolean functions exist of 4 Boolean attributes?
3. In the program, remove one training example. How many functions are now consistent? Explain the pattern.
4. Name one advantage and one drawback of keeping only one hypothesis during the search.
5. Give an everyday example of Occam's razor in action, and one case where it would mislead you.
