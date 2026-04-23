const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scanImage, summarizeText } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Configure multer for memory storage (we just need the buffer to pass to Gemini)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload an image, PDF, or Word document.'), false);
    }
  }
});

router.use(protect);

router.post('/scan', upload.single('image'), scanImage);
router.post('/summarize', summarizeText);

module.exports = router;
