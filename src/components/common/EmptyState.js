import React from 'react';
import { Search, FileText, AlertCircle } from 'lucide-react';

const EmptyState = ({ 
  type = 'search', 
  title, 
  description, 
  actionText, 
  onAction 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search size={48} className="text-gray-400" />;
      case 'no-data':
        return <FileText size={48} className="text-gray-400" />;
      case 'error':
        return <AlertCircle size={48} className="text-gray-400" />;
      default:
        return <Search size={48} className="text-gray-400" />;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          title: 'No tenders found',
          description: 'Try adjusting your filters or search terms to find more results.'
        };
      case 'no-data':
        return {
          title: 'No data available',
          description: 'There are no items to display at the moment.'
        };
      case 'error':
        return {
          title: 'Something went wrong',
          description: 'We encountered an error while loading the data.'
        };
      default:
        return {
          title: 'No results',
          description: 'No items match your current criteria.'
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <div className="text-center py-12">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || defaultContent.title}
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {description || defaultContent.description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;