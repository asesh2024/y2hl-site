---
title: "Performance metrics: classification and regression"
keywords: "confusion matrix precision recall f1 roc auc pr rmse mae mape r2 threshold"
topic: 18
co: "CO5"
description: "Accuracy can lie. Use the confusion matrix, precision and recall, ROC and PR curves for classifiers, and RMSE, MAE and R² for regressors."
outcomes: ["Derive metrics from TP, FP, TN and FN by hand", "Explain when accuracy and ROC-AUC mislead", "Use PR-AUC under class imbalance", "Tune the decision threshold", "Compare RMSE and MAE on outliers"]
reading: ["Textbook 1, Ch. 3, pp. 83–106", "Textbook 3, Ch. 4, pp. 174–196"]
---

### Intuition

If 2% of students were placed, a model that says "not placed" every time is 98% accurate, and useless. Which mistake costs more? Telling a strong student they won't be placed, or giving a weak one false hope? The right metric depends on the answer.

### How it works

| | Predicted positive | Predicted negative |
| --- | --- | --- |
| **Actually positive** | TP | FN |
| **Actually negative** | FP | TN |

```text
Accuracy    = (TP + TN) / all
Precision   = TP / (TP + FP)
Recall      = TP / (TP + FN)
F1          = 2·P·R / (P + R)
FPR         = FP / (FP + TN)
```

**Worked.** TP = 80, FP = 20, FN = 40, TN = 860: accuracy 0.94, precision 0.80, recall 0.667, F1 = 0.727, FPR = 0.023.

**ROC curve:** recall against FPR, across all thresholds. Its area, **ROC-AUC**, is the chance that a random positive scores above a random negative. 0.5 is random, and 1 is perfect.

**PR curve:** precision against recall. A random model scores about the positive rate as its **PR-AUC**, so its baseline changes with imbalance.

When positives are rare, FPR stays small even with many false alarms, because TN is huge. So ROC-AUC can look great while precision is poor. **Use PR-AUC when the positive class is rare.**

**Regression metrics:**

| Metric | Formula | Note |
| --- | --- | --- |
| RMSE | √(mean (y − ŷ)²) | Squares errors, so it is sensitive to outliers |
| MAE | mean \|y − ŷ\| | More robust |
| MAPE | mean \|y − ŷ\| / \|y\| | A percentage, undefined at y = 0 |
| R² | 1 − SS_res / SS_tot | Share of variance explained |

**Worked.** Errors 1, 1, 1, 9: MAE = 3, and RMSE = √(84/4) = 4.58. One big error raises RMSE much more.

### Run it: the metrics, by hand and by library

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (average_precision_score, confusion_matrix, f1_score, mean_absolute_error,
                             mean_squared_error, precision_recall_curve, r2_score, roc_auc_score, roc_curve)
from sklearn.pipeline import make_pipeline
from placement_predict import FEATURES, load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
model = make_pipeline(preprocessor(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)
p = model.predict_proba(X_val)[:, 1]
pred = (p >= 0.5).astype(int)

tn, fp, fn, tp = confusion_matrix(y_val, pred).ravel()
print(f"TP {tp}  FP {fp}  FN {fn}  TN {tn}")
precision, recall = tp / (tp + fp), tp / (tp + fn)
print(f"By hand: accuracy {(tp + tn) / len(pred):.3f}, precision {precision:.3f}, recall {recall:.3f}, F1 {2 * precision * recall / (precision + recall):.3f}")
print(f"Library: F1 {f1_score(y_val, pred):.3f}, ROC-AUC {roc_auc_score(y_val, p):.3f}, PR-AUC {average_precision_score(y_val, p):.3f}")

def threshold_analysis(p, y, recall_target=0.95):
    rows = []
    for t in np.arange(0.05, 0.96, 0.05):
        h = p >= t
        tp = (h & (y == 1)).sum()
        rows.append({"threshold": round(t, 2), "precision": tp / max(h.sum(), 1), "recall": tp / (y == 1).sum()})
    table = pd.DataFrame(rows)
    ok = table[table["recall"] >= recall_target]
    best = ok.iloc[-1] if len(ok) else None
    print(f"Highest threshold with recall >= {recall_target}: {None if best is None else best['threshold']}")
    return table

table = threshold_analysis(p, y_val.to_numpy())
print(table.iloc[::3].round(3).to_string(index=False))

print("\nThe same ranking, with placed students made rare (5%)")
rng = np.random.default_rng(0)
pos, neg = np.where(y_val == 1)[0], np.where(y_val == 0)[0]
keep = np.r_[rng.choice(pos, 25, replace=False), neg]
print(f"ROC-AUC {roc_auc_score(y_val.iloc[keep], p[keep]):.3f} barely moves. PR-AUC falls to {average_precision_score(y_val.iloc[keep], p[keep]):.3f}")

placed = df.dropna(subset=["SalaryLPA", "Internships"])
A, y = placed[["CodingScore", "CGPA", "Internships"]], placed["SalaryLPA"]
fit = LinearRegression().fit(A, y).predict(A)
print(f"\nSalary regression: RMSE {np.sqrt(mean_squared_error(y, fit)):.3f}, MAE {mean_absolute_error(y, fit):.3f}, R2 {r2_score(y, fit):.3f}")
broken = fit.copy(); broken[0] += 100
print(f"One prediction off by 100:  RMSE {np.sqrt(mean_squared_error(y, broken)):.3f}, MAE {mean_absolute_error(y, broken):.3f}")

fig, ax = plt.subplots(1, 2, figsize=(9, 3.3))
fpr, tpr, _ = roc_curve(y_val, p); ax[0].plot(fpr, tpr, color="#0f766e"); ax[0].plot([0, 1], [0, 1], "k--", lw=0.7)
ax[0].set(title="ROC", xlabel="false positive rate", ylabel="recall")
pr, rc, _ = precision_recall_curve(y_val, p); ax[1].plot(rc, pr, color="#c2410c"); ax[1].axhline(y_val.mean(), color="k", ls="--", lw=0.7)
ax[1].set(title="Precision-recall", xlabel="recall", ylabel="precision")
plt.tight_layout()
plt.show()
```

**Try this:** set `recall_target=0.8`. How much precision do you win back?

### Common mistakes

- **Quoting accuracy on imbalanced data.** Always check the baseline.
- **Comparing ROC-AUC alone when positives are rare.** Add PR-AUC.
- **Treating 0.5 as fixed.** The right threshold depends on the cost of each mistake.

### Problems

1. TP = 30, FP = 10, FN = 20, TN = 40. Calculate all five metrics by hand.
2. Errors are 2, 2, 2, 10. Calculate MAE and RMSE.
3. A system should alert the placement cell about at-risk students. Which metric matters most?
4. **Skill 20:** write `threshold_analysis` as above, sweeping 0.05 to 0.95.
5. Explain ROC-AUC = 0.9 to a non-technical colleague.
