# Vue 的路由实现模式：hash 模式和 history 模式（必会）

## 标准答案

Vue Router 提供了两种路由实现模式：

1. **Hash 模式**：
   - URL 中包含 # 符号，如 `http://example.com/#/user`
   - 通过监听 `hashchange` 事件来检测路由变化
   - 兼容性好，支持所有浏览器
   - 不需要服务器配置支持

2. **History 模式**：
   - URL 看起来更"正常"，如 `http://example.com/user`
   - 使用 HTML5 History API（pushState、replaceState、popstate）
   - 需要服务器配置支持，防止刷新页面时 404 错误
   - SEO 友好，URL 更美观

## 深入理解

Vue Router 的两种路由模式各有特点，适用于不同的应用场景。

### 1. Hash 模式详解

Hash 模式是 Vue Router 的默认模式，它利用 URL 中的 hash（#）部分来实现路由功能。

**工作原理**：
- Hash 值（# 后面的部分）的改变不会引起页面的重新加载
- 浏览器会记录 hash 变化到历史记录中
- 可以通过 `hashchange` 事件监听 hash 的变化

**代码实现**：

```javascript
// Vue Router 中使用 hash 模式
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User }
  ]
})

// 手动实现 hash 路由原理
class HashRouter {
  constructor() {
    this.routes = {}
    this.current = ''
    
    // 监听 hash 变化
    window.addEventListener('hashchange', this.onHashChange.bind(this))
    // 页面加载时处理初始 hash
    window.addEventListener('load', this.onHashChange.bind(this))
  }
  
  // 注册路由
  route(path, callback) {
    this.routes[path] = callback
  }
  
  // 处理 hash 变化
  onHashChange() {
    this.current = window.location.hash.slice(1) || '/'
    this.routes[this.current] && this.routes[this.current]()
  }
}

// 使用示例
const router = new HashRouter()
router.route('/', () => console.log('首页'))
router.route('/about', () => console.log('关于'))
```

**优点**：
- 兼容性极好，支持所有现代浏览器和 IE8+
- 无需服务器端配置
- 开发阶段无需特殊配置

**缺点**：
- URL 中带有 #，不够美观
- 不符合 RESTful URL 规范
- 可能影响 SEO

### 2. History 模式详解

History 模式使用 HTML5 History API 来实现路由，URL 看起来更自然。

**工作原理**：
- 使用 `pushState`、`replaceState` API 来改变 URL 而不刷新页面
- 使用 `popstate` 事件监听浏览器前进后退
- 需要服务器配置将所有路由请求都指向 index.html

**代码实现**：

```javascript
// Vue Router 中使用 history 模式
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User }
  ]
})

// 手动实现 history 路由原理
class HistoryRouter {
  constructor() {
    this.routes = {}
    this.current = window.location.pathname
    
    // 监听浏览器前进后退
    window.addEventListener('popstate', this.onPopState.bind(this))
  }
  
  // 注册路由
  route(path, callback) {
    this.routes[path] = callback
  }
  
  // 编程式导航
  push(path) {
    history.pushState({}, '', path)
    this.current = path
    this.routes[path] && this.routes[path]()
  }
  
  // 替换当前路由
  replace(path) {
    history.replaceState({}, '', path)
    this.current = path
    this.routes[path] && this.routes[path]()
  }
  
  // 处理浏览器前进后退
  onPopState() {
    this.current = window.location.pathname
    this.routes[this.current] && this.routes[this.current]()
  }
}
```

**服务器配置**：
使用 History 模式时，需要服务器配置将所有路由请求都重定向到 index.html：

**Nginx 配置**：
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache 配置**：
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

**优点**：
- URL 更美观，符合 RESTful 规范
- 更好的 SEO 支持
- 更接近原生 URL 体验

**缺点**：
- 需要服务器配置支持
- 部署相对复杂
- 某些老旧浏览器可能不支持

### 3. 两种模式对比

| 特性 | Hash 模式 | History 模式 |
|------|-----------|--------------|
| URL 格式 | `/#/path` | `/path` |
| 服务器配置 | 不需要 | 需要 |
| SEO 支持 | 较差 | 更好 |
| 浏览器兼容性 | 所有浏览器 | 需要 HTML5 支持 |
| 开发复杂度 | 简单 | 需要额外配置 |
| URL 美观度 | 一般 | 更好 |

### 4. 使用场景建议

**选择 Hash 模式的情况**：
- 快速原型开发
- 不需要 SEO 优化的内部应用
- 需要支持老旧浏览器
- 无法配置服务器

**选择 History 模式的情况**：
- 需要良好 SEO 的应用
- 对 URL 美观度有要求
- 产品级应用
- 可以配置服务器环境

### 5. 实际应用示例

```javascript
// 根据环境选择路由模式
const router = createRouter({
  // 生产环境使用 history 模式，开发环境可选择
  history: process.env.NODE_ENV === 'production' 
    ? createWebHistory() 
    : createWebHashHistory(),
  routes: [
    // 路由配置
  ]
})

// 动态切换路由模式（不推荐在生产中使用）
function toggleRouterMode(isHistoryMode) {
  if (isHistoryMode) {
    // 切换到 history 模式
    window.location.href = window.location.origin + router.currentRoute.value.fullPath
  } else {
    // 切换到 hash 模式
    window.location.hash = router.currentRoute.value.fullPath
  }
}
```

选择合适的路由模式需要根据项目需求、部署环境和 SEO 要求来决定，两者各有优势和适用场景。
