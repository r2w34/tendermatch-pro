import React from 'react';
import { Calendar, MapPin, Building, Clock, Heart, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDate, calculateDaysLeft, getStatusColor, getCategoryColor, truncateText } from '../../utils/formatters';

const TenderCard = ({ tender, onViewDetails, onSaveToFavorites, isFavorite }) => {
  const statusColor = getStatusColor(tender.status);
  const categoryColor = getCategoryColor(tender.category);
  const daysLeft = calculateDaysLeft(tender.deadline);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {tender.id}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                {tender.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
              {truncateText(tender.title, 100)}
            </h3>
          </div>
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
        </div>

        {/* Department and Category */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Building size={16} className="mr-1" />
            <span className="truncate">{tender.department}</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${categoryColor}`}>
            {tender.category}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin size={16} className="mr-1 flex-shrink-0" />
          <span>{tender.city}, {tender.state}</span>
        </div>

        {/* Budget */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(tender.budget)}
          </div>
          <div className="text-sm text-gray-500">Estimated Budget</div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Published</div>
            <div className="flex items-center text-gray-700">
              <Calendar size={14} className="mr-1" />
              {formatDate(tender.publishedDate)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Deadline</div>
            <div className="flex items-center text-gray-700">
              <Clock size={14} className="mr-1" />
              {formatDate(tender.deadline)}
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="mb-4">
          <div className={`text-sm font-medium ${
            daysLeft === 'Expired' ? 'text-red-600' :
            daysLeft.includes('1 day') || daysLeft === 'Today' ? 'text-orange-600' :
            'text-blue-600'
          }`}>
            {daysLeft}
          </div>
        </div>

        {/* Description Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {truncateText(tender.description, 120)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(tender)}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <ExternalLink size={16} className="mr-2" />
            View Details
          </button>
          <button className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition-colors duration-200">
            Apply
          </button>
        </div>
      </div>

      {/* Status indicator bar */}
      <div className={`h-1 ${
        tender.status === 'Active' ? 'bg-green-500' :
        tender.status === 'Closing Soon' ? 'bg-orange-500' :
        'bg-red-500'
      }`} />
    </div>
  );
};

export default TenderCard;