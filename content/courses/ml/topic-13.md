---
title: "The EM algorithm and k-means"
keywords: "em kmeans"
topic: 13
co: "CO2"
description: "If you knew which cluster each point came from, finding the means would be easy, and vice versa. EM breaks the circle by alternating between the two."
outcomes: ["Describe the E step and the M step", "Estimate the means of k Gaussians with EM", "Explain the link between EM and clustering", "Derive k-means as a special case of EM", "Know that EM can settle at a local optimum"]
reading: ["Textbook 1, §6.12 The EM algorithm", "Textbook 2, Ch. on clustering and mixture models", "Reference book 1, Ch. on clustering"]
---

### Intuition

Imagine a list of heights from a mixed group of two age classes, with the age labels lost. If we knew which class each person was in, finding the two means would be simple averaging. If we knew the two means, we could estimate each person's class. Each question needs the other's answer.

So guess, then alternate. Use the means to guess the memberships. Use the memberships to improve the means. Repeat until nothing changes.

### How it works

**The problem.** Data comes from k Gaussians with unknown means and a known shared variance σ². Each point has a hidden variable, zᵢⱼ, which is 1 if point i came from Gaussian j.

**E step (Expectation).** Using the current means, calculate how responsible each Gaussian is for each point:

```text
E[zᵢⱼ] = exp(−(xᵢ − μⱼ)² / 2σ²) / Σₙ exp(−(xᵢ − μₙ)² / 2σ²)
```

**M step (Maximisation).** Update each mean as a weighted average:

```text
μⱼ = Σᵢ E[zᵢⱼ] · xᵢ / Σᵢ E[zᵢⱼ]
```

**The general statement.** Let X be the observed data, Z the hidden data, and h the parameters. The E step defines Q(h′|h) = E[ln P(X, Z | h′) | h, X]. The M step sets h to whichever h′ maximises Q. Each round never lowers the likelihood, but it can stop at a **local** maximum, so the starting point matters.

**K-means as a special case.** Make the assignment hard instead of soft: each point belongs fully to its nearest mean.

1. **Assign:** each point goes to the nearest mean.
2. **Update:** each mean becomes the average of its points.
3. Repeat until assignments stop changing.

Maximising the likelihood under Gaussian clusters with equal variance is the same as minimising the total squared distance from points to their cluster means, which is what k-means reduces at every step.

| | EM (Gaussians) | K-means |
| --- | --- | --- |
| Membership | Soft, a probability | Hard, 0 or 1 |
| Update | Weighted mean | Plain mean |
| Output | Parameters and probabilities | Clusters |

### Run it: EM and k-means on the same data

No library is needed for this one. The data comes from two Gaussians with means 2 and 8.

```python
import random
from math import exp

random.seed(5)
data = [random.gauss(2, 1) for _ in range(100)] + [random.gauss(8, 1) for _ in range(100)]
sigma = 1.0

def em(mu):
    print("EM")
    for step in range(1, 11):
        totals = [0.0, 0.0]
        weights = [0.0, 0.0]
        for x in data:
            raw = [exp(-(x - m) ** 2 / (2 * sigma ** 2)) for m in mu]   # E step
            z = [r / sum(raw) for r in raw]
            for j in range(2):
                totals[j] += z[j] * x
                weights[j] += z[j]
        mu = [totals[j] / weights[j] for j in range(2)]                 # M step
        if step in (1, 2, 3, 5, 10):
            print(f"  step {step:2}: means = {mu[0]:.3f}, {mu[1]:.3f}")
    return mu

def kmeans(mu):
    print("K-means")
    for step in range(1, 11):
        groups = [[], []]
        for x in data:
            groups[0 if abs(x - mu[0]) < abs(x - mu[1]) else 1].append(x)
        new = [sum(g) / len(g) for g in groups]
        print(f"  step {step:2}: means = {new[0]:.3f}, {new[1]:.3f}")
        if new == mu:
            print("  stable: assignments no longer change")
            break
        mu = new
    return mu

em([0.0, 1.0])
kmeans([0.0, 1.0])
```

**Try this:** move the true means closer, for instance 4 and 6. EM and k-means now give noticeably different answers. Why does soft assignment matter when clusters overlap?

### Common mistakes

- **Expecting the global best.** EM and k-means reach local optima, so try several random starts.
- **Picking k carelessly.** Neither algorithm tells you the right number of clusters.
- **Forgetting to scale features in k-means.** A feature with large units will dominate the distance.

### Problems

1. Points 1, 2, 9 and 10, starting means 1 and 2. Run k-means by hand until it stops.
2. With x = 2, μ₁ = 2, μ₂ = 4 and σ = 1, calculate the E step value for Gaussian 1.
3. Show why the mean minimises the sum of squared distances within a cluster.
4. Change the program to use three Gaussians.
5. Find a starting point for k-means that gives a poor result on the points 1, 2, 9, 10 and 11 with k = 3.
