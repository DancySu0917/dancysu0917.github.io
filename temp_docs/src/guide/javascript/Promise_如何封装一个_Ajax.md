# Promise 如何封装一个 Ajax？（高薪常问）

**题目**: Promise 如何封装一个 Ajax？（高薪常问）

**标准答案**:
使用 Promise 封装 Ajax 主要通过创建一个新的 Promise 实例，在其中使用 XMLHttpRequest 对象发送请求。当请求成功时调用 resolve，失败时调用 reject。

**深入理解**:
完整的 Promise 封装 Ajax 实现：

```javascript
// 基础版本的 Promise 封装 Ajax
function ajax(options) {
  // 设置默认参数
  const defaults = {
    method: 'GET',
    url: '',
    data: null,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5000
  };
  
  // 合并参数
  const config = Object.assign({}, defaults, options);
  
  return new Promise((resolve, reject) => {
    // 创建 XMLHttpRequest 对象
    const xhr = new XMLHttpRequest();
    
    // 设置请求方法和 URL
    xhr.open(config.method, config.url, true);
    
    // 设置请求头
    for (let header in config.headers) {
      xhr.setRequestHeader(header, config.headers[header]);
    }
    
    // 设置超时时间
    xhr.timeout = config.timeout;
    
    // 处理响应
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 成功时解析响应数据
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          // 如果不是 JSON 格式，直接返回文本
          resolve(xhr.responseText);
        }
      } else {
        // HTTP 状态码错误
        reject(new Error(`请求失败，状态码: ${xhr.status}`));
      }
    };
    
    // 处理网络错误
    xhr.onerror = function() {
      reject(new Error('网络错误'));
    };
    
    // 处理超时错误
    xhr.ontimeout = function() {
      reject(new Error('请求超时'));
    };
    
    // 发送请求
    if (config.method.toUpperCase() === 'GET' || !config.data) {
      xhr.send();
    } else {
      xhr.send(JSON.stringify(config.data));
    }
  });
}

// 使用示例
ajax({
  method: 'GET',
  url: '/api/users'
})
.then(data => {
  console.log('请求成功:', data);
})
.catch(error => {
  console.error('请求失败:', error);
});
```

**增强版本的 Ajax 封装**:

```javascript
class Ajax {
  constructor(baseURL = '', defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }
  
  request(config) {
    const {
      method = 'GET',
      url,
      data = null,
      headers = {},
      timeout = 10000,
      params = {}
    } = config;
    
    return new Promise((resolve, reject) => {
      // 构建完整 URL
      let fullURL = this.baseURL + url;
      
      // 处理 GET 请求参数
      if (method.toUpperCase() === 'GET' && Object.keys(params).length > 0) {
        const queryString = Object.keys(params)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&');
        fullURL += (fullURL.includes('?') ? '&' : '?') + queryString;
      }
      
      const xhr = new XMLHttpRequest();
      xhr.open(method, fullURL, true);
      xhr.timeout = timeout;
      
      // 合并请求头
      const mergedHeaders = { ...this.defaultHeaders, ...headers };
      for (const [key, value] of Object.entries(mergedHeaders)) {
        xhr.setRequestHeader(key, value);
      }
      
      xhr.onload = () => {
        const response = {
          data: this.parseResponse(xhr),
          status: xhr.status,
          statusText: xhr.statusText,
          headers: this.parseHeaders(xhr.getAllResponseHeaders())
        };
        
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(new Error(`HTTP Error: ${xhr.status} ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('网络错误'));
      };
      
      xhr.ontimeout = () => {
        reject(new Error(`请求超时 (${timeout}ms)`));
      };
      
      // 发送请求
      const body = this.shouldSendBody(method) && data ? 
        JSON.stringify(data) : null;
      xhr.send(body);
    });
  }
  
  // 解析响应
  parseResponse(xhr) {
    const contentType = xhr.getResponseHeader('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(xhr.responseText);
      } catch (e) {
        return xhr.responseText;
      }
    } else if (contentType.includes('text/')) {
      return xhr.responseText;
    } else {
      return xhr.response;
    }
  }
  
  // 解析响应头
  parseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;
    
    headerStr.split('\r\n').forEach(line => {
      const parts = line.split(': ');
      if (parts.length === 2) {
        headers[parts[0].toLowerCase()] = parts[1];
      }
    });
    
    return headers;
  }
  
  // 判断是否应该发送请求体
  shouldSendBody(method) {
    return !['GET', 'HEAD'].includes(method.toUpperCase());
  }
  
  // 便捷方法
  get(url, params, config = {}) {
    return this.request({ method: 'GET', url, params, ...config });
  }
  
  post(url, data, config = {}) {
    return this.request({ method: 'POST', url, data, ...config });
  }
  
  put(url, data, config = {}) {
    return this.request({ method: 'PUT', url, data, ...config });
  }
  
  delete(url, config = {}) {
    return this.request({ method: 'DELETE', url, ...config });
  }
  
  patch(url, data, config = {}) {
    return this.request({ method: 'PATCH', url, data, ...config });
  }
}

// 使用示例
const api = new Ajax('https://api.example.com');

// GET 请求
api.get('/users', { page: 1, limit: 10 })
  .then(response => {
    console.log('用户列表:', response.data);
  })
  .catch(error => {
    console.error('获取用户失败:', error);
  });

// POST 请求
api.post('/users', { name: 'John', email: 'john@example.com' })
  .then(response => {
    console.log('创建用户成功:', response.data);
  })
  .catch(error => {
    console.error('创建用户失败:', error);
  });

// 使用链式调用
api.get('/users/123')
  .then(response => {
    console.log('用户信息:', response.data);
    // 更新用户
    return api.put(`/users/123`, { ...response.data, name: 'Updated Name' });
  })
  .then(response => {
    console.log('用户更新成功:', response.data);
  })
  .catch(error => {
    console.error('操作失败:', error);
  });
```

**使用 Fetch API 的现代化封装**:

```javascript
// 基于 Fetch API 的封装
function fetchAjax(url, options = {}) {
  const {
    method = 'GET',
    data = null,
    headers = {},
    timeout = 10000,
    ...config
  } = options;
  
  // 设置默认请求头
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  // 构建请求配置
  const fetchConfig = {
    method,
    headers: requestHeaders,
    ...config
  };
  
  // 如果有数据且不是 GET 请求，添加到 body
  if (data && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    fetchConfig.body = typeof data === 'string' ? data : JSON.stringify(data);
  }
  
  // 实现超时控制
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时'));
    }, timeout);
  });
  
  const fetchPromise = fetch(url, fetchConfig)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    });
  
  // 使用 Promise.race 实现超时控制
  return Promise.race([fetchPromise, timeoutPromise]);
}

// 使用示例
fetchAjax('/api/users', {
  method: 'POST',
  data: { name: 'John', email: 'john@example.com' },
  timeout: 5000
})
.then(data => {
  console.log('请求成功:', data);
})
.catch(error => {
  console.error('请求失败:', error);
});
```

**实际应用中的最佳实践**:
- 错误处理：区分网络错误、HTTP 错误和解析错误
- 请求取消：支持 AbortController 取消请求
- 请求拦截：添加请求和响应拦截器
- 重试机制：对于临时性错误自动重试
- 缓存机制：对 GET 请求进行缓存
