"""
test_pipeline.py
=============================================================================
Automated Test Suite for Student Performance Analysis System.
Covers:
  - Dataset loading and integrity (UCI student-por.csv)
  - Preprocessing pipeline and leakage elimination
  - Artifact serialization and model loading
  - Prediction output range (0.0 - 20.0 scale)
  - Input validation and bounds checking
  - SHAP local explainability generation
  - Fairness & error audit report integrity
=============================================================================
"""

import os
import sys
import json
import unittest
import numpy as np
import pandas as pd
import joblib

# Paths
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_PATH = os.path.join(REPO_ROOT, "data", "raw", "student-por.csv")
MODEL_DIR = os.path.join(REPO_ROOT, "model")
PRIMARY_PIPELINE_PATH = os.path.join(MODEL_DIR, "best_student_pipeline.joblib")
LATER_PIPELINE_PATH = os.path.join(MODEL_DIR, "later_student_pipeline.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

sys.path.insert(0, REPO_ROOT)
sys.path.insert(0, MODEL_DIR)

from preprocessing_module import load_data, load_and_preprocess
from predict import predict, get_portuguese_grade_category


class TestStudentPerformancePipeline(unittest.TestCase):

    def test_01_dataset_loading_and_integrity(self):
        """Verify authentic UCI Student Performance dataset exists, has 649 records, and 0 nulls."""
        self.assertTrue(os.path.exists(DATA_PATH), f"Dataset missing at {DATA_PATH}")
        df = load_data(DATA_PATH, sep=";")

        self.assertEqual(len(df), 649, f"Expected 649 rows, got {len(df)}")
        self.assertEqual(df.shape[1], 33, f"Expected 33 columns, got {df.shape[1]}")
        self.assertEqual(df.isnull().sum().sum(), 0, "Expected 0 missing values in authentic dataset")
        self.assertEqual(df.duplicated().sum(), 0, "Expected 0 duplicate records")

        # Target range check
        self.assertTrue("G3" in df.columns, "Target column 'G3' missing")
        self.assertGreaterEqual(df["G3"].min(), 0, "G3 minimum below 0")
        self.assertLessEqual(df["G3"].max(), 20, "G3 maximum above 20")

    def test_02_preprocessing_and_target_leakage_avoidance(self):
        """Verify preprocessing pipeline separates features, drops G1/G2 for early prediction, and yields clean X, y."""
        X, y = load_and_preprocess(DATA_PATH, target_col="G3", exclude_period_grades=True)

        self.assertEqual(len(X), 649)
        self.assertEqual(len(y), 649)
        # Ensure period grades are excluded in early prediction to prevent target leakage
        self.assertNotIn("G1", X.columns, "G1 leaked into early prediction features")
        self.assertNotIn("G2", X.columns, "G2 leaked into early prediction features")
        self.assertNotIn("G3", X.columns, "Target G3 leaked into feature matrix")

        # Target range
        self.assertGreaterEqual(y.min(), 0.0)
        self.assertLessEqual(y.max(), 20.0)

    def test_03_artifacts_and_model_loading(self):
        """Verify serialized scikit-learn pipeline artifacts exist and load correctly."""
        self.assertTrue(os.path.exists(PRIMARY_PIPELINE_PATH), "Primary model artifact missing")
        self.assertTrue(os.path.exists(LATER_PIPELINE_PATH), "Later prediction model artifact missing")
        self.assertTrue(os.path.exists(METADATA_PATH), "Model metadata JSON missing")

        pipe = joblib.load(PRIMARY_PIPELINE_PATH)
        self.assertTrue(hasattr(pipe, "predict"), "Loaded primary pipeline lacks 'predict' method")
        self.assertTrue(hasattr(pipe, "named_steps"), "Pipeline does not have named_steps")
        self.assertIn("preprocessor", pipe.named_steps)
        self.assertIn("regressor", pipe.named_steps)

    def test_04_prediction_output_range_and_tiers(self):
        """Verify prediction outputs are strictly bounded in [0.0, 20.0] and return valid grading tiers."""
        input_data = {
            "studytime": 3,
            "failures": 0,
            "absences": 2,
            "higher": "yes",
            "Medu": 4,
            "Fedu": 4,
            "health": 4
        }
        res = predict(input_data)
        self.assertNotIn("error", res, f"Prediction returned error: {res.get('error')}")

        pred_grade = res["predicted_grade"]
        self.assertIsInstance(pred_grade, float)
        self.assertGreaterEqual(pred_grade, 0.0)
        self.assertLessEqual(pred_grade, 20.0)

        # Grade letter check
        self.assertIn(res["grade_letter"], ["A", "B", "C", "D", "F"])
        self.assertIn(res["performance_status"], ["Excellent", "Good", "Satisfactory", "Needs Support", "At Risk"])

    def test_05_input_validation_errors(self):
        """Verify inference script catches out-of-range inputs and returns helpful validation errors."""
        # Invalid studytime (> 4)
        bad_study = {"studytime": 99, "failures": 0, "absences": 2}
        res_bad_study = predict(bad_study)
        self.assertIn("error", res_bad_study)
        self.assertIn("studytime", res_bad_study["error"].lower())

        # Invalid absences (< 0)
        bad_abs = {"studytime": 2, "failures": 0, "absences": -5}
        res_bad_abs = predict(bad_abs)
        self.assertIn("error", res_bad_abs)
        self.assertIn("absences", res_bad_abs["error"].lower())

        # Invalid age (> 25)
        bad_age = {"studytime": 2, "failures": 0, "absences": 4, "age": 85}
        res_bad_age = predict(bad_age)
        self.assertIn("error", res_bad_age)
        self.assertIn("age", res_bad_age["error"].lower())

    def test_06_later_prediction_experiment(self):
        """Verify later prediction mode utilizes G1 & G2 and flags experiment correctly."""
        input_data = {
            "use_period_grades": True,
            "G1": 16.0,
            "G2": 17.0,
            "studytime": 3,
            "failures": 0,
            "absences": 1
        }
        res = predict(input_data)
        self.assertNotIn("error", res)
        self.assertEqual(res["experiment"], "later_prediction")
        self.assertFalse(res["is_early_prediction"])
        # With high G1 and G2, predicted final grade should be high (> 14)
        self.assertGreaterEqual(res["predicted_grade"], 14.0)

    def test_07_shap_local_explanations(self):
        """Verify SHAP explanation structure, positive/negative factor separation, and directional signs."""
        input_data = {
            "studytime": 4,
            "failures": 0,
            "absences": 0,
            "higher": "yes",
            "Medu": 4,
            "Fedu": 4
        }
        res = predict(input_data)
        self.assertIn("shap_explanation", res)
        shap = res["shap_explanation"]

        self.assertIn(shap.get("status"), ["success", "fallback"])
        if shap.get("status") == "success":
            self.assertIn("base_grade", shap)
            self.assertGreater(shap["base_grade"], 0.0)
            self.assertIsInstance(shap.get("positive_factors"), list)
            self.assertIsInstance(shap.get("negative_factors"), list)

            for factor in shap.get("positive_factors", []):
                self.assertGreater(factor["impact"], 0.0)
                self.assertEqual(factor["direction"], "higher")

            for factor in shap.get("negative_factors", []):
                self.assertLess(factor["impact"], 0.0)
                self.assertEqual(factor["direction"], "lower")

    def test_08_fairness_audit_report(self):
        """Verify fairness report metrics, subgroup sample sizes, MAE disparity, and signed bias."""
        with open(METADATA_PATH, "r") as f:
            metadata = json.load(f)

        self.assertIn("primary_experiment", metadata)
        fairness = metadata["primary_experiment"]["fairness_audit"]

        # Check gender audit
        self.assertIn("gender", fairness)
        self.assertIn("F", fairness["gender"])
        self.assertIn("M", fairness["gender"])
        self.assertGreaterEqual(fairness["gender"]["F"]["sample_size"], 25)
        self.assertGreaterEqual(fairness["gender"]["M"]["sample_size"], 25)
        self.assertIn("mae", fairness["gender"]["F"])
        self.assertIn("mean_prediction_bias", fairness["gender"]["F"])

        # Check address audit
        self.assertIn("address", fairness)
        self.assertIn("U", fairness["address"])
        self.assertIn("R", fairness["address"])
        self.assertGreaterEqual(fairness["address"]["U"]["sample_size"], 25)

        # Disparity ratios
        self.assertIn("gender_mae_disparity_ratio", fairness)
        self.assertIn("address_mae_disparity_ratio", fairness)


if __name__ == "__main__":
    unittest.main()
