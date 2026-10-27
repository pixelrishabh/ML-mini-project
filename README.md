# Student Academic Performance Analysis & Prediction System 🎓📊

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_+_Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/ML-Python_3_+_Scikit--Learn-3776AB?logo=python&logoColor=white)](https://scikit-learn.org/)
[![SHAP](https://img.shields.io/badge/Explainability-SHAP_TreeExplainer-ff69b4)](https://shap.readthedocs.io/)
[![Fairness](https://img.shields.io/badge/Ethics-Demographic_Fairness_Audit-8A2BE2)](https://doi.org/10.3390/app15158409)

A production-grade Machine Learning and Full-Stack web application designed to forecast secondary school students' final academic performance (**Final Grade G3 on the authentic 0.0 – 20.0 Portuguese grading scale**). Built using the **UCI Student Performance Dataset**, a unified **Scikit-Learn Pipeline** (`ColumnTransformer` + candidate regressors), real-time **SHAP local feature attribution**, and a transparent **demographic fairness and error disparity audit** inspired by recent research in *Applied Sciences* (2025).

---

## 🌟 Key Upgrades & Architecture Highlights

1. **Authentic UCI Student Performance Dataset**:
   - Primary experiment trains on the authentic `student-por.csv` (Portuguese Language Course, 649 records, 33 attributes, 0 null values, 0 duplicates).
   - Target variable: **Final Grade G3** on the official Portuguese 0–20 scale ($<10$: Fail / Insuficiente, $10-11$: Pass / Suficiente, $12-13$: Satisfactory, $14-15$: Good / Bom, $16-20$: Excellent / Muito Bom).
2. **Two Isolated Experiments (Target Leakage Prevention)**:
   - **Primary (Early Warning Prediction)**: Predicts final grade G3 using habits, parental background, support systems, and absences *prior to period exams*, strictly excluding $G1$ and $G2$ to eliminate target leakage.
   - **Secondary (Mid-Semester Monitoring)**: Incorporates $G1$ and $G2$ to demonstrate continuous semester monitoring, where earlier grades dominate ($R^2 \approx 0.84$, $\text{MAE} \approx 0.73$).
3. **Reproducible ML Pipeline (`ColumnTransformer` + Pipeline)**:
   - 5-fold cross-validation on training folds (80% split) across **Linear Regression**, **Ridge Regression**, **Random Forest Regressor**, and **Gradient Boosting Regressor**.
   - Hyperparameter selection via cross-validation, evaluated once on an independent held-out test cohort (130 records).
4. **SHAP Explainability**:
   - Integrated TreeExplainer calculating global feature importance (mean absolute SHAP values) and local individual prediction attributions (features pushing predictions higher or lower).
5. **Transparent Fairness & Error Audit**:
   - Evaluates subgroup MAE, RMSE, sample sufficiency, and directional signed prediction bias across **Gender** (`sex`: F vs M), **Residential Location** (`address`: U vs R), and **School** (`school`: GP vs MS).
   - Sensitive demographic variables are separated from the primary feature pipeline to avoid disparate treatment.
6. **Robust Full-Stack MERN Architecture**:
   - Express backend with strict input schema validation, zero handcrafted mathematical fallbacks, diagnostic error handling, and live MongoDB persistence with transparent in-memory session status reporting.
   - React 19 frontend with 4 responsive navigation tabs: *Prediction Studio*, *Model Benchmarks*, *Fairness Audit*, and *Dataset Documentation*.

---

## 📊 Held-Out Test Set Performance & Evaluation Results

All candidate models were tuned using 5-fold cross-validation on 519 training records and evaluated once on the 130 held-out test records:

### Primary Experiment: Early Prediction (Excluding G1 & G2)
| Candidate Model | 5-Fold CV MAE | 5-Fold CV RMSE | 5-Fold CV R² | Held-Out Test MAE | Held-Out Test RMSE | Held-Out Test R² | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Random Forest Regressor** | **2.009** | **2.729** | **0.265** | **2.046** | **2.820** | **0.185** | **Selected Best** |
| Gradient Boosting Regressor | 2.108 | 2.843 | 0.195 | 2.101 | 2.807 | 0.192 | Candidate |
| Ridge Regression (alpha=2.0) | 2.072 | 2.852 | 0.191 | 2.130 | 2.860 | 0.161 | Candidate |
| Linear Regression | 2.084 | 2.861 | 0.186 | 2.146 | 2.873 | 0.153 | Candidate |

### Secondary Experiment: Later Monitoring (With G1 & G2)
| Candidate Model | 5-Fold CV MAE | 5-Fold CV RMSE | 5-Fold CV R² | Held-Out Test MAE | Held-Out Test RMSE | Held-Out Test R² | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Gradient Boosting Regressor** | **0.838** | **1.288** | **0.834** | **0.731** | **1.253** | **0.839** | **Selected Best** |
| Random Forest Regressor | 0.845 | 1.308 | 0.828 | 0.772 | 1.280 | 0.832 | Candidate |
| Ridge Regression | 0.881 | 1.335 | 0.825 | 0.758 | 1.259 | 0.837 | Candidate |
| Linear Regression | 0.886 | 1.340 | 0.824 | 0.761 | 1.265 | 0.836 | Candidate |

---

## ⚖️ Demographic Fairness Audit Summary (Held-Out Test Set)

Inspired by: *Beyond Performance: Explaining and Ensuring Fairness in Student Academic Performance Prediction with Machine Learning* (Applied Sciences, 2025, DOI: [10.3390/app15158409](https://doi.org/10.3390/app15158409)).

| Demographic Category | Subgroup | Sample Size ($N$) | Data Sufficiency | Subgroup MAE | Mean Actual Grade | Mean Pred Grade | Signed Bias ($\bar{\hat{y}} - \bar{y}$) | Disparity Ratio |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gender (`sex`)** | Female (F) | 89 | Adequate ($N \ge 25$) | 2.051 | 12.75 | 12.19 | -0.559 (Underpredicting) | **1.008x** |
| | Male (M) | 41 | Adequate ($N \ge 25$) | 2.035 | 11.49 | 11.77 | +0.283 (Overpredicting) | |
| **Address (`address`)** | Urban (U) | 94 | Adequate ($N \ge 25$) | 2.003 | 12.65 | 12.32 | -0.333 (Underpredicting) | **1.078x** |
| | Rural (R) | 36 | Adequate ($N \ge 25$) | 2.159 | 11.61 | 11.42 | -0.190 (Underpredicting) | |
| **School (`school`)** | Gabriel Pereira (GP) | 87 | Adequate ($N \ge 25$) | 1.727 | 13.01 | 12.59 | -0.420 (Underpredicting) | **1.558x** |
| | Mousinho da Silveira (MS) | 43 | Adequate ($N \ge 25$) | 2.691 | 11.05 | 11.01 | -0.037 (Calibrated) | |

---

## 📁 Repository Directory Structure

```text
ml_model/
├── data/
│   └── raw/
│       ├── student-por.csv              # Authentic UCI Portuguese dataset (649 records)
│       ├── student-mat.csv              # UCI Math dataset (reference)
│       └── student.txt                  # Official feature dictionary & citation notes
│
├── model/                               # Reproducible Machine Learning Suite
│   ├── student_model_pipeline.py        # Complete training, CV, export & audit pipeline
│   ├── predict.py                       # CLI & programmatic inference with local SHAP
│   ├── preprocessing_module.py          # Data cleaning & ColumnTransformer routines
│   ├── testing_module.py                # Standalone model comparison harness
│   ├── best_student_pipeline.joblib     # Exported scikit-learn Early Prediction pipeline
│   ├── later_student_pipeline.joblib    # Exported scikit-learn Later Prediction pipeline
│   ├── model_metadata.json              # Versioned evaluation benchmarks, CV, SHAP & audit
│   ├── requirements.txt                 # Model dependency manifest (scikit-learn, shap, etc.)
│   └── plots/                           # Publication-grade diagnostic charts
│       ├── model_comparison_early_prediction.png
│       ├── actual_vs_predicted_early_prediction.png
│       └── shap_importance_early_prediction.png
│
├── backend/                             # Express.js REST API Server
│   ├── config/
│   │   └── db.js                        # Mongoose connection + session status warning
│   ├── controllers/
│   │   └── predictionController.js      # Input validation, Python spawn, metadata & CRUD
│   ├── models/
│   │   └── Prediction.js                # Schema for UCI student attributes & G3 (0-20)
│   ├── routes/
│   │   └── predictionRoutes.js          # REST endpoints (/api/predictions, /api/model/metadata)
│   ├── package.json
│   └── server.js                        # Express server entrypoint (Port 5000)
│
├── frontend/                            # Modern React 19 Client (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx                 # Intro header & system overview
│   │   │   ├── Navbar.jsx               # Tabs & MongoDB persistence status indicator
│   │   │   ├── PredictionForm.jsx       # Validated form with presets & early/later toggle
│   │   │   ├── ResultCard.jsx           # 0-20 score, grade tier, local SHAP attribution
│   │   │   ├── ModelDiagnostics.jsx     # Live CV benchmark table & global SHAP chart
│   │   │   ├── FairnessAudit.jsx        # Subgroup disparity tables & ethical discussion
│   │   │   ├── DatasetInfo.jsx          # UCI dataset citation & feature definitions
│   │   │   └── PredictionsHistory.jsx   # Prediction logs with session/MongoDB status
│   │   ├── App.jsx                      # Main app shell & API orchestration
│   │   └── index.css                    # Tailwind CSS directives
│   └── package.json
│
├── tests/                               # Automated Test Suites
│   ├── test_pipeline.py                 # Python unit tests (8 tests: data, ML, SHAP, fairness)
│   └── test_backend.js                  # Node.js integration tests (17 tests: API, validation, CRUD)
│
├── preprocessing_module.py              # Root preprocessing wrapper
├── testing_module.py                    # Root testing wrapper
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python**: 3.10+ (tested on Python 3.13)
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Optional local MongoDB daemon on port 27017 (runs seamlessly in zero-config session buffer mode if offline).

### 2. Python Environment Setup & Training
```bash
# 1. Install ML dependencies (scikit-learn, shap, pandas, joblib)
python -m pip install -r model/requirements.txt

# 2. Retrain the complete ML pipeline and generate all diagnostic artifacts
python model/student_model_pipeline.py
```

### 3. Backend Setup & Startup
```bash
# Navigate to backend directory and install dependencies
cd backend
npm install

# Start the Express API server (Port 5000)
npm start
```
The server will start at `http://localhost:5000` and automatically connect to MongoDB or default to safe in-memory session mode.

### 4. Frontend Setup & Startup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend
npm install

# Launch Vite development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🧪 Automated Testing

The project includes an end-to-end automated test suite verifying data integrity, model bounds, SHAP explainability, input validation, and full-stack REST integration:

```bash
# 1. Run Python ML & Data Integrity Test Suite (8 tests)
python tests/test_pipeline.py

# 2. Run Backend REST API & Python Spawn Integration Tests (17 tests)
node tests/test_backend.js
```

All 25 tests pass with zero errors.

---

## 📖 Official Dataset Citation & License

- **Dataset**: UCI Student Performance Data Set
- **Source**: [https://archive.ics.uci.edu/dataset/320/student+performance](https://archive.ics.uci.edu/dataset/320/student+performance)
- **Official Citation**:
  > P. Cortez and A. Silva. *Using Data Mining to Predict Secondary School Student Performance*. In A. Brito and J. Teixeira Eds., Proceedings of 5th FUture BUsiness TEChnology Conference (FUBUTEC 2008) pp. 5-12, Porto, Portugal, April, 2008, EUROSIS, ISBN 978-9077381-39-7.
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0).

---

## ⚠️ Ethical Disclaimer & Limitations

Model predictions represent statistical cohort estimations intended strictly for early academic counseling and targeted tutoring support. They must never be interpreted as deterministic judgments of an individual student's intellectual capacity or future potential.
