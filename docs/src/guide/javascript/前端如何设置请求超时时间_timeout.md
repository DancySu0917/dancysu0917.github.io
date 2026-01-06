# 前端如何设置请求超时时间 timeout？（了解）

**题目**: 前端如何设置请求超时时间 timeout？（了解）

## 标准答案

前端设置请求超时时间主要有以下几种方式：

1. **XMLHttpRequest**: 使用 `timeout` 属性设置超时时间
2. **Fetch API**: 使用 AbortController 或 Promise.race 实现超时控制
3. **Axios**: 使用 `timeout` 配置项或拦截器设置超时
4. **jQuery AJAX**: 使用 `timeout` 选项设置超时时间

## 深入分析

### 1. XMLHttpRequest 超时设置

XMLHttpRequest 提供了原生的 timeout 属性，可以设置请求的超时时间。当请求超过指定时间未完成时，会触发 timeout 事件。

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', true);
xhr.timeout = 5000; // 设置超时时间为5秒

xhr.ontimeout = function() {
  console.log('请求超时');
  // 处理超时逻辑
};

xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      console.log('请求成功:', xhr.responseText);
    } else {
      console.log('请求失败:', xhr.status);
    }
  }
};

xhr.send();
```

### 2. Fetch API 超时设置

Fetch API 本身没有直接的 timeout 选项，但可以通过以下方式实现：

- **AbortController**: ES2017 引入，可以中止 fetch 请求
- **Promise.race**: 通过与超时 Promise 竞赛实现超时控制

### 3. Axios 超时设置

Axios 提供了便捷的 timeout 配置项，可以直接设置超时时间。

### 4. 超时处理的最佳实践

- **合理的超时时间**: 根据业务场景设置合适的超时时间
- **用户体验**: 提供友好的超时提示
- **重试机制**: 在超时后提供重试选项
- **网络状态检测**: 结合网络状态判断是否重试

## 代码实现

### 1. XMLHttpRequest 超时实现

```javascript
function requestWithTimeout(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('GET', url, true);
    xhr.timeout = timeout;
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      }
    };
    
    xhr.ontimeout = function() {
      reject(new Error('请求超时'));
    };
    
    xhr.onerror = function() {
      reject(new Error('网络错误'));
    };
    
    xhr.send();
  });
}

// 使用示例
requestWithTimeout('/api/data', 3000)
  .then(response => {
    console.log('响应:', response);
  })
  .catch(error => {
    console.error('错误:', error.message);
  });
```

### 2. Fetch API 超时实现

#### 方法一：使用 AbortController

```javascript
function fetchWithTimeout(url, options = {}) {
  const { timeout = 5000, ...fetchOptions } = options;
  
  // 创建 AbortController 实例
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...fetchOptions,
    signal: controller.signal
  }).then(response => {
    clearTimeout(timeoutId);
    return response;
  }).catch(error => {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    
    throw error;
  });
}

// 使用示例
fetchWithTimeout('/api/data', { timeout: 3000 })
  .then(response => response.json())
  .then(data => {
    console.log('数据:', data);
  })
  .catch(error => {
    console.error('错误:', error.message);
  });
```

#### 方法二：使用 Promise.race

```javascript
function fetchWithTimeoutRace(url, options = {}) {
  const { timeout = 5000, ...fetchOptions } = options;
  
  // 创建超时 Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时'));
    }, timeout);
  });
  
  // 创建 fetch Promise
  const fetchPromise = fetch(url, fetchOptions);
  
  // 返回两个 Promise 的竞赛结果
  return Promise.race([fetchPromise, timeoutPromise]);
}

// 使用示例
fetchWithTimeoutRace('/api/data', { timeout: 3000 })
  .then(response => response.json())
  .then(data => {
    console.log('数据:', data);
  })
  .catch(error => {
    console.error('错误:', error.message);
  });
```

### 3. Axios 超时实现

#### 基础超时设置

```javascript
import axios from 'axios';

// 创建 axios 实例并设置默认超时时间
const apiClient = axios.create({
  timeout: 5000, // 5秒超时
  baseURL: 'https://api.example.com'
});

// 单个请求设置超时
apiClient.get('/data', {
  timeout: 3000 // 3秒超时
}).then(response => {
  console.log('响应:', response.data);
}).catch(error => {
  if (error.code === 'ECONNABORTED') {
    console.error('请求超时');
  } else {
    console.error('请求失败:', error.message);
  }
});
```

#### 使用拦截器处理超时

```javascript
// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里动态设置超时时间
    config.timeout = config.timeout || 5000;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时');
      // 可以在这里添加超时处理逻辑
    }
    return Promise.reject(error);
  }
);
```

#### 高级超时配置

```javascript
class ApiClient {
  constructor(baseURL, defaultTimeout = 5000) {
    this.client = axios.create({
      baseURL,
      timeout: defaultTimeout
    });
    
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      config => {
        // 添加请求开始时间
        config.metadata = { startTime: new Date() };
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    
    // 响应拦截器
    this.client.interceptors.response.use(
      response => {
        // 计算请求耗时
        const duration = new Date() - response.config.metadata.startTime;
        console.log(`请求耗时: ${duration}ms`);
        return response;
      },
      error => {
        if (error.code === 'ECONNABORTED') {
          console.error('请求超时');
          // 触发自定义超时事件
          this.handleTimeout(error);
        }
        return Promise.reject(error);
      }
    );
  }
  
  handleTimeout(error) {
    // 超时处理逻辑
    console.log('检测到请求超时，执行相应处理');
  }
  
  // 带有重试机制的请求
  async requestWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await this.client.get(url, options);
        return response;
      } catch (error) {
        lastError = error;
        
        // 如果是超时错误且不是最后一次重试，则重试
        if (error.code === 'ECONNABORTED' && i < maxRetries) {
          console.log(`第${i + 1}次请求超时，正在重试...`);
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        
        break;
      }
    }
    
    throw lastError;
  }
}

// 使用示例
const api = new ApiClient('https://api.example.com');

api.requestWithRetry('/data', { timeout: 3000 }, 2)
  .then(response => {
    console.log('数据:', response.data);
  })
  .catch(error => {
    console.error('最终失败:', error.message);
  });
```

### 4. jQuery AJAX 超时设置

```javascript
// 使用 jQuery 设置超时
$.ajax({
  url: '/api/data',
  type: 'GET',
  timeout: 5000, // 5秒超时
  success: function(data) {
    console.log('成功:', data);
  },
  error: function(xhr, status, error) {
    if (status === 'timeout') {
      console.error('请求超时');
    } else {
      console.error('请求失败:', error);
    }
  }
});
```

### 5. 通用超时工具函数

```javascript
class TimeoutManager {
  // 创建带超时的 Promise
  static withTimeout(promise, timeoutMs, timeoutMessage = '请求超时') {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(timeoutMessage));
        }, timeoutMs);
      })
    ]);
  }
  
  // 智能超时设置（根据网络状况动态调整）
  static async smartRequest(url, options = {}) {
    const { timeout = 5000, ...requestOptions } = options;
    
    // 根据网络状况调整超时时间
    let adjustedTimeout = timeout;
    
    if ('connection' in navigator) {
      const connection = navigator.connection;
      switch (connection.effectiveType) {
        case 'slow-2g':
          adjustedTimeout = timeout * 4;
          break;
        case '2g':
          adjustedTimeout = timeout * 3;
          break;
        case '3g':
          adjustedTimeout = timeout * 2;
          break;
        default:
          adjustedTimeout = timeout;
      }
    }
    
    return this.withTimeout(
      fetch(url, requestOptions),
      adjustedTimeout,
      `请求超时（${adjustedTimeout}ms）`
    );
  }
  
  // 带有重试和退避策略的请求
  static async requestWithBackoff(url, options = {}, maxRetries = 3) {
    const { timeout = 5000, ...requestOptions } = options;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!controller.signal.aborted && response.ok) {
          return response;
        }
        
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (i === maxRetries) {
          throw error;
        }
        
        // 退避策略：等待时间递增
        const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

// 使用示例
TimeoutManager.smartRequest('/api/data', { timeout: 3000 })
  .then(response => response.json())
  .then(data => {
    console.log('数据:', data);
  })
  .catch(error => {
    console.error('错误:', error.message);
  });
```

## 实际应用场景

### 1. API 请求超时配置
- 根据不同接口的特性设置不同的超时时间
- 上传文件的请求可能需要更长的超时时间
- 简单查询可以设置较短的超时时间

### 2. 网络状态感知
- 根据网络状况动态调整超时时间
- 在 2G/3G 网络下增加超时时间
- 在 WiFi 网络下可以设置较短的超时时间

### 3. 用户体验优化
- 超时后提供重试选项
- 显示加载进度或预估时间
- 提供离线缓存作为备选方案

### 4. 服务端配合
- 服务端设置相应的超时时间
- 保证前后端超时配置的一致性
- 实现断点续传等高级功能

## 注意事项和最佳实践

1. **超时时间设置**: 不要设置过短或过长的超时时间，应根据实际业务需求调整
2. **用户体验**: 超时后应提供友好的提示信息和重试机制
3. **资源清理**: 确保超时后正确清理相关资源，避免内存泄漏
4. **错误处理**: 区分超时错误和其他类型的错误，进行针对性处理
5. **监控统计**: 记录超时请求的统计信息，用于优化服务
6. **网络感知**: 结合网络状态API，动态调整超时策略
7. **兼容性**: 在不支持 AbortController 的环境中提供降级方案
