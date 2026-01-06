# Vue 组件如何进行传值的? （必会）

**题目**: Vue 组件如何进行传值的? （必会）

## 标准答案

Vue 组件传值有多种方式，主要包括：1) 父子组件传值（props 和 $emit）；2) 子父组件传值（$emit 和事件总线）；3) 非父子组件传值（事件总线、Vuex、provide/inject）；4) 兄弟组件传值（通过共同父组件中转）。Vue 还提供了 $refs、$parent、$children 等方式实现组件间的直接访问。在 Vue 3 中，还引入了 Teleport、Suspense 等新特性。

## 深入理解

### 1. 父传子 - Props

Props 是最常用的数据传递方式，用于父组件向子组件传递数据：

```vue
<!-- 父组件 -->
<template>
  <div>
    <h2>父组件</h2>
    <!-- 通过 props 向子组件传递数据 -->
    <child-component 
      :user-name="parentUserName" 
      :user-age="parentAge"
      :is-active="isActive"
    />
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  name: 'ParentComponent',
  components: {
    ChildComponent
  },
  data() {
    return {
      parentUserName: 'John Doe',
      parentAge: 25,
      isActive: true
    }
  }
}
</script>
```

```vue
<!-- 子组件 -->
<template>
  <div>
    <h3>子组件</h3>
    <p>用户名: {{ userName }}</p>
    <p>年龄: {{ userAge }}</p>
    <p>状态: {{ isActive ? '活跃' : '非活跃' }}</p>
  </div>
</template>

<script>
export default {
  name: 'ChildComponent',
  // 定义接收的 props
  props: {
    userName: {
      type: String,
      required: true,
      default: 'Anonymous'
    },
    userAge: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }
}
</script>
```

### 2. 子传父 - $emit

子组件通过 $emit 触发事件，父组件监听事件来接收数据：

```vue
<!-- 子组件 -->
<template>
  <div>
    <h3>子组件</h3>
    <input v-model="childMessage" placeholder="输入消息">
    <button @click="sendMessageToParent">发送给父组件</button>
  </div>
</template>

<script>
export default {
  name: 'ChildComponent',
  data() {
    return {
      childMessage: ''
    }
  },
  methods: {
    sendMessageToParent() {
      // 使用 $emit 触发自定义事件
      this.$emit('child-event', this.childMessage)
      this.$emit('update-message', { 
        message: this.childMessage, 
        timestamp: Date.now() 
      })
    }
  }
}
</script>
```

```vue
<!-- 父组件 -->
<template>
  <div>
    <h2>父组件</h2>
    <p>来自子组件的消息: {{ receivedMessage }}</p>
    <!-- 监听子组件发出的事件 -->
    <child-component 
      @child-event="handleChildEvent"
      @update-message="handleUpdateMessage"
    />
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  name: 'ParentComponent',
  components: {
    ChildComponent
  },
  data() {
    return {
      receivedMessage: ''
    }
  },
  methods: {
    handleChildEvent(message) {
      this.receivedMessage = message
    },
    handleUpdateMessage(data) {
      console.log('接收到更新消息:', data)
    }
  }
}
</script>
```

### 3. 兄弟组件传值

兄弟组件之间传值需要通过共同的父组件作为中转：

```vue
<!-- 父组件 -->
<template>
  <div>
    <h2>父组件</h2>
    <sibling-a @data-change="handleDataChange" />
    <sibling-b :shared-data="sharedData" />
  </div>
</template>

<script>
import SiblingA from './SiblingA.vue'
import SiblingB from './SiblingB.vue'

export default {
  name: 'ParentComponent',
  components: {
    SiblingA,
    SiblingB
  },
  data() {
    return {
      sharedData: '初始数据'
    }
  },
  methods: {
    handleDataChange(newData) {
      this.sharedData = newData
    }
  }
}
</script>
```

### 4. 事件总线（Event Bus）

适用于非父子关系的组件通信：

```javascript
// 创建事件总线
import Vue from 'vue'
export const EventBus = new Vue()

// 或者在 Vue 3 中使用mitt库
// import mitt from 'mitt'
// export const EventBus = mitt()
```

```vue
<!-- 组件A -->
<template>
  <button @click="sendData">发送数据</button>
</template>

<script>
import { EventBus } from '@/utils/eventBus'

export default {
  methods: {
    sendData() {
      EventBus.$emit('data-updated', { message: '来自组件A的数据' })
    }
  },
  mounted() {
    // 监听事件
    EventBus.$on('reply-from-b', (data) => {
      console.log('收到组件B的回复:', data)
    })
  },
  beforeDestroy() {
    // 清理事件监听器
    EventBus.$off('reply-from-b')
  }
}
</script>
```

```vue
<!-- 组件B -->
<template>
  <div>组件B</div>
</template>

<script>
import { EventBus } from '@/utils/eventBus'

export default {
  mounted() {
    EventBus.$on('data-updated', (data) => {
      console.log('组件B接收到数据:', data)
      // 回复组件A
      EventBus.$emit('reply-from-b', { reply: '收到，谢谢' })
    })
  },
  beforeDestroy() {
    EventBus.$off('data-updated')
  }
}
</script>
```

### 5. Vuex 状态管理

适用于复杂应用的全局状态管理：

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {
      name: '',
      email: ''
    },
    count: 0
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    INCREMENT(state) {
      state.count++
    }
  },
  actions: {
    updateUserInfo({ commit }, userInfo) {
      commit('SET_USER_INFO', userInfo)
    }
  },
  getters: {
    fullName: state => `${state.userInfo.name}`
  }
})
```

```vue
<!-- 任何组件中 -->
<template>
  <div>
    <p>用户: {{ userInfo.name }}</p>
    <p>计数: {{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['userInfo', 'count']),
    ...mapGetters(['fullName'])
  },
  methods: {
    ...mapMutations(['INCREMENT']),
    ...mapActions(['updateUserInfo']),
    increment() {
      this.INCREMENT()
    }
  }
}
</script>
```

### 6. provide/inject

用于祖先组件向后代组件传递数据：

```vue
<!-- 祖先组件 -->
<template>
  <div>
    <h2>祖先组件</h2>
    <descendant-component />
  </div>
</template>

<script>
export default {
  name: 'AncestorComponent',
  data() {
    return {
      theme: 'dark',
      user: { name: 'John', role: 'admin' }
    }
  },
  provide() {
    return {
      theme: this.theme,
      user: this.user,
      // 提供方法
      updateUser: this.updateUser
    }
  },
  methods: {
    updateUser(newUserData) {
      this.user = { ...this.user, ...newUserData }
    }
  }
}
</script>
```

```vue
<!-- 后代组件（可以是任意层级的后代） -->
<template>
  <div :class="themeClass">
    <h3>后代组件</h3>
    <p>用户: {{ user.name }}</p>
    <p>主题: {{ theme }}</p>
    <button @click="changeUser">更新用户</button>
  </div>
</template>

<script>
export default {
  name: 'DescendantComponent',
  inject: ['theme', 'user', 'updateUser'],
  computed: {
    themeClass() {
      return this.theme === 'dark' ? 'dark-theme' : 'light-theme'
    }
  },
  methods: {
    changeUser() {
      this.updateUser({ name: 'Jane', role: 'user' })
    }
  }
}
</script>
```

### 7. $refs、$parent、$children

直接访问组件实例的方式（不推荐在复杂应用中使用）：

```vue
<!-- 父组件 -->
<template>
  <div>
    <child-component ref="childRef" />
    <button @click="callChildMethod">调用子组件方法</button>
    <button @click="accessChildData">访问子组件数据</button>
  </div>
</template>

<script>
export default {
  methods: {
    callChildMethod() {
      // 通过 $refs 调用子组件方法
      this.$refs.childRef.childMethod()
    },
    accessChildData() {
      // 访问子组件数据
      console.log(this.$refs.childRef.childData)
    }
  }
}
</script>
```

### 8. Vue 3 中的传值方式

```vue
<!-- Vue 3 中使用 Composition API -->
<script setup>
import { ref, provide, inject } from 'vue'

// 提供数据
const theme = ref('dark')
provide('theme', theme)

// 注入数据
const injectedTheme = inject('theme')
</script>

<!-- v-model 在 Vue 3 中的改进 -->
<template>
  <!-- 父组件 -->
  <child-component v-model:title="title" v-model:content="content" />
</template>

<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const title = ref('标题')
const content = ref('内容')
</script>
```

### 9. 传值方式的选择原则

1. **父子传值**：使用 props 和 $emit
2. **非父子传值**：根据复杂度选择事件总线或 Vuex
3. **祖先后代传值**：使用 provide/inject
4. **全局状态**：使用 Vuex/Pinia
5. **简单组件通信**：优先考虑 props 和 events

选择合适的传值方式对于构建可维护的 Vue 应用至关重要。
