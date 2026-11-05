---
title: "Bayes and concept learning: MAP and ML hypotheses"
keywords: "map"
topic: 8
co: "CO2"
description: "Applying Bayes theorem to every hypothesis gives a simple learner, too slow to use but useful for thinking. It shows what MAP and maximum likelihood choices really mean."
outcomes: ["Describe the brute-force Bayes concept learner", "Define MAP and ML hypotheses and compare them", "Calculate the MAP hypothesis from priors and likelihoods", "Explain why every consistent learner outputs a MAP hypothesis under certain assumptions"]
reading: ["Textbook 1, §6.2 Bayes theorem (MAP and ML)", "Textbook 1, §6.3 Bayes theorem and concept learning"]
---

### Intuition

If we knew how to calculate the posterior of each hypothesis, a learning algorithm would be simple: calculate them all and choose the highest. That is rarely practical, but it gives a yardstick for judging real algorithms.

### How it works

**MAP (maximum a posteriori)** is the most probable hypothesis given the data. P(D) is the same for every hypothesis, so it can be dropped:

```text
h_MAP = argmax P(h|D) = argmax P(D|h) · P(h)
```

**ML (maximum likelihood)** ignores the prior. It is the same as MAP when all priors are equal:

```text
h_ML = argmax P(D|h)
```

**Example.** Three hypotheses explain an observation:

| h | P(h) | P(D\|h) | P(D\|h)·P(h) |
| --- | --- | --- | --- |
| h1 | 0.7 | 0.1 | 0.07 |
| h2 | 0.2 | 0.5 | 0.10 |
| h3 | 0.1 | 0.8 | 0.08 |

h_ML is **h3**, which has the highest likelihood. h_MAP is **h2**, which has the highest product. They can disagree, and more data will usually make the likelihood dominate the prior.

**The brute-force MAP learner:**

1. For each hypothesis h, calculate P(h|D).
2. Output the h with the highest posterior.

**What it tells us.** Assume noise-free data, a target that is in H, and equal priors, so P(h) = 1/|H|. The likelihood is then:

- P(D|h) = 1 if h is consistent with D;
- P(D|h) = 0 otherwise.

So:

```text
P(h|D) = 1 / |VS|     if h is consistent with D
P(h|D) = 0            otherwise
```

Here VS is the **version space**, the set of hypotheses consistent with the data.

Every consistent hypothesis is a MAP hypothesis. So any learner that outputs a consistent hypothesis acts as a MAP learner under these assumptions, even if it never calculates a probability. That gives a Bayesian way to understand algorithms that look non-probabilistic.

### Run it: brute-force MAP learning

The hypotheses are rules of the form "score ≥ t". As examples arrive, inconsistent hypotheses fall to zero, and the rest share the probability equally.

```python
from fractions import Fraction

hypotheses = list(range(0, 11))             # t = 0, 1, ..., 10, rule: score >= t
posterior = {t: Fraction(1, len(hypotheses)) for t in hypotheses}

def update(score, label):
    """Noise-free Bayes update: P(D|h) is 1 if consistent, 0 otherwise."""
    for t in hypotheses:
        likelihood = 1 if (score >= t) == label else 0
        posterior[t] *= likelihood
    total = sum(posterior.values())
    for t in hypotheses:
        posterior[t] /= total

for score, label in [(8, True), (2, False), (6, True), (4, False)]:
    update(score, label)
    alive = [t for t in hypotheses if posterior[t] > 0]
    print(f"Saw score {score} -> {label!s:5}  version space {alive}, each P = {posterior[alive[0]]}")

print("\nMAP versus ML from the table")
table = {"h1": (0.7, 0.1), "h2": (0.2, 0.5), "h3": (0.1, 0.8)}
print("ML :", max(table, key=lambda h: table[h][1]))
print("MAP:", max(table, key=lambda h: table[h][0] * table[h][1]))
```

**Try this:** give the threshold hypotheses unequal priors, favouring small t. Does the version space change? Does the MAP choice?

### Common mistakes

- **Thinking MAP and ML always agree.** They agree only when priors are equal, or when the data overwhelms the prior.
- **Believing brute force is practical.** The hypothesis space is usually far too large to enumerate.
- **Forgetting the assumptions.** The result about consistent learners needs noise-free data and equal priors.

### Problems

1. With P(h1)=0.6, P(h2)=0.4, P(D|h1)=0.2 and P(D|h2)=0.5, find h_MAP and h_ML.
2. A version space contains 8 hypotheses, from equal priors with noise-free data. What is P(h|D) for each one?
3. Why can P(D) be left out when finding h_MAP?
4. In the program, what happens if an example is mislabelled so that no hypothesis is consistent?
5. Compute all three posteriors for the table above, and check they add to 1.
