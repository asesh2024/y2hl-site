---
title: "Building an ANN classifier, with a genetic optimiser"
keywords: "mlp ann tensorflow"
topic: 35
co: "CO5"
description: "Use a multilayer network on a practical task, predicting rain from weather readings. Then train one with a genetic algorithm in place of backpropagation."
outcomes: ["Build and tune an MLP classifier in scikit-learn", "Choose hidden layers and learning settings", "Detect overfitting with learning curves", "Train a network's weights using a genetic algorithm", "Compare the genetic optimiser with backpropagation"]
reading: ["Textbook 1, Ch. 4 Artificial neural networks", "Textbook 1, Ch. 9 Genetic algorithms", "Textbook 2, Ch. on the multi-layer perceptron", "Topics 17 and 18 of this course"]
---

### Intuition

Topic 17 built backpropagation by hand. A library does the same work with better optimisers, so you can focus on design questions: how many layers, how big, and when to stop. Then we return to topic 18, and see that weights are just a list of numbers. A genetic algorithm can evolve them with no gradients at all.

### How it works

**A recipe for an MLP classifier:**

1. Scale the inputs, as networks train badly on raw scales.
2. Start small: one hidden layer, then grow if it underfits.
3. Use a validation score to choose the size and the penalty `alpha`.
4. Stop early when validation stops improving.

| Setting | In `MLPClassifier` | Effect |
| --- | --- | --- |
| Architecture | `hidden_layer_sizes=(16, 8)` | Larger means more capacity and more overfitting risk |
| Activation | `activation="relu"` | Non-linearity |
| Optimiser | `solver="adam"` | How the weights are updated |
| Penalty | `alpha=0.001` | Weight decay, which discourages big weights |
| Early stop | `early_stopping=True` | Holds out data, and stops when it stops improving |

**A genetic optimiser** treats all the weights as one individual:

- **Individual:** a vector of real-valued weights.
- **Fitness:** accuracy or negative loss on the training data.
- **Crossover:** mix two parents' weights.
- **Mutation:** add small Gaussian noise.

| | Backpropagation | Genetic optimiser |
| --- | --- | --- |
| Needs a gradient | Yes | No |
| Scales to many weights | Very well | Poorly |
| Useful when | Loss is smooth | Gradients are not available, or the fitness is unusual |

### Run it: predicting rain with an MLP

These weather readings are generated for practice. Rain is more likely when humidity is high, pressure is low and there is plenty of cloud.

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(7)
n = 1500
temp = rng.normal(30, 5, n)
humidity = np.clip(rng.normal(65, 18, n), 10, 100)
pressure = rng.normal(1008, 6, n)
cloud = np.clip(rng.normal(50, 25, n), 0, 100)
wind = np.abs(rng.normal(12, 6, n))

score = (0.06 * (humidity - 65) - 0.15 * (pressure - 1008) + 0.04 * (cloud - 50)
         + 0.0015 * (humidity - 65) * (cloud - 50) - 0.8)
rain = rng.random(n) < 1 / (1 + np.exp(-score))
X = np.column_stack([temp, humidity, pressure, cloud, wind])
print(f"{n} days, rain on {rain.mean():.1%} of them")

X_train, X_test, y_train, y_test = train_test_split(X, rain, test_size=0.25, random_state=0, stratify=rain)

print("\nHidden layers    train acc  test acc")
for layers in [(2,), (8,), (16, 8), (64, 64)]:
    model = make_pipeline(StandardScaler(), MLPClassifier(layers, max_iter=1500, random_state=0))
    model.fit(X_train, y_train)
    print(f"{str(layers):15}  {model.score(X_train, y_train):9.3f}  {model.score(X_test, y_test):8.3f}")

best = make_pipeline(StandardScaler(), MLPClassifier((16, 8), max_iter=1500, alpha=0.01,
                                                     early_stopping=True, random_state=0))
best.fit(X_train, y_train)
print("\nFinal model, with weight decay and early stopping")
print(classification_report(y_test, best.predict(X_test), target_names=["dry", "rain"], digits=3))

net = best.named_steps["mlpclassifier"]
fig, ax = plt.subplots(1, 2, figsize=(10, 3.2))
ax[0].plot(net.loss_curve_, color="#c2410c")
ax[0].set(title="Training loss", xlabel="epoch")
ax[1].plot(net.validation_scores_, color="#0f766e")
ax[1].set(title="Validation accuracy", xlabel="epoch")
plt.tight_layout()
plt.show()
```

### Run it: training a small network with a genetic algorithm

This network has one hidden layer of 3 units, with no gradients anywhere. Fitness is the training accuracy, with a small bonus for lower log loss, so that the search has something to climb even when accuracy is level.

```python
import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

rng = np.random.default_rng(3)
X, y = make_moons(300, noise=0.2, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

HIDDEN = 3
SIZE = (2 + 1) * HIDDEN + (HIDDEN + 1)              # weights, counting biases

def forward(w, X):
    W = w[:3 * HIDDEN].reshape(3, HIDDEN)
    V = w[3 * HIDDEN:]
    A = np.hstack([X, np.ones((len(X), 1))])
    h = np.tanh(A @ W)
    z = np.hstack([h, np.ones((len(X), 1))]) @ V
    return 1 / (1 + np.exp(-np.clip(z, -30, 30)))

def accuracy(w, X, y):
    return ((forward(w, X) > 0.5) == y).mean()

def fitness(w):
    p = np.clip(forward(w, X_train), 1e-6, 1 - 1e-6)
    loss = -np.mean(y_train * np.log(p) + (1 - y_train) * np.log(1 - p))
    return accuracy(w, X_train, y_train) - 0.05 * loss

population = rng.normal(0, 1, (80, SIZE))
print("Weights per individual:", SIZE)
for generation in range(151):
    scores = np.array([fitness(w) for w in population])
    order = np.argsort(scores)[::-1]
    population = population[order]
    if generation % 30 == 0:
        print(f"generation {generation:3}: train accuracy {accuracy(population[0], X_train, y_train):.3f}")
    parents = population[:20]
    children = [population[0].copy(), population[1].copy()]             # elitism
    while len(children) < len(population):
        a, b = parents[rng.integers(20)], parents[rng.integers(20)]
        mask = rng.random(SIZE) < 0.5                                   # uniform crossover
        child = np.where(mask, a, b) + rng.normal(0, 0.2, SIZE) * (rng.random(SIZE) < 0.2)
        children.append(child)
    population = np.array(children)

ga = accuracy(population[0], X_test, y_test)
bp = MLPClassifier((HIDDEN,), activation="tanh", max_iter=3000, random_state=0).fit(X_train, y_train)
print(f"\nTest accuracy, genetic optimiser: {ga:.3f}")
print(f"Test accuracy, backpropagation:   {bp.score(X_test, y_test):.3f}")
```

The GA used about 12,000 network evaluations for just 13 weights. Here it does well, and the single backpropagation run may even do worse, because one run can stop at a poor solution. But this cost per weight is why gradients win on big networks: try the GA with a million weights, and it gets nowhere.

**Try this:** change `random_state=0` in `MLPClassifier` a few times, and see how much backpropagation's score varies with its starting weights.

### Common mistakes

- **Forgetting to scale inputs.** Network training suffers badly.
- **Growing the network when the data is the problem.** More units cannot invent information.
- **Picking a size from the test score.** Our table shows the test column for learning, but real tuning should use validation.

### Problems

1. Count the weights, including biases, of a network with 5 inputs, hidden layers (16, 8), and 1 output.
2. Add a `tanh` option to the first program. Does it help?
3. In the GA program, try mutation sizes 0.05 and 1.0. What happens?
4. Add a learning curve: train on 10%, 25%, 50% and 100% of the data, and plot the test score.
5. Explain why a GA suits a task where the fitness is the profit from a simulated trading rule.
