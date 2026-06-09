const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  clearAllSubjects
} = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

router.use(protect); // all subject routes require auth

router.delete('/clear', clearAllSubjects);
router.route('/').get(getSubjects).post(createSubject);
router.route('/:id').put(updateSubject).delete(deleteSubject);

module.exports = router;
