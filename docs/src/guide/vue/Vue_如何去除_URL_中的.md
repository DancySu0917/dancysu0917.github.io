# Vue 如何去除 URL 中的#？（必会）

## 标准答案

Vue中要去除URL中的#号，需要将Vue Router的路由模式从默认的hash模式改为history模式。在创建路由实例时，使用`createWebHistory()`函数替代`createWebHashHistory()`函数即可实现。

## 深入理解

Vue Router提供了两种路由模式：hash模式和history模式。默认情况下，Vue Router使用hash模式，URL中会包含#号。要去除#号，需要使用HTML5的History API实现history模式。

### 1. 实现方式

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

// 使用 createWebHistory() 替代 createWebHashHistory()
const router = createRouter({
  history: createWebHistory(), // 使用history模式
  routes
})

export default router
```

### 2. 两种模式对比

| 特性 | Hash模式 | History模式 |
|------|----------|-------------|
| URL示例 | `http://example.com/#/home` | `http://example.com/home` |
| 浏览器兼容性 | 支持所有浏览器 | 需要HTML5 History API支持 |
| 服务器配置 | 不需要特殊配置 | 需要服务器支持 |
| 实现原理 | 监听hashchange事件 | 使用pushState/replaceState API |

### 3. 服务器配置

使用history模式时，由于URL路径不包含#号，当用户直接访问或刷新页面时，服务器需要配置将所有路由请求都指向index.html：

**Apache服务器配置**：
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx服务器配置**：
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 4. 注意事项

- History模式需要服务器支持，否则直接访问路由路径会返回404错误
- Hash模式在所有浏览器中都能正常工作，History模式需要支持HTML5 History API的浏览器
- History模式的URL更美观，更符合现代Web应用的标准
