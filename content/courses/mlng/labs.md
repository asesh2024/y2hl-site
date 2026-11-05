---
title: "Lab sessions"
description: "The 13 lab sessions, what each one covers, the function each asks you to write, and the topic to study first."
---

Each lab has a demonstration part and a function for you to write. The topic linked below contains a program you can run, and in most cases a working version of the function. Read it, understand it, then write and test your own on the class dataset.

| Session | Lab | Function to write | Study first |
| --- | --- | --- | --- |
| 1 | Environment setup and dataset exploration | `summarise_dataset(df)` | [Topic 4](topic-04.html) |
| 2 | Exploratory data analysis report | A 5-page PDF, using `PdfPages` | [Topic 4](topic-04.html) |
| 3 | Gradient descent from scratch: CGPA regression | Mini-batch GD, within 0.3 RMSE of scikit-learn | [Topic 5](topic-05.html) |
| 4 | Logistic regression: binary and multinomial | `evaluate_classifier(model, X_train, y_train, X_val, y_val)` | [Topic 6](topic-06.html) |
| 5 | Ridge, lasso and elastic net | `compare_regularisation(X_train, y_train, X_val, y_val, C_values)` | [Topic 7](topic-07.html) |
| 6 | Decision trees: criteria, CCP pruning and depth sweep | `dt_report(X_train, y_train, X_val, y_val)` | [Topic 9](topic-09.html) |
| 7 | Random forests: OOB, bagging, feature subsampling | `rf_vs_single_tree(X_train, y_train, X_val, y_val, n_estimators_list)` | [Topic 10](topic-10.html) |
| 8 | XGBoost, LightGBM and SHAP | `boosting_benchmark(X_train, y_train, X_val, y_val)` | [Topics 11](topic-11.html) and [12](topic-12.html) |
| 9 | K-means, hierarchical and DBSCAN | `cluster_pipeline(X_scaled, k_range)` | [Topics 13](topic-13.html) and [14](topic-14.html) |
| 10 | Dimensionality reduction and anomaly detection | `dim_reduction_dashboard(X_scaled, y_labels, sample_n=1000)` | [Topics 15](topic-15.html) and [16](topic-16.html) |
| 11 | Data leakage, cross-validation and nested CV | `full_cv_report(estimator, X, y, param_grid, outer_k=5, inner_k=3)` | [Topic 17](topic-17.html) |
| 12 | Full metrics suite: ROC, PR, calibration, McNemar | `model_evaluation_report()` | [Topics 18](topic-18.html) and [20](topic-20.html) |
| 13 | Modular pipeline, FastAPI, ONNX and MLflow | `end_to_end_check(model_path, data_path, n_batch=20)` | [Topics 21](topic-21.html), [23](topic-23.html), [24](topic-24.html) and [25](topic-25.html) |

**Labs 2 and 13, and the UMAP part of Lab 10, belong on your own computer.** See [How to study](how-to-study.html#using-your-own-computer).
