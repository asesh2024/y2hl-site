---
title: "Regularisation: ridge, lasso, elastic net and the bias-variance trade-off"
keywords: "l1 l2 sparsity overfitting shrinkage"
topic: 7
co: "CO2"
description: "A model with many features can memorise the training data. A penalty on large weights trades a little bias for much less variance, and L1 can remove features altogether."
outcomes: ["Explain bias and variance", "Write the ridge, lasso and elastic net costs", "Explain geometrically why L1 gives sparse weights", "Tune regularisation strength with validation data", "Compare models with compare_regularisation"]
reading: ["Textbook 1, Ch. 4, pp. 136–147", "Textbook 2, Ch. 3, pp. 57–79", "Textbook 3, Ch. 6, pp. 225–264"]
---

### Intuition

Give a model many features and few rows, and it finds patterns that are only coincidence. It scores well in training, and worse on new students. Regularisation adds a price for large weights, so that a weight must earn its size by truly reducing the error.

### How it works

**Bias and variance.**

| | Meaning | Symptom |
| --- | --- | --- |
| **High bias** | Too simple, misses the pattern | Poor training **and** validation scores |
| **High variance** | Too flexible, fits noise | Great training, poor validation |

```text
Expected error = bias² + variance + irreducible noise
```

Regularisation accepts a little more bias, for much less variance.

**The three penalties:**

```text
Ridge (L2):     Cost = MSE + α Σ wᵢ²
Lasso (L1):     Cost = MSE + α Σ |wᵢ|
Elastic net:    Cost = MSE + α [ r Σ |wᵢ| + (1 − r)/2 Σ wᵢ² ]
```

Don't penalise the intercept, and do scale the features first, because the penalty depends on a weight's size.

**Why does L1 give exact zeros?** Picture the error as contour ellipses around the best weights. The penalty confines the weights to a shape around the origin. The ridge shape is a circle, so the ellipses usually touch it away from an axis. The lasso shape is a diamond, whose corners lie **on the axes**, so the ellipses tend to touch a corner, where a weight is exactly 0.

| | Ridge | Lasso | Elastic net |
| --- | --- | --- | --- |
| Shrinks weights | Yes | Yes | Yes |
| Sets weights to exactly 0 | No | Yes | Yes |
| Correlated features | Shares weight among them | Picks one, somewhat at random | Keeps groups |

**In `LogisticRegression`, C works the other way:** C = 1/α, so a **small C means strong regularisation**.

### Run it: shrinkage and comparison

We add 30 pure-noise features, so that there is something to overfit and to remove.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from placement_predict import load_data, preprocessor, train_val_test

df = load_data(n=800)
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
prep = preprocessor().fit(X_train)
rng = np.random.default_rng(0)
def with_noise(X):
    return np.c_[prep.transform(X), rng.normal(size=(len(X), 30))]
A, B = with_noise(X_train), with_noise(X_val)

def compare_regularisation(A, y_train, B, y_val, C_values):
    rows = []
    for C in C_values:
        common = dict(C=C, solver="saga", max_iter=4000)
        lasso = LogisticRegression(penalty="l1", **common).fit(A, y_train)
        ridge = LogisticRegression(penalty="l2", **common).fit(A, y_train)
        enet = LogisticRegression(penalty="elasticnet", l1_ratio=0.5, **common).fit(A, y_train)
        rows.append({"C": C, "Lasso_val": lasso.score(B, y_val), "Ridge_val": ridge.score(B, y_val),
                     "ElasticNet_val": enet.score(B, y_val), "Lasso_nonzero": int((lasso.coef_ != 0).sum()),
                     "Ridge_nonzero": int((ridge.coef_ != 0).sum())})
    return pd.DataFrame(rows)

table = compare_regularisation(A, y_train, B, y_val, [0.001, 0.01, 0.1, 1, 10])
print(f"Features in total: {A.shape[1]}, of which 30 are pure noise")
print(table.round(3).to_string(index=False))

fig, ax = plt.subplots(1, 2, figsize=(10, 3.2))
ax[0].semilogx(table["C"], table["Lasso_val"], "o-", label="lasso")
ax[0].semilogx(table["C"], table["Ridge_val"], "o-", label="ridge")
ax[0].set(xlabel="C (smaller means stronger penalty)", ylabel="validation accuracy"); ax[0].legend()
ax[1].semilogx(table["C"], table["Lasso_nonzero"], "o-", label="lasso")
ax[1].semilogx(table["C"], table["Ridge_nonzero"], "o-", label="ridge")
ax[1].set(xlabel="C", ylabel="non-zero weights"); ax[1].legend()
plt.tight_layout()
plt.show()
```

**Try this:** raise the noise features from 30 to 300. Does the best C change?

### Common mistakes

- **Regularising unscaled features.** A feature in large units gets a small weight, and so escapes the penalty.
- **Confusing C with α.** Bigger C means *weaker* regularisation.
- **Choosing C using the test set.** Use validation data or cross-validation.

### Problems

1. MSE = 4, weights (2, −1), α = 0.5. Calculate the ridge cost and the lasso cost.
2. Train accuracy 0.99, validation 0.72: is the problem bias or variance? What do you try first?
3. Train accuracy 0.70, validation 0.69 where 0.90 is known to be possible: bias or variance?
4. **Lab 5:** write `compare_regularisation` as above, and print which features lasso keeps at the best C.
5. Draw the circle and diamond with an error ellipse, and show where each one touches.
