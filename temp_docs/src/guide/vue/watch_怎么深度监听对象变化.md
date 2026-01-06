# watch 怎么深度监听对象变化？（必会）

**题目**: watch 怎么深度监听对象变化？（必会）

## 标准答案

在 Vue 的 watch 中，可以通过设置 `deep: true` 选项来深度监听对象的变化。这样当对象内部的任何属性发生变化时，监听器都会被触发，而不仅仅是对象引用的变化。

## 深入理解

### 1. 深度监听的基本用法

```javascript
export default {
  data() {
    return {
      user: {
        name: 'John',
        age: 25,
        address: {
          city: 'Beijing',
          street: 'Haidian'
        }
      }
    }
  },
  watch: {
    user: {
      handler(newVal, oldVal) {
        console.log('用户对象发生变化:', newVal, oldVal);
      },
      deep: true // 启用深度监听
    }
  }
}
```

### 2. 深度监听 vs 浅层监听对比

```vue
<template>
  <div>
    <h3>浅层监听 vs 深度监听</h3>
    <p>用户名: {{ user.name }}</p>
    <p>城市: {{ user.address.city }}</p>
    <button @click="changeUserName">修改用户名</button>
    <button @click="changeCity">修改城市</button>
    <button @click="replaceUserObject">替换整个对象</button>
  </div>
</template>

<script>
export default {
  name: 'DeepWatchDemo',
  data() {
    return {
      user: {
        name: 'John',
        age: 25,
        address: {
          city: 'Beijing',
          street: 'Haidian'
        }
      }
    }
  },
  watch: {
    // 浅层监听 - 只监听对象引用变化
    user: {
      handler(newVal, oldVal) {
        console.log('浅层监听 - user 对象引用变化:', newVal === oldVal);
      }
      // 没有 deep: true
    },
    
    // 深度监听 - 监听对象内部所有属性变化
    user: {
      handler(newVal, oldVal) {
        console.log('深度监听 - user 对象内部变化:', newVal, oldVal);
      },
      deep: true
    }
  },
  methods: {
    changeUserName() {
      this.user.name = 'Jane'; // 深度监听会触发，浅层监听不会
    },
    changeCity() {
      this.user.address.city = 'Shanghai'; // 深度监听会触发，浅层监听不会
    },
    replaceUserObject() {
      this.user = { // 浅层和深度监听都会触发
        name: 'Bob',
        age: 30,
        address: {
          city: 'Guangzhou',
          street: 'Tianhe'
        }
      };
    }
  }
}
</script>
```

### 3. 深度监听的实现原理

Vue 的深度监听通过递归遍历对象的所有属性来实现：

```javascript
// Vue 内部实现简化示例
function traverse(val, seen = new Set()) {
  if (!val || typeof val !== 'object' || seen.has(val)) {
    return val;
  }
  seen.add(val);
  
  // 递归遍历对象的所有属性
  for (const key in val) {
    traverse(val[key], seen);
  }
  
  return val;
}

// 在 watch 中启用 deep 时，Vue 会调用类似函数来收集所有嵌套属性的依赖
```

### 4. 复杂对象的深度监听示例

```javascript
export default {
  data() {
    return {
      appState: {
        user: {
          profile: {
            personal: {
              name: 'John',
              age: 25
            },
            contact: {
              email: 'john@example.com',
              phone: '123-456-7890'
            }
          }
        },
        preferences: {
          theme: 'light',
          language: 'zh-CN'
        },
        settings: [
          { id: 1, name: 'notifications', enabled: true },
          { id: 2, name: 'darkMode', enabled: false }
        ]
      }
    }
  },
  watch: {
    // 深度监听整个应用状态
    appState: {
      handler(newVal, oldVal) {
        console.log('应用状态发生变化');
        // 任何嵌套属性的变化都会触发此监听器
      },
      deep: true
    },
    
    // 也可以监听特定的嵌套路径
    'appState.user.profile.personal.name': {
      handler(newName, oldName) {
        console.log(`用户名从 ${oldName} 变为 ${newName}`);
      }
    }
  }
}
```

### 5. 性能考虑

深度监听虽然功能强大，但需要注意性能影响：

```javascript
export default {
  data() {
    return {
      largeObject: {
        // 包含大量嵌套数据的对象
        items: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          details: { value: i * 2 }
        }))
      }
    }
  },
  watch: {
    largeObject: {
      handler() {
        console.log('大对象发生变化');
      },
      deep: true,
      // 可以结合 immediate 使用，但要谨慎
      immediate: false // 避免初始化时的性能消耗
    }
  }
}
```

### 6. 深度监听与数组

深度监听同样适用于数组：

```javascript
export default {
  data() {
    return {
      users: [
        { id: 1, name: 'John', details: { age: 25 } },
        { id: 2, name: 'Jane', details: { age: 30 } }
      ]
    }
  },
  watch: {
    users: {
      handler(newUsers, oldUsers) {
        console.log('用户列表发生变化');
      },
      deep: true // 监听数组元素及其内部属性的变化
    }
  },
  methods: {
    updateUserAge() {
      this.users[0].details.age = 26; // 深度监听会触发
    },
    addUser() {
      this.users.push({ id: 3, name: 'Bob', details: { age: 35 } }); // 也会触发
    }
  }
}
```

### 7. 深度监听的最佳实践

1. **谨慎使用**：只在必要时使用深度监听，避免不必要的性能开销
2. **特定路径监听**：优先考虑监听特定的嵌套路径而非整个对象
3. **性能监控**：在大型应用中监控深度监听的性能影响

```javascript
// 推荐：监听特定路径
watch: {
  'user.profile.name': function(newName) {
    console.log('用户名变化:', newName);
  }
}

// 谨慎：深度监听整个对象
watch: {
  user: {
    handler() {
      console.log('用户对象任何变化都会触发');
    },
    deep: true
  }
}
```

通过 `deep: true` 选项，Vue 的 watch 可以监听对象内部属性的变化，这是处理复杂数据结构变化的重要功能。
