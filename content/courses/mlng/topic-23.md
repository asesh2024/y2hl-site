---
title: "Model packaging and deployment"
keywords: "joblib pickle onnx fastapi rest grpc docker batch online serving"
topic: 23
co: "CO6"
description: "Turn a trained model into something others can call. Save it safely, make it portable with ONNX, serve it with FastAPI, and choose between online and batch."
outcomes: ["Save and load a model with joblib, and know pickle's limits", "Convert a pipeline to ONNX", "Build a FastAPI service with /health and /predict", "Compare REST and gRPC", "Choose batch or online prediction"]
reading: ["Reference book 2, Ch. 8, pp. 247–286; Ch. 9, pp. 287–318", "Reference book 4, Ch. 7, pp. 163–196; Ch. 8, pp. 197–228"]
---

### Intuition

A model in a notebook helps nobody. Packaging freezes it in a file. Serving wraps it in an interface, so that a website, a batch job or another team can use it without knowing anything about scikit-learn.

### How it works

| Format | Good | Limits |
| --- | --- | --- |
| **pickle / joblib** | Easy; saves the whole Python pipeline | **Loading runs code, so never load an untrusted file.** Tied to library versions |
| **ONNX** | Portable, fast, works across languages | Conversion must support every step |

**Save with the model:** library versions, training data version, metrics, and the feature list.

**Interfaces:**

| | REST (FastAPI) | gRPC |
| --- | --- | --- |
| Format | JSON, readable | Binary, compact |
| Speed | Good | Very low latency |
| Use | Web and general clients | Internal service to service |

**Serving patterns:** an online endpoint answers one request at a time, with low latency. A batch job scores a file on a schedule, and it's simpler and cheaper when immediacy doesn't matter. A **container** (Docker) packs the code and libraries, so that it runs the same everywhere.

### Run it: package, load and batch score

The web server can't run in this page, but packaging and batch scoring can.

```python
import io
import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from placement_predict import FEATURES, load_data, preprocessor, train_val_test

df = load_data()
X_train, X_val, X_test, y_train, y_val, y_test = train_val_test(df)
model = make_pipeline(preprocessor(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)

bundle = {"model": model, "features": FEATURES, "sklearn": sklearn.__version__, "val_accuracy": model.score(X_val, y_val)}
file = io.BytesIO()
joblib.dump(bundle, file)
print(f"Saved bundle: {file.tell() / 1024:.1f} KB, sklearn {bundle['sklearn']}")

file.seek(0)
loaded = joblib.load(file)
assert np.allclose(loaded["model"].predict_proba(X_val), model.predict_proba(X_val))
print("Loaded model gives identical predictions")

def batch_predict(bundle, rows):
    """batch_predict.py: score a whole table."""
    p = bundle["model"].predict_proba(rows[bundle["features"]])[:, 1]
    return rows.assign(placed_probability=p.round(3), prediction=(p >= 0.5).astype(int))

def end_to_end_check(bundle, data, n_batch=20):
    sample = data.sample(n_batch, random_state=0)
    out = batch_predict(bundle, sample)
    assert out["prediction"].isin([0, 1]).all()
    assert out["placed_probability"].between(0, 1).all()
    print("Pipeline check PASSED")

scored = batch_predict(loaded, X_test.head(5))
print(scored[["Stream", "CGPA", "CodingScore", "placed_probability", "prediction"]].to_string(index=False))
end_to_end_check(loaded, X_test)
```

### On your own computer: FastAPI

Install with `python -m pip install fastapi uvicorn httpx`, and save `placement_predict.py` beside your program. This version tests the service without opening a port. To run it for real, save it as `app.py`, and run `uvicorn app:app --port 8000`, leaving out the test client lines.

```py
import pandas as pd
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from placement_predict import FEATURES, load_data, preprocessor, train_val_test

X_train, _, _, y_train, _, _ = train_val_test(load_data())
model = make_pipeline(preprocessor(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)

class Student(BaseModel):
    Stream: str
    CGPA: float = Field(ge=0, le=10)
    Attendance: float | None = None
    Internships: float | None = None
    Projects: int = 0
    Certifications: int = 0
    AptitudeScore: float
    CodingScore: float
    CommunicationScore: float | None = None
    Backlogs: int = 0
    Hackathons: int = 0

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(student: Student):
    row = pd.DataFrame([student.model_dump()]).reindex(columns=FEATURES)
    p = float(model.predict_proba(row)[0, 1])
    return {"placed_probability": round(p, 3), "prediction": int(p >= 0.5)}

client = TestClient(app)
print(client.get("/health").json())
good = {"Stream": "CSE", "CGPA": 8.5, "AptitudeScore": 75, "CodingScore": 80}
print(client.post("/predict", json=good).json())
print("CGPA of 12 returns status", client.post("/predict", json={**good, "CGPA": 12}).status_code)
```

### On your own computer: ONNX

Install with `python -m pip install skl2onnx onnxruntime`. The converter doesn't support our imputer for text columns, with `NaN` as its missing value, so this version uses the numeric features only. For a full pipeline, fill the gaps in `Stream` before the pipeline, and convert the rest.

```py
import numpy as np
import onnxruntime as rt
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from placement_predict import NUMERIC, load_data, train_val_test

X_train, X_val, _, y_train, _, _ = train_val_test(load_data())
model = make_pipeline(SimpleImputer(strategy="median"), StandardScaler(), LogisticRegression(max_iter=1000))
model.fit(X_train[NUMERIC], y_train)

onnx_model = convert_sklearn(model, initial_types=[("input", FloatTensorType([None, len(NUMERIC)]))],
                             options={"zipmap": False}, target_opset={"": 15, "ai.onnx.ml": 3})
session = rt.InferenceSession(onnx_model.SerializeToString())

rows = X_val[NUMERIC].head(50).to_numpy(dtype=np.float32)
probabilities = session.run(None, {"input": rows})[1][:, 1]
difference = np.abs(probabilities - model.predict_proba(X_val[NUMERIC].head(50))[:, 1]).max()
print(f"ONNX file is {len(onnx_model.SerializeToString()) / 1024:.1f} KB")
print(f"Largest difference from scikit-learn: {difference:.6f}")
```

### Common mistakes

- **Loading a pickle from an unknown source.** It can run any code on your machine.
- **Mismatched library versions.** Record them, and pin them in the container.
- **Having no `/health` endpoint or input validation.** Deployments need both.

### Problems

1. Should these be batch or online? (a) A nightly dashboard. (b) An advice screen as a student types.
2. Why is pickle unsafe for files from the internet?
3. **Skill 22:** write `api_health_check(base_url, test_payloads)`.
4. Compare the size of a joblib file and an ONNX file for the same model.
5. Write a short Dockerfile for the service.
