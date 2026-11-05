---
title: "How to study this course"
description: "The study rhythm for each topic, how the programs run, using your own computer, the quizzes and your marks."
---

### The rhythm for each topic

1. **Intuition.** Read the plain-words idea first.
2. **How it works.** Do each worked example with a pencil.
3. **Run it.** Press **Run**. Then press **Edit**, change something, and predict the result before running it again.
4. **Problems.** Some are marked **Lab** or **Skill**. Those match your practical sessions.
5. **Quiz.** 8 questions that mark themselves and explain every answer. Pass at **60%** to tick the topic off.

At the end of each course outcome there is a **CO test**: 20 questions drawn at random from that CO's quizzes.

### Running programs on this site

**You don't need to install anything for most programs.** They run inside your browser, on your own device.

- **Loading.** Programs load Python plus NumPy, pandas and scikit-learn, and some load matplotlib, XGBoost or LightGBM. They also fetch the course dataset, about 2 MB. This can take a minute or two each time you open a new page. Once loaded, running again on the same page takes only seconds, so press **Run** a little before you need the result.
- **Mobile data.** These downloads are large, so use Wi-Fi if you can.
- **Charts** appear below the output.
- **Your edits are lost** when you leave the page, so copy anything you want to keep.
- **To stop** a program that runs too long, press **Stop**.

If your network blocks `cdn.jsdelivr.net` or `raw.githubusercontent.com`, the programs can't load. Try another network, or use your own computer.

### Using your own computer

Programs headed **On your own computer** use tools that can't run in a browser. Bigger lab work also belongs on your own computer.

1. Install Python 3.10 or later from [python.org](https://www.python.org/downloads/). On Windows, tick *Add Python to PATH*.
2. Install the libraries:

```bash
python -m pip install numpy pandas scikit-learn matplotlib xgboost lightgbm pyyaml joblib
```

3. Download [placement_predict.py](/static/data/placement_predict.py), and save it in the same folder as your program. It fetches the dataset for you. To work offline, also save the [CSV file](https://github.com/Naman213091/ML/blob/main/placement_predict_50k%20Dataset.csv) there as `placement_predict_50k.csv`.
4. Run your program:

```bash
python my_program.py
```

Numbers may differ slightly on your computer, as library versions differ. A newer scikit-learn may also print a warning about `penalty` in Topic 7. The program still works.

### Your marks

The **My marks** page shows your best and latest score for every quiz and CO test, with totals per course outcome. You can download your marks (CSV) or print them with your name and ID.

Marks are kept **only in this browser**. They never leave your device, and your instructor cannot see them unless you send the CSV or the printout. Clearing browser data or switching devices starts a fresh record. The answers are part of the page, so the quizzes are for practice, not for invigilated exams.
