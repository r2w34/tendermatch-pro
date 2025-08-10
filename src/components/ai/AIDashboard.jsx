import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const AIDashboard = ({ isOpen, onClose }) => {
  const [insights, setInsights] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [insightsResponse, usageResponse] = await Promise.all([
        apiService.getDashboardInsights(),
        apiService.getUsageStats()
      ]);
      
      setInsights(insightsResponse.data);
      setUsageStats(usageResponse.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Insights</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <h2 className="text-xl font-semibold text-gray-900">AI Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-colors"
            type="button"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">🤖</div>
          <div>
            <h2 className="text-2xl font-bold">AI Dashboard</h2>
            <p className="text-blue-100">Personalized tender insights powered by AI</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{insights?.high_match_count || 0}</div>
            <div className="text-sm text-blue-100">High Matches</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{usageStats?.monthly_analyses || 0}</div>
            <div className="text-sm text-blue-100">Analyses This Month</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{usageStats?.searches_performed || 0}</div>
            <div className="text-sm text-blue-100">Smart Searches</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{usageStats?.documents_analyzed || 0}</div>
            <div className="text-sm text-blue-100">Documents Analyzed</div>
          </div>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Monthly Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">AI Analyses</span>
              <span className="text-gray-900">
                {usageStats?.monthly_analyses || 0} / {usageStats?.monthly_limit || 100}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, ((usageStats?.monthly_analyses || 0) / (usageStats?.monthly_limit || 100)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subscription Tier</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
              {usageStats?.subscription_tier || 'Basic'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Matching Tenders */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🎯 Top Matching Tenders</h3>
          <button
            onClick={loadDashboardData}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        {insights?.insights && insights.insights.length > 0 ? (
          <div className="space-y-4">
            {insights.insights.map((insight, index) => (
              <div key={insight.tender_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {insight.tender_title}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(insight.match_score)}`}>
                        {insight.match_score}% Match
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(insight.recommendation)}`}>
                        {insight.recommendation} Probability
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                </div>

                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Matching Factors:</h5>
                  <div className="flex flex-wrap gap-2">
                    {insight.key_factors?.map((factor, factorIndex) => (
                      <span
                        key={factorIndex}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`/tenders/${insight.tender_id}`, '_blank')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    View Tender
                  </button>
                  <button
                    onClick={() => {/* Open AI analysis modal */}}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                  >
                    AI Analysis
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No High Matches Found</h4>
            <p className="text-gray-600 mb-4">
              We haven't found any tenders with high match scores for your profile yet.
            </p>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Check for New Matches
            </button>
          </div>
        )}
      </div>

      {/* AI Features Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🔍</div>
            <h3 className="font-semibold text-gray-900">Smart Search</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Use natural language to find relevant tenders with AI-powered semantic search.
          </p>
          <div className="text-sm text-blue-600">
            {usageStats?.searches_performed || 0} searches performed
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">📄</div>
            <h3 className="font-semibold text-gray-900">Document Analysis</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Upload tender documents for AI-powered analysis and key information extraction.
          </p>
          <div className="text-sm text-blue-600">
            {usageStats?.documents_analyzed || 0} documents analyzed
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🤝</div>
            <h3 className="font-semibold text-gray-900">Bid Assistant</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Get AI-generated bid preparation guidance and proposal outlines.
          </p>
          <div className="text-sm text-blue-600">
            {usageStats?.bid_assistance_generated || 0} guides generated
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent AI Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Last analysis:</span>
            <span className="text-gray-900">
              {usageStats?.last_activity ? new Date(usageStats.last_activity).toLocaleDateString() : 'No recent activity'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">AI features status:</span>
            <span className="text-green-600 font-medium">Active</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Next analysis refresh:</span>
            <span className="text-gray-900">In 2 hours</span>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;