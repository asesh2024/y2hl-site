---
title: "Random forests: bagging, feature subsampling and OOB error"
keywords: "rf bootstrap ensemble"
topic: 10
co: "CO3"
description: "One deep tree is unstable. Train many on different random views of the data, and let them vote: the noise cancels and the signal stays."
outcomes: ["Explain bootstrap sampling and bagging", "Explain why feature subsampling helps", "Use the OOB score as a validation estimate", "Compare a forest with a single tree and with manual bagging"]
reading: ["Textbook 1, Ch. 7, pp. 215–247", "Textbook 3, Ch. 8, pp. 336–355"]
---

### Intuition

Deep trees have low bias but high variance: each one is wrong in its own way. Average enough of them, and these individual errors tend to cancel, provided the trees are not all alike.

### How it works

**Bagging.** Draw n rows *with replacement* for each tree. A given row is left out with probability (1 − 1/n)ⁿ, which approaches 1/e ≈ 0.368.

**Feature subsampling.** At each split, consider only a random subset, usually √p features. If one feature is very strong, plain bagging would put it at the top of every tree, and they would all look alike.

**The variance argument.** For B trees, each with variance σ² and pairwise correlation ρ:

```text
Variance of the average = ρσ² + (1 − ρ)σ²/B
```

More trees shrink the second term only. Lowering ρ, through feature subsampling, shrinks the first. So adding trees levels off, and doesn't cause overfitting in the usual sense.

**OOB (out-of-bag) error.** Each row is scored only by the trees that didn't train on it. This gives a built-in validation estimate with no separate split.

**Worked example.** σ² = 1, ρ = 0.5, B = 100: 0.5 + 0.5/100 = 0.505. Going to B = ∞ only reaches 0.5, whereas ρ = 0.1 gives 0.1 + 0.9/100 = 0.109.

### Run it: forests against one tree

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from placement_predict import load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
prep = preprocessor(scale=False).fit(X_train)
A, B = prep.transform(X_train), prep.transform(X_val)
y = y_train.to_numpy()

# Bagging by hand
rng = np.random.default_rng(0)
votes = np.zeros(len(B))
print("Trees  manual bagging val_acc")
for i in range(1, 26):
    rows = rng.integers(0, len(A), len(A))
    votes += DecisionTreeClassifier(random_state=i).fit(A[rows], y[rows]).predict(B)
    if i in (1, 5, 25):
        print(f"{i:5}  {((votes / i > 0.5) == y_val.to_numpy()).mean():.3f}")

def rf_vs_single_tree(A, y, B, y_val, n_estimators_list):
    tree = DecisionTreeClassifier(random_state=0).fit(A, y).score(B, y_val)
    rows = []
    for n in n_estimators_list:
        rf = RandomForestClassifier(n_estimators=n, oob_score=True, random_state=0, n_jobs=1).fit(A, y)
        rows.append({"n_estimators": n, "RF_val_acc": rf.score(B, y_val), "DT_val_acc": tree, "OOB_acc": rf.oob_score_})
    return pd.DataFrame(rows)

table = rf_vs_single_tree(A, y, B, y_val, [25, 50, 100, 200])
print("\n" + table.round(3).to_string(index=False))

print("\nmax_features   val_acc")
for m in ["sqrt", 0.5, None]:
    rf = RandomForestClassifier(n_estimators=100, max_features=m, random_state=0).fit(A, y)
    print(f"{str(m):12} {rf.score(B, y_val):.3f}")

plt.figure(figsize=(6, 3.2))
for column in ["RF_val_acc", "DT_val_acc", "OOB_acc"]:
    plt.plot(table["n_estimators"], table[column], "o-", label=column)
plt.xlabel("number of trees"); plt.ylabel("accuracy"); plt.legend()
plt.show()
```

The OOB line stays close to the validation line, which is why OOB is a handy check.

**Try this:** set `max_depth=3` for all the forest's trees. What happens when the individual trees have high bias?

### Common mistakes

- **Using a forest on shallow trees.** Averaging cuts variance, not bias.
- **Tuning the number of trees as if it were a complexity knob.** Pick enough, and stop when the curve flattens.
- **Treating OOB as test data after tuning on it.** Once it guides choices, it is no longer unseen.

### Problems

1. For n = 10, calculate the chance that a row is left out of a bootstrap sample.
2. σ² = 4, ρ = 0.25 and B = 100. Find the variance of the average.
3. **Lab 7:** write `rf_vs_single_tree` as above, and plot the three lines.
4. Why can a forest with a very strong feature benefit from a low `max_features`?
5. Time a forest with 50, 200 and 800 trees. Is the accuracy gain worth it?
