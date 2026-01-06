# 什么是 Vue 的计算属性？（必会）

**题目**: 什么是 Vue 的计算属性？（必会）

## 标准答案

Vue 的计算属性（Computed Properties）是基于响应式依赖进行缓存的特殊属性。它允许我们声明一个依赖于其他数据的属性，当依赖的数据发生变化时，计算属性会自动重新计算。计算属性具有以下特点：

1. **响应式**：计算属性会追踪其依赖的数据变化
2. **缓存性**：只有当依赖的数据发生变化时，计算属性才会重新计算
3. **声明式**：以声明的方式创建依赖关系，代码更清晰
4. **可读性**：将复杂的逻辑封装在计算属性中，使模板更简洁

## 深入理解

### 1. 计算属性的基本概念

计算属性是 Vue.js 中一个非常重要的特性，它提供了一种更优雅的方式来处理模板中的复杂逻辑：

```vue
<template>
  <div>
    <p>原始消息: {{ message }}</p>
    <p>反转消息: {{ reversedMessage }}</p>
  </div>
</template>

<script>
export default {
  name: 'ComputedDemo',
  data() {
    return {
      message: 'Hello Vue!'
    };
  },
  computed: {
    // 计算属性的 getter
    reversedMessage() {
      return this.message.split('').reverse().join('');
    }
  }
};
</script>
```

### 2. 计算属性 vs 方法

虽然在功能上计算属性和方法可以实现相同的效果，但它们在性能和缓存机制上存在显著差异：

```vue
<template>
  <div>
    <!-- 计算属性：有缓存 -->
    <p>计算属性: {{ reversedMessage }}</p>
    
    <!-- 方法：无缓存，每次渲染都调用 -->
    <p>方法: {{ reverseMessage() }}</p>
    
    <!-- 每次点击都会触发重新渲染 -->
    <button @click="clickCount++">点击次数: {{ clickCount }}</button>
  </div>
</template>

<script>
export default {
  name: 'ComputedVsMethod',
  data() {
    return {
      message: 'Hello Vue!',
      clickCount: 0
    };
  },
  computed: {
    reversedMessage() {
      console.log('计算属性被调用');
      return this.message.split('').reverse().join('');
    }
  },
  methods: {
    reverseMessage() {
      console.log('方法被调用');
      return this.message.split('').reverse().join('');
    }
  }
};
</script>
```

在上面的例子中：
- 当点击按钮增加 `clickCount` 时，由于 `clickCount` 不是 `reversedMessage` 的依赖，所以计算属性不会重新计算
- 而 `reverseMessage()` 方法每次渲染都会被调用

### 3. 计算属性的 getter 和 setter

计算属性默认只有 getter，但也可以提供 setter：

```vue
<template>
  <div>
    <p>姓名: {{ fullName }}</p>
    <input v-model="fullName" placeholder="输入完整姓名">
    <p>姓: {{ firstName }}</p>
    <p>名: {{ lastName }}</p>
  </div>
</template>

<script>
export default {
  name: 'ComputedSetter',
  data() {
    return {
      firstName: '张',
      lastName: '三'
    };
  },
  computed: {
    fullName: {
      // getter
      get() {
        return this.firstName + ' ' + this.lastName;
      },
      // setter
      set(newValue) {
        const names = newValue.split(' ');
        this.firstName = names[0];
        this.lastName = names[names.length - 1];
      }
    }
  }
};
</script>
```

### 4. 计算属性的缓存机制

计算属性的缓存是其最重要的特性之一：

```javascript
export default {
  data() {
    return {
      firstName: '张',
      lastName: '三',
      age: 25
    };
  },
  computed: {
    fullName() {
      console.log('fullName 计算属性被计算');
      return this.firstName + ' ' + this.lastName;
    }
  },
  methods: {
    getFullName() {
      console.log('getFullName 方法被调用');
      return this.firstName + ' ' + this.lastName;
    }
  },
  mounted() {
    // 第一次访问，会计算
    console.log(this.fullName); // 输出: "fullName 计算属性被计算" + "张 三"
    
    // 第二次访问，使用缓存
    console.log(this.fullName); // 输出: "张 三"，不会再次计算
    
    // 修改依赖，触发重新计算
    this.firstName = '李';
    console.log(this.fullName); // 输出: "fullName 计算属性被计算" + "李 三"
    
    // 访问方法，每次都调用
    console.log(this.getFullName()); // 输出: "getFullName 方法被调用" + "李 三"
    console.log(this.getFullName()); // 输出: "getFullName 方法被调用" + "李 三"
  }
};
```

### 5. 计算属性 vs 侦听器

Vue 提供了多种响应数据变化的方式，计算属性和侦听器有不同的使用场景：

```vue
<template>
  <div>
    <p>城市: {{ city }}</p>
    <p>天气: {{ weather }}</p>
    <button @click="changeCity">切换城市</button>
  </div>
</template>

<script>
export default {
  name: 'ComputedVsWatch',
  data() {
    return {
      city: '北京',
      weather: '未知'
    };
  },
  computed: {
    // 计算属性：适用于基于响应式依赖的值
    cityLength() {
      return this.city.length;
    }
  },
  watch: {
    // 侦听器：适用于需要执行异步或开销较大的操作
    city: async function (newCity) {
      try {
        // 模拟异步获取天气数据
        const response = await fetch(`/api/weather/${newCity}`);
        this.weather = await response.json();
      } catch (error) {
        console.error('获取天气信息失败:', error);
        this.weather = '获取失败';
      }
    }
  },
  methods: {
    changeCity() {
      this.city = this.city === '北京' ? '上海' : '北京';
    }
  }
};
</script>
```

### 6. 计算属性的依赖追踪

Vue 的计算属性能够智能地追踪其依赖：

```vue
<template>
  <div>
    <p>用户列表: {{ users.length }} 个用户</p>
    <p>活跃用户: {{ activeUsers.length }} 个</p>
    <p>活跃用户姓名: {{ activeUserNames }}</p>
    <button @click="toggleUserStatus">切换第一个用户状态</button>
  </div>
</template>

<script>
export default {
  name: 'ComputedDependencies',
  data() {
    return {
      users: [
        { id: 1, name: '张三', active: true },
        { id: 2, name: '李四', active: false },
        { id: 3, name: '王五', active: true }
      ]
    };
  },
  computed: {
    // 依赖于 users 数组
    activeUsers() {
      console.log('计算 activeUsers');
      return this.users.filter(user => user.active);
    },
    
    // 依赖于 activeUsers（间接依赖于 users）
    activeUserNames() {
      console.log('计算 activeUserNames');
      return this.activeUsers.map(user => user.name).join(', ');
    }
  },
  methods: {
    toggleUserStatus() {
      if (this.users.length > 0) {
        this.users[0].active = !this.users[0].active;
      }
    }
  }
};
</script>
```

### 7. 计算属性在实际项目中的应用

```vue
<template>
  <div class="user-dashboard">
    <h2>用户仪表板</h2>
    
    <!-- 使用计算属性过滤数据 -->
    <div class="filters">
      <label>
        <input 
          v-model="filter" 
          type="text" 
          placeholder="搜索用户..."
        >
      </label>
    </div>
    
    <!-- 显示统计信息 -->
    <div class="stats">
      <p>总用户数: {{ totalUsers }}</p>
      <p>活跃用户: {{ activeUsersCount }}</p>
      <p>搜索结果: {{ filteredUsers.length }} 个</p>
    </div>
    
    <!-- 显示用户列表 -->
    <ul class="user-list">
      <li v-for="user in filteredUsers" :key="user.id">
        {{ user.name }} - {{ user.status }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'UserDashboard',
  data() {
    return {
      filter: '',
      users: [
        { id: 1, name: '张三', status: 'active', role: 'admin' },
        { id: 2, name: '李四', status: 'inactive', role: 'user' },
        { id: 3, name: '王五', status: 'active', role: 'user' },
        { id: 4, name: '赵六', status: 'pending', role: 'user' }
      ]
    };
  },
  computed: {
    // 总用户数
    totalUsers() {
      return this.users.length;
    },
    
    // 活跃用户数量
    activeUsersCount() {
      return this.users.filter(user => user.status === 'active').length;
    },
    
    // 过滤后的用户列表
    filteredUsers() {
      if (!this.filter) {
        return this.users;
      }
      return this.users.filter(user => 
        user.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },
    
    // 是否有搜索结果
    hasResults() {
      return this.filteredUsers.length > 0;
    }
  }
};
</script>
```

### 8. Vue 3 中的计算属性

在 Vue 3 中，计算属性的使用方式基本相同，但也可以使用 Composition API：

```vue
<template>
  <div>
    <p>消息: {{ message }}</p>
    <p>反转消息: {{ reversedMessage }}</p>
    <button @click="updateMessage">更新消息</button>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'Vue3Computed',
  setup() {
    const message = ref('Hello Vue 3!');
    
    // 使用 Composition API 定义计算属性
    const reversedMessage = computed(() => {
      return message.value.split('').reverse().join('');
    });
    
    const updateMessage = () => {
      message.value = `Hello Vue 3! ${Date.now()}`;
    };
    
    return {
      message,
      reversedMessage,
      updateMessage
    };
  }
};
</script>
```

### 9. 计算属性的性能优化

计算属性的缓存机制本身就是一种性能优化，但需要注意一些潜在的陷阱：

```javascript
export default {
  data() {
    return {
      users: [
        { id: 1, name: '张三', timestamp: Date.now() },
        { id: 2, name: '李四', timestamp: Date.now() }
      ]
    };
  },
  computed: {
    // 错误示例：依赖非响应式数据
    usersWithCurrentTime() {
      // Date.now() 不是响应式依赖，计算属性不会在时间变化时更新
      return this.users.map(user => ({
        ...user,
        currentTime: Date.now() // 这个值不会更新
      }));
    },
    
    // 正确示例：使用响应式数据
    usersWithTimestamp() {
      return this.users.map(user => ({
        ...user,
        timestamp: this.currentTime // 依赖响应式数据
      }));
    }
  },
  data() {
    return {
      currentTime: Date.now()
    };
  },
  mounted() {
    // 定期更新时间，触发计算属性重新计算
    setInterval(() => {
      this.currentTime = Date.now();
    }, 1000);
  }
};
```

计算属性是 Vue.js 中处理复杂逻辑和优化性能的重要工具，正确使用计算属性可以让应用更加高效和易于维护。
