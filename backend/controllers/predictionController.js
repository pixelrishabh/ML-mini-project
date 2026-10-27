const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Prediction = require('../models/Prediction');
const { getIsConnected, getStorageStatus, inMemoryPredictions } = require('../config/db');

// Path to Python inference script and model metadata
const PYTHON_SCRIPT_PATH = path.join(__dirname, '..', '..', 'model', 'predict.py');
const METADATA_PATH = path.join(__dirname, '..', '..', 'model', 'model_metadata.json');

/**
 * Spawns the Python ML process for inference.
 * Rejects if the Python process fails or returns an error.
 * NEVER falls back to an ad-hoc handcrafted mathematical formula.
 */
const runPythonML = (inputData) => {
  return new Promise((resolve, reject) => {
    // Sanitize input payload passed to Python
    const processArgs = [PYTHON_SCRIPT_PATH, JSON.stringify(inputData)];
    const pyProcess = spawn('python', processArgs);

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0 && !stdoutData.trim()) {
        console.error(`[Python ML Error] Process exited with code ${code}. Stderr: ${stderrData}`);
        return reject(new Error(`Python process exited with code ${code}: ${stderrData || 'Unknown error'}`));
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        if (parsed.error) {
          return reject(new Error(parsed.error));
        }
        resolve(parsed);
      } catch (err) {
        console.error(`[Python ML Error] Failed to parse output: ${stdoutData}`);
        return reject(new Error(`Failed to parse ML model JSON output: ${stdoutData}`));
      }
    });

    pyProcess.on('error', (err) => {
      console.error(`[Python ML Error] Process spawn failed: ${err.message}`);
      reject(new Error(`Failed to invoke Python runtime: ${err.message}`));
    });
  });
};

/**
 * POST /api/predictions or POST /api/predict
 * Executes machine learning inference on student attributes and stores record.
 */
exports.createPrediction = async (req, res) => {
  try {
    const data = req.body || {};

    // 1. Validate required primary academic inputs
    const errors = [];
    if (data.studytime === undefined || data.studytime === null || data.studytime === '') {
      errors.push("Missing required field 'studytime' (weekly study time scale 1-4).");
    } else {
      const st = Number(data.studytime);
      if (isNaN(st) || st < 1 || st > 4) errors.push("'studytime' must be an integer between 1 and 4.");
    }

    if (data.failures === undefined || data.failures === null || data.failures === '') {
      errors.push("Missing required field 'failures' (past class failures 0-4).");
    } else {
      const fl = Number(data.failures);
      if (isNaN(fl) || fl < 0 || fl > 4) errors.push("'failures' must be an integer between 0 and 4.");
    }

    if (data.absences === undefined || data.absences === null || data.absences === '') {
      errors.push("Missing required field 'absences' (course absences 0-93).");
    } else {
      const ab = Number(data.absences);
      if (isNaN(ab) || ab < 0 || ab > 93) errors.push("'absences' must be a number between 0 and 93.");
    }

    if (data.age !== undefined && data.age !== null && data.age !== '') {
      const age = Number(data.age);
      if (isNaN(age) || age < 15 || age > 25) errors.push("'age' must be between 15 and 25.");
    }

    // If using later prediction with midterm grades
    const usePeriodGrades = Boolean(data.use_period_grades);
    if (usePeriodGrades) {
      const g1 = Number(data.G1);
      const g2 = Number(data.G2);
      if (isNaN(g1) || g1 < 0 || g1 > 20) errors.push("'G1' must be a valid grade between 0 and 20.");
      if (isNaN(g2) || g2 < 0 || g2 > 20) errors.push("'G2' must be a valid grade between 0 and 20.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation error: Input data does not meet schema requirements.",
        details: errors
      });
    }

    // 2. Prepare payload for Python model
    const payload = {
      student_name: (data.student_name && String(data.student_name).trim()) || 'Student',
      age: parseInt(data.age || 16, 10),
      studytime: parseInt(data.studytime, 10),
      failures: parseInt(data.failures, 10),
      absences: parseFloat(data.absences),
      Medu: parseInt(data.Medu ?? 2, 10),
      Fedu: parseInt(data.Fedu ?? 2, 10),
      traveltime: parseInt(data.traveltime ?? 1, 10),
      famrel: parseInt(data.famrel ?? 4, 10),
      freetime: parseInt(data.freetime ?? 3, 10),
      goout: parseInt(data.goout ?? 3, 10),
      Dalc: parseInt(data.Dalc ?? 1, 10),
      Walc: parseInt(data.Walc ?? 1, 10),
      health: parseInt(data.health ?? 4, 10),
      famsize: data.famsize || 'GT3',
      Pstatus: data.Pstatus || 'T',
      Mjob: data.Mjob || 'other',
      Fjob: data.Fjob || 'other',
      reason: data.reason || 'course',
      guardian: data.guardian || 'mother',
      schoolsup: data.schoolsup || 'no',
      famsup: data.famsup || 'yes',
      paid: data.paid || 'no',
      activities: data.activities || 'yes',
      nursery: data.nursery || 'yes',
      higher: data.higher || 'yes',
      internet: data.internet || 'yes',
      romantic: data.romantic || 'no',
      // Demographic fairness fields (recorded for transparency/auditing)
      sex: data.sex || 'F',
      address: data.address || 'U',
      school: data.school || 'GP',
      // Optional period grades
      use_period_grades: usePeriodGrades,
      G1: usePeriodGrades ? parseFloat(data.G1) : undefined,
      G2: usePeriodGrades ? parseFloat(data.G2) : undefined
    };

    // 3. Execute authentic ML prediction via Python inference script
    let mlResult;
    try {
      mlResult = await runPythonML(payload);
    } catch (pyErr) {
      console.error(`[Inference Failed] Model execution failed: ${pyErr.message}`);
      return res.status(502).json({
        success: false,
        error: `Machine Learning model inference failed: ${pyErr.message}`,
        details: "Ensure model artifacts are trained and scikit-learn/joblib are installed."
      });
    }

    const predictedGrade = mlResult.predicted_grade;
    const gradeLetter = mlResult.grade_letter || 'C';
    const performanceStatus = mlResult.performance_status || 'Satisfactory';

    // 4. Construct complete record
    const recordData = {
      ...payload,
      predicted_grade: predictedGrade,
      predicted_score: predictedGrade,
      grade_letter: gradeLetter,
      performance_status: performanceStatus,
      status_description: mlResult.status_description,
      experiment: mlResult.experiment || (usePeriodGrades ? 'later_prediction' : 'early_prediction'),
      shap_explanation: mlResult.shap_explanation || {},
      createdAt: new Date()
    };

    // 5. Persist record (MongoDB if connected, otherwise temporary in-memory session)
    let savedRecord;
    const storageStatus = getStorageStatus();

    if (getIsConnected()) {
      try {
        const newRecord = new Prediction(recordData);
        savedRecord = await newRecord.save();
      } catch (dbErr) {
        console.warn(`[DB Save Warning] Mongoose save failed (${dbErr.message}), keeping in session buffer.`);
        recordData._id = `pred_${Date.now()}`;
        inMemoryPredictions.unshift(recordData);
        savedRecord = recordData;
      }
    } else {
      recordData._id = `pred_${Date.now()}`;
      inMemoryPredictions.unshift(recordData);
      if (inMemoryPredictions.length > 50) inMemoryPredictions.pop();
      savedRecord = recordData;
    }

    return res.status(201).json({
      success: true,
      message: "Academic performance prediction generated successfully.",
      data: savedRecord,
      storage: storageStatus,
      disclaimer: "This prediction is a statistical estimate based on historical cohort data from the UCI Student Performance Dataset (0-20 scale) and is not a deterministic evaluation of individual student capability."
    });
  } catch (error) {
    console.error("Unhandled error in createPrediction:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "An unexpected server error occurred during prediction."
    });
  }
};

/**
 * GET /api/predictions
 * Returns historical predictions with storage connection diagnostic metadata.
 */
exports.getPredictions = async (req, res) => {
  try {
    const storage = getStorageStatus();
    let records = [];

    if (getIsConnected()) {
      records = await Prediction.find().sort({ createdAt: -1 }).limit(50);
    } else {
      records = inMemoryPredictions;
    }

    return res.status(200).json({
      success: true,
      count: records.length,
      storage: storage,
      data: records
    });
  } catch (error) {
    console.error("Error in getPredictions:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch prediction records." });
  }
};

/**
 * DELETE /api/predictions/:id
 * Deletes a specific prediction entry.
 */
exports.deletePrediction = async (req, res) => {
  try {
    const { id } = req.params;
    if (getIsConnected()) {
      await Prediction.findByIdAndDelete(id);
    } else {
      const idx = inMemoryPredictions.findIndex((item) => String(item._id) === String(id));
      if (idx !== -1) inMemoryPredictions.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: "Prediction record deleted successfully."
    });
  } catch (error) {
    console.error("Error in deletePrediction:", error);
    return res.status(500).json({ success: false, error: "Failed to delete prediction record." });
  }
};

/**
 * GET /api/model/metadata
 * Returns training results, candidate model comparisons, CV metrics,
 * held-out test evaluations, fairness audit, and SHAP feature importances.
 */
exports.getModelMetadata = (req, res) => {
  try {
    if (!fs.existsSync(METADATA_PATH)) {
      return res.status(404).json({
        success: false,
        error: "Model metadata not found. Run 'python model/student_model_pipeline.py' to generate artifacts."
      });
    }

    const raw = fs.readFileSync(METADATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (err) {
    console.error("Error reading model metadata:", err);
    return res.status(500).json({
      success: false,
      error: `Failed to load model metadata: ${err.message}`
    });
  }
};

/**
 * GET /api/system/status
 * Returns system storage, persistence, and model status.
 */
exports.getSystemStatus = (req, res) => {
  const storage = getStorageStatus();
  const modelExists = fs.existsSync(PYTHON_SCRIPT_PATH) && fs.existsSync(METADATA_PATH);

  return res.status(200).json({
    success: true,
    storage: storage,
    modelReady: modelExists,
    timestamp: new Date().toISOString()
  });
};
