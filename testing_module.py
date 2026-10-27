"""
testing_module.py
------------------------------------------------------------------
Testing and Evaluation module for:
"Predicting Student Academic Performance using Regression Analysis"

Authentic UCI Student Performance Dataset (student-por.csv)
Evaluates regression models on the authentic 0 - 20 grade scale.

Workflow:
  1. Train/Test split (80/20) with fixed random seed
  2. Multi-model comparison (Linear Regression, Ridge, Random Forest, Gradient Boosting)
  3. 5-Fold Cross Validation on training set
  4. Held-out test set evaluation (MAE, RMSE, R²)
  5. Error metrics and diagnostic outputs
------------------------------------------------------------------
"""

import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error

from preprocessing_module import load_and_preprocess, DEFAULT_DATA_PATH


def get_models(random_state: int = 42) -> dict:
    """Returns candidate regression models."""
    return {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=2.0, random_state=random_state),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=150, max_depth=7, min_samples_split=4, random_state=random_state
        ),
        "Gradient Boosting Regressor": GradientBoostingRegressor(
            n_estimators=100, learning_rate=0.05, max_depth=3, random_state=random_state
        ),
    }


def run_model_comparison(X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, random_state: int = 42):
    """
    Compares candidate models using 5-Fold CV on training split and
    evaluates once on held-out test set.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    models = get_models(random_state=random_state)
    kf = KFold(n_splits=5, shuffle=True, random_state=random_state)

    results = []
    fitted_models = {}

    print(f"\nEvaluating {len(models)} models on UCI Student Performance dataset...")
    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)} (Target: G3 [0-20 scale])\n")

    for name, model in models.items():
        # Cross-validation on training data
        cv_mae_scores = -cross_val_score(model, X_train_scaled, y_train, cv=kf, scoring="neg_mean_absolute_error")
        cv_rmse_scores = -cross_val_score(model, X_train_scaled, y_train, cv=kf, scoring="neg_root_mean_squared_error")
        cv_r2_scores = cross_val_score(model, X_train_scaled, y_train, cv=kf, scoring="r2")

        # Fit on training data and test on held-out test data
        model.fit(X_train_scaled, y_train)
        preds = np.clip(model.predict(X_test_scaled), 0.0, 20.0)

        test_mae = float(mean_absolute_error(y_test, preds))
        test_rmse = float(root_mean_squared_error(y_test, preds))
        test_r2 = float(r2_score(y_test, preds))

        results.append({
            "Model": name,
            "CV MAE (Mean)": round(float(np.mean(cv_mae_scores)), 4),
            "CV RMSE (Mean)": round(float(np.mean(cv_rmse_scores)), 4),
            "CV R² (Mean)": round(float(np.mean(cv_r2_scores)), 4),
            "Test MAE": round(test_mae, 4),
            "Test RMSE": round(test_rmse, 4),
            "Test R²": round(test_r2, 4)
        })
        fitted_models[name] = model

    results_df = pd.DataFrame(results).sort_values("CV RMSE (Mean)").reset_index(drop=True)
    best_model_name = results_df.iloc[0]["Model"]

    print(results_df.to_string(index=False))
    print(f"\nBest Model selected by CV RMSE: '{best_model_name}'")

    return results_df, best_model_name, fitted_models


if __name__ == "__main__":
    print("==================================================================")
    print(" TESTING MODULE: MODEL COMPARISON & EVALUATION (UCI DATASET)      ")
    print("==================================================================")
    X, y = load_and_preprocess(DEFAULT_DATA_PATH, target_col="G3", exclude_period_grades=True)
    results_df, best_model, fitted = run_model_comparison(X, y)
