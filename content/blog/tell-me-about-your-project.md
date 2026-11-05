---
title: "“Tell Me About Your Project”: 6 Interview Questions Every Engineering Student Should Prepare"
series: "careers"
date: "2026-11-05"
description: "Most students answer by listing tools. Practise these six questions, so that you can explain the problem, justify your decisions and defend your results."
---

Most students answer “Tell me about your project” by listing tools: “We used Python, Flask, and a Random Forest.”

That tells an interviewer what you used, but not what you can do.

In my experience teaching and guiding engineering students, I have observed that students often understand the technical components of their projects but struggle to explain the problem, justify their decisions, or defend their results. A project discussion becomes much more meaningful when students can explain not only what they developed, but also why they developed it and how they evaluated it.

Here are six questions every student should practise before a technical interview. These are preparation questions, not a list attributed to any particular company.

### 1. What problem does your project solve, and for whom?

Explain the problem in two sentences without mentioning programming languages, frameworks, or algorithms.

**Weak answer:** “We developed a machine learning model using XGBoost.”

**Better answer:** “Our project helps college placement cells identify students who may need additional academic or placement support. It provides early indicators so faculty can intervene before students reach the final placement stage.”

**Remember:** The interviewer should understand the purpose of your project even without a technical background.

### 2. What did you personally contribute?

A team project is not an excuse for an unclear individual contribution.

**Weak answer:** “We collected data, trained the model, and developed the application.”

**Better answer:** “I was responsible for preparing the dataset, handling missing values, comparing prediction models, and evaluating their performance. My teammates developed the user interface and database integration. We worked together to test the complete application.”

**Remember:** Use “I” for your contribution and “we” for collective work. Be prepared to explain the code and decisions you claim as your own.

### 3. Why did you choose that approach?

Interviewers may want to understand whether you made technical decisions or simply followed a tutorial.

**Weak answer:** “We used Random Forest because it gives good accuracy.”

**Better answer:** “I first considered logistic regression because it is simple and interpretable. I also evaluated Random Forest because it can model nonlinear relationships between student characteristics and placement outcomes. I would select the more complex model only if its improvement on validation data justified the additional complexity.”

**For database selection:** “We considered storing records in CSV files, but chose SQLite because the application required structured records, reliable updates, and queries. SQLite was sufficient for our prototype, although a database server would be more suitable for a larger multi-user deployment.”

**Remember:** Explain the alternatives, the evidence behind your choice, and the trade-offs.

### 4. How do you know your project works?

A successful demonstration is not the same as proper evaluation.

**Weak answer:** “Our model achieved 98% accuracy.”

**Better answer:** “We separated training and test data, compared our model with a simple baseline, and evaluated precision, recall, and F1-score alongside accuracy. Because our objective was to identify students who might need support, recall was important: missing an at-risk student could be more costly than reviewing an unnecessary alert.”

A student should be ready to answer:

- What dataset did you use, and how many records did it contain?
- What result did the baseline produce?
- How did you prevent data leakage?
- How many predictions were correct, and what kinds of errors occurred?

For example, if 95% of students belong to one class, always predicting that class can produce 95% accuracy without identifying a single student in the minority class.

**Remember:** Report your actual measured results. Never invent performance numbers or confuse training accuracy with test performance.

### 5. What went wrong, and how did you solve it?

A project without a single difficulty may invite deeper questioning.

**Weak answer:** “We did not face any major problems.”

**Better answer (illustrative):** “During initial testing, the model performed well on training data but poorly on unseen records. I investigated the difference and found evidence of overfitting. I reduced unnecessary features, adjusted model complexity, and repeated validation using a separate test set. This helped us assess whether the model was learning useful patterns rather than memorising the training data.”

A strong explanation covers the problem, how you diagnosed it, what you changed, and the observed result.

**Remember:** Choose a difficulty you actually experienced. An unsuccessful experiment can still demonstrate sound technical judgment.

### 6. What would you do differently if you started again?

This question tests your ability to recognise limitations and plan improvements.

**Weak answer:** “I would use deep learning and add more features.”

**Better answer:** “Our model was evaluated on a limited historical dataset from one institution. I would next test it on data from different academic years and institutions to assess generalisation. I would also check whether the predictions remain reliable across different student groups before recommending practical deployment.”

**Remember:** A useful improvement should respond to a known limitation, not simply introduce newer technology.

### Practise your project explanation before the interview

1. Prepare a two-sentence description that anyone can understand.
2. Explain the complete project aloud in two minutes.
3. Ask a friend to interrupt with “Why did you choose that?” after every major decision.
4. Compare your method with at least one simpler alternative.
5. Open your source code and explain the parts you personally developed.
6. Keep your actual results, limitations, and one debugging experience ready.

**My advice to students:** Never memorise a project explanation that you cannot defend. Before attending an interview, pick any important function, algorithm, or design decision from your project and explain what would happen if you removed or changed it. If you can reason through that question clearly, you are much better prepared for technical follow-up questions.

A good project interview is not about how many technologies you can name. It is about whether you can identify a problem, make justified decisions, evaluate your work, and learn from its limitations.

Don't just present your project. Demonstrate your understanding of it.

**Building a project now?** The [Learning ML through Project](/courses/mlng/) course walks through a full system, from data to deployment.
