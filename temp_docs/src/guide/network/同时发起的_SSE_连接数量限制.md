# 同时发起的 SSE 连接数量限制？（了解）

**题目**: 同时发起的 SSE 连接数量限制？（了解）

## 标准答案

SSE（Server-Sent Events）连接的数量限制主要来自浏览器的并发连接限制，通常每个域名下有6-8个连接的限制。这个限制与HTTP请求的连接池限制相同，因为SSE本质上也是HTTP长连接。实际限制因浏览器类型、版本和系统配置而异，一般在2-8个连接之间。

## 深入分析

### 1. 浏览器连接限制
- **同域名限制**: 浏览器对同一域名下的并发TCP连接数量有限制
- **不同浏览器差异**: Chrome、Firefox、Safari等浏览器的限制不同
- **HTTP/1.1 vs HTTP/2**: HTTP/2支持多路复用，理论上可以支持更多并发连接

### 2. 限制原因
- **资源消耗**: 每个SSE连接都占用服务器和客户端的内存资源
- **网络带宽**: 过多连接会占用网络带宽，影响其他请求
- **性能考虑**: 过多并发连接可能导致性能下降

### 3. 实际限制数值
- Chrome: 6个连接/域名
- Firefox: 6个连接/域名
- Safari: 6个连接/域名
- IE/Edge: 6-13个连接/域名（不同版本不同）

## 代码示例

### 1. 基础连接限制测试
```javascript
// 测试浏览器对SSE连接的限制
class SSEConnectionLimiter {
  constructor() {
    this.connections = new Map(); // 存储所有SSE连接
    this.maxConnections = 6; // 假设最大连接数为6
    this.connectionCounter = 0;
  }

  // 创建SSE连接
  createConnection(url, id) {
    if (this.connectionCounter >= this.maxConnections) {
      console.warn(`达到最大SSE连接数限制: ${this.maxConnections}`);
      return false;
    }

    try {
      const eventSource = new EventSource(url);
      
      eventSource.onopen = (event) => {
        console.log(`SSE连接${id}已建立`);
        this.connectionCounter++;
        this.connections.set(id, eventSource);
      };

      eventSource.onmessage = (event) => {
        console.log(`连接${id}收到消息:`, event.data);
      };

      eventSource.onerror = (event) => {
        console.error(`连接${id}发生错误:`, event);
        this.removeConnection(id);
      };

      return eventSource;
    } catch (error) {
      console.error(`创建SSE连接${id}失败:`, error);
      return false;
    }
  }

  // 移除连接
  removeConnection(id) {
    if (this.connections.has(id)) {
      const connection = this.connections.get(id);
      connection.close();
      this.connections.delete(id);
      this.connectionCounter--;
      console.log(`连接${id}已移除，当前连接数: ${this.connectionCounter}`);
    }
  }

  // 获取当前连接数
  getCurrentConnectionCount() {
    return this.connectionCounter;
  }

  // 获取最大允许连接数
  getMaxConnections() {
    return this.maxConnections;
  }
}

// 使用示例
const limiter = new SSEConnectionLimiter();

// 尝试创建多个连接来测试限制
for (let i = 0; i < 10; i++) {
  const connection = limiter.createConnection('/api/sse', `conn-${i}`);
  if (!connection) {
    console.log(`连接${i}创建失败，可能已达到限制`);
    break;
  }
}
```

### 2. 连接池管理
```javascript
// SSE连接池管理器
class SSEConnectionPool {
  constructor(options = {}) {
    this.maxConnections = options.maxConnections || 6;
    this.connections = new Map(); // 存储SSE连接
    this.waitingQueue = []; // 等待队列
    this.connectionCounter = 0;
  }

  // 获取可用连接
  async getConnection(url, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.connectionCounter < this.maxConnections) {
        // 有可用连接槽位，直接创建
        const connection = this.createConnection(url, options);
        resolve(connection);
      } else {
        // 无可用槽位，加入等待队列
        this.waitingQueue.push({ url, options, resolve, reject });
        console.log(`连接请求已加入队列，当前队列长度: ${this.waitingQueue.length}`);
      }
    });
  }

  // 创建SSE连接
  createConnection(url, options) {
    const id = this.generateId();
    const eventSource = new EventSource(url);

    eventSource.onopen = (event) => {
      console.log(`SSE连接${id}已建立`);
      this.connectionCounter++;
      this.connections.set(id, {
        eventSource,
        url,
        options,
        createdAt: Date.now()
      });
    };

    eventSource.onmessage = (event) => {
      if (options.onmessage) {
        options.onmessage(event, id);
      }
    };

    eventSource.onerror = (event) => {
      console.error(`SSE连接${id}发生错误:`, event);
      this.releaseConnection(id);
      
      if (options.onerror) {
        options.onerror(event, id);
      }
    };

    // 连接关闭时释放资源
    eventSource.addEventListener('close', () => {
      this.releaseConnection(id);
    });

    return { id, eventSource };
  }

  // 释放连接
  releaseConnection(id) {
    if (this.connections.has(id)) {
      const connection = this.connections.get(id);
      connection.eventSource.close();
      this.connections.delete(id);
      this.connectionCounter--;

      console.log(`连接${id}已释放，当前连接数: ${this.connectionCounter}`);

      // 处理等待队列中的请求
      if (this.waitingQueue.length > 0) {
        const nextRequest = this.waitingQueue.shift();
        try {
          const connection = this.createConnection(nextRequest.url, nextRequest.options);
          nextRequest.resolve(connection);
        } catch (error) {
          nextRequest.reject(error);
        }
      }
    }
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 获取连接池状态
  getStatus() {
    return {
      currentConnections: this.connectionCounter,
      maxConnections: this.maxConnections,
      waitingQueueLength: this.waitingQueue.length,
      availableSlots: this.maxConnections - this.connectionCounter
    };
  }

  // 关闭所有连接
  closeAll() {
    this.connections.forEach((connection, id) => {
      connection.eventSource.close();
    });
    this.connections.clear();
    this.connectionCounter = 0;
    
    // 清空等待队列
    this.waitingQueue.forEach(request => {
      request.reject(new Error('连接池已关闭'));
    });
    this.waitingQueue = [];
  }
}

// 使用示例
const connectionPool = new SSEConnectionPool({ maxConnections: 6 });

// 并发创建多个连接
async function createMultipleConnections() {
  const urls = [
    '/api/sse-1',
    '/api/sse-2', 
    '/api/sse-3',
    '/api/sse-4',
    '/api/sse-5',
    '/api/sse-6',
    '/api/sse-7', // 超出限制，会进入等待队列
    '/api/sse-8'  // 超出限制，会进入等待队列
  ];

  const promises = urls.map(async (url, index) => {
    try {
      const connection = await connectionPool.getConnection(url, {
        onmessage: (event, id) => {
          console.log(`连接${id}收到消息:`, event.data);
        },
        onerror: (event, id) => {
          console.error(`连接${id}错误:`, event);
        }
      });
      console.log(`成功创建连接${index}:`, connection.id);
    } catch (error) {
      console.error(`创建连接${index}失败:`, error);
    }
  });

  await Promise.all(promises);
  
  // 显示连接池状态
  console.log('连接池状态:', connectionPool.getStatus());
}

createMultipleConnections();
```

### 3. 跨域名SSE连接管理
```javascript
// 跨域名SSE连接管理
class CrossDomainSSEManager {
  constructor() {
    this.domainConnections = new Map(); // 按域名分组的连接
    this.maxConnectionsPerDomain = 6; // 每个域名的最大连接数
  }

  // 解析URL获取域名
  extractDomain(url) {
    const parser = document.createElement('a');
    parser.href = url;
    return parser.origin; // 包含协议和主机名
  }

  // 创建SSE连接
  createConnection(url, options = {}) {
    const domain = this.extractDomain(url);
    
    // 检查该域名下的连接数
    const domainConnections = this.domainConnections.get(domain) || [];
    if (domainConnections.length >= this.maxConnectionsPerDomain) {
      console.warn(`域名${domain}已达到SSE连接限制: ${this.maxConnectionsPerDomain}`);
      return false;
    }

    try {
      const eventSource = new EventSource(url);
      const connectionId = this.generateId();
      
      // 存储连接信息
      const connectionInfo = {
        id: connectionId,
        eventSource,
        url,
        createdAt: Date.now()
      };
      
      domainConnections.push(connectionInfo);
      this.domainConnections.set(domain, domainConnections);
      
      console.log(`在域名${domain}上创建了SSE连接${connectionId}，当前该域名连接数: ${domainConnections.length}`);
      
      // 设置事件处理器
      this.setupEventHandlers(eventSource, connectionInfo, domain);
      
      return connectionInfo;
    } catch (error) {
      console.error(`创建SSE连接失败:`, error);
      return false;
    }
  }

  // 设置事件处理器
  setupEventHandlers(eventSource, connectionInfo, domain) {
    eventSource.onopen = (event) => {
      console.log(`SSE连接${connectionInfo.id}已建立`);
      if (connectionInfo.options && connectionInfo.options.onopen) {
        connectionInfo.options.onopen(event);
      }
    };

    eventSource.onmessage = (event) => {
      if (connectionInfo.options && connectionInfo.options.onmessage) {
        connectionInfo.options.onmessage(event);
      }
    };

    eventSource.onerror = (event) => {
      console.error(`SSE连接${connectionInfo.id}发生错误:`, event);
      this.removeConnection(connectionInfo.id, domain);
      
      if (connectionInfo.options && connectionInfo.options.onerror) {
        connectionInfo.options.onerror(event);
      }
    };
  }

  // 移除连接
  removeConnection(connectionId, domain) {
    const domainConnections = this.domainConnections.get(domain) || [];
    const index = domainConnections.findIndex(conn => conn.id === connectionId);
    
    if (index !== -1) {
      const connection = domainConnections[index];
      connection.eventSource.close();
      domainConnections.splice(index, 1);
      this.domainConnections.set(domain, domainConnections);
      
      console.log(`连接${connectionId}已从域名${domain}移除，当前该域名连接数: ${domainConnections.length}`);
    }
  }

  // 获取域名连接统计
  getDomainStats() {
    const stats = {};
    for (const [domain, connections] of this.domainConnections) {
      stats[domain] = connections.length;
    }
    return stats;
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 关闭所有连接
  closeAll() {
    for (const [domain, connections] of this.domainConnections) {
      connections.forEach(connection => {
        connection.eventSource.close();
      });
    }
    this.domainConnections.clear();
  }
}

// 使用示例
const crossDomainManager = new CrossDomainSSEManager();

// 创建跨域名的SSE连接
const connections = [
  crossDomainManager.createConnection('https://api1.example.com/sse', {}),
  crossDomainManager.createConnection('https://api1.example.com/sse2', {}),
  crossDomainManager.createConnection('https://api2.example.com/sse', {}),
  crossDomainManager.createConnection('https://api2.example.com/sse2', {}),
  crossDomainManager.createConnection('https://api3.example.com/sse', {})
];

console.log('域名连接统计:', crossDomainManager.getDomainStats());
```

## 实际应用场景

### 1. 实时数据监控
- 在监控系统中，需要同时监听多个数据源
- 使用连接池管理确保不超过浏览器限制
- 实现优雅降级，当达到连接限制时缓存数据

### 2. 多房间聊天应用
- 每个聊天室使用一个SSE连接
- 当用户加入多个房间时，需要管理连接数
- 实现连接复用或合并策略

### 3. 微前端架构
- 不同微应用可能使用不同域名
- 利用跨域名特性分散连接压力
- 合理规划微应用的域名策略

## 注意事项

1. **性能监控**: 监控SSE连接的性能和资源使用情况
2. **优雅降级**: 当达到连接限制时，提供备选方案（如轮询）
3. **连接复用**: 在可能的情况下复用现有连接
4. **错误处理**: 妥善处理连接失败和超时情况
5. **内存管理**: 及时清理不再使用的连接，防止内存泄漏
6. **服务端支持**: 确保服务端能处理大量并发SSE连接
