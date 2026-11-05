---
title: "Decision trees in practice: evaluation and post-pruning"
keywords: "cart f1 confusion"
topic: 30
co: "CO5"
description: "Build a tree with scikit-learn, judge it with more than accuracy, then prune it back to something that generalises and can be read."
outcomes: ["Train and draw a decision tree with scikit-learn", "Compare the entropy and Gini criteria", "Calculate precision, recall and F1 from a confusion matrix", "Use cross-validation", "Post-prune a tree using cost-complexity pruning"]
reading: ["Textbook 1, Ch. 3 Decision tree learning", "Textbook 2, Ch. on decision trees", "Topics 3 to 6 of this course"]
---

### Intuition

Topic 4 built ID3 by hand. In practice, you use a library. The harder skill is judging the result. If 95% of patients are healthy, a "model" that always says healthy scores 95%, yet it misses everybody who is ill. We need better evaluation parameters.

### How it works

**The confusion matrix:**

| | Predicted positive | Predicted negative |
| --- | --- | --- |
| **Actually positive** | TP | FN |
| **Actually negative** | FP | TN |

```text
Accuracy  = (TP + TN) / total
Precision = TP / (TP + FP)      of those we flagged, how many were right?
Recall    = TP / (TP + FN)      of the real positives, how many did we catch?
F1        = 2 · Precision · Recall / (Precision + Recall)
```

**Worked example.** TP = 40, FP = 10, FN = 20 and TN = 30.

```text
Accuracy = 70/100 = 0.70
Precision = 40/50 = 0.80
Recall = 40/60 = 0.667
F1 = 2(0.8)(0.667)/(1.467) = 0.727
```

Which matters more depends on the cost. Cancer screening cares about recall, as a missed case is terrible. A spam filter cares about precision, as losing a real email is worse.

**Cross-validation.** One split can be lucky. In k-fold cross-validation, split the data into k parts, train on k−1 of them, test on the last one, and rotate. Report the mean and the spread.

**Cost-complexity post-pruning.** scikit-learn minimises:

```text
Rα(T) = R(T) + α · (number of leaves)
```

A larger α makes a smaller tree. `cost_complexity_pruning_path` lists the useful values of α, and we choose among them with validation, not the test set.

### Run it: build, evaluate and prune

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text, plot_tree

data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.3, random_state=1, stratify=data.target)

for criterion in ["entropy", "gini"]:
    tree = DecisionTreeClassifier(criterion=criterion, random_state=0).fit(X_train, y_train)
    print(f"{criterion:8} leaves = {tree.get_n_leaves():2}, depth = {tree.get_depth()}, "
          f"test accuracy = {tree.score(X_test, y_test):.3f}")

full = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
print("\nConfusion matrix (rows: actual, columns: predicted)")
print(confusion_matrix(y_test, full.predict(X_test)))
print(classification_report(y_test, full.predict(X_test), target_names=data.target_names, digits=3))

print("Post-pruning: choose alpha by cross-validation on the training data")
alphas = DecisionTreeClassifier(random_state=0).cost_complexity_pruning_path(X_train, y_train).ccp_alphas
best_alpha, best_score = 0, 0
for alpha in alphas[:-1]:
    score = cross_val_score(DecisionTreeClassifier(ccp_alpha=alpha, random_state=0), X_train, y_train, cv=5).mean()
    if score >= best_score:
        best_alpha, best_score = alpha, score
pruned = DecisionTreeClassifier(ccp_alpha=best_alpha, random_state=0).fit(X_train, y_train)
print(f"alpha = {best_alpha:.5f}, cross-validated accuracy = {best_score:.3f}")
print(f"Full tree:   {full.get_n_leaves()} leaves, test accuracy {full.score(X_test, y_test):.3f}")
print(f"Pruned tree: {pruned.get_n_leaves()} leaves, test accuracy {pruned.score(X_test, y_test):.3f}\n")
print(export_text(pruned, feature_names=list(data.feature_names), max_depth=2))

plt.figure(figsize=(10, 5))
plot_tree(pruned, feature_names=data.feature_names, class_names=data.target_names, filled=True, fontsize=7)
plt.show()
```

**Try this:** change `max_depth` limits instead of pruning, or change `random_state=1` in the split. Does the same α always win?

### Common mistakes

- **Reporting only accuracy on imbalanced data.** Check precision and recall.
- **Tuning on the test set.** Tune with cross-validation on the training data.
- **Thinking gini against entropy is a big decision.** They usually give similar trees. Pruning matters much more.

### Problems

1. TP = 50, FP = 5, FN = 25 and TN = 20. Calculate accuracy, precision, recall and F1.
2. A disease occurs in 1% of people. A model always says "healthy". Give its accuracy and recall.
3. For an airport security scanner, should you prefer high precision or high recall? Explain.
4. Change the program to use `load_wine`, with 3 classes.
5. Explain why `alphas[:-1]` leaves out the last value of α.
