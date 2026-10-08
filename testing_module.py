"""
testing_module.py
------------------------------------------------------------------
Testing / Evaluation module for:
"Predicting Student Performance using Regression Analysis"

This module handles the TESTING stage of the pipeline:
    Preprocessing -> Training -> [ TESTING / EVALUATION ]  -> Reporting

It will:
  1. Split data into train/test sets
  2. Train a standard set of regression models
  3. Test each model on the held-out test set (R^2, MAE, RMSE)
  4. Run k-fold cross-validation for a more robust performance check
  5. Produce a results comparison table (DataFrame + CSV)
  6. Produce comparison bar charts and actual-vs-predicted / residual
     plots for the best model

USAGE
-----
    from testing_module import run_model_comparison

    # X = feature DataFrame, y = target Series (e.g. final grade)
    results_df, best_model_name, fitted_models = run_model_comparison(X, y)

Run this file directly to see a demo on a small synthetic dataset:
    python testing_module.py
------------------------------------------------------------------
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib

from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error


# ------------------------------------------------------------------
# 1. MODEL REGISTRY
# ------------------------------------------------------------------
def get_models(random_state: int = 42) -> dict:
    """
    Returns a dictionary of {model_name: unfitted_model_instance}.
    Add/remove models here to change what gets compared.
    """
    return {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0, random_state=random_state),
        "Lasso Regression": Lasso(alpha=0.01, random_state=random_state),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=200, random_state=random_state
        ),
    }


# ------------------------------------------------------------------
# 2. TRAIN / TEST SPLIT
# ------------------------------------------------------------------
def split_data(X, y, test_size: float = 0.2, random_state: int = 42, scale: bool = True):
    """
    Splits X, y into train/test sets. Optionally standard-scales
    numeric features (fit on train only, to avoid data leakage).
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    scaler = None
    if scale:
        scaler = StandardScaler()
        X_train = pd.DataFrame(
            scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index
        )
        X_test = pd.DataFrame(
            scaler.transform(X_test), columns=X_test.columns, index=X_test.index
        )

    return X_train, X_test, y_train, y_test, scaler


# ------------------------------------------------------------------
# 3. SINGLE MODEL TEST (fit -> predict -> score)
# ------------------------------------------------------------------
def evaluate_model(model, X_train, X_test, y_train, y_test) -> dict:
    """
    Fits a model on training data, tests it on the held-out test set,
    and returns a dict of evaluation metrics + the fitted model.
    """
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    metrics = {
        "R2": r2_score(y_test, y_pred),
        "MAE": mean_absolute_error(y_test, y_pred),
        "RMSE": np.sqrt(mean_squared_error(y_test, y_pred)),
        "y_pred": y_pred,
        "fitted_model": model,
    }
    return metrics


# ------------------------------------------------------------------
# 4. K-FOLD CROSS-VALIDATION (robustness check beyond a single split)
# ------------------------------------------------------------------
def cross_validate_model(model, X, y, cv: int = 5, random_state: int = 42) -> dict:
    """
    Runs k-fold cross-validation and returns mean/std R^2 across folds.
    """
    kfold = KFold(n_splits=cv, shuffle=True, random_state=random_state)
    scores = cross_val_score(model, X, y, cv=kfold, scoring="r2")
    return {"cv_r2_mean": scores.mean(), "cv_r2_std": scores.std()}


# ------------------------------------------------------------------
# 5. FULL COMPARISON PIPELINE
# ------------------------------------------------------------------
def run_model_comparison(
    X,
    y,
    test_size: float = 0.2,
    cv: int = 5,
    random_state: int = 42,
    save_csv_path: str = "model_comparison_results.csv",
    save_plot_path: str = "model_comparison_plot.png",
):
    """
    End-to-end testing pipeline:
      - splits data
      - trains + tests every model from get_models()
      - cross-validates every model
      - builds a comparison DataFrame (sorted by R^2, best first)
      - saves a CSV of results and a bar-chart PNG
      - plots actual-vs-predicted and residuals for the BEST model

    Returns:
        results_df      : pandas DataFrame of all metrics per model
        best_model_name : name of the top-performing model (by test R^2)
        fitted_models    : dict of {model_name: fitted_model_object}
    """
    X_train, X_test, y_train, y_test, fitted_scaler = split_data(
        X, y, test_size=test_size, random_state=random_state
    )

    rows = []
    fitted_models = {}
    predictions = {}

    for name, model in get_models(random_state=random_state).items():
        test_metrics = evaluate_model(model, X_train, X_test, y_train, y_test)
        cv_metrics = cross_validate_model(model, X, y, cv=cv, random_state=random_state)

        fitted_models[name] = test_metrics["fitted_model"]
        predictions[name] = test_metrics["y_pred"]

        rows.append(
            {
                "Model": name,
                "R2 (test)": round(test_metrics["R2"], 4),
                "MAE (test)": round(test_metrics["MAE"], 4),
                "RMSE (test)": round(test_metrics["RMSE"], 4),
                "CV R2 (mean)": round(cv_metrics["cv_r2_mean"], 4),
                "CV R2 (std)": round(cv_metrics["cv_r2_std"], 4),
            }
        )

    results_df = pd.DataFrame(rows).sort_values("R2 (test)", ascending=False).reset_index(drop=True)
    best_model_name = results_df.iloc[0]["Model"]

    # Save results table
    if save_csv_path:
        results_df.to_csv(save_csv_path, index=False)
        print(f"[saved] Results table -> {save_csv_path}")

    # Bar chart comparing R2 across models
    if save_plot_path:
        _plot_comparison(results_df, save_plot_path)
        print(f"[saved] Comparison chart -> {save_plot_path}")

    # Actual vs predicted + residuals for the best model
    _plot_best_model_diagnostics(
        y_test, predictions[best_model_name], best_model_name
    )

    print("\n=== MODEL COMPARISON RESULTS (sorted by test R^2) ===")
    print(results_df.to_string(index=False))
    print(f"\nBest model on this run: {best_model_name}")

    # Export the best model + the fitted scaler so the backend team
    # (Flask API) can load them directly with joblib.
    export_model(
        fitted_models[best_model_name],
        fitted_scaler,
        feature_names=list(X.columns),
    )

    return results_df, best_model_name, fitted_models


# ------------------------------------------------------------------
# 5b. EXPORT MODEL + SCALER (hand-off to backend team)
# ------------------------------------------------------------------
def export_model(model, scaler, feature_names, model_path="model.pkl", scaler_path="scaler.pkl"):
    """
    Saves the trained model and fitted scaler to disk using joblib,
    plus a small metadata file listing the exact feature order the
    model expects. The backend (Flask) team loads these directly:

        model = joblib.load("model.pkl")
        scaler = joblib.load("scaler.pkl")

    IMPORTANT: incoming prediction requests must provide features in
    the same order as `feature_names` (saved to feature_names.txt),
    and must be encoded the same way as during training (see
    preprocessing_module.py).

    IMPORTANT (CGPA scale): Linear/Ridge/Lasso models can predict
    slightly outside the valid 0.0-10.0 CGPA range for unusually
    strong or weak profiles, since they don't inherently know about
    that ceiling/floor. ALWAYS clip predictions at inference time --
    see predict_cgpa() below, which the Flask backend should call
    instead of model.predict() directly.
    """
    joblib.dump(model, model_path)
    if scaler is not None:
        joblib.dump(scaler, scaler_path)

    with open("feature_names.txt", "w") as f:
        f.write("\n".join(feature_names))

    print(f"[exported] Model -> {model_path}")
    print(f"[exported] Scaler -> {scaler_path}")
    print(f"[exported] Feature order -> feature_names.txt ({len(feature_names)} features)")


def predict_cgpa(model, scaler, X_new, min_cgpa: float = 0.0, max_cgpa: float = 10.0):
    """
    Safe prediction wrapper for CGPA-scale targets. Scales input,
    predicts, and clips the result to a valid CGPA range.

    This is what the Flask backend's /predict endpoint should call --
    NOT model.predict() directly -- otherwise unusually strong/weak
    student profiles can produce out-of-range values (e.g. 4.6 or -0.3).

    X_new: a DataFrame or 2D array with columns/order matching
    feature_names.txt exactly.
    """
    X_scaled = scaler.transform(X_new) if scaler is not None else X_new
    raw_pred = model.predict(X_scaled)
    clipped = np.clip(raw_pred, min_cgpa, max_cgpa)
    return clipped


# ------------------------------------------------------------------
# 6. PLOTTING HELPERS
# ------------------------------------------------------------------
def _plot_comparison(results_df: pd.DataFrame, save_path: str):
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    metrics = ["R2 (test)", "MAE (test)", "RMSE (test)"]

    for ax, metric in zip(axes, metrics):
        ax.bar(results_df["Model"], results_df[metric], color="#4C72B0")
        ax.set_title(metric)
        ax.tick_params(axis="x", rotation=30)

    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close(fig)


def _plot_best_model_diagnostics(y_test, y_pred, model_name: str):
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))

    # Actual vs predicted
    axes[0].scatter(y_test, y_pred, alpha=0.6, color="#4C72B0")
    lims = [min(y_test.min(), y_pred.min()), max(y_test.max(), y_pred.max())]
    axes[0].plot(lims, lims, "r--", label="Perfect prediction")
    axes[0].set_xlabel("Actual")
    axes[0].set_ylabel("Predicted")
    axes[0].set_title(f"Actual vs Predicted — {model_name}")
    axes[0].legend()

    # Residuals
    residuals = np.array(y_test) - np.array(y_pred)
    axes[1].scatter(y_pred, residuals, alpha=0.6, color="#DD8452")
    axes[1].axhline(0, color="red", linestyle="--")
    axes[1].set_xlabel("Predicted")
    axes[1].set_ylabel("Residual (Actual - Predicted)")
    axes[1].set_title(f"Residual Plot — {model_name}")

    plt.tight_layout()
    plt.savefig("best_model_diagnostics.png", dpi=150)
    plt.close(fig)
    print("[saved] Best model diagnostics -> best_model_diagnostics.png")


# ------------------------------------------------------------------
# 7. DEMO (runs only if this file is executed directly)
# ------------------------------------------------------------------
if __name__ == "__main__":
    # Uses the CGPA-schema synthetic dataset from preprocessing_module.py
    # (academic + behavioral + lifestyle/socioeconomic features -> CGPA
    # on a 0.0-4.0 scale). Replace with real institutional/survey/LMS
    # data once collected -- schema stays the same.
    from preprocessing_module import generate_synthetic_cgpa_dataset, load_and_preprocess

    print("Generating synthetic CGPA dataset (replace with real data when available)...\n")
    generate_synthetic_cgpa_dataset(n_samples=1000, save_path="synthetic_cgpa_data.csv")

    print("\nRunning preprocessing pipeline...\n")
    X, y = load_and_preprocess("synthetic_cgpa_data.csv", target_col="cgpa")

    print("\nRunning model comparison...\n")
    run_model_comparison(X, y)
