# $route 和$router 的区别是什么？（必会）

## 标准答案

`$route` 和 `$router` 是 Vue Router 中的两个核心对象，它们有以下主要区别：

1. **功能定位**：
   - `$route`：表示当前路由信息，是路由状态的快照，包含当前 URL 解析得到的信息
   - `$router`：表示路由实例，是路由器本身，用于执行路由跳转等操作

2. **属性 vs 方法**：
   - `$route`：主要包含路由参数、路径、查询参数等信息属性
   - `$router`：主要包含编程式导航方法（如 push、replace、go 等）

3. **使用场景**：
   - `$route`：用于获取当前路由信息（如参数、路径等）
   - `$router`：用于执行路由跳转、导航等操作

## 深入理解

`$route` 和 `$router` 是 Vue Router 提供的两个不同的对象，理解它们的区别对于正确使用 Vue Router 至关重要。

### 1. $route 对象详解

`$route` 对象包含了当前路由的信息，它是响应式的，当路由变化时会自动更新。

**主要属性**：

```javascript
// 假设当前 URL 是 /user/123?tab=profile#section
{
  path: '/user/123',          // 路径
  name: 'User',               // 路由名称
  params: { id: '123' },      // 路由参数
  query: { tab: 'profile' },  // 查询参数
  hash: '#section',           // 哈希值
  fullPath: '/user/123?tab=profile#section', // 完整路径
  matched: [...]              // 匹配的路由记录数组
}
```

**在组件中使用**：

```vue
<template>
  <div>
    <h2>用户信息</h2>
    <p>用户ID: {{ $route.params.id }}</p>
    <p>标签页: {{ $route.query.tab }}</p>
    <p>当前路径: {{ $route.path }}</p>
    <p>完整路径: {{ $route.fullPath }}</p>
  </div>
</template>

<script>
export default {
  name: 'UserComponent',
  created() {
    // 监听路由变化
    console.log('当前路由信息:', this.$route)
  },
  watch: {
    // 监听路由参数变化
    '$route'(to, from) {
      console.log('路由从', from.path, '变化到', to.path)
      this.fetchUserData(to.params.id)
    }
  },
  methods: {
    fetchUserData(userId) {
      // 根据路由参数获取用户数据
    }
  }
}
</script>
```

### 2. $router 对象详解

`$router` 对象是 Vue Router 的实例，提供了路由导航和操作的方法。

**主要方法**：

```javascript
export default {
  name: 'NavigationComponent',
  methods: {
    // 编程式导航方法
    navigateToHome() {
      // 字符串路径
      this.$router.push('/home')
    },
    
    // 对象形式
    navigateToUser() {
      this.$router.push({ path: '/user/123' })
    },
    
    // 命名路由
    navigateToUserProfile() {
      this.$router.push({ name: 'UserProfile', params: { id: 123 }})
    },
    
    // 带查询参数
    navigateWithQuery() {
      this.$router.push({ path: '/search', query: { keyword: 'vue' }})
    },
    
    // 替换当前路由（不留下历史记录）
    replaceRoute() {
      this.$router.replace('/login')
    },
    
    // 后退
    goBack() {
      this.$router.go(-1)
      // 或者
      this.$router.back()
    },
    
    // 前进
    goForward() {
      this.$router.go(1)
      // 或者
      this.$router.forward()
    },
    
    // 动态添加路由
    addRoute() {
      this.$router.addRoute({
        path: '/dynamic',
        name: 'Dynamic',
        component: () => import('@/views/Dynamic.vue')
      })
    },
    
    // 移除路由
    removeRoute() {
      this.$router.removeRoute('Dynamic')
    }
  }
}
```

### 3. 实际应用场景对比

**使用 $route 的场景**：

```vue
<template>
  <div>
    <h1>{{ pageTitle }}</h1>
    <UserProfile :user-id="$route.params.id" />
  </div>
</template>

<script>
export default {
  name: 'UserPage',
  computed: {
    // 根据路由参数计算页面标题
    pageTitle() {
      const id = this.$route.params.id
      return `用户 ${id} 的资料`
    }
  },
  created() {
    // 根据路由参数初始化数据
    this.initUserData(this.$route.params.id)
  },
  methods: {
    initUserData(userId) {
      // 使用路由参数初始化用户数据
    }
  }
}
</script>
```

**使用 $router 的场景**：

```vue
<template>
  <div>
    <button @click="goToProfile">个人资料</button>
    <button @click="goToSettings">设置</button>
    <button @click="goBack">返回</button>
  </div>
</template>

<script>
export default {
  name: 'NavigationButtons',
  methods: {
    goToProfile() {
      // 使用 $router 进行路由跳转
      this.$router.push(`/user/${this.$route.params.id}/profile`)
    },
    
    goToSettings() {
      this.$router.push('/settings')
    },
    
    goBack() {
      // 返回上一页
      this.$router.back()
    }
  }
}
</script>
```

### 4. 路由守卫中的使用

在路由守卫中，通常使用 `to`、`from` 参数而不是 `$route` 和 `$router`：

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // to 和 from 是路由对象，类似 $route
  if (to.meta.requiresAuth && !isAuthenticated()) {
    // 使用 next 进行路由跳转，而不是 $router
    next('/login')
  } else {
    next()
  }
})

// 组件内守卫
export default {
  name: 'ProtectedComponent',
  beforeRouteEnter(to, from, next) {
    // to 和 from 参数类似于 $route
    if (to.params.id) {
      next()
    } else {
      // 不能使用 this.$router，因为组件实例还未创建
      next('/home')
    }
  },
  
  beforeRouteUpdate(to, from, next) {
    // 可以访问组件实例
    this.fetchData(to.params.id)
    next()
  }
}
```

### 5. 类比理解

可以把 `$route` 和 `$router` 比作：

- `$route`：当前的位置信息（你在哪）
- `$router`：导航设备（怎么去别的地方）

就像在地图应用中：
- `$route` 相当于 GPS 显示的当前位置
- `$router` 相当于导航应用的导航功能

理解这两个对象的区别，有助于正确地在 Vue 应用中处理路由相关的逻辑。
