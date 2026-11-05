---
title: "Overview"
description: "What the course covers, its course outcomes, and the books and online courses that go with it."
---

> Start with a working system. Then find out how every part of it works.

This course is taught **outside-in**. On day one, you use **PlacementPredict**, a running service that estimates a student's chance of placement from academic and co-curricular data. Over the term, you open it up, layer by layer, until you can build, evaluate, deploy and monitor such a system yourself.

**About the data.** All the programs use the course dataset, `placement_predict_50k`, with 50,000 student records and 32 columns. You can [download the CSV file](/static/data/placement_predict_50k.csv), which comes from [this GitHub repository](https://github.com/Naman213091/ML). A [small helper file](/static/data/placement_predict.py) loads it for each program. To keep pages quick, most programs use a random sample of 5,000 rows. Use `load_data(n=None)` for all of them. The helper leaves out `Gender` and `City` on purpose, because a placement estimate shouldn't depend on them.

Most programs **run right on the page**. A few tools, such as FastAPI, ONNX and MLflow, can't run in a browser. Those programs are marked for use on your own computer.

### Course outcomes

| CO | You will be able to | Level |
| --- | --- | --- |
| CO1 | Analyse the end-to-end ML system lifecycle, and trace one prediction request back through every preceding stage. | Analyse |
| CO2 | Apply linear regression, ridge, lasso, elastic net, and logistic and multinomial logistic regression, and reason about regularisation, the bias-variance trade-off and feature scaling. | Apply |
| CO3 | Apply decision trees, random forests and gradient-boosted trees (XGBoost, LightGBM), and reason about feature importance, splitting criteria and ensemble variance reduction. | Apply |
| CO4 | Apply k-means, hierarchical clustering, DBSCAN, dimensionality reduction (PCA, t-SNE, UMAP) and anomaly detection, to discover structure in unlabelled data. | Apply |
| CO5 | Analyse model performance using cross-validation, train/validation/test splits, classification and regression metrics, calibration and hyperparameter search. | Analyse |
| CO6 | Apply ML-engineering practices (feature stores, skew avoidance, model packaging, REST serving, and monitoring for drift) to deploy a production-style ML system. | Apply |

### Syllabus

- **Module 1, PlacementPredict as a system:** the ML lifecycle; supervised, unsupervised and reinforcement learning; tracing a request; the training-serving boundary and skew; a tour of the codebase; and the course's scope.
- **Module 2, supervised learning with linear models:** linear regression, normal equations and gradient descent; ridge, lasso and elastic net; binary and multinomial logistic regression; feature scaling, encoding and imputing missing values.
- **Module 3, tree-based models:** decision trees and splitting criteria; pruning; random forests, bagging and OOB error; AdaBoost, gradient boosting, XGBoost and LightGBM; Gini importance, permutation importance and SHAP.
- **Module 4, unsupervised learning:** k-means; hierarchical clustering and linkage; DBSCAN; PCA, t-SNE and UMAP; anomaly detection, including Isolation Forest; and cluster features.
- **Module 5, evaluation:** three-way splits; k-fold, stratified and nested cross-validation; leakage; classification and regression metrics; calibration; grid, random and Bayesian search; learning curves; McNemar's test and the paired bootstrap.
- **Module 6, ML engineering:** from notebook to production; feature stores and point-in-time correctness; joblib, ONNX, FastAPI and gRPC; batch and online prediction; drift, retraining, MLflow and DVC.

### Textbooks

Topic pages refer to these books by number.

1. **Textbook 1:** *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow*, 3rd edition, O'Reilly, 2022.
2. **Textbook 2:** *The Elements of Statistical Learning*.
3. **Textbook 3:** *An Introduction to Statistical Learning, with Applications in Python*.

**Reference books:**

1. *Pattern Recognition and Machine Learning*, Springer, 2006.
2. *Designing Machine Learning Systems*.
3. *Building Machine Learning Powered Applications*, O'Reilly, 2020.
4. *Machine Learning Engineering*, True Positive Inc., 2020.

### Free online courses

- [Coursera: Machine Learning Introduction specialization](https://www.coursera.org/specializations/machine-learning-introduction).
- [Coursera: Mathematics for Machine Learning](https://www.coursera.org/specializations/mathematics-for-machine-learning).
- [Coursera: MLOps | Machine Learning Operations](https://www.coursera.org/specializations/mlops-machine-learning-duke), Duke University.
