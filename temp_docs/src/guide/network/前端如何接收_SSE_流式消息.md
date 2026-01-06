# 前端如何接收 SSE 流式消息？（了解）

**题目**: 前端如何接收 SSE 流式消息？（了解）

## 标准答案

前端接收 SSE 流式消息主要通过浏览器原生的 `EventSource` API：
1. 创建 `EventSource` 实例连接到服务器端点
2. 监听 `onmessage` 事件接收数据
3. 可选择监听 `onopen` 和 `onerror` 事件处理连接状态
4. 通过 `event.data` 获取服务器推送的消息内容
5. 使用 `close()` 方法关闭连接释放资源

## 深入分析

### 1. SSE 接收机制原理

SSE（Server-Sent Events）是一种基于 HTTP 的单向通信协议，允许服务器向客户端推送实时数据。前端通过 `EventSource` 接口建立持久连接，服务器以 `text/event-stream` 格式持续发送数据。

### 2. EventSource 接收流程

1. **连接建立**：发起 HTTP GET 请求到指定端点
2. **流式接收**：服务器持续发送数据，客户端实时接收
3. **自动重连**：连接断开时自动尝试重连
4. **事件处理**：根据事件类型处理不同类型的消息

### 3. 消息格式解析

SSE 消息遵循特定格式，包括事件类型、数据内容、重连间隔等字段，前端需要正确解析这些字段。

### 4. 错误处理和资源管理

接收过程中需要处理网络错误、服务器错误等异常情况，并在适当时候关闭连接释放资源。

## 代码详解

### 1. 基础消息接收

```javascript
// 创建 EventSource 连接
const eventSource = new EventSource('/api/stream');

// 监听消息事件
eventSource.onmessage = function(event) {
  // event.data 包含服务器推送的数据
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
  
  // 在页面上显示消息
  displayMessage(data);
};

// 监听连接打开事件
eventSource.onopen = function(event) {
  console.log('SSE 连接已建立');
};

// 监听错误事件
eventSource.onerror = function(event) {
  console.log('SSE 连接出错:', event);
  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('连接已关闭');
  }
};

// 显示消息的函数
function displayMessage(data) {
  const messageContainer = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = `时间: ${new Date().toLocaleTimeString()} - ${JSON.stringify(data)}`;
  messageContainer.appendChild(messageElement);
}
```

### 2. 自定义事件类型处理

```javascript
// 创建 EventSource 连接
const eventSource = new EventSource('/api/stream');

// 处理默认消息事件
eventSource.addEventListener('message', function(event) {
  console.log('默认消息:', event.data);
});

// 处理自定义事件类型
eventSource.addEventListener('notification', function(event) {
  const notification = JSON.parse(event.data);
  showNotification(notification);
});

eventSource.addEventListener('progress', function(event) {
  const progress = JSON.parse(event.data);
  updateProgressBar(progress);
});

eventSource.addEventListener('user-update', function(event) {
  const userData = JSON.parse(event.data);
  updateUserInterface(userData);
});

// 显示通知
function showNotification(notification) {
  const notificationElement = document.createElement('div');
  notificationElement.className = 'notification';
  notificationElement.textContent = `${notification.title}: ${notification.message}`;
  document.body.appendChild(notificationElement);
}

// 更新进度条
function updateProgressBar(progress) {
  const progressBar = document.getElementById('progress');
  progressBar.style.width = `${progress.percentage}%`;
  progressBar.textContent = `${progress.percentage}%`;
}

// 更新用户界面
function updateUserInterface(userData) {
  const userElement = document.getElementById('user-info');
  userElement.innerHTML = `
    <p>用户名: ${userData.name}</p>
    <p>状态: ${userData.status}</p>
  `;
}
```

### 3. 高级消息处理和状态管理

```javascript
class SSEMessageHandler {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.isConnected = false;
    this.messageBuffer = []; // 消息缓冲区
    this.messageHandlers = new Map(); // 消息处理器映射
    this.maxBufferSize = options.maxBufferSize || 100; // 最大缓冲区大小
    
    this.initialize();
  }
  
  initialize() {
    this.connect();
    this.setupDefaultHandlers();
  }
  
  connect() {
    try {
      // 可以添加自定义头部
      if (this.options.withCredentials) {
        // 对于需要认证的请求，可能需要使用第三方库
        this.eventSource = new EventSource(this.url);
      } else {
        this.eventSource = new EventSource(this.url);
      }
      
      this.setupEventHandlers();
    } catch (error) {
      console.error('创建 EventSource 失败:', error);
      this.handleError(error);
    }
  }
  
  setupEventHandlers() {
    this.eventSource.onopen = (event) => {
      console.log('SSE 连接已建立');
      this.isConnected = true;
      
      // 连接建立后处理缓冲区中的消息
      this.processBufferedMessages();
      
      // 触发连接建立回调
      if (this.onConnect) {
        this.onConnect(event);
      }
    };
    
    this.eventSource.onmessage = (event) => {
      this.handleMessage('message', event);
    };
    
    this.eventSource.onerror = (event) => {
      console.error('SSE 连接出错:', event);
      this.isConnected = false;
      
      // 触发错误回调
      if (this.onError) {
        this.onError(event);
      }
      
      // 根据错误类型决定是否重连
      if (this.eventSource.readyState === EventSource.CLOSED) {
        console.log('连接已关闭，不再自动重连');
      }
    };
  }
  
  setupDefaultHandlers() {
    // 注册默认的消息处理器
    this.on('notification', (data) => {
      this.showNotification(data);
    });
    
    this.on('data-update', (data) => {
      this.updateData(data);
    });
    
    this.on('system-message', (data) => {
      this.logSystemMessage(data);
    });
  }
  
  // 注册消息处理器
  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType).push(handler);
  }
  
  // 处理消息
  handleMessage(eventType, event) {
    const data = this.parseData(event.data);
    
    // 添加时间戳
    data.timestamp = new Date().toISOString();
    
    // 如果连接已建立，直接处理消息
    if (this.isConnected) {
      this.processMessage(eventType, data);
    } else {
      // 否则先缓冲消息
      this.bufferMessage(eventType, data);
    }
  }
  
  // 解析数据
  parseData(data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // 如果不是 JSON 格式，返回原始数据
      return { raw: data };
    }
  }
  
  // 处理消息
  processMessage(eventType, data) {
    const handlers = this.messageHandlers.get(eventType) || [];
    
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`处理 ${eventType} 消息时出错:`, error);
      }
    });
    
    // 触发通用消息回调
    if (this.onMessage) {
      this.onMessage(eventType, data);
    }
  }
  
  // 缓冲消息
  bufferMessage(eventType, data) {
    this.messageBuffer.push({ eventType, data, timestamp: Date.now() });
    
    // 控制缓冲区大小
    if (this.messageBuffer.length > this.maxBufferSize) {
      this.messageBuffer.shift(); // 移除最旧的消息
    }
  }
  
  // 处理缓冲区中的消息
  processBufferedMessages() {
    this.messageBuffer.forEach(({ eventType, data }) => {
      this.processMessage(eventType, data);
    });
    
    // 清空缓冲区
    this.messageBuffer = [];
  }
  
  // 显示通知
  showNotification(notification) {
    // 创建通知元素
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification';
    notificationElement.innerHTML = `
      <strong>${notification.title}</strong>
      <p>${notification.message}</p>
      <small>${new Date(notification.timestamp).toLocaleString()}</small>
    `;
    
    // 添加到通知容器
    const container = document.getElementById('notifications') || document.body;
    container.appendChild(notificationElement);
    
    // 设置自动消失
    setTimeout(() => {
      notificationElement.remove();
    }, 5000);
  }
  
  // 更新数据
  updateData(data) {
    console.log('更新数据:', data);
    // 这里可以更新页面上的数据展示
    const dataElement = document.getElementById('data-display');
    if (dataElement) {
      dataElement.innerHTML = JSON.stringify(data, null, 2);
    }
  }
  
  // 记录系统消息
  logSystemMessage(message) {
    console.log('系统消息:', message);
    // 可以记录到日志或显示在特定区域
  }
  
  // 错误处理
  handleError(error) {
    console.error('SSE 处理错误:', error);
    if (this.onError) {
      this.onError(error);
    }
  }
  
  // 关闭连接
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.isConnected = false;
      console.log('SSE 连接已关闭');
    }
  }
}

// 使用示例
const sseHandler = new SSEMessageHandler('/api/stream', {
  maxBufferSize: 50
});

// 设置回调
sseHandler.onConnect = (event) => {
  console.log('连接已建立');
};

sseHandler.onError = (error) => {
  console.log('发生错误:', error);
};

sseHandler.onMessage = (eventType, data) => {
  console.log(`收到 ${eventType} 消息:`, data);
};

// 注册自定义消息处理器
sseHandler.on('custom-event', (data) => {
  console.log('处理自定义事件:', data);
});
```

### 4. React 中的 SSE 消息接收

```jsx
import React, { useState, useEffect, useCallback } from 'react';

// SSE Hook
function useSSE(url, eventHandlers = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestMessage, setLatestMessage] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let eventSource = null;

    const connect = () => {
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('SSE 连接已建立');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLatestMessage(data);
        
        // 添加到消息列表
        setMessages(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          data,
          type: 'message'
        }]);
        
        // 调用消息处理器
        if (eventHandlers.onMessage) {
          eventHandlers.onMessage(data);
        }
      };

      // 注册自定义事件处理器
      Object.keys(eventHandlers).forEach(eventType => {
        if (eventType !== 'onMessage' && eventType !== 'onError') {
          eventSource.addEventListener(eventType, (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              data,
              type: eventType
            }]);
            
            // 调用特定事件处理器
            eventHandlers[eventType](data);
          });
        }
      });

      eventSource.onerror = (event) => {
        console.error('SSE 连接错误:', event);
        setIsConnected(false);
        
        if (eventHandlers.onError) {
          eventHandlers.onError(event);
        }
      };
    };

    connect();

    // 清理函数
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [url, eventHandlers]);

  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  }, []);

  return {
    isConnected,
    latestMessage,
    messages,
    closeConnection
  };
}

// 在组件中使用
function SSEComponent() {
  const [notifications, setNotifications] = useState([]);
  
  const eventHandlers = {
    onMessage: (data) => {
      console.log('收到消息:', data);
    },
    notification: (data) => {
      setNotifications(prev => [...prev, data]);
    },
    progress: (data) => {
      console.log('进度更新:', data);
      // 更新进度条
    }
  };

  const { isConnected, latestMessage, messages, closeConnection } = useSSE(
    '/api/stream',
    eventHandlers
  );

  return (
    <div>
      <h2>SSE 流式消息接收</h2>
      <p>连接状态: {isConnected ? '已连接' : '未连接'}</p>
      
      {latestMessage && (
        <div>
          <h3>最新消息</h3>
          <pre>{JSON.stringify(latestMessage, null, 2)}</pre>
        </div>
      )}
      
      <div>
        <h3>消息历史</h3>
        {messages.map(msg => (
          <div key={msg.id} className="message-item">
            <p>类型: {msg.type}</p>
            <p>时间: {new Date(msg.timestamp).toLocaleString()}</p>
            <pre>{JSON.stringify(msg.data, null, 2)}</pre>
          </div>
        ))}
      </div>
      
      <button onClick={closeConnection}>关闭连接</button>
    </div>
  );
}

// 创建一个 ref 来存储 eventSource 实例
const eventSourceRef = { current: null };

// 更新 Hook 以使用 ref
function useSSEWithRef(url, eventHandlers = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestMessage, setLatestMessage] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onopen = () => {
      console.log('SSE 连接已建立');
      setIsConnected(true);
    };

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLatestMessage(data);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data,
        type: 'message'
      }]);
      
      if (eventHandlers.onMessage) {
        eventHandlers.onMessage(data);
      }
    };

    Object.keys(eventHandlers).forEach(eventType => {
      if (eventType !== 'onMessage' && eventType !== 'onError') {
        eventSourceRef.current.addEventListener(eventType, (event) => {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            data,
            type: eventType
          }]);
          
          eventHandlers[eventType](data);
        });
      }
    });

    eventSourceRef.current.onerror = (event) => {
      console.error('SSE 连接错误:', event);
      setIsConnected(false);
      
      if (eventHandlers.onError) {
        eventHandlers.onError(event);
      }
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [url, eventHandlers]);

  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  return {
    isConnected,
    latestMessage,
    messages,
    closeConnection
  };
}
```

### 5. 消息解析和数据处理

```javascript
// SSE 消息解析器
class SSEMessageParser {
  constructor() {
    this.buffer = '';
    this.headers = {};
  }
  
  // 解析服务器发送的原始数据
  parseRawData(rawData) {
    // SSE 消息格式解析
    const lines = rawData.split('\n');
    const event = {
      data: '',
      event: 'message', // 默认事件类型
      id: null,
      retry: null
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('data: ')) {
        event.data += line.slice(6) + '\n'; // 移除 'data: ' 前缀
      } else if (line.startsWith('event: ')) {
        event.event = line.slice(7); // 移除 'event: ' 前缀
      } else if (line.startsWith('id: ')) {
        event.id = line.slice(4); // 移除 'id: ' 前缀
      } else if (line.startsWith('retry: ')) {
        event.retry = parseInt(line.slice(7)); // 移除 'retry: ' 前缀
      } else if (line === '') {
        // 空行表示消息结束
        break;
      }
    }
    
    // 移除末尾多余的换行符
    if (event.data.endsWith('\n')) {
      event.data = event.data.slice(0, -1);
    }
    
    return event;
  }
  
  // 解析并处理接收到的消息
  processReceivedMessage(event) {
    try {
      // 解析数据
      let parsedData;
      try {
        parsedData = JSON.parse(event.data);
      } catch (e) {
        // 如果不是 JSON 格式，保留原始数据
        parsedData = event.data;
      }
      
      // 创建消息对象
      const message = {
        type: event.event,
        data: parsedData,
        id: event.id,
        timestamp: new Date().toISOString()
      };
      
      return message;
    } catch (error) {
      console.error('解析 SSE 消息失败:', error);
      return null;
    }
  }
}

// 实际使用中的消息处理器
function createSSEMessageHandler(url) {
  const eventSource = new EventSource(url);
  const parser = new SSEMessageParser();
  
  // 消息处理回调
  const messageCallbacks = new Map();
  
  // 注册消息处理器
  function on(eventType, callback) {
    if (!messageCallbacks.has(eventType)) {
      messageCallbacks.set(eventType, []);
    }
    messageCallbacks.get(eventType).push(callback);
  }
  
  // 消息接收处理
  eventSource.onmessage = function(event) {
    const message = parser.processReceivedMessage({
      data: event.data,
      event: 'message'
    });
    
    if (message) {
      // 调用对应类型的消息处理器
      const callbacks = messageCallbacks.get(message.type) || [];
      callbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`处理 ${message.type} 消息时出错:`, error);
        }
      });
      
      // 调用所有消息的通用处理器
      const allMessageCallbacks = messageCallbacks.get('all') || [];
      allMessageCallbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('处理通用消息时出错:', error);
        }
      });
    }
  };
  
  // 注册自定义事件处理器
  eventSource.addEventListener('custom-event', function(event) {
    const message = parser.processReceivedMessage({
      data: event.data,
      event: 'custom-event'
    });
    
    if (message) {
      const callbacks = messageCallbacks.get('custom-event') || [];
      callbacks.forEach(callback => {
        callback(message);
      });
    }
  });
  
  return {
    on,
    close: () => eventSource.close()
  };
}
```

## 实际应用场景

1. **实时通知系统**：接收服务器推送的系统通知、消息提醒
2. **股票行情更新**：实时获取股票价格、交易数据更新
3. **聊天应用**：接收其他用户发送的消息
4. **进度更新**：长任务执行进度的实时反馈
5. **监控数据**：服务器状态、性能指标的实时监控
6. **新闻推送**：实时新闻、资讯的推送更新

## 注意事项

1. **连接管理**：在页面卸载或组件销毁时及时关闭 EventSource 连接
2. **错误处理**：合理处理网络错误、服务器错误等异常情况
3. **消息解析**：正确解析服务器发送的消息格式，处理 JSON 和非 JSON 数据
4. **性能优化**：避免在消息处理函数中执行耗时操作
5. **内存管理**：及时清理不再需要的消息数据，避免内存泄漏
6. **安全性**：验证消息来源，防止 XSS 攻击
7. **浏览器兼容性**：检查目标浏览器是否支持 EventSource API
8. **流量控制**：对于高频消息，考虑节流或缓冲机制

## 总结

前端接收 SSE 流式消息主要通过 `EventSource` API 实现，可以监听不同类型的事件来处理服务器推送的数据。在实际应用中，通常需要封装更高级的管理器来处理连接状态、错误处理、消息解析等功能，以满足复杂的业务需求。
