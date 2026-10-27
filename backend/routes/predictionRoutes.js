const express = require('express');
const router = express.Router();
const {
  createPrediction,
  getPredictions,
  deletePrediction,
  getModelMetadata,
  getSystemStatus
} = require('../controllers/predictionController');

// Prediction Routes
router.route('/predictions')
  .get(getPredictions)
  .post(createPrediction);

router.route('/predict')
  .post(createPrediction);

router.route('/predictions/:id')
  .delete(deletePrediction);

// Model Metadata, Metrics, & Fairness Audit Routes
router.route('/model/metadata')
  .get(getModelMetadata);

router.route('/model/metrics')
  .get(getModelMetadata);

// System Persistence Status Route
router.route('/system/status')
  .get(getSystemStatus);

module.exports = router;
