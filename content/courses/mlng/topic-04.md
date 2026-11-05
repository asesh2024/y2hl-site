---
title: "A tour of the PlacementPredict codebase and course scope"
keywords: "ingestion structure repository dlac gale nlpl"
topic: 4
co: "CO1"
description: "Walk through the repository, one responsibility per module, then see where this course stops and where deep learning, generative AI and LLM courses begin."
outcomes: ["Identify what each module of the project does", "Write a dataset summary function", "Inspect a dataset's shape, types, gaps and class balance", "Say where classical ML ends and other courses begin"]
reading: ["Reference book 2, Ch. 5, pp. 133–172", "Reference book 4, Ch. 3, pp. 45–78"]
---

### Intuition

When you join a team, you inherit a running system and learn it by reading it. A good repository makes this easy: each file has one job, and its name tells you what that is.

### How it works

```text
placement-predict/
  data/placement_predict_50k.csv raw records (never edited by hand)
  src/
    data_loader.py               read and validate the data
    feature_pipeline.py          turn records into features
    trainer.py                   fit models and save the best
    evaluate.py                  metrics and reports
    app.py                       FastAPI service: /health, /predict
    batch_predict.py             score a whole file
    monitor.py                   drift checks
  models/model.joblib            the trained pipeline
  tests/                         unit and end-to-end tests
  configs/train.yaml             settings, kept out of the code
```

| Module | Input | Output | Changes when |
| --- | --- | --- | --- |
| `data_loader` | CSV file | Validated DataFrame | The data's source changes |
| `feature_pipeline` | DataFrame | Fitted transformer | Features change |
| `trainer` | Features, labels | Saved model | The algorithm changes |
| `app` | JSON request | JSON response | The API changes |
| `monitor` | Logged requests | Drift report | Thresholds change |

**Where this course stops.**

| Topic | Course |
| --- | --- |
| Linear models, trees, clustering, evaluation, ML engineering | **This course** |
| Neural networks in depth | Deep learning (DLAC) |
| Generative models | Generative AI (GALE) |
| Language models | NLP and LLMs (NLPL) |

Classical ML is not out of date. On tables of numbers and categories, like ours, tree ensembles are still very hard to beat, as Topic 12 shows.

**The first thing to do with any dataset** is look at it. In the lab, you write a reusable summary function.

### Run it: summarise the dataset

```python
import pandas as pd
import matplotlib.pyplot as plt
from placement_predict import NUMERIC, load_data

def summarise_dataset(df, target=None):
    """Print the shape, type groups, missing values and class balance of any DataFrame."""
    print("Shape:", df.shape)
    for kind, columns in df.columns.groupby(df.dtypes.astype(str)).items():
        print(f"  {kind:8}: {list(columns)}")
    missing = df.isna().sum()
    print("Missing values:", missing[missing > 0].to_dict())
    if target:
        print(f"Class balance of {target}:", df[target].value_counts(normalize=True).round(3).to_dict())

df = load_data()
summarise_dataset(df, target="PlacementStatus")

for column in ["Stream", "CollegeTier", "HistoryOfBacklogs"]:
    print(f"\nPlacement rate by {column}")
    print(df.groupby(column)["PlacementStatus"].mean().sort_values(ascending=False).round(3))
print("\nCorrelation with PlacementStatus")
print(df[NUMERIC + ["PlacementStatus"]].corr()["PlacementStatus"].drop("PlacementStatus").sort_values(ascending=False).round(2))

fig, ax = plt.subplots(1, 3, figsize=(11, 3.1))
ax[0].hist(df["CGPA"], bins=25, color="#0f766e"); ax[0].set(title="CGPA", xlabel="CGPA")
df.groupby("CollegeTier")["PlacementStatus"].mean().sort_values().plot.barh(ax=ax[1], color="#2563eb")
ax[1].set(title="Placement rate by college tier", ylabel="")
df.boxplot(column="CodingTestScore", by="PlacementStatus", ax=ax[2], grid=False)
ax[2].set(title="CodingTestScore by outcome", xlabel="PlacementStatus"); fig.suptitle("")
plt.tight_layout()
plt.show()
```

Stream makes little difference here, but college tier and backlog history make a large one. Finding this kind of thing is why you look before you model.

**Try this:** run `summarise_dataset` with `target="CGPA_Tier"`. Then compare `df.groupby("CGPA_Tier")["CGPA"].describe()`. Is the tier always what the CGPA says it should be?

### Common mistakes

- **Editing raw data by hand.** Keep it untouched, so results can be repeated.
- **Hard-coding settings.** Put the learning rate and paths in a config file (Topic 21).
- **Thinking a correlation of 0 means no relationship.** A curved or threshold effect can hide from it.

### Problems

1. Which module changes if the college adds a new attribute, "Language certification"? List all that apply.
2. **Lab 1:** extend `summarise_dataset(df)` so that it also lists columns with more than 5% missing values.
3. **Lab 2:** export a 5-page EDA report as a PDF with `PdfPages`: missing values, 6 histograms, placement rate by stream, correlation heatmap and box plots. Do this on your own computer.
4. Why is `Salary Package` left out when calculating correlation with placement?
5. Name a real problem suited to each of the four courses in the table above.
