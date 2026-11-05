---
title: "Data exploration and visualisation with pandas"
keywords: "eda matplotlib"
topic: 26
co: "CO5"
description: "Before any model, look at the data. Pandas summarises it, and matplotlib shows what the numbers hide."
outcomes: ["Load a table into a pandas DataFrame", "Summarise data with describe, value_counts and groupby", "Draw histograms, scatter plots and bar charts", "Spot outliers, skew and relationships before modelling"]
reading: ["Textbook 3, chapters on Python data types and files", "Textbook 2, Ch. 1–2 on preliminaries and data"]
---

### Intuition

A model will fit whatever you give it, including typing mistakes. Ten minutes spent looking at your data can save days of confused modelling. Always ask: how big is it, what types are the columns, what is missing, and do any values look wrong?

### How it works

| Question | Pandas |
| --- | --- |
| How big is it? | `df.shape` |
| What columns and types? | `df.dtypes`, `df.info()` |
| First rows? | `df.head()` |
| Summary of numbers? | `df.describe()` |
| Counts of a category? | `df["col"].value_counts()` |
| Average per group? | `df.groupby("col")["other"].mean()` |
| Missing values? | `df.isna().sum()` |
| Linear relationships? | `df.corr(numeric_only=True)` |

| Chart | Answers |
| --- | --- |
| Histogram | How is one number distributed? |
| Scatter plot | How do two numbers relate? |
| Bar chart | How do categories compare? |
| Box plot | Where are the median, spread and outliers? |

### Run it: exploring a class's results

This table is made up for practice. On this site, a chart appears below the program's output, whether or not you call `plt.show()`.

```python
from io import StringIO
import pandas as pd
import matplotlib.pyplot as plt

CSV = """name,section,hours,attendance,marks
Anu,A,2,60,41
Bhanu,A,5,85,68
Chandu,B,1,40,28
Divya,A,7,92,81
Eshan,B,3,70,52
Farah,B,8,95,88
Gopi,A,4,75,59
Hema,B,6,88,73
Indu,A,9,98,93
Jay,B,2,55,35
Kiran,A,6,80,70
Lata,B,5,78,64
"""
df = pd.read_csv(StringIO(CSV))

print("Shape:", df.shape)
print(df.head(3), "\n")
print(df.describe().round(1), "\n")
print(df["section"].value_counts(), "\n")
print(df.groupby("section")["marks"].mean().round(1), "\n")
print(df.corr(numeric_only=True).round(2))

fig, axes = plt.subplots(1, 3, figsize=(11, 3.2))
axes[0].hist(df["marks"], bins=6, color="#0f766e")
axes[0].set(title="Marks distribution", xlabel="marks", ylabel="students")
axes[1].scatter(df["hours"], df["marks"], color="#c2410c")
axes[1].set(title="Hours against marks", xlabel="hours studied", ylabel="marks")
df.groupby("section")["marks"].mean().plot.bar(ax=axes[2], color="#2563eb", rot=0)
axes[2].set(title="Average by section", ylabel="marks")
plt.tight_layout()
plt.show()
```

**Try this:** change Indu's marks to 930, as a typing mistake might. Which output shows the problem first?

### Common mistakes

- **Jumping straight to a model.** Always look first.
- **Reading correlation as cause.** Hours and marks correlate, but that alone does not prove one causes the other.
- **Using averages alone.** Very different data can share a mean, so plot it as well.

### Problems

1. Which column correlates most strongly with marks in this table? Check it in the output.
2. Add a box plot of marks for each section.
3. Add a column `passed` (marks ≥ 50), and count passes per section.
4. Find the student with the largest gap between attendance and marks.
5. Run this on your own data, using a small table you make yourself.
