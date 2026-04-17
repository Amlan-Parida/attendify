const express = require('express');
const router = express.Router();
const {
  searchTemplate,
  createTemplate,
  cloneTemplate,
  skipOnboarding,
  publishTemplate,
} = require('../controllers/templateController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/search', searchTemplate);
router.post('/', createTemplate);
router.post('/:id/clone', cloneTemplate);
router.post('/skip', skipOnboarding);
router.post('/publish', publishTemplate);

module.exports = router;
