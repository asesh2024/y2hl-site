---
title: "Dimensionality reduction: PCA, t-SNE and UMAP"
keywords: "scree explained variance perplexity n_neighbors min_dist visualisation compression"
topic: 15
co: "CO4"
description: "Sixteen features cannot be plotted. PCA compresses them by keeping the directions of greatest variance. t-SNE and UMAP make maps that keep neighbours together."
outcomes: ["Explain PCA as variance maximisation", "Read a scree plot and choose components", "Show why PCA needs standardisation", "Use t-SNE, and set perplexity", "Set UMAP's n_neighbors and min_dist", "Know what these maps cannot tell you"]
reading: ["Textbook 1, Ch. 8, pp. 265–294", "Textbook 2, Ch. 14, pp. 534–570"]
---

### Intuition

Think of a photograph of a 3D object: a good angle keeps most of its shape. PCA finds the best angle for your data. t-SNE and UMAP instead try to keep each point's neighbours close, even if global distances distort.

### How it works

**PCA.** Find the direction along which the data varies most (PC1), then the next, at right angles, and so on. These are eigenvectors of the covariance matrix, and their eigenvalues give the variance captured:

```text
Explained variance ratio of PCᵢ = λᵢ / Σ λⱼ
```

**Worked.** Eigenvalues 5, 3, 1, 1: PC1 explains 5/10 = 50%, and PC1 and PC2 together explain 80%.

**Always standardise first.** Otherwise the feature with the largest units dominates PC1, because variance depends on units.

**A scree plot** shows the variance per component. Keep components up to the bend, or until a target such as 90%.

| | PCA | t-SNE | UMAP |
| --- | --- | --- | --- |
| Type | Linear | Non-linear | Non-linear |
| Keeps | Global variance | Local neighbours | Local, and more global than t-SNE |
| Transforms new data? | Yes | No, in the basic form | Yes |
| Main settings | Number of components | `perplexity` (5–50) | `n_neighbors`, `min_dist` |
| Use for | Compression, input to models | Plots only | Plots, sometimes as features |

**Reading t-SNE and UMAP plots with care.** Cluster sizes and the gaps between clusters often mean little. Run several settings before believing a pattern, and never quote distances from these maps.

### Run it: PCA and t-SNE on students

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
from placement_predict import NUMERIC, load_data

df = load_data()
X = SimpleImputer(strategy="median").fit_transform(df[NUMERIC])
S = StandardScaler().fit_transform(X)

pca = PCA().fit(S)
ratio = pca.explained_variance_ratio_
print("PC   explained   cumulative")
for i, (r, c) in enumerate(zip(ratio, np.cumsum(ratio)), 1):
    print(f"{i:2}   {r:9.3f}   {c:10.3f}")
print("Components needed for 90%:", np.argmax(np.cumsum(ratio) >= 0.9) + 1)

print("\nWhat points along PC1? (largest loadings)")
for j in np.argsort(-np.abs(pca.components_[0]))[:4]:
    print(f"  {NUMERIC[j]:20} {pca.components_[0][j]:+.2f}")

raw = PCA().fit(X)
print(f"\nWithout scaling, PC1 explains {raw.explained_variance_ratio_[0]:.1%}, and is mostly "
      f"{NUMERIC[np.argmax(np.abs(raw.components_[0]))]}")

idx = np.random.default_rng(0).choice(len(S), 600, replace=False)
colour = df["PlacementStatus"].to_numpy()[idx]
P = pca.transform(S[idx])[:, :2]
fig, ax = plt.subplots(1, 4, figsize=(13, 3))
ax[0].bar(range(1, len(ratio) + 1), ratio, color="#0f766e"); ax[0].set(title="Scree plot", xlabel="component")
ax[1].scatter(*P.T, c=colour, s=6, cmap="coolwarm"); ax[1].set_title("PCA, 2 components")
for i, perplexity in enumerate([5, 40], 2):
    T = TSNE(perplexity=perplexity, init="pca", random_state=0).fit_transform(S[idx])
    ax[i].scatter(*T.T, c=colour, s=6, cmap="coolwarm"); ax[i].set_title(f"t-SNE, perplexity {perplexity}")
plt.tight_layout()
plt.show()
```

### On your own computer: UMAP

UMAP is not available in the browser. Install it with `python -m pip install umap-learn`, and save `placement_predict.py` beside your program. We have not been able to test this particular listing on the site's test machine, so tell us if anything fails.

```py
import umap
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from placement_predict import NUMERIC, load_data

df = load_data(n=1000)
S = StandardScaler().fit_transform(SimpleImputer(strategy="median").fit_transform(df[NUMERIC]))
for n_neighbors, min_dist in [(5, 0.1), (15, 0.1), (50, 0.5)]:
    embedding = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, random_state=0).fit_transform(S)
    print(n_neighbors, min_dist, embedding.shape)
```

### Common mistakes

- **Running PCA without scaling.** The program above shows what happens.
- **Training a model on t-SNE output.** Basic t-SNE can't transform new points.
- **Treating gaps in a t-SNE plot as real clusters.** Check with other settings and other methods.

### Problems

1. Eigenvalues are 6, 2, 1, 1. What does PC1 explain?
2. How many components are needed for 90% in that example?
3. **Lab 10:** write `dim_reduction_dashboard(X_scaled, y_labels, sample_n=1000)`, which draws PCA, t-SNE and UMAP panels (UMAP on your own computer).
4. Train a logistic regression on the first 5 PCs. How much accuracy do you lose against all features?
5. Vary `perplexity` from 2 to 100. At what values does the map stop being useful?
