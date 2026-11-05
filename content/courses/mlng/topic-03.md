---
title: "Tracing a prediction: the training-serving boundary"
keywords: "skew batch realtime online"
topic: 3
co: "CO1"
description: "Follow one request from the API to the response. Then see how a tiny difference between training code and serving code quietly ruins predictions."
outcomes: ["Trace a request through validation, features, inference and response", "Compare batch and real-time prediction", "Define training-serving skew", "Diagnose a skew bug in a running program"]
reading: ["Textbook 1, Ch. 1, pp. 3–37", "Reference book 2, Ch. 2, pp. 21–58"]
---

### Intuition

Imagine training with attendance recorded as a percentage, 85, while the serving code receives it as a fraction, 0.85. Nothing crashes, and the model returns a neat probability. It is just wrong, for every student, every day. This is the most common kind of production ML bug, because no error message ever appears.

### How it works

**One request, step by step:**

| Step | What happens | If it goes wrong |
| --- | --- | --- |
| 1. Receive | Service accepts the JSON | HTTP 400 |
| 2. Validate | Types and ranges are checked, such as CGPA ≤ 10 | Clear error to the caller |
| 3. Transform | The fitted pipeline makes the features | **Skew, if this differs from training** |
| 4. Infer | The model calculates a score | |
| 5. Format | A probability becomes a response | |
| 6. Log | Request and result are stored for monitoring | Blind to drift later |

**Batch or real-time?**

| | Batch | Real-time (online) |
| --- | --- | --- |
| When | On a schedule | At each request |
| Example | Score all final-year students overnight | Score a student as a form is submitted |
| Latency matters? | Little | A lot |
| Features | Can use heavy joins | Must be available right now |
| Failure | Rerun the job | The user sees an error |

**The training-serving boundary** is the line between the code that made the model and the code that uses it. **Skew** means the inputs differ across that line. Common causes:

- two separate implementations of the same feature;
- different units or scales;
- a different meaning for missing values;
- using information at training time that isn't available at serving time.

The main cure is to **ship the fitted pipeline with the model**, so that the very same code runs on both sides. Topic 22 extends this idea to feature stores.

### Run it: trace a request, then cause a skew bug

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.pipeline import make_pipeline
from placement_predict import FEATURES, load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
pipeline = preprocessor()
clf = LogisticRegression(max_iter=1000)
model = make_pipeline(pipeline, clf).fit(X_train, y_train)

request = {"Stream": "IT", "CGPA": 8.1, "Attendance": 84, "Internships": 1, "Projects": 3, "Certifications": 1,
           "AptitudeScore": 70, "CodingScore": 76, "CommunicationScore": 68, "Backlogs": 0, "Hackathons": 1}

print("1 Received: ", request["CGPA"], request["Stream"], "...")
assert 0 <= request["CGPA"] <= 10, "CGPA out of range"
print("2 Validated")
row = pd.DataFrame([request]).reindex(columns=FEATURES)
features = pipeline.transform(row)
print("3 Features: ", np.round(features[0][:4], 2), "...", features.shape[1], "values")
score = clf.decision_function(features)[0]
print(f"4 Score:      {score:.3f}")
p = 1 / (1 + np.exp(-score))
print(f"5 Response:   placed_probability = {p:.3f}")

print("\nTraining-serving skew")
print(f"Correct serving code:                accuracy = {accuracy_score(y_val, model.predict(X_val)):.3f}")

skewed = X_val.copy()
skewed["Attendance"] = skewed["Attendance"] / 100                 # the serving team used fractions
print(f"Attendance sent as a fraction:       accuracy = {accuracy_score(y_val, model.predict(skewed)):.3f}")

skewed = X_val.copy()
skewed["CGPA"] = skewed["CGPA"] * 9.5                             # the serving team used percentages
print(f"CGPA sent as a percentage:           accuracy = {accuracy_score(y_val, model.predict(skewed)):.3f}")

skewed = X_val.copy()
skewed["CommunicationScore"] = skewed["CommunicationScore"].fillna(0)   # a different meaning for missing
print(f"Missing values filled with 0:        accuracy = {accuracy_score(y_val, model.predict(skewed)):.3f}")

print("\nNo error was raised in any of these runs.")
```

**Try this:** change the attendance bug to `skewed["Attendance"] * 2`. Compare what the fractions do with what the larger values do. Which is harder to notice?

### Common mistakes

- **Rewriting feature code for the serving side.** Sooner or later, the two copies will differ.
- **Using `fit_transform` on serving data.** That learns new statistics from a single request. Use `transform`.
- **Testing only that the service returns a response.** A wrong number looks just like a right one.

### Problems

1. In your own words, explain skew to a teammate who has never heard of it.
2. For each, decide on batch or real-time: (a) a weekly report to the placement cell; (b) a chatbot that estimates chances as you type; (c) a yearly retraining job.
3. A feature "offers received so far this year" is used in training. Why is it a problem at prediction time?
4. Add range checks for all numeric fields to the validation step.
5. Write a test that would have caught the fraction bug before release.
