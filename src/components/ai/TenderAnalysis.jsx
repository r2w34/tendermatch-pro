import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const TenderAnalysis = ({ tenderId, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tenderId) {
      analyzeTender();
    }
  }, [tenderId]);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const analyzeTender = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.analyzeTender(tenderId);
      setAnalysis(response.data.analysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze tender');
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Analyzing tender with AI...</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={analyzeTender}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <h2 className="text-xl font-semibold text-gray-900">AI Tender Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Executive Summary</h3>
            <p className="text-blue-800">{analysis?.summary}</p>
          </div>

          {/* Complexity & Timeline */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Complexity</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analysis?.estimated_complexity)}`}>
                {analysis?.estimated_complexity}
              </span>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Team Size</h4>
              <span className="text-2xl font-bold text-blue-600">
                {analysis?.recommended_team_size}
              </span>
              <span className="text-gray-500 ml-1">members</span>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
              <span className="text-lg font-semibold text-green-600">
                {analysis?.estimated_timeline}
              </span>
            </div>
          </div>

          {/* Key Requirements */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">✅ Key Requirements</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {analysis?.key_requirements?.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span className="text-gray-700">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required Expertise */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">🎯 Required Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {analysis?.required_expertise?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Challenges & Success Factors */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-3">⚠️ Potential Challenges</h3>
              <ul className="space-y-2">
                {analysis?.potential_challenges?.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-red-800 text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">🎯 Success Factors</h3>
              <ul className="space-y-2">
                {analysis?.success_factors?.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-green-800 text-sm">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risk Factors */}
          {analysis?.risk_factors && analysis.risk_factors.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-3">🚨 Risk Factors</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {analysis.risk_factors.map((risk, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span className="text-orange-800 text-sm">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => window.open(`/tenders/${tenderId}`, '_blank')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Full Tender
            </button>
            <button
              onClick={analyzeTender}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Re-analyze
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderAnalysis;