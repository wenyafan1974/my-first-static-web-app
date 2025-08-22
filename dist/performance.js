// Performance Monitoring and Analytics
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    this.captureNavigationTiming();
    this.captureResourceTiming();
    this.captureUserTiming();
    this.setupObservers();
  }

  captureNavigationTiming() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.navigation = {
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnection: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart
        };
      }
    }
  }

  captureResourceTiming() {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource');
      this.metrics.resources = resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: resource.initiatorType
      }));
    }
  }

  captureUserTiming() {
    if ('performance' in window) {
      const userTiming = performance.getEntriesByType('measure');
      this.metrics.userTiming = userTiming.map(measure => ({
        name: measure.name,
        duration: measure.duration,
        startTime: measure.startTime
      }));
    }
  }

  setupObservers() {
    // Observe layout shifts
    if ('PerformanceObserver' in window) {
      const layoutObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.layoutShifts = entries.map(entry => ({
          value: entry.value,
          sources: entry.sources
        }));
      });
      
      try {
        layoutObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }

      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.longTasks = entries.map(entry => ({
          duration: entry.duration,
          startTime: entry.startTime
        }));
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }

  mark(name) {
    if ('performance' in window) {
      performance.mark(name);
    }
  }

  measure(name, startMark, endMark) {
    if ('performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {
        console.warn(`Could not measure ${name}:`, e);
      }
    }
  }

  getMetrics() {
    return this.metrics;
  }

  logMetrics() {
    console.group('🚀 Performance Metrics');
    console.log('Navigation Timing:', this.metrics.navigation);
    console.log('Resource Count:', this.metrics.resources?.length || 0);
    console.log('Layout Shifts:', this.metrics.layoutShifts?.length || 0);
    console.log('Long Tasks:', this.metrics.longTasks?.length || 0);
    console.groupEnd();
  }

  sendToAnalytics() {
    // Send metrics to analytics service
    if (this.metrics.navigation) {
      const data = {
        url: window.location.href,
        timestamp: Date.now(),
        metrics: this.metrics
      };
      
      // Example: send to analytics endpoint
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      console.log('📊 Analytics data:', data);
    }
  }
}

// Initialize performance monitoring
const perfMonitor = new PerformanceMonitor();

// Mark critical points
perfMonitor.mark('app-start');

// Export for use in other scripts
window.PerformanceMonitor = PerformanceMonitor;
window.perfMonitor = perfMonitor;