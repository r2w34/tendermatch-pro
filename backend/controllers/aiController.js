const aiService = require('../services/aiService');
const Tender = require('../models/Tender');
const User = require('../models/User');

class AIController {
  // Analyze tender with AI
  async analyzeTender(req, res) {
    try {
      const { id } = req.params;
      const tender = await Tender.findById(id);
      
      if (!tender) {
        return res.status(404).json({
          success: false,
          message: 'Tender not found'
        });
      }

      const analysis = await aiService.analyzeTender(tender);
      
      res.json({
        success: true,
        data: {
          tender_id: id,
          analysis,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('AI Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze tender',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Match tender to user profile
  async matchTender(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const tender = await Tender.findById(id);
      const user = await User.findById(userId);
      
      if (!tender) {
        return res.status(404).json({
          success: false,
          message: 'Tender not found'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const matching = await aiService.matchTenderToProfile(user, tender);
      
      res.json({
        success: true,
        data: {
          tender_id: id,
          user_id: userId,
          matching,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('AI Matching Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to match tender',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Analyze uploaded document
  async analyzeDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document uploaded'
        });
      }

      const analysis = await aiService.analyzeDocument(req.file.buffer, req.file.originalname);
      
      res.json({
        success: true,
        data: {
          filename: req.file.originalname,
          analysis,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Document Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze document',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Generate bid assistance
  async generateBidAssistance(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const tender = await Tender.findById(id);
      const user = await User.findById(userId);
      
      if (!tender || !user) {
        return res.status(404).json({
          success: false,
          message: 'Tender or user not found'
        });
      }

      const assistance = await aiService.generateBidAssistance(tender, user);
      
      res.json({
        success: true,
        data: {
          tender_id: id,
          user_id: userId,
          assistance,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Bid Assistance Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate bid assistance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Smart search with AI
  async smartSearch(req, res) {
    try {
      const { query, filters = {}, use_ai = true, limit = 10 } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      // Get tenders based on filters
      let tenders = await Tender.findAll(filters);
      
      let results;
      if (use_ai) {
        results = await aiService.semanticSearch(query, tenders, limit);
      } else {
        // Fallback to basic search
        results = aiService.fallbackSearch(query, tenders, limit);
      }
      
      res.json({
        success: true,
        data: {
          query,
          total_results: results.length,
          results,
          search_type: use_ai ? 'semantic' : 'basic',
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Smart Search Error:', error);
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get AI insights for dashboard
  async getDashboardInsights(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      // Get recent tenders
      const recentTenders = await Tender.findAll({ 
        limit: 10, 
        sort: 'published_date',
        order: 'DESC' 
      });

      // Generate insights for top matching tenders
      const insights = [];
      for (const tender of recentTenders.slice(0, 5)) {
        try {
          const matching = await aiService.matchTenderToProfile(user, tender);
          if (matching.match_score > 60) {
            insights.push({
              tender_id: tender.id,
              tender_title: tender.title,
              match_score: matching.match_score,
              key_factors: matching.matching_factors.slice(0, 3),
              recommendation: matching.bid_probability
            });
          }
        } catch (error) {
          console.warn(`Failed to analyze tender ${tender.id}:`, error.message);
        }
      }

      res.json({
        success: true,
        data: {
          user_id: userId,
          insights: insights.sort((a, b) => b.match_score - a.match_score),
          total_analyzed: recentTenders.length,
          high_match_count: insights.length,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Dashboard Insights Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate insights',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Batch analyze multiple tenders
  async batchAnalyze(req, res) {
    try {
      const { tender_ids } = req.body;
      
      if (!Array.isArray(tender_ids) || tender_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'tender_ids array is required'
        });
      }

      if (tender_ids.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 tenders can be analyzed at once'
        });
      }

      const results = [];
      const errors = [];

      for (const tenderId of tender_ids) {
        try {
          const tender = await Tender.findById(tenderId);
          if (tender) {
            const analysis = await aiService.analyzeTender(tender);
            results.push({
              tender_id: tenderId,
              analysis,
              status: 'success'
            });
          } else {
            errors.push({
              tender_id: tenderId,
              error: 'Tender not found'
            });
          }
        } catch (error) {
          errors.push({
            tender_id: tenderId,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        data: {
          results,
          errors,
          total_requested: tender_ids.length,
          successful: results.length,
          failed: errors.length,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Batch Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: 'Batch analysis failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // AI health check
  async healthCheck(req, res) {
    try {
      const health = await aiService.healthCheck();
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'AI service health check failed',
        error: error.message
      });
    }
  }

  // Get AI usage statistics
  async getUsageStats(req, res) {
    try {
      const userId = req.user.id;
      
      // This would typically come from a usage tracking system
      const stats = {
        user_id: userId,
        monthly_analyses: 45,
        monthly_limit: 100,
        searches_performed: 23,
        documents_analyzed: 8,
        bid_assistance_generated: 12,
        last_activity: new Date().toISOString(),
        subscription_tier: 'premium'
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Usage Stats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get usage statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new AIController();