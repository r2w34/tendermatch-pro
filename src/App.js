import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FilterSidebar from './components/filters/FilterSidebar';
import TenderList from './components/tenders/TenderList';
import SmartSearchBar from './components/ai/SmartSearchBar';
import AIDashboard from './components/ai/AIDashboard';
import AlertConfig from './components/ai/AlertConfig';
import { mockTenders } from './data/mockData';
import apiService from './services/api';
import './styles/globals.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tenders, setTenders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [matchScores, setMatchScores] = useState({});
  const [showAIDashboard, setShowAIDashboard] = useState(false);
  const [showAlertConfig, setShowAlertConfig] = useState(false);
  const [filters, setFilters] = useState({
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

  // Simulate loading data
  useEffect(() => {
    const loadTenders = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTenders(mockTenders);
      setIsLoading(false);
    };

    loadTenders();
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tenderFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('tenderFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSaveToFavorites = (tenderId) => {
    setFavorites(prev => {
      if (prev.includes(tenderId)) {
        return prev.filter(id => id !== tenderId);
      } else {
        return [...prev, tenderId];
      }
    });
  };

  const handleSmartSearch = async (query) => {
    try {
      setIsLoading(true);
      const response = await apiService.smartSearch(query);
      if (response.success) {
        setTenders(response.data.tenders);
        setMatchScores(response.data.match_scores || {});
      }
    } catch (error) {
      console.error('Smart search failed:', error);
      // Fallback to regular search
      setFilters(prev => ({ ...prev, searchQuery: query }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAIDashboard = () => {
    setShowAIDashboard(true);
  };

  const handleShowAlertConfig = () => {
    setShowAlertConfig(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header 
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onShowAIDashboard={handleShowAIDashboard}
        onShowAlertConfig={handleShowAlertConfig}
      />

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Main Content Area */}
        <main className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
        }`}>
          <div className="max-w-7xl mx-auto">
            {/* Smart Search Bar */}
            <div className="mb-6">
              <SmartSearchBar onSearch={handleSmartSearch} />
            </div>

            <TenderList
              tenders={tenders}
              filters={filters}
              isLoading={isLoading}
              onSaveToFavorites={handleSaveToFavorites}
              favorites={favorites}
              matchScores={matchScores}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* AI Dashboard Modal */}
      {showAIDashboard && (
        <AIDashboard
          isOpen={showAIDashboard}
          onClose={() => setShowAIDashboard(false)}
        />
      )}

      {/* Alert Configuration Modal */}
      {showAlertConfig && (
        <AlertConfig
          onClose={(success) => {
            setShowAlertConfig(false);
            if (success) {
              // Optionally refresh alerts or show success message
              console.log('Alert configured successfully');
            }
          }}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-900">Loading TenderMatch Pro...</p>
            <p className="text-gray-600">Fetching latest government tenders</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
