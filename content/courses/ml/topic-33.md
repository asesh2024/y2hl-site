---
title: "K-nearest neighbours"
keywords: "knn"
topic: 33
co: "CO5"
description: "To classify something new, look at the most similar examples you have seen and take a vote. There is no training, just remembering, and the choice of k and scale matters."
outcomes: ["Explain the k-nearest neighbour algorithm", "Classify a point by hand", "Choose k using cross-validation", "Show why feature scaling matters", "Describe the curse of dimensionality"]
reading: ["Textbook 1, §8.2 k-Nearest neighbor learning", "Textbook 2, Ch. on nearest neighbour methods"]
---

### Intuition

"You are the average of your five closest friends." KNN uses this idea directly. A new point takes the most common label among its k closest training points. It has no training step and builds no model, which is why it is called **lazy** or **instance-based** learning.

### How it works

```text
to classify x:
    compute the distance from x to every training example
    take the k nearest
    return the majority label (or, for regression, the average)
```

**Euclidean distance:**

```text
d(a, b) = √ Σ (aᵢ − bᵢ)²
```

**A worked example.** Query (3, 3):

| Point | Label | Distance |
| --- | --- | --- |
| (1, 1) | A | √8 = 2.83 |
| (2, 3) | A | 1.00 |
| (4, 3) | B | 1.00 |
| (5, 5) | B | √8 = 2.83 |
| (4, 4) | B | √2 = 1.41 |

For k = 1 it is a tie (A and B at 1.00). For k = 3, the nearest are (2,3) A, (4,3) B and (4,4) B, so the answer is **B**.

**Choosing k.** A small k fits noise, because one strange neighbour decides. A large k blurs the boundary. Use cross-validation, and for two classes choose an odd k to avoid ties.

**Weighted KNN.** Closer neighbours count for more, usually with weight 1/d².

**Scaling is essential.** In a distance, a feature ranging up to 100,000 swamps one ranging up to 1.

**The curse of dimensionality.** With many features, nearly all points are about equally far away, so "nearest" means little. Irrelevant features make it worse.

| Good | Bad |
| --- | --- |
| No training time | Slow prediction on big data |
| Handles complicated boundaries | Must store all the data |
| Simple to understand | Sensitive to scale and irrelevant features |

### Run it: KNN from scratch, then finding k

```python
import numpy as np
from collections import Counter
from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

def knn(train_X, train_y, x, k):
    distances = np.sqrt(((train_X - x) ** 2).sum(axis=1))
    nearest = np.argsort(distances)[:k]
    return Counter(train_y[nearest]).most_common(1)[0][0]

points = np.array([[1, 1], [2, 3], [4, 3], [5, 5], [4, 4]], dtype=float)
labels = np.array(["A", "A", "B", "B", "B"])
print("Query (3, 3) with k = 3:", knn(points, labels, np.array([3.0, 3.0]), 3))

X, y = load_wine(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

print("\nWhy scaling matters (k = 5)")
raw = KNeighborsClassifier(5).fit(X_train, y_train).score(X_test, y_test)
scaled = make_pipeline(StandardScaler(), KNeighborsClassifier(5)).fit(X_train, y_train).score(X_test, y_test)
print(f"Raw features:    {raw:.3f}")
print(f"Scaled features: {scaled:.3f}")

print("\nChoosing k by cross-validation on the training data")
best_k, best = 1, 0
for k in [1, 3, 5, 7, 9, 15, 25, 51]:
    score = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(k)), X_train, y_train, cv=5).mean()
    print(f"k = {k:2}: {score:.3f}")
    if score > best:
        best_k, best = k, score

final = make_pipeline(StandardScaler(), KNeighborsClassifier(best_k)).fit(X_train, y_train)
print(f"\nBest k = {best_k}. Test accuracy = {final.score(X_test, y_test):.3f}")
```

**Try this:** add 50 random noise columns to `X` using `np.hstack`, and run it again. Watch the curse of dimensionality and irrelevant features at work.

### Common mistakes

- **Forgetting to scale.** The program shows the cost.
- **Choosing k by test accuracy.** Choose by cross-validation on training data.
- **Using KNN on huge datasets without an index.** Every prediction compares with everything, unless you use a KD-tree or similar.

### Problems

1. Using the table above, classify the query (2, 2) with k = 3.
2. Calculate the distance between (1, 2, 3) and (4, 6, 3).
3. Implement weighted voting with weight 1/d².
4. Why does k = 1 always give 100% on the training data, if the points are distinct?
5. Change the program to a regression, using `KNeighborsRegressor` on `load_diabetes`.
