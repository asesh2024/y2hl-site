---
title: "Linear regression: cost, normal equations and gradient descent"
keywords: "mse ols rmse minibatch hyperplane"
topic: 5
co: "CO2"
description: "Fit a flat surface through the data. There are two routes to the same answer: solve it directly with the normal equations, or walk downhill with gradient descent."
outcomes: ["Write the linear model and MSE cost", "Solve for the weights with the normal equations", "Implement batch and mini-batch gradient descent", "Compare both with scikit-learn"]
reading: ["Textbook 1, Ch. 4, pp. 107–136", "Textbook 2, Ch. 2, pp. 9–16; Ch. 3, pp. 43–99"]
---

### Intuition

Could PlacementPredict also estimate a number, such as a salary? Linear regression says the estimate is a weighted sum of the features. Training means finding the weights that make the errors, on average, as small as possible. With two features the model is a tilted plane, and with more it is a *hyperplane*.

### How it works

**Model and cost:**

```text
ŷ = w₀ + w₁x₁ + … + wₙxₙ = Xw
MSE(w) = (1/m) Σ (ŷᵢ − yᵢ)²
RMSE = √MSE
```

**Route 1: the normal equations.** Setting the gradient to zero gives an exact answer:

```text
w = (XᵀX)⁻¹ Xᵀy
```

Inverting costs roughly n³ in the number of features, so it slows down badly with many features, and it needs all the data in memory.

**Route 2: gradient descent.** The slope of the cost tells you which way is uphill, so step the other way:

```text
∇MSE = (2/m) Xᵀ(Xw − y)
w ← w − η ∇MSE
```

| Variant | Each step uses | Character |
| --- | --- | --- |
| Batch | All rows | Smooth, but slow on big data |
| Stochastic | One row | Noisy and fast |
| Mini-batch | A small group, such as 32 | The usual compromise |

**A worked step.** One feature, w = 0, x = 2, y = 4, η = 0.1. Prediction 0, and gradient = 2 × 2 × (0 − 4) = −16. New w = 0 − 0.1 × (−16) = 1.6.

**Scale first.** With very different feature ranges, the cost surface is a long narrow valley, and gradient descent zigzags. On scaled features, it heads almost straight to the bottom. The normal equations don't need scaling.

### Run it: CGPA regression from scratch

We predict a student's CGPA from their other scores, comparing all three methods.

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from placement_predict import load_data

names = ["AttendancePercent", "AptitudeTestScore", "CodingTestScore", "MockInterviewScore", "Projects"]
df = load_data().dropna(subset=names)
X_train, X_test, y_train, y_test = train_test_split(df[names].to_numpy(), df["CGPA"].to_numpy(), test_size=0.2, random_state=0)

scaler = StandardScaler().fit(X_train)
def design(X):
    return np.c_[np.ones(len(X)), scaler.transform(X)]
A, T = design(X_train), design(X_test)
def rmse(w):
    return np.sqrt(np.mean((T @ w - y_test) ** 2))

normal = np.linalg.solve(A.T @ A, A.T @ y_train)
print(f"Normal equations  RMSE = {rmse(normal):.4f}")

w = np.zeros(A.shape[1])
batch_loss = []
for epoch in range(200):
    w -= 0.1 * 2 / len(A) * A.T @ (A @ w - y_train)
    batch_loss.append(np.mean((A @ w - y_train) ** 2))
print(f"Batch GD          RMSE = {rmse(w):.4f}")

rng = np.random.default_rng(0)
m = np.zeros(A.shape[1])
mini_loss = []
for epoch in range(30):
    order = rng.permutation(len(A))
    for start in range(0, len(A), 32):
        i = order[start:start + 32]
        m -= 0.01 * 2 / len(i) * A[i].T @ (A[i] @ m - y_train[i])
    mini_loss.append(np.mean((A @ m - y_train) ** 2))
print(f"Mini-batch GD     RMSE = {rmse(m):.4f}")

sk = LinearRegression().fit(scaler.transform(X_train), y_train)
print(f"scikit-learn      RMSE = {np.sqrt(mean_squared_error(y_test, sk.predict(scaler.transform(X_test)))):.4f}")

print("\nWeights on scaled features (normal equations)")
for name, value in zip(["(intercept)"] + names, normal):
    print(f"  {name:20} {value:7.3f}")

plt.figure(figsize=(6, 3.2))
plt.plot(batch_loss, label="batch GD (per epoch)", color="#0f766e")
plt.plot(mini_loss, label="mini-batch GD (per epoch)", color="#c2410c")
plt.xlabel("epoch"); plt.ylabel("training MSE"); plt.yscale("log"); plt.legend()
plt.show()
```

**Try this:** remove `scaler.transform` from `design`, leaving the raw values. What happens to batch gradient descent at the same learning rate?

### Common mistakes

- **Forgetting the intercept column.** Without it, the plane must pass through the origin.
- **Fitting the scaler on all the data.** Fit on training data only (Topic 17).
- **Reading raw weights as importance.** Compare weights only when features share a scale.

### Problems

1. Do one more gradient step of the worked example, using w = 1.6.
2. Solve by hand with the normal equation, for x = 1, 2 and y = 2, 4, using no intercept.
3. **Lab 3:** implement mini-batch GD with `batch_size=32` and 1000 epochs, and assert that its RMSE is within 0.3 of scikit-learn's.
4. Why does the normal equation struggle with 100,000 features?
5. Predict `Salary Package` for placed students. Why must you first drop those not placed?
