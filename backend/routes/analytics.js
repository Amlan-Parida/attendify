const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getSubjectAnalytics,
  predictAttendance,
  getPulse,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/pulse', getPulse);
router.get('/subject/:subjectId', getSubjectAnalytics);
router.post('/predict', predictAttendance);

module.exports = router;
