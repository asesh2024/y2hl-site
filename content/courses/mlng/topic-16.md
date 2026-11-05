---
title: "Anomaly detection and cluster features"
keywords: "isolation forest oneclasssvm autoencoder outlier contamination"
topic: 16
co: "CO4"
description: "Some records simply do not fit. Find them with Isolation Forest, decide what to do about them, and use clusters as extra features for a supervised model."
outcomes: ["Explain how Isolation Forest isolates outliers", "Tune and evaluate contamination", "Know when One-Class SVM and autoencoders apply", "Decide what to do with anomalous records", "Add cluster features to a supervised model"]
reading: ["Textbook 1, Ch. 9, pp. 295–316", "Textbook 3, Ch. 12, pp. 497–530"]
---

### Intuition

A student has a CGPA of 9.8, seven backlogs and 45% attendance. Could that be real? Could it be a data entry mistake? Anomaly detection flags records like this for someone to look at. Our data has a hidden `IsAnomaly` column, so we can check how well the detector does, which you can rarely do in real work.

### How it works

**Isolation Forest.** Build many random trees with random splits. An outlier is far from everything, so few splits are needed to isolate it. A **short average path means an anomaly**.

**Key setting:** `contamination`, the share of data you expect to be anomalous. It sets the threshold on the score.

| Method | Idea | Note |
| --- | --- | --- |
| Isolation Forest | Outliers are easy to isolate | Fast, and a good default |
| One-Class SVM | Fence around the normal data | Slower, and sensitive to settings |
| DBSCAN | Points far from any dense region | Topic 14 |
| Autoencoder (preview) | Normal data rebuilds well; anomalies don't | Deep dive in DLAC |

**What to do with an anomaly?**

| Finding | Action |
| --- | --- |
| Data entry error | Correct or remove it |
| Rare but real | Keep it. The model must handle it |
| Pipeline fault | Fix the pipeline |

**Evaluating.** Anomalies are rare, so accuracy is useless: label everything normal and you score 98%. Use precision, recall and F1.

**Worked.** 100 flagged, 15 true anomalies among them, 20 anomalies overall. Precision = 15/100 = 0.15, and recall = 15/20 = 0.75.

**Cluster features.** A cluster label, or the distances to each centroid, can be added as new features to a supervised model. Fit the clustering on **training data only**. It sometimes helps linear models, by giving them non-linear information, and it helps tree models less.

### Run it: find the anomalies, and add cluster features

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM
from placement_predict import NUMERIC, load_data, preprocessor, train_val_test

df = load_data()
S = StandardScaler().fit_transform(SimpleImputer(strategy="median").fit_transform(df[NUMERIC]))
truth = df["IsAnomaly"].to_numpy()
print(f"True anomalies: {truth.sum()} of {len(truth)}. Saying 'normal' for all would score {1 - truth.mean():.1%} accuracy.")

def anomaly_benchmark(S, truth, contamination_values):
    rows = []
    for c in contamination_values:
        flagged = IsolationForest(n_estimators=200, contamination=c, random_state=0, n_jobs=1).fit_predict(S) == -1
        rows.append({"contamination": c, "precision": precision_score(truth, flagged), "recall": recall_score(truth, flagged), "F1": f1_score(truth, flagged)})
    return pd.DataFrame(rows).sort_values("F1", ascending=False)

print(anomaly_benchmark(S, truth, [0.005, 0.01, 0.02, 0.05, 0.1]).round(3).to_string(index=False))

sample = S[:2000]
flagged = OneClassSVM(nu=0.02, gamma="scale").fit_predict(sample) == -1
print(f"\nOne-Class SVM on 2000 rows: precision {precision_score(truth[:2000], flagged):.3f}, recall {recall_score(truth[:2000], flagged):.3f}")

scores = IsolationForest(n_estimators=200, random_state=0, n_jobs=1).fit(S).score_samples(S)
plt.figure(figsize=(6, 3))
plt.hist(scores[truth == 0], bins=40, density=True, alpha=0.7, label="normal", color="#0f766e")
plt.hist(scores[truth == 1], bins=20, density=True, alpha=0.7, label="anomaly", color="#c2410c")
plt.xlabel("Isolation Forest score (lower means more unusual)"); plt.legend()
plt.show()

X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
prep = preprocessor().fit(X_train)
A, B = prep.transform(X_train), prep.transform(X_val)
km = KMeans(6, n_init=5, random_state=0).fit(A)
base = LogisticRegression(max_iter=1000).fit(A, y_train)
extra = LogisticRegression(max_iter=1000).fit(np.c_[A, km.transform(A)], y_train)
print(f"\nValidation AUC, original features: {roc_auc_score(y_val, base.predict_proba(B)[:, 1]):.4f}")
print(f"Validation AUC, with distances to clusters: {roc_auc_score(y_val, extra.predict_proba(np.c_[B, km.transform(B)])[:, 1]):.4f}")
```

**Try this:** remove all flagged rows from the training data, then retrain. Does validation accuracy improve, or do you lose useful rare cases?

### Common mistakes

- **Using accuracy to judge a detector.** The rare class must be measured directly.
- **Automatically deleting all outliers.** Rare and real cases may be what matters most.
- **Fitting clusters on all the data.** That leaks validation information into the features.

### Problems

1. 50 flagged, 30 true, 40 anomalies overall. Find precision, recall and F1.
2. Why does an outlier have a short path in Isolation Forest?
3. **Skill 15:** write `anomaly_benchmark` as above, sorted by F1.
4. Compare distances against a one-hot cluster label as features.
5. A flagged student has real, unusual results. What should the team do, and why?
