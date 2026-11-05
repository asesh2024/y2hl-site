---
title: "Revision: the whole PlacementPredict pipeline, end to end"
keywords: "revision registry ece end to end demo"
topic: 25
co: "CO6"
description: "Bring the term together. Train several models, log every run, register the best, deploy it, answer requests, and watch for drift, in one program."
outcomes: ["Run the lifecycle from data to monitoring", "Log parameters, AUC and calibration error per run", "Register the best model as Production", "Trace one prediction back through every stage"]
reading: ["Reference book 2, Ch. 8, pp. 247–286; Ch. 9, pp. 287–318", "Reference book 4, Ch. 7, pp. 163–196; Ch. 8, pp. 197–228"]
---

### Intuition

On day one, you sent a request to a service you couldn't explain. Now trace it back: the response came from a registered model, chosen by a validated experiment, trained on a pipeline fitted to versioned data. Everything has a reason.

### How it works

| Step | Topic | Evidence you should keep |
| --- | --- | --- |
| Data loaded and validated | 4 | Row counts, schema checks |
| Features fitted on training data | 8, 22 | The saved pipeline |
| Models compared | 5–12 | A results table |
| Evaluated honestly | 17–20 | AUC, ECE, significance test |
| Packaged and served | 23 | Model file, API test |
| Monitored | 24 | PSI report |
| Retrained when needed | 24 | Gate decision |

**Exam checklist.** Can you explain:

- skew, and how a pipeline prevents it?
- why a test set stays hidden?
- why L1 gives zeros?
- bagging against boosting?
- when ROC-AUC misleads?
- PSI, and what it misses?

**In MLflow's model registry**, you would log hyperparameters, validation AUC, calibration ECE and the ONNX file for each run, then assign the best model the Production alias. The program below does the same with a small tracker, so it can run here.

### Run it: the end-to-end demo

```python
import io
import json
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from placement_predict import FEATURES, NUMERIC, load_data, preprocessor, train_val_test

def ece(y, p, bins=10):
    index = np.clip((p * bins).astype(int), 0, bins - 1)
    return sum(abs(p[index == b].mean() - y[index == b].mean()) * (index == b).mean() for b in range(bins) if (index == b).any())

class Tracker:
    """A small stand-in for MLflow."""
    def __init__(self):
        self.runs, self.production = [], None
    def log(self, name, params, model, auc, calibration):
        self.runs.append({"run": len(self.runs) + 1, "name": name, "params": str(params), "val_auc": auc, "val_ece": calibration, "model": model})
    def promote_best(self):
        self.production = max(self.runs, key=lambda r: r["val_auc"])
        return self.production

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
print(f"1 Data: {len(df)} rows, {df['PlacementStatus'].mean():.0%} placed")

# Each model is a pair: a fitted feature pipeline and a classifier. They always travel together.
def fit_pair(prep, clf):
    prep.fit(X_train)
    clf.fit(prep.transform(X_train), y_train)
    return prep, clf

def probability(pair, X):
    prep, clf = pair
    return clf.predict_proba(prep.transform(X))[:, 1]

candidates = [
    ("LogisticRegression", {"C": 1.0}, preprocessor(), LogisticRegression(C=1.0, max_iter=1000)),
    ("RandomForest", {"n_estimators": 150}, preprocessor(scale=False), RandomForestClassifier(150, random_state=0, n_jobs=1)),
    ("XGBoost", {"max_depth": 3, "eta": 0.1}, preprocessor(scale=False), xgb.XGBClassifier(n_estimators=150, max_depth=3, learning_rate=0.1, n_jobs=1, random_state=0)),
]
tracker = Tracker()
for name, params, prep, clf in candidates:
    pair = fit_pair(prep, clf)
    p = probability(pair, X_val)
    tracker.log(name, params, pair, roc_auc_score(y_val, p), ece(y_val.to_numpy(), p))
print("2 Experiments:")
print(pd.DataFrame(tracker.runs).drop(columns="model").round(4).to_string(index=False))

best = tracker.promote_best()
print(f"3 Registered as Production: run {best['run']}, {best['name']}")
print(f"4 Final test AUC, measured once: {roc_auc_score(y_test, probability(best['model'], X_test)):.4f}")

file = io.BytesIO()
joblib.dump(best["model"], file)
file.seek(0)
served = joblib.load(file)
print(f"5 Packaged: {len(file.getvalue()) / 1024:.0f} KB")

def predict_endpoint(body):
    request = json.loads(body)
    row = pd.DataFrame([request]).reindex(columns=FEATURES).astype({c: float for c in NUMERIC})
    p = float(probability(served, row)[0])
    return json.dumps({"placed_probability": round(p, 3), "prediction": "Placed" if p >= 0.5 else "Not placed", "model_run": best["run"]})

print("6 Request:", predict_endpoint('{"CollegeTier": "Tier2", "Stream": "CS", "Hostel": "No", "HistoryOfBacklogs": "No", "Specialisation": "AI", "CGPA": 8.2, "CodingTestScore": 78, "AptitudeTestScore": 70, "Internships": 1, "MockInterviewScore": 66}'))

live = X_test.copy()
live["CodingTestScore"] = (live["CodingTestScore"] + 12).clip(upper=100)
reference, current = X_train["CodingTestScore"].dropna(), live["CodingTestScore"].dropna()
edges = np.quantile(reference, np.linspace(0, 1, 11))
edges[0], edges[-1] = -np.inf, np.inf
e = np.clip(np.histogram(reference, edges)[0] / len(reference), 1e-4, None)
a = np.clip(np.histogram(current, edges)[0] / len(current), 1e-4, None)
psi = float(np.sum((a - e) * np.log(a / e)))
print(f"7 Monitoring: PSI of CodingTestScore = {psi:.3f}, so {'retrain' if psi > 0.2 else 'keep watching'}")
```

**Try this:** add a fourth candidate with LightGBM. Does the Production choice change? Then trace its run back through the tracker.

### Common mistakes

- **Choosing the production model by test score.** Select on validation, then report test once.
- **Ignoring calibration when people read the probability.** Look at ECE as well as AUC.
- **Treating deployment as the end.** It's where monitoring starts.

### Problems

1. Trace a single request by hand through the 7 stages of this program.
2. Why is the final test AUC often a little lower than the validation AUC?
3. **Lab 13:** write `end_to_end_check(model_path, data_path, n_batch=20)`, as in Topic 23.
4. Write a one-page design note for PlacementPredict: data, model, metrics, serving and monitoring.
5. Explain the system to a placement officer in a few sentences, with no jargon.
