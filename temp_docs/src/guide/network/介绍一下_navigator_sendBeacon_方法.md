# 介绍一下 navigator.sendBeacon 方法？（了解）

**题目**: 介绍一下 navigator.sendBeacon 方法？（了解）

## 标准答案

`navigator.sendBeacon()` 是一个 Web API 方法，用于在页面卸载（如用户导航到其他页面或关闭标签页）时可靠地向服务器发送少量数据，而不会影响下一个页面的加载性能。它确保数据能够被发送，即使在页面生命周期的最后阶段也能保持高可靠性。

## 深入分析

### 1. sendBeacon 方法的工作原理

`navigator.sendBeacon()` 方法通过以下机制确保数据发送的可靠性：

- **异步发送**：数据在后台异步发送，不会阻塞页面卸载或影响下一个页面的加载
- **持久连接**：使用持久连接确保请求能够完成发送
- **浏览器优化**：浏览器会在页面卸载后继续处理请求，直到发送完成或达到超时

### 2. 使用场景

- **性能监控**：发送页面加载时间、资源加载时间等性能数据
- **用户行为分析**：记录用户在页面上的行为数据，如停留时间、滚动深度等
- **错误上报**：发送页面错误信息、崩溃报告等
- **会话追踪**：记录用户会话数据、页面停留时间等

### 3. 与传统方法的对比

相比传统的 `XMLHttpRequest` 或 `fetch`，`sendBeacon` 在页面卸载时有明显优势：

- 传统方法可能因为页面卸载而中断请求
- `sendBeacon` 确保请求在页面卸载后继续执行
- 不会影响下一个页面的加载性能

## 代码实现

### 1. 基础使用示例

```javascript
// 发送简单的统计数据
function sendAnalyticsData() {
  const data = {
    url: window.location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };

  // 将数据转换为字符串
  const blob = new Blob([JSON.stringify(data)], {
    type: 'application/json'
  });

  // 使用 sendBeacon 发送数据
  navigator.sendBeacon('/analytics', blob);
}

// 在页面卸载时发送数据
window.addEventListener('beforeunload', sendAnalyticsData);
```

### 2. 性能监控数据收集

```javascript
// 性能监控类
class PerformanceTracker {
  constructor() {
    this.navigationStart = performance.timing.navigationStart;
    this.data = {};
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 页面卸载时发送性能数据
    window.addEventListener('beforeunload', () => {
      this.collectPerformanceData();
      this.sendData();
    });

    // 页面隐藏时发送数据（如切换标签页）
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.collectPerformanceData();
        this.sendData();
      }
    });
  }

  collectPerformanceData() {
    const timing = performance.timing;
    
    this.data = {
      // 导航时间
      navigation: {
        redirectTime: timing.redirectEnd - timing.redirectStart,
        appCacheTime: timing.domainLookupStart - timing.fetchStart,
        dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
        tcpTime: timing.connectEnd - timing.connectStart,
        requestTime: timing.responseEnd - timing.requestStart,
        responseTime: timing.responseEnd - timing.responseStart,
        domProcessingTime: timing.domContentLoadedEventEnd - timing.domLoading,
        domContentLoadedTime: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadEventTime: timing.loadEventEnd - timing.loadEventStart
      },
      
      // 资源加载时间
      resourceTimings: this.getResourceTimings(),
      
      // 页面信息
      pageInfo: {
        url: window.location.href,
        referrer: document.referrer,
        title: document.title
      },
      
      // 时间戳
      timestamp: Date.now()
    };
  }

  getResourceTimings() {
    // 获取资源加载时间（需要 Performance Resource Timing API）
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      return resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        startTime: resource.startTime,
        transferSize: resource.transferSize || 0
      }));
    }
    return [];
  }

  sendData() {
    if (Object.keys(this.data).length > 0) {
      try {
        const blob = new Blob([JSON.stringify(this.data)], {
          type: 'application/json'
        });
        
        const success = navigator.sendBeacon('/performance-data', blob);
        
        if (!success) {
          console.warn('Beacon data sending failed');
        }
      } catch (error) {
        console.error('Error sending beacon data:', error);
      }
    }
  }
}

// 初始化性能监控
const performanceTracker = new PerformanceTracker();
```

### 3. 用户行为追踪

```javascript
// 用户行为追踪类
class UserBehaviorTracker {
  constructor() {
    this.sessionData = {
      startTime: Date.now(),
      events: [],
      scrollDepth: 0,
      timeOnPage: 0
    };
    
    this.setupTracking();
  }

  setupTracking() {
    // 记录页面滚动
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.sessionData.scrollDepth = maxScroll;
      }
    });

    // 记录点击事件
    document.addEventListener('click', (event) => {
      this.sessionData.events.push({
        type: 'click',
        target: event.target.tagName,
        timestamp: Date.now(),
        x: event.clientX,
        y: event.clientY
      });
    });

    // 记录键盘事件
    document.addEventListener('keydown', (event) => {
      this.sessionData.events.push({
        type: 'keydown',
        key: event.key,
        timestamp: Date.now()
      });
    });

    // 页面卸载时发送数据
    window.addEventListener('beforeunload', () => {
      this.sessionData.timeOnPage = Date.now() - this.sessionData.startTime;
      this.sendSessionData();
    });
  }

  sendSessionData() {
    const data = {
      ...this.sessionData,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      });
      
      // 发送用户行为数据
      navigator.sendBeacon('/user-behavior', blob);
    } catch (error) {
      console.error('Error sending user behavior data:', error);
    }
  }
}

// 启动用户行为追踪
const userBehaviorTracker = new UserBehaviorTracker();
```

### 4. 错误上报系统

```javascript
// 错误上报系统
class ErrorReporter {
  constructor() {
    this.errors = [];
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    // 捕获 JavaScript 错误
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null,
        timestamp: Date.now()
      });
    });

    // 捕获 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'promise',
        message: event.reason ? event.reason.toString() : 'Unhandled Promise Rejection',
        stack: event.reason && event.reason.stack ? event.reason.stack : null,
        timestamp: Date.now()
      });
    });

    // 页面卸载时发送错误数据
    window.addEventListener('beforeunload', () => {
      if (this.errors.length > 0) {
        this.sendErrors();
      }
    });
  }

  logError(error) {
    this.errors.push({
      ...error,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });
  }

  sendErrors() {
    if (this.errors.length === 0) return;

    const data = {
      errors: this.errors,
      sessionInfo: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      }
    };

    try {
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      });
      
      const success = navigator.sendBeacon('/error-report', blob);
      
      if (success) {
        console.log(`Sent ${this.errors.length} error(s) to server`);
        this.errors = []; // 清空已发送的错误
      } else {
        console.warn('Failed to send error report via beacon');
      }
    } catch (error) {
      console.error('Error preparing beacon data:', error);
    }
  }
}

// 初始化错误上报
const errorReporter = new ErrorReporter();
```

### 5. 高级使用模式

```javascript
// 高级 Beacon 管理器
class AdvancedBeaconManager {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/beacon';
    this.batchSize = options.batchSize || 5;
    this.sendInterval = options.sendInterval || 30000; // 30秒
    this.queue = [];
    this.isSending = false;
    
    // 定期发送队列中的数据
    setInterval(() => {
      if (this.queue.length > 0) {
        this.sendBatch();
      }
    }, this.sendInterval);
    
    // 页面卸载时发送剩余数据
    window.addEventListener('beforeunload', () => {
      if (this.queue.length > 0) {
        this.sendBatch();
      }
    });
  }

  // 添加数据到队列
  queueData(data) {
    this.queue.push({
      ...data,
      timestamp: Date.now()
    });

    // 如果队列达到批量大小，立即发送
    if (this.queue.length >= this.batchSize) {
      this.sendBatch();
    }
  }

  // 发送批量数据
  async sendBatch() {
    if (this.isSending || this.queue.length === 0) {
      return;
    }

    this.isSending = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      const blob = new Blob([JSON.stringify(batch)], {
        type: 'application/json'
      });

      const success = navigator.sendBeacon(this.endpoint, blob);
      
      if (success) {
        console.log(`Sent batch of ${batch.length} items via beacon`);
      } else {
        console.warn('Beacon batch send failed');
        // 如果失败，将数据放回队列（这里可以实现重试逻辑）
        this.queue.unshift(...batch);
      }
    } catch (error) {
      console.error('Error sending beacon batch:', error);
      // 发生错误时将数据放回队列
      this.queue.unshift(...batch);
    } finally {
      this.isSending = false;
    }
  }

  // 立即发送单个数据项
  sendImmediate(data) {
    try {
      const blob = new Blob([JSON.stringify({
        ...data,
        timestamp: Date.now()
      })], {
        type: 'application/json'
      });

      return navigator.sendBeacon(this.endpoint, blob);
    } catch (error) {
      console.error('Error sending immediate beacon:', error);
      return false;
    }
  }
}

// 使用示例
const beaconManager = new AdvancedBeaconManager({
  endpoint: '/api/analytics',
  batchSize: 3,
  sendInterval: 10000
});

// 队列化发送数据
beaconManager.queueData({
  type: 'page_view',
  url: window.location.href,
  title: document.title
});

beaconManager.queueData({
  type: 'user_action',
  action: 'button_click',
  element: 'submit_button'
});
```

## 实际应用场景

### 1. 电商网站用户行为分析
在电商网站中，可以使用 sendBeacon 来追踪用户在商品页面的停留时间、滚动深度、点击行为等，即使用户离开页面也能确保数据被收集。

### 2. 内容网站阅读时长统计
对于新闻或博客网站，可以统计用户阅读文章的实际时长，帮助内容创作者了解内容的吸引力。

### 3. 表单完成率分析
跟踪用户在表单填写过程中的进度，分析哪些步骤导致用户流失。

## 注意事项

1. **数据大小限制**：sendBeacon 有数据大小限制（通常约64KB），不适合发送大量数据
2. **不可取消**：一旦调用 sendBeacon，请求无法取消
3. **不支持响应处理**：无法获取服务器响应，只能知道请求是否成功发送
4. **浏览器兼容性**：需要检查浏览器是否支持该 API
5. **安全限制**：受同源策略限制，需要发送到同源或配置了 CORS 的服务器

通过使用 navigator.sendBeacon 方法，可以确保在页面生命周期的最后阶段也能可靠地收集和发送重要数据，这对于用户体验分析、性能监控和错误追踪等场景非常有价值。
