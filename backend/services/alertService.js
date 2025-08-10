const aiService = require('./aiService');
const notificationService = require('./notificationService');
const Tender = require('../models/Tender');
const User = require('../models/User');

class AlertService {
  constructor() {
    this.alertRules = new Map();
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  // Start monitoring for new tenders
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Alert monitoring started');
    
    // Check for new tenders every 5 minutes
    this.monitoringInterval = setInterval(async () => {
      await this.checkNewTenders();
    }, 5 * 60 * 1000);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Alert monitoring stopped');
  }

  // Configure alert for a user
  async configureAlert(userId, alertConfig) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const alertRule = {
        id: `alert_${userId}_${Date.now()}`,
        user_id: userId,
        name: alertConfig.name || 'Unnamed Alert',
        criteria: {
          keywords: alertConfig.keywords || [],
          categories: alertConfig.categories || [],
          departments: alertConfig.departments || [],
          states: alertConfig.states || [],
          budget_min: alertConfig.budget_min || 0,
          budget_max: alertConfig.budget_max || Infinity,
          match_threshold: alertConfig.match_threshold || 70
        },
        notification_methods: alertConfig.notification_methods || ['email'],
        is_active: alertConfig.is_active !== false,
        created_at: new Date(),
        last_triggered: null,
        trigger_count: 0
      };

      this.alertRules.set(alertRule.id, alertRule);
      
      // Save to database (you might want to create an Alert model)
      await this.saveAlertRule(alertRule);

      return alertRule;
    } catch (error) {
      console.error('Configure alert error:', error);
      throw error;
    }
  }

  // Get user's alerts
  async getUserAlerts(userId) {
    const userAlerts = [];
    for (const [id, rule] of this.alertRules) {
      if (rule.user_id === userId) {
        userAlerts.push(rule);
      }
    }
    return userAlerts;
  }

  // Update alert
  async updateAlert(alertId, updates) {
    const alert = this.alertRules.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    const updatedAlert = {
      ...alert,
      ...updates,
      updated_at: new Date()
    };

    this.alertRules.set(alertId, updatedAlert);
    await this.saveAlertRule(updatedAlert);

    return updatedAlert;
  }

  // Delete alert
  async deleteAlert(alertId) {
    const alert = this.alertRules.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    this.alertRules.delete(alertId);
    await this.removeAlertRule(alertId);

    return { success: true };
  }

  // Check for new tenders and trigger alerts
  async checkNewTenders() {
    try {
      // Get tenders published in the last 6 hours
      const cutoffTime = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const newTenders = await Tender.findAll({
        where: {
          published_date: { $gte: cutoffTime }
        }
      });

      if (newTenders.length === 0) {
        return;
      }

      console.log(`Checking ${newTenders.length} new tenders against ${this.alertRules.size} alert rules`);

      // Check each tender against all alert rules
      for (const tender of newTenders) {
        await this.processTenderAlerts(tender);
      }
    } catch (error) {
      console.error('Check new tenders error:', error);
    }
  }

  // Process alerts for a specific tender
  async processTenderAlerts(tender) {
    for (const [alertId, rule] of this.alertRules) {
      if (!rule.is_active) continue;

      try {
        const isMatch = await this.evaluateAlertRule(tender, rule);
        if (isMatch) {
          await this.triggerAlert(rule, tender);
        }
      } catch (error) {
        console.error(`Error processing alert ${alertId}:`, error);
      }
    }
  }

  // Evaluate if a tender matches an alert rule
  async evaluateAlertRule(tender, rule) {
    const criteria = rule.criteria;

    // Check basic filters
    if (criteria.categories.length > 0 && !criteria.categories.includes(tender.category)) {
      return false;
    }

    if (criteria.departments.length > 0 && !criteria.departments.includes(tender.department)) {
      return false;
    }

    if (criteria.states.length > 0) {
      const tenderState = tender.location?.split(',')[0]?.trim();
      if (!criteria.states.includes(tenderState)) {
        return false;
      }
    }

    // Check budget range
    const budgetAmount = this.extractBudgetAmount(tender.budget);
    if (budgetAmount < criteria.budget_min || budgetAmount > criteria.budget_max) {
      return false;
    }

    // Check keywords
    if (criteria.keywords.length > 0) {
      const tenderText = `${tender.title} ${tender.description}`.toLowerCase();
      const hasKeyword = criteria.keywords.some(keyword => 
        tenderText.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }

    // AI-based matching if threshold is set
    if (criteria.match_threshold > 0) {
      try {
        const user = await User.findById(rule.user_id);
        const matching = await aiService.matchTenderToProfile(user, tender);
        
        if (matching.match_score < criteria.match_threshold) {
          return false;
        }
      } catch (error) {
        console.warn('AI matching failed for alert, using basic matching:', error.message);
      }
    }

    return true;
  }

  // Trigger an alert
  async triggerAlert(rule, tender) {
    try {
      // Update trigger statistics
      rule.last_triggered = new Date();
      rule.trigger_count += 1;
      this.alertRules.set(rule.id, rule);

      // Get user details
      const user = await User.findById(rule.user_id);
      if (!user) {
        console.error(`User ${rule.user_id} not found for alert ${rule.id}`);
        return;
      }

      // Generate AI insights for the alert
      let aiInsights = null;
      try {
        const matching = await aiService.matchTenderToProfile(user, tender);
        aiInsights = {
          match_score: matching.match_score,
          key_factors: matching.matching_factors.slice(0, 3),
          recommendations: matching.recommendations.slice(0, 2)
        };
      } catch (error) {
        console.warn('Failed to generate AI insights for alert:', error.message);
      }

      // Prepare notification data
      const notificationData = {
        user_id: user.id,
        alert_name: rule.name,
        tender: {
          id: tender.id,
          title: tender.title,
          department: tender.department,
          budget: tender.budget,
          deadline: tender.deadline,
          location: tender.location
        },
        ai_insights: aiInsights,
        alert_triggered_at: new Date()
      };

      // Send notifications based on configured methods
      for (const method of rule.notification_methods) {
        switch (method) {
          case 'email':
            await this.sendEmailAlert(user, notificationData);
            break;
          case 'sms':
            await this.sendSMSAlert(user, notificationData);
            break;
          case 'push':
            await this.sendPushAlert(user, notificationData);
            break;
          default:
            console.warn(`Unknown notification method: ${method}`);
        }
      }

      console.log(`Alert triggered: ${rule.name} for tender ${tender.id}`);
    } catch (error) {
      console.error('Trigger alert error:', error);
    }
  }

  // Send email alert
  async sendEmailAlert(user, data) {
    const subject = `🚨 New Tender Alert: ${data.tender.title}`;
    
    let emailBody = `
<h2>New Tender Match Found!</h2>
<p>Hello ${user.name || user.email},</p>
<p>A new tender matching your alert "<strong>${data.alert_name}</strong>" has been published:</p>

<div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
  <h3>${data.tender.title}</h3>
  <p><strong>Department:</strong> ${data.tender.department}</p>
  <p><strong>Budget:</strong> ${data.tender.budget}</p>
  <p><strong>Location:</strong> ${data.tender.location}</p>
  <p><strong>Deadline:</strong> ${new Date(data.tender.deadline).toLocaleDateString()}</p>
</div>
`;

    if (data.ai_insights) {
      emailBody += `
<div style="background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px;">
  <h4>🤖 AI Insights</h4>
  <p><strong>Match Score:</strong> ${data.ai_insights.match_score}%</p>
  <p><strong>Key Matching Factors:</strong></p>
  <ul>
    ${data.ai_insights.key_factors.map(factor => `<li>${factor}</li>`).join('')}
  </ul>
  <p><strong>Recommendations:</strong></p>
  <ul>
    ${data.ai_insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
  </ul>
</div>
`;
    }

    emailBody += `
<p><a href="${process.env.FRONTEND_URL}/tenders/${data.tender.id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Tender Details</a></p>
<p>Best regards,<br>TenderMatch Pro Team</p>
`;

    await notificationService.sendEmail(user.email, subject, emailBody);
  }

  // Send SMS alert
  async sendSMSAlert(user, data) {
    if (!user.phone) return;

    const message = `TenderMatch Alert: New tender "${data.tender.title}" matches your criteria. Budget: ${data.tender.budget}. Deadline: ${new Date(data.tender.deadline).toLocaleDateString()}. View: ${process.env.FRONTEND_URL}/tenders/${data.tender.id}`;
    
    await notificationService.sendSMS(user.phone, message);
  }

  // Send push notification
  async sendPushAlert(user, data) {
    const notification = {
      title: 'New Tender Alert',
      body: `${data.tender.title} - ${data.tender.budget}`,
      data: {
        tender_id: data.tender.id,
        alert_name: data.alert_name
      }
    };

    await notificationService.sendPushNotification(user.id, notification);
  }

  // Extract budget amount from budget string
  extractBudgetAmount(budgetString) {
    if (!budgetString) return 0;
    
    // Remove currency symbols and extract numbers
    const cleanBudget = budgetString.replace(/[₹,\s]/g, '');
    const match = cleanBudget.match(/[\d.]+/);
    
    if (!match) return 0;
    
    let amount = parseFloat(match[0]);
    
    // Handle crore and lakh
    if (budgetString.toLowerCase().includes('crore')) {
      amount *= 10000000; // 1 crore = 10 million
    } else if (budgetString.toLowerCase().includes('lakh')) {
      amount *= 100000; // 1 lakh = 100 thousand
    }
    
    return amount;
  }

  // Save alert rule to database (implement based on your database)
  async saveAlertRule(rule) {
    // This would save to your database
    // For now, we'll just log it
    console.log(`Saving alert rule: ${rule.id}`);
  }

  // Remove alert rule from database
  async removeAlertRule(alertId) {
    // This would remove from your database
    console.log(`Removing alert rule: ${alertId}`);
  }

  // Get alert history
  async getAlertHistory(userId, limit = 50) {
    // This would fetch from database
    // For now, return mock data
    return {
      user_id: userId,
      alerts: [],
      total: 0,
      limit
    };
  }

  // Get alert statistics
  async getAlertStats(userId) {
    const userAlerts = await this.getUserAlerts(userId);
    
    return {
      total_alerts: userAlerts.length,
      active_alerts: userAlerts.filter(a => a.is_active).length,
      total_triggers: userAlerts.reduce((sum, a) => sum + a.trigger_count, 0),
      last_trigger: userAlerts.reduce((latest, a) => {
        if (!a.last_triggered) return latest;
        return !latest || a.last_triggered > latest ? a.last_triggered : latest;
      }, null)
    };
  }
}

module.exports = new AlertService();