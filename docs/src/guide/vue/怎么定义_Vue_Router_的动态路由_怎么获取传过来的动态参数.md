# 怎么定义 Vue-Router 的动态路由?怎么获取传过来的动态参数?（了解）

## 标准答案

定义动态路由：在路由路径中使用冒号`:`加参数名的方式，如`/user/:id`。获取动态参数：在组件中通过`$route.params`获取路径参数，通过`$route.query`获取查询参数。

## 深入理解

Vue Router的动态路由是一种非常灵活的路由匹配方式，允许我们在路由路径中定义可变的部分，这些可变部分被称为动态参数。

### 1. 定义动态路由

在路由配置中，使用冒号`:`加参数名来定义动态路由：

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 基础动态路由
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue')
  },
  
  // 多个动态参数
  {
    path: '/user/:id/post/:postId',
    name: 'UserPost',
    component: () => import('../views/UserPost.vue')
  },
  
  // 可选参数 (使用?表示可选)
  {
    path: '/user/:id?', // id参数可选
    name: 'UserOptional',
    component: () => import('../views/UserOptional.vue')
  },
  
  // 带正则表达式的参数
  {
    path: '/user/:id(\\d+)', // 只匹配数字
    name: 'UserNumeric',
    component: () => import('../views/UserNumeric.vue')
  },
  
  // 通配符路由 (捕获所有未匹配的路径)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 2. 获取动态参数

在组件中，可以通过多种方式获取动态参数：

#### 在模板中直接使用
```vue
<template>
  <div>
    <h2>用户ID: {{ $route.params.id }}</h2>
    <h3>文章ID: {{ $route.params.postId }}</h3>
    <p>查询参数: {{ $route.query }}</p>
  </div>
</template>
```

#### 在组件的script部分获取
```vue
<template>
  <div>
    <h2>用户ID: {{ userId }}</h2>
    <h3>文章ID: {{ postId }}</h3>
  </div>
</template>

<script>
export default {
  name: 'User',
  data() {
    return {
      userId: null,
      postId: null
    }
  },
  created() {
    // 获取路径参数
    this.userId = this.$route.params.id
    this.postId = this.$route.params.postId
    
    // 获取查询参数
    const tab = this.$route.query.tab
    const page = this.$route.query.page
    
    console.log('路径参数:', this.$route.params)
    console.log('查询参数:', this.$route.query)
  },
  watch: {
    // 监听路由变化
    '$route'(to, from) {
      this.userId = to.params.id
      this.postId = to.params.postId
      console.log('路由已变化:', to, from)
    }
  }
}
</script>
```

### 3. 使用Composition API获取参数

```vue
<template>
  <div>
    <h2>用户ID: {{ userId }}</h2>
    <h3>文章ID: {{ postId }}</h3>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const userId = ref(null)
    const postId = ref(null)
    
    onMounted(() => {
      userId.value = route.params.id
      postId.value = route.params.postId
    })
    
    // 监听路由参数变化
    watch(
      () => route.params,
      (newParams) => {
        userId.value = newParams.id
        postId.value = newParams.postId
      }
    )
    
    return {
      userId,
      postId
    }
  }
}
</script>
```

### 4. 通过props传递参数

将路由参数作为props传递给组件，使组件更独立：

```javascript
// 路由配置
{
  path: '/user/:id',
  name: 'User',
  component: () => import('../views/User.vue'),
  props: true // 将路由参数作为props传递
}

// 或者使用函数形式
{
  path: '/user/:id',
  name: 'User',
  component: () => import('../views/User.vue'),
  props: (route) => ({
    id: route.params.id,
    tab: route.query.tab || 'default'
  })
}
```

```vue
<!-- User.vue -->
<template>
  <div>
    <h2>用户ID: {{ id }}</h2>
  </div>
</template>

<script>
export default {
  name: 'User',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  mounted() {
    console.log('用户ID通过props传递:', this.id)
  }
}
</script>
```

### 5. 参数类型和获取方式总结

| 参数类型 | 定义方式 | 获取方式 | 示例 |
|---------|---------|---------|------|
| 路径参数 | `/user/:id` | `$route.params.id` | `/user/123` → `params.id = '123'` |
| 查询参数 | `/search?q=vue` | `$route.query.q` | `/search?q=vue` → `query.q = 'vue'` |
| 哈希参数 | `/page#section` | `$route.hash` | `/page#section` → `hash = '#section'` |

### 6. 实际应用示例

```javascript
// 动态路由跳转
// 编程式导航
this.$router.push(`/user/${userId}`)
// 或使用命名路由
this.$router.push({ name: 'User', params: { id: userId }})
// 带查询参数
this.$router.push({ name: 'User', params: { id: userId }, query: { tab: 'profile' }})

// 在组件中处理参数变化
export default {
  watch: {
    '$route.params.id': function(newId, oldId) {
      // 当id参数变化时重新获取数据
      this.fetchUserData(newId)
    }
  },
  methods: {
    fetchUserData(userId) {
      // 根据用户ID获取用户数据
    }
  }
}
```

通过以上方式，我们可以灵活地定义和获取动态路由参数，实现更加动态和灵活的路由系统。
