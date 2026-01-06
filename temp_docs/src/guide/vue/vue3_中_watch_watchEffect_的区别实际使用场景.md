# vue3 中 watch watchEffect 的区别实际使用场景？（了解）

**题目**: vue3 中 watch watchEffect 的区别实际使用场景？（了解）

## 标准答案

watch 和 watchEffect 都是 Vue 3 中的响应式侦听器，主要区别在于：
- watch：显式指定要侦听的响应式数据，只在依赖数据变化时执行
- watchEffect：自动追踪函数内部使用的响应式数据，当任何依赖变化时执行
- 使用场景：watch 适合精确控制监听目标，watchEffect 适合自动追踪依赖

## 深入理解

### 1. 基本概念对比

#### watch
- 需要明确指定要侦听的源（source）
- 只有当指定的响应式数据发生变化时才会执行回调
- 可以获取到新值和旧值
- 更加精确，性能更好（因为只追踪指定的数据）

#### watchEffect
- 自动追踪函数内部使用的响应式数据
- 无需明确指定侦听源，会自动收集依赖
- 初始化时立即执行一次
- 适合副作用函数，自动追踪所有依赖

### 2. 语法对比

```javascript
import { watch, watchEffect, ref, reactive } from 'vue';

// 使用 watch
const count = ref(0);
const state = reactive({ name: 'Vue', version: 3 });

// 侦听单个源
watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`);
});

// 侦听多个源
watch([() => state.name, () => state.version], ([newName, newVersion], [oldName, oldVersion]) => {
  console.log(`state changed from ${oldName} v${oldVersion} to ${newName} v${newVersion}`);
});

// 使用 getter 函数
watch(
  () => state.name,
  (newName, oldName) => {
    console.log(`name changed from ${oldName} to ${newName}`);
  }
);
```

```javascript
// 使用 watchEffect
const count = ref(0);
const name = ref('Vue');

// 自动追踪 count 和 name 的变化
watchEffect(() => {
  console.log(`count: ${count.value}, name: ${name.value}`);
  // 当 count 或 name 变化时，这个函数会重新执行
});
```

### 3. 详细特性对比

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 依赖追踪 | 手动指定 | 自动追踪 |
| 初始执行 | 不立即执行（除非设置 immediate） | 立即执行一次 |
| 新旧值 | 可以获取新旧值 | 只能获取新值 |
| 性能 | 更好（只追踪指定依赖） | 稍差（追踪所有依赖） |
| 使用复杂度 | 需要指定侦听源 | 更简洁 |

### 4. 实际使用场景

#### watch 的使用场景

1. **需要访问新值和旧值时**
```javascript
const count = ref(0);

watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`);
});
```

2. **需要侦听复杂数据结构的特定属性**
```javascript
const user = reactive({
  profile: {
    name: 'John',
    age: 30
  }
});

// 只侦听 name 的变化
watch(
  () => user.profile.name,
  (newName, oldName) => {
    console.log(`Name changed from ${oldName} to ${newName}`);
  }
);
```

3. **需要延迟执行或精确控制触发条件**
```javascript
const searchQuery = ref('');
const searchResults = ref([]);

watch(
  searchQuery,
  async (newQuery) => {
    if (newQuery.length > 2) {
      searchResults.value = await fetchSearchResults(newQuery);
    } else {
      searchResults.value = [];
    }
  },
  { immediate: true } // 立即执行
);
```

#### watchEffect 的使用场景

1. **自动追踪多个响应式数据**
```javascript
const x = ref(0);
const y = ref(0);

watchEffect(() => {
  // 自动追踪 x 和 y 的变化
  console.log(`x: ${x.value}, y: ${y.value}`);
  // 当 x 或 y 任一变化时，此函数都会重新执行
});
```

2. **副作用处理（如 API 调用、DOM 操作）**
```javascript
const userId = ref(1);
const userData = ref(null);

watchEffect(async () => {
  // 自动追踪 userId 的变化
  userData.value = await fetchUser(userId.value);
});
```

3. **计算属性的副作用**
```javascript
const input = ref('');
const output = ref('');

watchEffect(() => {
  // 当 input 变化时自动处理
  output.value = input.value.toUpperCase().split('').reverse().join('');
});
```

### 5. 性能考虑

#### watch 的性能优势
```javascript
const obj = reactive({
  a: 1,
  b: 2,
  c: 3
});

// 只侦听 a 的变化，即使 b、c 变化也不会触发
watch(
  () => obj.a,
  (newVal) => {
    console.log('a changed:', newVal);
  }
);
```

#### watchEffect 的依赖追踪
```javascript
const obj = reactive({
  a: 1,
  b: 2,
  c: 3
});

// 会追踪 obj.a 和 obj.b 的变化
watchEffect(() => {
  console.log(obj.a, obj.b); // 但不会追踪 obj.c，因为它没有被使用
});
```

### 6. 清除副作用

两者都支持清理函数，但使用方式略有不同：

```javascript
// watch 中的清理
watch(
  source,
  (newVal, oldVal, onInvalidate) => {
    let cancelled = false;
    
    onInvalidate(() => {
      cancelled = true;
    });
    
    fetchData().then(result => {
      if (!cancelled) {
        // 处理结果
      }
    });
  }
);

// watchEffect 中的清理
watchEffect((onInvalidate) => {
  let cancelled = false;
  
  onInvalidate(() => {
    cancelled = true;
  });
  
  fetchData().then(result => {
    if (!cancelled) {
      // 处理结果
    }
  });
});
```

### 7. 停止侦听

```javascript
// 停止 watch
const stopWatch = watch(source, callback);
stopWatch(); // 停止侦听

// 停止 watchEffect
const stopEffect = watchEffect(callback);
stopEffect(); // 停止侦听
```

### 8. 组合式 API 中的最佳实践

```javascript
import { ref, watch, watchEffect, onUnmounted } from 'vue';

export default {
  setup() {
    const searchQuery = ref('');
    const results = ref([]);
    const loading = ref(false);
    
    // 使用 watch 处理搜索逻辑
    watch(
      searchQuery,
      async (newQuery) => {
        if (newQuery) {
          loading.value = true;
          try {
            results.value = await api.search(newQuery);
          } finally {
            loading.value = false;
          }
        } else {
          results.value = [];
        }
      },
      { debounce: 300 } // 防抖
    );
    
    // 使用 watchEffect 处理副作用
    const stopEffect = watchEffect(() => {
      document.title = searchQuery.value ? `搜索: ${searchQuery.value}` : '首页';
    });
    
    // 组件卸载时清理
    onUnmounted(() => {
      stopEffect();
    });
    
    return {
      searchQuery,
      results,
      loading
    };
  }
};
```

总的来说，选择 watch 还是 watchEffect 取决于具体需求：
- 使用 watch 当你需要精确控制侦听的依赖、需要访问新旧值、或需要延迟执行
- 使用 watchEffect 当你需要自动追踪依赖、进行副作用操作、或代码更简洁
