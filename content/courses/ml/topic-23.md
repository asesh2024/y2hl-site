---
title: "Analytical learning: inductive and analytical problems"
topic: 23
co: "CO4"
description: "Inductive learners need many examples because they know nothing else. A learner with a good domain theory can generalise correctly from just one example, by explaining why it works."
outcomes: ["Contrast inductive and analytical learning", "State the analytical learning problem", "Define a perfect domain theory", "Explain why analytical learning needs fewer examples"]
reading: ["Textbook 1, §11.1 Introduction", "Textbook 1, §11.2 Learning with perfect domain theories: Prolog-EBG (the problem statement)"]
---

### Intuition

Show a chess beginner one position where a knight attacks a king and a queen at the same time. They don't need 10,000 examples to see the general idea: a fork wins material. They already know the rules, so they can **explain** why this works, and the explanation shows which details matter. The colour of the squares and the other pieces do not.

This is analytical learning. It uses prior knowledge to analyse each example.

### How it works

**Two problems side by side:**

| | Inductive learning | Analytical learning |
| --- | --- | --- |
| Given | Hypothesis space H, training examples D | Hypothesis space H, training examples D, **domain theory B** |
| Finds | h consistent with D | h consistent with D **and** B |
| Justification | Statistical, by fitting many examples | Deductive, by explaining each example |
| Data needed | Many examples | Possibly very few |
| Weakness | Needs lots of data | Needs a correct theory |

**A domain theory** is a set of rules about the problem, and it is **perfect** if it is:

- **correct:** each statement is true, and
- **complete:** it covers every positive example of the target, in the instance space.

**Example.** Learn "it is safe to stack x on y".

- *Example:* a box on an endtable, with attributes such as Colour and Owner, as well as Volume, Density and Material.
- *Domain theory:* SafeToStack(x, y) if x is lighter than y. Weight is Volume × Density. Endtables weigh 5 by default.

The theory already implies the target. So what is there to learn? This is the odd thing about it: learning here means **operationalising** the knowledge, by rewriting it in a form that can be used quickly with facts we can observe directly.

**Why is this useful?** A perfect chess theory (the rules) exists, and can in principle tell you the best move, but it would take far too long. Learning from examples turns slow, correct knowledge into fast, usable rules.

**Which is best?** Inductive learning handles noise and has no need for a theory, but it needs many examples. Analytical learning works from little data, but it is misled by a faulty theory. Real systems may combine both, and they often do.

### Run it: inductive learning against analytical learning

Both learners face the same rule with only a few examples. The inductive one guesses from what it has seen. The analytical one uses a known theory that identifies the attributes that matter.

```python
import random
from itertools import product

random.seed(1)
# Each instance: (volume 1-5, density 1-3, colour, owner). Safe if weight = volume * density < 5.
ALL = list(product(range(1, 6), range(1, 4), ["red", "blue"], ["Asha", "Bala"]))

def truth(x):
    return x[0] * x[1] < 5

def inductive(train):
    """Remember all examples; a new case takes the label of the nearest stored example."""
    def predict(x):
        def distance(e):
            return sum(a != b for a, b in zip(e, x))
        return truth(min(train, key=distance))
    return predict

def analytical(train):
    """The domain theory says: only weight = volume * density matters. Learn the limit from examples."""
    safe = [x[0] * x[1] for x in train if truth(x)]
    unsafe = [x[0] * x[1] for x in train if not truth(x)]
    limit = (max(safe, default=0) + min(unsafe, default=100)) / 2
    return lambda x: x[0] * x[1] < limit

test = ALL
print("examples  inductive  analytical")
for n in [2, 4, 8, 16, 32]:
    results = [0, 0]
    trials = 300
    for _ in range(trials):
        train = random.sample(ALL, n)
        for i, learner in enumerate([inductive, analytical]):
            p = learner(train)
            results[i] += sum(p(x) == truth(x) for x in test) / len(test)
    print(f"{n:8}  {results[0] / trials:9.3f}  {results[1] / trials:10.3f}")
```

Analytical learning is far ahead when examples are few. The advantage shrinks as data grows.

**Try this:** give the analytical learner a wrong theory, such as "only volume matters". What happens to its accuracy as the data grows?

### Common mistakes

- **Thinking analytical learning has nothing to learn.** It speeds things up and picks out what matters, though it adds no new deductive knowledge.
- **Assuming a perfect theory is common.** Outside rule-defined areas like games, theories are usually imperfect.
- **Confusing "consistent with B" with "seen in B".** A hypothesis must simply not contradict the theory.

### Problems

1. Give two real tasks with a nearly perfect domain theory, and two with none.
2. Explain why a perfect chess theory does not make a player perfect.
3. List the given inputs and required output of the analytical learning problem.
4. In the program, make a wrong theory and report how accuracy changes with data.
5. In the chess fork example, which features does the explanation show to be irrelevant?
