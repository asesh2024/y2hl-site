---
title: "Learning sets of rules: sequential covering"
topic: 20
co: "CO4"
description: "Learn one good rule, remove the examples it covers, and repeat. The result is a readable list of if-then rules."
outcomes: ["Describe sequential covering", "Explain how Learn-One-Rule grows a rule", "Compare rule accuracy measures", "Contrast sequential covering with simultaneous covering (decision trees)"]
reading: ["Textbook 1, §10.1–10.3 Introduction, sequential covering algorithms and learning rule sets: summary"]
---

### Intuition

If-then rules are about the easiest learned models to read. A tree could give us rules, but we can also learn rules directly. Find one rule that is very accurate on some of the positive examples. Set those examples aside. Find another rule for what remains. Keep going.

### How it works

```text
SEQUENTIAL-COVERING(Examples):
    Rules ← {}
    Rule ← LEARN-ONE-RULE(Examples)
    while PERFORMANCE(Rule) is above a threshold:
        add Rule to Rules
        remove the examples Rule classifies correctly
        Rule ← LEARN-ONE-RULE(remaining Examples)
    sort Rules by accuracy
    return Rules
```

**Learn-One-Rule, as a general-to-specific search.** Start with the most general rule, which has no conditions and covers everything. Add the condition that most improves performance, and repeat. Keeping only the best candidate at each step is greedy. A **beam search** keeps the best k candidates to reduce the risk of a poor early choice.

**Rule performance measures:**

| Measure | Formula | Note |
| --- | --- | --- |
| Relative frequency | n_c / n | n examples covered, n_c correct |
| m-estimate | (n_c + m·p) / (n + m) | Pulls small samples towards the prior p |
| Negative entropy | −Entropy(covered examples) | Prefers pure coverage |

**Sequential or simultaneous covering?**

| | Sequential covering (rules) | Simultaneous covering (ID3) |
| --- | --- | --- |
| Each step | Chooses one condition for one rule | Chooses one attribute for all its branches |
| Choices made | Many, one for each condition | Fewer, as a split handles all outcomes |
| Data needed | More | Less |
| Flexibility | Rules need not share tests | Paths share the tests above them |

Other design choices: search general-to-specific or the reverse, generate-then-test or be example-driven, and whether to post-prune rules.

### Run it: sequential covering from scratch

```python
COLUMNS = ["Outlook", "Temp", "Humidity", "Wind"]
DATA = [
    ("Sunny", "Hot", "High", "Weak", "No"), ("Sunny", "Hot", "High", "Strong", "No"),
    ("Overcast", "Hot", "High", "Weak", "Yes"), ("Rain", "Mild", "High", "Weak", "Yes"),
    ("Rain", "Cool", "Normal", "Weak", "Yes"), ("Rain", "Cool", "Normal", "Strong", "No"),
    ("Overcast", "Cool", "Normal", "Strong", "Yes"), ("Sunny", "Mild", "High", "Weak", "No"),
    ("Sunny", "Cool", "Normal", "Weak", "Yes"), ("Rain", "Mild", "Normal", "Weak", "Yes"),
    ("Sunny", "Mild", "Normal", "Strong", "Yes"), ("Overcast", "Mild", "High", "Strong", "Yes"),
    ("Overcast", "Hot", "Normal", "Weak", "Yes"), ("Rain", "Mild", "High", "Strong", "No"),
]

def covers(rule, row):
    return all(row[col] == value for col, value in rule)

def accuracy(rule, rows, target):
    covered = [r for r in rows if covers(rule, r)]
    if not covered:
        return 0, 0
    return sum(r[-1] == target for r in covered) / len(covered), len(covered)

def learn_one_rule(rows, target):
    rule = []
    while accuracy(rule, rows, target)[0] < 1:
        options = [(c, v) for c in range(len(COLUMNS)) for v in set(r[c] for r in rows)
                   if c not in [col for col, _ in rule]]
        if not options:
            break
        # Prefer higher accuracy, then wider coverage.
        rule = rule + [max(options, key=lambda o: accuracy(rule + [o], rows, target))]
    return rule

def sequential_covering(rows, target):
    rules = []
    remaining = list(rows)
    while any(r[-1] == target for r in remaining):
        rule = learn_one_rule(remaining, target)
        acc, n = accuracy(rule, remaining, target)
        if n == 0 or acc < 0.8:
            break
        rules.append(rule)
        text = " AND ".join(f"{COLUMNS[c]}={v}" for c, v in rule)
        print(f"IF {text} THEN Play={target}   ({n} examples, accuracy {acc:.2f})")
        remaining = [r for r in remaining if not covers(rule, r)]
    return rules

print("Rules for Play=Yes")
sequential_covering(DATA, "Yes")
print("\nRules for Play=No")
sequential_covering(DATA, "No")
```

**Try this:** change the performance threshold from 0.8 to 1.0, or remove a row from `DATA` and see which rules change.

### Common mistakes

- **Forgetting to remove covered examples.** The same rule would be learned for ever.
- **Trusting a rule that covers one example.** Accuracy of 1.0 on one example says little. Use the m-estimate.
- **Ignoring rule order.** With a rule list, an earlier rule fires first, so the order matters.

### Problems

1. A rule covers 8 examples, 6 of them correctly. Calculate the relative frequency, and the m-estimate with p = 0.5 and m = 2.
2. Trace Learn-One-Rule by hand for Play=No, as far as the first rule.
3. Why does sequential covering usually need more data than ID3?
4. Change the program to use the m-estimate as its measure.
5. Compare the rules from this program with the tree from topic 4.
