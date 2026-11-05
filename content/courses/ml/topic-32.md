---
title: "Naive Bayes on census-style income data"
topic: 32
co: "CO5"
description: "Build a generative classifier for a real kind of question: is this person's income above a threshold? Mixed data, an imbalanced target and a very fast model."
outcomes: ["Use Gaussian and categorical naive Bayes", "Build a pipeline for mixed data", "Predict the income class from census-style data", "Interpret the results for an imbalanced target"]
reading: ["Textbook 1, §6.9 Naive Bayes classifier", "Textbook 2, Ch. on probabilistic learning", "Topic 11 of this course"]
---

### Intuition

Naive Bayes is **generative**: for each class it models what the data looks like, then asks which class most likely produced a new person. It needs one table or bell curve per feature per class, so it trains almost instantly.

The classic exercise predicts whether income is above a threshold from census records. The real dataset (Adult, from the [UCI repository](https://archive.ics.uci.edu/dataset/2/adult)) is too large to download into every student's browser, so the program below **generates** a similar table of 3,000 people. The numbers are made up, and only the shape of the data follows the real one.

### How it works

| Feature type | Variant | P(value \| class) |
| --- | --- | --- |
| Numeric | Gaussian NB | A bell curve with the class's mean and variance |
| Category | Categorical NB | The smoothed count from the class's table |
| Word counts | Multinomial NB | Topic 11's method |

**For numeric features:**

```text
P(x | class) = (1 / √(2πσ²)) · exp(−(x − μ)² / 2σ²)
```

Here, μ and σ² are the mean and variance of x within that class.

A simple way to use mixed data is to convert numbers into bands, and treat everything as categories. An alternative is to fit one model per type and combine their log probabilities, which is valid under the same independence assumption.

**Imbalance.** In this table, about 64% of people are in the low group, so a model that always says "low" scores about 64%. Compare against that baseline, and read the precision and recall for the high group.

### Run it: predict the income class

```python
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import CategoricalNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import KBinsDiscretizer, OrdinalEncoder

rng = np.random.default_rng(42)
n = 3000
education = rng.choice(["School", "Diploma", "Bachelors", "Masters"], n, p=[0.35, 0.25, 0.3, 0.1])
occupation = rng.choice(["Service", "Clerical", "Technical", "Managerial"], n, p=[0.35, 0.25, 0.25, 0.15])
age = rng.integers(18, 70, n)
hours = np.clip(rng.normal(40, 10, n), 10, 80).round()

score = (-5.0 + 0.04 * age + 0.03 * hours
         + pd.Series(education).map({"School": 0, "Diploma": 0.6, "Bachelors": 1.4, "Masters": 2.2}).to_numpy()
         + pd.Series(occupation).map({"Service": 0, "Clerical": 0.3, "Technical": 1.0, "Managerial": 1.6}).to_numpy())
high = rng.random(n) < 1 / (1 + np.exp(-score))

df = pd.DataFrame({"age": age, "hours": hours, "education": education, "occupation": occupation, "high_income": high})
print(df.head(), "\n")
print("Share with high income:", round(df["high_income"].mean(), 3), "\n")
print(df.groupby("education")["high_income"].mean().sort_values().round(3), "\n")

X, y = df.drop(columns="high_income"), df["high_income"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

prepare = ColumnTransformer([
    ("bands", KBinsDiscretizer(n_bins=4, encode="ordinal", strategy="quantile"), ["age", "hours"]),
    ("cats", OrdinalEncoder(), ["education", "occupation"]),
])
model = Pipeline([("prepare", prepare), ("nb", CategoricalNB(alpha=1.0))]).fit(X_train, y_train)

baseline = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
print(f"Always saying the commonest class: {baseline.score(X_test, y_test):.3f}")
print(f"Naive Bayes:                       {model.score(X_test, y_test):.3f}\n")
print(classification_report(y_test, model.predict(X_test), target_names=["low", "high"], digits=3))

people = pd.DataFrame({"age": [24, 48], "hours": [38, 50], "education": ["Diploma", "Masters"],
                       "occupation": ["Service", "Managerial"]})
for person, p in zip(people.to_dict("records"), model.predict_proba(people)[:, 1]):
    print(person, "-> P(high income) =", round(p, 3))
```

**Try this:** run the same model with `GaussianNB` on only `age` and `hours`. How much do you lose by leaving out education and occupation?

### Common mistakes

- **Celebrating accuracy near the baseline.** Beat the most-frequent-class score first.
- **Reading predicted probabilities as exact.** Naive Bayes is often overconfident.
- **Treating census features as fair inputs without thought.** Features such as sex or race can build bias into real decisions.

### Problems

1. Using a mean of 40 and variance of 100, calculate the Gaussian density at x = 40.
2. Find the most probable class by hand from a table you write for two features and two classes.
3. Use your own bands for age in the program. Does accuracy change?
4. Download the real Adult data, and run this pipeline on your own computer.
5. Discuss one ethical problem with using such a model for loan decisions.
