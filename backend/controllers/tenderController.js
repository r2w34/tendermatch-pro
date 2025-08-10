const Tender = require('../models/Tender');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../config/constants');
const { formatTenderResponse, generatePaginationMeta } = require('../utils/formatters');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all tenders with filtering and pagination
const getTenders = asyncHandler(async (req, res) => {
  const filters = {
    keyword: req.query.keyword,
    state: req.query.state,
    city: req.query.city,
    category: req.query.category,
    department: req.query.department,
    minBudget: req.query.minBudget ? parseFloat(req.query.minBudget) : undefined,
    maxBudget: req.query.maxBudget ? parseFloat(req.query.maxBudget) : undefined,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    status: req.query.status,
    sortBy: req.query.sortBy
  };

  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20
  };

  // Get tenders and total count
  const [tenders, total] = await Promise.all([
    Tender.findAll(filters, pagination),
    Tender.getCount(filters)
  ]);

  // Format tenders for response
  const formattedTenders = tenders.map(tender => formatTenderResponse(tender));

  // Generate pagination metadata
  const paginationMeta = generatePaginationMeta(pagination.page, pagination.limit, total);

  res.json({
    success: true,
    data: {
      tenders: formattedTenders,
      pagination: paginationMeta,
      filters: filters
    }
  });
});

// Get single tender by ID
const getTenderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const tender = await Tender.findById(id);
  
  if (!tender) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.TENDER_NOT_FOUND
    });
  }

  // Check if user has favorited this tender (if authenticated)
  let isFavorite = false;
  if (req.user) {
    isFavorite = await req.user.isFavorite(id);
  }

  const formattedTender = {
    ...formatTenderResponse(tender),
    is_favorite: isFavorite
  };

  res.json({
    success: true,
    data: {
      tender: formattedTender
    }
  });
});

// Create new tender (Admin only)
const createTender = asyncHandler(async (req, res) => {
  const tender = await Tender.create(req.body);
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.TENDER_CREATED,
    data: {
      tender: formatTenderResponse(tender)
    }
  });
});

// Update tender (Admin only)
const updateTender = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const tender = await Tender.update(id, req.body);
  
  if (!tender) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.TENDER_NOT_FOUND
    });
  }

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.TENDER_UPDATED,
    data: {
      tender: formatTenderResponse(tender)
    }
  });
});

// Delete tender (Admin only)
const deleteTender = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const deleted = await Tender.delete(id);
  
  if (!deleted) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.TENDER_NOT_FOUND
    });
  }

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.TENDER_DELETED
  });
});

// Get tender statistics
const getTenderStats = asyncHandler(async (req, res) => {
  const stats = await Tender.getStats();
  
  res.json({
    success: true,
    data: {
      stats: stats
    }
  });
});

// Search tenders (similar to getTenders but with different response format)
const searchTenders = asyncHandler(async (req, res) => {
  const filters = {
    keyword: req.query.q || req.query.keyword,
    state: req.query.state,
    city: req.query.city,
    category: req.query.category,
    department: req.query.department,
    minBudget: req.query.minBudget ? parseFloat(req.query.minBudget) : undefined,
    maxBudget: req.query.maxBudget ? parseFloat(req.query.maxBudget) : undefined,
    sortBy: req.query.sortBy || 'latest'
  };

  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  };

  const [tenders, total] = await Promise.all([
    Tender.findAll(filters, pagination),
    Tender.getCount(filters)
  ]);

  const formattedTenders = tenders.map(tender => ({
    id: tender.id,
    tender_ref_no: tender.tender_ref_no,
    title: tender.title,
    department: tender.department,
    state: tender.state,
    city: tender.city,
    category: tender.category,
    budget_max: tender.budget_max,
    bid_deadline: tender.bid_deadline
  }));

  res.json({
    success: true,
    data: {
      results: formattedTenders,
      total: total,
      query: req.query.q || req.query.keyword || ''
    }
  });
});

// Get trending tenders
const getTrendingTenders = asyncHandler(async (req, res) => {
  const filters = {
    status: 'active',
    sortBy: 'latest'
  };

  const pagination = {
    page: 1,
    limit: 10
  };

  const tenders = await Tender.findAll(filters, pagination);
  const formattedTenders = tenders.map(tender => formatTenderResponse(tender));

  res.json({
    success: true,
    data: {
      tenders: formattedTenders
    }
  });
});

// Get tenders closing soon
const getClosingSoonTenders = asyncHandler(async (req, res) => {
  const filters = {
    status: 'active',
    sortBy: 'deadline_asc'
  };

  const pagination = {
    page: 1,
    limit: parseInt(req.query.limit) || 20
  };

  const tenders = await Tender.findAll(filters, pagination);
  
  // Filter tenders that are closing within 7 days
  const closingSoon = tenders.filter(tender => {
    const daysRemaining = Math.ceil((new Date(tender.bid_deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  });

  const formattedTenders = closingSoon.map(tender => formatTenderResponse(tender));

  res.json({
    success: true,
    data: {
      tenders: formattedTenders,
      count: formattedTenders.length
    }
  });
});

// Get tenders by category
const getTendersByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  const filters = {
    category: category,
    status: 'active',
    sortBy: req.query.sortBy || 'latest'
  };

  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20
  };

  const [tenders, total] = await Promise.all([
    Tender.findAll(filters, pagination),
    Tender.getCount(filters)
  ]);

  const formattedTenders = tenders.map(tender => formatTenderResponse(tender));
  const paginationMeta = generatePaginationMeta(pagination.page, pagination.limit, total);

  res.json({
    success: true,
    data: {
      category: category,
      tenders: formattedTenders,
      pagination: paginationMeta
    }
  });
});

// Get tenders by state
const getTendersByState = asyncHandler(async (req, res) => {
  const { state } = req.params;
  
  const filters = {
    state: state,
    status: 'active',
    sortBy: req.query.sortBy || 'latest'
  };

  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20
  };

  const [tenders, total] = await Promise.all([
    Tender.findAll(filters, pagination),
    Tender.getCount(filters)
  ]);

  const formattedTenders = tenders.map(tender => formatTenderResponse(tender));
  const paginationMeta = generatePaginationMeta(pagination.page, pagination.limit, total);

  res.json({
    success: true,
    data: {
      state: state,
      tenders: formattedTenders,
      pagination: paginationMeta
    }
  });
});

// Add tender to favorites
const addToFavorites = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if tender exists
  const tender = await Tender.findById(id);
  if (!tender) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: ERROR_MESSAGES.TENDER_NOT_FOUND
    });
  }

  const added = await req.user.addToFavorites(id);
  
  res.json({
    success: true,
    message: added ? SUCCESS_MESSAGES.FAVORITE_ADDED : 'Tender already in favorites',
    data: {
      is_favorite: true
    }
  });
});

// Remove tender from favorites
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const removed = await req.user.removeFromFavorites(id);
  
  if (!removed) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Tender not found in favorites'
    });
  }

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.FAVORITE_REMOVED,
    data: {
      is_favorite: false
    }
  });
});

// Get user's favorite tenders
const getFavorites = asyncHandler(async (req, res) => {
  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20
  };

  const favorites = await req.user.getFavorites(pagination);
  const formattedFavorites = favorites.map(favorite => ({
    ...formatTenderResponse(favorite),
    favorited_at: favorite.favorited_at
  }));

  res.json({
    success: true,
    data: {
      favorites: formattedFavorites
    }
  });
});

module.exports = {
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
};