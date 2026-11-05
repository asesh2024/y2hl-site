---
title: "Maximum likelihood, least squares and predicting probabilities"
keywords: "mle cross entropy"
topic: 9
co: "CO2"
description: "Why do we minimise squared error? Because it is the maximum likelihood choice under Gaussian noise. Predicting probabilities leads to a different objective and a neat gradient rule."
outcomes: ["Show why least-squared error is the ML hypothesis under Gaussian noise", "Write the cross-entropy objective for predicting probabilities", "Derive the gradient search rule for a single sigmoid neuron", "Implement gradient ascent on the log likelihood"]
reading: ["Textbook 1, §6.4 Maximum likelihood and least-squared error hypotheses", "Textbook 1, §6.5 Maximum likelihood hypotheses for predicting probabilities"]
---

### Intuition

Many learners minimise squared error, and it can seem an arbitrary habit. It is not. It comes straight from one assumption: the targets are the true function's value plus Gaussian noise. Change the assumption, and the right objective changes too.

### How it works

**Least squares from maximum likelihood.** Suppose dᵢ = f(xᵢ) + eᵢ, where eᵢ is Gaussian with mean 0 and fixed variance σ². Then:

```text
h_ML = argmax Π (1/√(2πσ²)) · exp(−(dᵢ − h(xᵢ))² / 2σ²)
```

Take the logarithm, which leaves the maximiser unchanged, and drop the constants:

```text
h_ML = argmin Σ (dᵢ − h(xᵢ))²
```

So minimising the squared error **is** finding the maximum likelihood hypothesis, as long as the noise really is Gaussian. A few huge outliers break the assumption, which is why squared error is sensitive to them.

**Predicting probabilities.** Sometimes we want a probability, such as the chance a patient recovers. Each target dᵢ is 0 or 1, and h(xᵢ) is the predicted probability of 1. The likelihood of one example is h(xᵢ)^dᵢ · (1 − h(xᵢ))^(1−dᵢ), so:

```text
h_ML = argmax G(h)
G(h) = Σ [ dᵢ ln h(xᵢ) + (1 − dᵢ) ln(1 − h(xᵢ)) ]
```

The negative of G is the **cross entropy**.

**Gradient search.** Let the hypothesis be one sigmoid unit, with h(x) = σ(w·x) and σ(y) = 1/(1 + e^(−y)). The derivative turns out very simply:

```text
∂G/∂wⱼ = Σ (dᵢ − h(xᵢ)) · xᵢⱼ

wⱼ ← wⱼ + η · Σ (dᵢ − h(xᵢ)) · xᵢⱼ
```

This is gradient **ascent**, as we are maximising. The same rule appears in logistic regression (topic 29). Compare it with the backpropagation rule in topic 17, which has an extra factor h(1 − h) because it minimises squared error instead.

### Run it: gradient search to maximise likelihood

The data is hours studied against pass or fail. The program learns the pass probability for any number of hours.

```python
from math import exp, log

hours = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
passed = [0, 0, 0, 0, 1, 0, 1, 1, 1, 1]

def sigmoid(y):
    return 1 / (1 + exp(-y))

w0, w1 = 0.0, 0.0
eta = 0.05

def log_likelihood():
    total = 0
    for x, d in zip(hours, passed):
        h = sigmoid(w0 + w1 * x)
        total += d * log(h) + (1 - d) * log(1 - h)
    return total

for epoch in range(2001):
    g0 = sum((d - sigmoid(w0 + w1 * x)) * 1 for x, d in zip(hours, passed))
    g1 = sum((d - sigmoid(w0 + w1 * x)) * x for x, d in zip(hours, passed))
    if epoch in (0, 10, 100, 500, 2000):
        print(f"epoch {epoch:5}  G = {log_likelihood():8.4f}  w0 = {w0:6.3f}  w1 = {w1:6.3f}")
    w0 += eta * g0
    w1 += eta * g1

print()
for x in [1, 2, 3, 4, 5]:
    print(f"{x} hours -> P(pass) = {sigmoid(w0 + w1 * x):.3f}")
```

G climbs on every line, and the learned curve rises smoothly from fail to pass.

**Try this:** change one label, such as making `hours = 5` a fail. See how the weights respond.

### Common mistakes

- **Using squared error whatever the problem.** For probabilities, the log likelihood is the natural objective.
- **Mixing up ascent and descent.** Maximising G means adding the gradient; minimising error means subtracting it.
- **Taking log(0).** A prediction of exactly 0 or 1 makes the log undefined, so real code clips probabilities.

### Problems

1. Starting from the Gaussian likelihood, write out each step down to the least-squares form.
2. One example has d = 1 and h(x) = 0.8. Calculate its contribution to G.
3. With x = (1, 2), d = 1, h(x) = 0.5 and η = 0.1, calculate the change to each weight.
4. How does the squared-error rule for a sigmoid unit differ from this rule?
5. Why are outliers a problem for least-squares fitting, in terms of the noise assumption?
