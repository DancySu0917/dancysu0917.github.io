# active-class 属于哪个组件中的属性？该如何使用？（了解）

**题目**: active-class 属于哪个组件中的属性？该如何使用？（了解）

## 标准答案

`active-class`是Vue Router中`<router-link>`组件的属性，用于自定义激活状态的CSS类名。当路由链接匹配当前路由时，会自动添加该类名。

## 深入理解

`active-class`是Vue Router的`<router-link>`组件的一个重要属性，用于控制激活状态的样式。

### 1. 基本概念

`active-class`属性用于设置当`<router-link>`指向的路由与当前路由匹配时应用的CSS类名。默认情况下，激活的路由链接会自动添加`router-link-active`类。

### 2. 基本使用方法

```vue
<template>
  <div>
    <!-- 默认激活类名: router-link-active -->
    <router-link to="/">首页</router-link>
    
    <!-- 自定义激活类名 -->
    <router-link to="/about" active-class="my-active">关于</router-link>
    
    <!-- 使用多个类名 -->
    <router-link to="/contact" active-class="active highlight">联系</router-link>
  </div>
</template>

<style>
/* 默认激活样式 */
.router-link-active {
  color: blue;
  font-weight: bold;
}

/* 自定义激活样式 */
.my-active {
  background-color: #007bff;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
}

.active {
  color: red;
}

.highlight {
  text-decoration: underline;
}
</style>
```

### 3. exact-active-class 属性

除了`active-class`，还有一个相关的属性`exact-active-class`：

```vue
<template>
  <div>
    <!-- active-class: 当路由匹配时添加类名（包含子路由） -->
    <router-link 
      to="/user" 
      active-class="nav-active"
      exact-active-class="nav-exact-active">
      用户中心
    </router-link>
    
    <!-- 子路由 -->
    <router-link to="/user/profile" active-class="sub-active">个人资料</router-link>
    <router-link to="/user/settings" active-class="sub-active">设置</router-link>
  </div>
</template>

<style>
.nav-active {
  background-color: #f0f0f0; /* 当访问 /user 或 /user/* 时应用 */
}

.nav-exact-active {
  background-color: #007bff; /* 仅当访问 /user 时应用，不包括子路由 */
}

.sub-active {
  color: blue;
}
</style>
```

### 4. 全局配置

可以在创建路由实例时全局设置默认的激活类名：

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 路由配置
  ],
  // 全局设置默认激活类名
  linkActiveClass: 'global-active',
  linkExactActiveClass: 'global-exact-active'
})

export default router
```

### 5. 实际应用示例

```vue
<template>
  <nav class="navigation">
    <ul>
      <li>
        <!-- 首页激活时应用 home-active 类 -->
        <router-link 
          to="/" 
          active-class="home-active"
          exact-active-class="home-exact-active">
          首页
        </router-link>
      </li>
      <li>
        <!-- 关于页面激活时应用 about-active 类 -->
        <router-link 
          to="/about" 
          active-class="about-active">
          关于我们
        </router-link>
      </li>
      <li>
        <!-- 用户中心激活时应用 user-active 类 -->
        <router-link 
          to="/user" 
          active-class="user-active"
          exact-active-class="user-exact-active">
          用户中心
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<style>
.navigation {
  background-color: #fff;
  padding: 10px;
}

.navigation ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.navigation li {
  margin-right: 20px;
}

.navigation a {
  text-decoration: none;
  padding: 8px 12px;
  color: #333;
  border-radius: 4px;
  transition: all 0.3s;
}

/* 默认样式 */
.navigation a {
  color: #666;
}

/* 激活状态样式 */
.home-active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.about-active {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.user-active {
  background-color: #e8f5e8;
  color: #388e3c;
}

/* 精确匹配样式 */
.home-exact-active,
.user-exact-active {
  background-color: #2196f3;
  color: white;
}
</style>
```

### 6. 与编程式导航的配合使用

```vue
<template>
  <div>
    <!-- 使用router-link -->
    <router-link 
      :to="{ name: 'User', params: { id: userId }}" 
      active-class="current-nav">
      用户 {{ userId }}
    </router-link>
    
    <!-- 手动控制激活状态 -->
    <a 
      href="#" 
      @click.prevent="goToUser(userId)"
      :class="{ 'current-nav': isActiveRoute('User', { id: userId }) }">
      用户 {{ userId }}
    </a>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: 123
    }
  },
  methods: {
    goToUser(id) {
      this.$router.push({ name: 'User', params: { id }})
    },
    isActiveRoute(routeName, params) {
      return this.$route.name === routeName && 
             this.$route.params.id == params.id
    }
  }
}
</script>

<style>
.current-nav {
  background-color: #007bff;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
}
</style>
```

### 7. 高级用法和注意事项

```vue
<template>
  <div>
    <!-- 动态设置激活类名 -->
    <router-link 
      :to="link.to"
      :active-class="link.activeClass"
      :exact-active-class="link.exactActiveClass"
      v-for="link in navLinks" 
      :key="link.name">
      {{ link.name }}
    </router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      navLinks: [
        {
          name: '首页',
          to: '/',
          activeClass: 'home-active',
          exactActiveClass: 'home-exact'
        },
        {
          name: '产品',
          to: '/products',
          activeClass: 'product-active',
          exactActiveClass: 'product-exact'
        },
        {
          name: '服务',
          to: '/services',
          activeClass: 'service-active',
          exactActiveClass: 'service-exact'
        }
      ]
    }
  }
}
</script>
```

### 8. 激活类名的工作原理

- `active-class`：当路由路径匹配（包含子路由）时应用
- `exact-active-class`：仅当路由路径完全精确匹配时应用
- 默认类名：`router-link-active` 和 `router-link-exact-active`
- 这些类名会自动添加到`<router-link>`渲染出的HTML元素上

通过使用`active-class`属性，我们可以轻松地为当前激活的导航链接添加特定的样式，从而改善用户体验。
