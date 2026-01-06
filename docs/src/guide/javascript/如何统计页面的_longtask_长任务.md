# 如何统计页面的 longtask（长任务）？（了解）

**题目**: 如何统计页面的 longtask（长任务）？（了解）

**答案**:

Long Task API 是浏览器提供的一种用于检测页面中长时间运行任务的 API，这些任务可能会阻塞主线程，影响用户体验。以下是统计页面 Long Task 的几种方法：

## 1. 使用 PerformanceObserver 和 Long Task API

```javascript
// 监听长任务
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('Long Task detected:', {
      name: entry.name,
      entryType: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      // 在支持的浏览器中，可以获取额外的上下文信息
      ...entry
    });
    
    // 上报长任务数据
    reportLongTask(entry);
  });
});

// 开始监听长任务
observer.observe({ entryTypes: ['longtask'] });

function reportLongTask(longTask) {
  // 将长任务数据发送到监控系统
  console.log(`Long Task: ${longTask.duration}ms at ${longTask.startTime}ms`);
  
  // 可以发送到监控服务
  // analytics.track('long-task', {
  //   duration: longTask.duration,
  //   startTime: longTask.startTime,
  //   source: longTask.name
  // });
}
```

## 2. 长任务分类和上下文信息

```javascript
// 更详细的长任务监听器
class LongTaskMonitor {
  constructor() {
    this.longTasks = [];
    this.setupObserver();
  }
  
  setupObserver() {
    if (!window.PerformanceObserver) {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const longTaskInfo = this.processLongTask(entry);
        this.longTasks.push(longTaskInfo);
        this.onLongTaskDetected(longTaskInfo);
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
  
  processLongTask(entry) {
    // 长任务分类
    let category = 'unknown';
    
    if (entry.name === 'self') {
      category = 'own-script';
    } else if (entry.name === 'same-origin-ancestor-or-ancestor') {
      category = 'same-origin';
    } else if (entry.name === 'cross-origin-ancestor') {
      category = 'cross-origin';
    } else if (entry.name === 'same-origin-descendant') {
      category = 'same-origin-descendant';
    } else if (entry.name === 'cross-origin-descendant') {
      category = 'cross-origin-descendant';
    }
    
    return {
      duration: entry.duration,
      startTime: entry.startTime,
      category,
      containerType: entry.containerType,
      containerSrc: entry.containerSrc,
      containerName: entry.containerName,
      timestamp: Date.now()
    };
  }
  
  onLongTaskDetected(longTaskInfo) {
    console.log('Long Task Detected:', longTaskInfo);
    
    // 可以根据需要进行进一步处理
    this.sendToAnalytics(longTaskInfo);
  }
  
  sendToAnalytics(longTaskInfo) {
    // 发送到分析服务
    if (window.gtag) {
      // Google Analytics
      gtag('event', 'long_task', {
        value: Math.round(longTaskInfo.duration),
        category: longTaskInfo.category,
        container: longTaskInfo.containerName || 'unknown'
      });
    }
    
    // 或者发送到自定义监控服务
    fetch('/api/performance/longtask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(longTaskInfo)
    }).catch(err => {
      console.error('Failed to report long task:', err);
    });
  }
  
  getLongTasks() {
    return this.longTasks;
  }
  
  getStats() {
    if (this.longTasks.length === 0) {
      return { count: 0, avgDuration: 0, maxDuration: 0 };
    }
    
    const durations = this.longTasks.map(task => task.duration);
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    
    return {
      count: this.longTasks.length,
      avgDuration: total / durations.length,
      maxDuration: Math.max(...durations)
    };
  }
}

// 初始化长任务监控
const longTaskMonitor = new LongTaskMonitor();
```

## 3. 结合其他性能指标

```javascript
// 综合性能监控类
class ComprehensivePerformanceMonitor {
  constructor() {
    this.longTaskMonitor = new LongTaskMonitor();
    this.setupPerformanceMonitoring();
  }
  
  setupPerformanceMonitoring() {
    // 监听长任务
    this.setupLongTaskObserver();
    
    // 监听其他性能指标
    this.setupFCP();
    this.setupLCP();
    this.setupFID();
    this.setupCLS();
  }
  
  setupLongTaskObserver() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.longTaskMonitor.onLongTaskDetected(
          this.longTaskMonitor.processLongTask(entry)
        );
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
  
  setupFCP() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FCP:', entry.startTime);
      }
    }).observe({ entryTypes: ['paint'] });
  }
  
  setupLCP() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('LCP:', entry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  setupFID() {
    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });
  }
  
  setupCLS() {
    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log('Current CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// 初始化综合性能监控
const performanceMonitor = new ComprehensivePerformanceMonitor();
```

## 4. 长任务检测和分析工具

```javascript
// 长任务分析工具
class LongTaskAnalyzer {
  static analyzeLongTasks(longTasks) {
    const analysis = {
      totalLongTasks: longTasks.length,
      durationStats: this.calculateDurationStats(longTasks),
      categoryBreakdown: this.getCategoryBreakdown(longTasks),
      timeline: this.createTimeline(longTasks),
      recommendations: []
    };
    
    // 生成优化建议
    analysis.recommendations = this.generateRecommendations(analysis);
    
    return analysis;
  }
  
  static calculateDurationStats(longTasks) {
    if (longTasks.length === 0) {
      return { min: 0, max: 0, avg: 0, total: 0 };
    }
    
    const durations = longTasks.map(task => task.duration);
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    
    return {
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: total / durations.length,
      total
    };
  }
  
  static getCategoryBreakdown(longTasks) {
    const breakdown = {};
    
    longTasks.forEach(task => {
      const category = task.category;
      if (!breakdown[category]) {
        breakdown[category] = { count: 0, totalDuration: 0 };
      }
      breakdown[category].count++;
      breakdown[category].totalDuration += task.duration;
    });
    
    return breakdown;
  }
  
  static createTimeline(longTasks) {
    // 按时间排序
    return longTasks.sort((a, b) => a.startTime - b.startTime);
  }
  
  static generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.totalLongTasks > 10) {
      recommendations.push('页面中长任务数量过多，建议优化 JavaScript 执行');
    }
    
    if (analysis.durationStats.avg > 100) {
      recommendations.push('平均长任务时间过长，建议将大任务分解为小任务');
    }
    
    if (analysis.durationStats.max > 500) {
      recommendations.push('存在超长任务，强烈建议使用 Web Workers 或时间切片');
    }
    
    // 按类别分析
    Object.entries(analysis.categoryBreakdown).forEach(([category, data]) => {
      if (data.count > 5) {
        recommendations.push(`类别 "${category}" 的长任务过多，需要优化`);
      }
    });
    
    return recommendations;
  }
}

// 使用示例
const longTasks = longTaskMonitor.getLongTasks();
const analysis = LongTaskAnalyzer.analyzeLongTasks(longTasks);
console.log('Long Task Analysis:', analysis);
```

## 5. 实际应用和最佳实践

```javascript
// 生产环境的长任务监控实现
class ProductionLongTaskMonitor {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 50, // 长任务阈值（毫秒）
      sampleRate: options.sampleRate || 1.0, // 采样率
      maxTasks: options.maxTasks || 100, // 最大记录数量
      reportUrl: options.reportUrl,
      ...options
    };
    
    this.taskCount = 0;
    this.isEnabled = Math.random() < this.options.sampleRate;
    
    if (this.isEnabled) {
      this.init();
    }
  }
  
  init() {
    if (!window.PerformanceObserver) {
      return;
    }
    
    const observer = new PerformanceObserver((list) => {
      if (this.taskCount >= this.options.maxTasks) {
        // 达到最大记录数，停止监听
        return;
      }
      
      list.getEntries().forEach((entry) => {
        if (entry.duration >= this.options.threshold) {
          this.handleLongTask(entry);
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
  
  handleLongTask(entry) {
    const longTaskData = {
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      memory: this.getMemoryInfo(),
      performance: this.getPerformanceInfo()
    };
    
    this.taskCount++;
    
    // 发送到监控服务
    this.sendLongTaskData(longTaskData);
  }
  
  getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  getPerformanceInfo() {
    return {
      navigationType: performance.getEntriesByType('navigation')[0]?.type,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
    };
  }
  
  sendLongTaskData(data) {
    if (this.options.reportUrl) {
      // 使用 sendBeacon 确保数据发送，即使页面即将关闭
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          this.options.reportUrl,
          JSON.stringify(data)
        );
      } else {
        // 降级处理
        fetch(this.options.reportUrl, {
          method: 'POST',
          body: JSON.stringify(data),
          keepalive: true // 在页面关闭时也尝试发送
        }).catch(() => {
          // 静默处理错误
        });
      }
    } else {
      // 开发环境下打印到控制台
      console.log('Long Task:', data);
    }
  }
}

// 初始化生产环境监控
const prodLongTaskMonitor = new ProductionLongTaskMonitor({
  threshold: 50, // 50ms 以上为长任务
  sampleRate: 0.1, // 10% 采样率
  maxTasks: 50, // 最多记录50个长任务
  reportUrl: '/api/performance/longtask'
});
```

## 关键要点

1. **Long Task API** 是检测主线程阻塞的标准方式
2. **阈值**：浏览器默认将执行时间超过 50ms 的任务标记为长任务
3. **分类**：可以区分不同类型来源的长任务
4. **上报策略**：生产环境中需要考虑采样率和数据量
5. **结合其他指标**：与 FCP、LCP、FID、CLS 等核心 Web 指标结合分析
6. **优化建议**：根据长任务分析结果进行性能优化

通过以上方法，可以有效地监控和分析页面中的长任务，从而优化用户体验和页面性能。
