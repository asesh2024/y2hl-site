"""Loads the PlacementPredict dataset for the Machine Learning course on y2hl.in.

The data is the course's placement_predict_50k file, read from its GitHub repository:
https://github.com/Naman213091/ML

Programs on the site can import this file directly. To run them on your own computer, save this file
in the same folder as your program. If you also save the CSV there as placement_predict_50k.csv, it
is used in place of the download.
"""
from pathlib import Path

import pandas as pd

URL = "https://raw.githubusercontent.com/Naman213091/ML/main/placement_predict_50k%20Dataset.csv"
LOCAL = "placement_predict_50k.csv"

NUMERIC = ["CGPA", "AttendancePercent", "Internships", "Projects", "Workshops", "Certifications", "Publications",
           "AptitudeTestScore", "SoftSkillsRating", "CodingTestScore", "MockInterviewScore", "ExtraCurricular"]
CATEGORICAL = ["CollegeTier", "Stream", "Specialisation", "Hostel", "HistoryOfBacklogs"]
FEATURES = NUMERIC + CATEGORICAL
# Left out of FEATURES on purpose:
#   StudentID                  identifies a record and predicts nothing
#   Gender, City               a placement estimate should not depend on these
#   SGPA_Sem1 to SGPA_Sem8     already summarised by CGPA
#   CGPA_Tier                  calculated from CGPA
#   Salary Package             known only after placement, so using it is a leak
#   IsAnomaly                  a label for Topic 16


def load_data(n=5000, seed=42):
    """Return a random sample of n students, the same each time. Use n=None for all 50,000."""
    try:
        df = pd.read_csv(LOCAL if Path(LOCAL).exists() else URL)
    except Exception as error:
        raise RuntimeError("Could not load the PlacementPredict dataset. Your network may be blocking "
                           "raw.githubusercontent.com. Try another network.") from error
    if n is None or n >= len(df):
        return df
    return df.sample(n, random_state=seed).reset_index(drop=True)


def train_val_test(df, target="PlacementStatus", seed=0):
    """A stratified 70/15/15 split. Returns X_train, X_val, X_test, y_train, y_val, y_test."""
    from sklearn.model_selection import train_test_split
    X, y = df[FEATURES], df[target]
    X_train, X_rest, y_train, y_rest = train_test_split(X, y, test_size=0.3, stratify=y, random_state=seed)
    X_val, X_test, y_val, y_test = train_test_split(X_rest, y_rest, test_size=0.5, stratify=y_rest, random_state=seed)
    return X_train, X_val, X_test, y_train, y_val, y_test


def preprocessor(scale=True):
    """The standard pipeline from Topic 8: fill gaps, scale numbers, one-hot encode categories."""
    from sklearn.compose import ColumnTransformer
    from sklearn.impute import SimpleImputer
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    steps = [("fill", SimpleImputer(strategy="median"))]
    if scale:
        steps.append(("scale", StandardScaler()))
    categories = Pipeline([("fill", SimpleImputer(strategy="most_frequent")),
                           ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))])
    return ColumnTransformer([("num", Pipeline(steps), NUMERIC), ("cat", categories, CATEGORICAL)],
                             verbose_feature_names_out=False)
