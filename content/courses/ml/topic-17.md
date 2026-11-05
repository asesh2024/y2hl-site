---
title: "The backpropagation algorithm"
keywords: "backprop"
topic: 17
co: "CO3"
description: "Backpropagation passes the error backwards to find how much each weight contributed. Weight by weight, the network learns its own hidden representations."
outcomes: ["Write the backpropagation updates for a two-layer sigmoid network", "Calculate one weight update by hand", "Train a network from scratch to learn XOR", "Discuss local minima, momentum, overfitting and hidden representations", "Name some advanced variations such as other error functions and recurrent networks"]
reading: ["Textbook 1, §4.5–4.8 Backpropagation, its remarks, an illustrative example and advanced topics", "Textbook 2, Ch. on the multi-layer perceptron"]
---

### Intuition

The output is wrong. Whose fault is it? An output weight's share of the blame is direct. A hidden weight's share has to be worked out via the units it feeds. The chain rule does exactly this, and calculating it backwards from the output avoids repeating work.

### How it works

**The error** is summed over the output units:

```text
E = ½ Σ_k (t_k − o_k)²
```

**For an output unit k:**

```text
δ_k = (t_k − o_k) · o_k (1 − o_k)
Δw_jk = η · δ_k · h_j
```

**For a hidden unit j:**

```text
δ_j = h_j (1 − h_j) · Σ_k δ_k · w_jk
Δw_ij = η · δ_j · x_i
```

**The algorithm:**

```text
start with small random weights
repeat for many epochs:
    for each training example:
        forward:  calculate every unit's output
        backward: calculate δ for output units, then hidden units
        update:   change every weight by η · δ · (its input)
```

**A single update by hand.** One sigmoid output unit: input x = 1, weight w = 0, no bias, target t = 1, η = 0.5.

```text
net = 0, o = σ(0) = 0.5
δ = (1 − 0.5) × 0.5 × 0.5 = 0.125
Δw = 0.5 × 0.125 × 1 = 0.0625
new w = 0.0625
```

**Remarks on the algorithm:**

| Issue | What to know |
| --- | --- |
| Convergence | To a local minimum of E, not necessarily the global one. Several random restarts help |
| Momentum | Add a fraction of the last update: Δw(n) = η·δ·x + α·Δw(n−1). This rolls through small dips and speeds up flat regions |
| Inductive bias | Roughly, a preference for smooth changes between data points |
| Hidden representations | Hidden units discover useful intermediate features by themselves |
| Stopping and overfitting | Training error keeps dropping, and validation error eventually rises. Stop at the validation minimum |

**Advanced topics:**

- **Other error functions:** add a penalty on weight size (weight decay), or use cross entropy for probabilities (topic 9).
- **Other minimisers:** line search and conjugate gradient choose steps more carefully than plain gradient descent.
- **Recurrent networks:** feed outputs back as inputs, so the network can process sequences.
- **Dynamic structure:** add or remove units during training.

### Run it: backpropagation from scratch

This is the complete algorithm using NumPy on XOR, with one hidden layer of 2 neurons. A batch update is used, so each epoch needs only one line of matrix arithmetic per layer.

```python
import numpy as np

rng = np.random.default_rng(2)

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
t = np.array([[0], [1], [1], [0]], dtype=float)
X_b = np.hstack([X, np.ones((4, 1))])             # add a bias input of 1

W = rng.uniform(-1, 1, (3, 2))                    # input (+ bias) to 2 hidden units
V = rng.uniform(-1, 1, (3, 1))                    # hidden (+ bias) to 1 output
eta = 1.0

def sigmoid(y):
    return 1 / (1 + np.exp(-y))

for epoch in range(5001):
    h = sigmoid(X_b @ W)                          # forward pass
    h_b = np.hstack([h, np.ones((4, 1))])
    o = sigmoid(h_b @ V)

    delta_o = (t - o) * o * (1 - o)               # backward pass
    delta_h = h * (1 - h) * (delta_o @ V[:2].T)

    V += eta * h_b.T @ delta_o                    # update
    W += eta * X_b.T @ delta_h

    if epoch in (0, 100, 500, 1000, 2000, 5000):
        print(f"epoch {epoch:5}: E = {0.5 * np.sum((t - o) ** 2):.4f}")

print("\nOutputs:", np.round(o.ravel(), 3))
print("Hidden unit values for the 4 inputs:")
print(np.round(h, 2))
```

The last table is the learned **hidden representation**. Nobody told the network what these units should mean.

**Try this:** change the seed in `default_rng`. Some seeds get stuck for a long time in a local minimum near E = 0.5. Then try 4 hidden units by changing the shapes. Stuck runs become rarer.

### Common mistakes

- **Starting all weights at zero.** Hidden units stay identical forever, as they get identical updates. Start with small random values.
- **Treating training error as the goal.** Watch validation error, and stop when it starts rising.
- **Confusing δ for output and hidden units.** The hidden unit's δ gathers contributions from every output it feeds.

### Problems

1. Do one update by hand: x = 2, w = 0, t = 1, η = 0.1.
2. Derive δ_k from E using the chain rule.
3. Add momentum to the program, with α = 0.9. Does it reach a low E sooner?
4. Add a second output unit that computes AND of the same inputs, and train both.
5. Plot E against epoch using matplotlib.
