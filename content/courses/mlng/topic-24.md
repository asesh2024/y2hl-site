---
title: "Monitoring and lifecycle management"
keywords: "drift psi concept label latency throughput retrain mlflow dvc evidently observability"
topic: 24
co: "CO6"
description: "A deployed model degrades silently as the world changes. Measure drift with PSI, track experiments with MLflow, version data with DVC, and decide when to retrain."
outcomes: ["Distinguish data, concept and label drift", "Calculate the Population Stability Index", "Choose a retraining strategy", "Track experiments with MLflow", "Explain what DVC adds to Git"]
reading: ["Reference book 2, Ch. 8, pp. 247–286; Ch. 9, pp. 287–318", "Reference book 4, Ch. 7, pp. 163–196; Ch. 8, pp. 197–228"]
---

### Intuition

Recruiters who wanted Java last year want Python now. Your model raises no errors, its code hasn't changed, and it is steadily getting worse. Monitoring is how you notice.

### How it works

**What to watch:**

| Layer | Signals |
| --- | --- |
| Service | Latency, throughput, error rate |
| Data | Missing rates, ranges, distribution shifts |
| Predictions | Share predicted placed, score distribution |
| Outcomes | Accuracy, once true labels arrive |

**Kinds of drift:**

| Drift | What changes | Example |
| --- | --- | --- |
| Data (covariate) | P(X) | Students' coding scores rise |
| Concept | P(y given X) | The same profile is now less likely to be placed |
| Label | P(y) | Placement rate falls in a recession |

**PSI (Population Stability Index).** Bin a feature, then compare the shares:

```text
PSI = Σ (actual% − expected%) · ln(actual% / expected%)
```

| PSI | Usual reading |
| --- | --- |
| Below 0.1 | Stable |
| 0.1 to 0.2 | Moderate shift, so watch it |
| Above 0.2 | Significant drift |

**Worked.** Expected shares 0.5, 0.5, actual 0.7, 0.3: 0.2 × ln 1.4 + (−0.2) × ln 0.6 = 0.067 + 0.102 = 0.170.

**Retraining strategies:** on a schedule; when drift crosses a threshold; or online learning, which updates continuously (preview only). Always run a quality gate before you swap models.

**Tools.** **MLflow** tracks parameters, metrics and model files per run, with a registry for versions. **DVC** versions large data alongside Git, so `git checkout` plus `dvc checkout` restores old data. **Evidently** creates drift reports.

### Run it: drift monitoring and a retraining decision

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.pipeline import make_pipeline
from placement_predict import FEATURES, NUMERIC, load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
model = make_pipeline(preprocessor(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)

def psi(reference, production, bins=10):
    reference, production = reference[~np.isnan(reference)], production[~np.isnan(production)]
    edges = np.unique(np.quantile(reference, np.linspace(0, 1, bins + 1)))
    edges[0], edges[-1] = -np.inf, np.inf
    e = np.clip(np.histogram(reference, edges)[0] / len(reference), 1e-4, None)
    a = np.clip(np.histogram(production, edges)[0] / len(production), 1e-4, None)
    return float(np.sum((a - e) * np.log(a / e)))

def psi_report(reference_df, production_df, num_cols, threshold=0.2):
    rows = [{"feature": c, "PSI": psi(reference_df[c].to_numpy(dtype=float), production_df[c].to_numpy(dtype=float))} for c in num_cols]
    report = pd.DataFrame(rows)
    report["status"] = np.where(report["PSI"] > threshold, "DRIFTED", "STABLE")
    print(f"{(report['status'] == 'DRIFTED').sum()} drifted, {(report['status'] == 'STABLE').sum()} stable")
    return report.sort_values("PSI", ascending=False)

next_year = load_data(n=750, seed=7)
print("A new cohort with no real change")
print(psi_report(X_train, next_year[FEATURES], NUMERIC).head(3).round(3).to_string(index=False))

drifted = next_year.copy()
rng = np.random.default_rng(1)
drifted["CodingScore"] = np.clip(drifted["CodingScore"] + 15, 0, 100)
drifted["Internships"] = drifted["Internships"] + rng.poisson(1, len(drifted))
# Recruiters' tastes have changed: projects now matter far more than they did.
new_score = -1 + 0.9 * (drifted["Projects"] - 2) + 0.03 * (drifted["CodingScore"] - 73)
drifted["PlacementStatus"] = (rng.random(len(drifted)) < 1 / (1 + np.exp(-new_score))).astype(int)
print("\nA cohort with simulated drift")
print(psi_report(X_train, drifted[FEATURES], NUMERIC).head(3).round(3).to_string(index=False))

def retrain_if_drifted(report, model, X_new, y_new, X_check, y_check, min_gain=0.0):
    if not (report["status"] == "DRIFTED").any():
        print("No drift: keep the current model")
        return model
    candidate = make_pipeline(preprocessor(), LogisticRegression(max_iter=1000)).fit(X_new, y_new)
    old = roc_auc_score(y_check, model.predict_proba(X_check)[:, 1])
    new = roc_auc_score(y_check, candidate.predict_proba(X_check)[:, 1])
    print(f"Quality gate on fresh data: current AUC {old:.3f}, candidate AUC {new:.3f}")
    return candidate if new > old + min_gain else model

half = len(drifted) // 2
new_model = retrain_if_drifted(psi_report(X_train, drifted[FEATURES], NUMERIC), model,
                               drifted[FEATURES][:half], drifted["PlacementStatus"][:half],
                               drifted[FEATURES][half:], drifted["PlacementStatus"][half:])
print("Decision:", "swap in the new model" if new_model is not model else "keep the current model")

plt.figure(figsize=(6, 3))
plt.hist(X_train["CodingScore"], bins=30, density=True, alpha=0.6, label="training", color="#0f766e")
plt.hist(drifted["CodingScore"], bins=30, density=True, alpha=0.6, label="production", color="#c2410c")
plt.xlabel("CodingScore"); plt.title("Data drift"); plt.legend()
plt.show()
```

### On your own computer: MLflow and DVC

Install with `python -m pip install mlflow`. This records three runs, and then you can compare them with `mlflow ui`.

```py
import mlflow
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.pipeline import make_pipeline
from placement_predict import load_data, preprocessor, train_val_test

X_train, X_val, _, y_train, y_val, _ = train_val_test(load_data())
mlflow.set_tracking_uri("sqlite:///mlflow.db")
mlflow.set_experiment("placement-predict")
for C in [0.01, 0.1, 1.0]:
    with mlflow.start_run():
        model = make_pipeline(preprocessor(), LogisticRegression(C=C, max_iter=1000)).fit(X_train, y_train)
        auc = roc_auc_score(y_val, model.predict_proba(X_val)[:, 1])
        mlflow.log_param("C", C)
        mlflow.log_metric("val_auc", auc)
        print(C, round(auc, 4))
```

DVC is run from the command line, inside a Git repository:

```bash
dvc init
dvc add data/placement_predict.csv
git add data/placement_predict.csv.dvc .gitignore
git commit -m "Track the dataset"
```

### Common mistakes

- **Monitoring only the service.** A healthy API can give wrong answers.
- **Retraining automatically with no gate.** You could replace a good model with a bad one.
- **Trusting PSI alone.** It sees P(X) only. Concept drift needs true outcomes.

### Problems

1. Expected shares 0.6, 0.4, actual 0.5, 0.5. Calculate the PSI, and read it.
2. Which drift is it? (a) More students take CSE. (b) Recruiters start valuing projects more. (c) Fewer offers overall.
3. **Skill 23:** write `psi_report` as above, with a summary line.
4. **Skill 24:** write `retrain_pipeline`, which logs retraining decisions.
5. How long might you wait for true placement labels, and what do you monitor until then?
