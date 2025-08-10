import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FilterSidebar from './components/filters/FilterSidebar';
import FilterTemplates from './components/filters/FilterTemplates';
import TenderList from './components/tenders/TenderList';
import SmartSearchBar from './components/ai/SmartSearchBar';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { mockTenders } from './data/mockData';
import { TokenManager, secureApiRequest } from './utils/security/auth';
import { 
  LazyAnalyticsDashboard,
  LazyDocumentManager,
  LazyTeamWorkspace,
  LazyBidCalendar,
  LazySubscriptionPlans,
  LazyAIDashboard,
  LazyTenderAnalysis,
  LazyBidAssistant
} from './utils/performance/lazyLoading';
import './styles/globals.css';

// PWA Install prompt component
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <div>
          <h4 className="font-medium">Install TenderMatch Pro</h4>
          <p className="text-sm opacity-90">Get the app experience</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="px-3 py-1 text-sm bg-blue-500 rounded hover:bg-blue-400"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1 text-sm bg-white text-blue-600 rounded hover:bg-gray-100"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ 
  tenders, 
  filters, 
  setFilters, 
  favorites, 
  setFavorites,
  isSidebarOpen,
  setIsSidebarOpen 
}) => {
  const [currentView, setCurrentView] = useState('tenders');

  const handleApplyTemplate = (templateFilters) => {
    setFilters(prev => ({ ...prev, ...templateFilters }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <div className="flex">
        <FilterSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-80' : 'ml-0'
        }`}>
          <div className="p-6">
            <FilterTemplates 
              onApplyTemplate={handleApplyTemplate}
              currentFilters={filters}
            />
            
            <SmartSearchBar 
              onSearch={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))}
              filters={filters}
            />
            
            {currentView === 'tenders' && (
              <TenderList 
                tenders={tenders}
                favorites={favorites}
                onToggleFavorite={setFavorites}
                filters={filters}
              />
            )}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = TokenManager.getAccessToken();
      if (token && !TokenManager.isTokenExpired(token)) {
        setIsAuthenticated(true);
      } else {
        // Try to refresh token
        const newToken = await TokenManager.refreshAccessToken();
        setIsAuthenticated(!!newToken);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppEnhanced() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tenders, setTenders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
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

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      try {
        // Load tenders
        const tendersData = await loadTenders();
        setTenders(tendersData);

        // Load user data if authenticated
        const token = TokenManager.getAccessToken();
        if (token && !TokenManager.isTokenExpired(token)) {
          const userData = await loadUserData();
          setUser(userData);
          
          const subscriptionData = await loadSubscriptionData();
          setSubscription(subscriptionData);
        }

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('tenderFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }

      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const loadTenders = async () => {
    try {
      const response = await secureApiRequest('/api/tenders');
      if (response && response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to load tenders from API:', error);
    }
    
    // Fallback to mock data
    return mockTenders;
  };

  const loadUserData = async () => {
    try {
      const response = await secureApiRequest('/api/auth/profile');
      if (response && response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
    return null;
  };

  const loadSubscriptionData = async () => {
    try {
      const response = await secureApiRequest('/api/subscription/current');
      if (response && response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    }
    return null;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Dashboard
                  tenders={tenders}
                  filters={filters}
                  setFilters={setFilters}
                  favorites={favorites}
                  setFavorites={setFavorites}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              } 
            />
            
            <Route 
              path="/subscription" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <LazySubscriptionPlans />
                </Suspense>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <LazyAnalyticsDashboard tenders={tenders} />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/ai-dashboard" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <LazyAIDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tender-analysis/:id" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <LazyTenderAnalysis />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/bid-assistant" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <LazyBidAssistant />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <LazyDocumentManager />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/team" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <LazyTeamWorkspace />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <LazyBidCalendar tenders={tenders} />
                  </Suspense>
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          <PWAInstallPrompt />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default AppEnhanced;