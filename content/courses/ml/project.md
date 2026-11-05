---
title: "Project guide"
description: "How to take a machine learning project from a problem statement to a demonstration, one session at a time, plus how to use TensorFlow on your own computer."
---

The project is where everything comes together. Choose a real problem, find data, build models, compare them honestly and show your work.

### The steps

| Session | Step | What to produce |
| --- | --- | --- |
| 17 | Study case studies | Notes on two published projects: what data, what model, how evaluated |
| 18 | Problem statement, abstract and introduction | One page: T, P and E (topic 1), who benefits, and what success looks like |
| 19 | Literature survey and data collection | A table of 5 to 10 related papers, plus your dataset, with its source and licence |
| 20 | Review and corrections | A list of the review comments, and what you changed for each one |
| 21 | Model building | At least one baseline and two real models, in a pipeline (topic 27) |
| 22 | Evaluation and comparison | A table of cross-validated results, with suitable measures (topic 30) |
| 23 | Final draft | The complete report, with your code and instructions for running it |
| 24 | Demonstration | A short talk and a live run |

### Choosing a problem

A good student project has:

- **Data you can actually get.** Check this first. Public sources include the UCI Machine Learning Repository, Kaggle datasets and government open-data sites.
- **A clear measure.** You should know what "good" means before you start.
- **A baseline to beat.** For classification, use the most frequent class. For regression, use the mean.

### A checklist for honest results

1. Split your data before doing anything else, and keep a test set untouched until the end.
2. Fit all preprocessing on training data only, using a pipeline.
3. Compare against a baseline.
4. Tune with cross-validation.
5. Report more than accuracy if the classes are imbalanced.
6. Say what the model cannot do, and where it might be unfair or unsafe.

### A starting template

Replace the dataset with yours. This one compares a baseline with three models.

```python
from sklearn.datasets import load_breast_cancer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_validate, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0, stratify=y)

models = {
    "Baseline": DummyClassifier(strategy="most_frequent"),
    "Logistic regression": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "Decision tree": DecisionTreeClassifier(max_depth=4, random_state=0),
    "Random forest": RandomForestClassifier(n_estimators=100, random_state=0),
}

print(f"{'Model':22} {'accuracy':>9} {'F1':>7}")
for name, model in models.items():
    cv = cross_validate(model, X_train, y_train, cv=5, scoring=["accuracy", "f1"])
    print(f"{name:22} {cv['test_accuracy'].mean():9.3f} {cv['test_f1'].mean():7.3f}")

best = models["Logistic regression"].fit(X_train, y_train)
print(f"\nFinal check of the chosen model on the test set: {best.score(X_test, y_test):.3f}")
```

### Using TensorFlow

TensorFlow is too large to run inside a web page, so this program has no **Run** button. Run it on your own computer, or in a free online notebook such as Google Colab, where TensorFlow is already installed. To install it yourself:

```bash
python -m pip install tensorflow
```

Here is the XOR network of topic 17, in TensorFlow's Keras interface:

```py
import numpy as np
import tensorflow as tf

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype="float32")
y = np.array([0, 1, 1, 0], dtype="float32")

model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(2,)),
    tf.keras.layers.Dense(4, activation="tanh"),
    tf.keras.layers.Dense(1, activation="sigmoid"),
])
model.compile(optimizer=tf.keras.optimizers.Adam(0.05),
              loss="binary_crossentropy", metrics=["accuracy"])
model.summary()

model.fit(X, y, epochs=300, verbose=0)
print(model.predict(X, verbose=0).round(3).ravel())
```

The same ideas appear with new names:

| In this course | In Keras |
| --- | --- |
| Weights and biases | The `Dense` layer's parameters |
| Sigmoid unit | `activation="sigmoid"` |
| Cross entropy (topic 9) | `loss="binary_crossentropy"` |
| Gradient descent (topic 15) | `optimizer=` |
| Backpropagation (topic 17) | Done for you by `fit` |
