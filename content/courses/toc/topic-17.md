---
title: "Pumping lemma for context-free languages"
topic: 17
co: "CO3"
description: "Long strings in a context-free language have two parts that can be pumped together. Languages that break this, like aⁿbⁿcⁿ, cannot be context-free."
outcomes: ["State the pumping lemma for CFLs, with the conditions on u, v, w, x and y", "Explain where it comes from (a repeated variable on a long path of a parse tree)", "Prove that languages such as aⁿbⁿcⁿ and {ww} are not context-free"]
reading: ["Textbook 1, §2.3 Non-context-free languages", "Textbook 2, §7.2 The pumping lemma for context-free languages", "Textbook 3, §8.1 Two pumping lemmas"]
videos: [{"title": "MIT 18.404J, Lecture 5: CF pumping lemma", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/cf-pumping-lemma-turing-machines/"}]
---

### Key ideas

**The pumping lemma for CFLs.** If L is context-free, there is a number p (the *pumping length*) such that every string s ∈ L with |s| ≥ p can be split as s = uvwxy, where:

1. |vwx| ≤ p,
2. |vx| ≥ 1, so v and x are not both empty,
3. uvⁱwxⁱy ∈ L for **every** i ≥ 0.

**Where it comes from.** Take a grammar for L in Chomsky normal form. A very long string has a tall parse tree. On the longest path, some variable A must appear twice, by the pigeonhole principle.

- The upper A derives vAx.
- The lower A derives w.

So A ⇒\* vAx can be repeated any number of times (giving vⁱwxⁱ), or skipped. The condition |vwx| ≤ p comes from choosing the repeat close to the bottom of the tree.

**How to use it.** It works like the regular pumping lemma (topic 9), with one difference: **v and x pump together**.

1. Assume L is context-free, with pumping length p.
2. Choose s ∈ L with |s| ≥ p.
3. Consider **every** split s = uvwxy with |vwx| ≤ p and |vx| ≥ 1. Usually you split them into cases by where vwx lies.
4. For each case, find an i with uvⁱwxⁱy ∉ L.

**Classic non-context-free languages:**

- {aⁿbⁿcⁿ}
- {ww | w ∈ {a, b}\*}
- {a<sup>n²</sup>}
- {a<sup>p</sup> | p prime}
- {aⁱbʲcᵏ | i < j < k}

The intuition: a stack can match **one** pair of counts, but not three at once.

### Worked example

**Prove that L = {aⁿbⁿcⁿ | n ≥ 0} is not context-free.**

1. Assume L is context-free, with pumping length p.
2. Choose s = aᵖbᵖcᵖ ∈ L.
3. Take any split s = uvwxy with |vwx| ≤ p and |vx| ≥ 1. Since |vwx| ≤ p, the window vwx cannot reach from the a's all the way to the c's. So **vwx contains at most two of the three letters**.
4. Pump with i = 2:
    - **Case 1: v and x each contain only one kind of letter.** Then pumping increases at most two of the counts. At least one letter count stays at p, so the counts are no longer equal, and uv²wx²y ∉ L.
    - **Case 2: v or x contains two different letters**, for example v = aabb. Then v² = aabbaabb puts letters out of order, so uv²wx²y ∉ a\*b\*c\* ⊇ L.
5. Every case gives a contradiction. So L is not context-free. ∎

### Common mistakes

- **Forgetting that v and x pump together.** Both repeat i times. One may be empty, but not both.
- **Missing cases.** vwx can sit inside one block, or across two neighbouring blocks. Cover them all.
- **Using the lemma to prove a language is context-free.** Like the regular version, it only works for disproving.
- **Choosing s without p.** s must depend on p, so that it is long enough for every possible p.

### Tutorial problems

1. Prove that {aⁿbⁿcⁿ | n ≥ 1} is not context-free, writing out every case.
2. Prove that {ww | w ∈ {a, b}\*} is not context-free. (Hint: s = aᵖbᵖaᵖbᵖ.)
3. Prove that {aⁱbʲcᵏ | i < j < k} is not context-free.
4. Is {aⁿbⁿcᵐ | n, m ≥ 0} context-free? If yes, give a grammar. Then explain why the pumping lemma cannot be used to show it is not.
5. Show that {a<sup>p</sup> | p is prime} is not context-free.

### Viva questions

1. State the pumping lemma for CFLs. How does it differ from the regular version?
2. Why must the lemma pump two substrings, v and x, instead of one?
3. Where does the bound |vwx| ≤ p come from in the proof?
