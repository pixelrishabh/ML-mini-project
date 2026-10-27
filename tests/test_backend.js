/**
 * test_backend.js
 * Integration test for the running Express prediction API and Python ML runtime bridge.
 */

const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================================");
  console.log(" BACKEND INTEGRATION & API TEST SUITE (PORT 5000)                 ");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Health check
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.status === 'ok', "GET /health returns 200 OK");

    // Test 2: Model Metadata
    const meta = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/model/metadata',
      method: 'GET'
    });
    assert(meta.status === 200 && meta.data.success === true, "GET /api/model/metadata returns 200 with model benchmarks");
    assert(meta.data.data.primary_experiment.best_model === "Random Forest Regressor", "Best model is Random Forest Regressor");
    assert(typeof meta.data.data.primary_experiment.test_metrics.mae === 'number', "Test MAE metric is a valid number");

    // Test 3: Input Validation (Bad studytime)
    const badInput = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/predictions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      studytime: 99,
      failures: 0,
      absences: 2
    });
    assert(badInput.status === 400 && badInput.data.success === false, "POST /api/predictions with invalid studytime returns 400 Bad Request");
    assert(Array.isArray(badInput.data.details), "Validation errors details array provided");

    // Test 4: Successful Prediction (Early Model)
    const goodInput = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/predictions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      student_name: "Test Student Alpha",
      studytime: 3,
      failures: 0,
      absences: 2,
      higher: "yes",
      Medu: 4,
      Fedu: 4,
      health: 4
    });
    assert(goodInput.status === 201 && goodInput.data.success === true, "POST /api/predictions generates prediction on 0-20 scale");
    const pred = goodInput.data.data;
    assert(pred.predicted_grade >= 0 && pred.predicted_grade <= 20, `Predicted grade (${pred.predicted_grade}) is bounded in [0.0, 20.0]`);
    assert(['A', 'B', 'C', 'D', 'F'].includes(pred.grade_letter), `Valid Portuguese grade tier letter returned (${pred.grade_letter})`);
    assert(pred.shap_explanation && pred.shap_explanation.positive_factors, "Local SHAP explanation returned in prediction response");
    assert(typeof goodInput.data.storage === 'object', "Storage connection metadata reported in response");

    const recordId = pred._id;

    // Test 5: Successful Prediction (Later Model with G1/G2)
    const laterInput = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/predictions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      student_name: "Test Student Later",
      use_period_grades: true,
      G1: 15,
      G2: 16,
      studytime: 3,
      failures: 0,
      absences: 1
    });
    assert(laterInput.status === 201 && laterInput.data.success === true, "POST /api/predictions later prediction with G1/G2 succeeds");
    assert(laterInput.data.data.experiment === "later_prediction", "Experiment marked as later_prediction");
    assert(laterInput.data.data.predicted_grade >= 14, "Later prediction with high G1/G2 predicts grade >= 14");

    // Test 6: Fetch Prediction History
    const history = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/predictions',
      method: 'GET'
    });
    assert(history.status === 200 && Array.isArray(history.data.data), "GET /api/predictions returns array of records");
    assert(history.data.count >= 1, "At least 1 prediction record in history");

    // Test 7: Delete Prediction Record
    if (recordId) {
      const del = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/predictions/${recordId}`,
        method: 'DELETE'
      });
      assert(del.status === 200 && del.data.success === true, `DELETE /api/predictions/${recordId} removes record`);
    }

    console.log("------------------------------------------------------------------");
    console.log(`Backend Tests Summary: ${passed} Passed, ${failed} Failed.`);
    console.log("==================================================================");

  } catch (err) {
    console.error("Test execution failed:", err);
    failed++;
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
