const alertService = require('../services/alertService');

class AlertController {
  // Configure new alert
  async configureAlert(req, res) {
    try {
      const userId = req.user.id;
      const alertConfig = req.body;

      // Validate required fields
      if (!alertConfig.name) {
        return res.status(400).json({
          success: false,
          message: 'Alert name is required'
        });
      }

      const alert = await alertService.configureAlert(userId, alertConfig);
      
      res.status(201).json({
        success: true,
        message: 'Alert configured successfully',
        data: alert
      });
    } catch (error) {
      console.error('Configure Alert Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to configure alert',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get user's alerts
  async getUserAlerts(req, res) {
    try {
      const userId = req.user.id;
      const alerts = await alertService.getUserAlerts(userId);
      
      res.json({
        success: true,
        data: {
          alerts,
          total: alerts.length
        }
      });
    } catch (error) {
      console.error('Get User Alerts Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alerts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update alert
  async updateAlert(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      // Check if alert belongs to user
      const existingAlerts = await alertService.getUserAlerts(userId);
      const alertExists = existingAlerts.some(alert => alert.id === id);
      
      if (!alertExists) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found or access denied'
        });
      }

      const updatedAlert = await alertService.updateAlert(id, updates);
      
      res.json({
        success: true,
        message: 'Alert updated successfully',
        data: updatedAlert
      });
    } catch (error) {
      console.error('Update Alert Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update alert',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete alert
  async deleteAlert(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if alert belongs to user
      const existingAlerts = await alertService.getUserAlerts(userId);
      const alertExists = existingAlerts.some(alert => alert.id === id);
      
      if (!alertExists) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found or access denied'
        });
      }

      await alertService.deleteAlert(id);
      
      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      console.error('Delete Alert Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete alert',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get alert history
  async getAlertHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;
      
      const history = await alertService.getAlertHistory(userId, parseInt(limit));
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get Alert History Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alert history',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get alert statistics
  async getAlertStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await alertService.getAlertStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get Alert Stats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alert statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Test alert (for development)
  async testAlert(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if alert belongs to user
      const existingAlerts = await alertService.getUserAlerts(userId);
      const alert = existingAlerts.find(alert => alert.id === id);
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found or access denied'
        });
      }

      // Create a mock tender for testing
      const mockTender = {
        id: 'test_tender_' + Date.now(),
        title: 'Test Tender for Alert Verification',
        department: 'Information Technology',
        category: 'IT Equipment',
        budget: '₹10,00,000',
        location: 'Delhi, India',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: 'This is a test tender to verify alert functionality'
      };

      // Trigger the alert with mock data
      await alertService.triggerAlert(alert, mockTender);
      
      res.json({
        success: true,
        message: 'Test alert triggered successfully',
        data: {
          alert_id: id,
          test_tender: mockTender
        }
      });
    } catch (error) {
      console.error('Test Alert Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test alert',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Start/stop monitoring (admin only)
  async toggleMonitoring(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { action } = req.body; // 'start' or 'stop'
      
      if (action === 'start') {
        alertService.startMonitoring();
        res.json({
          success: true,
          message: 'Alert monitoring started'
        });
      } else if (action === 'stop') {
        alertService.stopMonitoring();
        res.json({
          success: true,
          message: 'Alert monitoring stopped'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid action. Use "start" or "stop"'
        });
      }
    } catch (error) {
      console.error('Toggle Monitoring Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle monitoring',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get monitoring status (admin only)
  async getMonitoringStatus(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      res.json({
        success: true,
        data: {
          is_monitoring: alertService.isMonitoring,
          total_alert_rules: alertService.alertRules.size,
          uptime: process.uptime(),
          last_check: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get Monitoring Status Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monitoring status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new AlertController();