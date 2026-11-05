---
title: "Logistic regression with gradient descent"
keywords: "sigmoid"
topic: 29
co: "CO5"
description: "Bend the straight line through a sigmoid to get a probability, then train it by gradient descent. This is one neuron, and the entry point to neural networks."
outcomes: ["Explain why a sigmoid gives a probability", "Write the logistic loss and its gradient", "Implement batch gradient descent with NumPy", "Compare your model with scikit-learn's", "Draw the decision boundary"]
reading: ["Textbook 1, §6.5 Maximum likelihood hypotheses for predicting probabilities", "Textbook 2, Ch. on logistic regression and neurons", "Topic 9 of this course"]
---

### Intuition

Linear regression can predict 1.7 or −0.4, which makes no sense as a probability. Pass the same score through the sigmoid, and every output lies between 0 and 1. The boundary is still a straight line, but the far-away points that spoiled topic 28 no longer tilt it.

### How it works

```text
p = σ(w₀ + w₁x₁ + … + wₙxₙ)
Loss = −(1/n) Σ [ y ln p + (1 − y) ln(1 − p) ]
∂Loss/∂wⱼ = −(1/n) Σ (y − p) xⱼ
wⱼ ← wⱼ + η (1/n) Σ (y − p) xⱼ
```

This is the gradient rule from topic 9, averaged over the data. The boundary is where p = 0.5, which is where the weighted sum equals 0.

**Reading the weights.** A weight is the change in the log odds per unit of that input. Bigger weights mean a steeper curve, not necessarily a more important feature, unless the features are on the same scale. So standardise first.

**A worked prediction.** With w₀ = −4 and w₁ = 2 at x = 2.5: the sum is 1, and p = σ(1) = 0.731.

**The optimiser and the model are separate things.** Logistic regression is the model. Gradient descent is one way to fit it, and scikit-learn uses a faster solver by default.

### Run it: logistic regression from scratch

This uses a real medical dataset, with two features so that we can draw the boundary.

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

data = load_breast_cancer()
names = ["mean radius", "mean texture"]
X = data.data[:, [list(data.feature_names).index(n) for n in names]]
y = data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

scale = StandardScaler().fit(X_train)
X_train, X_test = scale.transform(X_train), scale.transform(X_test)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def add_bias(X):
    return np.hstack([np.ones((len(X), 1)), X])

A, w = add_bias(X_train), np.zeros(3)
eta, losses = 0.1, []
for step in range(2001):
    p = sigmoid(A @ w)
    loss = -np.mean(y_train * np.log(p) + (1 - y_train) * np.log(1 - p))
    losses.append(loss)
    w += eta * A.T @ (y_train - p) / len(y_train)
    if step in (0, 10, 100, 500, 2000):
        print(f"step {step:4}: loss = {loss:.4f}")

accuracy = ((sigmoid(add_bias(X_test) @ w) > 0.5) == y_test).mean()
print(f"\nOur model:     test accuracy {accuracy:.3f}, weights {np.round(w, 3)}")
sk = LogisticRegression(C=1e6).fit(X_train, y_train)
print(f"scikit-learn:  test accuracy {sk.score(X_test, y_test):.3f}, "
      f"weights {np.round(np.r_[sk.intercept_, sk.coef_[0]], 3)}")

fig, ax = plt.subplots(1, 2, figsize=(10, 3.4))
ax[0].plot(losses, color="#0f766e")
ax[0].set(title="Loss during training", xlabel="step", ylabel="loss")
ax[1].scatter(*X_test[y_test == 0].T, label="malignant", s=14)
ax[1].scatter(*X_test[y_test == 1].T, label="benign", s=14)
xs = np.array([-2.5, 3])
ax[1].plot(xs, -(w[0] + w[1] * xs) / w[2], "k--", label="boundary")
ax[1].set(title="Test data and decision boundary", xlabel=names[0] + " (scaled)", ylabel=names[1] + " (scaled)")
ax[1].set_ylim(-3, 4); ax[1].legend()
plt.tight_layout()
plt.show()
```

**Try this:** set `eta` to 5.0 and then 0.001. Look at the loss curve for each one.

### Common mistakes

- **Skipping scaling before gradient descent.** Training becomes very slow, or the loss swings about.
- **Using accuracy alone on imbalanced data.** See precision and recall in topic 30.
- **Thinking the sigmoid makes the boundary curved.** The boundary is still straight, unless you add non-linear features.

### Problems

1. With w₀ = −4 and w₁ = 2, find the x where p = 0.5.
2. Calculate the loss for one example with y = 1 and p = 0.9.
3. Change the program to use all 30 features. What happens to accuracy?
4. Add stochastic updates, using one example at a time, and compare the loss curves.
5. Explain what `C=1e6` is doing in `LogisticRegression`.
