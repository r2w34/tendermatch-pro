import { lazy, useState, useEffect, useMemo } from 'react';

// Lazy load components for code splitting
export const LazyAnalyticsDashboard = lazy(() => import('../../components/analytics/AnalyticsDashboard'));
export const LazyDocumentManager = lazy(() => import('../../components/documents/DocumentManager'));
export const LazyTeamWorkspace = lazy(() => import('../../components/collaboration/TeamWorkspace'));
export const LazyBidCalendar = lazy(() => import('../../components/collaboration/BidCalendar'));
export const LazySubscriptionPlans = lazy(() => import('../../components/subscription/SubscriptionPlans'));
export const LazyAIDashboard = lazy(() => import('../../components/ai/AIDashboard'));
export const LazyTenderAnalysis = lazy(() => import('../../components/ai/TenderAnalysis'));
export const LazyBidAssistant = lazy(() => import('../../components/ai/BidAssistant'));

// Image lazy loading utility
export const LazyImage = ({ src, alt, className, placeholder = '/placeholder.png' }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();

  useEffect(() => {
    let observer;
    
    if (imageRef && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(imageRef);
    }
    
    return () => {
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, imageSrc, placeholder, src]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

// Virtual scrolling for large lists
export const VirtualizedList = ({ items, itemHeight, containerHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Debounce utility for search inputs
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoization utility for expensive calculations
export const useMemoizedCalculation = (calculation, dependencies) => {
  return useMemo(() => {
    return calculation();
  }, dependencies);
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
      console.log('Bundle analysis available at http://localhost:8888');
    });
  }
};