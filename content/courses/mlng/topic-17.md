---
title: "Evaluation strategy: splits, leakage and cross-validation"
keywords: "train validation test kfold stratified nested cv optimism"
topic: 17
co: "CO5"
description: "A model's score is only as honest as the way you measured it. Keep a test set out of every decision, stop leaks, and use nested cross-validation when tuning."
outcomes: ["Use a three-way split with discipline", "Demonstrate data leakage", "Compare KFold and StratifiedKFold", "Explain and calculate optimism with nested cross-validation"]
reading: ["Textbook 1, Ch. 2, pp. 85–106", "Textbook 3, Ch. 5, pp. 197–224"]
---

### Intuition

A student who sees the exam paper early scores high, and learns little. Models are the same. Any information from the evaluation data that reaches training makes the score look better than the truth.

### How it works

| Split | Used for | Rule |
| --- | --- | --- |
| Training | Fitting weights | |
| Validation | Choosing models and settings | Reusing it wears it out, slowly |
| Test | One final estimate | **Never used in any decision** |

**Leakage** is any path from evaluation data, or from the future, into training:

| Type | Example |
| --- | --- |
| Preprocessing leak | Fitting the scaler before splitting |
| Target leak | Using `SalaryLPA` to predict placement. It exists only if placed! |
| Time leak | Using data from after the prediction date |
| Group leak | The same student's records in both train and test |

**K-fold cross-validation.** Split into k parts, train on k−1, test on the last, and rotate. **Stratified** folds keep the class ratio in each fold.

**Nested cross-validation.** If the same CV both chooses settings and reports the score, the score is too high. An inner loop chooses settings, and an outer loop estimates performance. The difference between the two is the **optimism**.

**Worked.** The best inner score is 0.86, and the nested score is 0.84. Optimism = 0.02.

### Run it: leaks, folds and nesting

```python
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, KFold, StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from placement_predict import load_data, preprocessor, train_val_test

print("A leak you can see: pure noise, 2000 random features, random labels")
rng = np.random.default_rng(0)
X, y = rng.normal(size=(100, 2000)), rng.integers(0, 2, 100)
leaky = SelectKBest(f_classif, k=20).fit_transform(X, y)        # selection saw every row
print(f"  Selected before CV: accuracy {cross_val_score(LogisticRegression(), leaky, y, cv=5).mean():.3f}")
honest = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
print(f"  Selected inside CV: accuracy {cross_val_score(honest, X, y, cv=5).mean():.3f}   (the truth is about 0.5)")

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
model = make_pipeline(preprocessor(), LogisticRegression(max_iter=1000))

print("\nA target leak: adding SalaryLPA as a 'was it recorded' feature")
leak = X_train.assign(HasSalary=df.loc[X_train.index, "SalaryLPA"].notna().astype(float))
print(f"  CV accuracy with the leak: {cross_val_score(make_pipeline(StandardScaler(), LogisticRegression()), leak[['CGPA', 'HasSalary']], y_train, cv=5).mean():.3f}")

print("\nClass balance across folds (rare class: 10% of a small sample)")
small_y = np.array([1] * 12 + [0] * 108)
for name, cv in [("KFold", KFold(5, shuffle=True, random_state=1)), ("Stratified", StratifiedKFold(5, shuffle=True, random_state=1))]:
    print(f"  {name:10}", [round(float(small_y[test].mean()), 2) for _, test in cv.split(small_y, small_y)])

def full_cv_report(estimator, X, y, param_grid, outer_k=5, inner_k=3):
    outer = StratifiedKFold(outer_k, shuffle=True, random_state=0)
    inner = StratifiedKFold(inner_k, shuffle=True, random_state=0)
    plain = cross_val_score(estimator, X, y, cv=outer)
    search = GridSearchCV(estimator, param_grid, cv=inner)
    nested = cross_val_score(search, X, y, cv=outer)
    best = GridSearchCV(estimator, param_grid, cv=outer).fit(X, y).best_score_
    return {"stratified_kfold_mean": plain.mean(), "std": plain.std(), "nested_cv_mean": nested.mean(),
            "non_nested_best": best, "optimism_bias": best - nested.mean()}

sample = df.sample(1200, random_state=0)
report = full_cv_report(model, sample[X_train.columns], sample["PlacementStatus"],
                        {"logisticregression__C": [0.001, 0.01, 0.1, 1, 10]})
print("\nfull_cv_report")
for k, v in report.items():
    print(f"  {k:24} {v:.4f}")
```

With only five settings of one parameter, the optimism here is close to zero, and random variation can even make it slightly negative. It grows when you search many settings on small data.

**Try this:** give the grid many more values of C, or use a smaller sample, and see whether the optimism grows.

### Common mistakes

- **Peeking at the test set, then changing the model.** Now it's validation data, and you have no test set.
- **Random splitting when records are grouped or in time order.** Use `GroupKFold` or time-based splits.
- **Reporting only the mean.** Report the spread across folds too.

### Problems

1. Which leak is it? (a) A scaler fitted on all rows. (b) A feature "offer letter date". (c) Two records of one student in different folds.
2. Best inner CV score 0.91, nested 0.87. What is the optimism?
3. **Lab 11:** write `full_cv_report` as above, and run it on a tree model.
4. A 70/15/15 split of 20,000 rows: how many in each part?
5. Why does it matter less to use cross-validation when you have millions of rows?
