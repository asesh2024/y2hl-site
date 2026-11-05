---
title: "Meet PlacementPredict: a working ML service"
keywords: "supervised unsupervised reinforcement"
topic: 1
co: "CO1"
description: "We start with a running system, not a formula. Send it a student profile, read its prediction, and work out what kind of problem it is solving."
outcomes: ["Send a request to a prediction service and read its response", "Separate supervised, unsupervised and reinforcement learning", "Explain why PlacementPredict is supervised binary classification", "Say what PlacementPredict is not"]
reading: ["Textbook 1, Ch. 1, pp. 3–37"]
---

### Intuition

Most courses begin with equations and reach a working system at the end. This one runs the other way. **PlacementPredict** already works on day one: give it a student's profile, and it returns the chance of that student being placed. All term, we open it up, one layer at a time, until you can build and run the whole thing yourself.

All the programs use the course dataset of 50,000 students, `placement_predict_50k`. To keep the page quick, most take a random sample of 5,000 of them. You can [read the small file that loads the data](/static/data/placement_predict.py).

### How it works

A prediction service has a simple contract:

```text
Request:   {"CGPA": 8.2, "CodingTestScore": 74, "Internships": 1, ...}
Response:  {"placed_probability": 0.81, "prediction": "Placed"}
```

**Three kinds of learning** differ in what the data looks like:

| Kind | The data has | Example | Is PlacementPredict this? |
| --- | --- | --- | --- |
| **Supervised** | Inputs with correct answers | Past students with their outcomes | **Yes** |
| **Unsupervised** | Inputs only | Grouping students by profile | Used in Module 4 |
| **Reinforcement** | Actions and rewards | A robot learning to walk | No |

Supervised learning divides again:

| Type | Output | PlacementPredict example |
| --- | --- | --- |
| **Binary classification** | One of two classes | Placed or not placed |
| **Multi-class classification** | One of several classes | CGPA tier: Low, Mid or High |
| **Regression** | A number | Expected salary in LPA |

**What PlacementPredict is not.** It does not recommend jobs, since that is a ranking task. It does not write résumés, which is generative AI. And it does not decide anyone's future: it is an estimate based on patterns in past data, and it can be wrong.

### Run it: use the service

This builds a small version of the service and sends it requests. The first run loads several libraries, which can take a minute or two. Later runs on the same page take seconds.

```python
import json
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from placement_predict import FEATURES, load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
model = make_pipeline(preprocessor(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)

def predict(request):
    """What the service does for each request."""
    row = pd.DataFrame([request]).reindex(columns=FEATURES)
    p = float(model.predict_proba(row)[0, 1])
    return {"placed_probability": round(p, 3), "prediction": "Placed" if p >= 0.5 else "Not placed"}

strong = {"CollegeTier": "Tier1", "Stream": "CS", "Specialisation": "AI", "Hostel": "Yes", "HistoryOfBacklogs": "No",
          "CGPA": 8.6, "AttendancePercent": 88, "Internships": 2, "Projects": 4, "Workshops": 2, "Certifications": 3,
          "Publications": 1, "AptitudeTestScore": 78, "SoftSkillsRating": 3.8, "CodingTestScore": 82,
          "MockInterviewScore": 72, "ExtraCurricular": 1}
weak = {"CollegeTier": "Tier3", "Stream": "Civil", "Specialisation": "Embedded", "Hostel": "No", "HistoryOfBacklogs": "Yes",
        "CGPA": 5.4, "AttendancePercent": 58, "Internships": 0, "Projects": 1, "Workshops": 0, "Certifications": 0,
        "Publications": 0, "AptitudeTestScore": 45, "SoftSkillsRating": 1.8, "CodingTestScore": 30,
        "MockInterviewScore": 30, "ExtraCurricular": 0}

print("Strong profile:", json.dumps(predict(strong)))
print("Weak profile:  ", json.dumps(predict(weak)))
print("Missing fields:", json.dumps(predict({"CGPA": 7.5, "Stream": "ECE", "CollegeTier": "Tier2"})))
print(f"\nOverall: {len(df)} students, {df['PlacementStatus'].mean():.0%} placed")
print(f"Accuracy on students the model has not seen: {model.score(X_val, y_val):.3f}")
```

**Try this:** press **Edit** and raise only the weak student's `CodingTestScore`. How much does the probability move?

### Common mistakes

- **Reading a probability as a verdict.** 0.81 is an estimate from past patterns, not a guarantee.
- **Assuming "AI" means deep learning.** Much real-world tabular ML uses linear models and trees.
- **Calling every prediction task classification.** If the output is a number, it is regression.

### Problems

1. Classify each as binary, multi-class, regression or clustering: (a) expected salary; (b) CGPA tier; (c) placed or not; (d) grouping students with no labels.
2. Change three fields of the strong profile so that it is predicted "Not placed".
3. The program handles a request with missing fields. Which part of the pipeline makes that possible? Look at Topic 8.
4. Write the request and response for a model that predicts next semester's CGPA.
5. Name one harm that could come from using this service to decide who may sit for a placement drive.
