export const formatCurrency = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const calculateDaysLeft = (deadlineString) => {
  const deadline = new Date(deadlineString);
  const today = new Date();
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day left';
  return `${diffDays} days left`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Closing Soon':
      return 'bg-orange-100 text-orange-800';
    case 'Closed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getCategoryColor = (category) => {
  const colors = {
    'IT Equipment': 'bg-blue-100 text-blue-800',
    'Construction': 'bg-yellow-100 text-yellow-800',
    'Consultancy Services': 'bg-purple-100 text-purple-800',
    'Medical Equipment': 'bg-red-100 text-red-800',
    'Office Supplies': 'bg-gray-100 text-gray-800',
    'Transportation': 'bg-green-100 text-green-800',
    'Infrastructure': 'bg-indigo-100 text-indigo-800',
    'Software Development': 'bg-cyan-100 text-cyan-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};