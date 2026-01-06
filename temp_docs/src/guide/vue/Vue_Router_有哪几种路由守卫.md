# Vue-Router 有哪几种路由守卫?（必会）

**题目**: Vue-Router 有哪几种路由守卫?（必会）

## 标准答案

Vue Router 提供了完整的导航守卫来控制路由的跳转过程，主要分为三大类：
1. 全局守卫：全局前置守卫、全局解析守卫、全局后置钩子
2. 路由独享守卫：在路由配置上直接定义
3. 组件内守卫：在组件内部定义的守卫

## 深入理解

Vue Router 的导航守卫是在路由跳转过程中的一些关键时刻执行的函数，可以用来进行权限验证、数据获取、页面加载提示等操作。以下是各类守卫的详细介绍：

### 1. 全局守卫

全局守卫会应用到所有路由上：

#### 全局前置守卫 (beforeEach)
在路由跳转开始时触发，可以用于登录验证、权限检查等：

```javascript
// main.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // to: 即将要进入的目标路由对象
  // from: 当前导航正要离开的路由对象
  // next: 路由控制函数
  
  // 例如：检查用户是否已登录
  if (to.path.startsWith('/admin') && !isUserLoggedIn()) {
    // 重定向到登录页
    next('/login')
  } else {
    // 继续路由
    next()
  }
})
```

#### 全局解析守卫 (beforeResolve)
在导航被确认之前，所有组件内守卫和异步路由组件被解析之后触发：

```javascript
// 全局解析守卫
router.beforeResolve((to, from, next) => {
  // 在所有组件内守卫之后，导航被确认之前执行
  // 适合需要等待所有组件都准备就绪的场景
  next()
})
```

#### 全局后置钩子 (afterEach)
在导航完成后触发，无法改变导航：

```javascript
// 全局后置钩子
router.afterEach((to, from) => {
  // 导航完成后执行
  // 例如：页面访问统计、更新页面标题等
  document.title = to.meta.title || '默认标题'
})
```

### 2. 路由独享守卫

在路由配置中定义，只对当前路由生效：

```javascript
// router/index.js
const routes = [
  {
    path: '/user',
    component: User,
    beforeEnter: (to, from, next) => {
      // 只对 /user 路由生效
      if (to.params.id === 'admin') {
        next('/admin')
      } else {
        next()
      }
    }
  }
]
```

### 3. 组件内守卫

在组件内部定义的守卫：

#### beforeRouteEnter
在进入路由前触发，此时组件实例还未创建，无法访问 this：

```javascript
export default {
  name: 'UserComponent',
  data() {
    return {
      userInfo: null
    }
  },
  beforeRouteEnter(to, from, next) {
    // 无法访问 this，因为组件实例还未创建
    fetchUserInfo(to.params.id).then(user => {
      next(vm => {
        // 通过回调函数访问组件实例 vm
        vm.userInfo = user
      })
    })
  }
}
```

#### beforeRouteUpdate
在当前路由改变，但该组件被复用时触发（如动态路由参数变化）：

```javascript
export default {
  name: 'UserComponent',
  beforeRouteUpdate(to, from, next) {
    // 当路由参数变化时，例如从 /user/1 到 /user/2
    // 可以访问 this
    if (to.params.id !== from.params.id) {
      // 重新获取用户信息
      this.fetchData(to.params.id)
    }
    next()
  },
  methods: {
    fetchData(id) {
      // 获取数据逻辑
    }
  }
}
```

#### beforeRouteLeave
在离开当前路由时触发，常用于确认操作：

```javascript
export default {
  name: 'FormComponent',
  data() {
    return {
      isDirty: false // 表单是否被修改
    }
  },
  beforeRouteLeave(to, from, next) {
    // 离开前确认
    if (this.isDirty) {
      const answer = window.confirm('您有未保存的更改，确定要离开吗？')
      if (answer) {
        next()
      } else {
        next(false) // 取消导航
      }
    } else {
      next()
    }
  }
}
```

### 完整的导航解析流程

1. 触发导航
2. 在失活的组件里调用 beforeRouteLeave
3. 调用全局的 beforeEach
4. 在重用的组件里调用 beforeRouteUpdate
5. 调用路由独享的 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局的 beforeResolve
9. 导航被确认
10. 调用全局的 afterEach
11. 触发 DOM 更新
12. 用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数

这些守卫为开发者提供了在路由跳转过程中的各个关键节点进行干预的能力，使得路由管理更加灵活和强大。
