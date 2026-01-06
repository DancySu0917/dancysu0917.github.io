# JavaScript 的同源策略？（必会）

## 标准答案

同源策略（Same-Origin Policy）是浏览器最基本的安全策略，它限制了一个源（Origin）的文档或脚本如何与另一个源的资源进行交互。同源要求协议、域名、端口三者完全相同。该策略旨在防止恶意文档或脚本从一个源获取或操作另一个源的敏感数据。

## 深入分析

同源策略是Web安全的基石，它确保了不同源之间的隔离。同源的判断标准包括：

1. **协议相同**：如 http、https
2. **域名相同**：如 example.com、sub.example.com 是不同源
3. **端口相同**：如 80、443、8080

同源策略限制了以下操作：
- 读取其他源的DOM元素
- 发起跨源AJAX请求
- 访问其他源的Cookie、LocalStorage、SessionStorage
- 操作其他源的iframe

但同源策略允许以下操作：
- 嵌入跨源资源（如图片、脚本、样式表）
- 重定向到不同源的页面
- 发起跨源表单提交（但无法读取响应）

## 代码示例

### 1. 同源策略的限制示例

```javascript
// 假设当前页面是 http://example.com:8080

// 同源 - 允许
// http://example.com:8080/path1
// http://example.com:8080/path2

// 不同源 - 被同源策略限制
// http://api.example.com:8080 (不同域名)
// https://example.com:8080 (不同协议)
// http://example.com:9000 (不同端口)

// 尝试访问跨源iframe的内容（会被阻止）
try {
  const iframe = document.getElementById('crossOriginFrame');
  const iframeDocument = iframe.contentDocument; // 这里会被阻止
} catch (error) {
  console.error('同源策略阻止了跨源访问:', error);
}

// 尝试发起跨源AJAX请求（会被阻止，除非服务器允许）
fetch('http://api.otherdomain.com/data')
  .then(response => response.json())
  .catch(error => {
    console.error('跨源请求被阻止:', error);
  });
```

### 2. 跨源资源共享（CORS）实现

```javascript
// 服务端设置CORS头
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
// Access-Control-Allow-Headers: Content-Type, Authorization

// 客户端发起跨源请求
async function fetchCrossOriginData() {
  try {
    const response = await fetch('http://api.example.com/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      },
      mode: 'cors' // 明确指定CORS模式
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('跨源数据:', data);
    return data;
  } catch (error) {
    console.error('跨源请求失败:', error);
    throw error;
  }
}

// 带凭证的跨源请求
async function fetchWithCredentials() {
  try {
    const response = await fetch('http://api.example.com/protected', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 包含凭证（Cookie等）
      body: JSON.stringify({ data: 'sensitive' })
    });
    
    return await response.json();
  } catch (error) {
    console.error('带凭证的跨源请求失败:', error);
  }
}
```

### 3. JSONP跨源实现

```javascript
// JSONP实现跨源请求
function jsonp(url, callbackName, callback) {
  return new Promise((resolve, reject) => {
    // 创建script标签
    const script = document.createElement('script');
    
    // 生成唯一的回调函数名
    const uniqueCallback = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    
    // 定义全局回调函数
    window[uniqueCallback] = function(data) {
      // 调用用户传入的回调
      callback && callback(data);
      resolve(data);
      
      // 清理
      document.head.removeChild(script);
      delete window[uniqueCallback];
    };
    
    // 设置请求URL
    script.src = `${url}?callback=${uniqueCallback}`;
    
    // 错误处理
    script.onerror = function() {
      reject(new Error('JSONP请求失败'));
      
      // 清理
      document.head.removeChild(script);
      delete window[uniqueCallback];
    };
    
    // 添加到页面
    document.head.appendChild(script);
  });
}

// 使用JSONP
jsonp('http://api.example.com/data', 'callback', (data) => {
  console.log('JSONP返回数据:', data);
});
```

### 4. postMessage跨源通信

```javascript
// 父页面发送消息给iframe
function sendMessageToIframe() {
  const iframe = document.getElementById('childFrame');
  
  // 发送消息
  iframe.contentWindow.postMessage({
    type: 'getData',
    data: { userId: 123 }
  }, 'http://child.example.com'); // 指定目标源
}

// 父页面接收来自iframe的消息
window.addEventListener('message', function(event) {
  // 验证消息来源
  if (event.origin !== 'http://child.example.com') {
    console.log('消息来源不匹配，忽略');
    return;
  }
  
  // 处理消息
  if (event.data.type === 'userData') {
    console.log('收到子页面数据:', event.data.payload);
  }
});

// iframe页面接收消息
window.addEventListener('message', function(event) {
  // 验证消息来源
  if (event.origin !== 'http://parent.example.com') {
    return; // 忽略非预期来源的消息
  }
  
  if (event.data.type === 'getData') {
    // 处理请求并发送响应
    const userData = { name: 'John', age: 30 };
    
    event.source.postMessage({
      type: 'userData',
      payload: userData
    }, event.origin); // 发送回给来源
  }
});
```

### 5. 代理服务器解决跨源问题

```javascript
// 前端请求代理服务器（同源）
async function fetchDataViaProxy(apiPath) {
  try {
    // 请求同源的代理端点
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(apiPath)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('代理请求失败:', error);
    throw error;
  }
}

// 代理服务器端点实现（Node.js示例）
// app.get('/api/proxy', async (req, res) => {
//   const { url } = req.query;
//   try {
//     const targetResponse = await fetch(url);
//     const data = await targetResponse.json();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
```

## 实际应用场景

### 1. 前后端分离架构
在前后端分离项目中，前端运行在开发服务器（如localhost:3000），后端API运行在不同端口（如localhost:8080），需要配置CORS或代理解决跨源问题。

### 2. 第三方集成
集成第三方服务（如支付、地图、社交登录）时，需要使用postMessage或CORS进行安全的跨源通信。

### 3. 微前端架构
在微前端架构中，不同子应用可能部署在不同域名下，需要合理使用跨源通信机制。

### 4. CDN资源加载
CDN资源（如图片、CSS、JS）不受同源策略限制，可以自由加载，但需要防范XSS攻击。

## 延伸知识点

### 1. CORS预检请求
对于复杂请求（如自定义头部、PUT/DELETE方法），浏览器会先发送OPTIONS预检请求。

### 2. Document Domain
在子域名之间可以设置document.domain实现有限的跨源访问。

### 3. 同源策略与安全
同源策略防止CSRF、XSS等攻击，是Web安全的重要防线。

同源策略是Web安全的核心机制，开发者需要理解其原理并在实际项目中合理处理跨源需求。
