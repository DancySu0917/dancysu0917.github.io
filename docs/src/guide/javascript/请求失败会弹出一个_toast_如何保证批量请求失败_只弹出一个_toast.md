# 请求失败会弹出一个 toast，如何保证批量请求失败，只弹出一个 toast？（了解）

**题目**: 请求失败会弹出一个 toast，如何保证批量请求失败，只弹出一个 toast？（了解）

## 标准答案

要保证批量请求失败时只弹出一个 toast，可以采用以下几种策略：

1. **请求聚合**：将多个请求合并为一个请求
2. **错误计数器**：使用计数器跟踪失败请求数量
3. **防抖处理**：使用防抖机制限制 toast 显示频率
4. **批量请求管理器**：创建专门的批量请求处理器
5. **Promise.allSettled**：使用 Promise.allSettled 统一处理多个请求结果

## 深入理解

在实际开发中，批量请求失败时只显示一个 toast 的需求通常出现在以下场景：

### 1. 用户体验优化
- 避免过多的 toast 提示打扰用户
- 提供更清晰的错误反馈
- 减少界面的视觉干扰

### 2. 性能考虑
- 减少 DOM 操作次数
- 避免频繁的 UI 更新
- 降低内存和 CPU 消耗

### 3. 业务逻辑
- 统一处理批量操作的结果
- 提供整体的失败状态反馈
- 便于用户理解操作结果

### 4. 实现模式
- **集中式处理**：在统一的地方处理所有请求结果
- **状态管理**：维护批量请求的状态
- **去重机制**：防止重复的错误提示

## 代码演示

### 1. 基础防抖方案

```javascript
// 防抖函数
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Toast 提示类
class Toast {
  static show(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] Toast: ${message}`);
    // 实际实现中，这里会显示真实的 toast 组件
  }
}

// 请求失败防抖处理
class RequestHandler {
  constructor() {
    // 防抖处理错误提示，500ms 内只显示一次
    this.showError = debounce((message) => {
      Toast.show(message, 'error');
    }, 500);
  }
  
  async makeRequest(url) {
    try {
      // 模拟请求
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      // 使用防抖处理错误提示
      this.showError(`请求失败: ${error.message}`);
      throw error;
    }
  }
}

// 使用示例
const handler = new RequestHandler();

// 模拟批量请求
async function batchRequests() {
  const urls = ['/api/data1', '/api/data2', '/api/data3'];
  
  const promises = urls.map(url => handler.makeRequest(url));
  await Promise.allSettled(promises);
}

// batchRequests(); // 取消注释以运行示例
```

### 2. 批量请求管理器

```javascript
// 批量请求管理器
class BatchRequestManager {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 5; // 最大并发数
    this.retryCount = options.retryCount || 0; // 重试次数
    this.toastShown = false; // 标记是否已显示 toast
    this.failedRequests = 0; // 失败请求数量
    this.totalRequests = 0; // 总请求数量
  }
  
  // 重置状态
  reset() {
    this.toastShown = false;
    this.failedRequests = 0;
    this.totalRequests = 0;
  }
  
  // 执行批量请求
  async execute(requests) {
    this.reset();
    this.totalRequests = requests.length;
    
    // 并发执行请求
    const results = await this.executeConcurrent(requests);
    
    // 统一处理结果
    this.handleResults(results);
    
    return results;
  }
  
  // 并发执行请求
  async executeConcurrent(requests) {
    const results = [];
    const chunks = this.chunkArray(requests, this.maxConcurrent);
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(req => this.executeRequest(req))
      );
      results.push(...chunkResults);
    }
    
    return results;
  }
  
  // 执行单个请求
  async executeRequest(request) {
    try {
      const response = await fetch(request.url, {
        method: request.method || 'GET',
        headers: request.headers || {},
        body: request.body ? JSON.stringify(request.body) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      // 记录失败的请求
      this.failedRequests++;
      throw error;
    }
  }
  
  // 分割数组
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  // 处理结果
  handleResults(results) {
    const failedCount = results.filter(r => r.status === 'rejected').length;
    
    if (failedCount > 0 && !this.toastShown) {
      this.toastShown = true;
      const message = `批量请求完成，${failedCount}/${this.totalRequests} 个请求失败`;
      Toast.show(message, 'error');
    } else if (failedCount === 0) {
      Toast.show(`批量请求完成，全部成功`, 'success');
    }
  }
}

// 使用示例
const batchManager = new BatchRequestManager({ maxConcurrent: 3 });

async function testBatchRequests() {
  const requests = [
    { url: '/api/user/1' },
    { url: '/api/user/2' },
    { url: '/api/user/3' },
    { url: '/api/user/4' },
    { url: '/api/user/5' }
  ];
  
  await batchManager.execute(requests);
}

// testBatchRequests(); // 取消注释以运行示例
```

### 3. 状态管理方案

```javascript
// 批量请求状态管理器
class BatchRequestStateManager {
  constructor() {
    this.requestGroups = new Map(); // 存储请求组状态
  }
  
  // 创建请求组
  createRequestGroup(groupId, options = {}) {
    this.requestGroups.set(groupId, {
      id: groupId,
      total: 0,
      completed: 0,
      failed: 0,
      showToast: options.showToast !== false,
      toastShown: false,
      startTime: Date.now(),
      onCompletion: options.onCompletion || null
    });
  }
  
  // 开始请求
  async startRequest(groupId, request) {
    const group = this.requestGroups.get(groupId);
    if (!group) {
      throw new Error(`Request group ${groupId} not found`);
    }
    
    group.total++;
    
    try {
      const result = await this.executeRequest(request);
      group.completed++;
      return result;
    } catch (error) {
      group.failed++;
      group.completed++;
      
      // 检查是否需要显示 toast
      if (group.showToast && !group.toastShown) {
        group.toastShown = true;
        this.showBatchErrorToast(group);
      }
      
      throw error;
    } finally {
      // 检查是否所有请求都已完成
      if (group.completed >= group.total) {
        this.onGroupComplete(groupId);
      }
    }
  }
  
  // 执行单个请求
  async executeRequest(request) {
    // 模拟请求
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟 30% 失败率
        if (Math.random() < 0.3) {
          reject(new Error(`Request to ${request.url} failed`));
        } else {
          resolve({ data: `Success for ${request.url}` });
        }
      }, Math.random() * 1000); // 随机延迟
    });
  }
  
  // 显示批量错误 toast
  showBatchErrorToast(group) {
    const failureRate = (group.failed / group.total * 100).toFixed(1);
    const message = `批量请求完成，失败 ${group.failed}/${group.total} (${failureRate}%)`;
    Toast.show(message, 'error');
  }
  
  // 请求组完成处理
  onGroupComplete(groupId) {
    const group = this.requestGroups.get(groupId);
    if (group && group.onCompletion) {
      group.onCompletion({
        total: group.total,
        failed: group.failed,
        success: group.total - group.failed,
        duration: Date.now() - group.startTime
      });
    }
    
    // 清理组状态
    this.requestGroups.delete(groupId);
  }
  
  // 获取组状态
  getGroupStatus(groupId) {
    return this.requestGroups.get(groupId);
  }
}

// 使用示例
const stateManager = new BatchRequestStateManager();

async function testStateManager() {
  const groupId = 'user-data-batch';
  
  stateManager.createRequestGroup(groupId, {
    showToast: true,
    onCompletion: (stats) => {
      console.log('批量请求完成统计:', stats);
    }
  });
  
  // 并发执行多个请求
  const requests = [
    { url: '/api/users/1' },
    { url: '/api/users/2' },
    { url: '/api/users/3' },
    { url: '/api/users/4' },
    { url: '/api/users/5' }
  ];
  
  const promises = requests.map(req => 
    stateManager.startRequest(groupId, req)
  );
  
  try {
    const results = await Promise.allSettled(promises);
    console.log('所有请求完成:', results);
  } catch (error) {
    console.error('批量请求处理错误:', error);
  }
}

// testStateManager(); // 取消注释以运行示例
```

### 4. 中间件模式实现

```javascript
// 请求中间件系统
class RequestMiddleware {
  constructor() {
    this.middlewares = [];
  }
  
  // 添加中间件
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  // 执行请求链
  async execute(request, context = {}) {
    let index = 0;
    const next = async () => {
      if (index >= this.middlewares.length) return;
      
      const middleware = this.middlewares[index++];
      await middleware(request, context, next);
    };
    
    await next();
    return request;
  }
}

// 批量请求错误处理中间件
class BatchErrorHandlingMiddleware {
  constructor() {
    this.groupStates = new Map();
  }
  
  // 获取或创建组状态
  getGroupState(groupId) {
    if (!this.groupStates.has(groupId)) {
      this.groupStates.set(groupId, {
        total: 0,
        completed: 0,
        failed: 0,
        toastShown: false
      });
    }
    return this.groupStates.get(groupId);
  }
  
  // 中间件函数
  async handle(request, context, next) {
    const groupId = context.groupId;
    if (!groupId) {
      // 如果没有组ID，直接执行后续中间件
      await next();
      return;
    }
    
    const groupState = this.getGroupState(groupId);
    groupState.total++;
    
    try {
      await next();
      groupState.completed++;
    } catch (error) {
      groupState.failed++;
      groupState.completed++;
      
      // 如果还没有显示 toast，且有失败的请求，则显示 toast
      if (!groupState.toastShown && groupState.failed > 0) {
        groupState.toastShown = true;
        const failureRate = (groupState.failed / groupState.total * 100).toFixed(1);
        const message = `批量请求部分失败：${groupState.failed}/${groupState.total} (${failureRate}%)`;
        Toast.show(message, 'error');
      }
      
      // 重新抛出错误
      throw error;
    } finally {
      // 检查是否所有请求都已完成
      if (groupState.completed >= groupState.total) {
        // 清理组状态
        this.groupStates.delete(groupId);
      }
    }
  }
}

// 请求执行器
class RequestExecutor {
  constructor() {
    this.middleware = new RequestMiddleware();
    this.errorMiddleware = new BatchErrorHandlingMiddleware();
    this.middleware.use(this.errorMiddleware.handle.bind(this.errorMiddleware));
  }
  
  // 执行单个请求
  async executeRequest(url, options = {}, groupId = null) {
    const request = { url, options };
    const context = { groupId };
    
    try {
      await this.middleware.execute(request, context);
      // 实际请求逻辑
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Request failed: ${error.message}`);
      throw error;
    }
  }
  
  // 批量执行请求
  async executeBatch(requests, groupId) {
    const promises = requests.map(req => 
      this.executeRequest(req.url, req.options, groupId)
    );
    
    return await Promise.allSettled(promises);
  }
}

// 使用示例
const executor = new RequestExecutor();

async function testMiddleware() {
  const requests = [
    { url: '/api/data/1', options: { method: 'GET' } },
    { url: '/api/data/2', options: { method: 'GET' } },
    { url: '/api/data/3', options: { method: 'GET' } }
  ];
  
  const results = await executor.executeBatch(requests, 'data-fetch-group');
  console.log('批量请求结果:', results);
}

// testMiddleware(); // 取消注释以运行示例
```

### 5. 综合解决方案

```javascript
// 综合批量请求管理器
class ComprehensiveBatchManager {
  constructor(options = {}) {
    this.defaultOptions = {
      maxConcurrent: options.maxConcurrent || 5,
      showErrorToast: options.showErrorToast !== false,
      successMessage: options.successMessage || '批量操作成功',
      errorMessage: options.errorMessage || '批量操作部分失败',
      toastDelay: options.toastDelay || 100, // 延迟显示 toast，避免瞬间多个错误
      retryAttempts: options.retryAttempts || 0
    };
    
    this.activeGroups = new Map(); // 活跃的请求组
    this.toastTimeouts = new Map(); // toast 延时定时器
  }
  
  // 创建请求组
  createGroup(groupId, options = {}) {
    const groupOptions = { ...this.defaultOptions, ...options };
    
    this.activeGroups.set(groupId, {
      id: groupId,
      options: groupOptions,
      requests: [],
      results: [],
      completed: 0,
      failed: 0,
      total: 0,
      startTime: Date.now(),
      isCompleted: false,
      resolve: null,
      reject: null
    });
    
    return groupId;
  }
  
  // 添加请求到组
  addRequestToGroup(groupId, requestPromise) {
    const group = this.activeGroups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }
    
    group.requests.push(requestPromise);
    group.total++;
  }
  
  // 执行组内所有请求
  async executeGroup(groupId) {
    const group = this.activeGroups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }
    
    return new Promise((resolve, reject) => {
      group.resolve = resolve;
      group.reject = reject;
      
      // 开始执行请求
      this.processGroupRequests(group);
    });
  }
  
  // 处理组内请求
  async processGroupRequests(group) {
    try {
      // 分批执行请求
      const chunks = this.chunkArray(group.requests, group.options.maxConcurrent);
      let allResults = [];
      
      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(chunk);
        allResults = allResults.concat(chunkResults);
        
        // 统计结果
        chunkResults.forEach(result => {
          group.completed++;
          if (result.status === 'rejected') {
            group.failed++;
          }
        });
      }
      
      group.results = allResults;
      group.isCompleted = true;
      
      // 处理结果并显示 toast
      this.handleGroupResults(group);
      
      // 解析 Promise
      group.resolve({
        results: allResults,
        summary: {
          total: group.total,
          failed: group.failed,
          success: group.total - group.failed,
          duration: Date.now() - group.startTime
        }
      });
    } catch (error) {
      group.isCompleted = true;
      group.reject(error);
    } finally {
      // 清理组
      this.cleanupGroup(group.id);
    }
  }
  
  // 处理组结果
  handleGroupResults(group) {
    if (group.options.showErrorToast) {
      if (group.failed > 0) {
        // 使用延时避免瞬间多个 toast
        const timeoutId = setTimeout(() => {
          const successCount = group.total - group.failed;
          const message = group.options.errorMessage + 
                         ` (${group.failed}/${group.total} 失败, ${successCount} 成功)`;
          Toast.show(message, 'error');
        }, group.options.toastDelay);
        
        this.toastTimeouts.set(group.id, timeoutId);
      } else if (group.total > 0) {
        // 所有请求都成功
        Toast.show(group.options.successMessage, 'success');
      }
    }
  }
  
  // 清理组
  cleanupGroup(groupId) {
    // 清理 toast 定时器
    if (this.toastTimeouts.has(groupId)) {
      clearTimeout(this.toastTimeouts.get(groupId));
      this.toastTimeouts.delete(groupId);
    }
    
    // 删除组
    this.activeGroups.delete(groupId);
  }
  
  // 分割数组
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  // 便捷方法：执行批量请求
  async executeBatch(requests, options = {}) {
    const groupId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.createGroup(groupId, options);
    
    // 添加请求到组
    for (const request of requests) {
      this.addRequestToGroup(groupId, request);
    }
    
    return await this.executeGroup(groupId);
  }
}

// 使用示例和测试
const comprehensiveManager = new ComprehensiveBatchManager({
  showErrorToast: true,
  maxConcurrent: 3
});

// 模拟请求函数
function createMockRequest(url, shouldFail = false, delay = 100) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`Request to ${url} failed`));
      } else {
        resolve({ url, data: `Success: ${url}` });
      }
    }, delay + Math.random() * 100);
  });
}

// 测试综合管理器
async function testComprehensiveManager() {
  console.log('开始测试综合批量请求管理器...');
  
  const requests = [
    createMockRequest('/api/data/1', false),
    createMockRequest('/api/data/2', true),  // 这个会失败
    createMockRequest('/api/data/3', false),
    createMockRequest('/api/data/4', true),  // 这个会失败
    createMockRequest('/api/data/5', false)
  ];
  
  try {
    const result = await comprehensiveManager.executeBatch(requests, {
      errorMessage: '数据加载部分失败'
    });
    
    console.log('批量请求完成:', result.summary);
    console.log('详细结果:', result.results);
  } catch (error) {
    console.error('批量请求执行失败:', error);
  }
}

// testComprehensiveManager(); // 取消注释以运行示例
```

## 实际应用场景

### 1. 数据批量操作
- 批量删除、更新或创建数据
- 批量导入导出操作
- 批量权限设置

### 2. 文件上传
- 批量文件上传，部分失败时只显示一个错误提示
- 图片批量压缩和上传

### 3. 表单验证
- 批量表单字段验证，统一显示验证结果
- 批量数据提交

### 4. 推送通知
- 批量发送消息或通知
- 统一处理发送结果

### 5. 缓存更新
- 批量更新缓存数据
- 统一处理缓存操作结果

这些方案可以根据具体需求选择使用，其中综合解决方案提供了最完整的功能，包括并发控制、错误处理、状态管理等特性。
