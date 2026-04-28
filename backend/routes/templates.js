const express = require('express');
const router = express.Router();
const {
  searchTemplate,
  createTemplate,
  cloneTemplate,
  skipOnboarding,
  publishTemplate,
} = require('../controllers/templateController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/search', searchTemplate);
router.post('/', createTemplate);
router.post('/:id/clone', cloneTemplate);
router.post('/skip', skipOnboarding);
router.post('/publish', authorize('admin', 'faculty'), publishTemplate);

module.exports = router;
