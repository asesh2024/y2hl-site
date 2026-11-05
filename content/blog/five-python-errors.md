---
title: "5 Python errors every beginner meets, and how to read them"
series: "python-tips"
date: "2026-11-05"
description: "An error message isn't a telling-off. It tells you what went wrong and where. Run each of these five errors on the page, then fix it yourself."
---

A red error message can feel like failure, but it's really the most helpful thing Python does. It tells you what went wrong and where.

**Read it from the bottom up.** The last line gives the type of error and the reason. The lines just above it show where it happened.

Each program below fails on purpose. Press **Run** to see the error, then **Edit** to fix it.

### 1. NameError: a name Python doesn't know

```python
total_marks = 87
print(total_mark)
```

**What it means:** you used a name that hasn't been created. It's usually a typing slip, and newer versions of Python may even suggest the right name.

**The fix:** make the two spellings match. Names are case-sensitive as well, so `Total` and `total` are different.

### 2. TypeError: the wrong kind of value

```python
age = "17"          # this is what input() gives you: text, even if someone types a number
print("Next year you will be", age + 1)
```

**What it means:** Python won't add text to a number. You'll meet this one when you use `input()`, which always gives you text.

**The fix:** convert the text first, with `age = int("17")`, or `age = int(input("Your age: "))` in a real program.

### 3. IndexError: past the end of a list

```python
marks = [72, 85, 90]
print(marks[3])
```

**What it means:** counting starts at 0, so a list of 3 items has positions 0, 1 and 2.

**The fix:** use `marks[2]` for the last item, or `marks[-1]`, which works for any length.

### 4. KeyError: a dictionary key that isn't there

```python
student = {"name": "Asha", "cgpa": 8.4}
print(student["CGPA"])
```

**What it means:** the key doesn't exist. Keys must match exactly, including capital letters.

**The fix:** use `student["cgpa"]`. If a key might be missing, use `student.get("cgpa")`, which gives `None` instead of an error.

### 5. IndentationError: spaces in the wrong place

```python
marks = 75
if marks >= 40:
print("Passed")
```

**What it means:** Python uses indentation to see what belongs inside the `if`. Here, it expected the next line to be pushed in.

**The fix:** put 4 spaces before `print`.

### A habit worth building

When you see an error:

1. Read the last line slowly.
2. Go to the line number that it names.
3. Print the values you're unsure of, using `print(type(x), x)`.
4. Change one thing, and run again.

Then try deliberately breaking a program that works, and see which error appears. A few minutes of that makes these messages far less scary.

**Ready for more?** Every topic in [Advanced Algorithms and Data Structures](/courses/aads/) and [Learning ML through Project](/courses/mlng/) has programs you can run and change, right on the page.
