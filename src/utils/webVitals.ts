import { logger } from './logger';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function reportMetric(metric: WebVitalsMetric) {
  logger.info('Web Vital', metric);
  
  // Send to analytics (ready for future integration)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_value: metric.value,
    });
  }
}

export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        reportMetric({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
        });
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      logger.error('LCP measurement failed:', e);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportMetric({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: getRating('FID', entry.processingStart - entry.startTime),
          });
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      logger.error('FID measurement failed:', e);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        reportMetric({
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
        });
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      logger.error('CLS measurement failed:', e);
    }
  }

  // First Contentful Paint (FCP) & Time to First Byte (TTFB)
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      
      if (navigation) {
        // TTFB
        const ttfb = navigation.responseStart - navigation.requestStart;
        reportMetric({
          name: 'TTFB',
          value: ttfb,
          rating: getRating('TTFB', ttfb),
        });
      }

      // FCP
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        reportMetric({
          name: 'FCP',
          value: fcpEntry.startTime,
          rating: getRating('FCP', fcpEntry.startTime),
        });
      }
    });
  }
}

// Custom performance marks
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(name);
  }
}

export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      logger.debug('Performance measure', { name, duration: measure.duration });
    } catch (e) {
      logger.error('Performance measurement failed:', e);
    }
  }
}
