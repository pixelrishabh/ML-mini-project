const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  student_name: {
    type: String,
    default: 'Student'
  },
  high_school_gpa: {
    type: Number,
    required: true
  },
  entrance_exam_score: {
    type: Number,
    required: true
  },
  course_load: {
    type: Number,
    required: true
  },
  attendance_rate: {
    type: Number,
    required: true
  },
  major: {
    type: String,
    default: 'Engineering'
  },
  weekly_study_hours: {
    type: Number,
    required: true
  },
  class_participation: {
    type: Number,
    required: true
  },
  assignment_submission_rate: {
    type: Number,
    required: true
  },
  extracurricular_hours: {
    type: Number,
    default: 5
  },
  daily_sleep_hours: {
    type: Number,
    default: 6.5
  },
  part_time_work_hours: {
    type: Number,
    default: 8
  },
  commute_time_minutes: {
    type: Number,
    default: 30
  },
  screen_time_hours: {
    type: Number,
    default: 4
  },
  family_income_level: {
    type: String,
    default: 'Middle'
  },
  predicted_cgpa: {
    type: Number,
    required: true
  },
  grade_letter: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'P', 'D', 'F'],
    default: 'B'
  },
  performance_status: {
    type: String,
    enum: ['Outstanding', 'Strong', 'Satisfactory', 'Needs Attention', 'Critical'],
    default: 'Satisfactory'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
