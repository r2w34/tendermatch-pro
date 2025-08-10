const SavedSearch = require('../models/SavedSearch');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../config/constants');
const { formatTenderResponse, generatePaginationMeta } = require('../utils/formatters');
const { asyncHandler } = require('../middleware/errorHandler');

// Create new saved search
const createSavedSearch = asyncHandler(async (req, res) => {
  const { name, search_criteria, alert_enabled } = req.body;
  
  const savedSearch = await SavedSearch.create({
    user_id: req.user.id,
    name,
    search_criteria,
    alert_enabled
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.SEARCH_SAVED,
    data: {
      saved_search: savedSearch
    }
  });
});

// Get all saved searches for current user
const getSavedSearches = asyncHandler(async (req, res) => {
  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20
  };

  const [savedSearches, total] = await Promise.all([
    SavedSearch.findByUserId(req.user.id, pagination),
    SavedSearch.getCountByUserId(req.user.id)
  ]);

  const paginationMeta = generatePaginationMeta(pagination.page, pagination.limit, total);

  res.json({
    success: true,
    data: {
      saved_searches: savedSearches,
      pagination: paginationMeta
    }
  });
});

// Get saved search by ID
const getSavedSearchById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const savedSearch = await SavedSearch.findById(id);
  
  if (!savedSearch) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  // Check ownership
  if (savedSearch.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
    });
  }

  res.json({
    success: true,
    data: {
      saved_search: savedSearch
    }
  });
});

// Update saved search
const updateSavedSearch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if saved search exists and user owns it
  const existingSavedSearch = await SavedSearch.findById(id);
  if (!existingSavedSearch) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  if (existingSavedSearch.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
    });
  }

  const updatedSavedSearch = await SavedSearch.update(id, req.body);
  
  if (!updatedSavedSearch) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  res.json({
    success: true,
    message: 'Saved search updated successfully',
    data: {
      saved_search: updatedSavedSearch
    }
  });
});

// Delete saved search
const deleteSavedSearch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if saved search exists and user owns it
  const existingSavedSearch = await SavedSearch.findById(id);
  if (!existingSavedSearch) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  if (existingSavedSearch.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
    });
  }

  const deleted = await SavedSearch.delete(id);
  
  if (!deleted) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  res.json({
    success: true,
    message: 'Saved search deleted successfully'
  });
});

// Execute saved search to get matching tenders
const executeSavedSearch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const savedSearch = await SavedSearch.findById(id);
  
  if (!savedSearch) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  // Check ownership
  if (savedSearch.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
    });
  }

  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20
  };

  const [tenders, total] = await Promise.all([
    savedSearch.executeSearch(pagination),
    savedSearch.getMatchingCount()
  ]);

  const formattedTenders = tenders.map(tender => formatTenderResponse(tender));
  const paginationMeta = generatePaginationMeta(pagination.page, pagination.limit, total);

  res.json({
    success: true,
    data: {
      saved_search: savedSearch,
      tenders: formattedTenders,
      pagination: paginationMeta,
      total_matches: total
    }
  });
});

// Toggle alert for saved search
const toggleAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const savedSearch = await SavedSearch.findById(id);
  
  if (!savedSearch) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  // Check ownership
  if (savedSearch.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
    });
  }

  const updatedSavedSearch = await savedSearch.toggleAlert();
  
  if (!updatedSavedSearch) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to toggle alert'
    });
  }

  res.json({
    success: true,
    message: `Alert ${updatedSavedSearch.alert_enabled ? 'enabled' : 'disabled'} successfully`,
    data: {
      saved_search: updatedSavedSearch
    }
  });
});

// Get new matches for saved search (for notifications)
const getNewMatches = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { since } = req.query; // Date since when to check for new matches
  
  const savedSearch = await SavedSearch.findById(id);
  
  if (!savedSearch) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  // Check ownership
  if (savedSearch.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
    });
  }

  const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago
  const newMatches = await savedSearch.findNewMatches(sinceDate);
  
  const formattedMatches = newMatches.map(tender => formatTenderResponse(tender));

  res.json({
    success: true,
    data: {
      saved_search: savedSearch,
      new_matches: formattedMatches,
      count: formattedMatches.length,
      since: sinceDate
    }
  });
});

// Get all saved searches with alerts enabled (Admin only - for notification service)
const getSavedSearchesWithAlerts = asyncHandler(async (req, res) => {
  const savedSearches = await SavedSearch.findWithAlertsEnabled();

  res.json({
    success: true,
    data: {
      saved_searches: savedSearches,
      count: savedSearches.length
    }
  });
});

// Duplicate saved search
const duplicateSavedSearch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const originalSearch = await SavedSearch.findById(id);
  
  if (!originalSearch) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  // Check ownership
  if (originalSearch.user_id !== req.user.id && !req.user.is_admin) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
    });
  }

  // Create duplicate with modified name
  const duplicateData = {
    user_id: req.user.id,
    name: `${originalSearch.name} (Copy)`,
    search_criteria: originalSearch.search_criteria,
    alert_enabled: originalSearch.alert_enabled
  };

  const duplicatedSearch = await SavedSearch.create(duplicateData);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Saved search duplicated successfully',
    data: {
      saved_search: duplicatedSearch
    }
  });
});

// Get saved search statistics for user
const getSavedSearchStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const savedSearches = await SavedSearch.findByUserId(userId, { limit: 1000 }); // Get all
  
  const stats = {
    total_searches: savedSearches.length,
    active_alerts: savedSearches.filter(search => search.alert_enabled).length,
    inactive_alerts: savedSearches.filter(search => !search.alert_enabled).length,
    recent_searches: savedSearches.slice(0, 5) // Last 5 searches
  };

  res.json({
    success: true,
    data: {
      stats: stats
    }
  });
});

module.exports = {
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
};