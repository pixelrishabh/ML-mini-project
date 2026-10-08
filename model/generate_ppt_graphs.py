"""
generate_ppt_graphs.py
----------------------
Generates 3 publication-ready, highly polished regression graphs
specifically formatted for PowerPoint presentations (PPT slides)
for the 10.0 CGPA scale model.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

def generate_graphs():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    from preprocessing_module import generate_synthetic_cgpa_dataset, load_and_preprocess
    from testing_module import split_data, get_models, evaluate_model

    print("[1/4] Loading dataset & evaluating model...")
    data_path = os.path.join(output_dir, "synthetic_cgpa_data.csv")
    if not os.path.exists(data_path):
        generate_synthetic_cgpa_dataset(n_samples=1000, save_path=data_path)

    X, y = load_and_preprocess(data_path, target_col="cgpa")
    X_train, X_test, y_train, y_test, scaler = split_data(X, y, test_size=0.2, random_state=42)

    model_inst = get_models()["Lasso Regression"]
    metrics = evaluate_model(model_inst, X_train, X_test, y_train, y_test)
    y_pred = metrics["y_pred"]
    fitted_model = metrics["fitted_model"]

    # -------------------------------------------------------------
    # GRAPH 1: Model Comparison (R² Score & MAE/RMSE)
    # -------------------------------------------------------------
    print("[2/4] Generating Graph 1: Model Performance Comparison...")
    models_df = pd.DataFrame({
        "Model": ["Lasso Regression", "Linear Regression", "Ridge Regression", "Random Forest"],
        "R2": [0.7359, 0.7350, 0.7350, 0.6580],
        "MAE": [0.2872, 0.2839, 0.2839, 0.3280],
        "RMSE": [0.3581, 0.3588, 0.3587, 0.4075]
    })

    fig, ax1 = plt.subplots(figsize=(9, 5.5), dpi=300)
    colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD']
    bars = ax1.bar(models_df['Model'], models_df['R2'], color=colors, width=0.55, edgecolor='#1E3A8A', linewidth=1.5)
    
    ax1.set_ylabel('R² Score (Accuracy % Variance Explained)', fontsize=12, fontweight='bold', color='#1E293B')
    ax1.set_ylim(0, 0.9)
    ax1.set_title('Model Performance Benchmark: R² Variance Score (10-Point Scale)', fontsize=14, fontweight='bold', pad=15, color='#0F172A')

    for bar in bars:
        height = bar.get_height()
        ax1.annotate(f'R² = {height:.4f}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 5), textcoords="offset points",
                    ha='center', va='bottom', fontsize=11, fontweight='bold', color='#1E293B')

    plt.xticks(fontsize=11, fontweight='bold')
    plt.tight_layout()
    g1_path = os.path.join(output_dir, "graph1_model_comparison_ppt.png")
    plt.savefig(g1_path, dpi=300)
    plt.close()

    # -------------------------------------------------------------
    # GRAPH 2: Actual vs Predicted CGPA Scatter Plot
    # -------------------------------------------------------------
    print("[3/4] Generating Graph 2: Actual vs Predicted CGPA...")
    fig, ax = plt.subplots(figsize=(8.5, 6), dpi=300)
    
    scatter = ax.scatter(y_test, y_pred, alpha=0.75, c=y_pred, cmap='viridis', edgecolors='w', s=50, linewidth=0.5)
    
    lims = [3.5, 10.2]
    ax.plot(lims, lims, color='#DC2626', linestyle='--', linewidth=2.5, label='Perfect Prediction Line (y = x)')
    
    ax.set_xlim(lims)
    ax.set_ylim(lims)
    ax.set_xlabel('Actual Student CGPA (0.0 - 10.0 Scale)', fontsize=12, fontweight='bold', color='#1E293B')
    ax.set_ylabel('Predicted Student CGPA (Model Output)', fontsize=12, fontweight='bold', color='#1E293B')
    ax.set_title('Regression Model: Actual vs. Predicted College CGPA', fontsize=14, fontweight='bold', pad=15, color='#0F172A')
    
    ax.text(0.05, 0.88, f'Model Accuracy Metrics:\n• R² Score = {metrics["R2"]:.4f} (~74% variance)\n• MAE = {metrics["MAE"]:.4f} CGPA points\n• RMSE = {metrics["RMSE"]:.4f}', 
            transform=ax.transAxes, fontsize=10.5, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.6', facecolor='#F1F5F9', edgecolor='#94A3B8', alpha=0.9))

    ax.legend(loc='lower right', frameon=True, facecolor='#F8FAFC', edgecolor='#CBD5E1', fontsize=10.5)
    plt.tight_layout()
    g2_path = os.path.join(output_dir, "graph2_actual_vs_predicted_ppt.png")
    plt.savefig(g2_path, dpi=300)
    plt.close()

    # -------------------------------------------------------------
    # GRAPH 3: Feature Impact / Regression Coefficients
    # -------------------------------------------------------------
    print("[4/4] Generating Graph 3: Feature Impact Coefficients...")
    coefs = pd.Series(fitted_model.coef_, index=X.columns).sort_values()
    
    clean_labels = {
        'high_school_gpa': 'Prior / High School GPA',
        'weekly_study_hours': 'Weekly Study Hours',
        'entrance_exam_score': 'Entrance Exam Score',
        'attendance_rate': 'Lecture Attendance Rate',
        'assignment_submission_rate': 'Lab / Assignment Submission',
        'class_participation': 'Seminar / Lab Participation',
        'daily_sleep_hours': 'Daily Sleep Hours',
        'extracurricular_hours': 'Extracurricular Hours',
        'family_income_level_Middle': 'Income: Middle Bracket',
        'major_Social Science': 'Major: Social Science',
        'major_Science': 'Major: Science',
        'major_Business': 'Major: Business',
        'major_Engineering': 'Major: Engineering',
        'family_income_level_Low': 'Income: Low / Aid Eligible',
        'commute_time_minutes': 'Commute Time (Min)',
        'part_time_work_hours': 'Part-Time Work (Hrs)',
        'screen_time_hours': 'Leisure Screen Time (Hrs)'
    }
    
    coefs.index = [clean_labels.get(col, col) for col in coefs.index]
    
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    colors = ['#EF4444' if val < 0 else '#10B981' for val in coefs.values]
    bars = ax.barh(coefs.index, coefs.values, color=colors, height=0.6, edgecolor='#334155', linewidth=0.8)
    
    ax.axvline(0, color='#64748B', linestyle='-', linewidth=1.2)
    ax.set_xlabel('Standardized Regression Beta Weight', fontsize=12, fontweight='bold', color='#1E293B')
    ax.set_title('Feature Drivers of University Student CGPA (10.0 Scale)', fontsize=14, fontweight='bold', pad=15, color='#0F172A')
    
    for bar in bars:
        width = bar.get_width()
        offset = 0.005 if width >= 0 else -0.005
        ha = 'left' if width >= 0 else 'right'
        ax.annotate(f'{width:+.3f}',
                    xy=(width + offset, bar.get_y() + bar.get_height() / 2),
                    ha=ha, va='center', fontsize=9.5, fontweight='bold', color='#1E293B')

    plt.tight_layout()
    g3_path = os.path.join(output_dir, "graph3_feature_importance_ppt.png")
    plt.savefig(g3_path, dpi=300)
    plt.close()

    print("[DONE] All 3 PPT regression graphs regenerated for 10.0 CGPA scale!")

if __name__ == "__main__":
    generate_graphs()
