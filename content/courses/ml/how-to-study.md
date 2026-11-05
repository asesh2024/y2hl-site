---
title: "How to study this course"
description: "The study rhythm for each topic, how the programs on the page work, how the quizzes and CO tests work, and how your marks are kept."
---

### The rhythm for each topic

1. **Intuition.** Read the plain-words idea first. If you can explain it to a friend, you have it.
2. **How it works.** Follow the worked example with a pencil, and do the sums yourself.
3. **Run it.** Press **Run**. Then press **Edit**, change something, and predict the result before you run it again. The **Try this** line gives you a place to start.
4. **Problems.** Solve them on paper or in code.
5. **Quiz.** 8 questions that mark themselves and explain every answer. Pass at **60%** to tick the topic off.

At the end of each course outcome there is a **CO test**: 20 questions drawn at random from that CO's quizzes.

**Topics 1 to 25** follow the lecture sessions. **Topics 26 to 35** are the practical work. [Lab and skill programs](labs.html) shows which topic covers each lab and skill session.

### Running programs on this site

**You don't need to install anything.** Every program has a **Run** button, and Python runs inside your browser, on your own device.

- **Downloads.** The first run loads Python, about 10 MB. Programs that use NumPy, pandas, scikit-learn or matplotlib load those libraries too, which adds more: it can take a minute or two on a slow connection. After that your browser normally keeps them, so later runs start much faster. If you are on mobile data, Topics 1 to 5 and most of Topics 7 to 25 need only plain Python.
- **Charts** appear below the program's output.
- **Your edits are lost** when you leave the page, so copy anything you want to keep.
- **To stop** a program that runs too long, press **Stop**.

If your network blocks `cdn.jsdelivr.net`, the programs cannot load. Try another network, or run them on your own computer.

### Installing Python on your own computer

For the project and bigger programs:

1. Install Python 3.10 or later from [python.org](https://www.python.org/downloads/). On Windows, tick *Add Python to PATH*.
2. Install the libraries:

```bash
python -m pip install numpy pandas scikit-learn matplotlib
```

3. Save a program as, for example, `id3.py`, and run it:

```bash
python id3.py
```

Results can differ slightly on your own computer, depending on the library versions.

### Your marks

The **My marks** page shows your best and latest score for every quiz and CO test, with totals per course outcome. You can download your marks (CSV) or print them with your name and ID.

Marks are kept **only in this browser**. They never leave your device, and your instructor cannot see them unless you send the CSV or the printout. Clearing browser data or switching devices starts a fresh record. The answers are part of the page, so the quizzes are for practice, not for invigilated exams.
