import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Building, Clock, Heart, Download, ExternalLink, FileText } from 'lucide-react';
import { formatCurrency, formatDate, calculateDaysLeft, getStatusColor, getCategoryColor } from '../../utils/formatters';

const TenderModal = ({ tender, isOpen, onClose, onSaveToFavorites, isFavorite }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tender) return null;

  const statusColor = getStatusColor(tender.status);
  const categoryColor = getCategoryColor(tender.category);
  const daysLeft = calculateDaysLeft(tender.deadline);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {tender.id}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                {tender.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${categoryColor}`}>
                {tender.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{tender.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveToFavorites(tender.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-600 mb-2">
                  <Building size={16} className="mr-2" />
                  <span className="text-sm font-medium">Department</span>
                </div>
                <div className="text-gray-900 font-semibold">{tender.department}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-2" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <div className="text-gray-900 font-semibold">{tender.city}, {tender.state}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-600 mb-2">Budget</div>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(tender.budget)}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center text-blue-600 mb-2">
                  <Clock size={16} className="mr-2" />
                  <span className="text-sm font-medium">Time Left</span>
                </div>
                <div className={`font-bold ${
                  daysLeft === 'Expired' ? 'text-red-600' :
                  daysLeft.includes('1 day') || daysLeft === 'Today' ? 'text-orange-600' :
                  'text-blue-600'
                }`}>
                  {daysLeft}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{tender.description}</p>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Criteria</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-gray-700">{tender.eligibility}</p>
              </div>
            </div>

            {/* Important Dates */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Event</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(tender.importantDates).map(([event, date]) => (
                      <tr key={event} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{event}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 flex items-center">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Documents */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tender.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <FileText size={16} className="text-gray-500 mr-3" />
                      <span className="text-sm text-gray-700">{doc}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 p-1">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition-colors duration-200"
            >
              Close
            </button>
            <button 
              onClick={() => onSaveToFavorites(tender.id)}
              className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center ${
                isFavorite 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              <Heart size={16} className="mr-2" fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
            </button>
            <button className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
              <ExternalLink size={16} className="mr-2" />
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderModal;