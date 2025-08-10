const express = require('express');
const router = express.Router();

// Import controllers
const {
  createSavedSearch,
  getSavedSearches,
  getSavedSearchById,
  updateSavedSearch,
  deleteSavedSearch,
  executeSavedSearch,
  toggleAlert,
  getNewMatches,
  getSavedSearchesWithAlerts,
  duplicateSavedSearch,
  getSavedSearchStats
} = require('../controllers/savedSearchController');

// Import middleware
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, validateQuery } = require('../utils/validators');
const { validateSavedSearch, validatePagination } = require('../utils/validators');

// All routes require authentication
router.use(authenticateToken);

// Saved search routes
router.get('/', validateQuery(validatePagination), getSavedSearches);
router.post('/', validate(validateSavedSearch), createSavedSearch);
router.get('/stats', getSavedSearchStats);
router.get('/:id', getSavedSearchById);
router.put('/:id', validate(validateSavedSearch), updateSavedSearch);
router.delete('/:id', deleteSavedSearch);

// Execute saved search
router.get('/:id/execute', validateQuery(validatePagination), executeSavedSearch);

// Alert management
router.post('/:id/toggle-alert', toggleAlert);
router.get('/:id/new-matches', getNewMatches);

// Duplicate saved search
router.post('/:id/duplicate', duplicateSavedSearch);

// Admin only routes
router.get('/admin/alerts', requireAdmin, getSavedSearchesWithAlerts);

module.exports = router;