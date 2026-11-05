---
title: "Boosting: AdaBoost, gradient boosting, XGBoost and LightGBM"
keywords: "gbm gbdt functional gradient histogram leafwise early stopping"
topic: 11
co: "CO3"
description: "Forests train trees side by side. Boosting trains them in sequence, each one correcting what the ensemble still gets wrong."
outcomes: ["Explain AdaBoost's sample reweighting", "Describe gradient boosting as functional gradient descent", "Use XGBoost and LightGBM, with early stopping", "Explain histogram splitting and leaf-wise growth", "Compare the boosters in a benchmark"]
reading: ["Textbook 1, Ch. 7, pp. 247–264", "Textbook 2, Ch. 10, pp. 337–387"]
---

### Intuition

Some students are repeatedly misclassified. Boosting pays special attention to them. Each new small tree focuses on the current mistakes, and the final model adds them all up. Bagging reduces variance. Boosting mainly reduces **bias**, using many weak trees.

### How it works

**AdaBoost.** Give each row a weight. After each weak learner with weighted error ε:

```text
Model weight:   α = ½ ln((1 − ε) / ε)
Row weights:    multiply by e^α if wrong, by e^(−α) if right, then normalise
```

**Worked.** ε = 0.2: α = ½ ln 4 = 0.693, so a wrong row's weight doubles, and a right one's halves (before normalising).

**Gradient boosting.** Each new tree fits the **negative gradient** of the loss, with respect to the current predictions. For squared error, that's simply the residuals:

```text
F₀(x) = a constant
rᵢ = yᵢ − F(xᵢ)            the residuals
F ← F + η · tree fitted to r
```

**A worked step.** y = 10, current prediction 8, so residual 2. With η = 0.1 and a tree that predicts 2, the new prediction is 8.2.

The learning rate η and the number of trees trade off: smaller η needs more trees. Unlike a forest, too many trees **can overfit**, so use **early stopping** on validation data.

**What modern libraries add:**

| Feature | XGBoost | LightGBM |
| --- | --- | --- |
| Regularisation | Penalties on leaf count and leaf values | Similar |
| Finding splits | Histogram option | Histogram bins by default, very fast |
| Tree growth | Level-wise by default | **Leaf-wise**: splits the best leaf anywhere |
| Control overfitting with | `max_depth`, `eta`, `lambda` | `num_leaves`, `min_data_in_leaf` |

### Run it: the boosting benchmark

```python
import time
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import lightgbm as lgb
import xgboost as xgb
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from placement_predict import load_data, preprocessor, train_val_test

warnings.filterwarnings("ignore", category=FutureWarning)      # library version notices

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
prep = preprocessor(scale=False).fit(X_train)
A, B = prep.transform(X_train), prep.transform(X_val)

def boosting_benchmark(A, y_train, B, y_val):
    models = {
        "AdaBoost": AdaBoostClassifier(n_estimators=200, random_state=0),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=200, random_state=0),
        "XGBoost": xgb.XGBClassifier(n_estimators=200, max_depth=4, learning_rate=0.1, n_jobs=1, random_state=0),
        "LightGBM": lgb.LGBMClassifier(n_estimators=200, num_leaves=15, learning_rate=0.1, n_jobs=1, random_state=0, verbose=-1),
    }
    rows = []
    for name, model in models.items():
        start = time.perf_counter()
        model.fit(A, y_train)
        rows.append({"model": name, "val_accuracy": model.score(B, y_val),
                     "val_auc": roc_auc_score(y_val, model.predict_proba(B)[:, 1]), "time_s": time.perf_counter() - start})
    return pd.DataFrame(rows).sort_values("val_accuracy", ascending=False)

print(boosting_benchmark(A, y_train, B, y_val).round(3).to_string(index=False))

booster = xgb.XGBClassifier(n_estimators=1000, max_depth=4, learning_rate=0.1, eval_metric="logloss",
                            early_stopping_rounds=30, n_jobs=1, random_state=0)
booster.fit(A, y_train, eval_set=[(A, y_train), (B, y_val)], verbose=False)
print(f"\nEarly stopping chose {booster.best_iteration + 1} trees out of a possible 1000")

history = booster.evals_result()
plt.figure(figsize=(6, 3.2))
plt.plot(history["validation_0"]["logloss"], label="train", color="#c2410c")
plt.plot(history["validation_1"]["logloss"], label="validation", color="#0f766e")
plt.axvline(booster.best_iteration, color="k", ls="--", label="best")
plt.xlabel("trees"); plt.ylabel("log loss"); plt.legend()
plt.show()
```

**Try this:** set `learning_rate=0.5`, then `0.01`. How does the early-stopping tree count change?

### Common mistakes

- **Using many trees without early stopping.** Boosting does overfit eventually.
- **Boosting deep trees.** Small trees are the normal choice, because the ensemble builds up complexity.
- **Stopping early on the test set.** Use validation data, and keep the test set for the end.

### Problems

1. Calculate α for a weak learner with ε = 0.1.
2. y = 20, prediction 15, η = 0.2, and the tree predicts the residual exactly. Find the new prediction.
3. Why does AdaBoost stop being useful if ε reaches 0.5?
4. **Lab 8:** write `boosting_benchmark` as above, then add a chart of training time.
5. Explain leaf-wise growth, and why `num_leaves` must be limited.
