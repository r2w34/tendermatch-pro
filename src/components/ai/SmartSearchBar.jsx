import React, { useState, useRef, useEffect } from 'react';
import apiService from '../../services/api';

const SmartSearchBar = ({ onSearch, onResults }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('tender_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate AI suggestions based on input
  const generateSuggestions = async (input) => {
    if (!input.trim() || input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      // AI-powered suggestions
      const aiSuggestions = [
        `${input} in IT sector`,
        `${input} for government departments`,
        `${input} with budget above 10 lakhs`,
        `${input} in Delhi NCR`,
        `${input} closing this month`
      ];

      // Add search history matches
      const historyMatches = searchHistory
        .filter(item => item.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 3);

      // Combine suggestions
      const allSuggestions = [
        ...historyMatches.map(item => ({ text: item, type: 'history' })),
        ...aiSuggestions.map(item => ({ text: item, type: 'ai' }))
      ].slice(0, 8);

      setSuggestions(allSuggestions);
    } catch (error) {
      console.warn('Failed to generate AI suggestions:', error);
      // Fallback to basic suggestions
      setSuggestions([
        { text: `${input} tenders`, type: 'basic' },
        { text: `${input} in government`, type: 'basic' }
      ]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      generateSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('tender_search_history', JSON.stringify(newHistory));

      // Perform search
      const response = await apiService.smartSearch({
        query: searchQuery,
        use_ai: isAIEnabled,
        limit: 20
      });

      onResults(response.data);
      onSearch(searchQuery);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to basic search
      onSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('tender_search_history');
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'history': return '🕒';
      case 'ai': return '🤖';
      default: return '🔍';
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          placeholder="Search tenders with natural language (e.g., 'IT equipment for schools in Delhi')"
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />

        {/* AI Toggle & Search Button */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-2">
          <button
            onClick={() => setIsAIEnabled(!isAIEnabled)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              isAIEnabled 
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isAIEnabled ? 'AI Search Enabled' : 'Basic Search'}
          >
            {isAIEnabled ? '🤖 AI' : '🔍 Basic'}
          </button>
          
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
              <div className="flex-1">
                <div className="text-gray-900">{suggestion.text}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {suggestion.type === 'history' ? 'Recent search' : 
                   suggestion.type === 'ai' ? 'AI suggestion' : 'Search suggestion'}
                </div>
              </div>
            </button>
          ))}
          
          {/* Clear History Option */}
          {searchHistory.length > 0 && (
            <div className="border-t border-gray-200 p-2">
              <button
                onClick={clearHistory}
                className="w-full px-2 py-1 text-xs text-gray-500 hover:text-gray-700 text-center"
              >
                Clear search history
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!query && (
        <div className="mt-2 text-sm text-gray-500">
          <div className="flex flex-wrap gap-2">
            <span className="font-medium">Try:</span>
            {[
              'IT equipment for schools',
              'Construction projects in Mumbai',
              'Medical supplies under 50 lakhs',
              'Software development tenders'
            ].map((tip, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(tip);
                  handleSearch(tip);
                }}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
              >
                {tip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Status Indicator */}
      {isAIEnabled && (
        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>AI-powered semantic search enabled</span>
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;