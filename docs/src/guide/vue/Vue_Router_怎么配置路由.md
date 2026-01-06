# Vue-Router 怎么配置路由？（必会）

## 标准答案

Vue Router的路由配置主要包括：安装Vue Router、创建路由实例、定义路由规则、配置路由组件。具体步骤为：导入createRouter函数、定义路由数组、创建路由实例、在Vue应用中使用路由。

## 深入理解

Vue Router是Vue.js的官方路由管理器，用于构建单页面应用(SPA)。以下是详细的路由配置方法：

### 1. 安装和引入Vue Router

```javascript
// 安装Vue Router (npm install vue-router)
import { createRouter, createWebHistory } from 'vue-router'
```

### 2. 定义路由组件

```javascript
// 导入组件
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import User from '../views/User.vue'
import NotFound from '../views/NotFound.vue'
```

### 3. 配置路由规则

```javascript
// 定义路由数组
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
    props: true, // 将路由参数作为props传递给组件
    meta: { requiresAuth: true } // 路由元信息
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'), // 懒加载
    beforeEnter: (to, from, next) => {
      // 路由独享的守卫
      if (localStorage.getItem('token')) {
        next()
      } else {
        next('/login')
      }
    }
  },
  {
    path: '/admin',
    component: () => import('../views/Admin.vue'),
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]
```

### 4. 创建路由实例

```javascript
// router/index.js
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // 使用history模式
  routes,
  // 路由滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
```

### 5. 在Vue应用中使用路由

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
```

### 6. 在模板中使用路由

```vue
<template>
  <div id="app">
    <!-- 导航链接 -->
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link :to="{ name: 'User', params: { id: 123 }}">用户</router-link>
    </nav>
    
    <!-- 路由视图 -->
    <router-view></router-view>
  </div>
</template>
```

### 7. 路由配置的高级用法

#### 命名路由
```javascript
// 使用name进行路由跳转
this.$router.push({ name: 'User', params: { id: 123 }})
```

#### 路由参数
```javascript
// 路径参数
path: '/user/:id'

// 查询参数
path: '/search'

// 访问方式
// /user/123 -> $route.params.id
// /search?q=vue -> $route.query.q
```

#### 路由嵌套
```javascript
{
  path: '/user/:id',
  component: User,
  children: [
    {
      path: 'profile',
      component: UserProfile
    },
    {
      path: 'posts',
      component: UserPosts
    }
  ]
}
```

#### 路由别名
```javascript
{
  path: '/user',
  component: User,
  alias: '/my-profile' // 访问/my-profile时渲染User组件
}
```

### 8. 路由守卫

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 不需要调用next()
})
```

通过以上配置，就可以实现完整的Vue Router路由系统，包括页面导航、参数传递、嵌套路由等功能。
