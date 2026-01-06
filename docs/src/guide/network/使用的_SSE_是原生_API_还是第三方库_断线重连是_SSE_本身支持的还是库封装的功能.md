# 使用的 SSE 是原生 API 还是第三方库？断线重连是 SSE 本身支持的还是库封装的功能？（了解）

**题目**: 使用的 SSE 是原生 API 还是第三方库？断线重连是 SSE 本身支持的还是库封装的功能？（了解）

## 标准答案

1. **SSE API 类型**：SSE（Server-Sent Events）使用的是浏览器原生 API，即 `EventSource` 对象，无需引入第三方库即可使用。

2. **断线重连机制**：
   - 原生 `EventSource` 对象具备基本的自动重连功能，当连接断开时会自动尝试重连
   - 原生重连机制较为基础，无法自定义重连策略、重连间隔或重连次数
   - 高级的断线重连功能（如指数退避、心跳检测、状态管理等）需要通过第三方库或手动封装实现

## 深入分析

### 1. 原生 EventSource API

`EventSource` 是浏览器提供的原生 API，用于建立与服务器的单向实时连接。它基于 HTTP 协议，服务器通过 `text/event-stream` MIME 类型持续向客户端推送数据。

### 2. 原生重连机制

原生 `EventSource` 对象确实内置了基本的重连功能：
- 当连接意外断开时，浏览器会自动尝试重连
- 重连间隔由浏览器决定，通常从较短时间开始，逐渐增加
- 可以通过服务器发送的 `retry` 事件类型来建议重连间隔

### 3. 重连功能的局限性

原生重连机制存在以下局限：
- 无法自定义重连策略和重试次数
- 无法处理特定的错误类型
- 无法实现复杂的状态管理
- 无法进行心跳检测来确认连接状态

### 4. 第三方库的优势

第三方库通常提供更完善的重连机制，包括：
- 自定义重连间隔和重试次数
- 指数退避算法
- 心跳检测机制
- 连接状态管理
- 更好的错误处理

## 代码详解

### 1. 原生 EventSource 基本用法

```javascript
// 基本的 EventSource 使用
const eventSource = new EventSource('/api/events');

eventSource.onopen = function(event) {
  console.log('SSE 连接已建立');
};

eventSource.onmessage = function(event) {
  console.log('收到消息:', event.data);
};

eventSource.onerror = function(event) {
  console.log('SSE 连接出错:', event);
  // 原生 EventSource 会自动尝试重连
};
```

### 2. 原生重连机制示例

```javascript
// 服务器端可以发送 retry 指令来建议重连间隔
// 服务器响应示例：
// retry: 10000\n
// data: {"message": "Hello World"}\n\n

const eventSource = new EventSource('/api/events');

// 服务器建议的重连间隔为 10 秒
eventSource.onerror = function(event) {
  console.log('连接错误，浏览器将按服务器建议的间隔自动重连');
};
```

### 3. 手动封装高级重连功能

```javascript
class AdvancedSSE {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectAttempts = 0;
    this.shouldReconnect = true;
    
    this.connect();
  }
  
  connect() {
    try {
      this.eventSource = new EventSource(this.url, this.options);
      this.setupEventHandlers();
    } catch (error) {
      console.error('创建 EventSource 失败:', error);
      this.handleReconnect();
    }
  }
  
  setupEventHandlers() {
    this.eventSource.onopen = (event) => {
      console.log('SSE 连接已建立');
      this.reconnectAttempts = 0; // 重置重连次数
      if (this.onopen) this.onopen(event);
    };
    
    this.eventSource.onmessage = (event) => {
      if (this.onmessage) this.onmessage(event);
    };
    
    this.eventSource.onerror = (event) => {
      console.log('SSE 连接出错:', event);
      
      // 如果连接被关闭（例如服务器主动关闭），则不重连
      if (this.eventSource.readyState === EventSource.CLOSED) {
        console.log('连接已关闭，不再重连');
        return;
      }
      
      if (this.shouldReconnect) {
        this.handleReconnect();
      }
      
      if (this.onerror) this.onerror(event);
    };
  }
  
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`已达到最大重连次数 ${this.maxReconnectAttempts}，停止重连`);
      if (this.onmaxretries) this.onmaxretries();
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`尝试第 ${this.reconnectAttempts} 次重连...`);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, this.reconnectInterval);
  }
  
  close() {
    this.shouldReconnect = false;
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

// 使用示例
const advancedSSE = new AdvancedSSE('/api/events', {
  reconnectInterval: 5000,      // 5秒重连间隔
  maxReconnectAttempts: 10      // 最大重连10次
});

advancedSSE.onopen = (event) => {
  console.log('连接已建立');
};

advancedSSE.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

advancedSSE.onerror = (event) => {
  console.log('连接错误:', event);
};

advancedSSE.onmaxretries = () => {
  console.log('已达到最大重连次数');
};
```

### 4. 指数退避重连策略

```javascript
class ExponentialBackoffSSE {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.baseReconnectInterval = options.baseReconnectInterval || 1000;  // 基础重连间隔
    this.maxReconnectInterval = options.maxReconnectInterval || 30000;   // 最大重连间隔
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity; // 最大重连次数
    this.reconnectAttempts = 0;
    this.shouldReconnect = true;
    
    this.connect();
  }
  
  connect() {
    try {
      this.eventSource = new EventSource(this.url, this.options);
      this.setupEventHandlers();
    } catch (error) {
      console.error('创建 EventSource 失败:', error);
      this.handleReconnect();
    }
  }
  
  setupEventHandlers() {
    this.eventSource.onopen = (event) => {
      console.log('SSE 连接已建立');
      this.reconnectAttempts = 0; // 重置重连次数
      if (this.onopen) this.onopen(event);
    };
    
    this.eventSource.onmessage = (event) => {
      if (this.onmessage) this.onmessage(event);
    };
    
    this.eventSource.onerror = (event) => {
      console.log('SSE 连接出错:', event);
      
      if (this.eventSource.readyState === EventSource.CLOSED) {
        console.log('连接已关闭，不再重连');
        return;
      }
      
      if (this.shouldReconnect) {
        this.handleReconnect();
      }
      
      if (this.onerror) this.onerror(event);
    };
  }
  
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`已达到最大重连次数 ${this.maxReconnectAttempts}，停止重连`);
      if (this.onmaxretries) this.onmaxretries();
      return;
    }
    
    // 指数退避算法：重连间隔 = 基础间隔 * 2^重连次数
    const reconnectInterval = Math.min(
      this.baseReconnectInterval * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectInterval
    );
    
    // 添加随机抖动，避免同时重连
    const jitter = Math.random() * 0.3 * reconnectInterval;
    const actualReconnectInterval = reconnectInterval + jitter;
    
    this.reconnectAttempts++;
    console.log(`将在 ${Math.round(actualReconnectInterval / 1000)} 秒后进行第 ${this.reconnectAttempts} 次重连`);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, actualReconnectInterval);
  }
  
  close() {
    this.shouldReconnect = false;
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
```

### 5. 第三方库示例（使用 event-source-polyfill）

```javascript
// 使用第三方库 event-source-polyfill
import EventSource from 'event-source-polyfill';

// 第三方库通常提供更多配置选项
const eventSource = new EventSource('/api/events', {
  // 自定义请求头
  headers: {
    'Authorization': 'Bearer token'
  },
  // 自定义重连逻辑
  heartbeatTimeout: 60000,  // 心跳超时时间
  withCredentials: true     // 是否携带凭证
});

eventSource.onopen = function(event) {
  console.log('连接已建立');
};

eventSource.onmessage = function(event) {
  console.log('收到消息:', event.data);
};
```

## 实际应用场景

1. **实时通知系统**：使用原生 EventSource 实现基础的实时通知推送
2. **股票行情更新**：使用高级封装实现稳定的行情数据推送
3. **聊天应用**：结合 WebSocket 和 SSE，使用 SSE 推送公共消息
4. **进度更新**：使用 SSE 推送长时间运行任务的进度

## 注意事项

1. **浏览器兼容性**：确保目标浏览器支持 EventSource API
2. **连接管理**：在组件销毁时及时关闭 EventSource 连接
3. **错误处理**：合理处理各种错误情况，避免无限重连
4. **性能优化**：避免频繁创建和销毁 EventSource 实例
5. **安全考虑**：确保 SSE 接口的安全性，防止恶意连接

## 总结

SSE 使用的是浏览器原生的 `EventSource` API，无需第三方库即可使用。原生 API 提供了基本的自动重连功能，但高级的重连策略（如指数退避、心跳检测、状态管理等）需要通过第三方库或手动封装实现。在实际项目中，通常会基于原生 API 进行封装，以满足特定的业务需求。
