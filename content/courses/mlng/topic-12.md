---
title: "Feature importance and explainability"
keywords: "mdi permutation shap beeswarm interpretability pred_contribs"
topic: 12
co: "CO3"
description: "A placement cell will ask why. Three ways to answer it: impurity importance, permutation importance and SHAP values, each with its own strengths and traps."
outcomes: ["Explain MDI and its bias", "Calculate and use permutation importance", "Read SHAP values for one student and overall", "Explain why trees often beat neural networks on tabular data"]
reading: ["Textbook 1, Ch. 7, pp. 240–247", "Reference book 2, Ch. 5, pp. 133–172"]
---

### Intuition

An ensemble of 200 trees cannot be read by eye. Explainability tools ask two questions. **Globally**: which features matter most to this model? **Locally**: why this prediction, for this student?

### How it works

| Method | Idea | Strength | Trap |
| --- | --- | --- | --- |
| **MDI (Gini importance)** | Total impurity decrease from each feature | Free with the fit | Favours features with many distinct values, and uses training data |
| **Permutation** | Shuffle one column, and see how much the score drops | Works for any model, on validation data | Correlated features share or hide importance |
| **SHAP** | Share out one prediction among the features fairly | Local and global, adds up exactly | Slower, and describes the model, not causes |

**Permutation, worked.** Validation accuracy is 0.80. After shuffling `CodingScore`, it falls to 0.72. The importance is 0.08.

**SHAP's additive property:**

```text
prediction = base value + Σ SHAP value of each feature
```

**Worked.** Base value −0.6, with SHAP values +1.2, +0.5 and −0.3, gives a score of 0.8 (log odds here, because boosted trees add up in that scale).

**Why do trees often beat neural networks on tables?** Tables have irregular thresholds and rules, mixed types and many uninformative columns. Trees cut on one feature at a time and handle these naturally. Networks tend towards smooth functions and need more tuning. Images and text are different, and there networks lead.

### Run it: three views of the same model

XGBoost can calculate exact SHAP values itself, using `pred_contribs=True`, so this runs in the browser.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import xgboost as xgb
from sklearn.inspection import permutation_importance
from placement_predict import load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
prep = preprocessor(scale=False).fit(X_train)
A, B = prep.transform(X_train), prep.transform(X_val)
names = list(prep.get_feature_names_out())
model = xgb.XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.1, n_jobs=1, random_state=0).fit(A, y_train)

perm = permutation_importance(model, B, y_val, n_repeats=5, random_state=0, n_jobs=1)
contribs = model.get_booster().predict(xgb.DMatrix(B, feature_names=names), pred_contribs=True)
shap_values, base = contribs[:, :-1], contribs[0, -1]

def shap_feature_summary(shap_values, feature_names, top_n=5):
    summary = pd.DataFrame({"feature": feature_names, "mean_abs_shap": np.abs(shap_values).mean(axis=0)})
    return summary.sort_values("mean_abs_shap", ascending=False).head(top_n)

table = pd.DataFrame({"gain": model.feature_importances_, "permutation": perm.importances_mean,
                      "mean_abs_shap": np.abs(shap_values).mean(axis=0)}, index=names)
print(table.sort_values("mean_abs_shap", ascending=False).round(3).head(8))
print("\nTop 5 by SHAP\n", shap_feature_summary(shap_values, names).round(3).to_string(index=False))

i = 0
print(f"\nWhy this prediction? Student {i}, base value {base:.3f}")
for j in np.argsort(-np.abs(shap_values[i]))[:5]:
    print(f"  {names[j]:20} value {B[i, j]:7.2f}   SHAP {shap_values[i, j]:+.3f}")
total = base + shap_values[i].sum()
print(f"  Sum = {total:.3f}, so P(placed) = {1 / (1 + np.exp(-total)):.3f}")
print(f"  Model's own output:  P(placed) = {model.predict_proba(B[[i]])[0, 1]:.3f}")

order = np.argsort(np.abs(shap_values).mean(axis=0))[-8:]
plt.figure(figsize=(7, 3.6))
rng = np.random.default_rng(0)
for row, j in enumerate(order):
    v = B[:, j]
    colour = (v - np.nanmin(v)) / (np.nanmax(v) - np.nanmin(v) + 1e-9)
    plt.scatter(shap_values[:, j], row + rng.normal(0, 0.08, len(v)), c=colour, cmap="coolwarm", s=5)
plt.yticks(range(len(order)), [names[j] for j in order])
plt.axvline(0, color="k", lw=0.6); plt.xlabel("SHAP value (red means a high feature value)")
plt.title("A beeswarm plot")
plt.tight_layout()
plt.show()
```

### On your own computer: the shap library

The `shap` library is not available in the browser. Install it with `python -m pip install shap`, and save `placement_predict.py` beside your program. We have not been able to test this particular listing on the site's test machine, so tell us if anything fails.

```py
import shap
import xgboost as xgb
from placement_predict import load_data, preprocessor, train_val_test

X_train, X_val, _, y_train, y_val, _ = train_val_test(load_data())
prep = preprocessor(scale=False).fit(X_train)
names = list(prep.get_feature_names_out())
model = xgb.XGBClassifier(n_estimators=150, max_depth=4, n_jobs=1, random_state=0).fit(prep.transform(X_train), y_train)

explainer = shap.TreeExplainer(model)
values = explainer(prep.transform(X_val))
values.feature_names = names
print("SHAP values shape:", values.values.shape)
shap.plots.beeswarm(values, show=False)          # use show=True to see the chart
```

### Common mistakes

- **Reading importance as cause.** Raising a student's coding score may not raise their real chances the way the model suggests.
- **Using MDI alone.** High-cardinality columns such as an ID can look important.
- **Dropping a correlated feature because its permutation score is low.** Its partner may be covering for it.

### Problems

1. Accuracy falls from 0.85 to 0.70 when a column is shuffled. What is its permutation importance?
2. Base value 0.2, SHAP values +0.4 and −0.1. Find the model's raw score.
3. Add a random-number column to the features. Where does it rank under MDI and permutation?
4. **Skill 10:** write `shap_feature_summary` as above, for `model`.
5. For a student predicted "Not placed", write a helpful two-sentence explanation using SHAP output.
