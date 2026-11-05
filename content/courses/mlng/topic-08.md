---
title: "Feature engineering: scaling, encoding and missing values"
keywords: "standardscaler minmax onehot ordinal target encoding embedding imputer missingindicator columntransformer"
topic: 8
co: "CO2"
description: "Models eat numbers. Decide how to scale them, how to encode categories, and how to fill gaps, then put it all into one pipeline that travels with the model."
outcomes: ["Choose between StandardScaler and MinMaxScaler", "Apply one-hot, ordinal and target encoding", "Compare mean, median and model-based imputation", "Use MissingIndicator features", "Build a ColumnTransformer pipeline"]
reading: ["Textbook 1, Ch. 2, pp. 67–89", "Textbook 3, Ch. 3, pp. 71–120"]
---

### Intuition

Our table contains numbers on different scales, a category (`Stream`), an order (`CGPA_Tier`), and gaps. Each needs its own treatment. Done well, this often improves results more than changing the algorithm.

### How it works

**Scaling:**

| Method | Formula | When |
| --- | --- | --- |
| StandardScaler | (x − mean) / std | The default for gradient-based models and distances |
| MinMaxScaler | (x − min) / (max − min) | When a fixed range is needed |

Trees do not need scaling, as they compare one feature at a time.

**Encoding categories:**

| Method | Example | Use for | Watch out |
| --- | --- | --- | --- |
| One-hot | CS → 1,0,0,… | No natural order, few values | Many values means many columns |
| Ordinal | Low, Mid, High → 0,1,2 | A real order | Invents an order if there isn't one |
| Target | Stream → its placement rate | Many values | Leaks the target unless fitted carefully |
| Embedding (preview) | Stream → a learned vector | Very many values | Needs a neural network; see DLAC |

**Missing values:**

| Method | Idea | Trade-off |
| --- | --- | --- |
| Deletion | Drop rows or columns | Loses data, and may bias what is left |
| Mean or median | One fixed value per column | Simple. The median resists outliers |
| Model-based (KNN, iterative) | Predict the gap from other columns | Better, but slower and more complex |
| MissingIndicator | Add a "was missing" column | Keeps the signal if a gap means something |

**A worked standardisation.** Values 2, 4, 6, 8: mean 5, population standard deviation √5 = 2.236. So 8 becomes (8 − 5)/2.236 = 1.342.

**The golden rule.** Every statistic, including the mean, the scale and the category list, is learned from the **training data only**. A `Pipeline` guarantees this, and it travels with the model, which prevents the skew of Topic 3.

### Run it: compare the choices

```python
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer, KNNImputer, SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler, TargetEncoder
from placement_predict import CATEGORICAL, NUMERIC, load_data, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)

def build(imputer, encoder, indicator=False):
    if indicator:
        imputer.set_params(add_indicator=True)
    numeric = Pipeline([("fill", imputer), ("scale", StandardScaler())])
    category = Pipeline([("fill", SimpleImputer(strategy="most_frequent")), ("encode", encoder)])
    return ColumnTransformer([("num", numeric, NUMERIC), ("cat", category, CATEGORICAL)])

def score(prep):
    model = make_pipeline(prep, LogisticRegression(max_iter=1000)).fit(X_train, y_train)
    return roc_auc_score(y_val, model.predict_proba(X_val)[:, 1]), prep.transform(X_train).shape[1]

onehot = OneHotEncoder(handle_unknown="ignore")
choices = {
    "Median + one-hot": build(SimpleImputer(strategy="median"), onehot),
    "Mean + one-hot": build(SimpleImputer(strategy="mean"), onehot),
    "Median + indicator": build(SimpleImputer(strategy="median"), onehot, indicator=True),
    "KNN imputer": build(KNNImputer(n_neighbors=5), onehot),
    "Iterative imputer": build(IterativeImputer(random_state=0), onehot),
    "Median + target enc": build(SimpleImputer(strategy="median"), TargetEncoder(random_state=0)),
}
print(f"{'Pipeline':22} {'val AUC':>8} {'columns':>8}")
for name, prep in choices.items():
    auc, columns = score(prep)
    print(f"{name:22} {auc:8.4f} {columns:8}")

print("\nRows lost if we simply deleted gaps:", int(X_train.isna().any(axis=1).sum()), "of", len(X_train))
```

Here the imputers score about the same. That is a useful result too: use the simplest choice that does the job.

**Try this:** make `Workshops` go missing only for students with no workshops, using `df.loc[df.Workshops == 0, "Workshops"] = np.nan`. Does the indicator now help?

### Common mistakes

- **Fitting on all data before splitting.** That leaks information from the validation data.
- **One-hot encoding a student ID.** It adds thousands of useless columns.
- **Ignoring unseen categories.** Without `handle_unknown="ignore"`, a new Stream crashes the service.

### Problems

1. Standardise 10, 20 and 30 by hand, using the population standard deviation.
2. Normalise 5 to the range 0 to 1, where min = 0 and max = 20.
3. A column has 6 categories. How many columns does one-hot encoding make?
4. Why can plain target encoding leak the label? How does cross-fitting help?
5. Add a new feature, `SkillScore`, as the mean of the coding, aptitude and communication scores, and test whether it helps.
