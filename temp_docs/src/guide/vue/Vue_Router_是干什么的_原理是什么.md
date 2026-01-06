# Vue-Router 是干什么的，原理是什么？（必会）

## 标准答案

Vue Router 是 Vue.js 官方的路由管理器，用于构建单页面应用（SPA）。它实现了前端路由功能，让 URL 的改变可以映射到不同的组件视图，而无需重新加载整个页面。

Vue Router 的核心原理基于浏览器的 History API 或 Hash 模式来实现 URL 的监听和路由跳转，通过监听 URL 变化来动态渲染对应的组件。

## 深入理解

Vue Router 是 Vue.js 生态系统中的重要组成部分，它为 Vue 应用提供了完整的路由解决方案。

### 1. Vue Router 的核心功能

**路由映射**：
Vue Router 允许我们定义 URL 路径与组件之间的映射关系，当 URL 改变时，自动渲染对应的组件。

**嵌套路由**：
支持多层级的路由嵌套，可以构建复杂的页面结构。

**路由参数**：
支持动态路由参数、查询参数等，实现灵活的路由匹配。

**导航守卫**：
提供路由级别的前置和后置钩子，用于处理权限验证、数据预加载等逻辑。

### 2. Vue Router 的实现原理

**路由模式**：

Vue Router 提供了三种路由模式：

1. **Hash 模式**（默认）：
   - 利用 URL 的 hash 部分（# 后面的内容）来实现路由
   - 监听 `hashchange` 事件来检测路由变化
   - 优点：兼容性好，不需要服务器支持
   - 缺点：URL 中带有 #，不够美观

```javascript
// Hash 模式示例
window.addEventListener('hashchange', () => {
  // 根据 hash 值渲染对应组件
  const route = window.location.hash.slice(1) || '/'
  // 渲染组件...
})
```

2. **History 模式**：
   - 使用 HTML5 History API（pushState、replaceState、popstate）
   - URL 更加美观，但需要服务器配置支持
   - 优点：URL 美观，SEO 友好
   - 缺点：需要服务器配置，防止 404 错误

```javascript
// History 模式示例
window.addEventListener('popstate', () => {
  // 监听浏览器前进后退
  const currentPath = window.location.pathname
  // 渲染组件...
})

// 路由跳转
history.pushState({}, '', '/new-path')
```

3. **Abstract 模式**：
   - 支持所有 JavaScript 环境（如 Node.js）
   - 不依赖浏览器 API，用于测试环境

**代码示例**：

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import User from '../views/User.vue'

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
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    props: true, // 将路由参数作为 props 传递给组件
    beforeEnter: (to, from, next) => {
      // 路由独享守卫
      if (to.params.id) {
        next()
      } else {
        next('/home')
      }
    }
  },
  {
    path: '/profile',
    component: () => import('../views/Profile.vue'), // 懒加载
    meta: { requiresAuth: true } // 路由元信息
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
```

### 3. 导航守卫机制

Vue Router 提供了完整的导航守卫体系：

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 在路由切换前执行
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 路由切换完成后执行
  document.title = to.meta.title || '默认标题'
})

// 组件内守卫
export default {
  name: 'UserComponent',
  beforeRouteEnter(to, from, next) {
    // 在路由进入前调用，不能访问组件实例(this)
    next(vm => {
      // 通过 vm 访问组件实例
    })
  },
  beforeRouteUpdate(to, from, next) {
    // 路由复用时调用，可以访问组件实例
    this.getData(to.params.id)
    next()
  },
  beforeRouteLeave(to, from, next) {
    // 离开路由前调用
    if (this.hasUnsavedData) {
      const answer = window.confirm('确认离开？')
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  }
}
```

### 4. 路由传参方式

**params 参数**：
```javascript
// 路由定义
{ path: '/user/:id', name: 'User', component: User }

// 编程式导航
this.$router.push({ name: 'User', params: { id: 123 }})

// URL: /user/123
```

**query 参数**：
```javascript
// 编程式导航
this.$router.push({ path: '/user', query: { id: 123 }})

// URL: /user?id=123
```

### 5. 路由组件通信

在路由组件中可以通过以下方式获取路由信息：

```vue
<template>
  <div>
    <h2>用户信息</h2>
    <p>用户ID: {{ $route.params.id }}</p>
    <p>查询参数: {{ $route.query.tab }}</p>
  </div>
</template>

<script>
export default {
  name: 'User',
  computed: {
    userId() {
      return this.$route.params.id
    }
  },
  watch: {
    // 监听路由变化
    '$route'(to, from) {
      this.fetchUserData(to.params.id)
    }
  },
  methods: {
    fetchUserData(id) {
      // 根据路由参数获取用户数据
    }
  }
}
</script>
```

### 6. 路由懒加载

```javascript
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue')
  }
]
```

### 7. 路由过渡动画

```vue
<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
```

Vue Router 通过这些机制实现了完整的前端路由功能，使得开发者能够构建复杂的单页面应用，同时保持良好的用户体验和 SEO 友好性。
