---
title: "Learning with perfect domain theories: Prolog-EBG"
keywords: "ebg"
topic: 24
co: "CO4"
description: "Explain one example with the theory, keep only what the explanation depended on, and you have a general rule, learned from a single case."
outcomes: ["Describe the three steps of Prolog-EBG", "Build an explanation for one example", "Explain how the weakest preimage produces a general rule", "Say what explanation-based learning adds, and what it does not"]
reading: ["Textbook 1, §11.2 Learning with perfect domain theories: Prolog-EBG", "Textbook 1, §11.3 Remarks on explanation-based learning"]
---

### Intuition

Someone asks "why was this box safe to stack on that table?" You answer: "because the box's volume and density make it light, and the table weighs 5". The answer never mentions the owner or the colour. Keep exactly what the answer needed, replace specifics with variables, and you have a general rule that works for every box and table.

### How it works

**Prolog-EBG, for each positive example not covered so far:**

1. **Explain.** Prove from the domain theory that this example satisfies the target. The proof uses only the relevant attributes.
2. **Analyse.** Find the most general conditions under which that same proof would still work. This is the **weakest preimage** of the target with respect to the explanation. It is found by a process called **regression**, working backward through the proof.
3. **Refine.** Add the result as a new Horn clause, and go on to the next example.

**The training example:**

```text
SafeToStack(Obj1, Obj2)
On(Obj1, Obj2)      Type(Obj1, Box)    Type(Obj2, Endtable)
Colour(Obj1, Red)   Colour(Obj2, Blue)
Volume(Obj1, 2)     Density(Obj1, 0.3) Material(Obj1, Cardboard)
Owner(Obj1, Fred)   Owner(Obj2, Louise)
```

**The domain theory:**

```text
SafeToStack(x, y) ← ¬Fragile(y)
SafeToStack(x, y) ← Lighter(x, y)
Lighter(x, y)     ← Weight(x, wx) ∧ Weight(y, wy) ∧ LessThan(wx, wy)
Weight(x, w)      ← Volume(x, v) ∧ Density(x, d) ∧ Equal(w, v × d)
Weight(x, 5)      ← Type(x, Endtable)
```

**The explanation** goes Lighter → Weight of Obj1 from its volume and density → Weight of Obj2 from its type → 0.6 < 5. Colour, owner and material are not used.

**Regressing it gives the rule:**

```text
SafeToStack(x, y) ← Volume(x, vx) ∧ Density(x, dx) ∧
                    Type(y, Endtable) ∧ LessThan(vx × dx, 5)
```

This is more general than the single example: any box-like object with a small enough volume × density is safe on any endtable. Yet it is justified by the theory.

**Remarks:**

| Point | Meaning |
| --- | --- |
| Theory-guided generalisation | The explanation decides which attributes are relevant |
| Justified generalisation | Each new rule follows from the theory and the example |
| Discovering new features | The rule's `vx × dx` is a feature no one listed in the attributes |
| Deductive at heart | Rules add speed rather than new knowledge, since the theory already implied them |
| Knowledge-level learning | With a richer setting, the deductive closure can grow in some cases, but pure EBG does not grow it |

Its inductive bias is the domain theory, plus a preference for small Horn clauses.

### Run it: Prolog-EBG in miniature

This program proves the example from the theory, shows which attributes the proof used, and turns the proof into a general rule.

```python
example = {
    "Volume": ("Obj1", 2), "Density": ("Obj1", 0.3), "Material": ("Obj1", "Cardboard"),
    "Colour1": ("Obj1", "Red"), "Colour2": ("Obj2", "Blue"), "Owner1": ("Obj1", "Fred"),
    "Owner2": ("Obj2", "Louise"), "Type2": ("Obj2", "Endtable"),
}

used = []

def fact(name):
    used.append(name)
    return example[name][1]

def weight_of_box():
    w = fact("Volume") * fact("Density")          # Weight(x, v*d)
    print(f"  Weight(Obj1) = Volume x Density = {w}")
    return w

def weight_of_table():
    if fact("Type2") == "Endtable":               # Weight(y, 5) if y is an endtable
        print("  Weight(Obj2) = 5, because it is an Endtable")
        return 5
    raise ValueError("the theory cannot explain this")

def explain_safe_to_stack():
    print("Step 1: explain the example from the domain theory")
    wx, wy = weight_of_box(), weight_of_table()
    assert wx < wy
    print(f"  Lighter(Obj1, Obj2), because {wx} < {wy}, so SafeToStack holds")

explain_safe_to_stack()

print("\nStep 2: analyse. The explanation used:", ", ".join(used))
print("Ignored as irrelevant:", ", ".join(sorted(set(example) - set(used))))

print("\nStep 3: regress to a general rule")
rule = "SafeToStack(x, y) <- Volume(x, vx) AND Density(x, dx) AND Type(y, Endtable) AND vx*dx < 5"
print(" ", rule)

def learned_rule(volume, density, table_type):
    return table_type == "Endtable" and volume * density < 5

print("\nTesting the rule on new objects it has never seen")
for v, d, t in [(4, 1.0, "Endtable"), (10, 0.6, "Endtable"), (1, 1.0, "Sofa")]:
    print(f"  volume {v:2}, density {d}, {t:8} -> {learned_rule(v, d, t)}")
```

Notice that `Sofa` gives False: the rule only says the theory has an explanation for endtables. That is not a claim of "unsafe", and it could be covered by another explanation.

**Try this:** add another rule to the theory, so that a Sofa has weight 50, and learn a second clause for sofas.

### Common mistakes

- **Saying EBG learns from no examples.** The example chooses which explanation to generalise.
- **Regressing through the wrong rule.** The weakest preimage is for this one explanation, not the whole theory.
- **Treating the rule as new knowledge.** It was implied by the theory. Its value is that it is fast to use.

### Problems

1. Why does the example's colour not appear in the learned rule?
2. Write the weakest preimage of Lighter(x, y) with respect to Weight(y, 5) and the volume-density rule.
3. Give a second training example that the learned rule already covers, and one it does not.
4. Why might too many learned rules slow a system down (the utility problem)?
5. What is the "new feature" discovered in this rule, and why is it useful?
