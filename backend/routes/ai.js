const express = require('express');
const multer = require('multer');
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX, TXT files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// AI Health Check (public)
router.get('/health', aiController.healthCheck);

// Protected routes (require authentication)
router.use(authenticateToken);

// Tender Analysis
router.get('/analyze/:id', aiController.analyzeTender);
router.post('/analyze/batch', aiController.batchAnalyze);

// Tender Matching
router.get('/match/:id', aiController.matchTender);

// Document Analysis
router.post('/analyze-document', upload.single('document'), aiController.analyzeDocument);

// Bid Assistance
router.get('/bid-assistance/:id', aiController.generateBidAssistance);

// Smart Search
router.post('/smart-search', aiController.smartSearch);

// Dashboard Insights
router.get('/insights', aiController.getDashboardInsights);

// Usage Statistics
router.get('/usage', aiController.getUsageStats);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;