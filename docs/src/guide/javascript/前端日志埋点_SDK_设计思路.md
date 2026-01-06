# 前端日志埋点 SDK 设计思路？（了解）

**题目**: 前端日志埋点 SDK 设计思路？（了解）

**答案**:

前端日志埋点 SDK 的设计思路主要围绕数据采集、存储、传输、性能优化和错误处理等方面展开。以下是详细的设计思路：

## 1. 数据采集策略

### 自动埋点
- DOM 事件监听：自动监听点击、滚动、页面加载等事件
- 路由变化监听：捕获页面跳转和路由变化
- 性能指标采集：页面加载时间、资源加载时间、FPS 等

```javascript
// 示例：自动埋点实现
class AutoTrack {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    // 监听点击事件
    document.addEventListener('click', (event) => {
      this.trackClick(event);
    });

    // 监听路由变化
    if (window.history.pushState) {
      const originalPushState = window.history.pushState;
      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args);
        this.trackPageView();
      }.bind(this);
    }
  }

  trackClick(event) {
    const element = event.target;
    const trackData = {
      type: 'click',
      element: element.tagName,
      text: element.innerText || element.value,
      timestamp: Date.now(),
      url: window.location.href
    };
    
    Tracker.send(trackData);
  }
}
```

### 手动埋点
- 提供 API 接口供开发者手动触发埋点
- 支持自定义事件和属性

```javascript
// 手动埋点 API
Tracker.track('custom_event', {
  page: 'product_detail',
  action: 'add_to_cart',
  productId: '12345'
});
```

## 2. 数据存储策略

### 本地缓存
- 使用 localStorage 或 sessionStorage 临时存储数据
- 防止网络异常时数据丢失

```javascript
class LocalStorage {
  constructor() {
    this.storageKey = 'tracker_queue';
  }

  save(data) {
    try {
      const queue = this.getQueue();
      queue.push(data);
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save tracking data:', error);
    }
  }

  getQueue() {
    try {
      const queue = localStorage.getItem(this.storageKey);
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  }

  remove(index) {
    const queue = this.getQueue();
    queue.splice(index, 1);
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
  }
}
```

### 发送策略
- 实时发送：立即发送数据
- 批量发送：累积一定数量后批量发送
- 定时发送：定时发送缓存中的数据

```javascript
class BatchSender {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.sendInterval = options.sendInterval || 30000; // 30秒
    this.queue = [];
    this.timer = null;
  }

  add(data) {
    this.queue.push(data);
    
    if (this.queue.length >= this.batchSize) {
      this.send();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.send();
        this.timer = null;
      }, this.sendInterval);
    }
  }

  send() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    this.sendToServer(batch);
  }

  sendToServer(data) {
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.error('Failed to send tracking data:', error);
      // 发送失败时存回本地
      data.forEach(item => LocalStorage.save(item));
    });
  }
}
```

## 3. SDK 核心架构

```javascript
class Tracker {
  constructor(config) {
    this.config = {
      appId: config.appId,
      apiEndpoint: config.apiEndpoint || '/api/track',
      enableAutoTrack: config.enableAutoTrack !== false,
      batchSize: config.batchSize || 10,
      ...config
    };

    this.sender = new BatchSender({
      batchSize: this.config.batchSize
    });

    this.storage = new LocalStorage();

    if (this.config.enableAutoTrack) {
      this.autoTrack = new AutoTrack();
    }

    this.init();
  }

  init() {
    // 恢复本地缓存的数据
    const cachedData = this.storage.getQueue();
    cachedData.forEach(data => {
      this.sender.add(data);
    });
  }

  track(event, properties = {}) {
    const trackData = {
      event,
      properties,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ...this.getCommonProperties()
    };

    this.sender.add(trackData);
    this.storage.save(trackData);
  }

  getCommonProperties() {
    return {
      page_title: document.title,
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      language: navigator.language,
      platform: navigator.platform
    };
  }
}
```

## 4. 性能优化策略

### 防抖和节流
- 对高频事件进行防抖或节流处理
- 避免重复上报相同事件

```javascript
// 防抖处理
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// 节流处理
function throttle(func, delay) {
  let lastExecTime = 0;
  return function(...args) {
    const currentTime = Date.now();
    if (currentTime - lastExecTime >= delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    }
  };
}
```

### 数据压缩
- 使用 gzip 压缩传输数据
- 对数据进行编码优化

## 5. 错误处理与容错

### 网络错误处理
- 重试机制：发送失败时进行重试
- 降级策略：网络异常时使用备用方案

```javascript
class NetworkHandler {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async sendWithRetry(data, retries = 0) {
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (retries < this.maxRetries) {
        // 延迟重试
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, retries))
        );
        return this.sendWithRetry(data, retries + 1);
      } else {
        // 保存到本地，稍后重试
        LocalStorage.save(data);
        throw error;
      }
    }
  }
}
```

### 数据校验
- 对上报的数据进行校验
- 防止恶意数据注入

## 6. 隐私与安全

### 数据脱敏
- 对敏感信息进行脱敏处理
- 遵循 GDPR 等隐私法规

### 权限控制
- 提供用户选择退出功能
- 支持数据删除请求

## 7. 使用示例

```javascript
// 初始化 SDK
const tracker = new Tracker({
  appId: 'your-app-id',
  apiEndpoint: 'https://api.example.com/track',
  enableAutoTrack: true
});

// 手动埋点
tracker.track('button_click', {
  button_name: 'submit',
  page: 'checkout'
});

// 页面级埋点
tracker.track('page_view', {
  page_name: 'product_detail',
  product_id: '12345'
});
```

通过以上设计思路，前端日志埋点 SDK 可以实现高效、稳定、安全的数据采集和上报功能。