import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const BidAssistant = ({ tenderId, onClose }) => {
  const [assistance, setAssistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('outline');
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (tenderId) {
      generateAssistance();
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

  const generateAssistance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.generateBidAssistance(tenderId);
      setAssistance(response.data.assistance);
    } catch (err) {
      setError(err.message || 'Failed to generate bid assistance');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistToggle = (section, index) => {
    const key = `${section}_${index}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCompletionPercentage = (section) => {
    if (!assistance?.[section] || !Array.isArray(assistance[section])) return 0;
    
    const total = assistance[section].length;
    const completed = assistance[section].filter((_, index) => 
      checkedItems[`${section}_${index}`]
    ).length;
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const tabs = [
    { id: 'outline', label: 'Proposal Outline', icon: '📋' },
    { id: 'checklist', label: 'Document Checklist', icon: '✅' },
    { id: 'strategy', label: 'Pricing Strategy', icon: '💰' },
    { id: 'advantages', label: 'Competitive Edge', icon: '🎯' },
    { id: 'timeline', label: 'Timeline', icon: '⏰' },
    { id: 'compliance', label: 'Compliance', icon: '📜' }
  ];

  if (loading) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]"
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
            <p className="mt-4 text-gray-600">Generating bid assistance...</p>
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={generateAssistance}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <h2 className="text-xl font-semibold text-gray-900">AI Bid Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Proposal Outline */}
          {activeTab === 'outline' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Proposal Structure</h3>
                <div className="text-blue-800 whitespace-pre-line">
                  {assistance?.proposal_outline}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Key Points to Address</h3>
                <div className="space-y-2">
                  {assistance?.key_points_to_address?.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-green-900">📄 Document Checklist</h3>
                  <div className="text-sm text-green-700">
                    {getCompletionPercentage('document_checklist')}% Complete
                  </div>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionPercentage('document_checklist')}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                {assistance?.document_checklist?.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <input
                      type="checkbox"
                      checked={checkedItems[`document_checklist_${index}`] || false}
                      onChange={() => handleChecklistToggle('document_checklist', index)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`flex-1 ${
                      checkedItems[`document_checklist_${index}`] 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}>
                      {doc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Strategy */}
          {activeTab === 'strategy' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">💰 Pricing Strategy</h3>
                <div className="text-yellow-800 whitespace-pre-line">
                  {assistance?.pricing_strategy}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">⚠️ Risk Mitigation</h3>
                <div className="space-y-2">
                  {assistance?.risk_mitigation?.map((risk, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-orange-500 mt-1">•</span>
                      <span className="text-gray-700">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Competitive Advantages */}
          {activeTab === 'advantages' && (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">🎯 Competitive Advantages</h3>
                <div className="space-y-2">
                  {assistance?.competitive_advantages?.map((advantage, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span className="text-purple-800">{advantage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">👥 Team Composition</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {assistance?.team_composition}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">⏰ Timeline Suggestions</h3>
                <div className="text-indigo-800 whitespace-pre-line">
                  {assistance?.timeline_suggestions}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">💡 Submission Tips</h3>
                <div className="space-y-2">
                  {assistance?.submission_tips?.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">💡</span>
                      <span className="text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compliance */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-red-900">📜 Compliance Checklist</h3>
                  <div className="text-sm text-red-700">
                    {getCompletionPercentage('compliance_checklist')}% Complete
                  </div>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionPercentage('compliance_checklist')}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                {assistance?.compliance_checklist?.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <input
                      type="checkbox"
                      checked={checkedItems[`compliance_checklist_${index}`] || false}
                      onChange={() => handleChecklistToggle('compliance_checklist', index)}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className={`flex-1 ${
                      checkedItems[`compliance_checklist_${index}`] 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            📄 Print Guide
          </button>
          <button
            onClick={generateAssistance}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Regenerate
          </button>
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidAssistant;