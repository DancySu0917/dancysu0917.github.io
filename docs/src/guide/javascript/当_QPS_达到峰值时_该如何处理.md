# 当 QPS 达到峰值时，该如何处理？（了解）

**题目**: 当 QPS 达到峰值时，该如何处理？（了解）

当系统QPS（Queries Per Second，每秒查询率）达到峰值时，意味着系统正在承受高并发压力，需要采取一系列措施来应对，以确保系统的稳定性和可用性。

## 1. 限流 (Rate Limiting)

限流是最直接有效的保护系统的方式，通过限制请求的频率来防止系统过载。

### 1.1 固定窗口限流
```javascript
class FixedWindowLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(key) {
    const now = Date.now();
    const record = this.requests.get(key) || { count: 0, start: now };
    
    if (now - record.start > this.windowMs) {
      // 重置窗口
      record.count = 1;
      record.start = now;
      this.requests.set(key, record);
      return true;
    }
    
    if (record.count < this.maxRequests) {
      record.count++;
      this.requests.set(key, record);
      return true;
    }
    
    return false;
  }
}
```

### 1.2 滑动窗口限流
```javascript
class SlidingWindowLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // 存储时间戳数组
  }
  
  isAllowed(key) {
    const now = Date.now();
    let requestTimes = this.requests.get(key) || [];
    
    // 清除过期请求
    requestTimes = requestTimes.filter(time => now - time <= this.windowMs);
    
    if (requestTimes.length < this.maxRequests) {
      requestTimes.push(now);
      this.requests.set(key, requestTimes);
      return true;
    }
    
    return false;
  }
}
```

### 1.3 令牌桶算法
```javascript
class TokenBucketLimiter {
  constructor(capacity, refillRate) {
    this.capacity = capacity; // 桶容量
    this.refillRate = refillRate; // 每秒补充令牌数
    this.tokens = capacity; // 当前令牌数
    this.lastRefill = Date.now(); // 上次补充时间
  }
  
  isAllowed() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // 秒
    
    // 补充令牌
    const newTokens = Math.floor(timePassed * this.refillRate);
    this.tokens = Math.min(this.capacity, this.tokens + newTokens);
    this.lastRefill = now;
    
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    
    return false;
  }
}
```

## 2. 降级 (Degradation)

在高并发情况下，主动关闭一些非核心功能，保证核心功能的正常运行。

### 2.1 服务降级示例
```javascript
// 配置中心管理降级开关
const featureFlags = {
  recommendService: true,  // 推荐服务开关
  statisticsService: false, // 统计服务已关闭
  advertisingService: false // 广告服务已关闭
};

// 服务调用包装
async function callService(serviceName, fallbackValue, fn) {
  if (!featureFlags[serviceName]) {
    console.log(`${serviceName} 已降级，返回默认值`);
    return fallbackValue;
  }
  
  try {
    return await fn();
  } catch (error) {
    console.error(`${serviceName} 调用失败，返回默认值`, error);
    return fallbackValue;
  }
}

// 使用示例
async function getHomePageData(userId) {
  const [userInfo, recommendList, statistics] = await Promise.all([
    getUserInfo(userId),
    callService('recommendService', [], () => getRecommendations(userId)),
    callService('statisticsService', { total: 0 }, () => getUserStatistics(userId))
  ]);
  
  return { userInfo, recommendList, statistics };
}
```

## 3. 熔断 (Circuit Breaker)

当某个服务连续失败时，熔断器会自动切断对该服务的调用，避免故障扩散。

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold; // 失败次数阈值
    this.timeout = timeout;     // 熔断后恢复尝试的时间
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      // 检查是否超过恢复时间
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// 使用示例
const circuitBreaker = new CircuitBreaker(3, 30000); // 3次失败后熔断，30秒后尝试恢复

async function callExternalService() {
  return await circuitBreaker.call(async () => {
    // 调用外部服务
    const response = await fetch('/external-api');
    if (!response.ok) {
      throw new Error('External service error');
    }
    return response.json();
  });
}
```

## 4. 缓存策略

使用缓存减少数据库和后端服务的压力。

```javascript
// LRU缓存实现
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      // 移除并重新添加，更新访问顺序
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// 缓存装饰器
function cache(expirationTime = 5 * 60 * 1000) { // 默认5分钟过期
  const cacheMap = new Map();
  
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const key = JSON.stringify(args);
      const cached = cacheMap.get(key);
      
      if (cached && Date.now() - cached.timestamp < expirationTime) {
        return cached.value;
      }
      
      const result = await originalMethod.apply(this, args);
      cacheMap.set(key, {
        value: result,
        timestamp: Date.now()
      });
      
      return result;
    };
  };
}

// 使用缓存
class UserService {
  @cache(300000) // 5分钟缓存
  async getUserInfo(userId) {
    // 实际的数据库查询
    return await db.users.findById(userId);
  }
}
```

## 5. 异步处理

将非核心操作异步化，减少请求处理时间。

```javascript
// 消息队列处理异步任务
class MessageQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  async enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }
}

// 使用示例：异步记录日志、发送通知等
const logQueue = new MessageQueue();

async function handleUserRequest(req, res) {
  // 核心业务逻辑同步处理
  const result = await processCoreBusiness(req.body);
  
  // 非核心操作异步处理
  logQueue.enqueue(() => logUserAction(req.user.id, req.body.action));
  logQueue.enqueue(() => sendNotification(req.user.id, '操作完成'));
  
  res.json(result);
}
```

## 6. 负载均衡和水平扩展

通过负载均衡将请求分发到多个服务器实例，提升系统处理能力。

### 6.1 服务注册与发现
```javascript
// 简单的服务发现机制
class ServiceRegistry {
  constructor() {
    this.services = new Map();
  }
  
  register(serviceName, instance) {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, []);
    }
    this.services.get(serviceName).push(instance);
  }
  
  getHealthyInstance(serviceName) {
    const instances = this.services.get(serviceName) || [];
    // 实现负载均衡算法：轮询、随机、最少连接等
    return instances[Math.floor(Math.random() * instances.length)];
  }
}
```

## 7. 数据库优化

### 7.1 读写分离
```javascript
class DatabaseRouter {
  constructor(master, slaves) {
    this.master = master; // 主库，用于写操作
    this.slaves = slaves; // 从库，用于读操作
    this.currentSlaveIndex = 0;
  }
  
  async query(sql, params, isWrite = false) {
    if (isWrite) {
      // 写操作使用主库
      return await this.master.query(sql, params);
    } else {
      // 读操作使用从库，实现负载均衡
      const slave = this.slaves[this.currentSlaveIndex];
      this.currentSlaveIndex = (this.currentSlaveIndex + 1) % this.slaves.length;
      return await slave.query(sql, params);
    }
  }
}
```

### 7.2 分库分表
```javascript
class ShardingRouter {
  constructor(databases) {
    this.databases = databases;
  }
  
  getDatabaseByUserId(userId) {
    // 根据用户ID进行分片
    const shardIndex = userId % this.databases.length;
    return this.databases[shardIndex];
  }
  
  async queryByUserId(userId, sql, params) {
    const db = this.getDatabaseByUserId(userId);
    return await db.query(sql, params);
  }
}
```

## 8. 监控和告警

实时监控系统状态，及时发现和处理问题。

```javascript
class SystemMonitor {
  constructor() {
    this.metrics = {
      qps: 0,
      responseTime: 0,
      errorRate: 0,
      cpuUsage: 0,
      memoryUsage: 0
    };
    this.alertThresholds = {
      qps: 10000,
      responseTime: 1000, // 毫秒
      errorRate: 0.05     // 5%
    };
  }
  
  updateMetrics(newMetrics) {
    Object.assign(this.metrics, newMetrics);
    this.checkAlerts();
  }
  
  checkAlerts() {
    for (const [metric, value] of Object.entries(this.metrics)) {
      if (this.alertThresholds[metric] && value > this.alertThresholds[metric]) {
        this.sendAlert(metric, value);
      }
    }
  }
  
  sendAlert(metric, value) {
    console.log(`ALERT: ${metric} is ${value}, exceeds threshold`);
    // 发送告警通知
  }
}
```

## 总结

处理QPS峰值需要综合运用多种策略：
1. **预防措施**: 限流、缓存、异步处理
2. **保护措施**: 降级、熔断、负载均衡
3. **优化措施**: 数据库优化、水平扩展
4. **监控措施**: 实时监控、告警机制

通过这些措施的组合使用，可以有效应对高并发场景，保证系统的稳定性和可用性。
