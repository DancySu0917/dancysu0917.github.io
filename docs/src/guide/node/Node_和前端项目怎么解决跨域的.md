# Node 和前端项目怎么解决跨域的？（必会）

**题目**: Node 和前端项目怎么解决跨域的？（必会）

## 标准答案

跨域问题是由于浏览器的同源策略导致的，解决方案主要有：

**Node.js后端解决方案**：
1. **CORS（跨域资源共享）**：设置响应头允许跨域访问
2. **代理转发**：使用HTTP代理将请求转发到目标服务器
3. **反向代理**：通过Nginx等工具配置跨域

**前端解决方案**：
1. **代理服务器**：开发环境使用webpack-dev-server等工具的代理功能
2. **JSONP**：利用script标签不受同源策略限制的特性
3. **PostMessage**：用于iframe间的跨域通信

## 深入分析

### 什么是跨域

跨域是浏览器的同源策略（Same-Origin Policy）限制，当协议、域名、端口号任一不同时，就会产生跨域。同源策略是浏览器的核心安全策略，用于限制一个源的文档或脚本如何与另一个源的资源进行交互。

### CORS（跨域资源共享）详解

CORS是目前最主流的跨域解决方案，通过在服务器端设置响应头来允许跨域请求：

**简单请求**（满足以下条件）：
- 使用GET、POST、HEAD方法
- 请求头仅包含简单头信息（Accept、Accept-Language、Content-Language、Last-Event-ID、Content-Type限于application/x-www-form-urlencoded、multipart/form-data、text/plain）

**复杂请求**：
- 非简单请求会先发送预检请求（OPTIONS）
- 预检请求确认允许跨域后，再发送实际请求

### 代理解决方案

代理方案通过将跨域请求转换为同域请求来解决跨域问题，常见的有：
- 开发环境代理（如webpack dev server代理）
- 生产环境反向代理（如Nginx）

### 其他跨域方案

- **JSONP**：利用script标签src属性不受同源策略限制，但只支持GET请求
- **PostMessage**：用于不同窗口或iframe间的跨域通信
- **document.domain**：用于主域名相同但子域名不同的跨域场景
- **window.name**：利用window.name属性在页面跳转后依然存在的特性

## 代码实现

```javascript
// 1. Node.js后端CORS解决方案

// Express.js + CORS中间件
const express = require('express');
const cors = require('cors');
const app = express();

// 基础CORS配置
app.use(cors());

// 自定义CORS配置
app.use(cors({
  origin: ['http://localhost:3000', 'https://example.com'], // 允许的源
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的HTTP方法
  allowedHeaders: ['Content-Type', 'Authorization'], // 允许的头部
  credentials: true // 允许携带cookie
}));

// 手动设置CORS头
app.use((req, res, next) => {
  // 允许特定源跨域访问
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  // 或允许所有源（生产环境不推荐）
  // res.header('Access-Control-Allow-Origin', '*');
  
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 允许的HTTP方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // 允许携带认证信息（如cookie）
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 暴露给前端的响应头（允许前端访问）
  res.header('Access-Control-Expose-Headers', 'X-Total-Count');
  
  // 预检请求缓存时间（秒）
  res.header('Access-Control-Max-Age', '86400');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 2. Koa.js CORS实现
const Koa = require('koa');
const Router = require('koa-router');

const koaApp = new Koa();
const router = new Router();

// 手动设置CORS中间件
const corsMiddleware = async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  ctx.set('Access-Control-Allow-Credentials', 'true');
  
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
  } else {
    await next();
  }
};

koaApp.use(corsMiddleware);
koaApp.use(router.routes());

// 3. Node.js代理服务器实现
const http = require('http');
const httpProxy = require('http-proxy');

// 创建代理服务器
const proxy = httpProxy.createProxyServer({
  target: 'http://api.example.com', // 目标服务器
  changeOrigin: true, // 改变源
  pathRewrite: {
    '^/api': '' // 重写路径
  }
});

const proxyServer = http.createServer((req, res) => {
  // 添加CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 代理请求
  proxy.web(req, res, { target: 'http://api.example.com' });
});

proxyServer.listen(3001, () => {
  console.log('代理服务器运行在端口3001');
});

// 4. 前端开发环境代理配置

// webpack配置示例
const path = require('path');

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端服务地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '' // 重写路径，去掉/api前缀
        },
        // 代理请求时的配置
        onProxyReq: (proxyReq, req, res) => {
          console.log('代理请求:', req.method, req.url);
        },
        // 代理响应时的配置
        onProxyRes: (proxyRes, req, res) => {
          console.log('代理响应:', proxyRes.statusCode);
        }
      }
    }
  }
};

// 5. 前端Fetch API跨域处理
class CrossOriginRequest {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // 基础请求方法
  async request(url, options = {}) {
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include', // 包含认证信息
      ...options
    };

    if (config.method !== 'GET' && config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('请求失败:', error);
      throw error;
    }
  }

  // GET请求
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request(fullUrl, { method: 'GET' });
  }

  // POST请求
  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// 6. JSONP实现
class JSONPClient {
  constructor() {
    this.callbackId = 0;
  }

  // 发送JSONP请求
  request(url, callbackParam = 'callback') {
    return new Promise((resolve, reject) => {
      const callbackName = `jsonp_callback_${Date.now()}_${++this.callbackId}`;
      
      // 创建全局回调函数
      window[callbackName] = (data) => {
        delete window[callbackName];
        document.body.removeChild(script);
        resolve(data);
      };

      // 创建script标签
      const script = document.createElement('script');
      script.src = `${url}${url.includes('?') ? '&' : '?'}${callbackParam}=${callbackName}`;
      
      // 错误处理
      script.onerror = () => {
        delete window[callbackName];
        document.body.removeChild(script);
        reject(new Error('JSONP request failed'));
      };

      // 添加到页面
      document.body.appendChild(script);
    });
  }
}

// 7. 服务端代理API实现
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyApp = express();

// 代理到用户服务
proxyApp.use('/user-api', createProxyMiddleware({
  target: 'http://user-service.example.com',
  changeOrigin: true,
  pathRewrite: {
    '^/user-api': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // 可以在这里修改请求头等
    proxyReq.setHeader('X-Forwarded-For', req.connection.remoteAddress);
  },
  onProxyRes: (proxyRes, req, res) => {
    // 可以在这里修改响应头等
    proxyRes.headers['X-Powered-By'] = 'Node Proxy';
  }
}));

// 代理到商品服务
proxyApp.use('/product-api', createProxyMiddleware({
  target: 'http://product-service.example.com',
  changeOrigin: true,
  pathRewrite: {
    '^/product-api': ''
  }
}));

proxyApp.listen(3000, () => {
  console.log('代理服务运行在端口3000');
});

// 8. Nginx反向代理配置示例（作为注释提供）
/*
server {
    listen 80;
    server_name example.com;

    # 前端应用
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://backend-server:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS头
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }
}
*/

// 9. 环境配置管理
const config = {
  development: {
    apiUrl: 'http://localhost:8080/api',
    proxy: {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  },
  production: {
    apiUrl: 'https://api.example.com',
    cors: {
      origin: ['https://www.example.com', 'https://app.example.com']
    }
  }
};

// 根据环境变量选择配置
const currentConfig = config[process.env.NODE_ENV || 'development'];

console.log('当前环境配置:', currentConfig);
```

## 实际应用场景

### 1. 开发环境
- 使用webpack-dev-server或Vite的代理功能解决开发时的跨域问题
- 配置API代理，将前端请求转发到后端服务

### 2. 生产环境
- 后端服务配置CORS头，允许特定域名的跨域访问
- 使用Nginx等反向代理工具统一处理跨域问题

### 3. 微服务架构
- 通过API网关统一处理跨域问题
- 各个微服务之间通过内部网络通信，避免跨域问题

### 4. 前后端分离项目
- 后端提供API服务，配置适当的CORS策略
- 前端通过代理或直接调用处理跨域请求

## 总结

跨域问题的解决方案需要根据具体场景选择：
- **开发阶段**：优先使用代理方案，方便调试
- **生产环境**：推荐使用CORS方案，安全性更高
- **安全考虑**：避免使用通配符(*)，明确指定允许的源
- **性能考虑**：合理设置预检请求缓存时间，减少OPTIONS请求
