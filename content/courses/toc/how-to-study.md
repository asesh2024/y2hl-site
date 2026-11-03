---
title: "How to study this course"
description: "The topic, quiz and CO test rhythm, how marks are kept, and how to get the most out of the tutorial problems."
---

### The rhythm

Each of the 26 topics follows the same four steps:

1. **Read the notes.** The *Key ideas* section gives the definitions you must know exactly. The *Worked example* section shows one problem solved step by step.
2. **Do the tutorial problems on paper.** Draw the machine or write the grammar before you look anything up. Most marks in this subject are lost through small slips, such as a missing transition or a forgotten ε, and you only catch those by doing problems yourself.
3. **Take the quiz.** It has 10 questions and marks itself. After you submit, each question shows the right answer and a short explanation. You pass at **60%**, and passing ticks the topic off in the contents.
4. **Revisit.** If you scored below 60%, re-read the *Common mistakes* section, then try again. The questions and the options are shuffled on every attempt.

At the end of each course outcome there is a **CO test**: 20 questions drawn at random from all the quizzes under that CO. Every attempt draws a different set, so it is a good revision tool before a semester exam.

### Your marks

The **My marks** page lists your best and latest score for every quiz and CO test, with totals per course outcome. From there you can download your marks as a spreadsheet (CSV) or print them as a PDF with your name and ID.

Marks are saved **only in the browser you used**. They do not leave your device, there is no login, and your instructor cannot see them unless you send the CSV or printout. Clearing your browser data, using private browsing, or switching to another device starts a fresh record. If your marks matter to you, download the CSV now and then.

The quizzes are for practice. The answers are part of the page, so they are no substitute for an invigilated test.

### Notation used on this site

| Symbol | Meaning |
| --- | --- |
| Σ | the input alphabet, a finite set of symbols |
| ε | the empty string (length 0) |
| Σ\* | all strings over Σ, including ε |
| δ | the transition function |
| q₀ | the start state |
| F | the set of final (accepting) states |
| \|w\| | the length of string w |
| n<sub>a</sub>(w) | the number of a's in w |
| w<sup>R</sup> | w written backwards |

In state diagrams, an arrow from nowhere marks the start state, and a **double circle** marks a final state.

### Tips that save marks

- **Always check ε.** Ask whether the empty string is in the language, and whether your machine accepts it.
- **Test your machine on small strings.** Try the shortest strings that should be accepted and the shortest that should be rejected, before you move on.
- **Name what each state remembers**, for example "seen an odd number of 1s". A state you cannot describe in words is usually a mistake.
- **A DFA needs a move for every symbol in every state.** If a move is missing, add a dead (trap) state.
