---
title: "Overview"
description: "What the course covers, the four course outcomes, and the books and online lectures that go with it."
---

> The goal of this course is to decide whether a given problem can be solved by a machine at all, and if it can, to identify the simplest machine that solves it.

Theory of Computation studies the mathematical models behind every computer. You will meet a ladder of machines: finite automata, pushdown automata and Turing machines. Each rung recognises more languages than the one below it. The question running through every topic is the same: **what is the weakest machine that can do this job, and how do we prove that a weaker one cannot?**

The course has no prerequisites beyond school mathematics: sets, functions and proof by induction. You will not write programs. You will design machines and grammars on paper, and prove things about them.

### Course outcomes

| CO | You will be able to | Level |
| --- | --- | --- |
| CO1 | Apply DFA and NFA concepts to recognise regular languages, show their equivalence with regular expressions using Arden's theorem, and minimise DFAs. | Apply |
| CO2 | Analyse context-free languages: use closure properties and the pumping lemma to prove languages non-regular, and derive normal forms of grammars. | Analyse |
| CO3 | Analyse how pushdown automata recognise context-free languages, examining the role of the stack and the two ways of accepting. | Analyse |
| CO4 | Compare decidable and undecidable languages by building Turing machines and classifying problems in the Chomsky hierarchy. | Analyse |

### Syllabus

- **Finite automata and regular languages:**
  - DFA and NFA, and their equivalence
  - regular expressions, and their equivalence with finite automata (Arden's theorem)
  - minimisation of DFA
  - finite automata with output (Moore and Mealy machines), and converting between them
- **Limits of regular languages:** closure properties, and the pumping lemma for proving a language is not regular.
- **Context-free grammars:**
  - derivations, parse trees and ambiguity
  - simplification: removing useless symbols, unit productions and ε-productions
  - Chomsky and Greibach normal forms
- **Pushdown automata:**
  - definition and instantaneous descriptions
  - acceptance by final state and by empty stack
  - CFG–PDA equivalence
  - the pumping lemma and closure properties for context-free languages
  - context-sensitive grammars and linear bounded automata
- **Turing machines:**
  - the model and construction techniques
  - Turing machines as language acceptors and as combinations of machines
- **Undecidability:**
  - recursive and recursively enumerable languages
  - the universal Turing machine
  - the Chomsky hierarchy
  - multi-tape and nondeterministic Turing machines

### Textbooks

1. Michael Sipser, *Introduction to the Theory of Computation*, 3rd edition, Cengage, 2015.
2. John E. Hopcroft, Rajeev Motwani and Jeffrey D. Ullman, *Introduction to Automata Theory, Languages and Computation*, 3rd edition, Pearson, 2008.
3. Peter Linz, *An Introduction to Formal Languages and Automata*, 6th edition, Jones and Bartlett, 2016.

**Further reading:**
- John C. Martin, *Introduction to Languages and the Theory of Computation*, 3rd edition.
- K. L. P. Mishra and N. Chandrasekaran, *Theory of Computer Science: Automata, Languages and Computation*, 3rd edition, PHI. Its finite-automata chapter covers Moore and Mealy machines and Arden's theorem.
- Dexter C. Kozen, *Automata and Computability*, Springer.

### Free online lectures

- [MIT 18.404J Theory of Computation](https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/), Michael Sipser. Full video lectures that follow textbook 1.
- [NPTEL: Theory of Computation](https://nptel.ac.in/courses/106104148), IIT Kanpur, Prof. Raghunath Tewari.
- [NPTEL: Theory of Computation](https://nptel.ac.in/courses/106106242), IIT Hyderabad, Prof. Subrahmanyam Kalyanasundaram.
- [NPTEL: Theory of Automata and Formal Languages](https://nptel.ac.in/courses/106103070), IIT Guwahati, Prof. Diganta Goswami.
- [NPTEL: Introduction to Automata, Languages and Computation](https://nptel.ac.in/courses/106105196), IIT Kharagpur, Prof. Sourav Mukhopadhyay.
- [NPTEL: Theory of Automata, Formal Languages and Computation](https://nptel.ac.in/courses/106106049), IIT Madras, Prof. Kamala Krithivasan.
- [Stanford Online: Automata Theory](https://online.stanford.edu/courses/soe-ycsautomata-automata-theory), Jeff Ullman.
