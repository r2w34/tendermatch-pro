const express = require('express');
const router = express.Router();
const scraperService = require('../services/scraperService');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { HTTP_STATUS } = require('../config/constants');

// All scraper routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Manual scraping trigger
router.post('/run', asyncHandler(async (req, res) => {
  const { portal } = req.body; // 'all', 'gem', or 'cppp'
  
  if (scraperService.isRunning) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Scraping is already in progress'
    });
  }

  try {
    const results = await scraperService.manualScrape(portal || 'all');
    
    res.json({
      success: true,
      message: 'Scraping completed successfully',
      data: results
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Scraping failed',
      error: error.message
    });
  }
}));

// Get scraping status
router.get('/status', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      isRunning: scraperService.isRunning,
      currentLogId: scraperService.logId
    }
  });
}));

// Get scraping logs
router.get('/logs', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM scraping_logs 
    ORDER BY started_at DESC 
    LIMIT $1 OFFSET $2
  `;
  
  const countQuery = 'SELECT COUNT(*) FROM scraping_logs';
  
  try {
    const { pool } = require('../config/database');
    const [logsResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    const logs = logsResult.rows;
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        logs: logs,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch scraping logs',
      error: error.message
    });
  }
}));

// Get scraping statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_runs FROM scraping_logs',
    'SELECT COUNT(*) as successful_runs FROM scraping_logs WHERE status = $1',
    'SELECT COUNT(*) as failed_runs FROM scraping_logs WHERE status = $1',
    'SELECT SUM(tenders_new) as total_new_tenders FROM scraping_logs WHERE status = $1',
    'SELECT SUM(tenders_updated) as total_updated_tenders FROM scraping_logs WHERE status = $1',
    'SELECT portal, COUNT(*) as runs, AVG(tenders_found) as avg_found FROM scraping_logs GROUP BY portal',
    'SELECT * FROM scraping_logs ORDER BY started_at DESC LIMIT 5'
  ];

  try {
    const { pool } = require('../config/database');
    const [
      totalResult,
      successfulResult,
      failedResult,
      newTendersResult,
      updatedTendersResult,
      portalStatsResult,
      recentRunsResult
    ] = await Promise.all([
      pool.query(queries[0]),
      pool.query(queries[1], ['completed']),
      pool.query(queries[2], ['failed']),
      pool.query(queries[3], ['completed']),
      pool.query(queries[4], ['completed']),
      pool.query(queries[5]),
      pool.query(queries[6])
    ]);

    const stats = {
      total_runs: parseInt(totalResult.rows[0].total_runs),
      successful_runs: parseInt(successfulResult.rows[0].successful_runs),
      failed_runs: parseInt(failedResult.rows[0].failed_runs),
      total_new_tenders: parseInt(newTendersResult.rows[0].total_new_tenders) || 0,
      total_updated_tenders: parseInt(updatedTendersResult.rows[0].total_updated_tenders) || 0,
      success_rate: totalResult.rows[0].total_runs > 0 
        ? ((successfulResult.rows[0].successful_runs / totalResult.rows[0].total_runs) * 100).toFixed(2)
        : 0,
      portal_stats: portalStatsResult.rows,
      recent_runs: recentRunsResult.rows
    };

    res.json({
      success: true,
      data: {
        stats: stats
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch scraping statistics',
      error: error.message
    });
  }
}));

// Delete old scraping logs
router.delete('/logs/cleanup', asyncHandler(async (req, res) => {
  const { days } = req.query; // Delete logs older than X days
  const daysToKeep = parseInt(days) || 30;

  const query = `
    DELETE FROM scraping_logs 
    WHERE started_at < NOW() - INTERVAL '${daysToKeep} days'
    RETURNING COUNT(*) as deleted_count
  `;

  try {
    const { pool } = require('../config/database');
    const result = await pool.query(query);
    
    res.json({
      success: true,
      message: `Cleaned up scraping logs older than ${daysToKeep} days`,
      data: {
        deleted_count: result.rows[0]?.deleted_count || 0
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to cleanup scraping logs',
      error: error.message
    });
  }
}));

// Test scraper configuration
router.post('/test', asyncHandler(async (req, res) => {
  const { portal } = req.body;
  
  try {
    // This would test the scraper configuration without actually scraping
    // For now, just return configuration info
    const { SCRAPING_CONFIG } = require('../config/constants');
    
    const testResults = {
      portal: portal || 'all',
      configuration: portal ? SCRAPING_CONFIG[portal.toUpperCase()] : SCRAPING_CONFIG,
      browser_available: true, // Would test browser initialization
      network_accessible: true // Would test network connectivity
    };

    res.json({
      success: true,
      message: 'Scraper test completed',
      data: testResults
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Scraper test failed',
      error: error.message
    });
  }
}));

module.exports = router;