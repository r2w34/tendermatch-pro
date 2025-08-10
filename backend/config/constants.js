// Application constants
const TENDER_CATEGORIES = [
  'IT Equipment',
  'Construction', 
  'Consultancy Services',
  'Medical Equipment',
  'Office Supplies',
  'Transportation',
  'Infrastructure',
  'Software Development'
];

const TENDER_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

const SOURCE_PORTALS = {
  GEM: 'GeM',
  CPPP: 'CPPP',
  STATE: 'State'
};

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Puducherry',
  'Andaman and Nicobar Islands'
];

const DEPARTMENTS = [
  'Ministry of Education',
  'Ministry of Health & Family Welfare',
  'Ministry of Transport',
  'Ministry of Information Technology',
  'Ministry of Defence',
  'Ministry of Railways',
  'Ministry of Power',
  'Ministry of Agriculture',
  'Ministry of Rural Development',
  'Ministry of Urban Development',
  'Ministry of Finance',
  'Ministry of Home Affairs',
  'Ministry of External Affairs',
  'Ministry of Environment',
  'Ministry of Commerce & Industry'
];

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

const SORT_OPTIONS = {
  LATEST: 'latest',
  DEADLINE_ASC: 'deadline_asc',
  BUDGET_DESC: 'budget_desc',
  BUDGET_ASC: 'budget_asc',
  TITLE_ASC: 'title_asc'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User already exists',
  TENDER_NOT_FOUND: 'Tender not found',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
};

const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  TENDER_CREATED: 'Tender created successfully',
  TENDER_UPDATED: 'Tender updated successfully',
  TENDER_DELETED: 'Tender deleted successfully',
  SEARCH_SAVED: 'Search saved successfully',
  FAVORITE_ADDED: 'Tender added to favorites',
  FAVORITE_REMOVED: 'Tender removed from favorites'
};

const SCRAPING_CONFIG = {
  GEM: {
    BASE_URL: 'https://gem.gov.in',
    TENDER_LIST_URL: '/tender/search',
    RATE_LIMIT: 2000, // 2 seconds between requests
    MAX_RETRIES: 3,
    TIMEOUT: 30000 // 30 seconds
  },
  CPPP: {
    BASE_URL: 'https://eprocure.gov.in',
    TENDER_LIST_URL: '/eprocure/app',
    RATE_LIMIT: 2000,
    MAX_RETRIES: 3,
    TIMEOUT: 30000
  }
};

const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  PASSWORD_MIN_LENGTH: 8,
  TENDER_REF_NO: /^[A-Z0-9\/\-]+$/
};

module.exports = {
  TENDER_CATEGORIES,
  TENDER_STATUS,
  SOURCE_PORTALS,
  INDIAN_STATES,
  DEPARTMENTS,
  PAGINATION,
  SORT_OPTIONS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SCRAPING_CONFIG,
  VALIDATION_RULES
};