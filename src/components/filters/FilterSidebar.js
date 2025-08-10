import React, { useState } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { indianStates, departments, categories } from '../../data/mockData';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    budget: true,
    category: true,
    department: true,
    dates: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleCheckboxChange = (field, value, checked) => {
    const currentValues = filters[field] || [];
    if (checked) {
      onFilterChange({ ...filters, [field]: [...currentValues, value] });
    } else {
      onFilterChange({ ...filters, [field]: currentValues.filter(v => v !== value) });
    }
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      state: '',
      city: '',
      minBudget: 0,
      maxBudget: 100000000,
      categories: [],
      department: '',
      startDate: '',
      endDate: '',
      sortBy: 'latest'
    });
  };

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-blue-600"
      >
        <span>{title}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isExpanded && <div className="mt-3">{children}</div>}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:shadow-none lg:border-r lg:border-gray-200
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 h-full overflow-y-auto">
          {/* Header for desktop */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Filter size={20} className="text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Keywords
            </label>
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={(e) => handleInputChange('searchQuery', e.target.value)}
              placeholder="Enter keywords..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location Filters */}
          <FilterSection
            title="Location"
            isExpanded={expandedSections.location}
            onToggle={() => toggleSection('location')}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={filters.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All States</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </FilterSection>

          {/* Budget Range */}
          <FilterSection
            title="Budget Range"
            isExpanded={expandedSections.budget}
            onToggle={() => toggleSection('budget')}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Budget (₹)
                </label>
                <input
                  type="number"
                  value={filters.minBudget || 0}
                  onChange={(e) => handleInputChange('minBudget', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Budget (₹)
                </label>
                <input
                  type="number"
                  value={filters.maxBudget || 100000000}
                  onChange={(e) => handleInputChange('maxBudget', parseInt(e.target.value) || 100000000)}
                  placeholder="10,00,00,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </FilterSection>

          {/* Categories */}
          <FilterSection
            title="Categories"
            isExpanded={expandedSections.category}
            onToggle={() => toggleSection('category')}
          >
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.categories || []).includes(category)}
                    onChange={(e) => handleCheckboxChange('categories', category, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Department */}
          <FilterSection
            title="Department"
            isExpanded={expandedSections.department}
            onToggle={() => toggleSection('department')}
          >
            <select
              value={filters.department || ''}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </FilterSection>

          {/* Date Range */}
          <FilterSection
            title="Date Range"
            isExpanded={expandedSections.dates}
            onToggle={() => toggleSection('dates')}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </FilterSection>

          {/* Sort By */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'latest'}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="latest">Latest First</option>
              <option value="deadline">Deadline (Earliest)</option>
              <option value="budget-high">Budget (High to Low)</option>
              <option value="budget-low">Budget (Low to High)</option>
            </select>
          </div>

          {/* Clear All Button for Mobile */}
          <div className="lg:hidden">
            <button
              onClick={clearAllFilters}
              className="w-full py-2 px-4 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;