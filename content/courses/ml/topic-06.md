---
title: "Issues in decision tree learning"
keywords: "gini pruning"
topic: 6
co: "CO1"
description: "Real data is noisy, numeric, incomplete and costly to measure. Here is how trees cope: pruning, thresholds, gain ratio, missing values and attribute costs."
outcomes: ["Recognise overfitting and explain why it happens", "Apply reduced-error and rule post-pruning", "Handle continuous attributes with a threshold", "Use gain ratio instead of gain", "Handle missing attribute values and attribute costs"]
reading: ["Textbook 1, §3.7 Issues in decision tree learning", "Textbook 2, Ch. on decision trees"]
---

### Intuition

A tree can keep splitting until every training example is right. But some of those late splits are only fitting noise, and they make the tree worse on new data. This is **overfitting**: the model does better on the training data and worse on everything else.

### How it works

**1. Avoiding overfitting.** There are two approaches. **Pre-pruning** stops growing early. **Post-pruning** grows the full tree and then cuts it back, and it tends to work better in practice.

- **Reduced-error pruning.** Hold out a validation set. Replace a subtree with a leaf if validation accuracy does not get worse. Repeat until pruning starts to harm it.
- **Rule post-pruning.** Convert the tree to if-then rules, one per path. Drop any condition from a rule if that improves its estimated accuracy. Sort the rules by accuracy.

**2. Continuous attributes.** Turn a number into a test such as `Temp > 54`. Sort the examples by the value, and consider thresholds halfway between neighbours with different labels. Choose the one with the highest gain.

| Temp | 40 | 48 | 60 | 72 | 80 | 90 |
| --- | --- | --- | --- | --- | --- | --- |
| Play | No | No | Yes | Yes | Yes | No |

The candidates are (48+60)/2 = **54** and (80+90)/2 = **85**.

**3. Alternative measures.** Gain favours attributes with many values, such as a date. **Gain ratio** corrects for this:

```text
SplitInformation(S, A) = − Σ (|Si|/|S|) log₂(|Si|/|S|)
GainRatio(S, A) = Gain(S, A) / SplitInformation(S, A)
```

For Outlook in our data (groups of 5, 4 and 5), SplitInformation is 1.577, so GainRatio = 0.247 / 1.577 = 0.156.

Another common measure is **Gini impurity**: 1 − Σ pᵢ². For 9 Yes and 5 No it is 0.459.

**4. Missing values.** Three common options, from simple to careful:

- use the most common value among all examples at that node;
- use the most common value among examples with the same label;
- split the example into fractions, for instance 0.6 down one branch and 0.4 down another (C4.5 does this).

**5. Attribute costs.** A blood test costs more than taking a temperature. To prefer cheap attributes, divide by the cost, for example with Gain²(S, A) / Cost(A).

### Run it: seeing overfitting and pruning

This uses scikit-learn on a real medical dataset that ships with the library. The first run downloads the library, which can take a minute or two.

```python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

print("depth  train acc  test acc")
for depth in [1, 2, 3, 4, 5, 7, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    print(f"{str(depth):5}  {tree.score(X_train, y_train):9.3f}  {tree.score(X_test, y_test):8.3f}")

print("\nCost-complexity post-pruning")
print("alpha   leaves  test acc")
for alpha in [0.0, 0.005, 0.01, 0.02, 0.05]:
    tree = DecisionTreeClassifier(ccp_alpha=alpha, random_state=0).fit(X_train, y_train)
    print(f"{alpha:5}  {tree.get_n_leaves():6}  {tree.score(X_test, y_test):8.3f}")
```

Watch training accuracy reach 1.000 at full depth, while test accuracy does not keep up.

**Try this:** change `random_state=0` in `train_test_split` to other numbers. How much does the "best depth" move? This is why a single split can mislead.

### Common mistakes

- **Choosing the pruning level using the test set.** Then the test set is no longer unseen. Use a separate validation set.
- **Testing a continuous attribute at every value.** Only boundaries where the label changes can be the best threshold.
- **Ignoring many-valued attributes.** Plain gain will happily choose a student ID.

### Problems

1. Find the entropy-based gain of the thresholds 54 and 85 in the table above. Which is better?
2. Calculate the gain ratio of Wind on the 14-day data.
3. Calculate the Gini impurity of a set with 2 Yes and 3 No.
4. A patient record has Humidity missing. Explain how fractional examples handle it.
5. In the program, what depth would you choose, and why?
