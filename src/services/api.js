// API service for TenderMatch Pro
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.data.accessToken) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.success && response.data.accessToken) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.post('/auth/refresh', { refreshToken });
    if (response.success && response.data.accessToken) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  }

  // Tender methods
  async getTenders(filters = {}) {
    return this.get('/tenders', filters);
  }

  async getTender(id) {
    return this.get(`/tenders/${id}`);
  }

  async searchTenders(query, filters = {}) {
    return this.get('/tenders/search', { q: query, ...filters });
  }

  async getTenderStats() {
    return this.get('/tenders/stats');
  }

  async getTrendingTenders() {
    return this.get('/tenders/trending');
  }

  async getClosingSoonTenders() {
    return this.get('/tenders/closing-soon');
  }

  async getTendersByCategory(category, filters = {}) {
    return this.get(`/tenders/category/${category}`, filters);
  }

  async getTendersByState(state, filters = {}) {
    return this.get(`/tenders/state/${state}`, filters);
  }

  // Favorites methods
  async getFavorites(page = 1, limit = 20) {
    return this.get('/tenders/user/favorites', { page, limit });
  }

  async addToFavorites(tenderId) {
    return this.post(`/tenders/${tenderId}/favorite`);
  }

  async removeFromFavorites(tenderId) {
    return this.delete(`/tenders/${tenderId}/favorite`);
  }

  // User profile methods
  async getProfile() {
    return this.get('/auth/profile');
  }

  async updateProfile(userData) {
    return this.put('/auth/profile', userData);
  }

  async changePassword(passwordData) {
    return this.post('/auth/change-password', passwordData);
  }

  // Saved searches methods
  async getSavedSearches(page = 1, limit = 20) {
    return this.get('/saved-searches', { page, limit });
  }

  async createSavedSearch(searchData) {
    return this.post('/saved-searches', searchData);
  }

  async getSavedSearch(id) {
    return this.get(`/saved-searches/${id}`);
  }

  async updateSavedSearch(id, searchData) {
    return this.put(`/saved-searches/${id}`, searchData);
  }

  async deleteSavedSearch(id) {
    return this.delete(`/saved-searches/${id}`);
  }

  async executeSavedSearch(id, page = 1, limit = 20) {
    return this.get(`/saved-searches/${id}/execute`, { page, limit });
  }

  async toggleSearchAlert(id) {
    return this.post(`/saved-searches/${id}/toggle-alert`);
  }

  // Admin methods
  async createTender(tenderData) {
    return this.post('/tenders', tenderData);
  }

  async updateTender(id, tenderData) {
    return this.put(`/tenders/${id}`, tenderData);
  }

  async deleteTender(id) {
    return this.delete(`/tenders/${id}`);
  }

  async getUsers(page = 1, limit = 20) {
    return this.get('/auth/users', { page, limit });
  }

  async getUser(id) {
    return this.get(`/auth/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.put(`/auth/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/auth/users/${id}`);
  }

  // Scraper methods (admin only)
  async runScraper(portal = 'all') {
    return this.post('/scraper/run', { portal });
  }

  async getScraperStatus() {
    return this.get('/scraper/status');
  }

  async getScraperLogs(page = 1, limit = 20) {
    return this.get('/scraper/logs', { page, limit });
  }

  async getScraperStats() {
    return this.get('/scraper/stats');
  }

  // AI methods
  async analyzeTender(tenderId) {
    return this.get(`/ai/analyze/${tenderId}`);
  }

  async matchTender(tenderId) {
    return this.get(`/ai/match/${tenderId}`);
  }

  async analyzeDocument(file) {
    const formData = new FormData();
    formData.append('document', file);
    
    return this.request('/ai/analyze-document', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData
    });
  }

  async generateBidAssistance(tenderId) {
    return this.get(`/ai/bid-assistance/${tenderId}`);
  }

  async smartSearch(searchData) {
    return this.post('/ai/smart-search', searchData);
  }

  async getDashboardInsights() {
    return this.get('/ai/insights');
  }

  async batchAnalyzeTenders(tenderIds) {
    return this.post('/ai/analyze/batch', { tender_ids: tenderIds });
  }

  async getUsageStats() {
    return this.get('/ai/usage');
  }

  async getAIHealth() {
    return this.get('/ai/health');
  }

  // Alert methods
  async configureAlert(alertConfig) {
    return this.post('/alerts/configure', alertConfig);
  }

  async getUserAlerts() {
    return this.get('/alerts');
  }

  async updateAlert(alertId, updates) {
    return this.put(`/alerts/${alertId}`, updates);
  }

  async deleteAlert(alertId) {
    return this.delete(`/alerts/${alertId}`);
  }

  async getAlertHistory(limit = 50) {
    return this.get('/alerts/history', { limit });
  }

  async getAlertStats() {
    return this.get('/alerts/stats');
  }

  async testAlert(alertId) {
    return this.post(`/alerts/${alertId}/test`);
  }

  async toggleAlertMonitoring(action) {
    return this.post('/alerts/monitoring/toggle', { action });
  }

  async getAlertMonitoringStatus() {
    return this.get('/alerts/monitoring/status');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;