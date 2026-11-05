---
title: "Data preprocessing and handling missing values"
keywords: "scaling imputation"
topic: 27
co: "CO5"
description: "Real data is messy. Fill the gaps, turn categories into numbers, put features on a common scale, and keep the test data out of it all."
outcomes: ["Choose a strategy for missing values", "Encode categorical features", "Standardise and normalise numeric features", "Split data correctly and avoid data leakage"]
reading: ["Textbook 2, Ch. on preliminaries and preparing data", "Reference book 1, Ch. on data preprocessing topics"]
---

### Intuition

Most algorithms expect a complete table of numbers on sensible scales. Real data has gaps, words and wildly different units. An income in rupees can be 100,000 times bigger than an age in years, so any distance-based model would notice only the income.

### How it works

**Missing values:**

| Strategy | When |
| --- | --- |
| Drop rows | Few rows are affected, and they are missing at random |
| Drop the column | Most of the column is missing |
| Fill with mean or median | Numeric data (median is safer with outliers) |
| Fill with most common value | Categories |
| Add a "was missing" flag | Being missing may itself be informative |

**Encoding categories:**

| Method | Example | Use |
| --- | --- | --- |
| One-hot | Red → 1,0,0 | Categories with no order |
| Ordinal | Low, Mid, High → 0,1,2 | Categories with a real order |

**Scaling:**

```text
Standardise:  z = (x − mean) / std        result has mean 0 and std 1
Normalise:    x′ = (x − min) / (max − min)  result is between 0 and 1
```

Trees do not need scaling. KNN, neural networks, logistic regression with gradient descent and k-means do.

**The golden rule: avoid data leakage.** Split first. Calculate means, scales and encodings on the **training** data only, then apply those same values to the test data. Otherwise, the test data has influenced the model, and your accuracy estimate is too good to be true.

### Run it: a full preprocessing pipeline

```python
from io import StringIO
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CSV = """age,income,city,bought
25,30000,Vizag,0
32,,Vijayawada,0
47,82000,Guntur,1
51,91000,,1
38,52000,Vizag,0
,61000,Vijayawada,1
29,34000,Guntur,0
44,75000,Vizag,1
36,48000,Vijayawada,0
58,99000,Guntur,1
41,,Vizag,1
23,28000,Guntur,0
"""
df = pd.read_csv(StringIO(CSV))
print("Missing values per column:")
print(df.isna().sum(), "\n")

X, y = df.drop(columns="bought"), df["bought"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

numeric = Pipeline([("fill", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
category = Pipeline([("fill", SimpleImputer(strategy="most_frequent")),
                     ("onehot", OneHotEncoder(handle_unknown="ignore"))])
prepare = ColumnTransformer([("num", numeric, ["age", "income"]), ("cat", category, ["city"])])

model = Pipeline([("prepare", prepare), ("classify", LogisticRegression())])
model.fit(X_train, y_train)                 # every step is fitted on training data only

print("Median age learned from the training data:", prepare.named_transformers_["num"]["fill"].statistics_[0])
print("Processed training table shape:", prepare.transform(X_train).shape)
print("First processed row:", np.round(prepare.transform(X_train)[0], 2))
print("Test accuracy:", model.score(X_test, y_test))
print("Prediction for a new customer aged 40 with unknown income in Vizag:",
      model.predict(pd.DataFrame({"age": [40], "income": [np.nan], "city": ["Vizag"]}))[0])
```

A `Pipeline` is the easy way to avoid leakage: everything is fitted only when you fit on the training data.

**Try this:** change `strategy="median"` to `"mean"` and compare the learned value. Three test rows are far too few to compare accuracy, so explain why you should not read much into that number.

### Common mistakes

- **Scaling before splitting.** The test data's values leak into the scale.
- **Treating categories as numbers.** Coding cities as 1, 2, 3 invents an order that is not there.
- **Dropping every row with a gap.** You may lose most of the data and bias what is left.

### Problems

1. Standardise 2, 4, 6 and 8 by hand, using the population standard deviation.
2. Normalise 10, 20 and 50 to the range 0 to 1 by hand.
3. Why is the median safer than the mean for filling in income?
4. One-hot encode a column with 4 categories. How many columns does it produce?
5. Write down a case where a value being missing is itself informative.
