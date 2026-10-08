const express = require('express');
const router = express.Router();
const {
  createPrediction,
  getPredictions,
  deletePrediction
} = require('../controllers/predictionController');

router.route('/predictions')
  .get(getPredictions)
  .post(createPrediction);

router.route('/predict')
  .post(createPrediction);

router.route('/predictions/:id')
  .delete(deletePrediction);

module.exports = router;
