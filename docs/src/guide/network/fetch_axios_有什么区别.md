# fetch、axios 有什么区别？（必会）

**题目**: fetch、axios 有什么区别？（必会）

## 标准答案

fetch 和 axios 是前端开发中常用的两种 HTTP 请求库，主要区别如下：

1. **API 设计**: fetch 是浏览器原生 API，基于 Promise；axios 是第三方库，提供更丰富的 API
2. **浏览器兼容性**: fetch 需要 polyfill 支持旧浏览器；axios 兼容性更好
3. **功能特性**: axios 提供更多内置功能（如请求/响应拦截器、自动转换数据、取消请求等）；fetch 功能相对简单
4. **错误处理**: fetch 对 HTTP 错误状态码不会自动 reject；axios 会自动处理错误状态
5. **请求配置**: axios 提供更灵活的配置选项；fetch 配置相对简单

## 深入分析

### 1. API 设计与使用方式

**fetch** 是浏览器原生提供的基于 Promise 的 HTTP 请求 API，遵循标准的 Fetch 规范。它返回一个 Promise，该 Promise resolve 一个 Response 对象。

**axios** 是一个基于 Promise 的 HTTP 客户端库，提供了更丰富的 API 和功能。它不是浏览器原生 API，需要额外引入。

### 2. 浏览器兼容性

- fetch: 现代浏览器支持，IE 不支持（需要 polyfill）
- axios: 支持所有现代浏览器，包括 IE8+

### 3. 功能对比

| 特性 | fetch | axios |
|------|-------|-------|
| 请求/响应拦截器 | 不支持 | 支持 |
| 自动 JSON 转换 | 不支持（需要手动） | 支持 |
| 请求取消 | 通过 AbortController | 通过 CancelToken 或 AbortController |
| 错误处理 | 需要手动检查 status | 自动处理 HTTP 错误 |
| 进度监控 | 不直接支持 | 支持上传/下载进度 |
| 自动重试 | 不支持 | 需要手动实现 |

### 4. 错误处理机制

fetch 只有在网络错误时才会 reject Promise，对于 HTTP 错误状态码（如 404、500）不会自动 reject，需要手动检查 response.ok 或 response.status。

axios 会自动将 HTTP 错误状态码转换为 rejected Promise，更符合直觉。

## 代码示例

### 1. 基础 GET 请求对比

```javascript
// fetch 示例
async function fetchExample() {
  try {
    const response = await fetch('https://api.example.com/data');
    
    // 需要手动检查状态码
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// axios 示例
async function axiosExample() {
  try {
    const response = await axios.get('https://api.example.com/data');
    // axios 自动处理错误状态码
    console.log(response.data);
  } catch (error) {
    console.error('Axios error:', error.response?.data || error.message);
  }
}
```

### 2. POST 请求对比

```javascript
// fetch POST 请求
async function fetchPost() {
  try {
    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John',
        email: 'john@example.com'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Fetch POST error:', error);
  }
}

// axios POST 请求
async function axiosPost() {
  try {
    const response = await axios.post('https://api.example.com/users', {
      name: 'John',
      email: 'john@example.com'
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Axios POST error:', error);
  }
}
```

### 3. 请求/响应拦截器

```javascript
// axios 拦截器示例
// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    config.headers.Authorization = `Bearer ${getToken()}`;
    console.log('请求发送:', config);
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    console.log('响应接收:', response);
    return response;
  },
  error => {
    // 对响应错误做点什么
    if (error.response?.status === 401) {
      // 处理未授权错误
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

// fetch 实现类似拦截器功能
class FetchClient {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }
  
  useRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }
  
  useResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }
  
  async request(url, options = {}) {
    // 应用请求拦截器
    for (const interceptor of this.requestInterceptors) {
      options = await interceptor(url, options) || options;
    }
    
    let response = await fetch(url, options);
    
    // 应用响应拦截器
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response) || response;
    }
    
    return response;
  }
}

const client = new FetchClient();

client.useRequestInterceptor(async (url, options) => {
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${getToken()}`
  };
  return options;
});
```

### 4. 请求取消

```javascript
// fetch 使用 AbortController 取消请求
const controller = new AbortController();
const signal = controller.signal;

fetch('https://api.example.com/data', { signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求被取消');
    } else {
      console.error('请求错误:', err);
    }
  });

// 3秒后取消请求
setTimeout(() => {
  controller.abort();
}, 3000);

// axios 使用 CancelToken 取消请求（旧方式）
const source = axios.CancelToken.source();

axios.get('https://api.example.com/data', {
  cancelToken: source.token
})
.then(response => {
  console.log(response.data);
})
.catch(thrown => {
  if (axios.isCancel(thrown)) {
    console.log('请求被取消', thrown.message);
  } else {
    console.error('请求错误', thrown);
  }
});

// 3秒后取消请求
setTimeout(() => {
  source.cancel('操作超时');
}, 3000);

// axios 使用 AbortController 取消请求（新方式）
const abortController = new AbortController();

axios.get('https://api.example.com/data', {
  signal: abortController.signal
})
.then(response => console.log(response.data))
.catch(error => {
  if (axios.isCancel(error)) {
    console.log('请求被取消');
  }
});
```

### 5. 错误处理

```javascript
// fetch 错误处理
async function fetchWithErrorHandling() {
  try {
    const response = await fetch('https://api.example.com/data');
    
    // 需要手动检查 HTTP 状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      // 网络错误
      console.error('网络错误:', error.message);
    } else {
      // HTTP 错误或其他错误
      console.error('请求错误:', error.message);
    }
    throw error;
  }
}

// axios 错误处理
async function axiosWithErrorHandling() {
  try {
    const response = await axios.get('https://api.example.com/data');
    return response.data;
  } catch (error) {
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('响应错误:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误:', error.request);
    } else {
      // 其他错误
      console.error('错误:', error.message);
    }
    throw error;
  }
}
```

## 实际应用场景

### 何时选择 fetch

1. **轻量级项目**: 当项目不需要复杂请求功能时
2. **原生 API 偏好**: 团队更倾向于使用浏览器原生 API
3. **最小化打包体积**: 不想引入额外的第三方库
4. **简单的 API 调用**: 仅需要基本的 GET/POST 请求

### 何时选择 axios

1. **复杂项目**: 需要拦截器、请求取消等高级功能
2. **统一错误处理**: 需要统一的错误处理机制
3. **跨平台支持**: 需要在浏览器和 Node.js 中使用
4. **进度监控**: 需要监控文件上传/下载进度
5. **请求配置复用**: 需要创建实例并复用配置

### 性能考虑

- **Bundle 大小**: fetch 是原生 API，无额外体积；axios 增加约 5-15KB
- **执行性能**: 两者性能差异不大，主要看具体使用方式
- **内存使用**: axios 由于提供更多功能，内存使用略高

## 注意事项

1. **兼容性处理**: 使用 fetch 时注意 IE 兼容性问题
2. **错误处理**: fetch 需要手动处理 HTTP 错误状态
3. **JSON 转换**: fetch 需要手动调用 .json() 方法
4. **请求配置**: axios 提供更多便捷配置选项
5. **学习成本**: axios API 更丰富但学习成本稍高
