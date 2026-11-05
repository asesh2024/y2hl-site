---
title: "K-means clustering in practice"
keywords: "kmeans elbow silhouette"
topic: 34
co: "CO5"
description: "Put k-means to work on real measurements. Choose k with the elbow and silhouette methods, and judge clusters when there are no labels."
outcomes: ["Cluster data with scikit-learn's KMeans", "Choose k using inertia (elbow) and the silhouette score", "Explain why several restarts are needed", "Visualise clusters and interpret them"]
reading: ["Textbook 1, §6.12 The EM algorithm (k-means)", "Textbook 2, Ch. on unsupervised learning", "Topic 13 of this course"]
---

### Intuition

Topic 13 derived k-means. Here we use it, and face the question it leaves open: there are no labels, so how do you know your clusters are any good, and how many should there be?

### How it works

**Inertia** is the total squared distance from points to their cluster means, which k-means minimises. It always falls as k rises, so it cannot choose k by itself. Look for the **elbow**, the point where adding a cluster stops helping much.

**Silhouette score** compares how close a point is to its own cluster (a) with how close it is to the nearest other cluster (b):

```text
s = (b − a) / max(a, b)
```

It runs from −1 to 1, and higher is better. Average it over all the points and choose the k with the highest value.

**Worked silhouette.** With a = 2 and b = 8: s = (8 − 2)/8 = 0.75, so this point is well placed.

**Restarts.** A bad start can give a bad result. `n_init=10` runs 10 starts and keeps the lowest inertia. `k-means++` spreads the starting means apart.

**K-means assumes** roughly round clusters of similar size. It struggles with long or curved shapes, and with outliers, so plot the result.

### Run it: finding k on the iris measurements

The flower species are known here, but we hide them from the algorithm and use them only to check at the end.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import load_iris
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X = StandardScaler().fit_transform(iris.data)

print(" k   inertia   silhouette")
inertias = []
for k in range(1, 8):
    model = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    inertias.append(model.inertia_)
    sil = silhouette_score(X, model.labels_) if k > 1 else float("nan")
    print(f"{k:2}   {model.inertia_:7.1f}   {sil:10.3f}")

model = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
print("\nClusters against the hidden species")
print(pd.crosstab(iris.target_names[iris.target], model.labels_, rownames=["species"], colnames=["cluster"]))

fig, ax = plt.subplots(1, 2, figsize=(10, 3.4))
ax[0].plot(range(1, 8), inertias, "o-", color="#0f766e")
ax[0].set(title="Elbow plot", xlabel="k", ylabel="inertia")
ax[1].scatter(X[:, 2], X[:, 3], c=model.labels_, cmap="viridis", s=18)
ax[1].scatter(model.cluster_centers_[:, 2], model.cluster_centers_[:, 3], c="red", marker="X", s=120)
ax[1].set(title="Clusters for k = 3", xlabel="petal length (scaled)", ylabel="petal width (scaled)")
plt.tight_layout()
plt.show()
```

The silhouette score favours k = 2, because two of the species overlap heavily, while the elbow suggests 2 or 3. Neither method is an oracle, and using what you know about the domain is legitimate.

**Try this:** replace the data with `sklearn.datasets.make_moons(200, noise=0.05, random_state=0)[0]`. K-means splits the two moons badly. Why?

### Common mistakes

- **Using k-means without scaling.** A large-valued feature decides everything.
- **Choosing k from inertia alone.** It always falls as k rises.
- **Assuming clusters must mean something real.** K-means always returns k groups, even in pure noise.

### Problems

1. Calculate the silhouette for a point with a = 4 and b = 4. What does this result mean?
2. Run the program without `StandardScaler`. Compare the cross-tabulation.
3. Set `n_init=1` and try several values of `random_state`. Do you see worse inertia?
4. Cluster the `load_wine` data, and interpret each cluster using its mean values.
5. Give a business use for clustering, and explain how you would judge the result.
