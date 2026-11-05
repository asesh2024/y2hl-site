---
title: "How does a spam filter learn? Teach one yourself"
series: "ai-for-school"
date: "2026-11-05"
description: "Nobody writes down every rule for spotting spam. The computer learns from examples. Teach a tiny filter in a few lines of Python, with nothing to install."
---

How does your email know that "WIN A FREE PRIZE NOW" is junk? Nobody sat down and wrote out every possible rule. Instead, a program looked at lots of examples and worked out the patterns by itself.

That's the big idea behind much of what people call AI: **learning from examples instead of following written rules**.

### Teaching by example

Think of a young child learning what a dog is. You don't give them a definition. You point and say "dog" or "not a dog" until they get it.

A spam filter learns in a similar way, by counting. If "prize" keeps appearing in spam, and hardly ever in normal messages, it becomes a clue.

### Try it: a tiny spam filter

You need to know no maths for this. Press **Run**, and see what the filter decides about the three new messages.

```python
from collections import Counter

spam = ["win a free prize now", "free money click now", "claim your cash prize today"]
normal = ["see you at school tomorrow", "please bring your maths book", "the match is at five today"]

spam_words = Counter(" ".join(spam).split())
normal_words = Counter(" ".join(normal).split())

def check(message):
    spam_points = normal_points = 0
    for word in message.lower().split():
        spam_points += spam_words[word]
        normal_points += normal_words[word]
    answer = "SPAM" if spam_points > normal_points else "normal"
    print(f"{message!r}: spam clues {spam_points}, normal clues {normal_points} -> {answer}")

check("free cash prize")
check("bring your book to school")
check("win a maths prize")
```

### Now you try

Press **Edit**, then try these. Before each run, guess what will happen.

1. **Add your own test:** add a line such as `check("free school book")`.
2. **Fool the filter:** write a spammy message that it calls normal. Why did it work?
3. **Teach it more:** add `"you won a lucky draw"` to the `spam` list, then test `check("lucky draw")`.

### What you've just discovered

- **It learned from data.** Change the examples, and its behaviour changes, though you never touched the rules.
- **More examples help.** Our filter knows only a few dozen words. Real ones learn from huge numbers of messages.
- **It can be wrong.** It doesn't understand meaning, only patterns. That's true of bigger AI systems as well, so it's always worth checking what they tell you.
- **Bad examples teach bad habits.** If the examples are unfair or wrong, so is what it learns.

### Where to go next

If you're curious how this works in real systems, the [naive Bayes topic](/courses/ml/topic-11.html) in our Machine Learning Fundamentals course builds a proper version. It's written for college students, but you may enjoy having a look.
