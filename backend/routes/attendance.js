const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getCalendarData,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/calendar', getCalendarData);
router.route('/').get(getAttendance).post(markAttendance);
router.route('/:id').put(updateAttendance).delete(deleteAttendance);

module.exports = router;
