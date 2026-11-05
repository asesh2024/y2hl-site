---
title: "Genetic algorithms"
keywords: "ga"
topic: 18
co: "CO3"
description: "Keep a population of candidate solutions. Let the fitter ones breed and mutate. Over generations, good building blocks spread, with no gradient needed."
outcomes: ["Describe the steps of a genetic algorithm", "Represent hypotheses as bit strings", "Apply crossover and mutation by hand", "Calculate fitness-proportionate selection probabilities", "Implement a genetic algorithm in Python"]
reading: ["Textbook 1, §9.1–9.3 Motivation, genetic algorithms and an illustrative example", "Textbook 2, Ch. on evolutionary learning"]
---

### Intuition

Evolution has no plan and no gradient. It uses only variation and selection, yet it produces remarkable designs. Genetic algorithms use the same recipe to search huge, awkward hypothesis spaces, including ones where the fitness function has no slope to follow.

### How it works

**The algorithm:**

```text
P ← a random population of p hypotheses
repeat until a hypothesis is fit enough:
    evaluate the Fitness of each h in P
    Select:    probabilistically keep (1 − r)·p members
    Crossover: choose r·p/2 pairs, and produce two offspring from each
    Mutate:    flip a random bit in m% of the new population
    P ← the new population
return the fittest hypothesis
```

**Representing hypotheses.** Rules can be coded as bit strings, with one bit per possible value. For Outlook (Sunny, Overcast, Rain) and Wind (Strong, Weak):

```text
Rule:  IF Wind = Strong THEN PlayTennis = yes
Bits:  111  10  10
       Outlook (any)  Wind = Strong   Play = yes
```

**Crossover** swaps tails between two parents:

```text
Parents:   11101|001    00001|110
Offspring: 11101|110    00001|001
```

Single-point crossover uses one cut. Two-point crossover uses two, and uniform crossover picks each bit from either parent at random.

**Mutation** flips a random bit: 11101001 → 11100001. It restores diversity that selection and crossover cannot create.

**Fitness-proportionate (roulette) selection.** The chance of choosing hᵢ is its share of the total fitness:

```text
P(hᵢ) = Fitness(hᵢ) / Σⱼ Fitness(hⱼ)
```

With fitnesses 1, 3 and 6, the chances are 0.1, 0.3 and 0.6. **Tournament selection** instead picks two at random and keeps the fitter one with a high probability. **Rank selection** uses the position in sorted order, which reduces crowding.

**Crowding** is when one very fit individual and its near-copies take over, so diversity collapses. Tournament or rank selection helps to reduce it.

**An illustrative example.** GABIL learned rule sets for concept learning, using the fitness (percent correct)². Its results were comparable to C4.5 on a range of problems.

### Run it: a genetic algorithm from scratch

Here the target is hidden, and the fitness is the number of matching bits. A blind random search of 2³⁰ strings would be hopeless, yet the GA finds it in a few dozen generations.

```python
import random

random.seed(4)
LENGTH = 30
TARGET = [random.randint(0, 1) for _ in range(LENGTH)]

def fitness(h):
    return sum(a == b for a, b in zip(h, TARGET))

def select(population):
    """Roulette-wheel selection."""
    return random.choices(population, weights=[fitness(h) for h in population])[0]

def crossover(a, b):
    cut = random.randint(1, LENGTH - 1)
    return a[:cut] + b[cut:], b[:cut] + a[cut:]

def mutate(h, rate=0.01):
    return [1 - bit if random.random() < rate else bit for bit in h]

population = [[random.randint(0, 1) for _ in range(LENGTH)] for _ in range(60)]

for generation in range(200):
    best = max(population, key=fitness)
    average = sum(map(fitness, population)) / len(population)
    if generation % 10 == 0 or fitness(best) == LENGTH:
        print(f"generation {generation:3}: best {fitness(best):2}/{LENGTH}, average {average:.1f}")
    if fitness(best) == LENGTH:
        break
    children = [best]                         # elitism: keep the best one
    while len(children) < len(population):
        c1, c2 = crossover(select(population), select(population))
        children += [mutate(c1), mutate(c2)]
    population = children[:len(population)]

print("Found:", "".join(map(str, best)))
```

**Try this:** set the mutation rate to 0, then to 0.2. Remove elitism. What does each one do to progress?

### Common mistakes

- **Thinking a GA guarantees the best answer.** It is a stochastic search with no such promise.
- **A fitness function that misses what you want.** The GA will optimise exactly what you measure.
- **Too little mutation, or too much selection pressure.** The population converges too early, and this is crowding.

### Problems

1. Apply single-point crossover after position 3 to 101100 and 010011.
2. With fitnesses 2, 3 and 5, calculate the roulette selection probabilities.
3. Encode the rule "IF Outlook = Sunny OR Rain, AND Wind = Weak, THEN Play = no" as bits.
4. Change the program to use tournament selection.
5. Use the GA to find the x from 0 to 31 (5 bits) that maximises x(31 − x).
