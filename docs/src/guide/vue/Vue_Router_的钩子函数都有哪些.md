# Vue-Router 的钩子函数都有哪些?（必会）

**题目**: Vue-Router 的钩子函数都有哪些?（必会）

## 标准答案

Vue Router 的钩子函数（也称为导航守卫）主要有以下几类：
1. 全局前置守卫（beforeEach）
2. 全局解析守卫（beforeResolve）
3. 全局后置钩子（afterEach）
4. 路由独享守卫（beforeEnter）
5. 组件内守卫（beforeRouteEnter、beforeRouteUpdate、beforeRouteLeave）

## 深入理解

Vue Router 提供了完整的导航守卫系统，允许我们在路由跳转的不同阶段执行特定的逻辑。这些钩子函数也被称为导航守卫，它们提供了在路由跳转过程中进行干预的能力：

### 1. 全局前置守卫（beforeEach）

在每次路由跳转前触发，是最常用的全局守卫：

```javascript
// main.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})

router.beforeEach((to, from, next) => {
  // to: 目标路由
  // from: 当前路由
  // next: 控制函数
  console.log('即将跳转到：', to.path)
  
  // 权限验证示例
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login') // 重定向到登录页
  } else {
    next() // 继续导航
  }
})
```

### 2. 全局解析守卫（beforeResolve）

在导航被确认之前，所有组件内守卫和异步路由组件被解析之后触发：

```javascript
router.beforeResolve(async (to, from, next) => {
  // 确保所有异步组件和组件守卫都已解析
  if (to.meta.requiresUserData) {
    try {
      await store.dispatch('fetchUserData')
      next()
    } catch (error) {
      next('/error')
    }
  } else {
    next()
  }
})
```

### 3. 全局后置钩子（afterEach）

在导航完成后触发，无法改变导航：

```javascript
router.afterEach((to, from) => {
  // 导航完成后执行，例如：
  // 1. 页面访问统计
  analytics.track('page_view', {
    to: to.fullPath,
    from: from.fullPath
  })
  
  // 2. 更新页面标题
  document.title = to.meta.title || '默认标题'
  
  // 3. 滚动到顶部
  window.scrollTo(0, 0)
})
```

### 4. 路由独享守卫（beforeEnter）

在路由配置中定义，只对特定路由生效：

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 只对 /admin 路由生效
      if (hasAdminPermission()) {
        next()
      } else {
        next('/unauthorized')
      }
    }
  }
]
```

### 5. 组件内守卫

定义在组件内部的守卫：

#### beforeRouteEnter
在进入路由前触发，组件实例还未创建：

```javascript
export default {
  name: 'UserProfile',
  data() {
    return {
      user: null
    }
  },
  async beforeRouteEnter(to, from, next) {
    // 此时组件实例还未创建，无法访问 this
    const user = await fetchUser(to.params.id)
    next(vm => {
      // 通过回调函数访问组件实例
      vm.user = user
    })
  }
}
```

#### beforeRouteUpdate
在当前路由改变但组件被复用时触发：

```javascript
export default {
  name: 'UserProfile',
  props: ['id'],
  data() {
    return {
      user: null
    }
  },
  async beforeRouteUpdate(to, from, next) {
    // 当路由参数变化时触发，如从 /user/1 到 /user/2
    if (to.params.id !== from.params.id) {
      this.user = await fetchUser(to.params.id)
    }
    next()
  }
}
```

#### beforeRouteLeave
在离开当前路由时触发：

```javascript
export default {
  name: 'FormComponent',
  data() {
    return {
      hasUnsavedChanges: false
    }
  },
  beforeRouteLeave(to, from, next) {
    // 离开前确认
    if (this.hasUnsavedChanges) {
      const confirmLeave = confirm('您有未保存的更改，确定要离开吗？')
      confirmLeave ? next() : next(false)
    } else {
      next()
    }
  }
}
```

### 导航守卫的执行顺序

1. 导航触发
2. 失活组件的 beforeRouteLeave
3. 全局 beforeEach
4. 重用组件的 beforeRouteUpdate
5. 路由独享 beforeEnter
6. 组件内 beforeRouteEnter
7. 全局 beforeResolve
8. 导航确认
9. 全局 afterEach

这些钩子函数为开发者提供了在路由跳转过程中各个关键节点进行干预的能力，使得路由管理更加灵活和强大。
