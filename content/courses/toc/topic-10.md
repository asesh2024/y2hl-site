---
title: "Context-free grammars"
keywords: "cfg"
topic: 10
co: "CO2"
description: "Grammars whose rules rewrite one variable at a time, regardless of context: enough to describe nested structures like aⁿbⁿ, palindromes and programming-language syntax."
outcomes: ["Define a context-free grammar as a 4-tuple and explain what makes it context-free", "Derive strings from a grammar and describe the language it generates", "Design grammars for languages such as aⁿbⁿ, palindromes, wcwᴿ and balanced strings", "Explain why every regular language is context-free but not conversely"]
reading: ["Textbook 1, §2.1 Context-free grammars", "Textbook 2, §5.1 Context-free grammars", "Textbook 3, §5.1 Context-free grammars"]
videos: [{"title": "MIT 18.404J, Lecture 3: Context-free grammars", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/regular-pumping-lemma-finite-automata-2192-regular-expressions-cfgs/"}]
---

### Key ideas

**A context-free grammar (CFG)** is a 4-tuple G = (V, T, P, S):

| Part | Meaning |
| --- | --- |
| V | a finite set of variables (non-terminals), written in capitals |
| T | a finite set of terminals, the alphabet of the strings generated |
| P | productions of the form **A → α**, where A ∈ V and α ∈ (V ∪ T)\* |
| S ∈ V | the start symbol |

**Context-free** means the left side of every production is a **single variable**. That variable can be replaced wherever it appears, whatever its neighbours are. A rule like aAb → ab, which depends on context, is not allowed.

**Derivations.** Write α ⇒ β when β comes from α by applying one production, and α ⇒\* β for zero or more steps. The language of G is

> L(G) = { w ∈ T\* | S ⇒\* w }.

A language is **context-free** (a CFL) if some CFG generates it.

**Regular ⊂ context-free.** Every regular grammar is a CFG, so every regular language is context-free. But {aⁿbⁿ} is context-free (S → aSb | ε) and not regular. Some languages are not context-free at all, for example {aⁿbⁿcⁿ} (topic 17).

**Design patterns:**

| Language | Grammar | Idea |
| --- | --- | --- |
| aⁿbⁿ | S → aSb \| ε | add one a and one b together, from the outside in |
| wcwᴿ | S → aSa \| bSb \| c | build a mirror image around a centre marker |
| palindromes | S → aSa \| bSb \| a \| b \| ε | as above; the centre may be one letter or empty |
| equal a's and b's | S → aSbS \| bSaS \| ε | match the first symbol with its partner |
| aⁿbⁿ⁺ᵐ | S → aSb \| A, A → bA \| ε | matched part, then extra b's |

### Worked example

**A grammar for L = { wcwᴿ | w ∈ {a, b}\* }**, the strings with a c in the middle and a mirror image on either side.

Each step wraps the current string in matching letters. The c is placed last:

> S → aSa | bSb | c

**Derivation of `abcba`:** S ⇒ aSa ⇒ abSba ⇒ abcba. The string has 5 symbols and the derivation takes 3 steps, one for each production used.

**Why no DFA can do this:** when it reaches the c, the machine must remember the whole of w to check the mirror. A grammar has no such limit, because its rules build the two sides at the same time.

### Common mistakes

- **Forgetting the base case.** S → aSb on its own generates nothing at all. You need S → ε or S → ab to stop.
- **Generating too much.** Test the grammar on short strings that should **not** be in the language. For example, S → aS | Sb | ε generates a\*b\*, not aⁿbⁿ.
- **Equal counts in any order.** A grammar for equally many a's and b's must allow strings like `ba` and `abba`, not just aⁿbⁿ.

### Tutorial problems

1. Construct a CFG for the strings over {a, b} with **equal numbers** of a's and b's (for example ab, aabb, abab, ba). What makes it tricky to keep the counts equal?
2. Using S → aSb | A, A → bA | ε, draw the parse tree for `aabbb`. Describe L(G) in set notation.
3. Using S → aS | A, A → aA | b, give a leftmost and a rightmost derivation of `aab`. Is there more than one way to derive it? (This question comes back in topic 11.)
4. Using the expression grammar E → E + T | T, T → T \* F | F, F → ( E ) | id, derive `id + id * id` and draw its parse tree. Explain how the grammar makes \* bind tighter than +.
5. Write CFGs for:
    - {aⁿbᵐ | n > m};
    - balanced parentheses;
    - {aⁱbʲcᵏ | i = j or j = k}.

### Viva questions

1. What is the role of terminals and non-terminals (variables) in a CFG?
2. Give an example of a production rule and explain what it contributes to the language.
3. Why is the grammar called context-free?
4. Is every regular language context-free? Is every context-free language regular?
