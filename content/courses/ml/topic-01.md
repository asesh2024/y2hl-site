---
title: "What machine learning is: well-posed learning problems"
keywords: "ml t p e"
topic: 1
co: "CO1"
description: "A program learns when experience makes it measurably better at a task. Naming the task, the measure and the experience turns a vague wish into a problem you can solve."
outcomes: ["Define learning using task T, performance measure P and experience E", "Turn a real-world goal into a well-posed learning problem", "Tell supervised, unsupervised and reinforcement learning apart", "List the main issues a machine learning project must face"]
reading: ["Textbook 1, Ch. 1 Introduction (§1.1 Well-posed learning problems)", "Textbook 2, Ch. 1 Introduction", "Reference book 1, Ch. 1 Introduction"]
---

### Intuition

An ordinary program follows rules someone wrote. A learning program finds its own rules from examples. Nobody can write down exactly what makes an email spam or a handwritten 7 a 7, but we can collect thousands of examples and let a program work out the pattern.

The standard definition is short: a program **learns** from experience **E**, with respect to task **T** and performance measure **P**, if its performance at T, as measured by P, improves with E.

If you cannot name all three, you do not yet have a learning problem. You have a wish.

### How it works

Here are real goals written as well-posed problems:

| Goal | Task T | Performance P | Experience E |
| --- | --- | --- | --- |
| Filter spam | Label each email spam or not | % of emails labelled correctly | Emails already labelled by users |
| Play checkers | Choose moves | % of games won | Games played against itself |
| Read handwriting | Recognise words in images | % of words recognised | Images with their words typed out |
| Predict crop yield | Estimate yield in tonnes | Average size of the error | Past seasons' weather, soil and yield |

**The three main kinds of learning** differ in what the experience looks like:

| Kind | Experience | Example |
| --- | --- | --- |
| **Supervised** | Inputs with correct answers | Emails labelled spam or not |
| **Unsupervised** | Inputs only, no answers | Grouping customers by behaviour |
| **Reinforcement** | Actions and delayed rewards | A robot rewarded for reaching a goal |

Supervised learning splits again: **classification** predicts a category, and **regression** predicts a number.

**Where it is used:** medical diagnosis, fraud and intrusion detection, speech and language systems, recommendation, and expert systems. It suits problems that are hard to program by hand, or that change over time.

**Issues every project meets:**

- Which algorithm suits this kind of data?
- How much training data is enough?
- How do we check that the result is trustworthy?
- Can prior knowledge help, even if it is only roughly right?
- Which experience should the learner see next?

### Run it: performance improving with experience

This small program learns a pass mark from examples. The hidden rule is "marks of 40 or more pass". The learner never sees that rule. It sees only labelled marks, and it is tested on marks it has not seen. Press **Run**, and watch P improve as E grows.

```python
import random

random.seed(1)

def label(mark):          # the hidden rule the learner must discover
    return mark >= 40

def train(examples):
    """Choose the threshold that makes the fewest mistakes on the examples."""
    best_t, best_errors = 0, len(examples) + 1
    for t in range(101):
        errors = sum((m >= t) != passed for m, passed in examples)
        if errors < best_errors:
            best_t, best_errors = t, errors
    return best_t

test = [random.randint(0, 100) for _ in range(2000)]

print("examples  learned threshold  test accuracy")
for size in [2, 5, 10, 50, 200]:
    marks = [random.randint(0, 100) for _ in range(size)]
    t = train([(m, label(m)) for m in marks])
    correct = sum((m >= t) == label(m) for m in test)
    print(f"{size:8}  {t:17}  {100 * correct / len(test):12.1f}%")
```

**Try this:** change the hidden rule to `mark >= 75` and run it again. The learner adapts with no change to `train`. That is what separates learning from hand-written rules.

### Common mistakes

- **Naming a task but no measure.** "Make the app smarter" cannot be tested.
- **Measuring on the training examples.** A program can memorise them. Test on data it has not seen.
- **Using machine learning when a rule will do.** If the exact rule is known and stable, as with income tax slabs, just program it.

### Problems

1. Write T, P and E for: (a) predicting tomorrow's rainfall, (b) detecting a fraudulent card payment, (c) a robot vacuum learning a room.
2. Classify each as classification, regression, clustering or reinforcement learning: predicting house price; sorting news by topic with no labels; deciding moves in a game; detecting a tumour as benign or malignant.
3. Give one task where learning is the wrong choice, and explain why.
4. In the program above, why does accuracy stop improving after a point?
5. Add label noise to the program: flip 10% of the training labels. What happens to accuracy?
