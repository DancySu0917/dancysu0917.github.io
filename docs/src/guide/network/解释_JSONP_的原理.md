# 解释 JSONP 的原理？（必会）

**题目**: 解释 JSONP 的原理？（必会）

## 答案

JSONP (JSON with Padding) 是一种跨域数据交互协议，它利用了 `<script>` 标签不受同源策略限制的特性来实现跨域请求。虽然现在已经被 CORS 等更现代的技术所取代，但了解 JSONP 的原理对于理解前端发展历史仍然很重要。

### 同源策略的限制

首先需要理解浏览器的同源策略：

```javascript
// 同源策略限制的请求示例
// 当前页面: https://www.example.com
fetch('https://api.otherdomain.com/data') // 被同源策略阻止
  .then(response => response.json())
  .then(data => console.log(data));
```

### JSONP 的基本原理

JSONP 的核心思想是利用 `<script>` 标签的 src 属性可以跨域加载资源的特性：

1. 客户端动态创建一个 `<script>` 标签
2. 服务器返回一个 JavaScript 函数调用，参数是需要传输的数据
3. 浏览器执行返回的 JavaScript 代码，从而实现跨域数据传输

### JSONP 的实现方式

#### 1. 基础实现

```html
<!DOCTYPE html>
<html>
<head>
    <title>JSONP 示例</title>
</head>
<body>
    <script>
        // 定义回调函数
        function jsonpCallback(data) {
            console.log('接收到的数据:', data);
            // 处理数据
            document.getElementById('result').innerHTML = JSON.stringify(data);
        }

        // 动态创建 script 标签
        function makeJSONPRequest() {
            const script = document.createElement('script');
            script.src = 'https://api.example.com/data?callback=jsonpCallback';
            document.head.appendChild(script);
            
            // 请求完成后移除 script 标签
            script.onload = function() {
                document.head.removeChild(script);
            };
        }
    </script>
    
    <button onclick="makeJSONPRequest()">发起 JSONP 请求</button>
    <div id="result"></div>
</body>
</html>
```

服务器端返回的 JavaScript 代码：
```javascript
// 服务器返回的内容
jsonpCallback({
    "status": "success",
    "data": {
        "user": "John Doe",
        "age": 30
    }
});
```

#### 2. 封装 JSONP 函数

```javascript
function jsonp(url, callbackName, timeout = 5000) {
    return new Promise((resolve, reject) => {
        // 生成唯一的回调函数名
        const uniqueCallback = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2)}`;
        
        // 创建 script 标签
        const script = document.createElement('script');
        
        // 设置超时处理
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('JSONP request timeout'));
        }, timeout);
        
        // 清理函数
        function cleanup() {
            delete window[uniqueCallback];
            document.head.removeChild(script);
            clearTimeout(timer);
        }
        
        // 定义全局回调函数
        window[uniqueCallback] = function(data) {
            cleanup();
            resolve(data);
        };
        
        // 错误处理
        script.onerror = function() {
            cleanup();
            reject(new Error('JSONP request failed'));
        };
        
        // 构建 URL
        const separator = url.includes('?') ? '&' : '?';
        script.src = `${url}${separator}${callbackName}=${uniqueCallback}`;
        
        // 添加到页面
        document.head.appendChild(script);
    });
}

// 使用示例
jsonp('https://api.example.com/data', 'callback')
    .then(data => {
        console.log('数据接收成功:', data);
    })
    .catch(error => {
        console.error('请求失败:', error);
    });
```

#### 3. 更完善的 JSONP 实现

```javascript
class JSONPClient {
    constructor(options = {}) {
        this.timeout = options.timeout || 10000;
        this.callbackParam = options.callbackParam || 'callback';
    }
    
    request(url, params = {}) {
        return new Promise((resolve, reject) => {
            // 生成唯一回调函数名
            const callbackName = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // 构建完整 URL
            const urlParams = new URLSearchParams(params);
            urlParams.append(this.callbackParam, callbackName);
            const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${urlParams.toString()}`;
            
            // 创建 script 元素
            const script = document.createElement('script');
            script.src = fullUrl;
            
            // 设置超时
            const timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(`JSONP request timeout after ${this.timeout}ms`));
            }, this.timeout);
            
            // 清理函数
            const cleanup = () => {
                delete window[callbackName];
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                clearTimeout(timeoutId);
            };
            
            // 定义全局回调
            window[callbackName] = (data) => {
                cleanup();
                resolve(data);
            };
            
            // 错误处理
            script.onerror = () => {
                cleanup();
                reject(new Error('JSONP request failed due to network error'));
            };
            
            // 添加到页面
            document.head.appendChild(script);
        });
    }
}

// 使用示例
const jsonpClient = new JSONPClient({ timeout: 8000 });

jsonpClient.request('https://api.example.com/users', { limit: 10, page: 1 })
    .then(data => {
        console.log('用户数据:', data);
    })
    .catch(error => {
        console.error('请求失败:', error);
    });
```

### JSONP 的工作流程

1. **客户端准备**：
   - 定义一个全局回调函数
   - 创建一个 `<script>` 标签
   - 将回调函数名作为参数附加到请求 URL

2. **服务器处理**：
   - 接收请求参数
   - 获取客户端指定的回调函数名
   - 将数据包装在回调函数调用中返回

3. **浏览器执行**：
   - 下载并执行返回的 JavaScript 代码
   - 调用客户端定义的回调函数
   - 传递数据作为参数

### JSONP 的优缺点

#### 优点：
1. **兼容性好**：支持所有主流浏览器，包括旧版本浏览器
2. **简单易用**：实现相对简单，不需要复杂的配置
3. **天然跨域**：利用 `<script>` 标签天然支持跨域的特性

#### 缺点：
1. **安全性问题**：容易受到 XSS 攻击，因为返回的是可执行的 JavaScript 代码
2. **错误处理困难**：无法像 XMLHttpRequest 那样获取 HTTP 状态码
3. **只支持 GET**：无法发送 POST、PUT 等其他类型的请求
4. **调试困难**：错误信息不明确，难以调试

### JSONP 与现代替代方案对比

```javascript
// JSONP 实现
function fetchWithJSONP() {
    return new Promise((resolve, reject) => {
        window.jsonpCallback = function(data) {
            resolve(data);
        };
        
        const script = document.createElement('script');
        script.src = 'https://api.example.com/data?callback=jsonpCallback';
        document.head.appendChild(script);
    });
}

// 现代 CORS 实现
async function fetchWithCORS() {
    try {
        const response = await fetch('https://api.example.com/data', {
            method: 'POST', // 支持多种 HTTP 方法
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ /* 请求数据 */ })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('CORS request failed:', error);
        throw error;
    }
}
```

### 总结

JSONP 是一种巧妙利用浏览器特性来绕过同源策略限制的跨域解决方案。虽然它已经被 CORS 等更安全、更灵活的技术所取代，但理解 JSONP 的原理有助于：

1. 了解前端发展历史
2. 在不支持 CORS 的旧环境中提供备选方案
3. 深入理解同源策略和跨域问题的本质

在现代开发中，应优先使用 CORS、代理服务器等更安全的跨域解决方案。
