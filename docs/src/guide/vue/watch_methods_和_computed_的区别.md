# watch、methods 和 computed 的区别?（必会）

**题目**: watch、methods 和 computed 的区别?（必会）

## 标准答案

watch、methods 和 computed 是 Vue.js 中三种不同的数据处理方式，它们的主要区别如下：

1. **computed（计算属性）**：
   - 基于响应式依赖进行缓存
   - 当依赖的数据发生变化时才重新计算
   - 适用于复杂逻辑的计算和数据处理

2. **methods（方法）**：
   - 每次调用都会执行函数
   - 没有缓存机制
   - 适用于事件处理和需要重复执行的操作

3. **watch（侦听器）**：
   - 监听特定数据的变化
   - 执行副作用操作（如异步请求、复杂逻辑）
   - 适用于数据变化时需要执行特定操作的场景

## 深入理解

### 1. computed（计算属性）

计算属性是基于它们的响应式依赖进行缓存的。只有当依赖的数据发生变化时，计算属性才会重新计算。

#### 特点：
- **缓存性**：有缓存，依赖不变时直接返回缓存结果
- **响应式**：自动追踪依赖变化
- **声明式**：以声明的方式创建依赖关系

```vue
<template>
  <div>
    <p>消息: {{ message }}</p>
    <p>反转消息: {{ reversedMessage }}</p>
    <p>消息长度: {{ messageLength }}</p>
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
    // 基于 message 的计算属性
    reversedMessage() {
      console.log('计算属性被调用');
      return this.message.split('').reverse().join('');
    },
    
    // 另一个计算属性
    messageLength() {
      return this.message.length;
    }
  }
};
</script>
```

### 2. methods（方法）

方法每次调用都会执行函数，没有缓存机制。

#### 特点：
- **无缓存**：每次调用都执行函数
- **可传参**：可以接收参数
- **适用事件处理**：适合处理用户交互

```vue
<template>
  <div>
    <p>消息: {{ message }}</p>
    <p>反转消息: {{ reverseMessage() }}</p>
    <p>随机数: {{ getRandomNumber() }}</p>
    <button @click="updateMessage">更新消息</button>
  </div>
</template>

<script>
export default {
  name: 'MethodsDemo',
  data() {
    return {
      message: 'Hello Vue!'
    };
  },
  methods: {
    reverseMessage() {
      console.log('方法被调用');
      return this.message.split('').reverse().join('');
    },
    
    getRandomNumber() {
      return Math.random();
    },
    
    updateMessage() {
      this.message = 'Updated: ' + Date.now();
    }
  }
};
</script>
```

### 3. watch（侦听器）

侦听器用于观察和响应 Vue 实例上的数据变动。

#### 特点：
- **监听变化**：监听特定数据的变化
- **执行副作用**：适合异步操作或开销大的操作
- **深度监听**：可以监听对象的深层变化

```vue
<template>
  <div>
    <input v-model="question" placeholder="输入问题">
    <p>{{ answer }}</p>
  </div>
</template>

<script>
export default {
  name: 'WatchDemo',
  data() {
    return {
      question: '',
      answer: '等待输入...'
    };
  },
  watch: {
    // 监听 question 的变化
    question: async function (newQuestion, oldQuestion) {
      if (newQuestion.indexOf('?') > -1) {
        this.answer = '正在思考...';
        try {
          const response = await fetch('https://yesno.wtf/api');
          const data = await response.json();
          this.answer = data.answer;
        } catch (error) {
          this.answer = '出错了！';
        }
      } else {
        this.answer = '问题通常以问号结尾';
      }
    }
  }
};
</script>
```

### 4. 详细对比

#### 执行时机对比：

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>计算属性: {{ computedResult }}</p>
    <p>方法: {{ methodResult() }}</p>
    <button @click="increment">增加计数</button>
  </div>
</template>

<script>
export default {
  name: 'ExecutionDemo',
  data() {
    return {
      count: 0
    };
  },
  computed: {
    computedResult() {
      console.log('计算属性执行');
      return this.count * 2;
    }
  },
  methods: {
    methodResult() {
      console.log('方法执行');
      return this.count * 2;
    },
    increment() {
      this.count++;
    }
  }
};
</script>
```

在上面的例子中：
- 每次点击按钮，`count` 增加，计算属性会重新计算
- 每次模板重新渲染，方法都会执行
- 计算属性只在 `count` 变化时才重新计算

#### 性能对比：

```vue
<template>
  <div>
    <h3>性能测试</h3>
    <p>计算属性: {{ expensiveComputed }}</p>
    <p>方法: {{ expensiveMethod() }}</p>
    <p>其他数据: {{ otherData }}</p>
    <button @click="updateOtherData">更新其他数据</button>
  </div>
</template>

<script>
export default {
  name: 'PerformanceDemo',
  data() {
    return {
      count: 0,
      otherData: '不变的数据'
    };
  },
  computed: {
    expensiveComputed() {
      console.log('昂贵的计算属性执行');
      // 模拟昂贵的计算
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += i;
      }
      return result + this.count;
    }
  },
  methods: {
    expensiveMethod() {
      console.log('昂贵的方法执行');
      // 模拟昂贵的计算
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += i;
      }
      return result + this.count;
    },
    updateOtherData() {
      this.otherData = '更新的数据 ' + Date.now();
    }
  }
};
</script>
```

### 5. 使用场景对比

#### computed 适用场景：
- 基于已有数据计算新值
- 复杂的逻辑处理
- 过滤和排序数据
- 需要缓存的计算

```vue
<template>
  <div>
    <input v-model="searchText" placeholder="搜索">
    <ul>
      <li v-for="user in filteredUsers" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ComputedUseCase',
  data() {
    return {
      searchText: '',
      users: [
        { id: 1, name: '张三', active: true },
        { id: 2, name: '李四', active: false },
        { id: 3, name: '王五', active: true }
      ]
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchText) {
        return this.users;
      }
      return this.users.filter(user => 
        user.name.includes(this.searchText)
      );
    }
  }
};
</script>
```

#### methods 适用场景：
- 事件处理
- 需要传参的函数
- 不需要缓存的操作
- 工具函数

```vue
<template>
  <div>
    <button @click="handleClick('primary')">主要按钮</button>
    <button @click="handleClick('secondary')">次要按钮</button>
    <p>点击次数: {{ clickCount }}</p>
  </div>
</template>

<script>
export default {
  name: 'MethodsUseCase',
  data() {
    return {
      clickCount: 0
    };
  },
  methods: {
    handleClick(type) {
      console.log(`点击了${type}按钮`);
      this.clickCount++;
      
      // 可以执行复杂的逻辑
      if (type === 'primary') {
        this.doPrimaryAction();
      }
    },
    doPrimaryAction() {
      // 执行主要操作
      console.log('执行主要操作');
    }
  }
};
</script>
```

#### watch 适用场景：
- 异步操作
- 开销大的操作
- 监听路由变化
- 数据变化时的副作用

```vue
<template>
  <div>
    <input v-model="city" placeholder="输入城市">
    <p>天气: {{ weather }}</p>
  </div>
</template>

<script>
export default {
  name: 'WatchUseCase',
  data() {
    return {
      city: '',
      weather: '未知'
    };
  },
  watch: {
    city: {
      handler: async function (newCity) {
        if (newCity) {
          try {
            // 异步获取天气数据
            const response = await fetch(`/api/weather/${newCity}`);
            this.weather = await response.json();
          } catch (error) {
            console.error('获取天气失败:', error);
            this.weather = '获取失败';
          }
        } else {
          this.weather = '未知';
        }
      },
      // 立即执行
      immediate: true,
      // 深度监听
      deep: true
    }
  }
};
</script>
```

### 6. 组合使用示例

```vue
<template>
  <div>
    <h3>组合使用示例</h3>
    <input v-model="searchTerm" placeholder="搜索用户">
    <select v-model="statusFilter">
      <option value="">全部</option>
      <option value="active">活跃</option>
      <option value="inactive">非活跃</option>
    </select>
    
    <p>显示 {{ filteredUsers.length }} 个用户</p>
    <ul>
      <li v-for="user in paginatedUsers" :key="user.id">
        {{ user.name }} - {{ user.status }}
        <button @click="updateUserStatus(user)">切换状态</button>
      </li>
    </ul>
    
    <div>
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CombinedUseCase',
  data() {
    return {
      searchTerm: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 5,
      users: [
        { id: 1, name: '张三', status: 'active' },
        { id: 2, name: '李四', status: 'inactive' },
        { id: 3, name: '王五', status: 'active' },
        { id: 4, name: '赵六', status: 'pending' },
        { id: 5, name: '钱七', status: 'active' },
        { id: 6, name: '孙八', status: 'inactive' },
        { id: 7, name: '周九', status: 'active' }
      ]
    };
  },
  // computed: 处理数据过滤和计算
  computed: {
    filteredUsers() {
      let result = this.users;
      
      // 根据搜索词过滤
      if (this.searchTerm) {
        result = result.filter(user => 
          user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
      
      // 根据状态过滤
      if (this.statusFilter) {
        result = result.filter(user => user.status === this.statusFilter);
      }
      
      return result;
    },
    
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.pageSize);
    },
    
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredUsers.slice(start, end);
    }
  },
  // watch: 监听数据变化
  watch: {
    // 监听搜索词变化，重置页码
    searchTerm() {
      this.currentPage = 1;
    },
    statusFilter() {
      this.currentPage = 1;
    }
  },
  // methods: 处理用户交互
  methods: {
    updateUserStatus(user) {
      user.status = user.status === 'active' ? 'inactive' : 'active';
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  }
};
</script>
```

### 7. Vue 3 中的对比

在 Vue 3 的 Composition API 中，这些概念仍然适用：

```vue
<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>计算结果: {{ doubleCount }}</p>
    <p>随机数: {{ randomNum }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'Vue3Comparison',
  setup() {
    const count = ref(0);
    const randomNum = ref(0);
    
    // computed
    const doubleCount = computed(() => {
      return count.value * 2;
    });
    
    // methods
    const increment = () => {
      count.value++;
      randomNum.value = Math.random();
    };
    
    // watch
    watch(count, (newVal, oldVal) => {
      console.log(`计数从 ${oldVal} 变为 ${newVal}`);
    });
    
    return {
      count,
      doubleCount,
      randomNum,
      increment
    };
  }
};
</script>
```

通过理解这三种方式的区别和适用场景，可以更好地组织代码逻辑，提高应用性能和可维护性。
