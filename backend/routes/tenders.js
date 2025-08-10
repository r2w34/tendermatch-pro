const express = require('express');
const router = express.Router();

// Import controllers
const {
  getTenders,
  getTenderById,
  createTender,
  updateTender,
  deleteTender,
  getTenderStats,
  searchTenders,
  getTrendingTenders,
  getClosingSoonTenders,
  getTendersByCategory,
  getTendersByState,
  addToFavorites,
  removeFromFavorites,
  getFavorites
} = require('../controllers/tenderController');

// Import middleware
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validate, validateQuery } = require('../utils/validators');
const {
  validateTenderCreation,
  validateTenderUpdate,
  validateTenderQuery,
  validatePagination
} = require('../utils/validators');

// Public routes (no authentication required)
router.get('/', optionalAuth, validateQuery(validateTenderQuery), getTenders);
router.get('/search', optionalAuth, searchTenders);
router.get('/trending', getTrendingTenders);
router.get('/closing-soon', getClosingSoonTenders);
router.get('/stats', getTenderStats);
router.get('/category/:category', validateQuery(validatePagination), getTendersByCategory);
router.get('/state/:state', validateQuery(validatePagination), getTendersByState);
router.get('/:id', optionalAuth, getTenderById);

// Protected routes (authentication required)
router.use(authenticateToken); // All routes below require authentication

// Favorites routes
router.get('/user/favorites', validateQuery(validatePagination), getFavorites);
router.post('/:id/favorite', addToFavorites);
router.delete('/:id/favorite', removeFromFavorites);

// Admin only routes
router.post('/', requireAdmin, validate(validateTenderCreation), createTender);
router.put('/:id', requireAdmin, validate(validateTenderUpdate), updateTender);
router.delete('/:id', requireAdmin, deleteTender);

module.exports = router;