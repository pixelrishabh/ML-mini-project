"""
predict.py
----------
CLI and programmatic inference script for student CGPA prediction
supporting the 14-feature raw input schema mapped to the 18 model features.
Scale: 0.0 - 10.0 CGPA (University Grading Scale)

Raw Features:
  - high_school_gpa (0.0 - 10.0)
  - entrance_exam_score (40 - 100)
  - course_load (12 - 21)
  - attendance_rate (40 - 100)
  - major ('Engineering', 'Business', 'Arts', 'Science', 'Social Science')
  - weekly_study_hours (0 - 45)
  - class_participation (1 - 10)
  - assignment_submission_rate (30 - 100)
  - extracurricular_hours (0 - 20)
  - daily_sleep_hours (3 - 10)
  - part_time_work_hours (0 - 35)
  - commute_time_minutes (0 - 100)
  - screen_time_hours (0 - 14)
  - family_income_level ('Low', 'Middle', 'High')

Usage:
  python predict.py '{"high_school_gpa": 8.5, "entrance_exam_score": 90, ...}'
"""

import sys
import os
import json
import joblib
import numpy as np
import pandas as pd

def get_grade_category(cgpa):
    if cgpa >= 9.0:
        return "A+", "Outstanding"
    elif cgpa >= 8.0:
        return "A", "Strong"
    elif cgpa >= 7.0:
        return "B+", "Strong"
    elif cgpa >= 6.0:
        return "B", "Satisfactory"
    elif cgpa >= 5.0:
        return "C", "Needs Attention"
    elif cgpa >= 4.0:
        return "P", "Needs Attention"
    else:
        return "F", "Critical"

def predict(input_data):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model.pkl")
    scaler_path = os.path.join(base_dir, "scaler.pkl")
    feature_names_path = os.path.join(base_dir, "feature_names.txt")

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        return {"error": "Model or scaler artifact not found."}

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    if os.path.exists(feature_names_path):
        with open(feature_names_path, "r") as f:
            feature_names = [line.strip() for line in f if line.strip()]
    else:
        feature_names = [
            "high_school_gpa", "entrance_exam_score", "course_load", "attendance_rate",
            "weekly_study_hours", "class_participation", "assignment_submission_rate",
            "extracurricular_hours", "daily_sleep_hours", "part_time_work_hours",
            "commute_time_minutes", "screen_time_hours",
            "major_Business", "major_Engineering", "major_Science", "major_Social Science",
            "family_income_level_Low", "family_income_level_Middle"
        ]

    try:
        # Extract raw features with default values if missing
        high_school_gpa = float(input_data.get("high_school_gpa", 7.5))
        entrance_exam_score = float(input_data.get("entrance_exam_score", 75))
        course_load = int(input_data.get("course_load", 15))
        attendance_rate = float(input_data.get("attendance_rate", 85))
        weekly_study_hours = float(input_data.get("weekly_study_hours", 15))
        class_participation = int(input_data.get("class_participation", 7))
        assignment_submission_rate = float(input_data.get("assignment_submission_rate", 88))
        extracurricular_hours = float(input_data.get("extracurricular_hours", 5))
        daily_sleep_hours = float(input_data.get("daily_sleep_hours", 6.5))
        part_time_work_hours = float(input_data.get("part_time_work_hours", 8))
        commute_time_minutes = float(input_data.get("commute_time_minutes", 30))
        screen_time_hours = float(input_data.get("screen_time_hours", 4))
        
        major = str(input_data.get("major", "Engineering"))
        family_income_level = str(input_data.get("family_income_level", "Middle"))

        # Build feature dictionary matching dummy encoded schema
        row = {
            "high_school_gpa": high_school_gpa,
            "entrance_exam_score": entrance_exam_score,
            "course_load": course_load,
            "attendance_rate": attendance_rate,
            "weekly_study_hours": weekly_study_hours,
            "class_participation": class_participation,
            "assignment_submission_rate": assignment_submission_rate,
            "extracurricular_hours": extracurricular_hours,
            "daily_sleep_hours": daily_sleep_hours,
            "part_time_work_hours": part_time_work_hours,
            "commute_time_minutes": commute_time_minutes,
            "screen_time_hours": screen_time_hours,
            "major_Business": 1 if major == "Business" else 0,
            "major_Engineering": 1 if major == "Engineering" else 0,
            "major_Science": 1 if major == "Science" else 0,
            "major_Social Science": 1 if major == "Social Science" else 0,
            "family_income_level_Low": 1 if family_income_level == "Low" else 0,
            "family_income_level_Middle": 1 if family_income_level == "Middle" else 0,
        }

        df = pd.DataFrame([row], columns=feature_names)
        scaled_df = pd.DataFrame(scaler.transform(df), columns=feature_names)

        raw_pred = model.predict(scaled_df)[0]
        predicted_cgpa = float(np.clip(raw_pred, 0.0, 10.0).round(2))
        grade_letter, performance_status = get_grade_category(predicted_cgpa)

        return {
            "predicted_cgpa": predicted_cgpa,
            "predicted_grade": predicted_cgpa,
            "predicted_score": predicted_cgpa,
            "grade_letter": grade_letter,
            "performance_status": performance_status
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
    else:
        raw_input = sys.stdin.read().strip()

    try:
        parsed_json = json.loads(raw_input)
        res = predict(parsed_json)
        print(json.dumps(res))
    except Exception as err:
        print(json.dumps({"error": f"Failed to parse input: {str(err)}"}))
