---
title: "Perceptron training, gradient descent and the delta rule"
keywords: "sgd lms"
topic: 15
co: "CO3"
description: "Two rules for learning the weights: the perceptron rule finds a separator when one exists, and the delta rule finds the best fit even when none exists."
outcomes: ["Apply the perceptron training rule by hand", "State when the perceptron rule converges", "Derive gradient descent for a linear unit", "Compare batch and stochastic gradient descent", "Train perceptrons for AND and OR in Python"]
reading: ["Textbook 1, §4.4 Perceptrons (training rule, gradient descent and the delta rule)", "Textbook 2, Ch. on neurons, neural networks and linear discriminants"]
---

### Intuition

Start with small random weights. Show the unit an example. If it is wrong, nudge the weights to make it a little less wrong on that example. Do this for many passes. That simple loop is the heart of most neural network training.

### How it works

**The perceptron training rule:**

```text
wᵢ ← wᵢ + η (t − o) xᵢ
```

t is the target, o is the unit's thresholded output, and η is the learning rate. If the output is correct, nothing changes. If t = 1 and o = 0, the weights on active inputs go up. If t = 0 and o = 1, they go down.

**Trace for AND**, with η = 0.2, starting from w = (0, 0, 0) and using a constant input of 1 for the bias. Output is 1 if the sum is above 0:

| x₁ x₂ | t | sum | o | Change | New w (w₀, w₁, w₂) |
| --- | --- | --- | --- | --- | --- |
| 0 0 | 0 | 0.0 | 0 | none | (0, 0, 0) |
| 0 1 | 0 | 0.0 | 0 | none | (0, 0, 0) |
| 1 0 | 0 | 0.0 | 0 | none | (0, 0, 0) |
| 1 1 | 1 | 0.0 | 0 | +0.2 to each | (0.2, 0.2, 0.2) |

Further passes keep correcting until all four are right.

**Convergence:** if the data is linearly separable and η is small enough, the rule is guaranteed to find a separator in a finite number of steps. If the data is not separable, it never settles.

**The delta rule** drops the threshold and treats the unit as linear, o = w·x. It minimises the squared error:

```text
E(w) = ½ Σ (t_d − o_d)²
```

Gradient descent moves opposite to the slope. Working out the derivative:

```text
∂E/∂wᵢ = − Σ (t_d − o_d) x_id
Δwᵢ = η Σ (t_d − o_d) x_id
```

This converges towards the minimum-error weights even if the data is not separable, as long as η is small enough, because E is a bowl with one minimum.

| | Perceptron rule | Delta rule |
| --- | --- | --- |
| Error measured on | Thresholded output | Linear output |
| Not separable data | Never settles | Reaches the best fit |
| Separable data | Finite steps, exact separator | Approaches the fit, may not separate |

**Batch or stochastic.** Batch gradient descent sums over all examples before each update. **Stochastic** (incremental) gradient descent updates after each example. It is cheaper per update and can sometimes escape shallow local minima.

### Run it: AND and OR by training

```python
def train(data, eta=0.2, max_epochs=50):
    w = [0.0, 0.0, 0.0]
    for epoch in range(1, max_epochs + 1):
        mistakes = 0
        for x1, x2, t in data:
            o = 1 if w[0] + w[1] * x1 + w[2] * x2 > 0 else 0
            if o != t:
                mistakes += 1
                w[0] += eta * (t - o)
                w[1] += eta * (t - o) * x1
                w[2] += eta * (t - o) * x2
        print(f"  epoch {epoch}: mistakes = {mistakes}, w = {[round(v, 1) for v in w]}")
        if mistakes == 0:
            return w
    print("  did not converge")
    return w

GATES = {
    "AND": [(0, 0, 0), (0, 1, 0), (1, 0, 0), (1, 1, 1)],
    "OR": [(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 1)],
}
for name, data in GATES.items():
    print(name)
    train(data)

print("XOR")
w = train([(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 0)], max_epochs=6)
```

XOR never reaches zero mistakes, as topic 14 predicts.

### Run it: the delta rule on non-separable data

```python
data = [(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 0)]     # XOR again
w = [0.0, 0.0, 0.0]
eta = 0.05

for epoch in range(501):
    grad = [0.0, 0.0, 0.0]
    error = 0.0
    for x1, x2, t in data:
        o = w[0] + w[1] * x1 + w[2] * x2
        error += 0.5 * (t - o) ** 2
        grad[0] += (t - o)
        grad[1] += (t - o) * x1
        grad[2] += (t - o) * x2
    if epoch in (0, 10, 100, 500):
        print(f"epoch {epoch:3}: E = {error:.4f}, w = {[round(v, 3) for v in w]}")
    w = [wi + eta * g for wi, g in zip(w, grad)]
```

The error settles at the best a linear unit can do, 0.5, with weights close to (0.5, 0, 0). It predicts 0.5 for all four points, which is honest but useless. A hidden layer is needed.

### Common mistakes

- **Using the perceptron rule on non-separable data and waiting.** It will never stop by itself.
- **Forgetting the bias update.** The bias has a constant input of 1, so it changes too.
- **Too large a learning rate in gradient descent.** It can overshoot the minimum.

### Problems

1. Continue the AND trace by hand until a full pass makes no mistakes.
2. With w = (0.5, −0.5, 0.5), x = (1, 1), t = 1 and η = 0.1, apply one perceptron update (the threshold is at 0).
3. Derive ∂E/∂wᵢ for the delta rule step by step.
4. Change the code to train a NOT gate on one input.
5. Why can stochastic gradient descent cost less per update than batch descent on a million examples?
