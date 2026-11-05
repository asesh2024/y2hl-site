---
title: "ML engineering foundations: from notebook to production"
keywords: "modular yaml argparse logging pytest config reproducibility"
topic: 21
co: "CO6"
description: "A notebook is great for exploring, and poor as a production system. Split it into tested modules, move settings into configuration, and log what happens."
outcomes: ["List the problems with notebook-only systems", "Split a project into modular pipeline steps", "Use YAML and argparse for configuration", "Add structured logging", "Write unit tests for ML components"]
reading: ["Reference book 2, Ch. 6, pp. 173–210; Ch. 7, pp. 211–246", "Reference book 4, Ch. 5, pp. 103–138"]
---

### Intuition

Your notebook works, on your laptop, if the cells run in the right order. Could a teammate rerun it six months from now and get the same model? Engineering habits make that answer yes.

### How it works

| Notebook problem | Engineering answer |
| --- | --- |
| Hidden state and cell order | Scripts that run top to bottom |
| Settings buried in code | A YAML config, plus `argparse` overrides |
| `print` everywhere | Structured logging with levels |
| "It worked last time" | Unit tests, pinned versions, recorded seeds |
| One long file | Modules with one job each |

**A pipeline run:**

```bash
python -m src.trainer --config configs/train.yaml --C 0.5
```

**What to test in ML:**

| Test | Example |
| --- | --- |
| Data | Required columns exist; CGPA lies between 0 and 10 |
| Features | No NaN after the pipeline; correct output width |
| Model | Output is a probability; beats a baseline |
| Invariance | An unknown Stream doesn't crash |
| Reproducibility | The same seed gives the same score |

**Logging levels:** DEBUG, INFO, WARNING, ERROR. Log the run ID, row counts and metrics, never personal data.

### Run it: a tiny modular project

Each function stands for a file in the project. Python's `yaml` and `logging` run here just as they do on your computer.

```python
import logging
import sys
import numpy as np
import yaml
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.pipeline import make_pipeline
from placement_predict import FEATURES, load_data, preprocessor, train_val_test

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(name)s: %(message)s", stream=sys.stdout, force=True)

CONFIG = yaml.safe_load("""
data: {rows: 3000, seed: 42}
model: {C: 1.0, max_iter: 1000}
quality: {min_auc: 0.75}
""")

def data_loader(cfg):                       # src/data_loader.py
    log = logging.getLogger("data_loader")
    df = load_data(n=cfg["rows"], seed=cfg["seed"])
    missing = set(FEATURES) - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    log.info("loaded %d rows", len(df))
    return df

def trainer(X, y, cfg):                     # src/trainer.py
    model = make_pipeline(preprocessor(), LogisticRegression(C=cfg["C"], max_iter=cfg["max_iter"]))
    model.fit(X, y)
    logging.getLogger("trainer").info("fitted with C=%s", cfg["C"])
    return model

def evaluate(model, X, y, cfg):             # src/evaluate.py
    log = logging.getLogger("evaluate")
    auc = roc_auc_score(y, model.predict_proba(X)[:, 1])
    log.info("validation AUC %.4f", auc)
    if auc < cfg["min_auc"]:
        log.error("below the quality gate of %s", cfg["min_auc"])
        raise SystemExit(1)
    return auc

df = data_loader(CONFIG["data"])
X_train, X_val, _, y_train, y_val, _ = train_val_test(df)
model = trainer(X_train, y_train, CONFIG["model"])
evaluate(model, X_val, y_val, CONFIG["quality"])

# tests/test_pipeline.py: run these with pytest in a real project
def test_no_nan_after_features():
    assert not np.isnan(model[0].transform(X_val)).any()

def test_output_is_probability():
    p = model.predict_proba(X_val)[:, 1]
    assert ((p >= 0) & (p <= 1)).all()

def test_unknown_stream_does_not_crash():
    row = X_val.iloc[[0]].copy()
    row["Stream"] = "AI-DS"
    model.predict_proba(row)

def test_reproducible():
    a = trainer(X_train, y_train, CONFIG["model"]).predict_proba(X_val)
    assert np.allclose(a, model.predict_proba(X_val))

def test_beats_baseline():
    assert model.score(X_val, y_val) > max(y_val.mean(), 1 - y_val.mean())

for test in [test_no_nan_after_features, test_output_is_probability, test_unknown_stream_does_not_crash, test_reproducible, test_beats_baseline]:
    test()
    print("PASSED", test.__name__)
```

**Try this:** set `min_auc: 0.99` in the config, and watch the quality gate stop the run.

### Common mistakes

- **Testing only that code runs.** Check the values too.
- **Keeping secrets in config files.** Use environment variables.
- **Logging personal data.** Records in logs are hard to remove, and can leak.

### Problems

1. Give three reasons a notebook is a weak production system.
2. Add a `tests` entry for CGPA range checking.
3. Add `argparse` so that `--C` overrides the config (on your own computer).
4. **Lab 13 (part):** create `data_loader.py`, `feature_pipeline.py` and `trainer.py`.
5. Why is a quality gate useful in an automated retraining job?
