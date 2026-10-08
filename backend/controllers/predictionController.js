const path = require('path');
const { spawn } = require('child_process');
const Prediction = require('../models/Prediction');
const { getIsConnected, inMemoryPredictions } = require('../config/db');

// Helper to determine Grade Letter and Performance Category for CGPA (0.0 - 10.0 scale)
const getGradeCategory = (cgpa) => {
  if (cgpa >= 9.0) return { letter: 'A+', status: 'Outstanding' };
  if (cgpa >= 8.0) return { letter: 'A', status: 'Strong' };
  if (cgpa >= 7.0) return { letter: 'B+', status: 'Strong' };
  if (cgpa >= 6.0) return { letter: 'B', status: 'Satisfactory' };
  if (cgpa >= 5.0) return { letter: 'C', status: 'Needs Attention' };
  if (cgpa >= 4.0) return { letter: 'P', status: 'Needs Attention' };
  return { letter: 'F', status: 'Critical' };
};

// Helper function to run Python ML model via spawn child process
const runPythonML = (inputData) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', '..', 'model', 'predict.py');
    const process = spawn('python', [pythonScript, JSON.stringify(inputData)]);

    let stdoutData = '';
    let stderrData = '';

    process.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0 && !stdoutData) {
        return reject(new Error(`Python process exited with code ${code}: ${stderrData}`));
      }
      try {
        const parsed = JSON.parse(stdoutData.trim());
        if (parsed.error) {
          return reject(new Error(parsed.error));
        }
        resolve(parsed.predicted_cgpa ?? parsed.predicted_score);
      } catch (err) {
        reject(new Error(`Failed to parse Python script output: ${stdoutData}`));
      }
    });
  });
};

// 1. Create Prediction (POST /api/predictions or POST /api/predict)
exports.createPrediction = async (req, res) => {
  try {
    const data = req.body;
    const requiredFields = [
      'high_school_gpa',
      'entrance_exam_score',
      'course_load',
      'attendance_rate',
      'weekly_study_hours',
      'class_participation',
      'assignment_submission_rate'
    ];

    // Validate essential required inputs
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return res.status(400).json({ error: `Missing required field: '${field}'` });
      }
    }

    const payload = {
      student_name: data.student_name || 'Student',
      high_school_gpa: parseFloat(data.high_school_gpa),
      entrance_exam_score: parseFloat(data.entrance_exam_score),
      course_load: parseInt(data.course_load, 10),
      attendance_rate: parseFloat(data.attendance_rate),
      major: data.major || 'Engineering',
      weekly_study_hours: parseFloat(data.weekly_study_hours),
      class_participation: parseInt(data.class_participation, 10),
      assignment_submission_rate: parseFloat(data.assignment_submission_rate),
      extracurricular_hours: parseFloat(data.extracurricular_hours || 5),
      daily_sleep_hours: parseFloat(data.daily_sleep_hours || 6.5),
      part_time_work_hours: parseFloat(data.part_time_work_hours || 8),
      commute_time_minutes: parseFloat(data.commute_time_minutes || 30),
      screen_time_hours: parseFloat(data.screen_time_hours || 4),
      family_income_level: data.family_income_level || 'Middle'
    };

    // Run ML Model
    let predictedCGPA;
    try {
      predictedCGPA = await runPythonML(payload);
    } catch (pyErr) {
      console.warn(`[ML Fallback] Python execution notice (${pyErr.message}). Using mathematical CGPA estimator formula.`);
      // Synthetic CGPA weighting formula aligned with 10.0 scale preprocessing_module.py
      const incomeEffect = payload.family_income_level === 'High' ? 0.14 : payload.family_income_level === 'Middle' ? 0.07 : 0.0;
      const rawScore = 
        0.8 +
        0.42 * payload.high_school_gpa +
        0.012 * payload.entrance_exam_score +
        0.035 * payload.weekly_study_hours +
        0.009 * payload.attendance_rate +
        0.009 * payload.assignment_submission_rate +
        0.035 * payload.class_participation +
        0.02 * payload.daily_sleep_hours +
        0.015 * payload.extracurricular_hours -
        0.025 * payload.part_time_work_hours -
        0.005 * payload.commute_time_minutes -
        0.035 * payload.screen_time_hours +
        incomeEffect;

      predictedCGPA = Math.round(Math.min(Math.max(rawScore, 0.0), 10.0) * 100) / 100;
    }

    const { letter, status } = getGradeCategory(predictedCGPA);

    const recordData = {
      ...payload,
      predicted_cgpa: predictedCGPA,
      predicted_score: predictedCGPA,
      grade_letter: letter,
      performance_status: status,
      createdAt: new Date()
    };

    let resultRecord;
    if (getIsConnected()) {
      const newPrediction = new Prediction(recordData);
      resultRecord = await newPrediction.save();
    } else {
      recordData._id = `pred_${Date.now()}`;
      inMemoryPredictions.unshift(recordData);
      if (inMemoryPredictions.length > 50) inMemoryPredictions.pop();
      resultRecord = recordData;
    }

    return res.status(201).json({
      success: true,
      message: 'Prediction generated and saved successfully.',
      data: resultRecord
    });
  } catch (error) {
    console.error('Error creating prediction:', error);
    return res.status(500).json({ error: error.message || 'Server error occurred during prediction.' });
  }
};

// 2. Get All Predictions (GET /api/predictions)
exports.getPredictions = async (req, res) => {
  try {
    if (getIsConnected()) {
      const records = await Prediction.find().sort({ createdAt: -1 }).limit(50);
      return res.status(200).json({ success: true, count: records.length, data: records });
    } else {
      return res.status(200).json({ success: true, count: inMemoryPredictions.length, data: inMemoryPredictions });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch predictions history.' });
  }
};

// 3. Delete Prediction (DELETE /api/predictions/:id)
exports.deletePrediction = async (req, res) => {
  try {
    const { id } = req.params;
    if (getIsConnected()) {
      await Prediction.findByIdAndDelete(id);
    } else {
      const index = inMemoryPredictions.findIndex((item) => String(item._id) === String(id));
      if (index !== -1) inMemoryPredictions.splice(index, 1);
    }
    return res.status(200).json({ success: true, message: 'Prediction record deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete prediction record.' });
  }
};
