---
title: "Naive Bayes classifier and learning to classify text"
keywords: "nb spam"
topic: 11
co: "CO2"
description: "Assume the attributes are independent given the class. It is rarely true, yet the resulting classifier is fast, simple and often very accurate, especially on text."
outcomes: ["State the naive Bayes assumption", "Classify a new example by hand using naive Bayes", "Use m-estimates to avoid zero probabilities", "Build a small text classifier with word counts"]
reading: ["Textbook 1, §6.9 Naive Bayes classifier", "Textbook 1, §6.10 An example: learning to classify text", "Textbook 2, Ch. on probabilistic learning"]
---

### Intuition

With many attributes, there are far too many combinations to estimate P(all attributes | class) directly. We would almost never see the same combination twice. So we make a bold simplification: given the class, each attribute is independent of the others. Now we need only one small table per attribute.

The assumption is usually false, which is why it is "naive". Still, the classifier needs only the right answer to get the highest score, not exact probabilities, and it often does.

### How it works

```text
v_NB = argmax over classes v of  P(v) · Π P(aᵢ | v)
```

**Worked on the 14-day data of topic 3.** Classify a new day: Sunny, Cool, High, Strong.

| Estimate | Yes (9 days) | No (5 days) |
| --- | --- | --- |
| P(class) | 9/14 | 5/14 |
| P(Sunny \| class) | 2/9 | 3/5 |
| P(Cool \| class) | 3/9 | 1/5 |
| P(High \| class) | 3/9 | 4/5 |
| P(Strong \| class) | 3/9 | 3/5 |
| **Product** | **0.0053** | **0.0206** |

So the answer is **No**. Normalising gives P(No) = 0.0206 / (0.0053 + 0.0206) = 0.795.

**The zero problem.** If an attribute value never occurs with a class, its estimate is 0, and that wipes out the whole product. The **m-estimate** fixes this:

```text
P(a | v) = (n_c + m·p) / (n + m)
```

Here n is the number of examples with class v, n_c is how many of them have value a, p is a prior estimate, and m is how much weight to give that prior. With p = 1/(number of values) and m = number of values, this becomes **add-one (Laplace) smoothing**.

**Classifying text.** Treat a document as a bag of words, ignoring position:

```text
P(word | class) = (count of word in class + 1) / (total words in class + |vocabulary|)
```

Multiplying many small numbers underflows, so we add **logarithms** instead.

### Run it: naive Bayes on the weather and on text

```python
from math import log
from collections import Counter

DATA = [
    ("Sunny", "Hot", "High", "Weak", "No"), ("Sunny", "Hot", "High", "Strong", "No"),
    ("Overcast", "Hot", "High", "Weak", "Yes"), ("Rain", "Mild", "High", "Weak", "Yes"),
    ("Rain", "Cool", "Normal", "Weak", "Yes"), ("Rain", "Cool", "Normal", "Strong", "No"),
    ("Overcast", "Cool", "Normal", "Strong", "Yes"), ("Sunny", "Mild", "High", "Weak", "No"),
    ("Sunny", "Cool", "Normal", "Weak", "Yes"), ("Rain", "Mild", "Normal", "Weak", "Yes"),
    ("Sunny", "Mild", "Normal", "Strong", "Yes"), ("Overcast", "Mild", "High", "Strong", "Yes"),
    ("Overcast", "Hot", "Normal", "Weak", "Yes"), ("Rain", "Mild", "High", "Strong", "No"),
]

def score(example, label):
    rows = [r for r in DATA if r[-1] == label]
    p = len(rows) / len(DATA)
    for i, value in enumerate(example):
        p *= sum(r[i] == value for r in rows) / len(rows)
    return p

day = ("Sunny", "Cool", "High", "Strong")
yes, no = score(day, "Yes"), score(day, "No")
print(f"Yes: {yes:.4f}   No: {no:.4f}   P(No) = {no / (yes + no):.3f}")

TEXTS = [
    ("win money now claim your prize", "spam"), ("free prize click now", "spam"),
    ("cheap loan offer win cash", "spam"), ("meeting moved to monday morning", "ham"),
    ("please review the lab report", "ham"), ("lecture notes for monday attached", "ham"),
]
counts = {"spam": Counter(), "ham": Counter()}
docs = Counter()
for text, label in TEXTS:
    docs[label] += 1
    counts[label].update(text.split())
vocab = set(counts["spam"]) | set(counts["ham"])

def classify(text):
    best, best_score = None, float("-inf")
    for label in counts:
        total = sum(counts[label].values())
        s = log(docs[label] / sum(docs.values()))
        for w in text.split():
            if w in vocab:
                s += log((counts[label][w] + 1) / (total + len(vocab)))
        if s > best_score:
            best, best_score = label, s
    return best

for message in ["claim your free cash prize", "lab meeting on monday", "win a lecture prize"]:
    print(f"{message!r:32} -> {classify(message)}")
```

**Try this:** add two more training messages of your own, then write a test message designed to fool the classifier.

### Common mistakes

- **Treating the output as a true probability.** The independence assumption usually makes the scores overconfident, even when the class is right.
- **Forgetting the class prior P(v).** It must be part of the product.
- **Multiplying instead of adding logs.** Long documents will underflow to zero.

### Problems

1. Using the table method, classify the day Rain, Hot, High, Weak by hand.
2. Estimate P(Overcast | No) with add-one smoothing. Outlook has 3 values.
3. Why are the attributes in text not really independent? Give an example of two dependent words.
4. Add smoothing to the `score` function in the program.
5. Give one reason naive Bayes still classifies well when the assumption fails.
