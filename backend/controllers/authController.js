const User = require('../models/User');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../config/constants');
const { formatUserResponse } = require('../utils/formatters');
const { asyncHandler } = require('../middleware/errorHandler');

// Register new user
const register = asyncHandler(async (req, res) => {
  const { email, password, company_name, gstin, phone, preferences } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: ERROR_MESSAGES.USER_EXISTS
    });
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    company_name,
    gstin,
    phone,
    preferences
  });

  // Generate tokens
  const accessToken = user.generateToken();
  const refreshToken = user.generateRefreshToken();

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.USER_REGISTERED,
    data: {
      user: formatUserResponse(user),
      accessToken,
      refreshToken
    }
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Authenticate user
  const user = await User.authenticate(email, password);
  if (!user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_CREDENTIALS
    });
  }

  // Generate tokens
  const accessToken = user.generateToken();
  const refreshToken = user.generateRefreshToken();

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    data: {
      user: formatUserResponse(user),
      accessToken,
      refreshToken
    }
  });
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = User.verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    // Generate new tokens
    const newAccessToken = user.generateToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN
    });
  }
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const stats = await user.getStats();

  res.json({
    success: true,
    data: {
      user: formatUserResponse(user),
      stats: stats
    }
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  // Remove sensitive fields that shouldn't be updated via this endpoint
  delete updateData.password;
  delete updateData.is_admin;
  delete updateData.is_verified;

  const updatedUser = await User.update(userId, updateData);
  
  if (!updatedUser) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND
    });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: formatUserResponse(updatedUser)
    }
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  await user.changePassword(currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Verify email (placeholder for email verification implementation)
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  // In a real implementation, you would:
  // 1. Verify the email verification token
  // 2. Update user's is_verified status
  // 3. Handle token expiration
  
  // For now, we'll just verify the current user
  const user = await User.verifyEmail(req.user.id);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND
    });
  }

  res.json({
    success: true,
    message: 'Email verified successfully',
    data: {
      user: formatUserResponse(user)
    }
  });
});

// Logout (client-side token removal, server-side could implement token blacklisting)
const logout = asyncHandler(async (req, res) => {
  // In a more sophisticated implementation, you might:
  // 1. Add the token to a blacklist
  // 2. Store logout timestamp
  // 3. Clear any server-side sessions

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get user statistics
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await req.user.getStats();

  res.json({
    success: true,
    data: {
      stats: stats
    }
  });
});

// Delete user account
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  // Verify password before deletion
  const authenticatedUser = await User.authenticate(user.email, password);
  if (!authenticatedUser) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid password'
    });
  }

  // Delete user account
  const deleted = await User.delete(user.id);
  
  if (!deleted) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete account'
    });
  }

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// Admin: Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20
  };

  const [users, total] = await Promise.all([
    User.findAll(pagination),
    User.getCount()
  ]);

  const formattedUsers = users.map(user => formatUserResponse(user));

  res.json({
    success: true,
    data: {
      users: formattedUsers,
      pagination: {
        current_page: pagination.page,
        per_page: pagination.limit,
        total_items: total,
        total_pages: Math.ceil(total / pagination.limit)
      }
    }
  });
});

// Admin: Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND
    });
  }

  const stats = await user.getStats();

  res.json({
    success: true,
    data: {
      user: formatUserResponse(user),
      stats: stats
    }
  });
});

// Admin: Update user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedUser = await User.update(id, updateData);
  
  if (!updatedUser) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND
    });
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: formatUserResponse(updatedUser)
    }
  });
});

// Admin: Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const deleted = await User.delete(id);
  
  if (!deleted) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.USER_NOT_FOUND
    });
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
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
};