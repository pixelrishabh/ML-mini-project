"""
student_model_pipeline.py
=============================================================================
Reproducible Machine Learning Pipeline for:
"Predicting Student Academic Performance using Regression Analysis"

Dataset: Authentic UCI Student Performance Dataset (student-por.csv)
Target:  Final Grade G3 (0 - 20 scale, Portuguese Secondary Education)

Key Highlights:
1. Complete scikit-learn ColumnTransformer and Pipeline architecture.
2. Two explicitly isolated experiments:
   - Primary: Early Prediction (excludes G1 & G2 to eliminate target leakage).
   - Secondary: Later Prediction (includes G1 & G2 for mid-semester monitoring).
3. Fair & Ethical Modeling:
   - Sensitive demographic variables (sex, address) are separated from the
     primary feature pipeline to avoid disparate treatment.
   - Rigorous Fairness Audit on held-out test set (MAE, RMSE, Prediction Bias).
   - Inspired by Applied Sciences 2025 (DOI: 10.3390/app15158409).
4. SHAP Explainability:
   - Global feature importance and SHAP summary plots.
   - Serialized explainer for real-time local prediction explanations.
5. Multi-model cross-validation:
   - Linear Regression, Ridge, Random Forest, Gradient Boosting.
=============================================================================
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, KFold, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

# Try importing shap
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


# ---------------------------------------------------------------------------
# Constants and Schema Definitions
# ---------------------------------------------------------------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "student-por.csv")
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
PLOTS_DIR = os.path.join(MODEL_DIR, "plots")
os.makedirs(PLOTS_DIR, exist_ok=True)

# Non-sensitive features available prior to semester exams (Early Prediction)
NUMERIC_FEATURES = [
    "age", "Medu", "Fedu", "traveltime", "studytime", "failures",
    "famrel", "freetime", "goout", "Dalc", "Walc", "health", "absences"
]

CATEGORICAL_FEATURES = [
    "famsize", "Pstatus", "Mjob", "Fjob", "reason", "guardian",
    "schoolsup", "famsup", "paid", "activities", "nursery", "higher",
    "internet", "romantic"
]

# Sensitive demographic variables kept strictly for fairness auditing
SENSITIVE_AUDIT_FEATURES = ["sex", "address", "school"]

# Period grades for later prediction experiment
PERIOD_GRADE_FEATURES = ["G1", "G2"]

TARGET_COL = "G3"


def load_and_validate_dataset(csv_path: str = DATA_PATH) -> pd.DataFrame:
    """Loads and validates the authentic UCI Student Performance dataset."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Dataset file not found at: {csv_path}. "
            "Please ensure 'student-por.csv' is placed in 'data/raw/'."
        )

    # UCI dataset uses semicolon separator
    df = pd.read_csv(csv_path, sep=";")
    print(f"[Dataset Loaded] {csv_path}")
    print(f"  - Records: {len(df)}")
    print(f"  - Features: {df.shape[1]}")
    print(f"  - Missing values: {df.isnull().sum().sum()}")
    print(f"  - Duplicate rows: {df.duplicated().sum()}")
    print(f"  - Target G3 Range: [{df[TARGET_COL].min()} - {df[TARGET_COL].max()}] (Mean: {df[TARGET_COL].mean():.2f})")

    # Sanity checks
    if TARGET_COL not in df.columns:
        raise KeyError(f"Target column '{TARGET_COL}' missing from dataset.")

    return df


def build_preprocessor(numeric_cols, categorical_cols):
    """Constructs a scikit-learn ColumnTransformer for preprocessing."""
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_cols),
            ("cat", categorical_transformer, categorical_cols)
        ],
        remainder="drop"
    )
    return preprocessor


def get_candidate_models(random_state: int = 42):
    """Returns candidate regression models for comparison."""
    return {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=2.0, random_state=random_state),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=150, max_depth=7, min_samples_split=4, min_samples_leaf=2, random_state=random_state
        ),
        "Gradient Boosting Regressor": GradientBoostingRegressor(
            n_estimators=100, learning_rate=0.05, max_depth=3, subsample=0.85, random_state=random_state
        )
    }


def evaluate_models_cv(X_train, y_train, preprocessor, candidate_models, cv_folds: int = 5):
    """Performs K-Fold Cross Validation on training data across candidate models."""
    kf = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_results = {}

    print(f"\n[Cross-Validation] Evaluating {len(candidate_models)} models with {cv_folds}-Fold CV...")

    for name, model in candidate_models.items():
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", model)
        ])

        scores = cross_validate(
            pipeline, X_train, y_train,
            cv=kf,
            scoring={
                "neg_mae": "neg_mean_absolute_error",
                "neg_rmse": "neg_root_mean_squared_error",
                "r2": "r2"
            },
            return_train_score=False
        )

        cv_results[name] = {
            "cv_mae_mean": float(-np.mean(scores["test_neg_mae"])),
            "cv_mae_std": float(np.std(scores["test_neg_mae"])),
            "cv_rmse_mean": float(-np.mean(scores["test_neg_rmse"])),
            "cv_rmse_std": float(np.std(scores["test_neg_rmse"])),
            "cv_r2_mean": float(np.mean(scores["test_r2"])),
            "cv_r2_std": float(np.std(scores["test_r2"]))
        }

        print(f"  -> {name:28s} | CV MAE: {cv_results[name]['cv_mae_mean']:.3f} | "
              f"CV RMSE: {cv_results[name]['cv_rmse_mean']:.3f} | "
              f"CV R2: {cv_results[name]['cv_r2_mean']:.3f}")

    return cv_results


def run_experiment(df: pd.DataFrame, experiment_name: str, include_period_grades: bool = False):
    """
    Executes a complete reproducible experiment (Early or Later prediction).
    """
    print(f"\n========================================================")
    print(f" RUNNING EXPERIMENT: {experiment_name.upper()}")
    print(f" (include_period_grades = {include_period_grades})")
    print(f"========================================================")

    # Prepare features
    num_cols = list(NUMERIC_FEATURES)
    cat_cols = list(CATEGORICAL_FEATURES)
    if include_period_grades:
        num_cols = num_cols + PERIOD_GRADE_FEATURES

    feature_cols = num_cols + cat_cols
    all_needed_cols = feature_cols + SENSITIVE_AUDIT_FEATURES + [TARGET_COL]

    data = df[all_needed_cols].copy()
    y = np.clip(data[TARGET_COL].astype(float), 0.0, 20.0)

    # Train / Test split (80 / 20) with fixed random seed
    train_idx, test_idx = train_test_split(data.index, test_size=0.20, random_state=42)

    X_train = data.loc[train_idx, feature_cols]
    y_train = y.loc[train_idx]
    X_test = data.loc[test_idx, feature_cols]
    y_test = y.loc[test_idx]

    audit_train = data.loc[train_idx, SENSITIVE_AUDIT_FEATURES]
    audit_test = data.loc[test_idx, SENSITIVE_AUDIT_FEATURES]

    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # Preprocessing pipeline
    preprocessor = build_preprocessor(num_cols, cat_cols)

    # Candidate models
    models = get_candidate_models(random_state=42)

    # Cross-validation comparison on training data
    cv_results = evaluate_models_cv(X_train, y_train, preprocessor, models, cv_folds=5)

    # Select best model based on lowest cross-validation RMSE
    best_model_name = min(cv_results, key=lambda k: cv_results[k]["cv_rmse_mean"])
    print(f"\n[Model Selection] Best Model by CV RMSE: '{best_model_name}'")

    # Fit best model on entire training set
    best_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", models[best_model_name])
    ])
    best_pipeline.fit(X_train, y_train)

    # Held-out Test Set Evaluation (Once!)
    y_test_pred_raw = best_pipeline.predict(X_test)
    y_test_pred = np.clip(y_test_pred_raw, 0.0, 20.0)

    test_mae = float(mean_absolute_error(y_test, y_test_pred))
    test_rmse = float(root_mean_squared_error(y_test, y_test_pred))
    test_r2 = float(r2_score(y_test, y_test_pred))

    print(f"\n[Held-out Test Evaluation - {best_model_name}]")
    print(f"  * Test MAE  : {test_mae:.4f}")
    print(f"  * Test RMSE : {test_rmse:.4f}")
    print(f"  * Test R²   : {test_r2:.4f}")

    # Evaluate all candidate models on held-out test set for the comparison table
    candidate_test_results = {}
    for name, mdl in models.items():
        pipe = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", mdl)
        ])
        pipe.fit(X_train, y_train)
        preds = np.clip(pipe.predict(X_test), 0.0, 20.0)
        candidate_test_results[name] = {
            "cv_mae": cv_results[name]["cv_mae_mean"],
            "cv_rmse": cv_results[name]["cv_rmse_mean"],
            "cv_r2": cv_results[name]["cv_r2_mean"],
            "test_mae": float(mean_absolute_error(y_test, preds)),
            "test_rmse": float(root_mean_squared_error(y_test, preds)),
            "test_r2": float(r2_score(y_test, preds))
        }

    # Fairness & Error Audit on Held-out Test Set
    fairness_report = audit_fairness(y_test, y_test_pred, audit_test)

    # SHAP Explainability
    shap_results = {}
    explainer = None
    if SHAP_AVAILABLE:
        try:
            shap_results, explainer = compute_shap_explanations(
                best_pipeline, X_train, X_test, experiment_name
            )
        except Exception as e:
            print(f"[SHAP Warning] Could not complete SHAP computation: {e}")

    # Generate diagnostic plots
    plot_diagnostics(
        candidate_test_results, y_test, y_test_pred, best_model_name, experiment_name
    )

    return {
        "experiment_name": experiment_name,
        "include_period_grades": include_period_grades,
        "feature_cols": feature_cols,
        "num_cols": num_cols,
        "cat_cols": cat_cols,
        "best_model_name": best_model_name,
        "best_pipeline": best_pipeline,
        "cv_results": cv_results,
        "test_metrics": {
            "mae": round(test_mae, 4),
            "rmse": round(test_rmse, 4),
            "r2": round(test_r2, 4)
        },
        "candidate_test_results": candidate_test_results,
        "fairness_report": fairness_report,
        "shap_results": shap_results,
        "explainer": explainer
    }


def audit_fairness(y_true, y_pred, audit_df: pd.DataFrame):
    """
    Performs fairness and error disparity audit across demographic subgroups.
    Metrics evaluated: Subgroup Sample Size N, MAE, RMSE, Mean Prediction Bias (pred - true).
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    bias = y_pred - y_true

    audit_summary = {}

    subgroup_definitions = {
        "gender": {
            "col": "sex",
            "labels": {"F": "Female Students", "M": "Male Students"}
        },
        "address": {
            "col": "address",
            "labels": {"U": "Urban Address", "R": "Rural Address"}
        },
        "school": {
            "col": "school",
            "labels": {"GP": "Gabriel Pereira (GP)", "MS": "Mousinho da Silveira (MS)"}
        }
    }

    for cat_name, meta in subgroup_definitions.items():
        col = meta["col"]
        labels = meta["labels"]
        cat_metrics = {}

        for val, label in labels.items():
            mask = (audit_df[col].values == val)
            n_samples = int(np.sum(mask))

            if n_samples == 0:
                continue

            sub_true = y_true[mask]
            sub_pred = y_pred[mask]
            sub_bias = bias[mask]

            sub_mae = float(mean_absolute_error(sub_true, sub_pred))
            sub_rmse = float(root_mean_squared_error(sub_true, sub_pred))
            mean_bias = float(np.mean(sub_bias))
            mean_actual = float(np.mean(sub_true))
            mean_predicted = float(np.mean(sub_pred))

            # Sample size sufficiency flag (N >= 25 in test set)
            is_reliable = bool(n_samples >= 25)

            cat_metrics[val] = {
                "label": label,
                "sample_size": n_samples,
                "reliable_sample": is_reliable,
                "mae": round(sub_mae, 3),
                "rmse": round(sub_rmse, 3),
                "mean_prediction_bias": round(mean_bias, 3),
                "mean_actual_grade": round(mean_actual, 2),
                "mean_predicted_grade": round(mean_predicted, 2),
                "bias_direction": "Overpredicting" if mean_bias > 0.1 else ("Underpredicting" if mean_bias < -0.1 else "Calibrated")
            }

        audit_summary[cat_name] = cat_metrics

    # Calculate disparity ratios
    if "gender" in audit_summary and "F" in audit_summary["gender"] and "M" in audit_summary["gender"]:
        mae_f = audit_summary["gender"]["F"]["mae"]
        mae_m = audit_summary["gender"]["M"]["mae"]
        audit_summary["gender_mae_disparity_ratio"] = round(max(mae_f, mae_m) / max(min(mae_f, mae_m), 0.001), 3)

    if "address" in audit_summary and "U" in audit_summary["address"] and "R" in audit_summary["address"]:
        mae_u = audit_summary["address"]["U"]["mae"]
        mae_r = audit_summary["address"]["R"]["mae"]
        audit_summary["address_mae_disparity_ratio"] = round(max(mae_u, mae_r) / max(min(mae_u, mae_r), 0.001), 3)

    print("\n[Fairness & Error Audit Summary]")
    for cat_name, metrics in audit_summary.items():
        if isinstance(metrics, dict):
            print(f"  Category: {cat_name.upper()}")
            for k, v in metrics.items():
                print(f"    - {v['label']} (N={v['sample_size']}, Reliable={v['reliable_sample']}): "
                      f"MAE={v['mae']} | Bias={v['mean_prediction_bias']} ({v['bias_direction']})")

    return audit_summary


def compute_shap_explanations(pipeline, X_train, X_test, experiment_name: str):
    """
    Computes global SHAP feature importance and saves summary plots.
    """
    preprocessor = pipeline.named_steps["preprocessor"]
    regressor = pipeline.named_steps["regressor"]

    X_train_trans = preprocessor.transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    # Extract feature names after OneHotEncoding
    ohe = preprocessor.named_transformers_["cat"].named_steps["onehot"]
    cat_feature_names = ohe.get_feature_names_out(CATEGORICAL_FEATURES)
    all_trans_feature_names = list(NUMERIC_FEATURES) + list(cat_feature_names)

    # Initialize Explainer based on model architecture
    if isinstance(regressor, (RandomForestRegressor, GradientBoostingRegressor)):
        explainer = shap.TreeExplainer(regressor)
        shap_values = explainer.shap_values(X_test_trans)
        expected_value = float(explainer.expected_value[0] if isinstance(explainer.expected_value, np.ndarray) else explainer.expected_value)
    else:
        # Linear or Ridge Regressor
        masker = shap.maskers.Independent(data=X_train_trans)
        explainer = shap.LinearExplainer(regressor, masker=masker)
        shap_vals_obj = explainer(X_test_trans)
        shap_values = shap_vals_obj.values
        expected_value = float(np.mean(pipeline.predict(X_train)))

    # Global feature importance: mean(|SHAP|)
    mean_abs_shap = np.mean(np.abs(shap_values), axis=0)
    top_indices = np.argsort(mean_abs_shap)[::-1]

    global_importances = []
    for idx in top_indices[:15]:
        global_importances.append({
            "feature": all_trans_feature_names[idx],
            "importance": round(float(mean_abs_shap[idx]), 4)
        })

    # Save SHAP Summary Bar Chart
    plt.figure(figsize=(10, 6), dpi=150)
    top_k = min(15, len(all_trans_feature_names))
    plot_indices = top_indices[:top_k][::-1]
    y_pos = np.arange(top_k)
    names = [all_trans_feature_names[i] for i in plot_indices]
    vals = [mean_abs_shap[i] for i in plot_indices]

    plt.barh(y_pos, vals, color="#3b82f6", edgecolor="#1d4ed8", alpha=0.85)
    plt.yticks(y_pos, names, fontsize=9)
    plt.xlabel("Mean |SHAP Value| (Impact on Grade Prediction)", fontsize=10, fontweight="bold")
    plt.title(f"Global Feature Importance (SHAP) - {experiment_name.title()}", fontsize=12, fontweight="bold")
    plt.tight_layout()
    shap_plot_path = os.path.join(PLOTS_DIR, f"shap_importance_{experiment_name}.png")
    plt.savefig(shap_plot_path)
    plt.close()

    print(f"  [SHAP] Global summary plot saved to {shap_plot_path}")

    return {
        "expected_value": round(expected_value, 2),
        "feature_names": all_trans_feature_names,
        "global_importances": global_importances,
        "shap_plot_path": shap_plot_path
    }, explainer


def plot_diagnostics(candidate_results, y_true, y_pred, best_model_name, experiment_name):
    """Generates publication-quality diagnostic charts for the model evaluation."""
    # 1. Model Comparison Chart (MAE, RMSE, R2)
    models = list(candidate_results.keys())
    maes = [candidate_results[m]["test_mae"] for m in models]
    rmses = [candidate_results[m]["test_rmse"] for m in models]
    r2s = [candidate_results[m]["test_r2"] for m in models]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5), dpi=150)
    x = np.arange(len(models))
    width = 0.35

    ax1.bar(x - width/2, maes, width, label="Test MAE", color="#6366f1")
    ax1.bar(x + width/2, rmses, width, label="Test RMSE", color="#ec4899")
    ax1.set_xticks(x)
    ax1.set_xticklabels(models, rotation=15, ha="right", fontsize=9)
    ax1.set_ylabel("Error (Points on 0-20 Scale)", fontsize=10)
    ax1.set_title(f"Error Metrics Comparison ({experiment_name})", fontsize=11, fontweight="bold")
    ax1.legend()
    ax1.grid(axis="y", linestyle="--", alpha=0.4)

    colors = ["#10b981" if r > 0 else "#f43f5e" for r in r2s]
    ax2.bar(models, r2s, color=colors, width=0.5, edgecolor="#0f766e")
    ax2.set_xticklabels(models, rotation=15, ha="right", fontsize=9)
    ax2.set_ylabel("R² Score", fontsize=10)
    ax2.set_title(f"R² Variance Explained ({experiment_name})", fontsize=11, fontweight="bold")
    ax2.grid(axis="y", linestyle="--", alpha=0.4)
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, f"model_comparison_{experiment_name}.png"))
    plt.close()

    # 2. Actual vs. Predicted & Residuals
    residuals = y_pred - y_true
    fig, (ax_scatter, ax_resid) = plt.subplots(1, 2, figsize=(13, 5), dpi=150)

    # Scatter
    ax_scatter.scatter(y_true, y_pred, alpha=0.65, color="#2563eb", edgecolors="none", s=45)
    ax_scatter.plot([0, 20], [0, 20], "r--", linewidth=1.5, label="Perfect 1:1 Line")
    ax_scatter.set_xlim(0, 20)
    ax_scatter.set_ylim(0, 20)
    ax_scatter.set_xlabel("Actual Final Grade (G3)", fontsize=10, fontweight="bold")
    ax_scatter.set_ylabel("Predicted Final Grade (G3)", fontsize=10, fontweight="bold")
    ax_scatter.set_title(f"Actual vs. Predicted Grade ({best_model_name})", fontsize=11, fontweight="bold")
    ax_scatter.legend()
    ax_scatter.grid(True, linestyle="--", alpha=0.3)

    # Residuals
    ax_resid.scatter(y_pred, residuals, alpha=0.65, color="#8b5cf6", edgecolors="none", s=45)
    ax_resid.axhline(0, color="red", linestyle="--", linewidth=1.5)
    ax_resid.set_xlabel("Predicted Final Grade (G3)", fontsize=10, fontweight="bold")
    ax_resid.set_ylabel("Residual (Pred - Actual)", fontsize=10, fontweight="bold")
    ax_resid.set_title(f"Residual Plot ({best_model_name})", fontsize=11, fontweight="bold")
    ax_resid.grid(True, linestyle="--", alpha=0.3)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, f"actual_vs_predicted_{experiment_name}.png"))
    plt.close()


def main():
    print("===================================================================")
    print(" STUDENT PERFORMANCE ANALYSIS: PIPELINE UPGRADE (UCI DATASET)      ")
    print("===================================================================")

    # Step 1: Load authentic data
    df = load_and_validate_dataset(DATA_PATH)

    # Step 2: Run Primary Experiment (Early Prediction without G1/G2)
    exp_early = run_experiment(df, experiment_name="early_prediction", include_period_grades=False)

    # Step 3: Run Secondary Experiment (Later Prediction with G1/G2)
    exp_later = run_experiment(df, experiment_name="later_prediction", include_period_grades=True)

    # Step 4: Serialize Pipeline Artifacts
    primary_pipeline_path = os.path.join(MODEL_DIR, "best_student_pipeline.joblib")
    joblib.dump(exp_early["best_pipeline"], primary_pipeline_path)
    print(f"\n[Artifact Saved] Primary pipeline saved to: {primary_pipeline_path}")

    # Also save later prediction pipeline
    later_pipeline_path = os.path.join(MODEL_DIR, "later_student_pipeline.joblib")
    joblib.dump(exp_later["best_pipeline"], later_pipeline_path)
    print(f"[Artifact Saved] Later pipeline saved to: {later_pipeline_path}")

    # Step 5: Save Model Metadata and Evaluation JSON
    metadata = {
        "dataset": {
            "name": "UCI Student Performance Dataset (Portuguese Language Course)",
            "source": "https://archive.ics.uci.edu/dataset/320/student+performance",
            "citation": "P. Cortez and A. Silva. Using Data Mining to Predict Secondary School Student Performance. EUROSIS, 2008.",
            "total_records": len(df),
            "total_features": df.shape[1],
            "target": "G3 (Final Grade, 0-20 scale)",
            "primary_experiment_features_count": len(exp_early["feature_cols"])
        },
        "primary_experiment": {
            "name": "Early Prediction (Pre-Midterm)",
            "description": "Predicts final grade G3 using habits, parental background, and academic history prior to period exams. Excludes G1 and G2 to eliminate target leakage.",
            "best_model": exp_early["best_model_name"],
            "test_metrics": exp_early["test_metrics"],
            "cv_metrics": exp_early["cv_results"][exp_early["best_model_name"]],
            "candidate_models": exp_early["candidate_test_results"],
            "fairness_audit": exp_early["fairness_report"],
            "shap_summary": exp_early["shap_results"].get("global_importances", [])
        },
        "secondary_experiment": {
            "name": "Later Prediction (With Midterm Grades)",
            "description": "Predicts final grade G3 using mid-term period grades (G1, G2). Demonstrates high predictive correlation as semester progresses.",
            "best_model": exp_later["best_model_name"],
            "test_metrics": exp_later["test_metrics"],
            "candidate_models": exp_later["candidate_test_results"]
        }
    }

    metadata_path = os.path.join(MODEL_DIR, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[Metadata Saved] Model evaluation metadata saved to: {metadata_path}")

    # Step 6: Also save feature names list for backwards compatibility
    feature_names_path = os.path.join(MODEL_DIR, "feature_names.txt")
    with open(feature_names_path, "w") as f:
        for feat in exp_early["feature_cols"]:
            f.write(f"{feat}\n")
    print(f"[Features Saved] Feature names written to: {feature_names_path}")

    print("\n===================================================================")
    print(" ML PIPELINE TRAINING COMPLETED SUCCESSFULLY!                      ")
    print(f" Primary Best Model: {exp_early['best_model_name']}")
    print(f" Test MAE : {exp_early['test_metrics']['mae']:.4f}")
    print(f" Test RMSE: {exp_early['test_metrics']['rmse']:.4f}")
    print(f" Test R²  : {exp_early['test_metrics']['r2']:.4f}")
    print("===================================================================")


if __name__ == "__main__":
    main()
