---
title: "Linear regression"
keywords: "ols"
topic: 28
co: "CO5"
description: "Draw the straight line that best fits the data. It is the simplest model there is, a good baseline, and the idea behind much that follows."
outcomes: ["Fit a line by least squares, both by formula and by gradient descent", "Evaluate a regression with MSE and R²", "Build a model with scikit-learn", "Handle missing values before fitting", "Draw the decision boundary when a linear model is used to classify"]
reading: ["Textbook 2, Ch. on linear regression", "Reference book 1, Ch. on parametric methods", "Topic 9 of this course (why least squares)"]
---

### Intuition

Plot hours studied against marks. The points roughly follow a line. Linear regression finds the line that makes the squared vertical distances to the points as small as possible. Topic 9 showed why that choice is sensible: it is the maximum likelihood line under Gaussian noise.

### How it works

**The model and the error:**

```text
ŷ = w₀ + w₁x
MSE = (1/n) Σ (yᵢ − ŷᵢ)²
```

**The formula for one input:**

```text
w₁ = Σ (x − x̄)(y − ȳ) / Σ (x − x̄)²
w₀ = ȳ − w₁ x̄
```

**Worked example.** x = 1, 2, 3 and y = 2, 4, 5. Then x̄ = 2 and ȳ = 11/3.

```text
Σ (x − x̄)(y − ȳ) = (−1)(−5/3) + 0 + (1)(4/3) = 3
Σ (x − x̄)² = 2
w₁ = 1.5    w₀ = 11/3 − 3 = 0.667
```

**Measuring fit.** R² is the fraction of the variation in y that the model explains. R² = 1 is perfect, and R² = 0 is no better than always predicting the mean.

```text
R² = 1 − Σ (y − ŷ)² / Σ (y − ȳ)²
```

**Using a line to classify.** Fit to labels 0 and 1, and predict class 1 when ŷ > 0.5. The **decision boundary** is where ŷ = 0.5. This works in simple cases, but logistic regression (topic 29) is the proper tool, because a far-away point can tilt the line and move the boundary.

### Run it: three ways to fit the same line

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 40)
y = 30 + 6 * x + rng.normal(0, 6, 40)             # hidden truth: w0 = 30, w1 = 6

# 1. The formula
w1 = np.sum((x - x.mean()) * (y - y.mean())) / np.sum((x - x.mean()) ** 2)
w0 = y.mean() - w1 * x.mean()
print(f"Formula:          w0 = {w0:.3f}, w1 = {w1:.3f}")

# 2. Gradient descent
a, b = 0.0, 0.0
for _ in range(20000):
    error = y - (a + b * x)
    a += 0.01 * error.mean()
    b += 0.01 * (error * x).mean()
print(f"Gradient descent: w0 = {a:.3f}, w1 = {b:.3f}")

# 3. scikit-learn
model = LinearRegression().fit(x.reshape(-1, 1), y)
pred = model.predict(x.reshape(-1, 1))
print(f"scikit-learn:     w0 = {model.intercept_:.3f}, w1 = {model.coef_[0]:.3f}")
print(f"MSE = {mean_squared_error(y, pred):.2f}, R2 = {r2_score(y, pred):.3f}")

plt.figure(figsize=(5.5, 3.5))
plt.scatter(x, y, color="#0f766e", label="data")
line = np.array([0, 10])
plt.plot(line, w0 + w1 * line, color="#c2410c", label="fitted line")
plt.xlabel("hours"); plt.ylabel("marks"); plt.legend()
plt.show()
```

### Run it: missing values, then a decision boundary

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression

df = pd.DataFrame({
    "hours": [1, 2, np.nan, 4, 5, 6, np.nan, 8, 9, 10],
    "marks": [35, 40, 48, np.nan, 60, 66, 70, 78, np.nan, 92],
})
print("Missing:", df.isna().sum().to_dict())

complete = df.dropna()
print("Rows kept if we drop gaps:", len(complete), "of", len(df))
filled = SimpleImputer(strategy="median").fit_transform(df)
print("Rows kept if we fill gaps:", len(filled))

drop_fit = LinearRegression().fit(complete[["hours"]], complete["marks"])
print(f"Dropping rows: marks = {drop_fit.intercept_:.2f} + {drop_fit.coef_[0]:.2f} x hours")
fill_fit = LinearRegression().fit(filled[:, [0]], filled[:, 1])
print(f"Filling gaps:  marks = {fill_fit.intercept_:.2f} + {fill_fit.coef_[0]:.2f} x hours")

# Classification with a linear model, and its boundary
rng = np.random.default_rng(1)
A = rng.normal([2, 2], 0.8, (30, 2))
B = rng.normal([5, 5], 0.8, (30, 2))
X = np.vstack([A, B]); y = np.array([0] * 30 + [1] * 30)
m = LinearRegression().fit(X, y)
print("Training accuracy of the thresholded line:", ((m.predict(X) > 0.5) == y).mean())

x1 = np.array([0, 7])
x2 = (0.5 - m.intercept_ - m.coef_[0] * x1) / m.coef_[1]      # where w0 + w1 x1 + w2 x2 = 0.5
plt.figure(figsize=(5, 3.5))
plt.scatter(*A.T, label="class 0"); plt.scatter(*B.T, label="class 1")
plt.plot(x1, x2, "k--", label="boundary (prediction = 0.5)")
plt.ylim(0, 7); plt.legend()
plt.show()
```

Notice that filling with the median pulls the line flatter than dropping rows does. Filling is not free: it invents values that are not on the trend.

### Common mistakes

- **Extrapolating far beyond the data.** The line says nothing reliable out there.
- **Trusting R² alone.** Always plot the fit, since very different data can have the same R².
- **Forgetting that one outlier can tilt the whole line.** Squared error gives it a lot of weight.

### Problems

1. Fit a line by hand to (1, 1), (2, 3) and (3, 5). What are w₀ and w₁?
2. Calculate MSE and R² for predictions 2, 4 and 6 against targets 2, 5 and 5.
3. Add an extreme outlier to the first program, and see how much the line moves.
4. Extend the model with a second input, using `LinearRegression`.
5. In the classification program, add a far-away class 1 point at (30, 30). What happens to the boundary?
