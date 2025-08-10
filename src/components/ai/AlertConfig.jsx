import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const AlertConfig = ({ onClose, editAlert = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    keywords: [],
    categories: [],
    departments: [],
    states: [],
    budget_min: 0,
    budget_max: 10000000,
    match_threshold: 70,
    notification_methods: ['email'],
    is_active: true
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const categories = ['IT Equipment', 'Construction', 'Consultancy', 'Services', 'Medical', 'Education', 'Transport'];
  const departments = ['Education', 'Health', 'Transport', 'IT', 'Defense', 'Agriculture', 'Urban Development'];
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi'
  ];

  useEffect(() => {
    if (editAlert) {
      setFormData({
        name: editAlert.name || '',
        keywords: editAlert.criteria?.keywords || [],
        categories: editAlert.criteria?.categories || [],
        departments: editAlert.criteria?.departments || [],
        states: editAlert.criteria?.states || [],
        budget_min: editAlert.criteria?.budget_min || 0,
        budget_max: editAlert.criteria?.budget_max || 10000000,
        match_threshold: editAlert.criteria?.match_threshold || 70,
        notification_methods: editAlert.notification_methods || ['email'],
        is_active: editAlert.is_active !== false
      });
    }
  }, [editAlert]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Alert name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editAlert) {
        await apiService.updateAlert(editAlert.id, formData);
      } else {
        await apiService.configureAlert(formData);
      }
      onClose(true); // true indicates success
    } catch (err) {
      setError(err.message || 'Failed to save alert');
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
    return `₹${amount}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose(false);
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚨</div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editAlert ? 'Edit Alert' : 'Configure New Alert'}
            </h2>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-colors"
            type="button"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form id="alert-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Alert Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., IT Equipment Tenders in Delhi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder="Add keyword and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleArrayToggle('categories', category)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departments
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {departments.map((department) => (
                <label key={department} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.departments.includes(department)}
                    onChange={() => handleArrayToggle('departments', department)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{department}</span>
                </label>
              ))}
            </div>
          </div>

          {/* States */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              States
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {states.map((state) => (
                <label key={state} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.states.includes(state)}
                    onChange={() => handleArrayToggle('states', state)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{state}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={formData.budget_min}
                  onChange={(e) => handleInputChange('budget_min', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {formatBudget(formData.budget_min)}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={formData.budget_max}
                  onChange={(e) => handleInputChange('budget_max', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {formatBudget(formData.budget_max)}
                </div>
              </div>
            </div>
          </div>

          {/* AI Match Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Match Threshold: {formData.match_threshold}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.match_threshold}
              onChange={(e) => handleInputChange('match_threshold', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Any Match</span>
              <span>Perfect Match</span>
            </div>
          </div>

          {/* Notification Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Methods
            </label>
            <div className="space-y-2">
              {[
                { value: 'email', label: 'Email', icon: '📧' },
                { value: 'sms', label: 'SMS', icon: '📱' },
                { value: 'push', label: 'Push Notification', icon: '🔔' }
              ].map((method) => (
                <label key={method.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.notification_methods.includes(method.value)}
                    onChange={() => handleArrayToggle('notification_methods', method.value)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg">{method.icon}</span>
                  <span className="text-sm text-gray-700">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Alert is active
            </label>
          </div>

          </form>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="flex-shrink-0 bg-white border-t px-6 py-4">
          <div className="flex gap-3">
            <button
              type="submit"
              form="alert-form"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-white">{editAlert ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <span className="text-white">{editAlert ? 'Update Alert' : 'Create Alert'}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex-shrink-0 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertConfig;