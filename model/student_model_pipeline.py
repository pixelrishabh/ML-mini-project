"""
student_model_pipeline.py
------------------------------------------------------------------
Consolidated & Robust Machine Learning Pipeline for:
"Predicting Student Performance using Regression Analysis"

Features:
  - Realistic Educational Growth Model (with ceiling/floor effects & diminishing returns)
  - Strict Bounding of Grades (0.0 to 100.0)
  - Multi-Model Comparison (Ridge, Lasso, Linear Regression, Random Forest)
  - Artifact Serialization (model.pkl, scaler.pkl, feature_names.txt)

Usage:
  python student_model_pipeline.py [optional_path_to_csv]
------------------------------------------------------------------
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error


# ------------------------------------------------------------------
# 1. PREPROCESSING MODULE
# ------------------------------------------------------------------
def load_data(filepath: str, sep: str = ",") -> pd.DataFrame:
    """Loads CSV file into a DataFrame."""
    df = pd.read_csv(filepath, sep=sep)
    print(f"[Loaded] {filepath} -> shape: {df.shape}")
    return df


def handle_missing_values(df: pd.DataFrame, strategy: str = "median") -> pd.DataFrame:
    """Fills missing numerical and categorical values."""
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns

    for col in numeric_cols:
        if df[col].isnull().any():
            fill_val = df[col].median() if strategy == "median" else df[col].mean()
            df[col] = df[col].fillna(fill_val)

    for col in categorical_cols:
        if df[col].isnull().any():
            mode_series = df[col].mode()
            fill_val = mode_series[0] if not mode_series.empty else "Missing"
            df[col] = df[col].fillna(fill_val)

    return df


def encode_categoricals(df: pd.DataFrame, drop_first: bool = True) -> pd.DataFrame:
    """Encodes categorical columns to numeric."""
    categorical_cols = df.select_dtypes(include=["object", "category", "string"]).columns.tolist()
    if not categorical_cols:
        return df.copy()

    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=drop_first)
    bool_cols = df_encoded.select_dtypes(include="bool").columns
    if len(bool_cols) > 0:
        df_encoded[bool_cols] = df_encoded[bool_cols].astype(int)
    return df_encoded


def map_uci_features_if_present(df: pd.DataFrame, target_col: str = "G3") -> pd.DataFrame:
    """
    Maps standard UCI Student Performance dataset columns:
      - studytime -> study_time
      - absences  -> absences
      - G1/G2     -> past_grade (scaled to 0-100)
      - Medu/Fedu -> parental_education (0-3)
      - G3        -> final_grade (scaled to 0-100)
    """
    df = df.copy()
    standard_features = {"study_time", "absences", "past_grade", "parental_education"}
    if standard_features.issubset(set(df.columns)):
        return df

    if "studytime" in df.columns and "study_time" not in df.columns:
        df["study_time"] = df["studytime"]

    if "Medu" in df.columns and "parental_education" not in df.columns:
        df["parental_education"] = df["Medu"].apply(lambda x: min(int(x), 3))

    if "G2" in df.columns and "past_grade" not in df.columns:
        df["past_grade"] = df["G2"].apply(lambda x: x * 5.0 if x <= 20 else x)
    elif "G1" in df.columns and "past_grade" not in df.columns:
        df["past_grade"] = df["G1"].apply(lambda x: x * 5.0 if x <= 20 else x)

    if target_col in df.columns and df[target_col].max() <= 20:
        df[target_col] = df[target_col] * 5.0

    return df


def load_and_preprocess(filepath: str, target_col: str = "G3", sep: str = ";", drop_first: bool = True):
    """Loads dataset, maps features, handles missing values, and returns (X, y)."""
    df = load_data(filepath, sep=sep)
    df = map_uci_features_if_present(df, target_col=target_col)
    df = handle_missing_values(df)

    if target_col not in df.columns:
        if "final_grade" in df.columns:
            target_col = "final_grade"
        else:
            raise KeyError(f"Target column '{target_col}' not found in dataset columns: {list(df.columns)}")

    standard_features = ["study_time", "absences", "past_grade", "parental_education"]
    if all(f in df.columns for f in standard_features):
        X = df[standard_features].copy()
    else:
        X = df.drop(columns=[target_col])
        X = pd.get_dummies(X, drop_first=drop_first)
        bool_cols = X.select_dtypes(include="bool").columns
        if len(bool_cols) > 0:
            X[bool_cols] = X[bool_cols].astype(int)

    # Ensure y is strictly bounded between 0 and 100
    y = np.clip(df[target_col].astype(float), 0.0, 100.0)
    print(f"[Preprocessed] Features X shape: {X.shape}, Target y shape: {y.shape}")
    return X, y


# ------------------------------------------------------------------
# 2. MODEL REGISTRY & EVALUATION
# ------------------------------------------------------------------
def get_models(random_state: int = 42) -> dict:
    """Returns candidate regression models."""
    return {
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=200, max_depth=8, min_samples_split=4, random_state=random_state
        ),
        "Ridge Regression": Ridge(alpha=2.0, random_state=random_state),
        "Linear Regression": LinearRegression(),
        "Lasso Regression": Lasso(alpha=0.05, random_state=random_state),
    }


def split_and_scale(X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, random_state: int = 42, scale: bool = True):
    """Splits dataset and applies standard scaling."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    scaler = StandardScaler()
    if scale:
        X_train_scaled = pd.DataFrame(
            scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index
        )
        X_test_scaled = pd.DataFrame(
            scaler.transform(X_test), columns=X_test.columns, index=X_test.index
        )
    else:
        X_train_scaled, X_test_scaled = X_train, X_test

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler


split_data = split_and_scale


def run_model_comparison(X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, random_state: int = 42, scale: bool = True):
    """
    Trains and compares models, evaluates metrics with grade bounds [0, 100], and serializes the best model.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))

    X_train, X_test, y_train, y_test, scaler = split_and_scale(
        X, y, test_size=test_size, random_state=random_state, scale=scale
    )

    models = get_models(random_state=random_state)
    results = []
    fitted_models = {}

    print("\n--- Model Evaluation Results (Bounded [0, 100]) ---")
    for name, model in models.items():
        model.fit(X_train, y_train)
        raw_pred = model.predict(X_test)
        
        # Enforce realistic grade boundaries [0, 100]
        y_pred = np.clip(raw_pred, 0.0, 100.0)

        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = root_mean_squared_error(y_test, y_pred)

        fitted_models[name] = model
        results.append({"Model": name, "R2 Score": r2, "MAE": mae, "RMSE": rmse})
        print(f"[{name:23s}] R2: {r2:7.4f} | MAE: {mae:7.4f} | RMSE: {rmse:7.4f}")

    results_df = pd.DataFrame(results)
    best_model_name = results_df.sort_values(by="R2 Score", ascending=False).iloc[0]["Model"]
    best_model = fitted_models[best_model_name]
    print(f"\n[Best Model Selected]: {best_model_name}")

    # Save artifacts
    model_save_path = os.path.join(base_dir, "model.pkl")
    scaler_save_path = os.path.join(base_dir, "scaler.pkl")
    features_save_path = os.path.join(base_dir, "feature_names.txt")
    results_csv_path = os.path.join(base_dir, "model_comparison_results.csv")

    joblib.dump(best_model, model_save_path)
    joblib.dump(scaler, scaler_save_path)
    with open(features_save_path, "w") as f:
        f.write("\n".join(X.columns.tolist()))
    results_df.to_csv(results_csv_path, index=False)

    print(f"[Artifact Saved] Model: {model_save_path}")
    print(f"[Artifact Saved] Scaler: {scaler_save_path}")
    print(f"[Artifact Saved] Feature Names: {features_save_path}")

    return results_df, best_model, fitted_models


run_pipeline = run_model_comparison


def generate_realistic_synthetic_dataset(n_samples: int = 800) -> pd.DataFrame:
    """
    Generates realistic student performance data modeling academic growth:
      - Past grade is primary predictor (weight ~ 0.78)
      - Study time provides positive boost with diminishing returns (logarithmic/root curve)
      - Absences penalize grades non-linearly
      - Parental education gives moderate academic support
      - Noise is bounded and final grade is strictly within [0, 100]
    """
    np.random.seed(42)
    study_time = np.random.exponential(scale=3.5, size=n_samples) + 0.5
    study_time = np.clip(study_time, 0.5, 20.0) # hours per week

    absences = np.random.negative_binomial(n=2, p=0.3, size=n_samples)
    absences = np.clip(absences, 0, 30)

    past_grade = np.random.normal(loc=70.0, scale=15.0, size=n_samples)
    past_grade = np.clip(past_grade, 15.0, 99.0)

    parental_edu = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.1, 0.35, 0.35, 0.2])

    # Realistic growth formula:
    # 1. Base anchor from past grade:
    grade_anchor = 0.82 * past_grade
    # 2. Diminishing returns from study time (studying beyond 8h gives diminishing extra points):
    study_boost = 3.5 * np.log1p(study_time) 
    # 3. Absence penalty:
    absence_penalty = 0.65 * absences + 0.02 * (absences ** 1.3)
    # 4. Parental education support:
    parental_boost = 1.2 * parental_edu
    # 5. Baseline adjustment:
    baseline = 8.0

    raw_final = baseline + grade_anchor + study_boost - absence_penalty + parental_boost + np.random.normal(0, 1.8, n_samples)
    
    # Strictly bound between 0.0 and 100.0
    final_grade = np.clip(raw_final, 0.0, 100.0)

    return pd.DataFrame({
        "study_time": np.round(study_time, 1),
        "absences": absences.astype(int),
        "past_grade": np.round(past_grade, 1),
        "parental_education": parental_edu.astype(int),
        "final_grade": np.round(final_grade, 1)
    })


if __name__ == "__main__":
    target_csv = sys.argv[1] if len(sys.argv) > 1 else None

    if target_csv and os.path.exists(target_csv):
        sep = ";" if target_csv.endswith(".csv") else ","
        print(f"\nTraining on real dataset: {target_csv}")
        X, y = load_and_preprocess(target_csv, target_col="G3", sep=sep)
        run_model_comparison(X, y)
    else:
        print("\nTraining on calibrated realistic student performance dataset...")
        demo_df = generate_realistic_synthetic_dataset(n_samples=1000)
        demo_csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demo_student_data.csv")
        demo_df.to_csv(demo_csv_path, index=False)

        X, y = load_and_preprocess(demo_csv_path, target_col="final_grade", sep=",")
        run_model_comparison(X, y)
