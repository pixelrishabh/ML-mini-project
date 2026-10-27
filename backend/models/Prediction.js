const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  student_name: {
    type: String,
    default: 'Student'
  },
  // Key Academic Indicators
  studytime: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  failures: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  absences: {
    type: Number,
    required: true,
    min: 0,
    max: 93
  },
  age: {
    type: Number,
    default: 16,
    min: 15,
    max: 25
  },
  higher: {
    type: String,
    enum: ['yes', 'no'],
    default: 'yes'
  },
  Medu: {
    type: Number,
    min: 0,
    max: 4,
    default: 2
  },
  Fedu: {
    type: Number,
    min: 0,
    max: 4,
    default: 2
  },
  traveltime: {
    type: Number,
    min: 1,
    max: 4,
    default: 1
  },
  schoolsup: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  famsup: {
    type: String,
    enum: ['yes', 'no'],
    default: 'yes'
  },
  paid: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  activities: {
    type: String,
    enum: ['yes', 'no'],
    default: 'yes'
  },
  internet: {
    type: String,
    enum: ['yes', 'no'],
    default: 'yes'
  },
  romantic: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  famrel: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  freetime: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  goout: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  Dalc: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  Walc: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  health: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  famsize: {
    type: String,
    enum: ['LE3', 'GT3'],
    default: 'GT3'
  },
  Pstatus: {
    type: String,
    enum: ['T', 'A'],
    default: 'T'
  },
  Mjob: {
    type: String,
    default: 'other'
  },
  Fjob: {
    type: String,
    default: 'other'
  },
  reason: {
    type: String,
    default: 'course'
  },
  guardian: {
    type: String,
    default: 'mother'
  },

  // Audit / Demographic context (kept separate from ML feature calculations)
  sex: {
    type: String,
    enum: ['F', 'M'],
    default: 'F'
  },
  address: {
    type: String,
    enum: ['U', 'R'],
    default: 'U'
  },
  school: {
    type: String,
    enum: ['GP', 'MS'],
    default: 'GP'
  },

  // Optional Midterm Period Grades for later prediction experiment
  G1: {
    type: Number,
    min: 0,
    max: 20,
    default: null
  },
  G2: {
    type: Number,
    min: 0,
    max: 20,
    default: null
  },
  use_period_grades: {
    type: Boolean,
    default: false
  },

  // Prediction Output (Authentic 0 - 20 Portuguese grading scale)
  predicted_grade: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  predicted_score: {
    type: Number,
    min: 0,
    max: 20
  },
  grade_letter: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    default: 'C'
  },
  performance_status: {
    type: String,
    enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Support', 'At Risk'],
    default: 'Satisfactory'
  },
  experiment: {
    type: String,
    enum: ['early_prediction', 'later_prediction'],
    default: 'early_prediction'
  },
  shap_explanation: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
