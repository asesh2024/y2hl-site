---
title: "Bayes theorem and its notation"
topic: 7
co: "CO2"
description: "Bayes theorem turns what you believed before into what you should believe after seeing evidence. It often gives surprising answers, and it is the foundation of this whole unit."
outcomes: ["Use the notation P(h), P(D), P(D|h) and P(h|D)", "State Bayes theorem and name its parts", "Use Bayes theorem to calculate a posterior probability", "Explain why a rare condition stays unlikely after a positive test"]
reading: ["Textbook 1, §6.1–6.2 Introduction and Bayes theorem", "Textbook 2, Ch. on probabilistic learning", "Reference book 1, Ch. on Bayesian decision theory"]
---

### Intuition

You test positive for a rare disease using a test that is right 95% of the time. How worried should you be? Most people say "95% worried". The real answer is much lower, because the disease is rare, so most positive results come from the large healthy group.

Bayes theorem is the tool that gets this right.

### How it works

In machine learning, we ask how probable a hypothesis h is, given data D.

| Symbol | Name | Meaning |
| --- | --- | --- |
| P(h) | Prior | Belief in h before seeing any data |
| P(D) | Evidence | Probability of the data under all hypotheses |
| P(D\|h) | Likelihood | Probability of the data if h were true |
| P(h\|D) | Posterior | Belief in h after seeing the data |

```text
              P(D|h) · P(h)
  P(h|D)  =  ───────────────
                  P(D)
```

The denominator can be found by adding over all hypotheses (the theorem of total probability):

```text
P(D) = Σ P(D|hᵢ) · P(hᵢ)
```

**Worked example.** 1% of people have a disease. The test detects it 95% of the time, and gives a false positive 5% of the time.

- P(disease) = 0.01, and P(healthy) = 0.99
- P(+ | disease) = 0.95, and P(+ | healthy) = 0.05

```text
P(+)           = 0.95 × 0.01 + 0.05 × 0.99 = 0.0095 + 0.0495 = 0.059
P(disease | +) = 0.0095 / 0.059 = 0.161
```

So there is only about a **16%** chance of disease. Think of 10,000 people: 100 are ill and 95 of them test positive, but 9,900 are healthy and 495 of them test positive as well. Of the 590 positives, only 95 are truly ill.

A second independent positive test uses 0.161 as the new prior, and the probability jumps to about 0.785. Today's posterior is tomorrow's prior.

### Run it: Bayes as an update

```python
def bayes(prior, hit_rate, false_alarm):
    """Probability of the hypothesis after one positive result."""
    evidence = hit_rate * prior + false_alarm * (1 - prior)
    return hit_rate * prior / evidence

belief = 0.01
print(f"Before any test:      P(disease) = {belief:.3f}")
for test in range(1, 5):
    belief = bayes(belief, 0.95, 0.05)
    print(f"After positive test {test}: P(disease) = {belief:.3f}")

print("\nThe same test at different levels of rarity:")
for prior in [0.5, 0.1, 0.01, 0.001]:
    print(f"prior {prior:6}  ->  posterior {bayes(prior, 0.95, 0.05):.3f}")
```

**Try this:** improve the test so the false alarm rate is 0.001. How much does the first posterior change? It shows that the false alarm rate matters a great deal for rare conditions.

### Common mistakes

- **Confusing P(D|h) with P(h|D).** The chance of a positive test if ill is not the chance of illness if positive.
- **Ignoring the prior.** This is called base-rate neglect.
- **Forgetting P(D) has two parts.** It must include positives from the healthy group too.

### Problems

1. Spam makes up 40% of email. The word "lottery" is in 10% of spam and 0.5% of normal email. Given "lottery", what is the probability the email is spam?
2. Machine A makes 30% of parts with 2% defective, and machine B makes 70% with 1% defective. A part is defective. What is the probability it came from A?
3. Show that P(h|D) sums to 1 over two exhaustive, exclusive hypotheses.
4. In the program, what prior makes the first posterior exactly 0.5?
5. Explain the disease example to a friend using only counts of people.
