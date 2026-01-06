# 封装好的 Ajax 里的常见参数及其代表的含义？（必会）

**题目**: 封装好的 Ajax 里的常见参数及其代表的含义？（必会）

## 标准答案

封装好的 Ajax 常见参数包括：

1. **url**：请求的目标地址
2. **method/type**：请求方法（GET、POST、PUT、DELETE 等）
3. **data**：发送到服务器的数据
4. **headers**：请求头信息
5. **timeout**：请求超时时间
6. **dataType**：期望的响应数据类型
7. **async**：是否异步执行
8. **success/error**：成功和失败的回调函数

## 深入理解

### Ajax 参数详解

1. **url**：指定请求的 URL 地址
   - 必需参数
   - 可以是相对路径或绝对路径

2. **method/type**：HTTP 请求方法
   - GET：获取数据，参数在 URL 中
   - POST：提交数据，参数在请求体中
   - PUT：更新数据
   - DELETE：删除数据

3. **data**：发送给服务器的数据
   - GET 请求：通常为查询字符串或对象，会附加到 URL 中
   - POST/PUT 请求：通常为 JSON 字符串或表单数据

4. **headers**：请求头信息
   - Content-Type：指定发送数据的格式
   - Authorization：认证信息
   - 自定义请求头

5. **timeout**：请求超时时间（毫秒）
   - 防止请求长时间挂起
   - 提升用户体验

6. **dataType**：期望的响应数据类型
   - json：JSON 格式数据
   - xml：XML 格式数据
   - html：HTML 格式数据
   - text：纯文本

7. **async**：同步或异步请求
   - true（默认）：异步请求，不会阻塞后续代码
   - false：同步请求，会阻塞后续代码执行

8. **success/error/complete**：回调函数
   - success：请求成功时执行
   - error：请求失败时执行
   - complete：请求完成后执行（无论成功或失败）

### 代码示例

基础 Ajax 封装：

```javascript
// 基础 Ajax 函数封装
function ajax(options) {
  // 默认配置
  const defaults = {
    url: '',
    method: 'GET',
    data: null,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5000,
    dataType: 'json',
    async: true
  };
  
  // 合并用户配置
  const config = Object.assign({}, defaults, options);
  
  return new Promise((resolve, reject) => {
    // 创建 XMLHttpRequest 对象
    const xhr = new XMLHttpRequest();
    
    // 设置超时时间
    xhr.timeout = config.timeout;
    
    // 处理 GET 请求的参数
    let url = config.url;
    if (config.method.toUpperCase() === 'GET' && config.data) {
      const queryString = Object.keys(config.data).map(key => 
        encodeURIComponent(key) + '=' + encodeURIComponent(config.data[key])
      ).join('&');
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    
    // 打开连接
    xhr.open(config.method, url, config.async);
    
    // 设置请求头
    for (let header in config.headers) {
      xhr.setRequestHeader(header, config.headers[header]);
    }
    
    // 监听状态变化
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { // 请求完成
        if (xhr.status >= 200 && xhr.status < 300) {
          // 请求成功
          let response = xhr.responseText;
          
          // 根据 dataType 解析响应
          if (config.dataType === 'json') {
            try {
              response = JSON.parse(response);
            } catch (e) {
              reject(new Error('JSON 解析失败'));
              return;
            }
          }
          
          resolve(response);
        } else {
          // 请求失败
          reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      }
    };
    
    // 处理超时
    xhr.ontimeout = function() {
      reject(new Error('请求超时'));
    };
    
    // 处理网络错误
    xhr.onerror = function() {
      reject(new Error('网络错误'));
    };
    
    // 发送请求
    if (config.method.toUpperCase() === 'GET' || !config.data) {
      xhr.send();
    } else {
      // 根据 Content-Type 序列化数据
      let sendData = config.data;
      if (typeof config.data === 'object') {
        if (config.headers['Content-Type'] === 'application/json') {
          sendData = JSON.stringify(config.data);
        } else if (config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
          sendData = Object.keys(config.data).map(key => 
            encodeURIComponent(key) + '=' + encodeURIComponent(config.data[key])
          ).join('&');
        }
      }
      xhr.send(sendData);
    }
  });
}

// 使用示例
ajax({
  url: '/api/users',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token123'
  }
})
.then(data => {
  console.log('获取用户数据成功:', data);
})
.catch(error => {
  console.error('请求失败:', error.message);
});

// POST 请求示例
ajax({
  url: '/api/users',
  method: 'POST',
  data: {
    name: '张三',
    email: 'zhangsan@example.com'
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  }
})
.then(data => {
  console.log('创建用户成功:', data);
})
.catch(error => {
  console.error('创建用户失败:', error.message);
});
```

使用现代 Fetch API 的封装：

```javascript
// 使用 Fetch API 的 Ajax 封装
function fetchAjax(options) {
  const defaults = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5000
  };
  
  // 合并配置
  const config = Object.assign({}, defaults, options);
  
  // 处理 GET 请求参数
  let url = config.url;
  if (config.method.toUpperCase() === 'GET' && config.data) {
    const urlObj = new URL(url, window.location.origin);
    Object.keys(config.data).forEach(key => {
      urlObj.searchParams.append(key, config.data[key]);
    });
    url = urlObj.toString();
  }
  
  // 配置请求选项
  const fetchOptions = {
    method: config.method,
    headers: config.headers
  };
  
  // 处理请求体数据
  if (config.method.toUpperCase() !== 'GET' && config.data) {
    if (typeof config.data === 'object') {
      fetchOptions.body = JSON.stringify(config.data);
    } else {
      fetchOptions.body = config.data;
    }
  }
  
  // 实现超时控制
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时'));
    }, config.timeout);
  });
  
  const fetchPromise = fetch(url, fetchOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.json();
    });
  
  // 返回超时控制的 Promise
  return Promise.race([fetchPromise, timeoutPromise]);
}

// 使用示例
fetchAjax({
  url: '/api/data',
  method: 'POST',
  data: { name: '测试数据' }
})
.then(data => console.log(data))
.catch(error => console.error(error.message));
```

jQuery 风格的 Ajax 封装：

```javascript
// jQuery 风格的 Ajax 封装
function jqAjax(options) {
  const defaults = {
    url: '',
    method: 'GET',
    data: null,
    headers: {},
    timeout: 0, // jQuery 默认为 0（无超时）
    dataType: 'text',
    async: true,
    success: null,
    error: null,
    complete: null
  };
  
  // 合并配置
  const config = Object.assign({}, defaults, options);
  
  // 内部处理函数
  function handleSuccess(data) {
    if (config.success) config.success(data);
  }
  
  function handleError(error) {
    if (config.error) config.error(error);
  }
  
  function handleComplete() {
    if (config.complete) config.complete();
  }
  
  // 创建 Promise 以保持一致性
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    if (config.timeout > 0) {
      xhr.timeout = config.timeout;
    }
    
    let url = config.url;
    if (config.method.toUpperCase() === 'GET' && config.data) {
      const params = new URLSearchParams(config.data);
      url += (url.includes('?') ? '&' : '?') + params.toString();
    }
    
    xhr.open(config.method, url, config.async);
    
    // 设置请求头
    Object.keys(config.headers).forEach(key => {
      xhr.setRequestHeader(key, config.headers[key]);
    });
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        handleComplete();
        
        if (xhr.status >= 200 && xhr.status < 300) {
          let response = xhr.responseText;
          
          // 根据 dataType 处理响应
          if (config.dataType.toLowerCase() === 'json') {
            try {
              response = JSON.parse(response);
            } catch (e) {
              const error = new Error('JSON 解析失败');
              handleError(error);
              reject(error);
              return;
            }
          }
          
          handleSuccess(response);
          resolve(response);
        } else {
          const error = new Error(`HTTP Error: ${xhr.status}`);
          handleError(error);
          reject(error);
        }
      }
    };
    
    xhr.ontimeout = function() {
      const error = new Error('请求超时');
      handleError(error);
      reject(error);
    };
    
    xhr.onerror = function() {
      const error = new Error('网络错误');
      handleError(error);
      reject(error);
    };
    
    // 发送请求
    let body = null;
    if (config.method.toUpperCase() !== 'GET' && config.data) {
      if (typeof config.data === 'object') {
        body = JSON.stringify(config.data);
      } else {
        body = config.data;
      }
    }
    
    xhr.send(body);
  });
}

// 使用示例（兼容 jQuery 风格回调）
jqAjax({
  url: '/api/users',
  method: 'GET',
  dataType: 'json',
  success: function(data) {
    console.log('成功获取数据:', data);
  },
  error: function(error) {
    console.error('请求失败:', error);
  },
  complete: function() {
    console.log('请求完成');
  }
});
```

### 实际应用场景

1. **RESTful API 调用**：使用不同的 HTTP 方法对应 CRUD 操作
2. **文件上传**：配置适当的 Content-Type 和数据格式
3. **认证请求**：在 headers 中添加认证信息
4. **批量请求**：配置超时时间避免长时间等待
5. **数据验证**：通过 dataType 确保接收正确的数据格式
