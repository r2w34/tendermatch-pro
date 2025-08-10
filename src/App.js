import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FilterSidebar from './components/filters/FilterSidebar';
import TenderList from './components/tenders/TenderList';
import { mockTenders } from './data/mockData';
import './styles/globals.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tenders, setTenders] = useState([]);
  const [favorites, setFavorites] = useState([]);
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



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header 
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <TenderList
              tenders={tenders}
              filters={filters}
              isLoading={isLoading}
              onSaveToFavorites={handleSaveToFavorites}
              favorites={favorites}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

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
