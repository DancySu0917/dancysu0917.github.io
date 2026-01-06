# 跟 keep-alive 有关的生命周期是哪些？（必会）

**题目**: 跟 keep-alive 有关的生命周期是哪些？（必会）

## 标准答案

与`<keep-alive>`相关的生命周期钩子有：
1. `activated`：组件被激活时调用
2. `deactivated`：组件被停用时调用

这两个钩子只在被`<keep-alive>`缓存的组件中可用。

## 深入理解

`<keep-alive>`是Vue的一个抽象组件，用于缓存动态组件，避免重复创建和销毁。当组件被`<keep-alive>`包装时，会增加两个特殊的生命周期钩子：

### 1. 生命周期钩子详解

#### `activated` 钩子
- 当被`<keep-alive>`缓存的组件激活时调用
- 在组件第一次渲染时也会被调用，与`mounted`钩子类似
- 每次组件从缓存中被重新插入到DOM时都会被调用

#### `deactivated` 钩子
- 当被`<keep-alive>`缓存的组件停用时调用
- 组件被切换出去时调用，但组件实例仍然被保留在内存中
- 不会销毁组件实例，只是将其从DOM中移除

### 2. 生命周期执行顺序

```vue
<template>
  <div class="lifecycle-demo">
    <h2>{{ title }}</h2>
    <p>激活次数: {{ activatedCount }}</p>
    <p>停用次数: {{ deactivatedCount }}</p>
  </div>
</template>

<script>
export default {
  name: 'LifecycleDemo',
  data() {
    return {
      title: '生命周期演示组件',
      activatedCount: 0,
      deactivatedCount: 0
    }
  },
  
  beforeCreate() {
    console.log('1. beforeCreate - 组件实例即将创建')
  },
  
  created() {
    console.log('2. created - 组件实例创建完成')
  },
  
  beforeMount() {
    console.log('3. beforeMount - 组件即将挂载')
  },
  
  mounted() {
    console.log('4. mounted - 组件已挂载')
  },
  
  activated() {
    // 每次组件被激活时都会调用
    this.activatedCount++
    console.log('5. activated - 组件被激活')
    // 在这里可以执行激活时的逻辑，比如重新获取数据
  },
  
  deactivated() {
    // 每次组件被停用时都会调用
    this.deactivatedCount++
    console.log('6. deactivated - 组件被停用')
    // 在这里可以执行停用时的清理逻辑
  },
  
  beforeDestroy() {
    console.log('7. beforeDestroy - 组件即将销毁')
  },
  
  destroyed() {
    console.log('8. destroyed - 组件已销毁')
  }
}
</script>
```

### 3. 实际应用示例

#### 组件状态保持
```vue
<template>
  <div class="user-profile">
    <h2>用户资料</h2>
    <input v-model="username" placeholder="用户名" />
    <input v-model="email" placeholder="邮箱" />
    <p>编辑次数: {{ editCount }}</p>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  data() {
    return {
      username: '',
      email: '',
      editCount: 0
    }
  },
  activated() {
    // 组件激活时可以执行一些操作
    console.log('用户资料组件被激活')
  },
  deactivated() {
    // 组件停用时可以执行清理操作
    console.log('用户资料组件被停用')
  },
  methods: {
    incrementEditCount() {
      this.editCount++
    }
  }
}
</script>
```

#### 定时器管理
```vue
<template>
  <div class="timer-component">
    <h2>计时器: {{ time }}</h2>
    <button @click="startTimer">开始</button>
    <button @click="stopTimer">停止</button>
  </div>
</template>

<script>
export default {
  name: 'TimerComponent',
  data() {
    return {
      time: 0,
      timer: null
    }
  },
  activated() {
    // 组件激活时，如果之前有定时器，可以恢复
    if (this.timer) {
      console.log('定时器恢复')
    }
  },
  deactivated() {
    // 组件停用时，清理定时器避免内存泄漏
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      console.log('定时器已清理')
    }
  },
  methods: {
    startTimer() {
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.time++
        }, 1000)
      }
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  }
}
</script>
```

### 4. 与普通组件生命周期的区别

普通组件的完整生命周期：
```
beforeCreate -> created -> beforeMount -> mounted -> beforeDestroy -> destroyed
```

被`<keep-alive>`缓存的组件生命周期：
```
// 首次进入
beforeCreate -> created -> beforeMount -> mounted -> activated

// 切换到其他组件
deactivated

// 再次切换回来
activated

// 最终销毁
deactivated -> beforeDestroy -> destroyed
```

### 5. 使用场景

#### 路由缓存
```vue
<template>
  <div id="app">
    <!-- 缓存路由组件 -->
    <keep-alive include="Home,About">
      <router-view />
    </keep-alive>
  </div>
</template>
```

#### Tab页签
```vue
<template>
  <div class="tabs">
    <div class="tab-headers">
      <button 
        v-for="tab in tabs" 
        :key="tab.name"
        @click="currentTab = tab.name"
        :class="{ active: currentTab === tab.name }"
      >
        {{ tab.title }}
      </button>
    </div>
    
    <div class="tab-content">
      <keep-alive>
        <component :is="currentTab" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import HomeTab from './tabs/HomeTab.vue'
import ProfileTab from './tabs/ProfileTab.vue'
import SettingsTab from './tabs/SettingsTab.vue'

export default {
  components: {
    HomeTab,
    ProfileTab,
    SettingsTab
  },
  data() {
    return {
      currentTab: 'HomeTab',
      tabs: [
        { name: 'HomeTab', title: '首页' },
        { name: 'ProfileTab', title: '个人资料' },
        { name: 'SettingsTab', title: '设置' }
      ]
    }
  }
}
</script>
```

### 6. 注意事项

1. **内存管理**：被缓存的组件不会被销毁，会持续占用内存
2. **定时器清理**：在`deactivated`中清理定时器和事件监听器
3. **数据更新**：缓存组件的数据不会自动更新，需要手动处理
4. **副作用处理**：注意处理异步操作等副作用

### 7. Vue 3 中的变化

在Vue 3中，`activated`和`deactivated`钩子仍然存在，但在Composition API中使用方式略有不同：

```javascript
import { onActivated, onDeactivated } from 'vue'

export default {
  setup() {
    onActivated(() => {
      console.log('组件被激活')
    })
    
    onDeactivated(() => {
      console.log('组件被停用')
    })
    
    // 组件逻辑
  }
}
```

通过合理使用`activated`和`deactivated`生命周期钩子，可以更好地控制被缓存组件的行为，实现更高效的组件状态管理。
