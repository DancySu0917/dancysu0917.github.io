# 如果 SSE 推送中断了，如何处理异常？（高薪常问）

**题目**: 如果 SSE 推送中断了，如何处理异常？（了解）

## 标准答案

当 SSE 推送中断时，可以通过以下方式处理异常：1) 监听 EventSource 的 error 事件；2) 实现自动重连机制；3) 使用心跳检测保持连接；4) 设置合理的重连间隔和最大重连次数；5) 在重连时恢复连接状态。通过这些方法可以确保 SSE 连接的稳定性和可靠性。

## 深入分析

### 1. SSE 连接中断的原因

SSE 连接可能因以下原因中断：
- 网络不稳定或中断
- 服务器重启或故障
- 客户端网络环境变化
- 防火墙或代理服务器超时
- 浏览器限制或资源回收
- 服务器主动关闭连接

### 2. 异常处理机制

SSE 提供了内置的错误处理机制，但需要开发者进行适当的配置和处理：

- **错误事件监听**：通过 onerror 事件处理连接错误
- **自动重连**：EventSource 默认会尝试重连
- **重连控制**：通过 retry 字段控制重连间隔
- **状态管理**：跟踪连接状态并采取相应措施

### 3. 重连策略

有效的重连策略包括：
- **指数退避**：逐渐增加重连间隔，避免服务器压力过大
- **最大重试次数**：设置上限，避免无限重连
- **连接状态检测**：区分临时中断和永久性故障
- **用户通知**：在适当时候通知用户连接状态

### 4. 连接恢复

连接恢复时需要考虑：
- 从上次断点继续接收数据
- 恢复客户端状态
- 重新订阅需要的数据流
- 更新 UI 状态显示

## 代码实现

### 1. 基础错误处理和重连

```javascript
// 基础 SSE 连接管理器，包含错误处理和重连
class BasicSSEManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.isManualClose = false;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
    
    this.connect();
  }
  
  connect() {
    this.eventSource = new EventSource(this.url, this.options);
    
    // 连接打开事件
    this.eventSource.onopen = (event) => {
      console.log('SSE connection opened');
      this.reconnectAttempts = 0; // 重置重连计数
      
      // 连接成功后的处理
      this.onOpen && this.onOpen(event);
    };
    
    // 接收消息事件
    this.eventSource.onmessage = (event) => {
      // 消息接收成功，重置重连计数（如果需要）
      this.onMessage && this.onMessage(event.data);
    };
    
    // 错误处理
    this.eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      
      // 检查连接状态
      if (this.eventSource.readyState === EventSource.CLOSED) {
        console.log('Connection closed, attempting to reconnect...');
        
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          
          // 使用指数退避策略
          const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts), 30000);
          
          setTimeout(() => {
            this.connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached or manual close');
          this.onError && this.onError(event);
          this.onMaxReconnectAttempts && this.onMaxReconnectAttempts();
        }
      }
      
      this.onError && this.onError(event);
    };
  }
  
  // 关闭连接
  close() {
    this.isManualClose = true;
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
  
  // 设置事件处理器
  onOpen = null;
  onMessage = null;
  onError = null;
  onMaxReconnectAttempts = null;
}

// 使用示例
const sseManager = new BasicSSEManager('/api/stream', {
  reconnectInterval: 2000,
  maxReconnectAttempts: 5
});

sseManager.onOpen = (event) => {
  console.log('Connected to SSE stream');
};

sseManager.onMessage = (data) => {
  console.log('Received data:', data);
  updateUI(JSON.parse(data));
};

sseManager.onError = (error) => {
  console.error('SSE error occurred:', error);
  showConnectionError();
};

sseManager.onMaxReconnectAttempts = () => {
  console.error('Failed to reconnect after maximum attempts');
  showPermanentError();
};
```

### 2. 高级 SSE 管理器（包含心跳检测）

```javascript
// 高级 SSE 管理器，包含心跳检测和更完善的错误处理
class AdvancedSSEManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.isManualClose = false;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
    this.heartbeatInterval = options.heartbeatInterval || 30000; // 30秒
    this.heartbeatTimeout = options.heartbeatTimeout || 10000;   // 10秒
    this.heartbeatTimer = null;
    this.heartbeatTimeoutTimer = null;
    this.lastHeartbeat = null;
    this.connectionStatus = 'disconnected'; // disconnected, connecting, connected, error
    
    // 事件处理器
    this.eventHandlers = new Map();
    
    this.connect();
  }
  
  connect() {
    console.log('Attempting to connect to SSE...');
    this.connectionStatus = 'connecting';
    
    try {
      this.eventSource = new EventSource(this.url, this.options);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      this.handleConnectionError();
    }
  }
  
  setupEventHandlers() {
    this.eventSource.onopen = (event) => {
      console.log('SSE connection opened');
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.lastHeartbeat = Date.now();
      
      // 开始心跳检测
      this.startHeartbeat();
      
      // 触发用户定义的 open 事件
      this.triggerEvent('open', event);
    };
    
    this.eventSource.onmessage = (event) => {
      this.lastHeartbeat = Date.now();
      
      // 检查是否是心跳消息
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'heartbeat') {
          this.handleHeartbeat(data);
          return;
        }
      } catch (e) {
        // 如果不是 JSON 格式，继续处理
      }
      
      // 处理普通消息
      this.triggerEvent('message', event.data);
    };
    
    this.eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      this.connectionStatus = 'error';
      
      // 停止心跳检测
      this.stopHeartbeat();
      
      // 触发用户定义的 error 事件
      this.triggerEvent('error', event);
      
      // 如果不是手动关闭，尝试重连
      if (!this.isManualClose) {
        this.handleConnectionError();
      }
    };
  }
  
  handleHeartbeat(heartbeatData) {
    console.log('Received heartbeat:', heartbeatData);
    this.lastHeartbeat = Date.now();
    this.triggerEvent('heartbeat', heartbeatData);
  }
  
  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionStatus === 'connected') {
        // 检查最后心跳时间，如果超时则认为连接断开
        const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
        if (timeSinceLastHeartbeat > this.heartbeatTimeout) {
          console.warn('Heartbeat timeout detected, reconnecting...');
          this.reconnect();
        }
      }
    }, this.heartbeatInterval);
  }
  
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }
  
  handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      // 使用指数退避策略
      const delay = Math.min(
        this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
        60000 // 最大1分钟
      );
      
      console.log(`Waiting ${delay}ms before reconnecting...`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionStatus = 'disconnected';
      this.triggerEvent('max-reconnect-attempts');
    }
  }
  
  reconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.connect();
  }
  
  // 注册事件处理器
  addEventListener(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType).push(handler);
  }
  
  // 触发事件
  triggerEvent(eventType, data) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${eventType} handler:`, error);
        }
      });
    }
  }
  
  // 获取连接状态
  getStatus() {
    return {
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
      url: this.url
    };
  }
  
  // 关闭连接
  close() {
    this.isManualClose = true;
    this.connectionStatus = 'disconnected';
    
    this.stopHeartbeat();
    
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

// 使用示例
const advancedSSE = new AdvancedSSEManager('/api/stream', {
  reconnectInterval: 2000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000
});

// 注册事件处理器
advancedSSE.addEventListener('open', (event) => {
  console.log('SSE stream opened');
  updateConnectionStatus('connected');
});

advancedSSE.addEventListener('message', (data) => {
  console.log('Received message:', data);
  try {
    const parsedData = JSON.parse(data);
    processMessage(parsedData);
  } catch (e) {
    console.warn('Could not parse message:', data);
  }
});

advancedSSE.addEventListener('error', (error) => {
  console.error('SSE error:', error);
  updateConnectionStatus('error');
});

advancedSSE.addEventListener('heartbeat', (data) => {
  console.log('Heartbeat received:', data);
  updateConnectionStatus('connected');
});

advancedSSE.addEventListener('max-reconnect-attempts', () => {
  console.error('Max reconnection attempts reached');
  showPermanentFailure();
  updateConnectionStatus('failed');
});
```

### 3. 带状态恢复的 SSE 管理器

```javascript
// 带状态恢复功能的 SSE 管理器
class StatefulSSEManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.isManualClose = false;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
    this.lastEventId = options.lastEventId || null; // 用于从上次断点恢复
    this.connectionStatus = 'disconnected';
    this.eventHandlers = new Map();
    this.messageBuffer = []; // 消息缓冲区
    this.maxBufferSize = options.maxBufferSize || 100;
    this.reconnectionContext = options.reconnectionContext || {}; // 重连时的上下文信息
    
    this.connect();
  }
  
  connect() {
    console.log('Connecting to SSE with lastEventId:', this.lastEventId);
    this.connectionStatus = 'connecting';
    
    // 如果有 lastEventId，将其添加到 URL 中或通过自定义头部传递
    let connectUrl = this.url;
    if (this.lastEventId) {
      const separator = connectUrl.includes('?') ? '&' : '?';
      connectUrl = `${connectUrl}${separator}lastEventId=${encodeURIComponent(this.lastEventId)}`;
    }
    
    try {
      // 创建 EventSource，如果支持的话可以通过 headers 传递 lastEventId
      this.eventSource = new EventSource(connectUrl, this.options);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      this.handleConnectionError();
    }
  }
  
  setupEventHandlers() {
    this.eventSource.onopen = (event) => {
      console.log('SSE connection opened');
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      
      // 连接恢复后可能需要重新发送订阅信息
      this.onReconnect && this.onReconnect();
      
      this.triggerEvent('open', event);
    };
    
    this.eventSource.onmessage = (event) => {
      // 更新最后事件 ID
      if (event.lastEventId) {
        this.lastEventId = event.lastEventId;
      }
      
      // 添加到消息缓冲区
      this.addToBuffer(event.data);
      
      // 处理消息
      this.triggerEvent('message', {
        data: event.data,
        lastEventId: event.lastEventId,
        retry: event.retry
      });
    };
    
    // 监听特定事件类型
    this.eventSource.addEventListener('retry', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.interval) {
          // 服务器建议的重连间隔
          this.reconnectInterval = data.interval;
        }
      } catch (e) {
        console.warn('Could not parse retry data:', event.data);
      }
    });
    
    this.eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      this.connectionStatus = 'error';
      
      this.triggerEvent('error', event);
      
      if (!this.isManualClose) {
        this.handleConnectionError();
      }
    };
  }
  
  addToBuffer(data) {
    this.messageBuffer.push({
      data: data,
      timestamp: Date.now()
    });
    
    // 限制缓冲区大小
    if (this.messageBuffer.length > this.maxBufferSize) {
      this.messageBuffer = this.messageBuffer.slice(-this.maxBufferSize);
    }
  }
  
  handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      // 使用指数退避策略
      const delay = Math.min(
        this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
        60000
      );
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionStatus = 'disconnected';
      this.triggerEvent('max-reconnect-attempts');
    }
  }
  
  // 注册事件处理器
  addEventListener(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType).push(handler);
  }
  
  // 触发事件
  triggerEvent(eventType, data) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${eventType} handler:`, error);
        }
      });
    }
  }
  
  // 获取缓冲的消息
  getBufferedMessages() {
    return [...this.messageBuffer];
  }
  
  // 清空缓冲区
  clearBuffer() {
    this.messageBuffer = [];
  }
  
  // 获取连接状态
  getStatus() {
    return {
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      lastEventId: this.lastEventId,
      bufferedMessages: this.messageBuffer.length,
      url: this.url
    };
  }
  
  // 重新连接时的上下文恢复
  onReconnect = () => {
    // 在重新连接成功后恢复订阅或其他状态
    console.log('Connection restored, resuming operations...');
    
    // 可以在这里重新发送订阅请求等
    if (this.reconnectionContext.subscriptions) {
      this.reconnectionContext.subscriptions.forEach(sub => {
        this.sendSubscription(sub);
      });
    }
  };
  
  // 发送订阅请求（通过其他方式，因为 SSE 是单向的）
  sendSubscription(subscription) {
    // 实际应用中可能通过 fetch 或其他方式发送订阅请求
    console.log('Sending subscription:', subscription);
  }
  
  // 关闭连接
  close() {
    this.isManualClose = true;
    this.connectionStatus = 'disconnected';
    
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

// 使用示例
const statefulSSE = new StatefulSSEManager('/api/stream', {
  reconnectInterval: 2000,
  maxReconnectAttempts: 5,
  maxBufferSize: 50,
  reconnectionContext: {
    subscriptions: ['news', 'notifications']
  }
});

statefulSSE.addEventListener('open', (event) => {
  console.log('Stateful SSE connection opened');
});

statefulSSE.addEventListener('message', (message) => {
  console.log('Received message:', message.data);
  const data = JSON.parse(message.data);
  processMessage(data);
  
  // 更新最后事件 ID
  if (message.lastEventId) {
    localStorage.setItem('lastSSEEventId', message.lastEventId);
  }
});

statefulSSE.addEventListener('error', (error) => {
  console.error('Stateful SSE error:', error);
});

// 从本地存储恢复最后事件 ID
const savedEventId = localStorage.getItem('lastSSEEventId');
if (savedEventId) {
  statefulSSE.lastEventId = savedEventId;
}
```

### 4. React Hook 封装 SSE 连接管理

```javascript
// React Hook 封装的 SSE 管理器
import { useState, useEffect, useRef, useCallback } from 'react';

function useSSE(url, options = {}) {
  const [status, setStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;
  const messageHandlersRef = useRef(new Map());
  
  // 添加事件处理器
  const addMessageListener = useCallback((type, handler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, []);
    }
    messageHandlersRef.current.get(type).push(handler);
  }, []);
  
  // 移除事件处理器
  const removeMessageListener = useCallback((type, handler) => {
    if (messageHandlersRef.current.has(type)) {
      const handlers = messageHandlersRef.current.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }, []);
  
  // 处理消息
  const handleMessage = useCallback((data) => {
    setLastMessage(data);
    
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.type) {
        const handlers = messageHandlersRef.current.get(parsedData.type);
        if (handlers) {
          handlers.forEach(handler => handler(parsedData));
        }
      }
    } catch (e) {
      // 如果不是 JSON 格式，触发通用处理器
      const handlers = messageHandlersRef.current.get('message');
      if (handlers) {
        handlers.forEach(handler => handler(data));
      }
    }
  }, []);
  
  // 连接 SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    setStatus('connecting');
    setError(null);
    
    try {
      eventSourceRef.current = new EventSource(url, options);
      
      eventSourceRef.current.onopen = () => {
        console.log('SSE connection opened');
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        setError(null);
      };
      
      eventSourceRef.current.onmessage = (event) => {
        handleMessage(event.data);
      };
      
      eventSourceRef.current.onerror = (event) => {
        console.error('SSE connection error:', event);
        setStatus('error');
        
        if (eventSourceRef.current.readyState === EventSource.CLOSED) {
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            console.log(`Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
            
            setTimeout(() => {
              connect();
            }, reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1));
          } else {
            setError(new Error('Max reconnection attempts reached'));
            setStatus('disconnected');
          }
        }
      };
    } catch (err) {
      console.error('Failed to create EventSource:', err);
      setError(err);
      setStatus('error');
    }
  }, [url, options, handleMessage, maxReconnectAttempts, reconnectInterval]);
  
  // 断开连接
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setStatus('disconnected');
    }
  }, []);
  
  // 组件挂载时连接，卸载时断开
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    status,
    lastMessage,
    error,
    connect,
    disconnect,
    addMessageListener,
    removeMessageListener
  };
}

// React 组件使用示例
function NotificationComponent() {
  const {
    status,
    lastMessage,
    error,
    addMessageListener,
    removeMessageListener
  } = useSSE('/api/notifications', {
    maxReconnectAttempts: 3,
    reconnectInterval: 2000
  });
  
  // 设置特定类型消息的处理器
  useEffect(() => {
    const handleNotification = (data) => {
      console.log('Received notification:', data);
      showNotification(data);
    };
    
    const handleError = (data) => {
      console.error('Received error notification:', data);
    };
    
    addMessageListener('notification', handleNotification);
    addMessageListener('error', handleError);
    
    // 清理函数
    return () => {
      removeMessageListener('notification', handleNotification);
      removeMessageListener('error', handleError);
    };
  }, [addMessageListener, removeMessageListener]);
  
  if (error) {
    return <div className="error">连接错误: {error.message}</div>;
  }
  
  return (
    <div className="notification-container">
      <div className="status">状态: {status}</div>
      {lastMessage && (
        <div className="last-message">最后消息: {JSON.stringify(lastMessage)}</div>
      )}
    </div>
  );
}
```

## 实际应用场景

### 1. 实时通知系统
在通知系统中，当 SSE 连接中断时，需要自动重连并确保用户不会错过重要通知。

### 2. 股票行情监控
金融应用中，SSE 连接中断可能意味着错过重要的价格变动，需要快速恢复连接。

### 3. 实时协作应用
在文档协作等应用中，连接中断会影响用户体验，需要平滑的重连机制。

### 4. 监控面板
监控系统中，数据流的中断可能导致监控盲区，需要可靠的重连策略。

## 注意事项

1. **合理设置重连参数**：避免过于频繁的重连给服务器造成压力
2. **状态管理**：正确跟踪连接状态，避免重复连接
3. **资源清理**：在组件卸载或页面关闭时正确关闭连接
4. **错误分类**：区分临时错误和永久错误，采取不同策略
5. **用户反馈**：向用户提供连接状态反馈
6. **数据恢复**：考虑连接恢复后的数据同步问题
7. **性能监控**：监控重连频率和连接稳定性
8. **安全考虑**：在重连时验证身份和权限

通过实现完善的错误处理和重连机制，可以确保 SSE 连接的稳定性和可靠性，为用户提供良好的实时数据体验。
