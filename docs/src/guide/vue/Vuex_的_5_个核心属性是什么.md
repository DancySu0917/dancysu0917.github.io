# Vuex 的 5 个核心属性是什么?（必会）

## 标准答案

Vuex的5个核心属性是：State、Getters、Mutations、Actions、Modules。State用于存储应用状态，Getters用于计算派生状态，Mutations用于同步修改状态，Actions用于处理异步操作，Modules用于模块化管理复杂应用的状态。

## 深入理解

### 1. State - 状态管理

State是Vuex存储应用状态的地方，所有组件共享的状态都存储在state中。它是响应式的，当state中的数据发生变化时，依赖该数据的Vue组件会自动更新。

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state: {
    count: 0,
    user: {
      name: 'John',
      age: 25,
      isLoggedIn: false
    },
    todos: []
  }
})

// 在组件中访问state
export default {
  computed: {
    count() {
      return this.$store.state.count
    },
    user() {
      return this.$store.state.user
    }
  }
}

// 使用mapState辅助函数
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['count', 'user']),
    // 或者使用函数形式访问嵌套属性
    ...mapState({
      userName: state => state.user.name,
      userAge: state => state.user.age
    })
  }
}
```

### 2. Getters - 派生状态计算

Getters用于计算派生状态，类似于Vue组件中的computed属性。当依赖的state发生变化时，getters会自动重新计算。

```javascript
const store = createStore({
  state: {
    todos: [
      { id: 1, text: '学习Vuex', done: true },
      { id: 2, text: '完成项目', done: false }
    ]
  },
  getters: {
    // 基本getter
    doneTodos: state => {
      return state.todos.filter(todo => todo.done)
    },
    
    // getter接收其他getter作为第二个参数
    doneTodosCount: (state, getters) => {
      return getters.doneTodos.length
    },
    
    // 返回函数的getter，用于处理参数
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    },
    
    // 组合多个计算
    activeTodos: (state, getters) => {
      return state.todos.filter(todo => !todo.done)
    }
  }
})

// 在组件中使用getters
export default {
  computed: {
    doneTodos() {
      return this.$store.getters.doneTodos
    },
    doneTodosCount() {
      return this.$store.getters.doneTodosCount
    },
    getTodoById() {
      return this.$store.getters.getTodoById
    }
  }
}

// 使用mapGetters辅助函数
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['doneTodos', 'doneTodosCount']),
    ...mapGetters({
      todoCount: 'doneTodosCount'
    })
  }
}
```

### 3. Mutations - 同步状态变更

Mutations是唯一可以修改state的方法，必须是同步函数。每个mutation都有一个字符串类型的事件类型和一个回调函数。

```javascript
const store = createStore({
  state: {
    count: 0,
    user: { name: '', age: 0 }
  },
  mutations: {
    // 基本mutation
    INCREMENT(state) {
      state.count++
    },
    
    // 带载荷的mutation
    INCREMENT_BY(state, payload) {
      state.count += payload.amount
    },
    
    // 对象风格的载荷
    SET_USER_INFO(state, payload) {
      state.user.name = payload.name
      state.user.age = payload.age
    },
    
    // 使用解构赋值
    UPDATE_USER(state, { key, value }) {
      state.user[key] = value
    },
    
    // 处理数组
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    },
    
    // 处理复杂对象更新
    UPDATE_TODO(state, { id, updates }) {
      const todo = state.todos.find(t => t.id === id)
      if (todo) {
        Object.assign(todo, updates)
      }
    }
  }
})

// 在组件中提交mutation
export default {
  methods: {
    increment() {
      this.$store.commit('INCREMENT')
    },
    incrementBy(amount) {
      this.$store.commit('INCREMENT_BY', { amount })
    },
    setUserInfo(userInfo) {
      this.$store.commit('SET_USER_INFO', userInfo)
    }
  }
}

// 使用mapMutations辅助函数
import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations(['INCREMENT', 'SET_USER_INFO']),
    ...mapMutations({
      incrementBy: 'INCREMENT_BY'
    })
  }
}
```

### 4. Actions - 异步操作处理

Actions用于处理异步操作，通过提交mutations来修改state。Actions可以包含任意异步操作。

```javascript
const store = createStore({
  state: {
    user: {},
    loading: false
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    // 基本action
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('INCREMENT')
      }, 1000)
    },
    
    // 异步action，返回Promise
    async fetchUser({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const response = await api.fetchUser(userId)
        commit('SET_USER', response.data)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        console.error('获取用户信息失败:', error)
        throw error
      }
    },
    
    // 组合多个action
    async registerUser({ dispatch }, userInfo) {
      try {
        await dispatch('validateUserInfo', userInfo)
        const result = await dispatch('createUser', userInfo)
        await dispatch('sendWelcomeEmail', userInfo)
        return result
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      }
    },
    
    // 批量提交mutations
    async batchUpdate({ commit }, updates) {
      commit('SET_LOADING', true)
      try {
        for (const update of updates) {
          commit('UPDATE_ITEM', update)
        }
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        throw error
      }
    }
  }
})

// 在组件中调用action
export default {
  methods: {
    async loadUser() {
      try {
        await this.$store.dispatch('fetchUser', this.userId)
      } catch (error) {
        console.error('加载用户失败:', error)
      }
    }
  }
}

// 使用mapActions辅助函数
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['fetchUser', 'registerUser']),
    ...mapActions({
      loadUser: 'fetchUser'
    })
  }
}
```

### 5. Modules - 模块化管理

当应用变得复杂时，可以将store分割成模块，每个模块拥有自己的state、mutation、action、getter。

```javascript
// modules/user.js
const userModule = {
  namespaced: true, // 启用命名空间，避免命名冲突
  
  state: {
    profile: null,
    permissions: [],
    loading: false
  },
  
  getters: {
    hasPermission: state => permission => {
      return state.permissions.includes(permission)
    },
    isAdmin: state => {
      return state.permissions.includes('admin')
    }
  },
  
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    ADD_PERMISSION(state, permission) {
      state.permissions.push(permission)
    }
  },
  
  actions: {
    async loadProfile({ commit }) {
      commit('SET_LOADING', true)
      try {
        const profile = await api.fetchUserProfile()
        commit('SET_PROFILE', profile)
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        console.error('加载用户信息失败:', error)
      }
    },
    
    async addPermission({ commit }, permission) {
      commit('ADD_PERMISSION', permission)
      // 也可以调用其他模块的action
      await this.dispatch('notifications/add', {
        type: 'success',
        message: `权限${permission}已添加`
      }, { root: true })
    }
  }
}

// modules/products.js
const productsModule = {
  namespaced: true,
  
  state: {
    list: [],
    currentProduct: null,
    loading: false
  },
  
  getters: {
    publishedProducts: state => {
      return state.list.filter(product => product.status === 'published')
    },
    getProductById: state => id => {
      return state.list.find(product => product.id === id)
    }
  },
  
  mutations: {
    SET_PRODUCTS(state, products) {
      state.list = products
    },
    SET_CURRENT_PRODUCT(state, product) {
      state.currentProduct = product
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  
  actions: {
    async fetchProducts({ commit }) {
      commit('SET_LOADING', true)
      try {
        const products = await api.fetchProducts()
        commit('SET_PRODUCTS', products)
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_LOADING', false)
        console.error('获取产品列表失败:', error)
      }
    }
  }
}

// 主store
const store = createStore({
  modules: {
    user: userModule,
    products: productsModule
  }
})

// 在组件中使用命名空间模块
export default {
  computed: {
    // 直接访问命名空间模块
    userProfile() {
      return this.$store.state.user.profile
    },
    
    // 使用辅助函数访问命名空间模块
    ...mapState('user', ['profile', 'loading']),
    ...mapGetters('user', ['hasPermission', 'isAdmin']),
    ...mapState('products', ['list', 'loading']),
    ...mapGetters('products', ['publishedProducts'])
  },
  
  methods: {
    ...mapActions('user', ['loadProfile']),
    ...mapActions('products', ['fetchProducts'])
  }
}
```

### 6. 五个核心属性的关系和使用场景

```javascript
// 完整示例：购物车模块
const cartModule = {
  namespaced: true,
  
  state: {
    items: [],
    checkoutStatus: null
  },
  
  getters: {
    // 计算购物车总价
    cartTotalPrice: (state) => {
      return state.items.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)
    },
    
    // 计算购物车商品总数
    cartTotalQuantity: (state) => {
      return state.items.reduce((total, item) => {
        return total + item.quantity
      }, 0)
    },
    
    // 检查商品是否在购物车中
    isInCart: (state) => (productId) => {
      return state.items.some(item => item.productId === productId)
    }
  },
  
  mutations: {
    ADD_TO_CART(state, product) {
      const existingItem = state.items.find(item => item.productId === product.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        state.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        })
      }
    },
    
    REMOVE_FROM_CART(state, productId) {
      const index = state.items.findIndex(item => item.productId === productId)
      if (index > -1) {
        state.items.splice(index, 1)
      }
    },
    
    UPDATE_QUANTITY(state, { productId, quantity }) {
      const item = state.items.find(item => item.productId === productId)
      if (item) {
        item.quantity = quantity
      }
    },
    
    SET_CHECKOUT_STATUS(state, status) {
      state.checkoutStatus = status
    }
  },
  
  actions: {
    async checkout({ commit, state }) {
      commit('SET_CHECKOUT_STATUS', 'loading')
      try {
        const order = await api.createOrder(state.items)
        commit('SET_CHECKOUT_STATUS', 'success')
        commit('CLEAR_CART')
        return order
      } catch (error) {
        commit('SET_CHECKOUT_STATUS', 'error')
        throw error
      }
    },
    
    async loadCartFromStorage({ commit }) {
      try {
        const savedCart = await storage.get('cart')
        if (savedCart) {
          commit('SET_CART_ITEMS', savedCart)
        }
      } catch (error) {
        console.error('加载购物车失败:', error)
      }
    }
  }
}

// 在组件中的完整使用
export default {
  name: 'CartComponent',
  computed: {
    ...mapState('cart', ['items', 'checkoutStatus']),
    ...mapGetters('cart', ['cartTotalPrice', 'cartTotalQuantity'])
  },
  
  methods: {
    ...mapMutations('cart', ['ADD_TO_CART', 'REMOVE_FROM_CART']),
    ...mapActions('cart', ['checkout', 'loadCartFromStorage']),
    
    async handleCheckout() {
      try {
        await this.checkout()
        this.$message.success('结算成功')
      } catch (error) {
        this.$message.error('结算失败')
      }
    }
  },
  
  created() {
    this.loadCartFromStorage()
  }
}
```

### 总结

Vuex的5个核心属性构成了一个完整状态管理的生态系统：

1. **State** - 提供唯一数据源，确保状态的单一可信来源
2. **Getters** - 提供计算属性功能，避免重复计算和逻辑冗余
3. **Mutations** - 确保状态变更的可预测性，所有状态修改都通过mutations进行
4. **Actions** - 处理异步操作，将业务逻辑与状态变更分离
5. **Modules** - 支持模块化开发，便于管理复杂应用的状态

这5个属性相互配合，形成了一个完整的状态管理流程，使得复杂应用的状态管理变得可预测、可维护和可调试。
