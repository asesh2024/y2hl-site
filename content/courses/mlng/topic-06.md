---
title: "Logistic regression: binary and multinomial"
keywords: "sigmoid softmax cross entropy decision boundary"
topic: 6
co: "CO2"
description: "Squash a score into a probability with the sigmoid, train it with cross-entropy, and extend it to several classes with softmax."
outcomes: ["Explain why regression output is not a probability", "Use the sigmoid and read a decision boundary", "Calculate cross-entropy loss", "Use softmax for multi-class classification", "Interpret learned coefficients"]
reading: ["Textbook 1, Ch. 4, pp. 148–166", "Textbook 3, Ch. 4, pp. 129–174"]
---

### Intuition

To predict placed or not placed, we could fit a line to 0s and 1s, but it would output values like 1.3 and −0.2, which cannot be probabilities. Logistic regression takes the same weighted sum and squashes it into the range 0 to 1.

### How it works

**Binary:**

```text
z = w₀ + w₁x₁ + … + wₙxₙ
p = σ(z) = 1 / (1 + e^(−z))
```

Predict Placed when p ≥ 0.5, which is exactly when z ≥ 0. So the **decision boundary is linear**: z = 0 is a hyperplane.

**Cross-entropy loss:**

```text
Loss = −(1/m) Σ [ y ln p + (1 − y) ln(1 − p) ]
```

Being confidently wrong is punished hard. For y = 1: p = 0.9 costs 0.105, but p = 0.1 costs 2.303. There is no exact formula for the weights, so we use gradient descent. The loss is convex, so there is one minimum.

**Reading the coefficients.** On scaled features, weight w means: one standard deviation more of this feature multiplies the **odds** by e^w. For w = 0.7, the odds roughly double (e^0.7 ≈ 2.01).

**Multinomial (softmax).** For K classes, compute one score zₖ per class, then:

```text
P(class k) = e^(zₖ) / Σⱼ e^(zⱼ)
```

**Worked softmax.** Scores 2, 1, 0: e² = 7.389, e¹ = 2.718, e⁰ = 1, total 11.107. So the probabilities are 0.665, 0.245 and 0.090, which add to 1.

### Run it: binary, then multinomial

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from placement_predict import FEATURES, load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)

def evaluate_classifier(model, X_train, y_train, X_val, y_val, name=""):
    """Fit, then print train and validation accuracy with a full report."""
    model.fit(X_train, y_train)
    print(f"{name}: train accuracy {model.score(X_train, y_train):.3f}, validation accuracy {model.score(X_val, y_val):.3f}")
    print(classification_report(y_val, model.predict(X_val), digits=3))
    return model

model = evaluate_classifier(make_pipeline(preprocessor(), LogisticRegression(max_iter=1000)),
                            X_train, y_train, X_val, y_val, "Binary PlacementStatus")

clf = model[-1]
names = model[0].get_feature_names_out()
weights = pd.Series(clf.coef_[0], index=names).sort_values()
print("Odds multiplier for one standard deviation more")
for name in list(weights.index[-3:][::-1]) + list(weights.index[:2]):
    print(f"  {name:20} {np.exp(weights[name]):.2f}")

print("\nMultinomial: predict CGPA_Tier without using CGPA")
tier_features = [c for c in FEATURES if c not in ("CGPA", "Stream")]
tier = df.dropna(subset=tier_features)
X2, y2 = tier[tier_features], tier["CGPA_Tier"]
split = int(0.8 * len(tier))
scale = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
scale.fit(X2[:split], y2[:split])
print(f"Validation accuracy: {scale.score(X2[split:], y2[split:]):.3f}")
print("Classes:", list(scale.classes_))
print("Probabilities for the first student:", np.round(scale.predict_proba(X2[split:split + 1])[0], 3))

weights.plot.barh(figsize=(6, 4), color="#0f766e", title="Coefficients for placement")
plt.tight_layout()
plt.show()
```

**Try this:** compare `StandardScaler` with unscaled features using `model[-1].n_iter_`, the number of iterations the solver needed.

### Common mistakes

- **Using accuracy alone.** With 65% not placed, always saying "not placed" scores 65%.
- **Thinking 0.5 is always the right threshold.** Topic 18 shows how to choose it.
- **Reading coefficients as causes.** They describe a pattern in this data, not what would happen if you changed a student's score.

### Problems

1. Calculate σ(0), σ(2) and σ(−2).
2. Find the softmax probabilities for scores 1, 1 and 0.
3. A coefficient is −1.2 on scaled `Backlogs`. Describe it in terms of odds.
4. **Lab 4:** write `evaluate_classifier` so that it compares three models in one table.
5. Why is the boundary still linear, though the sigmoid is curved?
