// Utility functions for formatting data

// Format currency in Indian Rupees
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';
  
  const numAmount = parseFloat(amount);
  
  // Convert to appropriate units
  if (numAmount >= 10000000) { // 1 Crore
    return `₹${(numAmount / 10000000).toFixed(1)} Cr`;
  } else if (numAmount >= 100000) { // 1 Lakh
    return `₹${(numAmount / 100000).toFixed(1)} L`;
  } else if (numAmount >= 1000) { // 1 Thousand
    return `₹${(numAmount / 1000).toFixed(1)} K`;
  } else {
    return `₹${numAmount.toLocaleString('en-IN')}`;
  }
};

// Format date to Indian format (DD/MM/YYYY)
const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Format date for display (e.g., "15 Aug 2024")
const formatDisplayDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Calculate days remaining until deadline
const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const currentDate = new Date();
  
  if (isNaN(deadlineDate.getTime())) return null;
  
  const timeDiff = deadlineDate.getTime() - currentDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};

// Get tender status based on deadline
const getTenderStatus = (deadline, currentStatus = 'active') => {
  if (currentStatus !== 'active') return currentStatus;
  
  const daysRemaining = getDaysRemaining(deadline);
  
  if (daysRemaining === null) return 'active';
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 7) return 'closing_soon';
  
  return 'active';
};

// Format tender status for display
const formatTenderStatus = (status) => {
  const statusMap = {
    'active': 'Active',
    'closed': 'Closed',
    'cancelled': 'Cancelled',
    'expired': 'Expired',
    'closing_soon': 'Closing Soon'
  };
  
  return statusMap[status] || 'Unknown';
};

// Get status color class
const getStatusColor = (status) => {
  const colorMap = {
    'active': 'green',
    'closed': 'gray',
    'cancelled': 'red',
    'expired': 'red',
    'closing_soon': 'orange'
  };
  
  return colorMap[status] || 'gray';
};

// Format phone number
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +91 XXXXX XXXXX
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
};

// Format GSTIN
const formatGSTIN = (gstin) => {
  if (!gstin) return '';
  
  // Format as XX XXXXX XXXX X X Z X
  if (gstin.length === 15) {
    return `${gstin.slice(0, 2)} ${gstin.slice(2, 7)} ${gstin.slice(7, 11)} ${gstin.slice(11, 12)} ${gstin.slice(12, 13)} ${gstin.slice(13, 14)} ${gstin.slice(14, 15)}`;
  }
  
  return gstin;
};

// Truncate text with ellipsis
const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

// Generate tender reference number
const generateTenderRefNo = (portal = 'GEM', year = new Date().getFullYear()) => {
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  return `${portal}/${year}/B/${randomNum}`;
};

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  if (!filename) return '';
  
  // Remove or replace invalid characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
};

// Format search criteria for display
const formatSearchCriteria = (criteria) => {
  if (!criteria || typeof criteria !== 'object') return '';
  
  const parts = [];
  
  if (criteria.keyword) parts.push(`Keyword: "${criteria.keyword}"`);
  if (criteria.state) parts.push(`State: ${criteria.state}`);
  if (criteria.city) parts.push(`City: ${criteria.city}`);
  if (criteria.category) parts.push(`Category: ${criteria.category}`);
  if (criteria.department) parts.push(`Department: ${criteria.department}`);
  if (criteria.minBudget) parts.push(`Min Budget: ${formatCurrency(criteria.minBudget)}`);
  if (criteria.maxBudget) parts.push(`Max Budget: ${formatCurrency(criteria.maxBudget)}`);
  
  return parts.join(', ');
};

// Parse budget string to number
const parseBudget = (budgetStr) => {
  if (!budgetStr || typeof budgetStr !== 'string') return null;
  
  const cleaned = budgetStr.replace(/[₹,\s]/g, '').toLowerCase();
  
  if (cleaned.includes('cr') || cleaned.includes('crore')) {
    return parseFloat(cleaned.replace(/[^0-9.]/g, '')) * 10000000;
  } else if (cleaned.includes('l') || cleaned.includes('lakh')) {
    return parseFloat(cleaned.replace(/[^0-9.]/g, '')) * 100000;
  } else if (cleaned.includes('k') || cleaned.includes('thousand')) {
    return parseFloat(cleaned.replace(/[^0-9.]/g, '')) * 1000;
  } else {
    return parseFloat(cleaned) || null;
  }
};

// Format tender for API response
const formatTenderResponse = (tender) => {
  if (!tender) return null;
  
  const formatted = {
    ...tender,
    budget_min_formatted: formatCurrency(tender.budget_min),
    budget_max_formatted: formatCurrency(tender.budget_max),
    publish_date_formatted: formatDisplayDate(tender.publish_date),
    bid_deadline_formatted: formatDisplayDate(tender.bid_deadline),
    days_remaining: getDaysRemaining(tender.bid_deadline),
    status_display: formatTenderStatus(getTenderStatus(tender.bid_deadline, tender.status)),
    status_color: getStatusColor(getTenderStatus(tender.bid_deadline, tender.status)),
    description_short: truncateText(tender.description, 150)
  };
  
  return formatted;
};

// Format user for API response (remove sensitive data)
const formatUserResponse = (user) => {
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  
  return {
    ...userWithoutPassword,
    phone_formatted: formatPhoneNumber(user.phone),
    gstin_formatted: formatGSTIN(user.gstin),
    created_at_formatted: formatDisplayDate(user.created_at)
  };
};

// Generate pagination metadata
const generatePaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    current_page: page,
    per_page: limit,
    total_items: total,
    total_pages: totalPages,
    has_next: hasNext,
    has_prev: hasPrev,
    next_page: hasNext ? page + 1 : null,
    prev_page: hasPrev ? page - 1 : null
  };
};

module.exports = {
  formatCurrency,
  formatDate,
  formatDisplayDate,
  getDaysRemaining,
  getTenderStatus,
  formatTenderStatus,
  getStatusColor,
  formatPhoneNumber,
  formatGSTIN,
  truncateText,
  generateTenderRefNo,
  formatFileSize,
  sanitizeFilename,
  formatSearchCriteria,
  parseBudget,
  formatTenderResponse,
  formatUserResponse,
  generatePaginationMeta
};