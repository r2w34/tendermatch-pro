const Joi = require('joi');
const { VALIDATION_RULES, TENDER_CATEGORIES, INDIAN_STATES, DEPARTMENTS, TENDER_STATUS } = require('../config/constants');

// User registration validation
const validateUserRegistration = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH)
      .required()
      .messages({
        'string.min': `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`,
        'any.required': 'Password is required'
      }),
    company_name: Joi.string()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'Company name must be at least 2 characters long',
        'string.max': 'Company name cannot exceed 200 characters',
        'any.required': 'Company name is required'
      }),
    gstin: Joi.string()
      .pattern(VALIDATION_RULES.GSTIN)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid GSTIN number'
      }),
    phone: Joi.string()
      .pattern(VALIDATION_RULES.PHONE)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid Indian mobile number',
        'any.required': 'Phone number is required'
      }),
    preferences: Joi.object().optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// User login validation
const validateUserLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// User update validation
const validateUserUpdate = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    company_name: Joi.string()
      .min(2)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Company name must be at least 2 characters long',
        'string.max': 'Company name cannot exceed 200 characters'
      }),
    gstin: Joi.string()
      .pattern(VALIDATION_RULES.GSTIN)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid GSTIN number'
      }),
    phone: Joi.string()
      .pattern(VALIDATION_RULES.PHONE)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid Indian mobile number'
      }),
    preferences: Joi.object().optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Password change validation
const validatePasswordChange = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH)
      .required()
      .messages({
        'string.min': `New password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`,
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Password confirmation does not match',
        'any.required': 'Password confirmation is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Tender creation validation
const validateTenderCreation = (data) => {
  const schema = Joi.object({
    tender_ref_no: Joi.string()
      .pattern(VALIDATION_RULES.TENDER_REF_NO)
      .required()
      .messages({
        'string.pattern.base': 'Tender reference number format is invalid',
        'any.required': 'Tender reference number is required'
      }),
    title: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Title must be at least 10 characters long',
        'string.max': 'Title cannot exceed 500 characters',
        'any.required': 'Title is required'
      }),
    description: Joi.string()
      .min(50)
      .max(5000)
      .optional()
      .messages({
        'string.min': 'Description must be at least 50 characters long',
        'string.max': 'Description cannot exceed 5000 characters'
      }),
    department: Joi.string()
      .valid(...DEPARTMENTS)
      .required()
      .messages({
        'any.only': 'Please select a valid department',
        'any.required': 'Department is required'
      }),
    state: Joi.string()
      .valid(...INDIAN_STATES)
      .required()
      .messages({
        'any.only': 'Please select a valid state',
        'any.required': 'State is required'
      }),
    city: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'City name must be at least 2 characters long',
        'string.max': 'City name cannot exceed 100 characters',
        'any.required': 'City is required'
      }),
    budget_min: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.positive': 'Minimum budget must be a positive number'
      }),
    budget_max: Joi.number()
      .positive()
      .greater(Joi.ref('budget_min'))
      .optional()
      .messages({
        'number.positive': 'Maximum budget must be a positive number',
        'number.greater': 'Maximum budget must be greater than minimum budget'
      }),
    publish_date: Joi.date()
      .optional()
      .messages({
        'date.base': 'Please provide a valid publish date'
      }),
    bid_deadline: Joi.date()
      .greater(Joi.ref('publish_date'))
      .required()
      .messages({
        'date.base': 'Please provide a valid bid deadline',
        'date.greater': 'Bid deadline must be after publish date',
        'any.required': 'Bid deadline is required'
      }),
    category: Joi.string()
      .valid(...TENDER_CATEGORIES)
      .required()
      .messages({
        'any.only': 'Please select a valid category',
        'any.required': 'Category is required'
      }),
    source_portal: Joi.string()
      .valid('GeM', 'CPPP', 'State')
      .optional()
      .default('GeM'),
    source_url: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Please provide a valid URL'
      }),
    documents: Joi.array()
      .items(Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
        type: Joi.string().optional()
      }))
      .optional()
      .default([]),
    eligibility_criteria: Joi.object().optional().default({}),
    contact_details: Joi.object().optional().default({}),
    status: Joi.string()
      .valid(...Object.values(TENDER_STATUS))
      .optional()
      .default(TENDER_STATUS.ACTIVE)
  });

  return schema.validate(data, { abortEarly: false });
};

// Tender update validation
const validateTenderUpdate = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(10)
      .max(500)
      .optional()
      .messages({
        'string.min': 'Title must be at least 10 characters long',
        'string.max': 'Title cannot exceed 500 characters'
      }),
    description: Joi.string()
      .min(50)
      .max(5000)
      .optional()
      .messages({
        'string.min': 'Description must be at least 50 characters long',
        'string.max': 'Description cannot exceed 5000 characters'
      }),
    department: Joi.string()
      .valid(...DEPARTMENTS)
      .optional()
      .messages({
        'any.only': 'Please select a valid department'
      }),
    state: Joi.string()
      .valid(...INDIAN_STATES)
      .optional()
      .messages({
        'any.only': 'Please select a valid state'
      }),
    city: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'City name must be at least 2 characters long',
        'string.max': 'City name cannot exceed 100 characters'
      }),
    budget_min: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.positive': 'Minimum budget must be a positive number'
      }),
    budget_max: Joi.number()
      .positive()
      .optional()
      .messages({
        'number.positive': 'Maximum budget must be a positive number'
      }),
    publish_date: Joi.date()
      .optional()
      .messages({
        'date.base': 'Please provide a valid publish date'
      }),
    bid_deadline: Joi.date()
      .optional()
      .messages({
        'date.base': 'Please provide a valid bid deadline'
      }),
    category: Joi.string()
      .valid(...TENDER_CATEGORIES)
      .optional()
      .messages({
        'any.only': 'Please select a valid category'
      }),
    source_url: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Please provide a valid URL'
      }),
    documents: Joi.array()
      .items(Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
        type: Joi.string().optional()
      }))
      .optional(),
    eligibility_criteria: Joi.object().optional(),
    contact_details: Joi.object().optional(),
    status: Joi.string()
      .valid(...Object.values(TENDER_STATUS))
      .optional()
  });

  return schema.validate(data, { abortEarly: false });
};

// Saved search validation
const validateSavedSearch = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Search name must be at least 3 characters long',
        'string.max': 'Search name cannot exceed 100 characters',
        'any.required': 'Search name is required'
      }),
    search_criteria: Joi.object({
      keyword: Joi.string().optional().allow(''),
      state: Joi.string().valid(...INDIAN_STATES).optional().allow(''),
      city: Joi.string().optional().allow(''),
      category: Joi.string().valid(...TENDER_CATEGORIES).optional().allow(''),
      department: Joi.string().valid(...DEPARTMENTS).optional().allow(''),
      minBudget: Joi.number().positive().optional(),
      maxBudget: Joi.number().positive().optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional()
    }).required(),
    alert_enabled: Joi.boolean().optional().default(true)
  });

  return schema.validate(data, { abortEarly: false });
};

// Query parameters validation for tender search
const validateTenderQuery = (data) => {
  const schema = Joi.object({
    keyword: Joi.string().optional().allow(''),
    state: Joi.string().valid(...INDIAN_STATES).optional(),
    city: Joi.string().optional().allow(''),
    category: Joi.string().valid(...TENDER_CATEGORIES).optional(),
    department: Joi.string().valid(...DEPARTMENTS).optional(),
    minBudget: Joi.number().positive().optional(),
    maxBudget: Joi.number().positive().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    status: Joi.string().valid(...Object.values(TENDER_STATUS)).optional(),
    sortBy: Joi.string().valid('latest', 'deadline_asc', 'budget_desc', 'budget_asc', 'title_asc').optional(),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20)
  });

  return schema.validate(data, { abortEarly: false });
};

// Pagination validation
const validatePagination = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20)
  });

  return schema.validate(data, { abortEarly: false });
};

// UUID validation
const validateUUID = (id) => {
  const schema = Joi.string().uuid().required();
  return schema.validate(id);
};

// Email validation
const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  return schema.validate(email);
};

// Custom validation middleware
const validate = (validator) => {
  return (req, res, next) => {
    const { error, value } = validator(req.body);
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: details
      });
    }
    
    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (validator) => {
  return (req, res, next) => {
    const { error, value } = validator(req.query);
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        details: details
      });
    }
    
    // Replace req.query with validated data
    req.query = value;
    next();
  };
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateTenderCreation,
  validateTenderUpdate,
  validateSavedSearch,
  validateTenderQuery,
  validatePagination,
  validateUUID,
  validateEmail,
  validate,
  validateQuery
};