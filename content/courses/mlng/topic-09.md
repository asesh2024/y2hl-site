---
title: "Decision trees: construction, splitting and pruning"
keywords: "gini entropy cart ccp depth"
topic: 9
co: "CO3"
description: "A tree asks one question at a time, choosing each by how much purer it makes the groups. Left alone it memorises the data, so we limit or prune it."
outcomes: ["Describe greedy top-down tree construction", "Calculate Gini impurity, entropy and MSE-based splits", "Apply pre-pruning and cost-complexity post-pruning", "Explain bias and variance in shallow and deep trees"]
reading: ["Textbook 1, Ch. 6, pp. 185–214", "Textbook 3, Ch. 8, pp. 303–336"]
---

### Intuition

Placement decisions can be written as questions: is the coding score above 65? Any internships? More than two backlogs? A decision tree learns these questions from data. It handles mixed features, needs no scaling, and you can read it.

### How it works

**Greedy construction (CART).** Try every feature and threshold, take the split that most reduces impurity, then repeat on each side. It never goes back to change an earlier split.

```text
Gini    = 1 − Σ pₖ²
Entropy = − Σ pₖ log₂ pₖ
Cost of a split = (n_left/n)·Impurity(left) + (n_right/n)·Impurity(right)
```

**A worked split.** 10 students, 5 placed: Gini = 1 − 0.25 − 0.25 = 0.5. A split sends 4 placed and 1 not placed left (Gini 1 − 0.64 − 0.04 = 0.32), and 1 placed and 4 not placed right (Gini 0.32). The weighted impurity is 0.32, so the decrease is 0.18.

**Regression trees** use the same idea, with MSE as the impurity, and each leaf predicts the mean of its rows.

**Stopping (pre-pruning):** `max_depth`, `min_samples_split`, `min_samples_leaf`.

**Post-pruning (cost-complexity):** grow fully, then cut back to minimise:

```text
Rα(T) = R(T) + α · (number of leaves)
```

| | Shallow tree | Deep tree |
| --- | --- | --- |
| Bias | High | Low |
| Variance | Low | High |
| Training score | Lower | Near perfect |
| Stability | Stable | Small data changes reshape it |

### Run it: depth sweep and pruning

```python
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.pipeline import make_pipeline
from sklearn.tree import DecisionTreeClassifier, export_text, plot_tree
from placement_predict import load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
prep = preprocessor(scale=False).fit(X_train)
A, B = prep.transform(X_train), prep.transform(X_val)
names = list(prep.get_feature_names_out())

def dt_report(A, y_train, B, y_val, depths=range(1, 16)):
    rows = []
    for d in depths:
        t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(A, y_train)
        rows.append({"depth": d, "train_acc": t.score(A, y_train), "val_acc": t.score(B, y_val), "n_leaves": t.get_n_leaves()})
    return pd.DataFrame(rows)

report = dt_report(A, y_train, B, y_val)
print(report.round(3).to_string(index=False))
best = report.loc[report["val_acc"].idxmax()]
print(f"\nBest depth by validation: {int(best['depth'])}")

for criterion in ["gini", "entropy"]:
    t = DecisionTreeClassifier(criterion=criterion, max_depth=int(best["depth"]), random_state=0).fit(A, y_train)
    print(f"{criterion:8} validation accuracy {t.score(B, y_val):.3f}")

full = DecisionTreeClassifier(random_state=0).fit(A, y_train)
print(f"\nFull tree: {full.get_n_leaves()} leaves, validation accuracy {full.score(B, y_val):.3f}")
alphas = full.cost_complexity_pruning_path(A, y_train).ccp_alphas
candidates = alphas[::max(1, len(alphas) // 40)]
pruned = max((DecisionTreeClassifier(ccp_alpha=a, random_state=0).fit(A, y_train) for a in candidates), key=lambda t: t.score(B, y_val))
print(f"Pruned:    {pruned.get_n_leaves()} leaves, validation accuracy {pruned.score(B, y_val):.3f}, alpha {pruned.ccp_alpha:.5f}")

small = DecisionTreeClassifier(max_depth=3, random_state=0).fit(A, y_train)
print("\n" + export_text(small, feature_names=names))

fig, ax = plt.subplots(1, 2, figsize=(11, 3.6))
ax[0].plot(report["depth"], report["train_acc"], label="train", color="#c2410c")
ax[0].plot(report["depth"], report["val_acc"], label="validation", color="#0f766e")
ax[0].set(xlabel="max_depth", ylabel="accuracy", title="Depth sweep"); ax[0].legend()
plot_tree(small, feature_names=names, class_names=["No", "Yes"], filled=True, fontsize=6, ax=ax[1])
plt.tight_layout()
plt.show()
```

The depth sweep shows the usual shape: training accuracy keeps climbing, and validation accuracy peaks, then falls.

**Try this:** retrain with `min_samples_leaf=50` and no depth limit. Compare the leaf count and the score with the depth-limited tree.

### Common mistakes

- **Leaving a tree at full depth.** It usually memorises the training data.
- **Scaling features for a tree.** It does no harm, but it does nothing.
- **Trusting the structure too much.** A small data change can produce a quite different tree, which is why Topic 10 averages many.

### Problems

1. Calculate the Gini of a group with 3 placed and 1 not placed.
2. Calculate the entropy of the same group.
3. A split leaves groups of 6 (Gini 0) and 4 (Gini 0.5). Find the weighted impurity.
4. **Lab 6:** write `dt_report` so it also plots curves and prints the best row.
5. Train a `DecisionTreeRegressor` to predict `SalaryLPA` for placed students, and report the RMSE.
