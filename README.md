# Student Performance & CGPA Prediction System 🎓📊

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_+_Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/ML-Python_3_+_Scikit--Learn-3776AB?logo=python&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An end-to-end Machine Learning and Full-Stack web application designed to forecast university students' academic performance and Cumulative Grade Point Average (**CGPA on a 0.0 – 10.0 scale**). Built using a high-performance **MERN** architecture coupled with an advanced **Scikit-Learn Regression Pipeline**.

---

## 🌟 Key Highlights

- **Predictive ML Intelligence**: Multi-regression algorithm benchmark comparing Linear, Ridge, Lasso, and Random Forest models with 5-fold cross-validation.
- **Full-Stack MERN Architecture**: Seamlessly connects a React 19 + Vite client to an Express.js REST API with resilient MongoDB persistence.
- **Zero-Downtime Fallback**: If MongoDB or local Python environments are temporarily offline, the backend gracefully switches to in-memory history storage and verified deterministic fallback estimation.
- **Dynamic UI/UX**: Responsive interface styled with modern Tailwind CSS, Lucide icons, dark/light theme switching, and real-time form validation.
- **Academic Project Deliverables**: Includes pre-generated diagnostic plots, model comparison charts, presentation slide deck (`miniproject ppt.pptx`), and formal project report (`Synopsis Report ml.docx`).

---

## 📁 Repository Structure

```text
ML-mini-project/
├── backend/                             # Express.js REST API Server
│   ├── config/
│   │   └── db.js                        # MongoDB Mongoose connection + memory store fallback
│   ├── controllers/
│   │   └── predictionController.js      # Validation, child-process ML runner & CRUD
│   ├── models/
│   │   └── Prediction.js                # Schema definition for student prediction logs
│   ├── routes/
│   │   └── predictionRoutes.js          # REST endpoints (/api/predictions, /api/predict)
│   ├── package.json
│   └── server.js                        # Backend entrypoint (Port 5000)
│
├── frontend/                            # Modern React SPA (Vite + Tailwind CSS)
│   ├── public/                          # Static assets and icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx                 # Intro header & system overview
│   │   │   ├── Navbar.jsx               # Branding and theme switch
│   │   │   ├── PredictionForm.jsx       # Multi-input form with input validation
│   │   │   ├── ResultCard.jsx           # Animated predicted CGPA & performance badge
│   │   │   └── PredictionsHistory.jsx   # Live history table with delete & refresh actions
│   │   ├── context/
│   │   │   └── ThemeContext.jsx         # Dark / Light theme provider
│   │   ├── App.jsx                      # Main app shell & API orchestration
│   │   ├── index.css                    # Tailwind CSS directives and base styling
│   │   └── main.jsx                     # Application bootstrap
│   ├── index.html
│   ├── vite.config.js                   # Client dev server configuration (Port 3000)
│   └── package.json
│
├── model/                               # Python Machine Learning Suite
│   ├── student_model_pipeline.py        # Complete training, evaluation & export pipeline
│   ├── preprocessing_module.py          # Data cleaning, encoding & feature scaling routines
│   ├── testing_module.py                # Standalone test runner and metric calculation
│   ├── predict.py                       # Lightweight CLI & programmatic inference script
│   ├── generate_ppt_graphs.py           # Presentation graph generator
│   ├── model.pkl                        # Serialized best-performing regression model
│   ├── scaler.pkl                       # Serialized StandardScaler artifact
│   ├── feature_names.txt                # Exported feature schema
│   ├── synthetic_cgpa_data.csv          # Comprehensive training dataset
│   ├── demo_student_data.csv            # Sample evaluation records
│   ├── model_comparison_results.csv     # Benchmark metrics across models
│   ├── requirements.txt                 # Python dependencies
│   └── *.png                            # Diagnostic & performance evaluation plots
│
├── Synopsis Report ml.docx              # Complete project synopsis report
├── miniproject ppt.pptx                  # Project presentation slides
├── .gitignore                           # Git ignore specification
└── README.md                            # Comprehensive project documentation
```

---

## 🤖 Machine Learning Model & Performance

The pipeline evaluates multiple regression models on synthetic academic performance distributions calibrated to standard university grading metrics.

### Model Benchmark Comparison

| Model | $R^2$ (Test) | MAE (Test) | RMSE (Test) | 5-Fold CV $R^2$ (Mean) | 5-Fold CV $R^2$ (Std) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Lasso Regression** | **0.7359** | **0.2872** | **0.3581** | **0.7412** | $\pm 0.0327$ |
| **Linear Regression** | 0.7350 | 0.2839 | 0.3588 | 0.7428 | $\pm 0.0310$ |
| **Ridge Regression** | 0.7350 | 0.2839 | 0.3587 | 0.7428 | $\pm 0.0311$ |
| **Random Forest Regressor** | 0.6580 | 0.3280 | 0.4075 | 0.6401 | $\pm 0.0397$ |

### Grading & Categorization Scale

| Predicted CGPA | Letter Grade | Performance Category | Academic Remark |
|:---:|:---:|:---:|---|
| **9.0 – 10.0** | `A+` | Outstanding | Dean's List / Distinction |
| **8.0 – 8.9** | `A` | Strong | First Class with Distinction |
| **7.0 – 7.9** | `B+` | Strong | First Class |
| **6.0 – 6.9** | `B` | Satisfactory | Higher Second Class |
| **5.0 – 5.9** | `C` | Needs Attention | Second Class / Needs Improvement |
| **4.0 – 4.9** | `P` | Needs Attention | Pass Grade |
| **< 4.0** | `F` | Critical | Academic Probation / Remedial Required |

---

## 📋 Input Features Specification

| Feature Name | Type | Range / Options | Description |
|---|:---:|:---:|---|
| `high_school_gpa` | Float | `0.0 – 10.0` | Previous high school academic performance |
| `entrance_exam_score` | Float | `40 – 100` | Entrance test score / aptitude percentage |
| `course_load` | Integer | `12 – 21` | Credit hours enrolled in current semester |
| `attendance_rate` | Float | `40 – 100%` | Lecture and lab attendance percentage |
| `major` | String | Engineering, Business, Arts, Science, Social Science | Academic discipline |
| `weekly_study_hours` | Float | `0 – 45` | Self-study hours dedicated per week |
| `class_participation` | Integer | `1 – 10` | In-class engagement & active participation rating |
| `assignment_submission_rate` | Float | `30 – 100%` | Timely homework / assignment completion rate |
| `extracurricular_hours` | Float | `0 – 20` | Hours dedicated to clubs, sports, or volunteering |
| `daily_sleep_hours` | Float | `3 – 10` | Average daily sleep hours |
| `part_time_work_hours` | Float | `0 – 35` | Weekly employment / job commitment hours |
| `commute_time_minutes` | Float | `0 – 100` | Daily one-way travel time to campus |
| `screen_time_hours` | Float | `0 – 14` | Daily leisure / recreational screen time |
| `family_income_level` | String | `Low`, `Middle`, `High` | Socioeconomic tier |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Python** (v3.9 or higher) + `pip`
- **MongoDB** (Optional; runs seamlessly with built-in in-memory fallback if not installed)
- **Git**

---

### 2. Clone the Repository
```bash
git clone https://github.com/pixelrishabh/ML-mini-project.git
cd ML-mini-project
```

---

### 3. Setup Python ML Environment
```bash
# Navigate to the model directory
cd model

# Install required Python libraries
pip install -r requirements.txt

# (Optional) Retrain models and re-generate diagnostic evaluation charts
python student_model_pipeline.py

# Test direct inference from command line:
python predict.py "{\"high_school_gpa\": 8.8, \"entrance_exam_score\": 92, \"course_load\": 16, \"attendance_rate\": 95, \"major\": \"Engineering\", \"weekly_study_hours\": 20, \"class_participation\": 8, \"assignment_submission_rate\": 96, \"extracurricular_hours\": 4, \"daily_sleep_hours\": 7.5, \"part_time_work_hours\": 0, \"commute_time_minutes\": 20, \"screen_time_hours\": 3, \"family_income_level\": \"Middle\"}"

cd ..
```

---

### 4. Setup Backend (Node.js + Express)
```bash
# Navigate into backend directory
cd backend

# Install dependencies
npm install

# Start Express server (runs on port 5000)
npm start
```
*The backend API will start on `http://localhost:5000`.*

---

### 5. Setup Frontend (React + Vite)
Open a new terminal window:
```bash
# Navigate into frontend directory
cd frontend

# Install dependencies
npm install

# Launch Vite development server (runs on port 3000)
npm run dev
```
*Open your browser and navigate to `http://localhost:3000`.*

---

## 📡 REST API Reference

### Health Check
- **`GET /health`** or **`GET /api/health`**
  - **Response**:
    ```json
    {
      "status": "ok",
      "stack": "MERN (MongoDB, Express, React, Node.js)",
      "service": "Student Performance Prediction API"
    }
    ```

### Generate Prediction
- **`POST /api/predictions`** or **`POST /api/predict`**
  - **Payload**:
    ```json
    {
      "student_name": "Rishabh",
      "high_school_gpa": 8.5,
      "entrance_exam_score": 88,
      "course_load": 15,
      "attendance_rate": 92,
      "major": "Engineering",
      "weekly_study_hours": 18,
      "class_participation": 8,
      "assignment_submission_rate": 95,
      "extracurricular_hours": 5,
      "daily_sleep_hours": 7,
      "part_time_work_hours": 0,
      "commute_time_minutes": 25,
      "screen_time_hours": 3.5,
      "family_income_level": "Middle"
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Prediction generated and saved successfully.",
      "data": {
        "predicted_cgpa": 8.42,
        "grade_letter": "A",
        "performance_status": "Strong"
      }
    }
    ```

### Fetch Prediction Records
- **`GET /api/predictions`**
  - Returns the 50 most recent prediction logs.

### Delete Prediction Record
- **`DELETE /api/predictions/:id`**
  - Deletes a specific prediction entry by ID.

---

## 📊 Visualizations Included

The `model/` directory contains generated diagnostic and evaluation plots:
- `correlation_heatmap.png`: Inter-feature correlation matrix.
- `feature_importance.png`: Feature weight ranking in performance prediction.
- `model_comparison_plot.png`: Metric breakdown ($R^2$, MAE, RMSE) across models.
- `best_model_diagnostics.png`: Residuals distribution and actual vs. predicted plot.
- `graph1_model_comparison_ppt.png`, `graph2_actual_vs_predicted_ppt.png`, `graph3_feature_importance_ppt.png`: Formatted figures for presentation slides.

---

## 👥 Contributors

- **Rishabh** ([@pixelrishabh](https://github.com/pixelrishabh))

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
