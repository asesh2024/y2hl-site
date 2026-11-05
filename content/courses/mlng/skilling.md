---
title: "Skilling projects"
description: "The 24 skilling sessions, each applying a course technique to a public dataset, with the function to write and the topic to study."
---

The skilling sessions apply what you learned on PlacementPredict to other public datasets. Do them on your own computer, or in a free online notebook, because the datasets are loaded from the internet. Your instructor will confirm which dataset to use where it says "set by your instructor".

Most of these datasets can be fetched by name with scikit-learn's `fetch_openml`. Check the page of each one for its terms of use.

| Session | Project | Dataset | Function to write | Study |
| --- | --- | --- | --- | --- |
| 1 | EDA and lifecycle mapping | Titanic | A 4-page PDF EDA report | [Topic 4](topic-04.html) |
| 2 | Preprocessing pipeline | Titanic | `validate_pipeline(pipeline, X_train, X_val)` | [Topic 8](topic-08.html) |
| 3 | Feature engineering and EDA | Adult census | `adult_eda_report(df)` | [Topics 4](topic-04.html), [8](topic-08.html) |
| 4 | Linear regression and regularisation | Set by your instructor | `regression_benchmark(X_train, y_train, X_test, y_test, alphas)` | [Topics 5](topic-05.html), [7](topic-07.html) |
| 5 | Full logistic regression pipeline | Set by your instructor | `logistic_pipeline_report(...)` | [Topic 6](topic-06.html) |
| 6 | Multinomial logistic regression | Glucose bands (diabetes data) | `multinomial_analysis(...)` | [Topic 6](topic-06.html) |
| 7 | Regression, scaling and encoding | Auto MPG | `regression_pipeline(df, target_col="mpg")` | [Topics 5](topic-05.html), [8](topic-08.html) |
| 8 | Decision tree classification | Titanic | `dt_full_analysis(...)` | [Topic 9](topic-09.html) |
| 9 | Random forest ensemble | Set by your instructor | `ensemble_comparison(...)` | [Topic 10](topic-10.html) |
| 10 | XGBoost, LightGBM and SHAP | Set by your instructor | `shap_feature_summary(model, X_val, feature_names, top_n=5)` | [Topics 11](topic-11.html), [12](topic-12.html) |
| 11 | Trees and forests | Wine quality | `model_comparison(...)` | [Topics 9](topic-09.html), [10](topic-10.html) |
| 12 | Boosting and SHAP | Set by your instructor | `boosting_pipeline_report(...)` | [Topics 11](topic-11.html), [12](topic-12.html) |
| 13 | Clustering | Customer segments | `cluster_report(df, feature_cols, k)` | [Topics 13](topic-13.html), [14](topic-14.html) |
| 14 | PCA, t-SNE and UMAP | Customer segments | `compare_dr_methods(X_scaled, labels, perplexity=30, n_neighbors=10)` | [Topic 15](topic-15.html) |
| 15 | Isolation Forest | Set by your instructor | `anomaly_benchmark(X, y_true, contamination_values)` | [Topic 16](topic-16.html) |
| 16 | Clustering and PCA profiling | Socio-economic data | `profile(df, feature_cols, k, region_col=None)` | [Topics 13](topic-13.html), [15](topic-15.html) |
| 17 | DBSCAN and Isolation Forest | Network intrusion data | `intrusion_detection_report(...)` | [Topics 14](topic-14.html), [16](topic-16.html) |
| 18 | CV, metrics and calibration | Set by your instructor | `calibration_comparison(models_dict, ...)` | [Topics 17](topic-17.html), [20](topic-20.html) |
| 19 | Tuning and significance | Set by your instructor | `tuning_summary(...)` | [Topics 19](topic-19.html), [20](topic-20.html) |
| 20 | Threshold tuning and calibration | Set by your instructor | `threshold_analysis(model, X_val, y_val, recall_target=0.95)` | [Topics 18](topic-18.html), [20](topic-20.html) |
| 21 | Search, validation and learning curves | Banknote authentication | `search_comparison(estimator, param_grid, X_train, y_train, n_iter=30)` | [Topic 19](topic-19.html) |
| 22 | Modular pipeline and FastAPI | Set by your instructor | `api_health_check(base_url, test_payloads)` | [Topics 21](topic-21.html), [23](topic-23.html) |
| 23 | MLflow, DVC and drift | Set by your instructor | `psi_report(reference_df, production_df, num_cols, threshold=0.2)` | [Topic 24](topic-24.html) |
| 24 | Batch scoring, PSI and retraining | Wine quality | `retrain_pipeline(reference_csv, production_csv, model_path, psi_threshold=0.2)` | [Topics 24](topic-24.html), [25](topic-25.html) |
