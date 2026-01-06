# 怎么在 watch 监听开始之后立即被调用？（必会）

**题目**: 怎么在 watch 监听开始之后立即被调用？（必会）

## 标准答案

在 Vue 的 watch 中，可以通过设置 `immediate: true` 选项来让监听器在创建时立即执行一次。这样可以在监听器创建时就触发回调函数，而不是等到被监听的数据发生变化时才执行。

## 深入理解

### 1. immediate 选项的作用

`immediate: true` 选项让 watch 在初始化时立即执行一次回调函数，使用当前值作为参数调用。这在很多场景下非常有用，比如：

```javascript
export default {
  data() {
    return {
      searchQuery: 'vue'
    }
  },
  watch: {
    searchQuery: {
      handler(newVal, oldVal) {
        console.log('搜索查询变化:', newVal, oldVal);
        this.performSearch(newVal);
      },
      immediate: true // 立即执行，即使初始值没有变化
    }
  },
  methods: {
    performSearch(query) {
      // 执行搜索逻辑
      console.log('执行搜索:', query);
    }
  }
}
```

### 2. 不使用 immediate 与使用 immediate 的对比

```vue
<template>
  <div>
    <input v-model="username" placeholder="输入用户名">
    <p>当前用户名: {{ username }}</p>
    <p>处理状态: {{ status }}</p>
  </div>
</template>

<script>
export default {
  name: 'WatchImmediateDemo',
  data() {
    return {
      username: 'john',
      status: '未处理'
    }
  },
  watch: {
    // 不使用 immediate - 只有当 username 改变时才执行
    username: {
      handler(newVal) {
        this.status = `处理中... (旧值: ${newVal})`;
        setTimeout(() => {
          this.status = `已处理: ${newVal}`;
        }, 1000);
      }
      // 没有 immediate: true
    },
    
    // 使用 immediate - 创建时立即执行，之后每次变化都执行
    status: {
      handler(newVal, oldVal) {
        console.log(`状态变化: ${oldVal} -> ${newVal}`);
      },
      immediate: true // 立即执行
    }
  },
  mounted() {
    console.log('组件已挂载');
  }
}
</script>
```

### 3. immediate 与 created/mounted 生命周期的比较

```javascript
export default {
  data() {
    return {
      apiUrl: 'https://api.example.com',
      data: null
    }
  },
  watch: {
    apiUrl: {
      handler(newUrl) {
        this.fetchData(newUrl);
      },
      immediate: true // 组件创建时立即获取数据
    }
  },
  methods: {
    async fetchData(url) {
      try {
        const response = await fetch(url);
        this.data = await response.json();
      } catch (error) {
        console.error('数据获取失败:', error);
      }
    }
  }
  // 相当于在 created 或 mounted 中手动调用一次 fetchData(this.apiUrl)
}
```

### 4. 高级用法示例

```javascript
export default {
  data() {
    return {
      userId: 1,
      userInfo: null,
      loading: false
    }
  },
  watch: {
    // 监听多个属性
    userId: {
      handler() {
        this.loadUserInfo();
      },
      immediate: true
    },
    
    // 深度监听对象属性
    'userProfile.settings': {
      handler(newSettings) {
        this.applySettings(newSettings);
      },
      deep: true,
      immediate: true // 立即应用初始设置
    }
  },
  methods: {
    async loadUserInfo() {
      this.loading = true;
      try {
        const response = await fetch(`/api/users/${this.userId}`);
        this.userInfo = await response.json();
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        this.loading = false;
      }
    },
    applySettings(settings) {
      // 应用设置
      console.log('应用新设置:', settings);
    }
  }
}
```

### 5. 注意事项

1. **初始值处理**：使用 `immediate: true` 时，oldVal 参数在第一次执行时会是 undefined
2. **性能考虑**：如果监听的计算开销很大，要考虑是否真的需要立即执行
3. **依赖关系**：确保在 immediate 执行时，所需的依赖项已经初始化

```javascript
// 注意 oldVal 为 undefined 的情况
watch: {
  searchQuery: {
    handler(newVal, oldVal) {
      // 第一次执行时 oldVal 是 undefined
      if (oldVal !== undefined) {
        console.log(`从 ${oldVal} 变化到 ${newVal}`);
      } else {
        console.log(`初始值为 ${newVal}`);
      }
      this.performSearch(newVal);
    },
    immediate: true
  }
}
```

使用 `immediate: true` 可以让 watch 监听器在组件初始化时就执行，这对于需要在组件创建时就进行某些操作的场景非常有用。
