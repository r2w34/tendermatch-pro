const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  refreshAccessToken,
  getProfile,
  updateProfile,
  changePassword,
  verifyEmail,
  logout,
  getUserStats,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/authController');

// Import middleware
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../utils/validators');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange
} = require('../utils/validators');

// Public routes
router.post('/register', validate(validateUserRegistration), register);
router.post('/login', validate(validateUserLogin), login);
router.post('/refresh', refreshAccessToken);

// Protected routes (authentication required)
router.use(authenticateToken);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validate(validateUserUpdate), updateProfile);
router.post('/change-password', validate(validatePasswordChange), changePassword);
router.get('/stats', getUserStats);
router.post('/logout', logout);
router.delete('/account', deleteAccount);

// Email verification (placeholder route)
router.post('/verify-email/:token', verifyEmail);

// Admin only routes
router.use(requireAdmin);

// User management routes (admin only)
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', validate(validateUserUpdate), updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;