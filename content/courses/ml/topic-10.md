---
title: "MDL, the Bayes optimal classifier and the Gibbs algorithm"
topic: 10
co: "CO2"
description: "The most probable hypothesis does not always give the most probable answer. The Bayes optimal classifier fixes this by combining every hypothesis, and MDL links short hypotheses to Bayes."
outcomes: ["Explain the minimum description length principle", "Calculate a Bayes optimal classification", "Show when the MAP hypothesis disagrees with the Bayes optimal answer", "Describe the Gibbs algorithm and its error bound"]
reading: ["Textbook 1, §6.6 Minimum description length principle", "Textbook 1, §6.7 Bayes optimal classifier", "Textbook 1, §6.8 Gibbs algorithm"]
---

### Intuition

Suppose three experts vote, weighted by how likely each is to be right. The single most trusted expert might say Yes while the combined weight of the others says No. Going with the top expert alone is not the best decision. You should weigh everyone. This is what the Bayes optimal classifier does.

### How it works

**Minimum description length (MDL).** Take the log of the MAP formula:

```text
h_MAP = argmin [ −log₂ P(D|h) − log₂ P(h) ]
```

In information theory, an event with probability p needs −log₂ p bits to encode. So:

```text
h_MDL = argmin [ L(h) + L(D|h) ]
              bits to      bits to describe the data
              describe h   given h (its errors)
```

Prefer the hypothesis giving the shortest total description. A big tree costs more bits but has few errors to list. A small tree is cheap but has more errors to list. This is Occam's razor with a price tag, and it justifies pruning. It equals MAP only when the encodings are the optimal ones for the true prior and likelihood.

**Bayes optimal classifier.** To classify a new instance, do not choose a hypothesis. Weigh all hypotheses by their posterior:

```text
v = argmax over v of  Σ P(v | hᵢ) · P(hᵢ | D)
```

**Example:**

| Hypothesis | P(h\|D) | Says |
| --- | --- | --- |
| h1 | 0.4 | + |
| h2 | 0.3 | − |
| h3 | 0.3 | − |

The MAP hypothesis is h1, which says **+**. The weighted vote gives P(+) = 0.4 and P(−) = 0.6, so Bayes optimal says **−**. No other method using the same hypothesis space and prior can do better on average, but it is usually too expensive, as it needs every hypothesis.

**Gibbs algorithm.** A cheap alternative:

1. Pick one hypothesis at random, according to P(h|D).
2. Use it to classify the instance.

Under certain conditions, its expected error is at most **twice** that of the Bayes optimal classifier. That is surprisingly good for such a simple method.

### Run it: three ways of deciding

```python
import random

random.seed(3)

posteriors = {"h1": 0.4, "h2": 0.3, "h3": 0.3}
says = {"h1": "+", "h2": "-", "h3": "-"}

map_h = max(posteriors, key=posteriors.get)
print("MAP hypothesis:", map_h, "says", says[map_h])

votes = {"+": 0.0, "-": 0.0}
for h, p in posteriors.items():
    votes[says[h]] += p
print("Bayes optimal votes:", votes, "-> says", max(votes, key=votes.get))

names, weights = zip(*posteriors.items())
trials = 10000
plus = sum(says[random.choices(names, weights)[0]] == "+" for _ in range(trials))
print(f"Gibbs says + on {100 * plus / trials:.1f}% of the runs")

# Suppose the truth is - with probability 0.6, and + with probability 0.4.
print("\nExpected error when P(truth = -) is 0.6:")
bayes_error = 0.4                    # Bayes always says -, wrong when truth is +
gibbs_error = 0.4 * 0.6 + 0.6 * 0.4  # says + with 0.4 (wrong if truth is -), and so on
print(f"Bayes optimal {bayes_error:.2f}, Gibbs {gibbs_error:.2f}, ratio {gibbs_error / bayes_error:.2f}")
```

**Try this:** change the posteriors to 0.6, 0.2, 0.2. Do MAP and Bayes optimal agree now? Why?

### Common mistakes

- **Thinking the optimal classifier's answer always comes from one hypothesis.** Its combined answer may match no single hypothesis in H.
- **Equating MDL with MAP for any encoding.** They match only for optimal codes.
- **Thinking Gibbs is the same as MAP.** It samples, so its answer can change between runs.

### Problems

1. h1, h2, h3 and h4 have posteriors 0.35, 0.25, 0.2 and 0.2, and say +, −, −, +. Find the MAP and Bayes optimal answers.
2. An event has probability 1/8. How many bits does it need under an optimal code?
3. Tree A needs 20 bits and makes 5 errors. Tree B needs 60 bits and makes 0 errors. Each error costs 6 bits to list. Which does MDL prefer?
4. Why is the Bayes optimal classifier impractical for large hypothesis spaces?
5. In your own words, why is the Gibbs error bound surprising?
