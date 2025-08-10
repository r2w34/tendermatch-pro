const express = require('express');
const alertController = require('../controllers/alertController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Configure new alert
router.post('/configure', alertController.configureAlert);

// Get user's alerts
router.get('/', alertController.getUserAlerts);

// Update alert
router.put('/:id', alertController.updateAlert);

// Delete alert
router.delete('/:id', alertController.deleteAlert);

// Get alert history
router.get('/history', alertController.getAlertHistory);

// Get alert statistics
router.get('/stats', alertController.getAlertStats);

// Test alert (development)
router.post('/:id/test', alertController.testAlert);

// Admin routes
router.post('/monitoring/toggle', alertController.toggleMonitoring);
router.get('/monitoring/status', alertController.getMonitoringStatus);

module.exports = router;