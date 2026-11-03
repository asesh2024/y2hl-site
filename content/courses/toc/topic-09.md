---
title: "Pumping lemma for regular languages"
topic: 9
co: "CO2"
description: "Every long string in a regular language has a part that can be repeated. When a language breaks that rule, it cannot be regular, and the pumping lemma turns that into a proof."
outcomes: ["State the pumping lemma for regular languages precisely, with all three conditions", "Explain why it holds, using the pigeonhole principle on DFA states", "Prove that a language is not regular by contradiction with the pumping lemma", "Recognise which languages are regular and which are not"]
reading: ["Textbook 1, §1.4 Nonregular languages", "Textbook 2, §4.1 Proving languages not to be regular", "Textbook 3, §4.3 Identifying nonregular languages"]
videos: [{"title": "MIT 18.404J, Lecture 3: Regular pumping lemma", "url": "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/resources/regular-pumping-lemma-finite-automata-2192-regular-expressions-cfgs/"}]
---

### Key ideas

**The pumping lemma.** If L is regular, there is a number p ≥ 1 (the *pumping length*) such that every string w ∈ L with |w| ≥ p can be split as w = xyz, where:

1. |xy| ≤ p,
2. |y| ≥ 1,
3. xyⁱz ∈ L for **every** i ≥ 0.

**Why it is true.** Take a DFA for L with p states. Reading a string of length ≥ p passes through p + 1 states, so by the pigeonhole principle some state repeats within the first p symbols. The part read between the two visits is y, a loop. You can go round the loop any number of times, or skip it (i = 0), and still end in the same final state.

**How to use it: a proof by contradiction.** The lemma is a necessary condition only. It can prove that a language is **not** regular. It can never prove that a language **is** regular. The proof works like a game:

1. **Assume** L is regular, with some pumping length p. You do not choose p.
2. **You choose** a string w ∈ L with |w| ≥ p. Choose it cleverly, usually in terms of p.
3. **The lemma chooses** a split w = xyz with |xy| ≤ p and |y| ≥ 1. You must handle **every** such split.
4. **You choose** an i, often 0 or 2, so that xyⁱz ∉ L.
5. **Conclude:** this contradicts the lemma, so L is not regular.

**Typical non-regular languages:**

- {aⁿbⁿ}
- {ww}
- palindromes
- {a<sup>n²</sup>}
- {a<sup>p</sup> : p prime}
- equal numbers of 0s and 1s

What they share: a DFA would have to count without limit, or remember an unbounded string.

**Typical regular languages:**

- {aⁿbᵐ}
- {a²ⁿ}
- strings containing 101
- {aⁿbⁿ : n ≤ 100} (any finite language)

### Worked example

**Prove that L = {aⁿbⁿ | n ≥ 0} is not regular.**

1. Assume L is regular, and let p be its pumping length.
2. Choose w = aᵖbᵖ. It is in L, and |w| = 2p ≥ p.
3. Take any split w = xyz with |xy| ≤ p and |y| ≥ 1. Because xy lies within the first p symbols, which are all a's, **y = aᵏ for some k ≥ 1**.
4. Pump with i = 2: xy²z = aᵖ⁺ᵏbᵖ. It has more a's than b's, so it is **not in L**.
5. This contradicts the lemma. So L is not regular. ∎

The choice of w did the work. Because the first p symbols are all a's, there was only one case to consider for y.

### Common mistakes

- **Choosing p yourself**, for example "let p = 3". The proof must work for every p.
- **Choosing a convenient split.** The lemma picks the split. Your argument must cover every split with |xy| ≤ p and |y| ≥ 1.
- **Using the lemma to "prove" a language regular.** Some non-regular languages satisfy the pumping conditions. To show a language is regular, give a DFA, NFA or regular expression.
- **Choosing a string that is too short**, or one that is not in L.

### Tutorial problems

1. Is L = {aⁿbⁿ : n ≥ 0} regular? If not, prove it, writing out each step.
2. Let L = {w ∈ {0, 1}\* : n₀(w) = n₁(w)}, where n₀ and n₁ count the 0s and 1s. Is L regular? If not, prove it with the pumping lemma. (Then compare with the closure proof in topic 8.)
3. Prove that {ww | w ∈ {a, b}\*} is not regular. (Hint: try w = aᵖbaᵖb.)
4. Prove that {a<sup>n²</sup> | n ≥ 0} is not regular. (Hint: the gap between consecutive squares grows.)
5. Which of these are regular? Give a DFA or regular expression for the regular ones, and a proof for the others.
    - {aⁿbᵐ | n, m ≥ 0}
    - {aⁿbᵐ | n ≠ m}
    - {aⁿ | n is even}
    - palindromes over {a, b}

### Viva questions

1. State the pumping lemma for regular languages. What does each condition mean?
2. Why can the pumping lemma prove that a language is not regular, but never that it is regular?
3. Why does the lemma require |xy| ≤ p, and how does that help in proofs?
4. Where does the pumping length p come from in a DFA?
