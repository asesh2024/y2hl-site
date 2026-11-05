---
title: "Probability calibration and statistical significance"
keywords: "platt isotonic reliability diagram brier ece mcnemar paired bootstrap"
topic: 20
co: "CO5"
description: "If a model says 70%, do 70% of such students really get placed? Measure and fix that, then check whether one model truly beats another or just got lucky."
outcomes: ["Read a reliability diagram", "Calculate the Brier score and ECE", "Apply Platt scaling and isotonic regression", "Apply McNemar's test", "Use a paired bootstrap for regressors"]
reading: ["Textbook 1, Ch. 2, pp. 67–89; Ch. 3", "Textbook 2, Ch. 7, pp. 219–258"]
---

### Intuition

Two models can rank students equally well, while one says 0.95 when the truth is 0.70. If a counsellor acts on that number, the difference matters. Separately, model A may score 0.81 and B 0.80. Is that real, or an accident of this particular test set?

### How it works

**Calibration.** Among students given about 0.7, about 70% should be placed. A **reliability diagram** plots predicted against observed rates. A perfect model follows the diagonal.

**Brier score** is the mean of (p − y)². Lower is better. **Worked.** (p, y) = (0.8, 1), (0.3, 0): (0.04 + 0.09) / 2 = 0.065.

**ECE (expected calibration error)** is the weighted average gap between confidence and accuracy, across bins.

| Method | How | Use when |
| --- | --- | --- |
| Platt scaling | Fit a sigmoid to the model's scores | Little calibration data; an S-shaped error |
| Isotonic regression | Fit a free non-decreasing curve | Plenty of data |

Fit the calibrator on data not used for training. Calibration changes probabilities, usually with little effect on ranking.

**McNemar's test.** On the same test set, count only where the classifiers disagree: b is A right and B wrong, c is A wrong and B right.

```text
χ² = (|b − c| − 1)² / (b + c)      with 1 degree of freedom
```

**Worked.** b = 10, c = 25: χ² = 14² / 35 = 5.6, which is above 3.84, so the difference is significant at the 5% level. Note that this uses only 35 disagreements, however large the test set.

**Paired bootstrap, for regressors.** Resample the test rows many times, and calculate the RMSE difference each time. If the 95% interval excludes 0, the difference is likely to be real.

### Run it: calibrate, then test

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import chi2
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import make_pipeline
from sklearn.tree import DecisionTreeRegressor
from placement_predict import load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)

def ece(y, p, bins=10):
    edges = np.linspace(0, 1, bins + 1)
    index = np.clip(np.digitize(p, edges) - 1, 0, bins - 1)
    return sum(abs(p[index == b].mean() - y[index == b].mean()) * (index == b).mean() for b in range(bins) if (index == b).any())

base = make_pipeline(preprocessor(), GaussianNB())
models = {"Naive Bayes": base,
          "NB + Platt": CalibratedClassifierCV(base, method="sigmoid", cv=3),
          "NB + isotonic": CalibratedClassifierCV(base, method="isotonic", cv=3)}
y = y_val.to_numpy()
plt.figure(figsize=(5, 3.6))
print(f"{'Model':15} {'Brier':>7} {'ECE':>7} {'AUC':>7}")
for name, model in models.items():
    p = model.fit(X_train, y_train).predict_proba(X_val)[:, 1]
    print(f"{name:15} {brier_score_loss(y, p):7.4f} {ece(y, p):7.4f} {roc_auc_score(y, p):7.4f}")
    observed, predicted = calibration_curve(y, p, n_bins=8)
    plt.plot(predicted, observed, "o-", label=name)
plt.plot([0, 1], [0, 1], "k--", lw=0.7)
plt.xlabel("predicted probability"); plt.ylabel("observed rate"); plt.title("Reliability diagram"); plt.legend()
plt.show()

a = make_pipeline(preprocessor(), LogisticRegression(max_iter=1000)).fit(X_train, y_train).predict(X_val)
b = make_pipeline(preprocessor(scale=False), RandomForestClassifier(200, random_state=0, n_jobs=1)).fit(X_train, y_train).predict(X_val)
only_a = int(((a == y) & (b != y)).sum())
only_b = int(((a != y) & (b == y)).sum())
stat = (abs(only_a - only_b) - 1) ** 2 / (only_a + only_b)
print(f"\nMcNemar: logistic accuracy {(a == y).mean():.3f}, forest accuracy {(b == y).mean():.3f}")
print(f"Only logistic right: {only_a}. Only forest right: {only_b}. chi2 = {stat:.2f}, p = {chi2.sf(stat, 1):.3f}")

cols = ["CodingTestScore", "CGPA", "Internships"]
placed = df[df["PlacementStatus"] == 1].dropna(subset=cols)
split = int(0.7 * len(placed))
train, test = placed.iloc[:split], placed.iloc[split:]
e1 = LinearRegression().fit(train[cols], train["Salary Package"]).predict(test[cols]) - test["Salary Package"].to_numpy()
e2 = DecisionTreeRegressor(max_depth=3, random_state=0).fit(train[cols], train["Salary Package"]).predict(test[cols]) - test["Salary Package"].to_numpy()
rng = np.random.default_rng(0)
diffs = []
for _ in range(2000):
    i = rng.integers(0, len(e1), len(e1))
    diffs.append(np.sqrt(np.mean(e2[i] ** 2)) - np.sqrt(np.mean(e1[i] ** 2)))
low, high = np.percentile(diffs, [2.5, 97.5])
print(f"\nPaired bootstrap, tree RMSE minus linear RMSE: 95% interval [{low:.3f}, {high:.3f}]")
```

**Try this:** apply the calibrators to `RandomForestClassifier` in place of naive Bayes. Does a forest need less fixing?

### Common mistakes

- **Calibrating on the training data.** The probabilities will look perfect, and they won't be.
- **Declaring a winner from a small gap.** Test it first.
- **Using an independent t-test for classifiers on the same rows.** The results are paired, so use McNemar.

### Problems

1. (p, y) = (0.9, 1), (0.4, 0). Calculate the Brier score.
2. b = 20, c = 30. Calculate McNemar's statistic. Is it significant at the 5% level?
3. **Lab 12:** write `model_evaluation_report` with confusion counts, ROC and PR, calibration and McNemar.
4. **Skill 18:** write `calibration_comparison`, returning Brier scores before and after isotonic calibration.
5. Why does McNemar's test ignore the rows where both models are right?
