---
title: "Hyperparameter optimisation and learning curves"
keywords: "gridsearchcv randomizedsearchcv bayesian optuna skopt underfitting overfitting validation curve"
topic: 19
co: "CO5"
description: "Settings that training cannot learn must be searched for. Compare grid, random and Bayesian search, then read curves to see whether you need a different model or more data."
outcomes: ["Compare grid, random and Bayesian search", "Explain why random search often beats grid search", "Read validation curves", "Read learning curves to diagnose underfitting, overfitting and data scarcity"]
reading: ["Textbook 1, Ch. 2, pp. 67–89; Ch. 3", "Textbook 2, Ch. 7, pp. 219–258"]
---

### Intuition

Weights are learned. **Hyperparameters**, such as tree depth or learning rate, are chosen by you. Trying them all can take ages, so we want smart search. And before searching, ask whether search is what you need at all: a learning curve can show that more data or a different model would help more.

### How it works

| Method | How | Cost | Good when |
| --- | --- | --- | --- |
| Grid | Every combination | Multiplies quickly | Few settings |
| Random | Random samples | You choose | Many settings |
| Bayesian | Models the score, then picks promising points | Fewer fits, more logic | Each fit is costly |

**Worked cost.** 4 values × 5 values × 3 values = 60 combinations. With 5-fold CV, that's 300 fits.

**Why random search works** (Bergstra and Bengio): usually few settings really matter. A grid of 9 points tests only 3 distinct values of each setting, whereas 9 random points test 9 values of each.

**Validation curve:** the score against one hyperparameter.

**Learning curve:** the score against the amount of training data.

| Pattern | Diagnosis | Try |
| --- | --- | --- |
| Train and validation both low and close | Underfitting | A richer model or features |
| Train high, validation lower, gap persists | Overfitting | Regularise, simplify, or add data |
| Validation still climbing at the end | Too little data | Get more data |

### Run it: search, then diagnose

```python
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import randint
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, learning_curve, validation_curve
from sklearn.pipeline import make_pipeline
from placement_predict import FEATURES, load_data, preprocessor

df = load_data(n=1500)
X, y = df[FEATURES], df["PlacementStatus"]
base = make_pipeline(preprocessor(scale=False), RandomForestClassifier(n_estimators=40, random_state=0, n_jobs=1))
A = "randomforestclassifier__"

def search_comparison(estimator, grid, dists, X, y, n_iter=8):
    rows = []
    for name, search in [("Grid", GridSearchCV(estimator, grid, cv=3, scoring="roc_auc")),
                         ("Random", RandomizedSearchCV(estimator, dists, n_iter=n_iter, cv=3, scoring="roc_auc", random_state=0))]:
        start = time.perf_counter()
        search.fit(X, y)
        rows.append({"method": name, "best_score": search.best_score_, "n_fits": 3 * len(search.cv_results_["params"]), "time_s": time.perf_counter() - start})
    return pd.DataFrame(rows)

grid = {A + "max_depth": [3, 6, 12], A + "min_samples_leaf": [1, 5, 20]}
dists = {A + "max_depth": randint(2, 20), A + "min_samples_leaf": randint(1, 40)}
print(search_comparison(base, grid, dists, X, y).round(3).to_string(index=False))

depths = [2, 3, 4, 6, 8, 12, 16]
train, val = validation_curve(base, X, y, param_name=A + "max_depth", param_range=depths, cv=3)
sizes, ltrain, lval = learning_curve(base, X, y, cv=3, train_sizes=[0.1, 0.25, 0.5, 0.75, 1.0])
print("\nLearning curve\n rows  train    val")
for n, a, b in zip(sizes, ltrain.mean(axis=1), lval.mean(axis=1)):
    print(f"{n:5}  {a:.3f}  {b:.3f}")

fig, ax = plt.subplots(1, 2, figsize=(10, 3.2))
ax[0].plot(depths, train.mean(axis=1), "o-", label="train", color="#c2410c")
ax[0].plot(depths, val.mean(axis=1), "o-", label="validation", color="#0f766e")
ax[0].set(title="Validation curve", xlabel="max_depth", ylabel="accuracy"); ax[0].legend()
ax[1].plot(sizes, ltrain.mean(axis=1), "o-", label="train", color="#c2410c")
ax[1].fill_between(sizes, lval.mean(axis=1) - lval.std(axis=1), lval.mean(axis=1) + lval.std(axis=1), alpha=0.2, color="#0f766e")
ax[1].plot(sizes, lval.mean(axis=1), "o-", label="validation", color="#0f766e")
ax[1].set(title="Learning curve", xlabel="training rows"); ax[1].legend()
plt.tight_layout()
plt.show()
```

### On your own computer: Bayesian search

`scikit-optimize` is not available in the browser. Install it with `python -m pip install scikit-optimize`, and save `placement_predict.py` beside your program.

```py
from sklearn.ensemble import RandomForestClassifier
from skopt import BayesSearchCV
from skopt.space import Integer
from placement_predict import FEATURES, load_data, preprocessor

df = load_data(n=1000)
X = preprocessor(scale=False).fit_transform(df[FEATURES])
search = BayesSearchCV(RandomForestClassifier(n_estimators=40, random_state=0),
                       {"max_depth": Integer(2, 20), "min_samples_leaf": Integer(1, 40)},
                       n_iter=8, cv=3, scoring="roc_auc", random_state=0)
search.fit(X, df["PlacementStatus"])
print(round(search.best_score_, 3), dict(search.best_params_))
```

### Common mistakes

- **Reporting the best CV score as the final estimate.** It is optimistic, as Topic 17 shows.
- **Searching before you diagnose.** A learning curve may show that tuning can't help.
- **Using a grid for many settings.** The count explodes.

### Problems

1. Three settings with 4, 4 and 5 values, and 10-fold CV. How many fits does a grid need?
2. Train 0.99, validation 0.75. Diagnose it, and suggest two remedies.
3. **Skill 21:** write `search_comparison` so that it returns method, best score, fits and time.
4. Make a validation curve for `min_samples_leaf`.
5. Why does a grid of 9 points test only 3 values per setting?
