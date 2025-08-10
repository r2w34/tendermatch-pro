// Mobile-first optimization utilities for Indian market
import { useState, useEffect } from 'react';

// Network speed detection
export const useNetworkSpeed = () => {
  const [networkSpeed, setNetworkSpeed] = useState('unknown');
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Check if Network Information API is available
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      const updateConnectionInfo = () => {
        const effectiveType = connection.effectiveType;
        setNetworkSpeed(effectiveType);
        
        // Consider 2G and slow-3g as slow connections
        setIsSlowConnection(effectiveType === '2g' || effectiveType === 'slow-2g');
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    } else {
      // Fallback: Measure connection speed
      measureConnectionSpeed();
    }
  }, []);

  const measureConnectionSpeed = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch('/api/ping', { method: 'HEAD' });
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration > 2000) {
        setNetworkSpeed('slow-2g');
        setIsSlowConnection(true);
      } else if (duration > 1000) {
        setNetworkSpeed('2g');
        setIsSlowConnection(true);
      } else if (duration > 500) {
        setNetworkSpeed('3g');
        setIsSlowConnection(false);
      } else {
        setNetworkSpeed('4g');
        setIsSlowConnection(false);
      }
    } catch (error) {
      console.warn('Could not measure connection speed:', error);
    }
  };

  return { networkSpeed, isSlowConnection };
};

// Progressive image loading for slow connections
export const ProgressiveImage = ({ 
  src, 
  lowQualitySrc, 
  alt, 
  className,
  placeholder = '/placeholder-low.jpg' 
}) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isSlowConnection } = useNetworkSpeed();

  useEffect(() => {
    const img = new Image();
    
    // Load low quality first for slow connections
    if (isSlowConnection && lowQualitySrc) {
      img.src = lowQualitySrc;
      img.onload = () => {
        setCurrentSrc(lowQualitySrc);
        
        // Then load high quality in background
        const highQualityImg = new Image();
        highQualityImg.src = src;
        highQualityImg.onload = () => {
          setCurrentSrc(src);
          setIsLoaded(true);
        };
      };
    } else {
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };
    }
  }, [src, lowQualitySrc, isSlowConnection]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-75'} transition-opacity duration-300`}
      loading="lazy"
    />
  );
};

// Data compression for API responses
export const compressApiResponse = (data) => {
  if (typeof data === 'string') {
    // Simple text compression by removing extra whitespace
    return data.replace(/\s+/g, ' ').trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(compressApiResponse);
  }
  
  if (typeof data === 'object' && data !== null) {
    const compressed = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip null/undefined values to reduce payload
      if (value !== null && value !== undefined) {
        compressed[key] = compressApiResponse(value);
      }
    }
    return compressed;
  }
  
  return data;
};

// Adaptive loading based on connection speed
export const useAdaptiveLoading = () => {
  const { isSlowConnection } = useNetworkSpeed();
  
  const getPageSize = () => {
    return isSlowConnection ? 10 : 20; // Smaller page size for slow connections
  };
  
  const getImageQuality = () => {
    return isSlowConnection ? 'low' : 'high';
  };
  
  const shouldPreloadImages = () => {
    return !isSlowConnection;
  };
  
  const getDebounceDelay = () => {
    return isSlowConnection ? 800 : 300; // Longer debounce for slow connections
  };

  return {
    pageSize: getPageSize(),
    imageQuality: getImageQuality(),
    shouldPreloadImages: shouldPreloadImages(),
    debounceDelay: getDebounceDelay(),
    isSlowConnection
  };
};

// Offline detection and handling
export const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Sync data when coming back online
        window.dispatchEvent(new CustomEvent('sync-data'));
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

// Mobile-specific optimizations
export const useMobileOptimizations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);
      
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch-friendly configurations
  const getTouchConfig = () => ({
    minTouchTarget: isMobile ? 44 : 32, // Minimum 44px for mobile touch targets
    swipeThreshold: 50,
    tapDelay: isMobile ? 300 : 0
  });

  return {
    isMobile,
    screenSize,
    touchConfig: getTouchConfig()
  };
};

// Data prefetching strategy for mobile
export const useMobilePrefetch = () => {
  const { isSlowConnection } = useNetworkSpeed();
  const { isMobile } = useMobileOptimizations();

  const shouldPrefetch = (priority = 'low') => {
    if (isSlowConnection) {
      return priority === 'high';
    }
    
    if (isMobile) {
      return priority !== 'low';
    }
    
    return true;
  };

  const prefetchData = async (url, priority = 'low') => {
    if (!shouldPrefetch(priority)) return null;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=300' // 5 minutes cache
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
    
    return null;
  };

  return { prefetchData, shouldPrefetch };
};

// Battery-aware optimizations
export const useBatteryOptimization = () => {
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(true);
  const [isLowBattery, setIsLowBattery] = useState(false);

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBatteryInfo = () => {
          setBatteryLevel(battery.level);
          setIsCharging(battery.charging);
          setIsLowBattery(battery.level < 0.2 && !battery.charging);
        };

        updateBatteryInfo();
        
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);

        return () => {
          battery.removeEventListener('chargingchange', updateBatteryInfo);
          battery.removeEventListener('levelchange', updateBatteryInfo);
        };
      });
    }
  }, []);

  const getOptimizationLevel = () => {
    if (isLowBattery) return 'aggressive';
    if (batteryLevel < 0.5 && !isCharging) return 'moderate';
    return 'none';
  };

  return {
    batteryLevel,
    isCharging,
    isLowBattery,
    optimizationLevel: getOptimizationLevel()
  };
};

// Performance monitoring for mobile
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(setMetrics);
        getFID(setMetrics);
        getFCP(setMetrics);
        getLCP(setMetrics);
        getTTFB(setMetrics);
      });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit
        }
      }));
    }
  }, []);

  return metrics;
};