"""
preprocessing_module.py
------------------------------------------------------------------
Preprocessing module for:
"Predicting Student Performance using Regression Analysis"

Pipeline stage:  [ PREPROCESSING ]  -> Training -> Testing

This module handles:
  1. Loading the raw dataset (CSV)
  2. Handling missing values
  3. Encoding categorical variables (one-hot encoding)
  4. Separating features (X) from the target (y)
  5. Basic sanity checks / summary printout

Works out of the box with the UCI "Student Performance" dataset
(student-mat.csv / student-por.csv, semicolon-separated), but the
functions are generic enough to reuse on any tabular student dataset.

USAGE
-----
    from preprocessing_module import load_and_preprocess

    X, y = load_and_preprocess("student-mat.csv", target_col="G3")

Run this file directly for a demo / sanity check:
    python preprocessing_module.py
------------------------------------------------------------------
"""

import pandas as pd
import numpy as np


# ------------------------------------------------------------------
# 1. LOAD RAW DATA
# ------------------------------------------------------------------
def load_data(filepath: str, sep: str = ",") -> pd.DataFrame:
    """
    Loads a CSV file into a DataFrame.
    UCI student dataset uses ';' as separator -- pass sep=';' for that.
    """
    df = pd.read_csv(filepath, sep=sep)
    print(f"[loaded] {filepath} -> shape: {df.shape}")
    return df


# ------------------------------------------------------------------
# 2. HANDLE MISSING VALUES
# ------------------------------------------------------------------
def handle_missing_values(df: pd.DataFrame, strategy: str = "median") -> pd.DataFrame:
    """
    Fills missing values:
      - numeric columns  -> median (default) or mean
      - categorical cols -> mode (most frequent value)
    Prints a before/after missing-value count so you can report it.
    """
    missing_before = df.isnull().sum().sum()

    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns

    for col in numeric_cols:
        if df[col].isnull().any():
            fill_value = df[col].median() if strategy == "median" else df[col].mean()
            df[col] = df[col].fillna(fill_value)

    for col in categorical_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mode()[0])

    missing_after = df.isnull().sum().sum()
    print(f"[missing values] before: {missing_before}  ->  after: {missing_after}")
    return df


# ------------------------------------------------------------------
# 3. ENCODE CATEGORICAL VARIABLES
# ------------------------------------------------------------------
def encode_categoricals(df: pd.DataFrame, drop_first: bool = True) -> pd.DataFrame:
    """
    One-hot encodes all categorical (object/string) columns.
    drop_first=True avoids the dummy variable trap (multicollinearity).
    """
    categorical_cols = df.select_dtypes(include=["object"]).columns.tolist()
    print(f"[encoding] categorical columns found: {categorical_cols}")

    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=drop_first)

    # Ensure everything is numeric (bool -> int, safety net)
    bool_cols = df_encoded.select_dtypes(include="bool").columns
    df_encoded[bool_cols] = df_encoded[bool_cols].astype(int)

    print(f"[encoding] shape after encoding: {df_encoded.shape}")
    return df_encoded


# ------------------------------------------------------------------
# 4. REMOVE DUPLICATES / OBVIOUS OUTLIERS (optional but recommended)
# ------------------------------------------------------------------
def clean_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    if before != after:
        print(f"[duplicates] removed {before - after} duplicate rows")
    return df


# ------------------------------------------------------------------
# 5. SPLIT FEATURES (X) AND TARGET (y)
# ------------------------------------------------------------------
def split_features_target(df: pd.DataFrame, target_col: str):
    if target_col not in df.columns:
        raise ValueError(
            f"target_col '{target_col}' not found in dataset. "
            f"Available columns: {list(df.columns)}"
        )
    X = df.drop(columns=[target_col])
    y = df[target_col]
    print(f"[split] X shape: {X.shape}, y shape: {y.shape}")
    return X, y


# ------------------------------------------------------------------
# 6. FULL PIPELINE (what you'll actually call)
# ------------------------------------------------------------------
def load_and_preprocess(
    filepath: str,
    target_col: str,
    sep: str = ",",
    drop_columns: list = None,
):
    """
    End-to-end: load -> clean duplicates -> handle missing values
    -> encode categoricals -> split into X, y.

    drop_columns: optional list of columns to drop before processing
    (e.g., ID columns, or other grade columns like G1/G2 if you only
    want to predict G3 from non-grade features).
    """
    df = load_data(filepath, sep=sep)

    if drop_columns:
        existing = [c for c in drop_columns if c in df.columns]
        df = df.drop(columns=existing)
        print(f"[dropped columns] {existing}")

    df = clean_duplicates(df)
    df = handle_missing_values(df)
    df = encode_categoricals(df)

    X, y = split_features_target(df, target_col)

    print("\n[summary] Preprocessing complete.")
    print(f"  Final feature count: {X.shape[1]}")
    print(f"  Final sample count : {X.shape[0]}")

    return X, y


# ------------------------------------------------------------------
# 7. SYNTHETIC CGPA DATASET GENERATOR
# ------------------------------------------------------------------
def generate_synthetic_cgpa_dataset(n_samples: int = 1000, save_path: str = "synthetic_cgpa_data.csv", random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic dataset for predicting CGPA on a
    0.0-10.0 scale (Indian university grading system) from academic,
    behavioral, and lifestyle/socioeconomic factors.

    Use this when a real institutional dataset with this exact schema isn't
    available yet (e.g., before survey data collection is complete).

    Columns generated:
      Academic:    high_school_gpa (0-10 scale), entrance_exam_score,
                   course_load, attendance_rate, major
      Behavioral:  weekly_study_hours, class_participation,
                   assignment_submission_rate, extracurricular_hours
      Lifestyle:   daily_sleep_hours, part_time_work_hours,
                   commute_time_minutes, screen_time_hours,
                   family_income_level
      Target:      cgpa (0.0 - 10.0)
    """
    rng = np.random.default_rng(random_state)
    n = n_samples

    # ---- Academic predictors ----
    high_school_gpa = np.clip(rng.normal(7.5, 1.2, n), 4.0, 10.0)   # 0-10 scale (CBSE-style)
    entrance_exam_score = np.clip(rng.normal(75, 12, n), 40, 100)
    course_load = rng.integers(12, 21, n)
    attendance_rate = np.clip(rng.normal(85, 10, n), 40, 100)
    major = rng.choice(
        ["Engineering", "Business", "Arts", "Science", "Social Science"],
        size=n, p=[0.28, 0.22, 0.15, 0.20, 0.15],
    )

    # ---- Behavioral / study habits ----
    weekly_study_hours = np.clip(rng.normal(15, 6, n), 0, 45)
    class_participation = rng.integers(1, 11, n)  # 1-10 rating
    assignment_submission_rate = np.clip(rng.normal(88, 10, n), 30, 100)
    extracurricular_hours = np.clip(rng.normal(5, 3, n), 0, 20)

    # ---- Lifestyle / socioeconomic ----
    daily_sleep_hours = np.clip(rng.normal(6.5, 1.3, n), 3, 10)
    part_time_work_hours = np.clip(rng.normal(8, 7, n), 0, 35)
    commute_time_minutes = np.clip(rng.normal(30, 15, n), 0, 100)
    screen_time_hours = np.clip(rng.normal(4, 2, n), 0, 14)
    family_income_level = rng.choice(["Low", "Middle", "High"], size=n, p=[0.3, 0.45, 0.25])
    income_effect = np.select(
        [family_income_level == "Low", family_income_level == "Middle", family_income_level == "High"],
        [0.0, 0.07, 0.14],
    )

    # ---- Target: CGPA (0.0-10.0), built from a weighted, noisy combination ----
    cgpa = (
        0.8
        + 0.42 * high_school_gpa                        # strongest academic driver
        + 0.012 * entrance_exam_score                    # strong
        + 0.035 * weekly_study_hours                     # meaningful
        + 0.009 * attendance_rate                         # meaningful
        + 0.009 * assignment_submission_rate               # meaningful
        + 0.035 * class_participation                    # mild
        + 0.02 * daily_sleep_hours                        # mild (well-rested -> better focus)
        + 0.015 * extracurricular_hours                  # mild positive (up to moderate levels)
        - 0.025 * part_time_work_hours                   # negative (less time to study)
        - 0.005 * commute_time_minutes                   # mild negative
        - 0.035 * screen_time_hours                      # negative (leisure screen time)
        + income_effect                                   # small socioeconomic effect
        + rng.normal(0, 0.35, n)                          # noise
    )
    cgpa = np.clip(cgpa, 0.0, 10.0).round(2)

    df = pd.DataFrame({
        "high_school_gpa": high_school_gpa.round(2),
        "entrance_exam_score": entrance_exam_score.round(1),
        "course_load": course_load,
        "attendance_rate": attendance_rate.round(1),
        "major": major,
        "weekly_study_hours": weekly_study_hours.round(1),
        "class_participation": class_participation,
        "assignment_submission_rate": assignment_submission_rate.round(1),
        "extracurricular_hours": extracurricular_hours.round(1),
        "daily_sleep_hours": daily_sleep_hours.round(1),
        "part_time_work_hours": part_time_work_hours.round(1),
        "commute_time_minutes": commute_time_minutes.round(0),
        "screen_time_hours": screen_time_hours.round(1),
        "family_income_level": family_income_level,
        "cgpa": cgpa,
    })

    df.to_csv(save_path, index=False)
    print(f"[generated] Synthetic CGPA dataset -> {save_path} (shape: {df.shape})")
    return df


# ------------------------------------------------------------------
# 8. DEMO (runs only if this file is executed directly)
# ------------------------------------------------------------------
if __name__ == "__main__":
    print("Generating synthetic CGPA dataset (replace with real survey/LMS data when available)...\n")
    generate_synthetic_cgpa_dataset(n_samples=1000, save_path="synthetic_cgpa_data.csv")

    print("\nRunning preprocessing pipeline on the generated dataset...\n")
    X, y = load_and_preprocess("synthetic_cgpa_data.csv", target_col="cgpa")

    print("\nFinal X preview:")
    print(X.head())
    print("\nFinal y preview:")
    print(y.head())
