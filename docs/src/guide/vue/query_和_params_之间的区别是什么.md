# query 和 params 之间的区别是什么？（必会）

**题目**: query 和 params 之间的区别是什么？（必会）

## 标准答案

`params`是路由路径参数，用于动态路由匹配，URL中显示为路径的一部分，如`/user/123`；`query`是查询参数，URL中显示为?后的键值对，如`/user?id=123`。params需要在路由配置中定义，query不需要。

## 深入理解

`params`和`query`是Vue Router中两种不同的参数传递方式，它们在使用场景、URL格式和获取方式上都有显著区别：

### 1. 基本概念对比

| 特性 | params (路径参数) | query (查询参数) |
|------|------------------|-----------------|
| URL格式 | `/user/123` | `/user?id=123` |
| 参数定义 | 需要在路由配置中定义 | 无需在路由配置中定义 |
| 用途 | 用于动态路由匹配 | 用于传递可选参数 |
| 必需性 | 通常为必需参数 | 通常为可选参数 |

### 2. 路由配置差异

```javascript
// router/index.js
const routes = [
  // params - 需要定义动态段
  {
    path: '/user/:id', // 必须在路由配置中定义 :id
    name: 'User',
    component: () => import('../views/User.vue')
  },
  
  // query - 无需在路由配置中定义
  {
    path: '/user', // 不需要在路径中定义参数
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue')
  }
]
```

### 3. 参数传递方式

```vue
<template>
  <div>
    <!-- params 参数传递 -->
    <router-link :to="{ name: 'User', params: { id: 123 }}">用户详情</router-link>
    
    <!-- query 参数传递 -->
    <router-link :to="{ path: '/user', query: { id: 123, tab: 'profile' }}">用户资料</router-link>
    
    <!-- 按钮触发编程式导航 -->
    <button @click="goToUserWithParams">使用params跳转</button>
    <button @click="goToUserWithQuery">使用query跳转</button>
  </div>
</template>

<script>
export default {
  methods: {
    // 使用params跳转
    goToUserWithParams() {
      this.$router.push({
        name: 'User', // 必须使用name，不能使用path
        params: { id: 123 }
      })
      // URL: /user/123
    },
    
    // 使用query跳转
    goToUserWithQuery() {
      this.$router.push({
        path: '/user', // 可以使用path或name
        query: { 
          id: 123, 
          tab: 'profile',
          page: 1 
        }
      })
      // URL: /user?id=123&tab=profile&page=1
    }
  }
}
</script>
```

### 4. 参数获取方式

```vue
<template>
  <div>
    <h2>用户ID: {{ userId }}</h2>
    <h3>标签: {{ tab }}</h3>
    <h4>页码: {{ page }}</h4>
  </div>
</template>

<script>
export default {
  name: 'User',
  data() {
    return {
      userId: null,
      tab: null,
      page: 1
    }
  },
  created() {
    // 获取params参数
    this.userId = this.$route.params.id
    
    // 获取query参数
    this.tab = this.$route.query.tab || 'default'
    this.page = parseInt(this.$route.query.page) || 1
    
    console.log('params:', this.$route.params) // { id: '123' }
    console.log('query:', this.$route.query)   // { tab: 'profile', page: '1' }
  },
  watch: {
    // 监听params变化
    '$route.params.id'(newId) {
      this.userId = newId
      this.fetchUserData(newId)
    },
    
    // 监听query变化
    '$route.query'(newQuery) {
      this.tab = newQuery.tab || 'default'
      this.page = parseInt(newQuery.page) || 1
    }
  }
}
</script>
```

### 5. 使用Composition API获取参数

```vue
<template>
  <div>
    <h2>用户ID: {{ userId }}</h2>
    <h3>标签: {{ tab }}</h3>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    
    const userId = ref('')
    const tab = ref('default')
    
    onMounted(() => {
      userId.value = route.params.id
      tab.value = route.query.tab || 'default'
    })
    
    // 监听路由参数变化
    watch(
      () => route.params.id,
      (newId) => {
        userId.value = newId
        console.log('params.id changed:', newId)
      }
    )
    
    watch(
      () => route.query.tab,
      (newTab) => {
        tab.value = newTab || 'default'
        console.log('query.tab changed:', newTab)
      }
    )
    
    return {
      userId,
      tab
    }
  }
}
</script>
```

### 6. 实际应用场景

#### params适用于：
```javascript
// 用户详情页 - 用户ID是必需的
{
  path: '/user/:id',
  name: 'UserDetail',
  component: UserDetail
}
// URL: /user/123

// 商品详情页
{
  path: '/product/:productId',
  name: 'ProductDetail',
  component: ProductDetail
}
// URL: /product/abc123
```

#### query适用于：
```javascript
// 搜索页面 - 搜索关键词是可选的
{
  path: '/search',
  name: 'Search',
  component: Search
}
// URL: /search?q=vue&category=frontend&page=1

// 列表页面 - 分页和筛选参数
{
  path: '/users',
  name: 'UserList',
  component: UserList
}
// URL: /users?page=2&limit=10&sort=name
```

### 7. 参数组合使用

```javascript
// 同时使用params和query
this.$router.push({
  name: 'User',
  params: { id: 123 },        // 路径参数
  query: { tab: 'profile' }   // 查询参数
})
// URL: /user/123?tab=profile

// 在组件中获取
export default {
  computed: {
    userId() {
      return this.$route.params.id    // '123'
    },
    activeTab() {
      return this.$route.query.tab    // 'profile'
    }
  }
}
```

### 8. 参数类型和数据持久性

```javascript
// params参数特点：
// - 通常用于标识资源的唯一ID
// - 在URL中是必需的路径组成部分
// - 如果params改变，会触发路由重新渲染

// query参数特点：
// - 通常用于传递筛选、排序、分页等参数
// - 在URL中是可选的
// - query参数改变通常不会重新创建组件，只会更新数据
```

### 9. 注意事项

```javascript
// 注意1: 使用params时，不能与path一起使用
// 错误写法
this.$router.push({
  path: '/user',
  params: { id: 123 }  // 这样params不会生效
})

// 正确写法
this.$router.push({
  name: 'User',
  params: { id: 123 }
})

// 注意2: query参数在URL中会显示，不适合传递敏感信息
// 注意3: params参数会被解析为字符串，需要手动转换类型
const userId = parseInt(this.$route.params.id)  // 转换为数字
```

通过理解params和query的区别，可以更好地选择合适的参数传递方式，构建更合理的路由结构。
