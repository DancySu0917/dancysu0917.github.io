# Vuex 的 Mutation 和 Action 之间的区别是什么？（必会）

## 标准答案

Mutation 和 Action 都是 Vuex 中用于处理状态变化的方法，但它们有以下核心区别：

1. **同步 vs 异步**：
   - Mutation：只能包含同步操作，直接修改 state
   - Action：可以包含异步操作，通过提交 mutation 来间接修改 state

2. **状态修改方式**：
   - Mutation：直接修改 state
   - Action：不能直接修改 state，必须通过 commit 提交 mutation

3. **触发方式**：
   - Mutation：使用 `store.commit('mutationName')` 触发
   - Action：使用 `store.dispatch('actionName')` 触发

4. **使用场景**：
   - Mutation：适用于简单的状态更新
   - Action：适用于复杂的业务逻辑、异步操作（如 API 调用）

## 深入理解

Mutation 和 Action 是 Vuex 中处理状态变化的两个核心概念，它们的设计遵循了 Redux 的理念，即状态的改变应该是可预测和可追踪的。

### 1. 核心区别详解

**同步与异步处理**：
Mutation 被设计为同步事务，这样 Vuex DevTools 可以准确地追踪状态变化。如果在 Mutation 中执行异步操作，会导致状态变化不可预测，DevTools 无法正确记录状态快照。

Action 则专门处理异步操作，它不会直接修改状态，而是通过提交 Mutation 来完成状态变更。

**代码示例**：

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state: {
    count: 0,
    user: null,
    loading: false
  },
  
  mutations: {
    // Mutation - 同步操作
    INCREMENT(state) {
      state.count++
    },
    
    SET_USER(state, user) {
      state.user = user
    },
    
    SET_LOADING(state, status) {
      state.loading = status
    }
  },
  
  actions: {
    // Action - 异步操作
    async fetchUser({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const response = await fetch(`/api/users/${userId}`)
        const user = await response.json()
        commit('SET_USER', user)
      } catch (error) {
        console.error('获取用户失败:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Action - 复杂业务逻辑
    async incrementAsync({ commit, state }, delay = 1000) {
      if (state.count < 10) { // 业务逻辑判断
        commit('SET_LOADING', true)
        await new Promise(resolve => setTimeout(resolve, delay))
        commit('INCREMENT')
        commit('SET_LOADING', false)
      }
    }
  }
})
```

### 2. 触发方式对比

在组件中触发 Mutation 和 Action 的方式不同：

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>加载状态: {{ loading ? '加载中...' : '就绪' }}</p>
    <button @click="handleIncrement">同步增加</button>
    <button @click="handleAsyncIncrement">异步增加</button>
    <button @click="fetchUserData">获取用户数据</button>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'CounterComponent',
  computed: {
    ...mapState(['count', 'loading', 'user'])
  },
  methods: {
    // 直接映射 Mutation
    ...mapMutations(['INCREMENT']),
    
    // 直接映射 Action
    ...mapActions(['fetchUser', 'incrementAsync']),
    
    // 手动触发 Mutation
    handleIncrement() {
      this.$store.commit('INCREMENT')
    },
    
    // 手动触发 Action
    async handleAsyncIncrement() {
      await this.$store.dispatch('incrementAsync', 2000)
    },
    
    async fetchUserData() {
      await this.fetchUser(1) // 使用映射的 Action
    }
  }
}
</script>
```

### 3. 错误使用示例

了解正确的使用方式，也要避免错误的实践：

**错误示例 - 在 Mutation 中使用异步操作**：

```javascript
// ❌ 错误：在 Mutation 中使用异步操作
mutations: {
  INCREMENT_ASYNC(state) {
    setTimeout(() => {
      state.count++ // 这样做会导致状态变化不可追踪
    }, 1000)
  }
}
```

**正确示例 - 通过 Action 处理异步**：

```javascript
// ✅ 正确：在 Action 中处理异步，在 Mutation 中修改状态
actions: {
  incrementAsync({ commit }) {
    setTimeout(() => {
      commit('INCREMENT') // 异步操作完成后提交 Mutation
    }, 1000)
  }
}
```

### 4. 实际应用场景

**Mutation 适用于**：
- 简单的状态更新
- 用户交互的直接响应
- 不涉及异步操作的状态变化

**Action 适用于**：
- API 调用
- 复杂的业务逻辑处理
- 多个 Mutation 的组合操作
- 异步数据获取和处理
- 状态变化前后的副作用处理

### 5. 最佳实践

1. **单一职责**：每个 Mutation 只负责一种状态变化
2. **命名规范**：Mutation 使用大写命名，Action 使用驼峰命名
3. **错误处理**：在 Action 中妥善处理异步操作的错误
4. **状态验证**：在 Mutation 中验证状态变化的合理性

通过合理使用 Mutation 和 Action，可以确保 Vuex 状态管理的清晰性、可预测性和可维护性。
