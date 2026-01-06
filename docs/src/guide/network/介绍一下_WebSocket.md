# 介绍一下 WebSocket？（高薪常问）

**题目**: 介绍一下 WebSocket？（高薪常问）

## 标准答案

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议，它允许客户端和服务器之间进行实时、双向的数据传输。与传统的 HTTP 请求-响应模式不同，WebSocket 连接建立后，客户端和服务器可以随时互相发送数据，而不需要重复建立连接。WebSocket 协议在 2011 年成为国际标准（RFC 6455），为实时 Web 应用提供了高效的数据传输方式。

## 深入分析

### 1. WebSocket 工作原理

WebSocket 的建立过程始于 HTTP 握手，然后升级为 WebSocket 连接：

1. **握手阶段**：客户端发送 HTTP 请求，包含 Upgrade 头部，请求将连接升级为 WebSocket
2. **连接升级**：服务器响应 101 Switching Protocols，确认升级
3. **数据传输**：连接升级后，使用 WebSocket 协议进行双向通信
4. **连接关闭**：任一方可以发送关闭帧来终止连接

### 2. 与传统 HTTP 的区别

- **连接方式**：HTTP 是请求-响应模式，WebSocket 是全双工双向通信
- **开销**：HTTP 每次请求都包含完整头部，WebSocket 只有少量帧头开销
- **实时性**：HTTP 需要轮询实现近实时，WebSocket 真正实现实时通信
- **性能**：WebSocket 减少了连接建立的开销，更适合频繁通信

### 3. 应用场景

- **实时聊天应用**：即时消息、群聊、在线客服
- **在线游戏**：多人协作游戏、实时对战
- **实时数据更新**：股票行情、体育比分、实时监控
- **协作应用**：文档协同编辑、实时白板
- **推送通知**：系统通知、消息推送

## 代码实现

### 1. 基础 WebSocket 连接

```javascript
// 创建 WebSocket 连接
class WebSocketClient {
  constructor(url, protocols = []) {
    this.url = url;
    this.protocols = protocols;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.isManualClose = false;
    
    this.connect();
  }
  
  connect() {
    try {
      this.ws = new WebSocket(this.url, this.protocols);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }
  
  setupEventHandlers() {
    // 连接成功
    this.ws.onopen = (event) => {
      console.log('WebSocket connected:', event);
      this.reconnectAttempts = 0; // 重置重连次数
      this.onOpen && this.onOpen(event);
    };
    
    // 接收消息
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage && this.onMessage(data);
      } catch (error) {
        // 如果不是 JSON 格式，直接传递原始数据
        this.onMessage && this.onMessage(event.data);
      }
    };
    
    // 连接错误
    this.ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.onError && this.onError(event);
    };
    
    // 连接关闭
    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event);
      this.onClose && this.onClose(event);
      
      // 如果不是手动关闭，尝试重连
      if (!this.isManualClose) {
        this.handleReconnect();
      }
    };
  }
  
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('达到最大重连次数，停止重连');
      this.onMaxReconnectAttempts && this.onMaxReconnectAttempts();
    }
  }
  
  // 发送消息
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'object' ? JSON.stringify(data) : data;
      this.ws.send(message);
      return true;
    } else {
      console.warn('WebSocket is not open, cannot send message');
      return false;
    }
  }
  
  // 手动关闭连接
  close() {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 使用示例
const wsClient = new WebSocketClient('ws://localhost:8080/ws');

// 设置事件处理器
wsClient.onOpen = (event) => {
  console.log('连接已建立');
  // 连接成功后可以发送初始消息
  wsClient.send({ type: 'auth', token: 'user_token' });
};

wsClient.onMessage = (data) => {
  console.log('收到消息:', data);
  // 根据消息类型处理
  switch (data.type) {
    case 'chat':
      displayChatMessage(data);
      break;
    case 'notification':
      showNotification(data.content);
      break;
    default:
      console.log('未知消息类型:', data);
  }
};

wsClient.onError = (error) => {
  console.error('WebSocket 错误:', error);
};

wsClient.onClose = (event) => {
  console.log('连接已关闭:', event.code, event.reason);
};
```

### 2. 聊天应用 WebSocket 实现

```javascript
// 聊天应用 WebSocket 管理器
class ChatWebSocket {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'ws://localhost:8080/chat';
    this.userId = options.userId;
    this.roomId = options.roomId;
    this.ws = null;
    this.messageQueue = [];
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    
    this.connect();
  }
  
  connect() {
    try {
      this.ws = new WebSocket(this.serverUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Chat WebSocket connection failed:', error);
      this.reconnect();
    }
  }
  
  setupEventHandlers() {
    this.ws.onopen = (event) => {
      console.log('Chat WebSocket connected');
      this.reconnectAttempts = 0;
      
      // 发送用户认证信息
      if (this.userId) {
        this.send({
          type: 'join',
          userId: this.userId,
          roomId: this.roomId
        });
      }
      
      // 发送队列中的消息
      this.flushMessageQueue();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('Chat WebSocket closed:', event.code, event.reason);
      
      // 如果不是正常关闭，尝试重连
      if (event.code !== 1000) {
        this.reconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'user_joined':
        this.onUserJoined && this.onUserJoined(message);
        break;
      case 'user_left':
        this.onUserLeft && this.onUserLeft(message);
        break;
      case 'chat_message':
        this.onChatMessage && this.onChatMessage(message);
        break;
      case 'system_message':
        this.onSystemMessage && this.onSystemMessage(message);
        break;
      case 'room_users':
        this.onRoomUsers && this.onRoomUsers(message);
        break;
      default:
        console.log('Unknown message type:', message);
    }
  }
  
  sendMessage(content, options = {}) {
    const message = {
      type: 'chat_message',
      userId: this.userId,
      content: content,
      timestamp: Date.now(),
      roomId: this.roomId,
      ...options
    };
    
    return this.send(message);
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    } else {
      // 如果连接未建立，将消息加入队列
      this.messageQueue.push(data);
      console.warn('WebSocket not ready, message queued');
      return false;
    }
  }
  
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
  
  reconnect() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    console.log(`尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
      this.isReconnecting = false;
    }, Math.min(1000 * this.reconnectAttempts, 30000)); // 最大重连间隔30秒
  }
  
  leaveRoom() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'leave',
        userId: this.userId,
        roomId: this.roomId
      });
    }
  }
  
  close() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
    }
  }
}

// 聊天界面管理器
class ChatUI {
  constructor(chatWebSocket) {
    this.chatWs = chatWebSocket;
    this.messageContainer = document.getElementById('messages');
    this.messageInput = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendButton');
    
    this.setupEventHandlers();
    this.setupUI();
  }
  
  setupEventHandlers() {
    // WebSocket 事件处理
    this.chatWs.onChatMessage = (message) => {
      this.displayMessage(message);
    };
    
    this.chatWs.onUserJoined = (message) => {
      this.displaySystemMessage(`${message.username} 加入了聊天室`);
    };
    
    this.chatWs.onUserLeft = (message) => {
      this.displaySystemMessage(`${message.username} 离开了聊天室`);
    };
    
    this.chatWs.onSystemMessage = (message) => {
      this.displaySystemMessage(message.content);
    };
    
    this.chatWs.onRoomUsers = (message) => {
      this.updateUserList(message.users);
    };
  }
  
  setupUI() {
    // 发送消息事件
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // 回车发送消息
    this.messageInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    });
  }
  
  sendMessage() {
    const content = this.messageInput.value.trim();
    if (content) {
      this.chatWs.sendMessage(content);
      this.messageInput.value = '';
    }
  }
  
  displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="username">${message.username}</span>
        <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="message-content">${this.escapeHtml(message.content)}</div>
    `;
    
    this.messageContainer.appendChild(messageElement);
    this.scrollToBottom();
  }
  
  displaySystemMessage(content) {
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.textContent = content;
    
    this.messageContainer.appendChild(messageElement);
    this.scrollToBottom();
  }
  
  updateUserList(users) {
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = '';
    
    users.forEach(user => {
      const userElement = document.createElement('div');
      userElement.className = 'user-item';
      userElement.textContent = user.username;
      userListElement.appendChild(userElement);
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  scrollToBottom() {
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }
}

// 初始化聊天应用
const chatWs = new ChatWebSocket({
  serverUrl: 'ws://localhost:8080/chat',
  userId: 'user123',
  roomId: 'room1'
});

const chatUI = new ChatUI(chatWs);
```

### 3. 实时数据监控 WebSocket 实现

```javascript
// 实时数据监控 WebSocket 客户端
class RealTimeMonitor {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'ws://localhost:8080/monitor';
    this.ws = null;
    this.dataHandlers = new Map(); // 存储不同类型数据的处理函数
    this.connectionStatus = 'disconnected';
    this.lastPingTime = null;
    
    this.connect();
    this.startPing();
  }
  
  connect() {
    try {
      this.ws = new WebSocket(this.serverUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Monitor WebSocket connection failed:', error);
      this.handleConnectionError();
    }
  }
  
  setupEventHandlers() {
    this.ws.onopen = (event) => {
      console.log('Monitor WebSocket connected');
      this.connectionStatus = 'connected';
      this.onConnectionStatusChange && this.onConnectionStatusChange('connected');
      
      // 订阅需要的数据类型
      this.subscribeToDataTypes();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleData(data);
      } catch (error) {
        console.error('Error parsing monitor data:', error);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('Monitor WebSocket closed:', event.code, event.reason);
      this.connectionStatus = 'disconnected';
      this.onConnectionStatusChange && this.onConnectionStatusChange('disconnected');
      
      // 尝试重连
      setTimeout(() => {
        this.connect();
      }, 3000);
    };
    
    this.ws.onerror = (error) => {
      console.error('Monitor WebSocket error:', error);
      this.handleConnectionError();
    };
  }
  
  handleData(data) {
    // 处理心跳响应
    if (data.type === 'pong') {
      this.lastPingTime = Date.now();
      return;
    }
    
    // 根据数据类型调用相应的处理函数
    const handler = this.dataHandlers.get(data.type);
    if (handler) {
      handler(data);
    } else {
      console.warn('No handler for data type:', data.type);
    }
  }
  
  // 订阅数据类型
  subscribeToDataTypes() {
    const subscriptions = Array.from(this.dataHandlers.keys());
    if (subscriptions.length > 0) {
      this.send({
        type: 'subscribe',
        dataTypes: subscriptions
      });
    }
  }
  
  // 注册数据处理函数
  onData(type, handler) {
    this.dataHandlers.set(type, handler);
    
    // 如果已连接，发送订阅请求
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'subscribe',
        dataTypes: [type]
      });
    }
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  
  handleConnectionError() {
    this.connectionStatus = 'error';
    this.onConnectionStatusChange && this.onConnectionStatusChange('error');
  }
  
  // 定期发送心跳包
  startPing() {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // 每30秒发送一次心跳
  }
  
  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 监控数据可视化类
class MonitorDashboard {
  constructor(monitor) {
    this.monitor = monitor;
    this.charts = new Map();
    this.dataBuffers = new Map(); // 存储历史数据
    
    this.setupDataHandlers();
    this.initializeCharts();
  }
  
  setupDataHandlers() {
    // CPU 使用率数据处理
    this.monitor.onData('cpu', (data) => {
      this.updateChartData('cpu', data);
      this.updateCpuDisplay(data);
    });
    
    // 内存使用数据处理
    this.monitor.onData('memory', (data) => {
      this.updateChartData('memory', data);
      this.updateMemoryDisplay(data);
    });
    
    // 网络流量数据处理
    this.monitor.onData('network', (data) => {
      this.updateChartData('network', data);
      this.updateNetworkDisplay(data);
    });
    
    // 系统负载数据处理
    this.monitor.onData('load', (data) => {
      this.updateChartData('load', data);
      this.updateLoadDisplay(data);
    });
  }
  
  initializeCharts() {
    // 初始化 CPU 图表
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    this.charts.set('cpu', new Chart(cpuCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'CPU 使用率 (%)',
          data: [],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100
          }
        }
      }
    }));
    
    // 初始化内存图表
    const memoryCtx = document.getElementById('memoryChart').getContext('2d');
    this.charts.set('memory', new Chart(memoryCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: '内存使用率 (%)',
          data: [],
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100
          }
        }
      }
    }));
  }
  
  updateChartData(type, data) {
    const chart = this.charts.get(type);
    if (!chart) return;
    
    // 维护数据缓冲区，最多保留60个数据点
    let buffer = this.dataBuffers.get(type) || [];
    buffer.push({
      timestamp: data.timestamp || Date.now(),
      value: data.value
    });
    
    if (buffer.length > 60) {
      buffer = buffer.slice(-60); // 只保留最新的60个数据点
    }
    
    this.dataBuffers.set(type, buffer);
    
    // 更新图表数据
    chart.data.labels = buffer.map(item => 
      new Date(item.timestamp).toLocaleTimeString()
    );
    chart.data.datasets[0].data = buffer.map(item => item.value);
    
    chart.update();
  }
  
  updateCpuDisplay(data) {
    document.getElementById('cpuValue').textContent = `${data.value}%`;
    document.getElementById('cpuStatus').className = 
      data.value > 80 ? 'status-high' : data.value > 50 ? 'status-medium' : 'status-normal';
  }
  
  updateMemoryDisplay(data) {
    document.getElementById('memoryValue').textContent = `${data.value}%`;
    document.getElementById('memoryStatus').className = 
      data.value > 80 ? 'status-high' : data.value > 50 ? 'status-medium' : 'status-normal';
  }
  
  updateNetworkDisplay(data) {
    document.getElementById('networkIn').textContent = `${data.incoming} KB/s`;
    document.getElementById('networkOut').textContent = `${data.outgoing} KB/s`;
  }
  
  updateLoadDisplay(data) {
    document.getElementById('loadValue').textContent = data.value.toFixed(2);
    document.getElementById('loadStatus').className = 
      data.value > 2.0 ? 'status-high' : data.value > 1.0 ? 'status-medium' : 'status-normal';
  }
}

// 使用示例
const monitor = new RealTimeMonitor({
  serverUrl: 'ws://localhost:8080/monitor'
});

const dashboard = new MonitorDashboard(monitor);

// 监听连接状态变化
monitor.onConnectionStatusChange = (status) => {
  const statusElement = document.getElementById('connectionStatus');
  statusElement.textContent = `连接状态: ${status}`;
  statusElement.className = `connection-${status}`;
};
```

### 4. 高级 WebSocket 连接管理

```javascript
// 高级 WebSocket 连接管理器
class AdvancedWebSocketManager {
  constructor(options = {}) {
    this.servers = options.servers || ['ws://server1:8080', 'ws://server2:8080'];
    this.currentServerIndex = 0;
    this.ws = null;
    this.connectionStatus = 'disconnected';
    this.messageQueue = [];
    this.retryAttempts = 0;
    this.maxRetryAttempts = 10;
    this.retryDelay = 1000;
    this.heartbeatInterval = 30000;
    this.heartbeatTimeout = 10000;
    this.heartbeatTimer = null;
    this.heartbeatTimeoutTimer = null;
    
    // 消息处理器映射
    this.messageHandlers = new Map();
    
    this.connect();
  }
  
  connect() {
    const serverUrl = this.servers[this.currentServerIndex];
    console.log(`尝试连接到服务器: ${serverUrl}`);
    
    try {
      this.ws = new WebSocket(serverUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleConnectionFailure();
    }
  }
  
  setupEventHandlers() {
    this.ws.onopen = (event) => {
      console.log('WebSocket connected successfully');
      this.connectionStatus = 'connected';
      this.retryAttempts = 0;
      this.startHeartbeat();
      
      // 连接成功后处理队列中的消息
      this.flushMessageQueue();
      
      this.onConnect && this.onConnect(event);
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 处理心跳响应
        if (data.type === 'pong') {
          this.handleHeartbeatResponse();
          return;
        }
        
        // 调用相应的消息处理器
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
          handler(data);
        } else {
          console.warn('No handler for message type:', data.type);
          this.onMessage && this.onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
        // 如果不是 JSON 格式，直接传递原始数据
        this.onMessage && this.onMessage(event.data);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.connectionStatus = 'disconnected';
      this.stopHeartbeat();
      
      this.onClose && this.onClose(event);
      
      // 如果是正常关闭（代码1000），不重连
      if (event.code !== 1000) {
        this.handleConnectionFailure();
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onError && this.onError(error);
    };
  }
  
  handleConnectionFailure() {
    this.connectionStatus = 'disconnected';
    
    if (this.retryAttempts < this.maxRetryAttempts) {
      this.retryAttempts++;
      
      // 切换到下一个服务器
      this.currentServerIndex = (this.currentServerIndex + 1) % this.servers.length;
      
      console.log(`连接失败，${this.retryDelay}ms 后重试 (${this.retryAttempts}/${this.maxRetryAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.retryDelay);
      
      // 指数退避策略
      this.retryDelay = Math.min(this.retryDelay * 1.5, 30000); // 最大30秒
    } else {
      console.error('达到最大重连次数，停止重连');
      this.onMaxRetries && this.onMaxRetries();
    }
  }
  
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
        
        // 设置心跳超时检测
        this.heartbeatTimeoutTimer = setTimeout(() => {
          console.warn('Heartbeat timeout, closing connection');
          this.ws.close(4000, 'Heartbeat timeout');
        }, this.heartbeatTimeout);
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
  
  handleHeartbeatResponse() {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }
  
  // 注册消息处理器
  on(type, handler) {
    this.messageHandlers.set(type, handler);
  }
  
  // 发送消息
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'object' ? JSON.stringify(data) : data;
        this.ws.send(message);
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    } else {
      // 如果连接未建立，将消息加入队列
      this.messageQueue.push(data);
      console.warn('WebSocket not ready, message queued');
      return false;
    }
  }
  
  // 发送队列中的消息
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
  
  // 关闭连接
  close(code = 1000, reason = 'Client disconnecting') {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(code, reason);
    }
  }
  
  // 获取连接状态
  getStatus() {
    return {
      status: this.connectionStatus,
      server: this.servers[this.currentServerIndex],
      retryAttempts: this.retryAttempts,
      queueSize: this.messageQueue.length
    };
  }
}

// 使用示例
const wsManager = new AdvancedWebSocketManager({
  servers: [
    'ws://primary-server:8080',
    'ws://backup-server:8080',
    'ws://fallback-server:8080'
  ]
});

// 注册消息处理器
wsManager.on('notification', (data) => {
  showNotification(data.message);
});

wsManager.on('update', (data) => {
  updateUI(data);
});

// 设置事件回调
wsManager.onConnect = (event) => {
  console.log('Connected to WebSocket server');
};

wsManager.onClose = (event) => {
  console.log('WebSocket connection closed');
};

wsManager.onError = (error) => {
  console.error('WebSocket error occurred:', error);
};

// 发送消息
wsManager.send({
  type: 'subscribe',
  channel: 'notifications'
});
```

## 实际应用场景

### 1. 在线协作编辑
使用 WebSocket 实现实时文档协作编辑，多个用户可以同时编辑同一个文档，所有更改都会实时同步到其他用户的界面上。

### 2. 实时股票交易系统
在金融应用中，使用 WebSocket 推送实时股票价格、交易数据和市场变化，确保用户获得最新的市场信息。

### 3. 在线游戏
多人在线游戏中使用 WebSocket 进行实时状态同步，包括玩家位置、游戏状态、聊天消息等。

### 4. IoT 设备监控
监控物联网设备的状态和数据，实时接收设备发送的传感器数据和状态更新。

## 注意事项

1. **连接管理**：实现重连机制，处理网络中断和服务器故障
2. **安全性**：使用 WSS（WebSocket Secure）进行加密传输，验证连接身份
3. **性能优化**：控制消息频率，避免过多数据传输影响性能
4. **错误处理**：妥善处理连接错误、消息解析错误等异常情况
5. **资源清理**：在页面卸载或组件销毁时正确关闭 WebSocket 连接
6. **服务器负载**：考虑服务器并发连接数限制，实现负载均衡

WebSocket 作为现代 Web 应用中实现实时通信的重要技术，为开发者提供了高效、低延迟的双向通信能力，适用于各种需要实时数据交换的场景。
