import React, { useState, useEffect } from 'react';

const AnalyticsDashboard = ({ tenders }) => {
  const [analytics, setAnalytics] = useState({
    stateDistribution: [],
    budgetDistribution: [],
    categoryBreakdown: [],
    trendingKeywords: [],
    successPredictions: [],
    competitorAnalysis: []
  });

  useEffect(() => {
    if (tenders && tenders.length > 0) {
      calculateAnalytics();
    }
  }, [tenders]);

  const calculateAnalytics = () => {
    // State Distribution
    const stateCount = {};
    tenders.forEach(tender => {
      const state = tender.location?.state || 'Unknown';
      stateCount[state] = (stateCount[state] || 0) + 1;
    });

    const stateDistribution = Object.entries(stateCount)
      .map(([state, count]) => ({ state, count, percentage: (count / tenders.length * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Budget Distribution
    const budgetRanges = [
      { range: '< ₹10L', min: 0, max: 1000000 },
      { range: '₹10L - ₹1Cr', min: 1000000, max: 10000000 },
      { range: '₹1Cr - ₹10Cr', min: 10000000, max: 100000000 },
      { range: '₹10Cr - ₹50Cr', min: 100000000, max: 500000000 },
      { range: '> ₹50Cr', min: 500000000, max: Infinity }
    ];

    const budgetDistribution = budgetRanges.map(range => {
      const count = tenders.filter(tender => 
        tender.budget >= range.min && tender.budget < range.max
      ).length;
      return { ...range, count, percentage: (count / tenders.length * 100).toFixed(1) };
    });

    // Category Breakdown
    const categoryCount = {};
    tenders.forEach(tender => {
      const category = tender.category || 'Others';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count, percentage: (count / tenders.length * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    // Trending Keywords (mock implementation)
    const trendingKeywords = [
      { keyword: 'Digital Transformation', count: 45, trend: '+15%' },
      { keyword: 'Cloud Services', count: 38, trend: '+22%' },
      { keyword: 'Cybersecurity', count: 32, trend: '+8%' },
      { keyword: 'AI/ML Solutions', count: 28, trend: '+35%' },
      { keyword: 'Mobile App Development', count: 24, trend: '+12%' },
      { keyword: 'Data Analytics', count: 21, trend: '+18%' },
      { keyword: 'IoT Implementation', count: 19, trend: '+25%' },
      { keyword: 'Blockchain', count: 15, trend: '+40%' }
    ];

    // Success Rate Predictions (mock data)
    const successPredictions = [
      { department: 'IT', successRate: 78, avgBidders: 12, competitionLevel: 'High' },
      { department: 'Health', successRate: 65, avgBidders: 8, competitionLevel: 'Medium' },
      { department: 'Education', successRate: 72, avgBidders: 10, competitionLevel: 'Medium' },
      { department: 'Transport', successRate: 58, avgBidders: 15, competitionLevel: 'High' },
      { department: 'Defense', successRate: 45, avgBidders: 20, competitionLevel: 'Very High' }
    ];

    // Competitor Analysis (mock data)
    const competitorAnalysis = [
      { company: 'TechCorp Solutions', wins: 45, totalBids: 120, winRate: 37.5, avgBidValue: '₹2.5Cr' },
      { company: 'Digital Innovations Ltd', wins: 38, totalBids: 95, winRate: 40.0, avgBidValue: '₹1.8Cr' },
      { company: 'InfoSys Public Sector', wins: 52, totalBids: 140, winRate: 37.1, avgBidValue: '₹3.2Cr' },
      { company: 'Government Solutions Inc', wins: 29, totalBids: 85, winRate: 34.1, avgBidValue: '₹1.5Cr' },
      { company: 'Smart City Technologies', wins: 33, totalBids: 78, winRate: 42.3, avgBidValue: '₹2.1Cr' }
    ];

    setAnalytics({
      stateDistribution,
      budgetDistribution,
      categoryBreakdown,
      trendingKeywords,
      successPredictions,
      competitorAnalysis
    });
  };

  const formatCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">Comprehensive insights and trends from {tenders?.length || 0} tenders</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tenders</p>
              <p className="text-2xl font-bold text-gray-900">{tenders?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(tenders?.reduce((sum, t) => sum + (t.budget || 0), 0) || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active States</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.stateDistribution.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">64%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenders by State</h3>
          <div className="space-y-3">
            {analytics.stateDistribution.map((state, index) => (
              <div key={state.state} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{state.state}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${state.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{state.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {analytics.categoryBreakdown.slice(0, 8).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Distribution</h3>
          <div className="space-y-3">
            {analytics.budgetDistribution.map((budget, index) => (
              <div key={budget.range} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{budget.range}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${budget.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{budget.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Keywords */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Keywords</h3>
          <div className="space-y-3">
            {analytics.trendingKeywords.slice(0, 8).map((keyword, index) => (
              <div key={keyword.keyword} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{keyword.keyword}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">{keyword.count}</span>
                  <span className="text-green-600 text-sm font-medium">{keyword.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Predictions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate Predictions by Department</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Bidders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.successPredictions.map((dept) => (
                <tr key={dept.department}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${dept.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{dept.successRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.avgBidders}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      dept.competitionLevel === 'Very High' ? 'bg-red-100 text-red-800' :
                      dept.competitionLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dept.competitionLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wins</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bids</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Bid Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.competitorAnalysis.map((competitor) => (
                <tr key={competitor.company}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{competitor.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{competitor.wins}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{competitor.totalBids}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${competitor.winRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{competitor.winRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{competitor.avgBidValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;