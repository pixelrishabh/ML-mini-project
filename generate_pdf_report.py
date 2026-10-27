import os
import subprocess
import base64
import time

def encode_image(rel_path):
    full_path = os.path.abspath(rel_path)
    if not os.path.exists(full_path):
        return ""
    with open(full_path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/png;base64,{data}"

def build_html_report():
    img1 = encode_image("model/graph1_model_comparison_ppt.png")
    img2 = encode_image("model/graph2_actual_vs_predicted_ppt.png")
    img3 = encode_image("model/graph3_feature_importance_ppt.png")
    img4 = encode_image("model/correlation_heatmap.png")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Student Performance ML Model - Technical Report</title>
<style>
  @page {{
    size: A4 portrait;
    margin: 12mm 14mm 12mm 14mm;
    @bottom-right {{
      content: counter(page);
    }}
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.42;
    font-size: 11.8px;
  }}

  .page {{
    page-break-after: always;
    break-after: page;
    height: 100%;
  }}

  .page:last-child {{
    page-break-after: avoid;
    break-after: avoid;
  }}

  .card, table, tr, .plot-box, .two-cols, .stat-grid, .formula-box {{
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  /* Header banner */
  .cover-header {{
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%);
    color: #ffffff;
    padding: 20px 22px;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  }}

  .badge {{
    display: inline-block;
    padding: 3px 9px;
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 9999px;
    margin-bottom: 6px;
  }}

  .cover-header h1 {{
    font-size: 20px;
    font-weight: 800;
    line-height: 1.25;
    margin-bottom: 4px;
  }}

  .cover-header p.subtitle {{
    font-size: 12px;
    color: #cbd5e1;
    margin-bottom: 10px;
  }}

  .meta-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 10.5px;
  }}

  .meta-item strong {{
    display: block;
    color: #93c5fd;
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.05em;
    margin-bottom: 1px;
  }}

  h2 {{
    font-size: 14.5px;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 3px;
    margin-top: 10px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }}

  h2 .num {{
    background: #2563eb;
    color: #ffffff;
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 800;
    margin-right: 6px;
  }}

  h3 {{
    font-size: 12px;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 4px;
    margin-bottom: 3px;
  }}

  p {{
    margin-bottom: 6px;
    text-align: justify;
  }}

  ul, ol {{
    margin-left: 16px;
    margin-bottom: 6px;
  }}

  li {{
    margin-bottom: 2px;
  }}

  .card {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 8px;
  }}

  .card-highlight {{
    background: #eff6ff;
    border-left: 3.5px solid #2563eb;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 8px 0;
    font-size: 10.8px;
  }}

  th, td {{
    padding: 4.5px 7px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }}

  th {{
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
  }}

  tr:nth-child(even) {{
    background: #f8fafc;
  }}

  .best-row {{
    background: #e0f2fe !important;
    font-weight: 600;
  }}

  /* Image containers */
  .plot-box {{
    text-align: center;
    margin: 6px 0;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px;
  }}

  .plot-box img {{
    max-width: 98%;
    max-height: 220px;
    object-fit: contain;
    border-radius: 4px;
  }}

  .plot-caption {{
    font-size: 10px;
    color: #64748b;
    font-style: italic;
    margin-top: 3px;
  }}

  .two-cols {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 6px;
  }}

  code {{
    font-family: Consolas, Monaco, "Courier New", monospace;
    background: #f1f5f9;
    padding: 1px 3px;
    border-radius: 3px;
    font-size: 10.5px;
    color: #be123c;
  }}

  .formula-box {{
    background: #f8fafc;
    border: 1px dashed #94a3b8;
    border-radius: 4px;
    padding: 6px 10px;
    font-family: Consolas, monospace;
    font-size: 10.5px;
    color: #0f172a;
    margin: 4px 0;
  }}

  .stat-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 8px 0;
  }}

  .stat-card {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px;
    text-align: center;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }}

  .stat-card .val {{
    font-size: 16px;
    font-weight: 800;
    color: #2563eb;
  }}

  .stat-card .lbl {{
    font-size: 9px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
  }}
</style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="page">
    <div class="cover-header">
      <div class="badge">Technical Specification & Academic Whitepaper</div>
      <h1>Student Performance & CGPA Prediction System</h1>
      <p class="subtitle">Multi-Regression Algorithm Benchmarking, Feature Engineering & Zero-Downtime Architecture</p>
      
      <div class="meta-grid">
        <div class="meta-item">
          <strong>Grading Scale</strong>
          0.0 – 10.0 CGPA
        </div>
        <div class="meta-item">
          <strong>Champion Model</strong>
          Lasso Regression (L1)
        </div>
        <div class="meta-item">
          <strong>Variance (R²)</strong>
          0.7359 (73.6% Explained)
        </div>
        <div class="meta-item">
          <strong>Stack</strong>
          Scikit-Learn + Node MERN
        </div>
      </div>
    </div>

    <h2><span class="num">1</span> Executive Summary & Objectives</h2>
    <p>
      The <strong>Student Performance & CGPA Prediction System</strong> is an end-to-end predictive machine learning framework designed to forecast undergraduate students' Cumulative Grade Point Average (CGPA on a standard <strong>0.0 – 10.0 scale</strong>). By combining historical scholastic aptitude, continuous engagement indicators, and lifestyle factors, the model pinpoints academic vulnerabilities early in the semester, enabling timely interventions.
    </p>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="val">0.7359</div>
        <div class="lbl">Test R² Score</div>
      </div>
      <div class="stat-card">
        <div class="val">0.2872</div>
        <div class="lbl">Mean Absolute Error</div>
      </div>
      <div class="stat-card">
        <div class="val">0.3581</div>
        <div class="lbl">RMSE (Grade Points)</div>
      </div>
      <div class="stat-card">
        <div class="val">18</div>
        <div class="lbl">Modeled Features</div>
      </div>
    </div>

    <h2><span class="num">2</span> Dataset Architecture & Feature Specification</h2>
    <p>
      The predictive pipeline operates on 14 fundamental input dimensions expanding into 18 modeled features across academic, behavioral, and demographic spheres:
    </p>

    <table>
      <thead>
        <tr>
          <th>Input Dimension</th>
          <th>Data Type</th>
          <th>Domain / Range</th>
          <th>Educational & Behavioral Rationale</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><code>high_school_gpa</code></td><td>Float</td><td>0.0 – 10.0</td><td>Foundational cognitive aptitude and pre-university work ethic.</td></tr>
        <tr><td><code>entrance_exam_score</code></td><td>Float</td><td>40 – 100</td><td>Standardized competitive testing and problem-solving readiness.</td></tr>
        <tr><td><code>course_load</code></td><td>Integer</td><td>12 – 21 credits</td><td>Academic pressure and semester credit weight.</td></tr>
        <tr><td><code>attendance_rate</code></td><td>Float</td><td>40 – 100%</td><td>Direct instructional contact and classroom engagement.</td></tr>
        <tr><td><code>weekly_study_hours</code></td><td>Float</td><td>0 – 45 hrs</td><td>Self-directed independent revision and assignment mastery.</td></tr>
        <tr><td><code>class_participation</code></td><td>Integer</td><td>1 – 10 rating</td><td>In-class interactive questioning and active learning.</td></tr>
        <tr><td><code>assignment_submission_rate</code></td><td>Float</td><td>30 – 100%</td><td>Continuous assessment compliance and homework diligence.</td></tr>
        <tr><td><code>extracurricular_hours</code></td><td>Float</td><td>0 – 20 hrs</td><td>Co-curricular balance (clubs, athletic engagement, volunteering).</td></tr>
        <tr><td><code>daily_sleep_hours</code></td><td>Float</td><td>3 – 10 hrs</td><td>Restorative rest facilitating cognitive retention and mental wellness.</td></tr>
        <tr><td><code>part_time_work_hours</code></td><td>Float</td><td>0 – 35 hrs</td><td>Employment time-commitment competing with study schedules.</td></tr>
        <tr><td><code>commute_time_minutes</code></td><td>Float</td><td>0 – 100 mins</td><td>Daily transit fatigue factor impacting energy levels.</td></tr>
        <tr><td><code>screen_time_hours</code></td><td>Float</td><td>0 – 14 hrs</td><td>Non-academic digital leisure screen time.</td></tr>
        <tr><td><code>major</code></td><td>Categorical</td><td>5 Categories</td><td>Engineering, Business, Arts, Science, Social Science (one-hot encoded).</td></tr>
        <tr><td><code>family_income_level</code></td><td>Categorical</td><td>Low, Middle, High</td><td>Socioeconomic tier influencing access to supplementary resources.</td></tr>
      </tbody>
    </table>

    <div class="card card-highlight">
      <strong>Data Cleaning & Transformation Protocol (<code>preprocessing_module.py</code>):</strong>
      <ul style="margin-top: 4px; margin-bottom: 0;">
        <li><strong>Imputation:</strong> Numerical features missing values replaced via median; categoricals via mode.</li>
        <li><strong>Dummy Encoding:</strong> <code>pd.get_dummies(..., drop_first=True)</code> eliminates collinearity.</li>
        <li><strong>Z-Score Standardization:</strong> <code>StandardScaler</code> centers all predictors to &mu; = 0, &sigma; = 1.</li>
        <li><strong>Domain Bounding:</strong> Output strictly constrained to valid academic range: y &isin; [0.0, 10.0].</li>
      </ul>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page">
    <h2><span class="num">3</span> Machine Learning Models Evaluated</h2>
    <p>
      Four candidate regression architectures were comprehensively benchmarked with 80% training data, 20% holdout testing data, and 5-fold cross-validation:
    </p>

    <div class="two-cols">
      <div class="card">
        <h3>1. Lasso Regression (L1 Regularization) - Selected</h3>
        <p style="font-size: 11px;">
          Minimizes MSE plus absolute sum of coefficient weights:
        </p>
        <div class="formula-box">Loss = (1/2n) ||Xw - y||² + &alpha; ||w||₁</div>
        <p style="font-size: 10.5px; color: #475569;">
          <strong>Strength:</strong> Performs automatic feature selection by zeroing out non-informative coefficients, eliminating noise and multicollinearity.
        </p>
      </div>

      <div class="card">
        <h3>2. Ridge Regression (L2 Regularization)</h3>
        <p style="font-size: 11px;">
          Minimizes MSE plus squared Euclidean norm:
        </p>
        <div class="formula-box">Loss = ||Xw - y||² + &alpha; ||w||₂²</div>
        <p style="font-size: 10.5px; color: #475569;">
          <strong>Strength:</strong> Proportionally shrinks weights across correlated features (e.g. study hours & attendance) without dropping them entirely.
        </p>
      </div>
    </div>

    <div class="two-cols">
      <div class="card">
        <h3>3. Linear Regression (OLS)</h3>
        <p style="font-size: 11px;">
          Unregularized Ordinary Least Squares closed-form baseline:
        </p>
        <div class="formula-box">w* = (XᵀX)⁻¹ Xᵀy</div>
        <p style="font-size: 10.5px; color: #475569;">
          <strong>Strength:</strong> Unbiased reference baseline indicating empirical upper bounds of pure linear combinations.
        </p>
      </div>

      <div class="card">
        <h3>4. Random Forest Regressor</h3>
        <p style="font-size: 11px;">
          Non-linear ensemble of 200 bootstrapped decision trees:
        </p>
        <div class="formula-box">ŷ = (1/B) &Sigma; f_b(x),  B = 200 trees</div>
        <p style="font-size: 10.5px; color: #475569;">
          <strong>Strength:</strong> Detects non-linear thresholds, but suffers slight boundary compression on continuous grade distributions.
        </p>
      </div>
    </div>

    <h2><span class="num">4</span> Empirical Benchmark & Comparative Results</h2>
    <p>
      Quantitative performance comparison on identical unseen test holdout partitions:
    </p>

    <table>
      <thead>
        <tr>
          <th>Model Architecture</th>
          <th>Test R² Score</th>
          <th>MAE (Points)</th>
          <th>RMSE (Points)</th>
          <th>5-Fold CV Mean R²</th>
          <th>5-Fold CV Std</th>
          <th>Deployment Status</th>
        </tr>
      </thead>
      <tbody>
        <tr class="best-row">
          <td><strong>Lasso Regression (&alpha; = 0.05)</strong></td>
          <td><strong>0.7359</strong></td>
          <td><strong>0.2872</strong></td>
          <td><strong>0.3581</strong></td>
          <td><strong>0.7412</strong></td>
          <td>&plusmn; 0.0327</td>
          <td><strong>Champion (Exported to model.pkl)</strong></td>
        </tr>
        <tr>
          <td>Linear Regression (OLS)</td>
          <td>0.7350</td>
          <td>0.2839</td>
          <td>0.3588</td>
          <td>0.7428</td>
          <td>&plusmn; 0.0310</td>
          <td>Baseline Reference</td>
        </tr>
        <tr>
          <td>Ridge Regression (&alpha; = 2.0)</td>
          <td>0.7350</td>
          <td>0.2839</td>
          <td>0.3587</td>
          <td>0.7428</td>
          <td>&plusmn; 0.0311</td>
          <td>Regularized Runner-up</td>
        </tr>
        <tr>
          <td>Random Forest (200 Trees)</td>
          <td>0.6580</td>
          <td>0.3280</td>
          <td>0.4075</td>
          <td>0.6401</td>
          <td>&plusmn; 0.0397</td>
          <td>Over-parameterized for linear grade scale</td>
        </tr>
      </tbody>
    </table>

    <div class="plot-box">
      <img src="{img1}" alt="Model Comparison Plot">
      <div class="plot-caption">Figure 1: Benchmark Comparison of R² Score, MAE, and RMSE across evaluated regression algorithms.</div>
    </div>
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page">
    <h2><span class="num">5</span> Model Performance & Interpretability Diagnostics</h2>
    <p>
      Validation metrics establish that the trained Lasso estimator achieves high predictive fidelity with an average deviation (MAE) of only <strong>0.2872 grade points</strong> on a 10.0 scale.
    </p>

    <div class="two-cols">
      <div class="plot-box">
        <img src="{img2}" alt="Actual vs Predicted CGPA">
        <div class="plot-caption">Figure 2: Actual vs. Predicted CGPA scatter plot showing tight clustering along the 45° ideal regression identity line (R² = 0.736).</div>
      </div>
      <div class="plot-box">
        <img src="{img3}" alt="Feature Importance">
        <div class="plot-caption">Figure 3: Regression coefficient weights indicating primary positive drivers (GPA, study hours) and detractor features (screen time, work hours).</div>
      </div>
    </div>

    <h3>Behavioral & Pedagogical Insights:</h3>
    <ul>
      <li><strong>Prior Academic Foundation (&beta; &asymp; +0.42):</strong> <code>high_school_gpa</code> is the single most influential predictor, confirming that cumulative discipline formed in secondary school is persistent.</li>
      <li><strong>Consistent Academic Engagement (&beta; &asymp; +0.35 cumulative):</strong> <code>weekly_study_hours</code>, <code>attendance_rate</code>, and <code>assignment_submission_rate</code> jointly drive positive academic outcomes.</li>
      <li><strong>Detractors & Risk Indicators:</strong> Increased <code>screen_time_hours</code> (-0.035) and <code>part_time_work_hours</code> (-0.025) create direct temporal friction against study time.</li>
    </ul>

    <div class="plot-box">
      <img src="{img4}" alt="Correlation Heatmap">
      <div class="plot-caption">Figure 4: Inter-Feature Correlation Heatmap demonstrating collinear relationships across academic and lifestyle variables.</div>
    </div>
  </div>

  <!-- ==================== PAGE 4 ==================== -->
  <div class="page">
    <h2><span class="num">6</span> Full-Stack Production Architecture & Zero-Downtime Fallback</h2>
    <p>
      The production system connects a React 19 + Vite frontend to an Express REST API backend with an autonomous fault-tolerant ML runtime:
    </p>

    <div class="card card-highlight">
      <strong>Zero-Downtime Resilience Protocol (<code>backend/controllers/predictionController.js</code>):</strong>
      <p style="font-size: 11px; margin-top: 4px; margin-bottom: 4px;">
        1. <strong>Primary Inference Route:</strong> Node.js spawns a Python child process running <code>predict.py</code> with serialized artifacts (<code>model.pkl</code>, <code>scaler.pkl</code>).
      </p>
      <p style="font-size: 11px; margin-bottom: 4px;">
        2. <strong>Autonomous Fallback Engine:</strong> If the Python interpreter or OS dependencies are unreachable, the controller instantly engages an exact mathematical regression formula:
      </p>
      <div class="formula-box">
        CGPA_est = 0.80 + 0.42·GPA + 0.012·Exam + 0.035·StudyHrs + 0.009·Attendance + 0.009·Submissions
                   - 0.025·WorkHrs - 0.035·ScreenTime - 0.005·Commute + IncomeFactor
      </div>
      <p style="font-size: 10.5px; color: #475569; margin-bottom: 0;">
        3. <strong>Database Resiliency:</strong> If MongoDB is temporarily offline, predictions seamlessly cache into an in-memory queue, preventing UI interruption.
      </p>
    </div>

    <h2><span class="num">7</span> Academic Categorization & Automated Remark Engine</h2>
    <p>
      Continuous predicted CGPA scores are mapped into formal university grade bands and actionable advisories:
    </p>

    <table>
      <thead>
        <tr>
          <th>CGPA Band</th>
          <th>Letter</th>
          <th>Performance Status</th>
          <th>Automated Academic Remark & Recommendation</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>9.0 – 10.0</strong></td><td><code>A+</code></td><td>Outstanding</td><td>Dean's List / Academic Distinction; recommended for research assistantships.</td></tr>
        <tr><td><strong>8.0 – 8.9</strong></td><td><code>A</code></td><td>Strong</td><td>First Class with Distinction; eligible for honor societies and departmental awards.</td></tr>
        <tr><td><strong>7.0 – 7.9</strong></td><td><code>B+</code></td><td>Strong</td><td>First Class; solid conceptual mastery across core degree requirements.</td></tr>
        <tr><td><strong>6.0 – 6.9</strong></td><td><code>B</code></td><td>Satisfactory</td><td>Satisfactory; recommended targeted peer tutoring in challenging modules.</td></tr>
        <tr><td><strong>5.0 – 5.9</strong></td><td><code>C</code></td><td>Needs Attention</td><td>Second Class; structured study timetables & attendance monitoring advised.</td></tr>
        <tr><td><strong>4.0 – 4.9</strong></td><td><code>P</code></td><td>Needs Attention</td><td>Pass Grade; mandatory academic counselor meetings and bi-weekly check-ins.</td></tr>
        <tr><td><strong>&lt; 4.0</strong></td><td><code>F</code></td><td>Critical</td><td>Academic Probation Alert; immediate remedial coursework plan required.</td></tr>
      </tbody>
    </table>

    <h2><span class="num">8</span> Conclusion & Artifact Deliverables</h2>
    <div class="card">
      <ul style="margin-bottom: 0;">
        <li><strong>Champion Model:</strong> Lasso Regression provides the highest test R² (0.7359), lowest RMSE (0.3581), and optimal model interpretability.</li>
        <li><strong>Serialized Deliverables:</strong> Serialized model weights (<code>model/model.pkl</code>), standard scaler (<code>model/scaler.pkl</code>), and feature schema (<code>model/feature_names.txt</code>).</li>
        <li><strong>Full-Stack Integration:</strong> Live REST endpoints at <code>/api/predictions</code> and <code>/api/predict</code> with complete React 19 UI integration.</li>
      </ul>
    </div>
  </div>

</body>
</html>
"""
    return html

def main():
    print("[1/3] Generating HTML content...")
    html_content = build_html_report()
    
    html_path = os.path.abspath("student_ml_model_report.html")
    pdf_path = os.path.abspath("Student_Performance_ML_Model_Report.pdf")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"HTML report saved to {html_path}")

    print("[2/3] Rendering PDF with Edge headless...")
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    ]
    
    browser_exe = None
    for p in edge_paths:
        if os.path.exists(p):
            browser_exe = p
            break
            
    if not browser_exe:
        raise FileNotFoundError("Could not find Edge or Chrome executable.")

    file_url = "file:///" + html_path.replace("\\", "/")
    cmd = [
        browser_exe,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        file_url
    ]

    subprocess.run(cmd, check=True)
    time.sleep(2)

    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000:
        print(f"[3/3] SUCCESS! PDF created: {pdf_path}")
        print(f"File Size: {os.path.getsize(pdf_path):,} bytes")
    else:
        raise RuntimeError("PDF generation failed.")

if __name__ == "__main__":
    main()
