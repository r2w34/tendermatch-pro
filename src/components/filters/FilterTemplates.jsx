import React, { useState, useEffect } from 'react';

const FilterTemplates = ({ onApplyTemplate, currentFilters }) => {
  const [templates, setTemplates] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Predefined quick filter templates
  const quickFilters = [
    {
      id: 'it-tenders',
      name: 'IT Tenders',
      icon: '💻',
      filters: {
        categories: ['IT Equipment', 'Software Development'],
        budgetRange: [0, 10000000]
      }
    },
    {
      id: 'construction-high',
      name: 'Construction >₹1Cr',
      icon: '🏗️',
      filters: {
        categories: ['Construction'],
        budgetRange: [10000000, 100000000]
      }
    },
    {
      id: 'closing-soon',
      name: 'Closing in 7 days',
      icon: '⏰',
      filters: {
        deadlineRange: 7
      }
    },
    {
      id: 'medical-equipment',
      name: 'Medical Equipment',
      icon: '🏥',
      filters: {
        categories: ['Medical Equipment'],
        departments: ['Health']
      }
    },
    {
      id: 'high-budget',
      name: 'High Budget (>₹5Cr)',
      icon: '💰',
      filters: {
        budgetRange: [50000000, 1000000000]
      }
    }
  ];

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = () => {
    const saved = localStorage.getItem('filterTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) return;

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
      filters: currentFilters,
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('filterTemplates', JSON.stringify(updatedTemplates));
    
    setShowSaveModal(false);
    setTemplateName('');
  };

  const deleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('filterTemplates', JSON.stringify(updatedTemplates));
  };

  const hasActiveFilters = () => {
    return Object.keys(currentFilters).some(key => {
      const value = currentFilters[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== null && value !== undefined;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Filters</h3>
        {hasActiveFilters() && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Current Filters
          </button>
        )}
      </div>

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onApplyTemplate(filter.filters)}
            className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            <span className="mr-2">{filter.icon}</span>
            {filter.name}
          </button>
        ))}
      </div>

      {/* Saved Templates */}
      {templates.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-2">Saved Templates</h4>
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <button
                  onClick={() => onApplyTemplate(template.filters)}
                  className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {template.name}
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="ml-2 text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Save Filter Template</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={!templateName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterTemplates;