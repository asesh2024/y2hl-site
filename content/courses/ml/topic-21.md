---
title: "Learning first-order rules: FOIL"
keywords: "ilp"
topic: 21
co: "CO4"
description: "Some ideas cannot be written with fixed attributes. First-order rules use variables and relations, which lets them express concepts such as grandparent or ancestor."
outcomes: ["Explain why propositional rules are not enough for relational concepts", "Read Horn clauses and their terminology", "Describe how FOIL extends sequential covering", "Calculate FOIL_Gain", "Run a small FOIL program"]
reading: ["Textbook 1, §10.4 Learning first-order rules", "Textbook 1, §10.5 Learning sets of first-order rules: FOIL"]
---

### Intuition

Try to define "x is y's grandparent" with attributes like `Name1 = Sita, Name2 = Ravi`. You would need a rule for every pair of people, and nothing would carry over to a new family. What you want is a rule with **variables**:

```text
Grandparent(x, y) ← Parent(x, z) ∧ Parent(z, y)
```

That one rule works for every family, and rules can even define themselves, as ancestor does.

### How it works

**Terminology:**

| Term | Example | Meaning |
| --- | --- | --- |
| Constant | Sita | A specific object |
| Variable | x | Stands for any object |
| Predicate | Parent(x, y) | True or false of its arguments |
| Literal | ¬Parent(x, y) | A predicate or its negation |
| Horn clause | H ← L₁ ∧ L₂ | If all of the body holds, then the head holds |

**FOIL** is like sequential covering, with two changes:

1. Learn rules that use variables, as Horn clauses.
2. In each new literal, at least one variable must already be in the rule. New variables are allowed.

The outer loop learns rules until the positives are covered. The inner loop starts with an empty body and adds literals until no negatives are covered.

**Candidate literals** for a rule with variables x, y (plus a new z) are built from known predicates: Parent(x, z), Parent(z, y), Parent(x, y), and so on, along with equality tests and negations.

**FOIL_Gain** counts **bindings**, which are the ways of assigning objects to the variables:

```text
FOIL_Gain(L, R) = t · ( log₂(p₁ / (p₁ + n₁)) − log₂(p₀ / (p₀ + n₀)) )
```

- p₀, n₀: positive and negative bindings of rule R.
- p₁, n₁: positive and negative bindings after adding L.
- t: positive bindings of R that are still covered after adding L.

It measures the bits saved in encoding the positive bindings.

**A worked gain.** p₀ = 4, n₀ = 12, p₁ = 4, n₁ = 2 and t = 4:

```text
Gain = 4 × (log₂(4/6) − log₂(4/16)) = 4 × (−0.585 + 2) = 5.66
```

**Recursive rules** are possible when the target predicate can be used in the body:

```text
Ancestor(x, y) ← Parent(x, y)
Ancestor(x, y) ← Parent(x, z) ∧ Ancestor(z, y)
```

### Run it: FOIL on a family

The program learns Grandparent from facts about Parent. Bindings extend when a literal brings in a new variable.

```python
from math import log2
from itertools import product

PEOPLE = ["Asha", "Bala", "Chitra", "Deva", "Esha", "Farid", "Gita"]
PARENT = {("Asha", "Bala"), ("Asha", "Chitra"), ("Bala", "Deva"), ("Bala", "Esha"),
          ("Chitra", "Farid"), ("Gita", "Asha")}

positives = {(x, y) for (x, z1) in PARENT for (z2, y) in PARENT if z1 == z2}
negatives = set(product(PEOPLE, PEOPLE)) - positives
print("Grandparent pairs to learn:", sorted(positives))

def extend(bindings, literal):
    """Apply Parent(a, b) to each binding; a new variable takes every value that fits."""
    a, b = literal
    out = []
    for binding in bindings:
        names_a = [binding[a]] if a in binding else PEOPLE
        names_b = [binding[b]] if b in binding else PEOPLE
        for na in names_a:
            for nb in names_b:
                if (na, nb) in PARENT:
                    out.append({**binding, a: na, b: nb})
    return out

def split(bindings):
    pos = [b for b in bindings if (b["x"], b["y"]) in positives]
    neg = [b for b in bindings if (b["x"], b["y"]) in negatives]
    return pos, neg

def foil_gain(bindings, literal):
    p0, n0 = map(len, split(bindings))
    pos1, neg1 = split(extend(bindings, literal))
    p1, n1 = len(pos1), len(neg1)
    if p1 == 0:
        return float("-inf")
    t = len({(b["x"], b["y"]) for b in pos1})
    return t * (log2(p1 / (p1 + n1)) - log2(p0 / (p0 + n0)))

bindings = [{"x": x, "y": y} for x, y in product(PEOPLE, PEOPLE)]
rule = []
variables = ["x", "y", "z"]

while split(bindings)[1]:
    candidates = [(a, b) for a in variables for b in variables if a != b and (a in bindings[0] or b in bindings[0])]
    best = max(candidates, key=lambda c: foil_gain(bindings, c))
    print(f"Add Parent{best}  FOIL_Gain = {foil_gain(bindings, best):.2f}")
    bindings = extend(bindings, best)
    rule.append(f"Parent({best[0]}, {best[1]})")

print("\nLearned rule: Grandparent(x, y) ←", " ∧ ".join(rule))
print("Positives covered:", len({(b['x'], b['y']) for b in split(bindings)[0]}), "of", len(positives))
```

**Try this:** add a new family to `PARENT`. The rule stays the same, and that is the power of first-order rules.

### Common mistakes

- **Counting examples instead of bindings.** A new variable multiplies the bindings, and FOIL_Gain counts them.
- **Forgetting that a new literal must share a variable.** A disconnected literal gives no link between the old and new variables.
- **Assuming FOIL handles noise by default.** It needs a stopping rule, so that long rules do not fit single examples.

### Problems

1. Write a Horn clause for Sibling(x, y), using Parent and an inequality.
2. Calculate FOIL_Gain with p₀ = 2, n₀ = 6, p₁ = 2, n₁ = 0 and t = 2.
3. Why can't a decision tree with fixed attributes express Ancestor?
4. Change the program to learn "Parent's sibling" (uncle or aunt). What extra predicate do you need?
5. Identify the head and body of: Daughter(x, y) ← Father(y, x) ∧ Female(x).
