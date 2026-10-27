"""
preprocessing_module.py
------------------------------------------------------------------
Preprocessing module for:
"Predicting Student Academic Performance using Regression Analysis"

Dataset: Authentic UCI Student Performance Dataset (student-por.csv)
Target:  Final Grade G3 (0 - 20 scale)

Pipeline stage:  [ PREPROCESSING ]  -> Training -> Testing -> Inference

This module handles:
  1. Loading the authentic raw dataset (CSV with semicolon separator)
  2. Missing value detection and imputation
  3. Categorical encoding (One-Hot Encoding with drop_first)
  4. Feature separation (Early Prediction: pre-midterm without G1/G2)
  5. Target validation on the 0-20 Portuguese secondary grading scale
------------------------------------------------------------------
"""

import os
import pandas as pd
import numpy as np

DEFAULT_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "raw", "student-por.csv"))


# ------------------------------------------------------------------
# 1. LOAD RAW DATA
# ------------------------------------------------------------------
def load_data(filepath: str = DEFAULT_DATA_PATH, sep: str = ";") -> pd.DataFrame:
    """
    Loads the authentic UCI Student Performance dataset.
    Default delimiter is ';' as specified by UCI repository.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"Dataset file not found at: {filepath}. "
            "Ensure 'data/raw/student-por.csv' exists."
        )

    df = pd.read_csv(filepath, sep=sep)
    print(f"[Loaded] {filepath} -> shape: {df.shape}")
    return df


# ------------------------------------------------------------------
# 2. HANDLE MISSING VALUES
# ------------------------------------------------------------------
def handle_missing_values(df: pd.DataFrame, strategy: str = "median") -> pd.DataFrame:
    """
    Fills missing values:
      - numeric columns  -> median (default) or mean
      - categorical cols -> mode (most frequent value)
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
    print(f"[Missing values] before: {missing_before} -> after: {missing_after}")
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
    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=drop_first)

    # Ensure boolean flags are numeric (0/1)
    bool_cols = df_encoded.select_dtypes(include="bool").columns
    if len(bool_cols) > 0:
        df_encoded[bool_cols] = df_encoded[bool_cols].astype(int)

    return df_encoded


# ------------------------------------------------------------------
# 4. REMOVE DUPLICATES
# ------------------------------------------------------------------
def clean_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    if before != after:
        print(f"[Duplicates] Removed {before - after} duplicate rows.")
    return df


# ------------------------------------------------------------------
# 5. SPLIT FEATURES (X) AND TARGET (y)
# ------------------------------------------------------------------
def split_features_target(df: pd.DataFrame, target_col: str = "G3", exclude_period_grades: bool = True):
    """
    Separates feature matrix X from target y.
    If exclude_period_grades is True (Early Prediction), G1 and G2 are dropped
    to eliminate target leakage.
    Target y is clipped to authentic [0.0, 20.0] grading scale.
    """
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset columns: {list(df.columns)}")

    drop_cols = [target_col]
    if exclude_period_grades:
        for p in ["G1", "G2"]:
            if p in df.columns:
                drop_cols.append(p)

    X = df.drop(columns=drop_cols)
    y = np.clip(df[target_col].astype(float), 0.0, 20.0)

    print(f"[Split] Target '{target_col}' (range [{y.min():.1f} - {y.max():.1f}]). X shape: {X.shape}, y shape: {y.shape}")
    return X, y


# ------------------------------------------------------------------
# 6. FULL END-TO-END PREPROCESSING PIPELINE
# ------------------------------------------------------------------
def load_and_preprocess(
    filepath: str = DEFAULT_DATA_PATH,
    target_col: str = "G3",
    sep: str = ";",
    exclude_period_grades: bool = True,
    drop_first: bool = True
):
    """
    End-to-end preprocessing:
      Load authentic CSV -> Remove duplicates -> Impute missing ->
      One-Hot Encode categoricals -> Split into (X, y)
    """
    df = load_data(filepath, sep=sep)
    df = clean_duplicates(df)
    df = handle_missing_values(df)

    # Encode categoricals before splitting
    df_encoded = encode_categoricals(df, drop_first=drop_first)

    X, y = split_features_target(df_encoded, target_col=target_col, exclude_period_grades=exclude_period_grades)
    return X, y


if __name__ == "__main__":
    X, y = load_and_preprocess()
    print("Preprocessed X shape:", X.shape, "y shape:", y.shape)
