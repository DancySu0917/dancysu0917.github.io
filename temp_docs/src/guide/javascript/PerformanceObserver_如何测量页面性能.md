# PerformanceObserver 如何测量页面性能？（了解）

**题目**: PerformanceObserver 如何测量页面性能？（了解）

## 标准答案

PerformanceObserver 是 Web Performance API 的核心接口，用于异步观察性能条目。它通过监听特定类型的性能事件（如 navigation、resource、measure 等）来测量页面性能。使用步骤：1) 创建 PerformanceObserver 实例；2) 定义回调函数处理性能数据；3) 使用 observe() 方法指定监听的条目类型。它可以监控页面加载时间、资源加载性能、自定义测量指标等。

## 详细解析

### PerformanceObserver 基础概念

PerformanceObserver 是一个用于观察性能条目的接口，它采用异步回调机制，避免阻塞主线程。它与传统的 performance.getEntries() 方法不同，可以实时监听新产生的性能条目。

```javascript
// 基础的 PerformanceObserver 使用示例
class BasicPerformanceObserver {
    constructor() {
        this.entries = [];
        this.observer = null;
        this.init();
    }
    
    init() {
        // 检查浏览器支持
        if (!window.PerformanceObserver) {
            console.error('PerformanceObserver is not supported in this browser');
            return;
        }
        
        // 创建 PerformanceObserver 实例
        this.observer = new PerformanceObserver((list) => {
            // 遍历所有新收集的性能条目
            for (const entry of list.getEntries()) {
                this.entries.push(entry);
                this.handleEntry(entry);
            }
        });
        
        // 开始观察特定类型的性能条目
        this.observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
    }
    
    handleEntry(entry) {
        console.log(`${entry.entryType} entry:`, entry);
        
        // 根据条目类型进行不同处理
        switch (entry.entryType) {
            case 'navigation':
                this.handleNavigation(entry);
                break;
            case 'resource':
                this.handleResource(entry);
                break;
            case 'paint':
                this.handlePaint(entry);
                break;
        }
    }
    
    handleNavigation(entry) {
        console.log('Navigation timing:', {
            startTime: entry.startTime,
            loadEventEnd: entry.loadEventEnd,
            domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
            domInteractive: entry.domInteractive
        });
    }
    
    handleResource(entry) {
        console.log('Resource timing:', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
        });
    }
    
    handlePaint(entry) {
        console.log('Paint timing:', {
            name: entry.name,
            startTime: entry.startTime
        });
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// 使用示例
const perfObserver = new BasicPerformanceObserver();
```

### PerformanceObserver 高级用法

```javascript
// 高级性能监控类
class AdvancedPerformanceMonitor {
    constructor(options = {}) {
        this.options = {
            entryTypes: ['navigation', 'resource', 'paint', 'measure', 'mark'],
            buffered: true, // 是否获取已存在的条目
            reportCallback: options.reportCallback || null,
            threshold: options.threshold || 100, // 性能阈值
            ...options
        };
        
        this.observer = null;
        this.metrics = {
            navigation: [],
            resources: [],
            paint: [],
            custom: [],
            longTasks: []
        };
        
        this.init();
    }
    
    init() {
        if (!window.PerformanceObserver) {
            throw new Error('PerformanceObserver is not supported');
        }
        
        // 监听长任务
        this.observeLongTasks();
        
        // 监听核心性能指标
        this.observeCoreMetrics();
    }
    
    observeLongTasks() {
        // 需要 Long Task API 支持
        if ('PerformanceObserver' in window && 
            PerformanceObserver.supportedEntryTypes.includes('longtask')) {
            
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.longTasks.push({
                        duration: entry.duration,
                        startTime: entry.startTime,
                        name: 'longtask',
                        ...entry
                    });
                    
                    // 检查是否超过阈值
                    if (entry.duration > this.options.threshold) {
                        this.reportLongTask(entry);
                    }
                }
            });
            
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
    }
    
    observeCoreMetrics() {
        this.observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.processEntry(entry);
            }
        });
        
        this.observer.observe({ 
            entryTypes: this.options.entryTypes,
            buffered: this.options.buffered
        });
    }
    
    processEntry(entry) {
        switch (entry.entryType) {
            case 'navigation':
                this.metrics.navigation.push(entry);
                this.reportNavigationMetrics(entry);
                break;
                
            case 'resource':
                this.metrics.resources.push(entry);
                this.reportResourceMetrics(entry);
                break;
                
            case 'paint':
                this.metrics.paint.push(entry);
                this.reportPaintMetrics(entry);
                break;
                
            case 'measure':
                this.metrics.custom.push(entry);
                this.reportCustomMetrics(entry);
                break;
                
            case 'mark':
                this.metrics.custom.push(entry);
                break;
        }
        
        // 执行自定义回调
        if (this.options.reportCallback) {
            this.options.reportCallback(entry);
        }
    }
    
    reportNavigationMetrics(entry) {
        const metrics = {
            dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
            tcpConnection: entry.connectEnd - entry.connectStart,
            requestTime: entry.responseEnd - entry.requestStart,
            domProcessing: entry.domContentLoadedEventEnd - entry.domLoading,
            pageLoadTime: entry.loadEventEnd - entry.startTime,
            ...entry
        };
        
        console.log('Navigation metrics:', metrics);
        
        // 发送性能数据到监控服务
        this.sendMetrics('navigation', metrics);
    }
    
    reportResourceMetrics(entry) {
        const metrics = {
            url: entry.name,
            duration: entry.duration,
            transferSize: entry.transferSize || 0,
            decodedBodySize: entry.decodedBodySize || 0,
            contentType: entry.responseEnd ? 'loaded' : 'pending',
            ...entry
        };
        
        // 过滤掉小于阈值的资源
        if (entry.duration > this.options.threshold) {
            console.log('Slow resource:', metrics);
        }
        
        this.sendMetrics('resource', metrics);
    }
    
    reportPaintMetrics(entry) {
        const metrics = {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            ...entry
        };
        
        console.log('Paint metrics:', metrics);
        this.sendMetrics('paint', metrics);
    }
    
    reportCustomMetrics(entry) {
        const metrics = {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            ...entry
        };
        
        console.log('Custom measurement:', metrics);
        this.sendMetrics('custom', metrics);
    }
    
    reportLongTask(entry) {
        const metrics = {
            duration: entry.duration,
            startTime: entry.startTime,
            name: 'longtask',
            ...entry
        };
        
        console.warn('Long task detected:', metrics);
        this.sendMetrics('longtask', metrics);
    }
    
    sendMetrics(type, data) {
        // 发送性能数据到监控服务
        if (navigator.sendBeacon) {
            // 使用 sendBeacon 确保数据发送
            navigator.sendBeacon('/api/performance', JSON.stringify({
                type,
                data,
                timestamp: Date.now(),
                url: window.location.href
            }));
        } else {
            // 降级方案
            fetch('/api/performance', {
                method: 'POST',
                body: JSON.stringify({
                    type,
                    data,
                    timestamp: Date.now(),
                    url: window.location.href
                }),
                keepalive: true // 确保在页面卸载时也能发送
            }).catch(err => {
                console.error('Failed to send performance metrics:', err);
            });
        }
    }
    
    // 创建自定义测量
    measure(name, startMark, endMark) {
        if (startMark && endMark) {
            performance.measure(name, startMark, endMark);
        } else if (startMark) {
            performance.measure(name, startMark);
        } else {
            performance.mark(`${name}_start`);
            return () => {
                performance.mark(`${name}_end`);
                performance.measure(name, `${name}_start`, `${name}_end`);
                performance.clearMarks(`${name}_start`);
                performance.clearMarks(`${name}_end`);
            };
        }
    }
    
    // 获取当前收集的所有性能数据
    getMetrics() {
        return { ...this.metrics };
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// 使用示例
const perfMonitor = new AdvancedPerformanceMonitor({
    entryTypes: ['navigation', 'resource', 'paint', 'measure', 'mark', 'longtask'],
    threshold: 100,
    reportCallback: (entry) => {
        console.log('Custom callback for entry:', entry);
    }
});
```

### 实际性能测量场景

```javascript
// 页面性能测量完整示例
class PagePerformanceTracker {
    constructor() {
        this.observer = null;
        this.metrics = {
            coreWebVitals: {
                lcp: null, // Largest Contentful Paint
                fcp: null, // First Contentful Paint
                cls: null, // Cumulative Layout Shift
                fid: null, // First Input Delay
                ttfb: null // Time to First Byte
            },
            customMetrics: {},
            resourceTiming: []
        };
        
        this.init();
    }
    
    init() {
        // 监听核心 Web 指标
        this.observeCoreWebVitals();
        
        // 监听资源加载
        this.observeResourceTiming();
        
        // 记录页面加载开始时间
        this.markStart();
    }
    
    observeCoreWebVitals() {
        // 监听 LCP (Largest Contentful Paint)
        let lcp;
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcp = lastEntry;
            
            this.metrics.coreWebVitals.lcp = {
                value: lastEntry.startTime,
                element: lastEntry.element,
                url: lastEntry.url || lastEntry.href,
                size: lastEntry.size || lastEntry.renderTime || lastEntry.loadTime
            };
            
            console.log('LCP:', this.metrics.coreWebVitals.lcp);
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // 监听 FCP (First Contentful Paint)
        const fcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const fcpEntry = entries[0];
            
            this.metrics.coreWebVitals.fcp = {
                value: fcpEntry.startTime,
                name: fcpEntry.name,
                entryType: fcpEntry.entryType
            };
            
            console.log('FCP:', this.metrics.coreWebVitals.fcp);
            
            // FCP 只报告一次，断开观察器
            fcpObserver.disconnect();
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
        
        // 监听 CLS (Cumulative Layout Shift)
        let cls = 0;
        let clsEntries = [];
        
        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    const value = entry.value;
                    cls += value;
                    clsEntries.push(entry);
                }
            }
            
            this.metrics.coreWebVitals.cls = {
                value: cls,
                entries: clsEntries
            };
            
            console.log('CLS:', this.metrics.coreWebVitals.cls);
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
    
    observeResourceTiming() {
        const resourceObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const resourceMetric = {
                    name: entry.name,
                    duration: entry.duration,
                    startTime: entry.startTime,
                    size: entry.transferSize,
                    type: entry.entryType,
                    url: entry.name
                };
                
                this.metrics.resourceTiming.push(resourceMetric);
                
                // 检查慢资源
                if (entry.duration > 500) {
                    console.warn('Slow resource:', resourceMetric);
                }
            }
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
    }
    
    markStart() {
        performance.mark('page-start');
        
        // 监听页面加载事件
        window.addEventListener('load', () => {
            performance.mark('page-load');
            performance.measure('page-load-time', 'page-start', 'page-load');
        });
        
        // 监听 DOM 内容加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                performance.mark('dom-content-loaded');
                performance.measure('dom-ready-time', 'page-start', 'dom-content-loaded');
            });
        } else {
            performance.mark('dom-content-loaded');
            performance.measure('dom-ready-time', 'page-start', 'dom-content-loaded');
        }
    }
    
    // 计算 TTFB (Time to First Byte)
    calculateTTFB() {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (navigationEntry) {
            this.metrics.coreWebVitals.ttfb = {
                value: navigationEntry.responseStart - navigationEntry.requestStart,
                startTime: navigationEntry.startTime,
                responseStart: navigationEntry.responseStart
            };
            
            console.log('TTFB:', this.metrics.coreWebVitals.ttfb);
        }
    }
    
    // 开始测量用户交互延迟
    measureInteractionDelay() {
        let interactionObserver;
        
        if (PerformanceObserver.supportedEntryTypes.includes('event')) {
            interactionObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'event' && entry.duration > 100) {
                        // 长事件延迟
                        console.warn('Long event delay:', {
                            name: entry.name,
                            duration: entry.duration,
                            processingStart: entry.processingStart,
                            processingEnd: entry.processingEnd
                        });
                    }
                }
            });
            
            interactionObserver.observe({ entryTypes: ['event'] });
        }
    }
    
    // 获取所有性能指标
    getPerformanceMetrics() {
        // 计算 TTFB
        this.calculateTTFB();
        
        return {
            ...this.metrics,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
    }
    
    // 发送性能数据
    sendPerformanceData() {
        const metrics = this.getPerformanceMetrics();
        
        // 使用 sendBeacon 发送数据
        if (navigator.sendBeacon) {
            navigator.sendBeacon(
                '/api/performance-report',
                JSON.stringify(metrics)
            );
        } else {
            fetch('/api/performance-report', {
                method: 'POST',
                body: JSON.stringify(metrics),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            });
        }
    }
    
    destroy() {
        // 清理所有观察器
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// 使用页面性能跟踪器
const pageTracker = new PagePerformanceTracker();

// 页面卸载前发送性能数据
window.addEventListener('beforeunload', () => {
    pageTracker.sendPerformanceData();
});

// 页面隐藏时发送数据（如果页面被切换到后台）
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        pageTracker.sendPerformanceData();
    }
});
```

### 性能优化建议

```javascript
// 性能优化建议和最佳实践
class PerformanceOptimizer {
    constructor() {
        this.optimizationRules = {
            // 资源加载优化
            resourceLoading: [
                {
                    name: 'Preload Critical Resources',
                    check: (metrics) => {
                        // 检查关键资源是否延迟加载
                        return metrics.resourceTiming.some(resource => 
                            resource.duration > 1000 && 
                            resource.name.includes('critical')
                        );
                    },
                    fix: () => {
                        // 在 HTML 中使用 <link rel="preload">
                        console.log('Add <link rel="preload"> for critical resources');
                    }
                },
                {
                    name: 'Optimize Image Loading',
                    check: (metrics) => {
                        return metrics.resourceTiming.some(resource => 
                            resource.size > 100000 && // 100KB+
                            (resource.name.includes('.jpg') || 
                             resource.name.includes('.png') ||
                             resource.name.includes('.gif'))
                        );
                    },
                    fix: () => {
                        console.log('Consider using WebP format and responsive images');
                    }
                }
            ],
            
            // 渲染性能优化
            rendering: [
                {
                    name: 'Reduce Long Tasks',
                    check: (metrics) => {
                        return metrics.longTasks && 
                               metrics.longTasks.some(task => task.duration > 50);
                    },
                    fix: () => {
                        console.log('Break long tasks into smaller chunks using requestIdleCallback or requestAnimationFrame');
                    }
                },
                {
                    name: 'Minimize Layout Shifts',
                    check: (metrics) => {
                        return metrics.coreWebVitals.cls && 
                               metrics.coreWebVitals.cls.value > 0.1;
                    },
                    fix: () => {
                        console.log('Reserve space for images/videos, avoid dynamic content insertion without dimensions');
                    }
                }
            ]
        };
    }
    
    // 分析性能数据并提供优化建议
    analyzePerformance(metrics) {
        const recommendations = [];
        
        // 检查资源加载问题
        for (const rule of this.optimizationRules.resourceLoading) {
            if (rule.check(metrics)) {
                recommendations.push({
                    category: 'resourceLoading',
                    name: rule.name,
                    description: 'Performance issue detected',
                    fix: rule.fix.toString()
                });
            }
        }
        
        // 检查渲染性能问题
        for (const rule of this.optimizationRules.rendering) {
            if (rule.check(metrics)) {
                recommendations.push({
                    category: 'rendering',
                    name: rule.name,
                    description: 'Performance issue detected',
                    fix: rule.fix.toString()
                });
            }
        }
        
        return recommendations;
    }
    
    // 提供性能优化建议
    getOptimizationAdvice(metrics) {
        const recommendations = this.analyzePerformance(metrics);
        
        if (recommendations.length === 0) {
            return 'No performance issues detected. Your page is performing well!';
        }
        
        console.group('Performance Optimization Recommendations:');
        recommendations.forEach(rec => {
            console.log(`- ${rec.name}: ${rec.description}`);
            console.log(`  Fix: ${rec.fix}`);
        });
        console.groupEnd();
        
        return recommendations;
    }
}

// 使用性能优化器
const optimizer = new PerformanceOptimizer();

// 假设我们有性能数据
const sampleMetrics = {
    resourceTiming: [
        { name: 'critical-script.js', duration: 1200, size: 150000 },
        { name: 'image.jpg', duration: 800, size: 200000 }
    ],
    longTasks: [
        { duration: 100 },
        { duration: 200 }
    ],
    coreWebVitals: {
        cls: { value: 0.25 }
    }
};

const advice = optimizer.getOptimizationAdvice(sampleMetrics);
console.log('Optimization advice:', advice);
```

### 实际应用场景

1. **电商网站**：监控页面加载时间、资源加载性能、用户交互延迟
2. **内容管理系统**：测量内容渲染时间、图片加载性能、页面响应性
3. **单页应用**：监控路由切换性能、组件渲染时间、API 请求延迟
4. **移动 Web 应用**：测量在不同网络条件下的性能表现

### 注意事项

1. **性能开销**：PerformanceObserver 本身有轻微性能开销，但比轮询方式更高效
2. **浏览器兼容性**：较老的浏览器可能不支持某些性能条目类型
3. **数据隐私**：发送性能数据时注意保护用户隐私
4. **阈值设置**：根据业务需求设置合适的性能阈值
5. **数据聚合**：避免发送过多性能数据，应适当聚合
