# SSE 流式接口是标准的 HTTP 请求吗？（了解）

**题目**: SSE 流式接口是标准的 HTTP 请求吗？（了解）

**标准答案**:
SSE（Server-Sent Events）流式接口基于 HTTP 协议，但它不是标准的 HTTP 请求。SSE 使用 HTTP 协议建立一个持久连接，服务器可以持续向客户端推送数据，这与传统的请求-响应模式不同。SSE 是单向通信（服务器到客户端），而标准 HTTP 是请求-响应模式。

**深入理解**:
SSE（Server-Sent Events）的详细说明：

**SSE 与标准 HTTP 的区别**:

1. **连接模式**：
   - 标准 HTTP：短连接，请求-响应后连接关闭
   - SSE：长连接，建立一次连接后保持打开状态

2. **通信方向**：
   - 标准 HTTP：双向通信（客户端请求，服务器响应）
   - SSE：单向通信（仅服务器到客户端）

3. **数据格式**：
   - 标准 HTTP：返回完整的响应体
   - SSE：以文本流形式发送数据，每条消息以特定格式分隔

**SSE 协议格式**:

服务器返回的 SSE 数据遵循特定格式：

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

SSE 消息格式：
- data: 消息内容
- event: 事件类型
- id: 事件 ID
- retry: 重连时间

**SSE 客户端实现**:

```javascript
// 创建 SSE 连接
const eventSource = new EventSource('/api/events');

// 监听消息事件
eventSource.onmessage = function(event) {
  console.log('收到消息:', event.data);
  // 处理服务器发送的数据
  const data = JSON.parse(event.data);
  updateUI(data);
};

// 监听自定义事件
eventSource.addEventListener('notification', function(event) {
  console.log('收到通知:', event.data);
});

// 连接打开时
eventSource.onopen = function(event) {
  console.log('SSE 连接已建立');
};

// 错误处理
eventSource.onerror = function(event) {
  console.error('SSE 连接错误:', event);
  
  // 可以在这里进行重连逻辑
  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('连接已关闭，尝试重连...');
  }
};

// 手动关闭连接
// eventSource.close();
```

**SSE 服务端实现示例**（Node.js）:

```javascript
// Express.js 服务端实现
app.get('/api/events', (req, res) => {
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 发送数据的函数
  function sendEvent(data, event = 'message', id = null) {
    if (id) {
      res.write(`id: ${id}\n`);
    }
    if (event) {
      res.write(`event: ${event}\n`);
    }
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  
  // 定期发送数据
  const interval = setInterval(() => {
    const timestamp = new Date().toISOString();
    sendEvent({
      message: `服务器时间: ${timestamp}`,
      count: Math.floor(Math.random() * 100)
    });
  }, 2000);
  
  // 客户端断开连接时清理
  req.on('close', () => {
    console.log('客户端断开连接');
    clearInterval(interval);
  });
  
  // 发送初始连接确认
  sendEvent({ status: 'connected' }, 'connected');
});
```

**SSE 管理类实现**:

```javascript
class SSEManager {
  constructor(url) {
    this.url = url;
    this.eventSource = null;
    this.reconnectInterval = 3000;
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.messageHandlers = new Map();
    this.isConnected = false;
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(this.url);
        
        this.eventSource.onopen = (event) => {
          console.log('SSE 连接已建立');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(event);
        };
        
        this.eventSource.onmessage = (event) => {
          this.handleMessage('message', event.data);
        };
        
        this.eventSource.onerror = (event) => {
          console.error('SSE 连接错误:', event);
          this.isConnected = false;
          
          // 尝试重连
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`SSE 重连尝试 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
              this.connect();
            }, this.reconnectInterval);
          } else {
            console.error('SSE 重连失败，达到最大重试次数');
            reject(event);
          }
        };
        
        // 监听所有自定义事件
        // 可以通过 addEventListener 添加更多事件处理器
      } catch (error) {
        console.error('创建 SSE 连接失败:', error);
        reject(error);
      }
    });
  }
  
  // 添加事件监听器
  addEventListener(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType).push(handler);
    
    // 如果 EventSource 已存在，直接添加监听器
    if (this.eventSource) {
      this.eventSource.addEventListener(eventType, (event) => {
        handler(event.data);
      });
    }
  }
  
  // 处理消息
  handleMessage(eventType, data) {
    const handlers = this.messageHandlers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`处理 ${eventType} 事件时出错:`, error);
      }
    });
  }
  
  // 关闭连接
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.isConnected = false;
      console.log('SSE 连接已关闭');
    }
  }
  
  // 获取连接状态
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.eventSource ? this.eventSource.readyState : null
    };
  }
}

// 使用示例
const sseManager = new SSEManager('/api/events');

// 添加消息处理器
sseManager.addEventListener('message', (data) => {
  console.log('收到消息:', data);
});

sseManager.addEventListener('notification', (data) => {
  console.log('收到通知:', data);
});

// 连接 SSE
sseManager.connect()
  .then(() => {
    console.log('SSE 连接成功');
  })
  .catch(error => {
    console.error('SSE 连接失败:', error);
  });
```

**SSE 与 WebSocket 的比较**:

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 单向（服务器→客户端） | 双向 |
| 协议基础 | HTTP | 独立协议 |
| 连接 | 长连接 | 长连接 |
| 数据格式 | 文本流 | 二进制/文本 |
| 浏览器支持 | 较好（除 IE 外） | 很好 |
| 复杂性 | 简单 | 相对复杂 |

**实际应用场景**:
- 实时通知系统
- 股票价格更新
- 新闻推送
- 日志实时查看
- 进度更新（如文件上传进度）
