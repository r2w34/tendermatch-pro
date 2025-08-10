import React, { useState, useMemo } from 'react';
import { Grid, List } from 'lucide-react';
import TenderCard from './TenderCard';
import TenderModal from './TenderModal';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

const TenderList = ({ tenders, filters, isLoading, onSaveToFavorites, favorites = [] }) => {
  const [selectedTender, setSelectedTender] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter and sort tenders
  const filteredTenders = useMemo(() => {
    let filtered = [...tenders];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(tender =>
        tender.title.toLowerCase().includes(query) ||
        tender.description.toLowerCase().includes(query) ||
        tender.department.toLowerCase().includes(query) ||
        tender.category.toLowerCase().includes(query)
      );
    }

    // Apply state filter
    if (filters.state) {
      filtered = filtered.filter(tender => tender.state === filters.state);
    }

    // Apply city filter
    if (filters.city) {
      filtered = filtered.filter(tender =>
        tender.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Apply budget range filter
    if (filters.minBudget || filters.maxBudget) {
      filtered = filtered.filter(tender =>
        tender.budget >= (filters.minBudget || 0) &&
        tender.budget <= (filters.maxBudget || 100000000)
      );
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(tender =>
        filters.categories.includes(tender.category)
      );
    }

    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(tender => tender.department === filters.department);
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(tender =>
        new Date(tender.publishedDate) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(tender =>
        new Date(tender.deadline) <= new Date(filters.endDate)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      case 'budget-high':
        filtered.sort((a, b) => b.budget - a.budget);
        break;
      case 'budget-low':
        filtered.sort((a, b) => a.budget - b.budget);
        break;
      default:
        break;
    }

    return filtered;
  }, [tenders, filters]);

  const handleViewDetails = (tender) => {
    setSelectedTender(tender);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTender(null);
  };

  const getGridColumns = () => {
    return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading tenders..." />;
  }

  return (
    <div className="flex-1">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Government Tenders
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredTenders.length} tender{filteredTenders.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredTenders.length === 0 ? (
        <EmptyState
          type="search"
          actionText="Clear all filters"
          onAction={() => {/* Handle clear filters */}}
        />
      ) : (
        <div className={`grid ${getGridColumns()} gap-6`}>
          {filteredTenders.map((tender) => (
            <TenderCard
              key={tender.id}
              tender={tender}
              onViewDetails={handleViewDetails}
              onSaveToFavorites={onSaveToFavorites}
              isFavorite={favorites.includes(tender.id)}
            />
          ))}
        </div>
      )}

      {/* Load More Button (for pagination in future) */}
      {filteredTenders.length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition-colors duration-200">
            Load More Tenders
          </button>
        </div>
      )}

      {/* Tender Detail Modal */}
      <TenderModal
        tender={selectedTender}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSaveToFavorites={onSaveToFavorites}
        isFavorite={selectedTender && favorites.includes(selectedTender.id)}
      />
    </div>
  );
};

export default TenderList;