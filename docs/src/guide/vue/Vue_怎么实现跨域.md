# Vue 怎么实现跨域？（必会）

**题目**: Vue 怎么实现跨域？（必会）

## 标准答案

Vue 实现跨域的主要方法有：
1. 开发环境：配置代理（devServer.proxy）
2. 后端配置：CORS（跨域资源共享）
3. Nginx 反向代理
4. JSONP（仅限 GET 请求）
5. 使用第三方代理服务

## 深入理解

在前端开发中，跨域是一个常见问题。Vue 项目中实现跨域有多种解决方案，以下是主要的几种：

### 1. 开发环境代理配置（最常用）

#### Vue CLI 项目配置
在 `vue.config.js` 中配置代理：

```javascript
// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端服务地址
        changeOrigin: true,              // 是否改变请求源
        pathRewrite: {
          '^/api': ''                   // 重写路径，去掉 /api 前缀
        }
      }
    }
  }
}
```

使用示例：
```javascript
// 前端请求
axios.get('/api/users') 
// 实际请求：http://localhost:3000/users
```

#### 多个 API 代理配置
```javascript
// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      // 代理 /api 开头的请求到后端
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      // 代理 /upload 开头的请求到文件服务器
      '/upload': {
        target: 'http://file-server.com',
        changeOrigin: true,
        pathRewrite: {
          '^/upload': ''
        }
      }
    }
  }
}
```

### 2. Vite 项目代理配置

在 `vite.config.js` 中配置：
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 3. 后端配置 CORS

在后端服务器配置 CORS 头部是最根本的解决方案：

#### Express.js 示例
```javascript
const express = require('express')
const cors = require('cors')
const app = express()

// 允许所有跨域请求（开发环境）
app.use(cors())

// 或者配置特定的跨域规则
app.use(cors({
  origin: ['http://localhost:8080', 'https://yourdomain.com'], // 允许的源
  methods: ['GET', 'POST', 'PUT', 'DELETE'],                   // 允许的HTTP方法
  allowedHeaders: ['Content-Type', 'Authorization'],           // 允许的头部
  credentials: true                                            // 允许携带凭证
}))
```

#### Node.js 原生示例
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})
```

### 4. Nginx 反向代理

在生产环境中，通常使用 Nginx 配置反向代理：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端应用
    location / {
        root /path/to/vue/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend-server:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 5. JSONP 实现跨域（仅限 GET 请求）

虽然 JSONP 是较老的跨域方案，但在某些场景下仍然有用：

```javascript
// Vue 组件中使用 JSONP
export default {
  methods: {
    fetchJSONP() {
      // 动态创建 script 标签
      const script = document.createElement('script')
      script.src = `http://api.example.com/data?callback=callbackFunction`
      
      window.callbackFunction = (data) => {
        console.log('JSONP 数据:', data)
        // 处理数据
        document.head.removeChild(script)
        delete window.callbackFunction
      }
      
      document.head.appendChild(script)
    }
  }
}
```

### 6. 使用第三方代理服务

在开发阶段，可以使用一些公共的代理服务：

```javascript
// 使用 cors-anywhere 代理
const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
const targetUrl = 'http://api.example.com/data'

axios.get(proxyUrl + targetUrl)
  .then(response => {
    console.log(response.data)
  })
```

### 最佳实践

1. **开发环境**：使用 Vue CLI 或 Vite 的代理配置
2. **生产环境**：后端配置 CORS 或使用 Nginx 反向代理
3. **安全性**：避免在生产环境中使用宽松的 CORS 配置
4. **性能考虑**：代理会增加请求延迟，需权衡使用

### 注意事项

- 代理只在开发环境有效，生产环境需要后端配合
- CORS 配置需要后端开发人员配合
- 某些请求（如携带凭证的请求）需要特殊的 CORS 配置
- 现代浏览器的安全策略可能限制某些跨域方案

这些跨域解决方案各有优缺点，开发者应根据具体项目需求和部署环境选择合适的方案。
