---
title: "Random forests"
keywords: "rf bagging"
topic: 31
co: "CO5"
description: "One tree overfits. Many different trees, each trained on a random view of the data, cancel out each other's mistakes when they vote."
outcomes: ["Explain bagging and random feature selection", "Say why averaging many trees reduces variance", "Train a random forest in scikit-learn", "Use out-of-bag score and feature importances"]
reading: ["Textbook 2, Ch. on ensemble learning", "Reference book 1, Ch. on combining multiple learners"]
---

### Intuition

Ask one doctor, and you get one opinion, with its own quirks. Ask a hundred independent doctors and take a vote, and the individual quirks tend to cancel, as long as they are not all wrong in the same way. A random forest makes its trees different on purpose, so that their errors differ.

### How it works

**Two sources of randomness:**

1. **Bagging (bootstrap aggregating).** Each tree trains on a sample of n rows drawn **with replacement**. About 63.2% of the distinct rows appear in each sample, because 1 − (1 − 1/n)ⁿ approaches 1 − 1/e.
2. **Random features.** At each split, only a random subset of the features is considered, usually √(number of features) for classification.

**Prediction.** For classification, take a majority vote (or average the probabilities). For regression, take the average.

**Why it works.** Suppose 25 trees are each right 70% of the time, and their errors are independent. A majority vote is right with a probability of about 98%. Real trees are correlated, so the gain is smaller, which is why random features are added: they reduce the correlation.

**Out-of-bag (OOB) score.** Each tree missed about 36.8% of the rows, which act as a free validation set for it.

**Feature importance.** This adds up how much each feature reduced impurity across all trees. It is useful, but it can favour features with many values.

| | One tree | Random forest |
| --- | --- | --- |
| Variance | High | Much lower |
| Readability | Easy | Hard |
| Accuracy | Lower | Usually higher |
| Pruning needed | Usually | Rarely |
| Scaling needed | No | No |

### Run it: a forest against a single tree

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

data = load_wine()
X, y = data.data, data.target
print("Wine data:", X.shape, "classes:", [str(c) for c in data.target_names])

tree = cross_val_score(DecisionTreeClassifier(random_state=0), X, y, cv=5)
print(f"One tree:      {tree.mean():.3f} +/- {tree.std():.3f}")

print("\nTrees   cross-validated accuracy")
for n in [1, 5, 25, 100]:
    forest = RandomForestClassifier(n_estimators=n, random_state=0)
    print(f"{n:5}   {cross_val_score(forest, X, y, cv=5).mean():24.3f}")

forest = RandomForestClassifier(n_estimators=100, oob_score=True, random_state=0).fit(X, y)
print(f"\nOOB score with 100 trees: {forest.oob_score_:.3f}")
order = np.argsort(forest.feature_importances_)[::-1][:6]
print("\nMost important features")
for i in order:
    print(f"  {data.feature_names[i]:30} {forest.feature_importances_[i]:.3f}")

plt.figure(figsize=(6, 3))
plt.barh([data.feature_names[i] for i in order][::-1], forest.feature_importances_[order][::-1], color="#0f766e")
plt.title("Feature importance")
plt.tight_layout()
plt.show()

# The majority-vote calculation from the text
from math import comb
p = 0.7
vote = sum(comb(25, k) * p ** k * (1 - p) ** (25 - k) for k in range(13, 26))
print(f"\n25 independent trees, each 70% right: the vote is right {vote:.3f} of the time")
```

**Try this:** set `max_features=None`, so every split sees all the features. The trees become more alike. Does accuracy change?

### Common mistakes

- **Thinking more trees cause overfitting.** Extra trees mostly just cost time. Accuracy levels off.
- **Reading importance as cause.** It shows what the model used, not what causes the outcome.
- **Forgetting about memory and speed.** Hundreds of deep trees can be slow to predict on small devices.

### Problems

1. Calculate the probability that a given row is not in a bootstrap sample with n = 10.
2. If 3 independent classifiers are each 80% right, how often is their majority vote right?
3. Run the program with `load_breast_cancer`. Which features rank highest?
4. Why are correlated trees less useful in a vote than independent ones?
5. When would you still choose a single tree instead of a forest?
