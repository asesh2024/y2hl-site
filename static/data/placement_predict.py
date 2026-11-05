"""PlacementPredict practice data for the Machine Learning course on y2hl.in.

The students in this table are made up by a seeded random generator. No real student's data is used.
Programs on the site can import this file directly. To run them on your own computer, save this file
in the same folder as your program.
"""
import numpy as np
import pandas as pd

NUMERIC = ["CGPA", "Attendance", "Internships", "Projects", "Certifications", "AptitudeScore",
           "CodingScore", "CommunicationScore", "Backlogs", "Hackathons"]
CATEGORICAL = ["Stream"]
FEATURES = NUMERIC + CATEGORICAL


def load_data(n=5000, seed=42):
    """Return a DataFrame of n made-up students. The same n and seed always give the same table."""
    rng = np.random.default_rng(seed)
    stream = rng.choice(["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"], n, p=[0.32, 0.18, 0.2, 0.12, 0.1, 0.08])
    cgpa = np.clip(rng.normal(7.4, 1.0, n), 5.0, 10.0)
    attendance = np.clip(rng.normal(78 + 4 * (cgpa - 7.4), 9, n), 40, 100)
    internships = rng.poisson(0.8, n)
    projects = rng.poisson(2.0, n)
    certifications = rng.poisson(1.2, n)
    aptitude = np.clip(rng.normal(60 + 6 * (cgpa - 7.4), 14, n), 0, 100)
    bonus = pd.Series(stream).map({"CSE": 6, "IT": 5, "ECE": 1, "EEE": -1, "MECH": -4, "CIVIL": -5}).to_numpy()
    coding = np.clip(rng.normal(58 + 4 * (cgpa - 7.4) + bonus, 16, n), 0, 100)
    communication = np.clip(rng.normal(62, 13, n), 0, 100)
    backlogs = rng.poisson(np.clip(1.1 * (7.0 - cgpa), 0.05, None))
    hackathons = rng.poisson(0.6, n)

    score = (-3.1 + 0.7 * (cgpa - 7.4) + 0.03 * (coding - 58) + 0.02 * (aptitude - 60)
             + 0.03 * (communication - 62) + 0.7 * np.minimum(internships, 2) + 0.15 * projects
             + 0.1 * certifications + 0.3 * np.minimum(hackathons, 2) - 2.2 * (backlogs > 2)
             + 2.4 * ((coding > 65) & (aptitude > 55)) + 1.4 * ((communication > 60) & (internships >= 1))
             - 1.5 * (attendance < 65))
    placed = (rng.random(n) < 1 / (1 + np.exp(-score))).astype(int)
    salary = np.exp(np.log(3.2) + 0.012 * coding + 0.05 * internships + 0.06 * (cgpa - 7.4) + rng.normal(0, 0.18, n))

    # About 2% of the records have profiles that do not fit the pattern.
    anomaly = rng.random(n) < 0.02
    k = int(anomaly.sum())
    cgpa[anomaly] = rng.uniform(9.4, 10.0, k)
    backlogs[anomaly] = rng.integers(6, 12, k)
    attendance[anomaly] = rng.uniform(40, 50, k)
    coding[anomaly] = rng.uniform(92, 100, k)

    df = pd.DataFrame({
        "Stream": stream, "CGPA": cgpa.round(2), "Attendance": attendance.round(1), "Internships": internships.astype(float),
        "Projects": projects, "Certifications": certifications, "AptitudeScore": aptitude.round(1),
        "CodingScore": coding.round(1), "CommunicationScore": communication.round(1), "Backlogs": backlogs,
        "Hackathons": hackathons, "PlacementStatus": placed,
        "SalaryLPA": np.where(placed == 1, salary.round(2), np.nan), "IsAnomaly": anomaly.astype(int),
    })
    df["CGPA_Tier"] = pd.cut(df["CGPA"], [0, 6.5, 8.0, 10.01], labels=["Low", "Mid", "High"], right=False).astype(str)

    # Gaps, as in any real export.
    for column, rate in [("Attendance", 0.04), ("CommunicationScore", 0.05), ("Internships", 0.03), ("Stream", 0.02)]:
        df.loc[rng.random(n) < rate, column] = np.nan
    return df


def train_val_test(df, target="PlacementStatus", seed=0):
    """A stratified 70/15/15 split. Returns X_train, X_val, X_test, y_train, y_val, y_test."""
    from sklearn.model_selection import train_test_split
    X, y = df[FEATURES], df[target]
    X_train, X_rest, y_train, y_rest = train_test_split(X, y, test_size=0.3, stratify=y, random_state=seed)
    X_val, X_test, y_val, y_test = train_test_split(X_rest, y_rest, test_size=0.5, stratify=y_rest, random_state=seed)
    return X_train, X_val, X_test, y_train, y_val, y_test


def preprocessor(scale=True):
    """The standard pipeline from Topic 8: fill gaps, scale numbers, one-hot encode Stream."""
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
