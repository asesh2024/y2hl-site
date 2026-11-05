---
title: "Reinforcement learning: Q-learning"
keywords: "rl"
topic: 25
co: "CO4"
description: "No one tells the agent which action is right. It only gets rewards, sometimes much later. Q-learning still finds the best action in each state, from trial and error alone."
outcomes: ["Describe the task of learning sequential control", "Define policy, reward, discount factor and the Q function", "Apply the Q-learning update by hand", "Explain exploration against exploitation", "Implement Q-learning for a small grid world"]
reading: ["Textbook 1, §13.1–13.3 Introduction, the learning task and Q learning", "Textbook 2, Ch. on reinforcement learning"]
---

### Intuition

Teach a dog to fetch with treats. You cannot tell it each muscle movement. You just reward the result. A reinforcement learner is like the dog. It tries actions, gets rewards, and learns which actions lead to reward in the long run.

Two things make this hard. Rewards can be **delayed**, so the action that earned one may have happened long before. And the learner's own actions decide what it gets to see.

### How it works

**The setting.** At each step, the agent sees a state s, takes action a, gets reward r and moves to a new state. The goal is a **policy** π(s), which is a rule that chooses an action in each state, to maximise the **discounted cumulative reward**:

```text
V = r₀ + γ r₁ + γ² r₂ + …     (0 ≤ γ < 1)
```

The **discount factor** γ makes distant rewards count for less.

**The Q function.** Q(s, a) is the reward for taking a in s, plus the discounted value of acting optimally from then on:

```text
Q(s, a) = r(s, a) + γ · max over a′ of Q(s′, a′)
```

If we know Q, the best policy needs no model of the world: **in each state, take the action with the highest Q**.

**The Q-learning algorithm (deterministic world):**

```text
set every Q̂(s, a) to 0
observe the current state s
repeat forever:
    choose an action a, and do it
    receive reward r, and observe the new state s′
    Q̂(s, a) ← r + γ · max over a′ of Q̂(s′, a′)
    s ← s′
```

For a deterministic world where every state-action pair is visited infinitely often, Q̂ converges to Q.

**Worked example.** γ = 0.9. Moving into goal G pays 100, and all other moves pay 0. In a corridor A → B → G:

```text
Q(B, right) = 100 + 0.9 × 0              = 100
Q(A, right) = 0   + 0.9 × 100            = 90
```

The value spreads backward from the reward, one step per visit.

**Exploration against exploitation.** If the agent always picks the best-known action, it may miss better ones. Common ways to balance the two are **ε-greedy** (with a small chance ε, act randomly) and **Boltzmann selection**:

```text
P(aᵢ | s) = k^Q̂(s, aᵢ) / Σⱼ k^Q̂(s, aⱼ)
```

A larger k favours exploiting known values.

**Non-deterministic worlds** need a decaying learning rate α:

```text
Q̂(s, a) ← (1 − α) Q̂(s, a) + α [ r + γ max Q̂(s′, a′) ]
```

### Run it: Q-learning in a grid world

A 2 × 3 grid, with the goal in the top right. Entering the goal pays 100, and the goal is absorbing. Actions that would leave the grid are not allowed.

```python
import random

random.seed(0)
ROWS, COLS = 2, 3
GOAL = (0, 2)
GAMMA = 0.9
MOVES = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}

states = [(r, c) for r in range(ROWS) for c in range(COLS)]

def actions(s):
    return [a for a, (dr, dc) in MOVES.items()
            if 0 <= s[0] + dr < ROWS and 0 <= s[1] + dc < COLS]

Q = {(s, a): 0.0 for s in states for a in actions(s)}

for episode in range(300):
    s = random.choice([x for x in states if x != GOAL])
    while s != GOAL:
        a = random.choice(actions(s))                # explore at random
        dr, dc = MOVES[a]
        new = (s[0] + dr, s[1] + dc)
        r = 100 if new == GOAL else 0
        future = 0 if new == GOAL else max(Q[(new, b)] for b in actions(new))
        Q[(s, a)] = r + GAMMA * future
        s = new

print("Learned Q values")
for s in states:
    if s != GOAL:
        print(s, {a: round(Q[(s, a)], 1) for a in actions(s)})

print("\nBest action in each state")
arrows = {"up": "^", "down": "v", "left": "<", "right": ">"}
for r in range(ROWS):
    row = []
    for c in range(COLS):
        if (r, c) == GOAL:
            row.append("G")
        else:
            row.append(arrows[max(actions((r, c)), key=lambda a: Q[((r, c), a)])])
    print(" ".join(row))
```

The values come out as 100, 90, 81 and 72.9, which are powers of 0.9 times the reward. These are the same as you would get by hand.

**Try this:** change γ to 0.5 and see how the values change. Add a wall or a penalty state with reward −50 to a cell, and look at the new policy.

### Common mistakes

- **Using Q̂ with no exploration.** The agent may keep following a mediocre route and never find a better one.
- **Bootstrapping from the terminal state.** A goal state has no future, so its future value is 0.
- **Leaving α = 1 in a noisy world.** A single unlucky result can then overwrite everything learned so far.

### Problems

1. With γ = 0.8 and reward 100 into the goal, calculate Q for a state two moves from the goal (on the shortest path).
2. Apply one update: r = 0, γ = 0.9, the best Q at the next state is 50. What is the new Q̂(s, a)?
3. Explain the difference between V(s) and Q(s, a).
4. Change the program to use ε-greedy action choice with ε = 0.1.
5. Why does Q-learning need no model of the world, while a planner using V does?
