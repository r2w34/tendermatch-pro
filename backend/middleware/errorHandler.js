const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    success: false,
    message: ERROR_MESSAGES.SERVER_ERROR,
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = HTTP_STATUS.BAD_REQUEST;
    error.message = err.message;
    error.details = err.details;
  } else if (err.name === 'JsonWebTokenError') {
    error.status = HTTP_STATUS.UNAUTHORIZED;
    error.message = ERROR_MESSAGES.INVALID_TOKEN;
  } else if (err.name === 'TokenExpiredError') {
    error.status = HTTP_STATUS.UNAUTHORIZED;
    error.message = 'Token has expired';
  } else if (err.code === '23505') { // PostgreSQL unique violation
    error.status = HTTP_STATUS.CONFLICT;
    error.message = 'Resource already exists';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    error.status = HTTP_STATUS.BAD_REQUEST;
    error.message = 'Referenced resource does not exist';
  } else if (err.code === '23502') { // PostgreSQL not null violation
    error.status = HTTP_STATUS.BAD_REQUEST;
    error.message = 'Required field is missing';
  } else if (err.code === '22P02') { // PostgreSQL invalid input syntax
    error.status = HTTP_STATUS.BAD_REQUEST;
    error.message = 'Invalid input format';
  } else if (err.message === 'User with this email already exists') {
    error.status = HTTP_STATUS.CONFLICT;
    error.message = err.message;
  } else if (err.message === 'Invalid email or password') {
    error.status = HTTP_STATUS.UNAUTHORIZED;
    error.message = err.message;
  } else if (err.message === 'User not found') {
    error.status = HTTP_STATUS.NOT_FOUND;
    error.message = err.message;
  } else if (err.message === 'Tender not found') {
    error.status = HTTP_STATUS.NOT_FOUND;
    error.message = err.message;
  } else if (err.message && err.message.includes('not found')) {
    error.status = HTTP_STATUS.NOT_FOUND;
    error.message = err.message;
  } else if (err.status) {
    // If error already has a status, use it
    error.status = err.status;
    error.message = err.message || ERROR_MESSAGES.SERVER_ERROR;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
    
    // Only show generic error message for 500 errors in production
    if (error.status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      error.message = ERROR_MESSAGES.SERVER_ERROR;
    }
  } else {
    // Include stack trace in development
    error.stack = err.stack;
  }

  res.status(error.status).json(error);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};

// Async error wrapper to catch async errors in route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class for application-specific errors
class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.name = 'AppError';
    this.status = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error class
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.status = HTTP_STATUS.BAD_REQUEST;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Database error handler
const handleDatabaseError = (error) => {
  console.error('Database error:', error);
  
  // Map common database errors to user-friendly messages
  const errorMap = {
    '23505': 'This record already exists',
    '23503': 'Referenced record does not exist',
    '23502': 'Required field is missing',
    '22P02': 'Invalid data format',
    '42P01': 'Database table does not exist',
    '42703': 'Database column does not exist'
  };

  const message = errorMap[error.code] || 'Database operation failed';
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

// Rate limit error handler
const handleRateLimitError = (req, res) => {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    retryAfter: Math.round(req.rateLimit.resetTime / 1000) || 60
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  handleDatabaseError,
  handleRateLimitError
};