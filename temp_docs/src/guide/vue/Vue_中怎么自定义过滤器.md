# Vue 中怎么自定义过滤器？（必会）

**题目**: Vue 中怎么自定义过滤器？（必会）

## 标准答案

Vue 中自定义过滤器的方法包括：
1. 局部过滤器：在组件的 filters 选项中定义
2. 全局过滤器：使用 Vue.filter() 方法定义
3. 过滤器可以接收参数，在模板中通过管道符使用

注意：Vue 3 中已移除过滤器功能，需要使用计算属性或方法替代。

## 深入理解

Vue 过滤器是用于文本格式化的一种功能，可以在模板中使用管道符（|）来应用过滤器。以下是自定义过滤器的详细方法：

### 1. 局部过滤器

在组件内部定义过滤器，只在当前组件中可用：

```vue
<template>
  <div>
    <p>{{ message | capitalize }}</p>
    <p>{{ price | currency('￥', 2) }}</p>
    <p>{{ date | formatDate('YYYY-MM-DD') }}</p>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      message: 'hello world',
      price: 123.456,
      date: new Date()
    }
  },
  filters: {
    // 简单过滤器 - 首字母大写
    capitalize(value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    
    // 带参数的过滤器 - 货币格式化
    currency(value, symbol = '$', decimals = 2) {
      if (isNaN(value)) return ''
      return symbol + Number(value).toFixed(decimals)
    },
    
    // 日期格式化过滤器
    formatDate(date, format = 'YYYY-MM-DD') {
      if (!date) return ''
      
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      
      return format.replace('YYYY', year)
                  .replace('MM', month)
                  .replace('DD', day)
    }
  }
}
</script>
```

### 2. 全局过滤器

在 Vue 实例创建之前定义，所有组件都可以使用：

```javascript
// main.js
import Vue from 'vue'
import App from './App.vue'

// 定义全局过滤器
Vue.filter('uppercase', function(value) {
  return value ? value.toUpperCase() : ''
})

Vue.filter('lowercase', function(value) {
  return value ? value.toLowerCase() : ''
})

Vue.filter('truncate', function(value, length = 20, suffix = '...') {
  if (!value) return ''
  value = value.toString()
  if (value.length <= length) return value
  return value.substring(0, length) + suffix
})

// 或者定义更复杂的过滤器
Vue.filter('pluralize', function(value, single, plural) {
  if (value === 1) {
    return single
  } else {
    return plural || single + 's'
  }
})

new Vue({
  render: h => h(App),
}).$mount('#app')
```

### 3. 过滤器的链式调用

可以在模板中链式使用多个过滤器：

```vue
<template>
  <div>
    <!-- 先截断再大写 -->
    <p>{{ longText | truncate(10) | uppercase }}</p>
    
    <!-- 先大写再首字母大写 -->
    <p>{{ text | uppercase | capitalize }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      longText: 'this is a very long text',
      text: 'hello'
    }
  },
  filters: {
    uppercase(value) {
      return value ? value.toUpperCase() : ''
    },
    capitalize(value) {
      if (!value) return ''
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    },
    truncate(value, length) {
      if (!value || value.length <= length) return value
      return value.slice(0, length) + '...'
    }
  }
}
</script>
```

### 4. 实用的过滤器示例

#### 数字格式化过滤器
```javascript
// 数字千分位格式化
Vue.filter('numberFormat', function(value) {
  if (!value && value !== 0) return ''
  return Number(value).toLocaleString()
})

// 百分比格式化
Vue.filter('percentage', function(value, decimals = 2) {
  if (!value && value !== 0) return ''
  return (value * 100).toFixed(decimals) + '%'
})
```

#### 字符串处理过滤器
```javascript
// 隐藏手机号中间四位
Vue.filter('hidePhone', function(phone) {
  if (!phone) return ''
  phone = phone.toString()
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

// 隐藏邮箱用户名
Vue.filter('hideEmail', function(email) {
  if (!email) return ''
  const [username, domain] = email.split('@')
  if (username.length <= 2) {
    return username[0] + '*' + '@' + domain
  }
  return username.substring(0, 2) + '***' + '@' + domain
})
```

#### 时间处理过滤器
```javascript
// 相对时间显示
Vue.filter('relativeTime', function(date) {
  if (!date) return ''
  
  const now = new Date()
  const time = new Date(date)
  const diff = now - time
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return Math.floor(seconds / 60) + '分钟前'
  if (seconds < 86400) return Math.floor(seconds / 3600) + '小时前'
  if (seconds < 2592000) return Math.floor(seconds / 86400) + '天前'
  
  return Math.floor(seconds / 2592000) + '月前'
})
```

### 5. 在不同模板语法中使用过滤器

#### 在 mustache 插值中使用
```vue
<template>
  <div>
    <p>{{ message | capitalize }}</p>
  </div>
</template>
```

#### 在 v-bind 中使用
```vue
<template>
  <div>
    <!-- 注意：Vue 2.6.0+ 才支持在 v-bind 中使用过滤器 -->
    <div :id="rawId | formatId">{{ content }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rawId: 'my-id',
      content: 'Hello'
    }
  },
  filters: {
    formatId(value) {
      return value.toLowerCase().replace(/\s+/g, '-')
    }
  }
}
</script>
```

### 6. Vue 3 中的过滤器替代方案

Vue 3 已移除过滤器功能，建议使用计算属性或方法：

```vue
<template>
  <div>
    <!-- 使用计算属性 -->
    <p>{{ capitalizedMessage }}</p>
    
    <!-- 使用方法 -->
    <p>{{ formatCurrency(price, '￥', 2) }}</p>
    
    <!-- 使用方法带参数 -->
    <p>{{ formatDate(date, 'YYYY-MM-DD') }}</p>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'MyComponent',
  props: ['message', 'price', 'date'],
  setup(props) {
    // 使用计算属性替代过滤器
    const capitalizedMessage = computed(() => {
      if (!props.message) return ''
      const str = props.message.toString()
      return str.charAt(0).toUpperCase() + str.slice(1)
    })
    
    // 使用方法替代过滤器
    const formatCurrency = (value, symbol = '$', decimals = 2) => {
      if (isNaN(value)) return ''
      return symbol + Number(value).toFixed(decimals)
    }
    
    const formatDate = (date, format = 'YYYY-MM-DD') => {
      if (!date) return ''
      
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      
      return format.replace('YYYY', year)
                  .replace('MM', month)
                  .replace('DD', day)
    }
    
    return {
      capitalizedMessage,
      formatCurrency,
      formatDate
    }
  }
}
</script>
```

### 7. 过滤器的性能考虑

- 过滤器会在每次重新渲染时执行，对于复杂计算可能影响性能
- 建议将复杂计算逻辑移到计算属性中
- 避免在过滤器中进行 DOM 操作或副作用操作

Vue 过滤器提供了一种简洁的方式来格式化显示数据，但在 Vue 3 中已被移除，开发者应使用计算属性或方法作为替代方案。
