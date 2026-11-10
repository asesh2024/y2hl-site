---
title: "Run your first program"
description: "Press Run and a real Python program runs in your browser, with nothing to install and no sign-up. Then pick one of five free computer science courses."
---

<p class="lead">Real Python, running in your browser. Nothing to install, no sign-up.</p>

<p class="try-run-top" hidden><button type="button" class="btn primary btn-large" data-run-first>▶ Run this program</button><span class="muted">The first run takes a few seconds while Python loads.</span></p>

```python
# Marks as a bar chart. Change a number
# or the name, then press Run again.
name = "Asha"
marks = {"Maths": 72, "Physics": 85,
         "Coding": 93, "English": 64}

print("Report for", name)
for subject, mark in marks.items():
    bar = "█" * (mark // 5)
    print(f"{subject:8} {mark:3} {bar}")

average = sum(marks.values()) / len(marks)
print("Average:", round(average, 1))
print("Best:", max(marks, key=marks.get))
```

### Now change it

- Press **Edit**, change Coding's `93` to `40`, and run it again. Which subject is best now?
- Add another subject inside the `{ }`, such as `, "Chemistry": 78` straight after English's mark.
- Broke it? Read the last line of the error to see what went wrong, or press **Reset** to start again.

Every course here works the same way: a short explanation, then real programs you can run and change.

<!-- courses -->

New to programming? Start with [5 Python errors every beginner meets](/blog/five-python-errors.html), or try the [weekly challenge](/blog/challenge-01-wrong-question.html).
