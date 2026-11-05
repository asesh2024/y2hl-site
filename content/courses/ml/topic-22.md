---
title: "Induction as inverted deduction and inverting resolution"
keywords: "ilp"
topic: 22
co: "CO4"
description: "Deduction goes from rules to facts. Run it backwards, and you have a way to invent the rules that would explain the facts."
outcomes: ["State the view of induction as inverted deduction", "Apply the resolution rule", "Invert a propositional resolution step by hand", "Explain what first-order resolution adds through substitution", "Describe the limits of this approach"]
reading: ["Textbook 1, §10.6 Induction as inverted deduction", "Textbook 1, §10.7 Inverting resolution"]
---

### Intuition

Given that "all humans are mortal" and "Socrates is human", deduction concludes "Socrates is mortal". Suppose instead that you know "Socrates is human" and "Socrates is mortal". Induction asks: **what rule, if true, would make this conclusion follow?**

### How it works

**Induction as inverted deduction.** For each training example ⟨xᵢ, f(xᵢ)⟩, find a hypothesis h so that the example's classification can be deduced, using background knowledge B:

```text
(B ∧ h ∧ xᵢ) ⊢ f(xᵢ)
```

**Example.** Let the target be Child(u, v), with:

- example: Child(Bob, Sharon);
- description: Male(Bob), Female(Sharon), Father(Sharon, Bob);
- background: Parent(u, v) ← Father(u, v).

Two hypotheses that satisfy this:

- h₁: Child(u, v) ← Father(v, u)
- h₂: Child(u, v) ← Parent(v, u)

h₂ is possible only because of the background knowledge.

**Pros and cons:**

| Good | Limits |
| --- | --- |
| Includes background knowledge naturally | The requirement does not handle noisy data well |
| Search is guided by what is known | Too many hypotheses can satisfy it, and they grow with the data |
| | Background knowledge can make the search larger |

**The resolution rule.** From two clauses containing a complementary pair, derive a new clause:

```text
C₁ = P ∨ L
C₂ = ¬L ∨ R
────────────
C  = P ∨ R
```

**Inverting resolution.** Given C and C₁, propose C₂. Find the literal L that appears in C₁ but not in C, and then:

```text
C₂ = (C − (C₁ − {L})) ∪ {¬L}
```

**Example.** Take C = A ∨ B, and C₁ = B ∨ D. L is D, because it is in C₁ but not in C.

```text
C − (C₁ − {D}) = {A, B} − {B} = {A}
C₂ = {A} ∪ {¬D} = A ∨ ¬D
```

Check by resolving C₁ with C₂ on D: (B ∨ D) and (A ∨ ¬D) give B ∨ A. ✓

**First-order resolution.** Literals need not be identical, only made identical by a **substitution** θ. Find the most general unifier, and apply it. For example, θ = {x/Tom} unifies Parent(x, Bob) with Parent(Tom, Bob). Inverting it means generalising, for example by replacing constants with variables.

This idea leads to inductive logic programming systems. **Progol** bounds the search by first using one example to build a most specific hypothesis. It then searches between that and the most general rule.

### Run it: resolution and its inverse

Clauses are sets of literal strings, and `~` means NOT.

```python
def negate(lit):
    return lit[1:] if lit.startswith("~") else "~" + lit

def resolve(c1, c2):
    """Return every resolvent of two clauses."""
    results = []
    for lit in c1:
        if negate(lit) in c2:
            results.append((c1 - {lit}) | (c2 - {negate(lit)}))
    return results

def inverse_resolve(c, c1):
    """Given the resolvent c and one parent c1, propose possible other parents."""
    proposals = []
    for lit in c1 - c:
        proposals.append((c - (c1 - {lit})) | {negate(lit)})
    return proposals

def show(clause):
    return " v ".join(sorted(clause)) or "(empty)"

C = {"A", "B"}
C1 = {"B", "D"}
print("Resolvent C:", show(C), "  known parent C1:", show(C1))
for C2 in inverse_resolve(C, C1):
    print("Proposed C2:", show(C2))
    print("Check, resolve C1 with C2:", [show(r) for r in resolve(C1, C2)])

print()
# A worked rule: from a fact and a conclusion, invent a rule.
fact = {"Father_Sharon_Bob"}
example = {"Child_Bob_Sharon"}
for rule in inverse_resolve(example, fact):
    print("Invented rule:", show(rule))
    print("In other words: Child_Bob_Sharon <- Father_Sharon_Bob")
    print("Check:", [show(r) for r in resolve(fact, rule)])
```

**Try this:** run `inverse_resolve` with C = {"A"} and C1 = {"A", "B", "D"}. How many different proposals does it give? This is the growth problem mentioned above.

### Common mistakes

- **Thinking inverse resolution has a unique answer.** It is non-deterministic, so there are many possible clauses.
- **Forgetting to verify.** Resolve the proposal with the given parent to check that you get C back.
- **Treating noise as if it were solved.** The strict deduction requirement fails on contradictory examples.

### Problems

1. Resolve (A ∨ ¬B) with (B ∨ C).
2. Given C = A ∨ C and C₁ = C ∨ ¬D, find C₂ by inverse resolution. Verify it.
3. Find a most general unifier for Likes(x, Rice) and Likes(Tom, y).
4. Why does more background knowledge sometimes make induction harder here?
5. Write two different hypotheses for the Child example not listed above.
