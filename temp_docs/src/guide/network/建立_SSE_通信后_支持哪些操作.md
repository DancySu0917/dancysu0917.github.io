# 建立 SSE 通信后，支持哪些操作？（了解）

**题目**: 建立 SSE 通信后，支持哪些操作？（了解）

## 标准答案

建立 SSE 通信后，主要支持以下操作：

1. **接收消息**：通过 `onmessage` 事件处理器接收服务器推送的数据
2. **监听连接状态**：通过 `onopen` 和 `onerror` 事件了解连接状态
3. **处理自定义事件**：通过 `addEventListener` 监听特定事件类型
4. **关闭连接**：通过 `close()` 方法主动断开连接
5. **检查连接状态**：通过 `readyState` 属性获取当前连接状态

## 深入分析

### 1. SSE 操作类型

SSE（Server-Sent Events）建立连接后，客户端可以执行多种操作来管理连接和处理数据：

- **数据接收操作**：接收服务器推送的实时数据
- **状态监控操作**：监控连接的生命周期事件
- **事件处理操作**：处理不同类型的服务器事件
- **连接管理操作**：主动控制连接的开启和关闭

### 2. EventSource API 操作接口

`EventSource` 对象提供了标准化的接口来执行各种操作，包括事件监听、状态查询和连接控制。

### 3. 操作的实时性

SSE 的操作具有实时性，服务器可以随时推送数据，客户端可以实时响应连接状态变化。

### 4. 操作的单向性

SSE 是单向通信协议，客户端只能接收数据，不能向服务器发送数据（除了初始连接请求）。

## 代码详解

### 1. 基本操作 - 接收消息和状态监控

```javascript
// 创建 SSE 连接
const eventSource = new EventSource('/api/events');

// 1. 接收消息操作
eventSource.onmessage = function(event) {
  console.log('收到消息:', event.data);
  
  // 解析并处理数据
  try {
    const data = JSON.parse(event.data);
    handleReceivedData(data);
  } catch (error) {
    console.error('解析消息数据失败:', error);
    // 处理非 JSON 格式的数据
    handleRawData(event.data);
  }
};

// 2. 监听连接打开事件
eventSource.onopen = function(event) {
  console.log('SSE 连接已建立');
  updateConnectionStatus('connected');
  
  // 连接建立后可以执行一些初始化操作
  onConnectionEstablished();
};

// 3. 监听错误事件
eventSource.onerror = function(event) {
  console.error('SSE 连接出错:', event);
  
  // 检查连接状态
  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('连接已关闭');
    updateConnectionStatus('closed');
  } else if (eventSource.readyState === EventSource.CONNECTING) {
    console.log('正在重连...');
    updateConnectionStatus('reconnecting');
  }
};

// 4. 检查连接状态
function checkConnectionStatus() {
  const status = eventSource.readyState;
  switch(status) {
    case EventSource.CONNECTING:
      console.log('连接状态: CONNECTING (0)');
      break;
    case EventSource.OPEN:
      console.log('连接状态: OPEN (1)');
      break;
    case EventSource.CLOSED:
      console.log('连接状态: CLOSED (2)');
      break;
  }
  return status;
}

// 5. 关闭连接
function closeConnection() {
  eventSource.close();
  console.log('SSE 连接已关闭');
}

// 辅助函数
function handleReceivedData(data) {
  console.log('处理结构化数据:', data);
  // 根据数据类型执行不同处理逻辑
}

function handleRawData(data) {
  console.log('处理原始数据:', data);
  // 处理非 JSON 格式的数据
}

function updateConnectionStatus(status) {
  console.log(`连接状态更新: ${status}`);
  // 更新UI或其他状态管理
}

function onConnectionEstablished() {
  console.log('执行连接建立后的初始化操作');
}
```

### 2. 自定义事件类型处理

```javascript
// 创建 SSE 连接
const eventSource = new EventSource('/api/events');

// 1. 监听特定事件类型
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
  updateUserStatus(userData);
});

eventSource.addEventListener('system-alert', function(event) {
  const alert = JSON.parse(event.data);
  showSystemAlert(alert);
});

// 2. 事件处理函数
function showNotification(notification) {
  const notificationElement = document.createElement('div');
  notificationElement.className = 'notification';
  notificationElement.innerHTML = `
    <h4>${notification.title}</h4>
    <p>${notification.message}</p>
    <small>${new Date(notification.timestamp).toLocaleString()}</small>
  `;
  
  document.getElementById('notifications').appendChild(notificationElement);
  
  // 自动移除通知
  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}

function updateProgressBar(progress) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  progressBar.style.width = `${progress.percentage}%`;
  progressText.textContent = `${progress.percentage}% - ${progress.description}`;
}

function updateUserStatus(userData) {
  const userStatusElement = document.getElementById('user-status');
  userStatusElement.innerHTML = `
    <span class="status-indicator ${userData.status}"></span>
    <span>${userData.name} - ${userData.status}</span>
  `;
}

function showSystemAlert(alert) {
  const alertElement = document.createElement('div');
  alertElement.className = `alert alert-${alert.level}`;
  alertElement.textContent = alert.message;
  
  document.getElementById('alerts').appendChild(alertElement);
}
```

### 3. 高级操作管理器

```javascript
class SSEOperationManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.eventHandlers = new Map(); // 存储事件处理器
    this.connectionStatus = 'disconnected'; // disconnected, connecting, connected, error
    this.messageQueue = []; // 消息队列
    this.isClosed = false;
    
    this.connect();
  }
  
  // 1. 建立连接
  connect() {
    if (this.isClosed) {
      console.warn('连接已被关闭，无法重新连接');
      return;
    }
    
    try {
      this.eventSource = new EventSource(this.url);
      this.setupEventHandlers();
      this.connectionStatus = 'connecting';
    } catch (error) {
      console.error('创建 SSE 连接失败:', error);
      this.connectionStatus = 'error';
      if (this.onError) {
        this.onError(error);
      }
    }
  }
  
  // 2. 设置事件处理器
  setupEventHandlers() {
    // 监听连接打开
    this.eventSource.onopen = (event) => {
      console.log('SSE 连接已建立');
      this.connectionStatus = 'connected';
      
      // 处理队列中的消息
      this.processMessageQueue();
      
      if (this.onOpen) {
        this.onOpen(event);
      }
    };
    
    // 监听消息
    this.eventSource.onmessage = (event) => {
      this.handleMessage('message', event);
    };
    
    // 监听错误
    this.eventSource.onerror = (event) => {
      console.error('SSE 连接错误:', event);
      this.connectionStatus = 'error';
      
      if (this.eventSource.readyState === EventSource.CLOSED) {
        this.connectionStatus = 'disconnected';
      } else if (this.eventSource.readyState === EventSource.CONNECTING) {
        this.connectionStatus = 'connecting'; // 重连状态
      }
      
      if (this.onError) {
        this.onError(event);
      }
    };
  }
  
  // 3. 注册事件处理器
  addEventListener(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }
  
  // 4. 移除事件处理器
  removeEventListener(eventType, handler) {
    if (this.eventHandlers.has(eventType)) {
      const handlers = this.eventHandlers.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  // 5. 处理消息
  handleMessage(eventType, event) {
    // 解析数据
    let parsedData;
    try {
      parsedData = JSON.parse(event.data);
    } catch (e) {
      parsedData = event.data;
    }
    
    // 添加元数据
    const message = {
      type: eventType,
      data: parsedData,
      timestamp: new Date().toISOString(),
      rawEvent: event
    };
    
    // 如果连接已建立，直接处理消息
    if (this.connectionStatus === 'connected') {
      this.processMessage(message);
    } else {
      // 否则加入队列
      this.messageQueue.push(message);
    }
  }
  
  // 6. 处理消息
  processMessage(message) {
    // 执行特定类型的处理器
    if (this.eventHandlers.has(message.type)) {
      this.eventHandlers.get(message.type).forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`处理 ${message.type} 消息时出错:`, error);
        }
      });
    }
    
    // 执行通用消息处理器
    if (this.onMessage) {
      try {
        this.onMessage(message);
      } catch (error) {
        console.error('处理通用消息时出错:', error);
      }
    }
  }
  
  // 7. 处理消息队列
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.processMessage(message);
    }
  }
  
  // 8. 检查连接状态
  getReadyState() {
    if (!this.eventSource) {
      return -1; // 未初始化
    }
    return this.eventSource.readyState;
  }
  
  // 9. 获取连接状态描述
  getConnectionStatus() {
    const readyState = this.getReadyState();
    const statusMap = {
      [-1]: 'uninitialized',
      0: 'connecting',
      1: 'open',
      2: 'closed'
    };
    return statusMap[readyState] || this.connectionStatus;
  }
  
  // 10. 关闭连接
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.isClosed = true;
      this.connectionStatus = 'disconnected';
      console.log('SSE 连接已关闭');
    }
  }
  
  // 11. 重新连接
  reconnect() {
    if (this.eventSource) {
      this.close();
    }
    this.isClosed = false;
    this.connect();
  }
}

// 使用示例
const sseManager = new SSEOperationManager('/api/events');

// 设置回调
sseManager.onOpen = (event) => {
  console.log('连接已建立');
};

sseManager.onMessage = (message) => {
  console.log('收到通用消息:', message);
};

sseManager.onError = (error) => {
  console.error('发生错误:', error);
};

// 注册特定事件处理器
sseManager.addEventListener('notification', (message) => {
  console.log('收到通知:', message.data);
});

// 检查连接状态
console.log('当前连接状态:', sseManager.getConnectionStatus());

// 在适当时候关闭连接
// sseManager.close();
```

### 4. React Hook 中的 SSE 操作

```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

function useSSEOperations(url) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);
  const eventSourceRef = useRef(null);
  const eventHandlersRef = useRef(new Map());

  // 添加事件监听器
  const addEventListener = useCallback((eventType, handler) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, []);
    }
    eventHandlersRef.current.get(eventType).push(handler);
  }, []);

  // 移除事件监听器
  const removeEventListener = useCallback((eventType, handler) => {
    if (eventHandlersRef.current.has(eventType)) {
      const handlers = eventHandlersRef.current.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }, []);

  // 连接 SSE
  useEffect(() => {
    if (!url) return;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // 监听连接打开
    eventSource.onopen = () => {
      console.log('SSE 连接已建立');
      setConnectionStatus('connected');
    };

    // 监听消息
    eventSource.onmessage = (event) => {
      // 解析数据
      let parsedData;
      try {
        parsedData = JSON.parse(event.data);
      } catch (e) {
        parsedData = event.data;
      }

      const message = {
        type: 'message',
        data: parsedData,
        timestamp: new Date().toISOString()
      };

      setLatestMessage(message);
      setMessages(prev => [...prev, message]);

      // 执行消息处理器
      if (eventHandlersRef.current.has('message')) {
        eventHandlersRef.current.get('message').forEach(handler => {
          handler(message);
        });
      }
    };

    // 监听错误
    eventSource.onerror = (event) => {
      console.error('SSE 连接错误:', event);
      
      if (eventSource.readyState === EventSource.CLOSED) {
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('connecting'); // 重连状态
      }
    };

    // 注册自定义事件监听器
    const customEventTypes = ['notification', 'progress', 'update'];
    customEventTypes.forEach(eventType => {
      eventSource.addEventListener(eventType, (event) => {
        let parsedData;
        try {
          parsedData = JSON.parse(event.data);
        } catch (e) {
          parsedData = event.data;
        }

        const message = {
          type: eventType,
          data: parsedData,
          timestamp: new Date().toISOString()
        };

        setLatestMessage(message);
        setMessages(prev => [...prev, message]);

        // 执行特定类型的消息处理器
        if (eventHandlersRef.current.has(eventType)) {
          eventHandlersRef.current.get(eventType).forEach(handler => {
            handler(message);
          });
        }
      });
    });

    setConnectionStatus('connecting');

    // 清理函数
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [url]);

  // 检查连接状态
  const checkConnectionStatus = useCallback(() => {
    if (!eventSourceRef.current) {
      return 'disconnected';
    }
    
    const readyState = eventSourceRef.current.readyState;
    switch (readyState) {
      case EventSource.CONNECTING:
        return 'connecting';
      case EventSource.OPEN:
        return 'connected';
      case EventSource.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }, []);

  // 关闭连接
  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnectionStatus('disconnected');
    }
  }, []);

  // 重新连接
  const reconnect = useCallback(() => {
    closeConnection();
    // 重新创建连接将在 useEffect 中自动处理
  }, [closeConnection]);

  return {
    connectionStatus,
    messages,
    latestMessage,
    addEventListener,
    removeEventListener,
    checkConnectionStatus,
    closeConnection,
    reconnect
  };
}

// 在组件中使用
function SSEComponent() {
  const {
    connectionStatus,
    messages,
    latestMessage,
    addEventListener,
    closeConnection,
    checkConnectionStatus
  } = useSSEOperations('/api/events');

  // 添加特定事件监听器
  useEffect(() => {
    const notificationHandler = (message) => {
      console.log('收到通知:', message.data);
      // 处理通知逻辑
    };

    addEventListener('notification', notificationHandler);

    // 清理
    return () => {
      // 在实际应用中，你可能需要实现 removeEventListener
    };
  }, [addEventListener]);

  return (
    <div>
      <h2>SSE 操作管理</h2>
      <p>连接状态: {connectionStatus}</p>
      <p>当前状态: {checkConnectionStatus()}</p>
      
      <button onClick={closeConnection}>关闭连接</button>
      
      {latestMessage && (
        <div>
          <h3>最新消息</h3>
          <pre>{JSON.stringify(latestMessage, null, 2)}</pre>
        </div>
      )}
      
      <div>
        <h3>消息历史 ({messages.length})</h3>
        {messages.slice(-5).map((msg, index) => (
          <div key={index} className="message-item">
            <p>类型: {msg.type}</p>
            <p>时间: {new Date(msg.timestamp).toLocaleString()}</p>
            <pre>{JSON.stringify(msg.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5. 连接状态管理和错误处理

```javascript
class AdvancedSSEOperations {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = options.maxConnectionAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.connectionTimeout = options.connectionTimeout || 10000; // 10秒连接超时
    this.connectionTimer = null;
    
    this.statusCallbacks = {
      onConnecting: null,
      onConnected: null,
      onDisconnected: null,
      onReconnecting: null,
      onError: null
    };
    
    this.connect();
  }
  
  // 连接操作
  connect() {
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.error('达到最大连接尝试次数，停止连接');
      this.onConnectionFailure();
      return;
    }
    
    try {
      this.eventSource = new EventSource(this.url);
      
      // 设置连接超时
      this.connectionTimer = setTimeout(() => {
        if (this.eventSource.readyState === EventSource.CONNECTING) {
          console.warn('连接超时');
          this.handleConnectionTimeout();
        }
      }, this.connectionTimeout);
      
      this.setupEventHandlers();
      
      if (this.statusCallbacks.onConnecting) {
        this.statusCallbacks.onConnecting();
      }
      
    } catch (error) {
      console.error('创建 EventSource 失败:', error);
      this.handleConnectionError(error);
    }
  }
  
  // 设置事件处理器
  setupEventHandlers() {
    this.eventSource.onopen = (event) => {
      // 清除连接超时定时器
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
        this.connectionTimer = null;
      }
      
      this.connectionAttempts = 0; // 重置连接尝试次数
      
      console.log('SSE 连接已建立');
      if (this.statusCallbacks.onConnected) {
        this.statusCallbacks.onConnected(event);
      }
    };
    
    this.eventSource.onmessage = (event) => {
      this.handleMessage(event);
    };
    
    this.eventSource.onerror = (event) => {
      console.error('SSE 连接错误:', event);
      
      // 清除连接超时定时器
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
        this.connectionTimer = null;
      }
      
      if (this.eventSource.readyState === EventSource.CLOSED) {
        console.log('连接已关闭');
        if (this.statusCallbacks.onDisconnected) {
          this.statusCallbacks.onDisconnected(event);
        }
      } else if (this.eventSource.readyState === EventSource.CONNECTING) {
        console.log('正在重连...');
        if (this.statusCallbacks.onReconnecting) {
          this.statusCallbacks.onReconnecting(event);
        }
        this.attemptReconnect();
      }
      
      if (this.statusCallbacks.onError) {
        this.statusCallbacks.onError(event);
      }
    };
  }
  
  // 处理连接超时
  handleConnectionTimeout() {
    console.log('连接超时，关闭当前连接并尝试重连');
    this.eventSource.close();
    this.attemptReconnect();
  }
  
  // 尝试重连
  attemptReconnect() {
    this.connectionAttempts++;
    
    if (this.connectionAttempts <= this.maxConnectionAttempts) {
      console.log(`第 ${this.connectionAttempts} 次重连尝试，${this.reconnectInterval}ms 后重试`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('达到最大重连次数，停止重连');
      this.onConnectionFailure();
    }
  }
  
  // 连接失败处理
  onConnectionFailure() {
    console.log('SSE 连接失败，已达到最大重连次数');
    // 可以在这里执行失败后的清理或通知操作
  }
  
  // 处理消息
  handleMessage(event) {
    // 解析消息数据
    let parsedData;
    try {
      parsedData = JSON.parse(event.data);
    } catch (e) {
      parsedData = event.data;
    }
    
    // 可以在这里添加消息处理逻辑
    console.log('收到消息:', parsedData);
  }
  
  // 设置状态回调
  setConnectionCallback(status, callback) {
    if (this.statusCallbacks.hasOwnProperty(status)) {
      this.statusCallbacks[status] = callback;
    }
  }
  
  // 获取当前连接状态
  getReadyState() {
    if (!this.eventSource) {
      return -1; // 未初始化
    }
    return this.eventSource.readyState;
  }
  
  // 获取连接状态描述
  getConnectionState() {
    const readyState = this.getReadyState();
    const stateMap = {
      [-1]: 'UNINITIALIZED',
      0: 'CONNECTING',
      1: 'OPEN',
      2: 'CLOSED'
    };
    return stateMap[readyState] || 'UNKNOWN';
  }
  
  // 关闭连接
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      
      // 清除定时器
      if (this.connectionTimer) {
        clearTimeout(this.connectionTimer);
        this.connectionTimer = null;
      }
      
      console.log('SSE 连接已关闭');
    }
  }
  
  // 重新连接
  reconnect() {
    this.connectionAttempts = 0;
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.connect();
  }
}

// 使用示例
const advancedSSE = new AdvancedSSEOperations('/api/events', {
  maxConnectionAttempts: 3,
  reconnectInterval: 5000,
  connectionTimeout: 15000
});

// 设置状态回调
advancedSSE.setConnectionCallback('onConnected', (event) => {
  console.log('连接成功建立');
});

advancedSSE.setConnectionCallback('onError', (event) => {
  console.log('发生错误:', event);
});

advancedSSE.setConnectionCallback('onReconnecting', (event) => {
  console.log('正在重连...');
});

// 检查连接状态
console.log('当前连接状态:', advancedSSE.getConnectionState());

// 在适当时候关闭连接
// advancedSSE.close();
```

## 实际应用场景

1. **实时通知系统**：接收系统推送的通知消息
2. **股票行情更新**：实时获取股票价格变化
3. **聊天应用**：接收其他用户发送的消息
4. **进度监控**：实时获取任务执行进度
5. **监控面板**：实时获取服务器状态和性能指标
6. **新闻推送**：接收实时新闻和资讯更新
7. **协作应用**：接收其他用户的操作更新

## 注意事项

1. **连接管理**：及时关闭不再需要的 SSE 连接，避免资源浪费
2. **错误处理**：合理处理各种错误情况，包括网络错误和数据解析错误
3. **状态监控**：监控连接状态变化，提供良好的用户体验
4. **性能优化**：避免在消息处理函数中执行耗时操作
5. **内存管理**：定期清理消息历史，防止内存泄漏
6. **安全性**：验证接收到的数据，防止 XSS 攻击
7. **浏览器兼容性**：检查目标浏览器是否支持 EventSource API
8. **流量控制**：对于高频消息，考虑节流或缓冲机制

## 总结

建立 SSE 通信后，客户端可以执行多种操作来管理连接和处理数据。主要操作包括接收消息、监听连接状态、处理自定义事件、关闭连接和检查连接状态。通过合理使用这些操作，可以构建稳定、高效的实时数据接收系统。
