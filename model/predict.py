"""
predict.py
=============================================================================
Inference script for Student Performance G3 Grade Prediction (0 - 20 scale)
with integrated SHAP local explanations.

Schema:
  Predicts final Portuguese course grade G3 (0 - 20 scale) using the
  authentic UCI Student Performance feature pipeline.

Usage:
  python predict.py '{"studytime": 3, "failures": 0, "absences": 2, ...}'
=============================================================================
"""

import sys
import os
import json
import joblib
import numpy as np
import pandas as pd

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRIMARY_MODEL_PATH = os.path.join(BASE_DIR, "best_student_pipeline.joblib")
LATER_MODEL_PATH = os.path.join(BASE_DIR, "later_student_pipeline.joblib")

# Friendly labels for human-readable explanations
FEATURE_FRIENDLY_LABELS = {
    "studytime": "Weekly Study Time",
    "failures": "Past Class Failures",
    "absences": "Course Absences",
    "higher": "Desire for Higher Education",
    "Medu": "Mother's Education Level",
    "Fedu": "Father's Education Level",
    "schoolsup": "Extra School Educational Support",
    "famsup": "Family Educational Support",
    "goout": "Going Out with Friends",
    "Dalc": "Workday Alcohol Consumption",
    "Walc": "Weekend Alcohol Consumption",
    "health": "Current Health Status",
    "traveltime": "Home-to-School Commute Time",
    "famrel": "Family Relationship Quality",
    "freetime": "Free Time After School",
    "internet": "Home Internet Access",
    "romantic": "Romantic Relationship",
    "activities": "Extracurricular Activities",
    "paid": "Paid Extra Subject Classes",
    "nursery": "Attended Nursery School",
    "Pstatus": "Parent Cohabitation Status",
    "famsize": "Family Size",
    "age": "Student Age",
    "G1": "First Period Grade (G1)",
    "G2": "Second Period Grade (G2)",
}


def get_portuguese_grade_category(g3_score: float):
    """
    Classifies a 0 - 20 score into standard Portuguese secondary grading tiers.
    16 - 20: Muito Bom / Excelente (A / Excellent)
    14 - 15: Bom (B / Good)
    12 - 13: Suficiente Alto (C / Satisfactory)
    10 - 11: Suficiente (D / Passing)
    0  -  9: Insuficiente (F / At Risk - Fail)
    """
    g3 = round(float(g3_score), 1)
    if g3 >= 15.5:
        return "A", "Excellent", "Muito Bom (16-20): High academic achievement."
    elif g3 >= 13.5:
        return "B", "Good", "Bom (14-15): Solid academic standing above average."
    elif g3 >= 11.5:
        return "C", "Satisfactory", "Suficiente (12-13): Passing with average competency."
    elif g3 >= 9.5:
        return "D", "Needs Support", "Suficiente Mínimo (10-11): Borderline passing grade."
    else:
        return "F", "At Risk", "Insuficiente (0-9): Below minimum passing threshold (10/20)."


def generate_shap_explanation(pipeline, input_row_df, predicted_grade: float):
    """
    Generates local SHAP explanation for an individual prediction.
    """
    if not SHAP_AVAILABLE:
        return {
            "status": "unavailable",
            "message": "SHAP library not loaded in environment.",
            "factors": []
        }

    try:
        preprocessor = pipeline.named_steps["preprocessor"]
        regressor = pipeline.named_steps["regressor"]

        transformed_row = preprocessor.transform(input_row_df)

        # Get feature names from transformers
        cat_transformer = preprocessor.named_transformers_["cat"].named_steps["onehot"]
        num_cols = preprocessor.transformers_[0][2]
        cat_cols = preprocessor.transformers_[1][2]
        cat_feature_names = list(cat_transformer.get_feature_names_out(cat_cols))
        all_features = list(num_cols) + cat_feature_names

        explainer = shap.TreeExplainer(regressor)
        shap_vals = explainer.shap_values(transformed_row)

        if isinstance(shap_vals, list):
            sv = shap_vals[0][0]
        elif len(shap_vals.shape) == 2:
            sv = shap_vals[0]
        else:
            sv = shap_vals

        base_val = float(explainer.expected_value[0] if isinstance(explainer.expected_value, np.ndarray) else explainer.expected_value)

        # Map impacts back to original input features (aggregating one-hot dummies if any)
        feature_impacts = {}
        for feat_name, impact in zip(all_features, sv):
            # Check if this is a one-hot dummy (e.g., "higher_yes", "Mjob_health")
            matched_orig = None
            for orig in cat_cols:
                if feat_name.startswith(f"{orig}_"):
                    matched_orig = orig
                    break
            
            orig_col = matched_orig if matched_orig else feat_name
            feature_impacts[orig_col] = feature_impacts.get(orig_col, 0.0) + float(impact)

        # Separate positive and negative contributors
        positive_factors = []
        negative_factors = []

        for feat, impact in feature_impacts.items():
            friendly_label = FEATURE_FRIENDLY_LABELS.get(feat, feat)
            val = input_row_df[feat].iloc[0] if feat in input_row_df.columns else "N/A"
            rounded_imp = round(float(impact), 2)

            if abs(rounded_imp) < 0.05:
                continue

            item = {
                "feature": feat,
                "label": friendly_label,
                "value": str(val),
                "impact": rounded_imp,
                "direction": "higher" if rounded_imp > 0 else "lower",
                "description": (
                    f"{friendly_label} ({val}) pushed the predicted grade "
                    f"{'UP by +' + str(abs(rounded_imp)) if rounded_imp > 0 else 'DOWN by -' + str(abs(rounded_imp))} points."
                )
            }

            if rounded_imp > 0:
                positive_factors.append(item)
            else:
                negative_factors.append(item)

        positive_factors.sort(key=lambda x: x["impact"], reverse=True)
        negative_factors.sort(key=lambda x: x["impact"])  # most negative first

        # Human-readable summary
        summary_sentences = []
        if positive_factors:
            top_pos = positive_factors[0]
            summary_sentences.append(f"Top positive driver: {top_pos['label']} ({top_pos['value']}) added {top_pos['impact']:+.2f} pts.")
        if negative_factors:
            top_neg = negative_factors[0]
            summary_sentences.append(f"Top drag factor: {top_neg['label']} ({top_neg['value']}) subtracted {abs(top_neg['impact']):.2f} pts.")

        return {
            "status": "success",
            "base_grade": round(base_val, 2),
            "predicted_grade": round(predicted_grade, 2),
            "positive_factors": positive_factors[:5],
            "negative_factors": negative_factors[:5],
            "top_drivers_summary": " ".join(summary_sentences) if summary_sentences else "Feature contributions are closely balanced near baseline."
        }
    except Exception as e:
        return {
            "status": "fallback",
            "message": f"Local SHAP explanation could not be computed: {str(e)}",
            "positive_factors": [],
            "negative_factors": []
        }


def predict(input_data: dict) -> dict:
    """
    Main prediction logic for UCI Student Performance pipeline.
    """
    # Check if this request includes G1/G2 for later prediction
    use_later_model = bool(
        "G1" in input_data and "G2" in input_data and
        input_data.get("G1") not in (None, "") and
        input_data.get("G2") not in (None, "") and
        input_data.get("use_period_grades") is True
    )

    model_path = LATER_MODEL_PATH if use_later_model else PRIMARY_MODEL_PATH

    if not os.path.exists(model_path):
        return {
            "error": f"Model artifact not found at {model_path}. Please execute 'python model/student_model_pipeline.py' first."
        }

    try:
        pipeline = joblib.load(model_path)
    except Exception as e:
        return {"error": f"Failed to load ML pipeline artifact: {str(e)}"}

    # Extract and sanitize inputs with sensible defaults
    try:
        row = {
            # Numeric inputs
            "age": int(input_data.get("age", 16)),
            "Medu": int(input_data.get("Medu", 2)),
            "Fedu": int(input_data.get("Fedu", 2)),
            "traveltime": int(input_data.get("traveltime", 1)),
            "studytime": int(input_data.get("studytime", 2)),
            "failures": int(input_data.get("failures", 0)),
            "famrel": int(input_data.get("famrel", 4)),
            "freetime": int(input_data.get("freetime", 3)),
            "goout": int(input_data.get("goout", 3)),
            "Dalc": int(input_data.get("Dalc", 1)),
            "Walc": int(input_data.get("Walc", 1)),
            "health": int(input_data.get("health", 4)),
            "absences": int(input_data.get("absences", 2)),

            # Categorical inputs
            "famsize": str(input_data.get("famsize", "GT3")),
            "Pstatus": str(input_data.get("Pstatus", "T")),
            "Mjob": str(input_data.get("Mjob", "other")),
            "Fjob": str(input_data.get("Fjob", "other")),
            "reason": str(input_data.get("reason", "course")),
            "guardian": str(input_data.get("guardian", "mother")),
            "schoolsup": str(input_data.get("schoolsup", "no")),
            "famsup": str(input_data.get("famsup", "yes")),
            "paid": str(input_data.get("paid", "no")),
            "activities": str(input_data.get("activities", "yes")),
            "nursery": str(input_data.get("nursery", "yes")),
            "higher": str(input_data.get("higher", "yes")),
            "internet": str(input_data.get("internet", "yes")),
            "romantic": str(input_data.get("romantic", "no")),
        }

        # Input validation ranges
        if not (15 <= row["age"] <= 25):
            return {"error": f"Invalid age ({row['age']}). Age must be between 15 and 25."}
        if not (0 <= row["absences"] <= 93):
            return {"error": f"Invalid absences ({row['absences']}). Absences must be between 0 and 93."}
        if not (0 <= row["failures"] <= 4):
            return {"error": f"Invalid failures ({row['failures']}). Failures must be between 0 and 4."}
        if not (1 <= row["studytime"] <= 4):
            return {"error": f"Invalid studytime ({row['studytime']}). Studytime must be between 1 and 4."}

        if use_later_model:
            row["G1"] = float(input_data.get("G1", 12))
            row["G2"] = float(input_data.get("G2", 12))
            if not (0 <= row["G1"] <= 20) or not (0 <= row["G2"] <= 20):
                return {"error": "Midterm period grades (G1 and G2) must be between 0 and 20."}

        df_input = pd.DataFrame([row])

        # Execute ML prediction
        raw_pred = pipeline.predict(df_input)[0]
        predicted_grade = float(np.clip(raw_pred, 0.0, 20.0).round(2))

        grade_letter, performance_status, description = get_portuguese_grade_category(predicted_grade)

        # Generate local SHAP explanation
        shap_explanation = generate_shap_explanation(pipeline, df_input, predicted_grade)

        return {
            "predicted_grade": predicted_grade,
            "predicted_g3": predicted_grade,
            "scale": "0 - 20 (Portuguese Secondary Education Grading)",
            "grade_letter": grade_letter,
            "performance_status": performance_status,
            "status_description": description,
            "experiment": "later_prediction" if use_later_model else "early_prediction",
            "is_early_prediction": not use_later_model,
            "shap_explanation": shap_explanation,
            "input_summary": {
                "studytime": row["studytime"],
                "failures": row["failures"],
                "absences": row["absences"],
                "higher": row["higher"],
                "Medu": row["Medu"],
                "Fedu": row["Fedu"]
            }
        }
    except Exception as err:
        return {"error": f"Inference pipeline execution error: {str(err)}"}


if __name__ == "__main__":
    if len(sys.argv) > 1:
        raw_arg = sys.argv[1]
    else:
        raw_arg = sys.stdin.read().strip()

    try:
        parsed = json.loads(raw_arg)
        result = predict(parsed)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": f"Input parse error: {str(e)}"}))
