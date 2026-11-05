---
title: "K-means clustering: Lloyd's algorithm, K-means++ and mini-batch"
keywords: "kmeans elbow silhouette inertia unsupervised segmentation"
topic: 13
co: "CO4"
description: "Hide the placement labels and look for natural groups of students. K-means finds them by alternating two simple steps, and we judge the result without any answers."
outcomes: ["Run Lloyd's algorithm by hand", "Explain K-means++ and mini-batch K-means", "Choose k with the elbow and silhouette methods", "Describe clusters with a profile table"]
reading: ["Textbook 1, Ch. 9, pp. 295–316", "Textbook 3, Ch. 12, pp. 497–530"]
---

### Intuition

Forget the labels. Are there kinds of student: strong all round, strong coders with few other activities, and so on? K-means is the simplest way to look. You revisit it here from CFAI, now with the production details: initialisation, scale and choosing k.

### How it works

**Lloyd's algorithm:**

```text
choose k starting centroids
repeat until nothing changes:
    assign each point to its nearest centroid
    move each centroid to the mean of its points
```

It reduces the **inertia**, the sum of squared distances to the assigned centroid, at each step. It reaches a local minimum, not necessarily the best one.

**Worked.** Points 1, 2, 9, 10, with centroids 1 and 2. First assignment: {1} and {2, 9, 10}. New centroids: 1 and 7. Next: {1, 2} and {9, 10}. New centroids: 1.5 and 9.5, and then nothing changes. Inertia = 0.25 × 4 = 1.

**K-means++** spreads the initial centroids. Choose the first at random, and each next one with probability proportional to its squared distance from the nearest chosen centroid. This reduces bad starts.

**Mini-batch K-means** updates using small random samples. It's much faster on very large data, and slightly worse in inertia. On our 5,000 rows, it may show no speed gain at all.

**Choosing k:**

| Method | Look for | Note |
| --- | --- | --- |
| Elbow | Where inertia stops falling quickly | Inertia always falls as k rises |
| Silhouette, s = (b − a) / max(a, b) | The highest average | From −1 to 1 |

Here a is the mean distance to the point's own cluster, and b is the mean distance to the nearest other cluster.

### Run it: finding groups of students

```python
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.impute import SimpleImputer
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
from placement_predict import NUMERIC, load_data

df = load_data()
X = SimpleImputer(strategy="median").fit_transform(df[NUMERIC])
X_scaled = StandardScaler().fit_transform(X)

def cluster_pipeline(X_scaled, k_range):
    rows, labels = [], {}
    for k in k_range:
        km = KMeans(n_clusters=k, n_init=5, random_state=0).fit(X_scaled)
        labels[k] = km.labels_
        rows.append({"K": k, "inertia": km.inertia_, "silhouette": silhouette_score(X_scaled, km.labels_, sample_size=1500, random_state=0)})
    return labels, pd.DataFrame(rows)

labels, summary = cluster_pipeline(X_scaled, range(2, 9))
print(summary.round(3).to_string(index=False))

for name, algo in [("KMeans", KMeans(4, n_init=5, random_state=0)), ("MiniBatch", MiniBatchKMeans(4, n_init=5, random_state=0))]:
    start = time.perf_counter()
    algo.fit(X_scaled)
    print(f"{name:10} {time.perf_counter() - start:.3f} s, inertia {algo.inertia_:.0f}")

profile = pd.DataFrame(X, columns=NUMERIC).assign(cluster=labels[4], Placed=df["PlacementStatus"].to_numpy())
print("\nCluster profiles for k = 4 (placement was not used in clustering)")
print(profile.groupby("cluster")[["CGPA", "CodingScore", "AptitudeScore", "Internships", "Backlogs", "Placed"]].mean().round(2))

fig, ax = plt.subplots(1, 2, figsize=(10, 3.1))
ax[0].plot(summary["K"], summary["inertia"], "o-", color="#0f766e"); ax[0].set(title="Elbow", xlabel="k", ylabel="inertia")
ax[1].plot(summary["K"], summary["silhouette"], "o-", color="#c2410c"); ax[1].set(title="Silhouette", xlabel="k")
plt.tight_layout()
plt.show()
```

Real student data rarely forms clean blobs, so the elbow is soft and the silhouette scores are modest. Say that honestly, rather than presenting the clusters as natural kinds of people.

**Try this:** remove the `StandardScaler` step. Which feature now decides the clusters?

### Common mistakes

- **Not scaling.** A large-valued feature decides everything.
- **Clustering and then treating the groups as facts.** K-means always returns k groups, even from noise.
- **Using one random start.** Use several, or K-means++ with `n_init`.

### Problems

1. Run Lloyd's algorithm by hand on 2, 4, 10, 12 with starting centroids 2 and 4.
2. A point has a = 2 and b = 8. Find its silhouette.
3. **Lab 9:** write `cluster_pipeline` as above, and plot both curves.
4. Name each of the 4 clusters shown in the profile table.
5. Why does K-means do badly on two interlocking crescent shapes?
