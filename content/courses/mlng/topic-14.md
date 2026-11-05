---
title: "Hierarchical clustering and DBSCAN"
keywords: "dendrogram linkage ward density epsilon minpts core border noise"
topic: 14
co: "CO4"
description: "Two alternatives to K-means. Hierarchical clustering builds a whole tree of groupings, and DBSCAN finds dense regions of any shape and sets outliers aside."
outcomes: ["Explain agglomerative clustering and the linkage choices", "Read a dendrogram and cut it", "Define core, border and noise points", "Choose epsilon from a k-distance plot", "Compare K-means and DBSCAN on non-convex data"]
reading: ["Textbook 1, Ch. 9, pp. 316–328", "Textbook 2, Ch. 14, pp. 501–528"]
---

### Intuition

K-means needs you to choose k, and it expects round clusters. Hierarchical clustering puts off the choice of k: it merges groups step by step, and you decide later where to cut. DBSCAN thinks differently: a cluster is a crowded region, whatever its shape, and anyone far from a crowd is noise.

### How it works

**Agglomerative clustering.** Start with each point alone, then repeatedly merge the two closest clusters.

| Linkage | Distance between clusters | Character |
| --- | --- | --- |
| Single | Closest pair | Follows chains, sensitive to noise |
| Complete | Farthest pair | Compact clusters |
| Average | Mean of all pairs | In between |
| Ward | Merge that adds least variance | Even-sized, compact; a common default |

**A dendrogram** shows every merge, and its height is the merge distance. Cut it horizontally, and the number of branches you cross is the number of clusters. A long vertical gap suggests a natural cut.

**Worked, single linkage.** Points 1, 2, 6, 7, 20. Merge {1,2} at 1, {6,7} at 1, those two groups at 4 (2 to 6), and 20 last at 13 (7 to 20).

**DBSCAN** has two settings, ε (radius) and minPts:

| Point | Meaning |
| --- | --- |
| **Core** | At least minPts points within ε, counting itself |
| **Border** | Within ε of a core point, but not core |
| **Noise** | Neither |

Clusters grow by connecting core points that are within ε of each other. It finds the number of clusters by itself.

**Choosing ε.** Plot each point's distance to its k-th nearest neighbour, sorted. Use the height of the sharp bend.

| | K-means | Hierarchical | DBSCAN |
| --- | --- | --- | --- |
| Choose k first? | Yes | At the cut | No |
| Cluster shape | Round | Depends on linkage | Any |
| Marks outliers | No | No | Yes |
| Varying density | Fair | Fair | Poor |

### Run it: shapes and students

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import dendrogram, fcluster, linkage
from sklearn.cluster import DBSCAN, AgglomerativeClustering, KMeans
from sklearn.datasets import make_moons
from sklearn.impute import SimpleImputer
from sklearn.metrics import adjusted_rand_score
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from placement_predict import NUMERIC, load_data

X, truth = make_moons(400, noise=0.06, random_state=0)
methods = {"KMeans": KMeans(2, n_init=5, random_state=0), "Ward": AgglomerativeClustering(2, linkage="ward"),
           "Single link": AgglomerativeClustering(2, linkage="single"), "DBSCAN": DBSCAN(eps=0.2, min_samples=5)}
print("Interlocking moons, compared with the true grouping (ARI, 1 is perfect)")
fig, ax = plt.subplots(2, 2, figsize=(10, 6))
ax = ax.ravel()
for i, (name, method) in enumerate(methods.items()):
    labels = method.fit_predict(X)
    print(f"  {name:12} ARI = {adjusted_rand_score(truth, labels):.3f}, clusters = {len(set(labels) - {-1})}")
    ax[i].scatter(*X.T, c=labels, s=8, cmap="viridis"); ax[i].set_title(name)
plt.tight_layout()
plt.show()

df = load_data(n=1500)
S = StandardScaler().fit_transform(SimpleImputer(strategy="median").fit_transform(df[NUMERIC]))
distances = np.sort(NearestNeighbors(n_neighbors=20).fit(S).kneighbors(S)[0][:, -1])
print(f"\nStudents: 20-NN distance at 50% of points {distances[750]:.2f}, 90% {distances[1350]:.2f}, 99% {distances[1485]:.2f}")
print("eps   clusters  noise points")
for eps in [1.5, 2.0, 2.5, 3.0]:
    labels = DBSCAN(eps=eps, min_samples=20).fit_predict(S)
    print(f"{eps:3}   {len(set(labels) - {-1}):8}  {(labels == -1).sum():12}")

Z = linkage(S[:60], method="ward")
print("\nCutting the small dendrogram into 3 clusters gives sizes:", np.bincount(fcluster(Z, 3, "maxclust"))[1:])
fig, ax = plt.subplots(1, 2, figsize=(11, 3.2))
dendrogram(Z, ax=ax[0], no_labels=True, color_threshold=0.7 * Z[:, 2].max()); ax[0].set(title="Ward dendrogram of 60 students", ylabel="merge distance")
ax[1].plot(distances, color="#0f766e"); ax[1].set(title="k-distance plot", xlabel="points, sorted", ylabel="distance to 20th neighbour")
plt.tight_layout()
plt.show()
```

On the students, DBSCAN finds one large crowd plus some outliers, because this data has no dense, separate groups. That is an honest result, and it shows DBSCAN is useful here mainly for spotting unusual records.

**Try this:** change `eps=0.2` in the moons `DBSCAN` to `0.05`, then to `0.5`. Explain what breaks each time.

### Common mistakes

- **Running hierarchical clustering on huge data.** It needs at least n² memory for distances, so sample first.
- **Forgetting to scale.** ε is a distance, so units matter.
- **Treating label −1 as a cluster.** It means noise.

### Problems

1. Using the single linkage example above, list the merge heights for complete linkage.
2. In 1D with ε = 1 and minPts = 3, classify points 1, 2, 3, 3.9 and 10.
3. Why does DBSCAN struggle with clusters of very different density?
4. Cut the dendrogram at k = 5. How do the cluster sizes change?
5. Plot silhouette scores for Ward at k = 2 to 8 on the student data.
