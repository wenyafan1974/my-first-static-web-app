/**
 * Lightweight Performance Monitor
 * Tracks and reports key performance metrics
 */
(function() {
    'use strict';
    
    // Performance metrics collector
    const PerfMonitor = {
        metrics: {},
        
        // Initialize performance monitoring
        init() {
            this.measurePageLoad();
            this.measureResourceTiming();
            this.measureFirstContentfulPaint();
            this.measureLargestContentfulPaint();
            this.measureCumulativeLayoutShift();
            this.measureFirstInputDelay();
        },
        
        // Measure page load performance
        measurePageLoad() {
            window.addEventListener('load', () => {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                const domInteractiveTime = perfData.domInteractive - perfData.navigationStart;
                
                this.metrics.pageLoad = {
                    total: pageLoadTime,
                    domContentLoaded: domContentLoadedTime,
                    domInteractive: domInteractiveTime,
                    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                    tcp: perfData.connectEnd - perfData.connectStart,
                    request: perfData.responseStart - perfData.requestStart,
                    response: perfData.responseEnd - perfData.responseStart,
                    domProcessing: perfData.domComplete - perfData.domLoading
                };
                
                this.log('Page Load Metrics', this.metrics.pageLoad);
            });
        },
        
        // Measure resource loading performance
        measureResourceTiming() {
            window.addEventListener('load', () => {
                const resources = performance.getEntriesByType('resource');
                const resourceMetrics = resources.map(resource => ({
                    name: resource.name.split('/').pop(),
                    type: resource.initiatorType,
                    size: resource.transferSize || 0,
                    duration: Math.round(resource.duration),
                    blocked: Math.round(resource.domainLookupStart - resource.fetchStart),
                    dns: Math.round(resource.domainLookupEnd - resource.domainLookupStart),
                    connect: Math.round(resource.connectEnd - resource.connectStart),
                    send: Math.round(resource.responseStart - resource.requestStart),
                    wait: Math.round(resource.responseEnd - resource.responseStart)
                }));
                
                this.metrics.resources = resourceMetrics;
                this.log('Resource Timing', resourceMetrics);
            });
        },
        
        // Measure First Contentful Paint
        measureFirstContentfulPaint() {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = Math.round(entry.startTime);
                        this.log('First Contentful Paint', `${this.metrics.fcp}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });
        },
        
        // Measure Largest Contentful Paint
        measureLargestContentfulPaint() {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = Math.round(lastEntry.startTime);
                this.log('Largest Contentful Paint', `${this.metrics.lcp}ms`);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        },
        
        // Measure Cumulative Layout Shift
        measureCumulativeLayoutShift() {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.metrics.cls = Math.round(clsValue * 1000) / 1000;
                this.log('Cumulative Layout Shift', this.metrics.cls);
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        },
        
        // Measure First Input Delay
        measureFirstInputDelay() {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
                    this.log('First Input Delay', `${this.metrics.fid}ms`);
                }
            });
            observer.observe({ entryTypes: ['first-input'] });
        },
        
        // Log performance data
        log(metric, data) {
            if (console.groupCollapsed) {
                console.groupCollapsed(`🚀 Performance: ${metric}`);
                console.log(data);
                console.groupEnd();
            } else {
                console.log(`🚀 Performance: ${metric}`, data);
            }
        },
        
        // Get performance score
        getPerformanceScore() {
            const scores = {
                fcp: this.metrics.fcp <= 1800 ? 100 : Math.max(0, 100 - ((this.metrics.fcp - 1800) / 18)),
                lcp: this.metrics.lcp <= 2500 ? 100 : Math.max(0, 100 - ((this.metrics.lcp - 2500) / 25)),
                fid: this.metrics.fid <= 100 ? 100 : Math.max(0, 100 - this.metrics.fid),
                cls: this.metrics.cls <= 0.1 ? 100 : Math.max(0, 100 - (this.metrics.cls * 1000))
            };
            
            const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
            return Math.round(totalScore);
        },
        
        // Generate performance report
        generateReport() {
            setTimeout(() => {
                const report = {
                    score: this.getPerformanceScore(),
                    metrics: this.metrics,
                    recommendations: this.getRecommendations()
                };
                
                console.log('📊 Performance Report', report);
                return report;
            }, 3000);
        },
        
        // Get performance recommendations
        getRecommendations() {
            const recommendations = [];
            
            if (this.metrics.fcp > 1800) {
                recommendations.push('Consider optimizing CSS delivery and reducing render-blocking resources');
            }
            
            if (this.metrics.lcp > 2500) {
                recommendations.push('Optimize largest contentful paint by preloading key resources');
            }
            
            if (this.metrics.fid > 100) {
                recommendations.push('Reduce JavaScript execution time and optimize event handlers');
            }
            
            if (this.metrics.cls > 0.1) {
                recommendations.push('Minimize layout shifts by reserving space for dynamic content');
            }
            
            return recommendations;
        }
    };
    
    // Initialize performance monitoring when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PerfMonitor.init());
    } else {
        PerfMonitor.init();
    }
    
    // Generate report after page load
    window.addEventListener('load', () => PerfMonitor.generateReport());
    
    // Expose to global scope for debugging
    window.PerfMonitor = PerfMonitor;
})();