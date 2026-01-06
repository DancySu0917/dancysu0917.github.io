# 自定义指令(v-check、v-focus)的方法有哪些?它有哪些钩子函数?还有哪些钩子函数参数?（必会）

**题目**: 自定义指令(v-check、v-focus)的方法有哪些?它有哪些钩子函数?还有哪些钩子函数参数?（必会）

## 标准答案

Vue.js 自定义指令的创建方法主要有两种：

1. **全局注册**：使用 Vue.directive() 方法
2. **局部注册**：在组件的 directives 选项中定义

自定义指令的钩子函数包括：
- bind：指令第一次绑定到元素时调用
- inserted：被绑定元素插入父节点时调用
- update：所在组件的 VNode 更新时调用
- componentUpdated：所在组件的 VNode 及其子 VNode 全部更新后调用
- unbind：指令与元素解绑时调用

每个钩子函数接收的参数包括：
- el：指令所绑定的元素
- binding：包含指令相关信息的对象
- vnode：Vue 编译生成的虚拟节点
- oldVnode：上一个虚拟节点（仅在 update 和 componentUpdated 中可用）

## 深入理解

### 1. 自定义指令的创建方法

#### 全局注册

```javascript
// 全局注册 v-focus 指令
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus();
  }
});

// 全局注册 v-check 指令
Vue.directive('check', {
  bind: function (el, binding) {
    el.checked = binding.value;
  },
  update: function (el, binding) {
    el.checked = binding.value;
  }
});
```

#### 局部注册

```vue
<template>
  <div>
    <input v-focus placeholder="自动获取焦点">
    <input type="checkbox" v-check="isChecked" @change="handleChange">
  </div>
</template>

<script>
export default {
  name: 'CustomDirectiveDemo',
  directives: {
    // 局部注册 v-focus 指令
    focus: {
      inserted: function (el) {
        el.focus();
      }
    },
    // 局部注册 v-check 指令
    check: {
      bind: function (el, binding) {
        el.checked = binding.value;
      },
      update: function (el, binding) {
        el.checked = binding.value;
      }
    }
  },
  data() {
    return {
      isChecked: true
    };
  },
  methods: {
    handleChange(event) {
      this.isChecked = event.target.checked;
    }
  }
};
</script>
```

### 2. 钩子函数详解

#### bind 钩子函数
- 在指令第一次绑定到元素时调用
- 只调用一次，可以在这里进行一次性的初始化设置

```javascript
Vue.directive('demo', {
  bind: function (el, binding, vnode) {
    console.log('bind 钩子函数被调用');
    console.log('el:', el);
    console.log('binding:', binding);
    console.log('vnode:', vnode);
    
    // 设置初始样式
    el.style.color = 'red';
  }
});
```

#### inserted 钩子函数
- 被绑定元素插入父节点时调用
- 保证父节点存在，但不一定已被插入文档

```javascript
Vue.directive('demo', {
  inserted: function (el, binding, vnode) {
    console.log('inserted 钩子函数被调用');
    // 可以安全地操作 DOM
    if (el.parentNode) {
      console.log('元素已插入到父节点');
    }
  }
});
```

#### update 钩子函数
- 所在组件的 VNode 更新时调用
- 但可能发生在其子 VNode 更新之前
- 指令的值可能发生了改变，也可能没有

```javascript
Vue.directive('demo', {
  update: function (el, binding, vnode, oldVnode) {
    console.log('update 钩子函数被调用');
    console.log('新值:', binding.value);
    console.log('旧值:', binding.oldValue);
    
    // 根据新值更新元素
    if (binding.value !== binding.oldValue) {
      el.innerHTML = binding.value;
    }
  }
});
```

#### componentUpdated 钩子函数
- 所在组件的 VNode 及其子 VNode 全部更新后调用

```javascript
Vue.directive('demo', {
  componentUpdated: function (el, binding, vnode, oldVnode) {
    console.log('componentUpdated 钩子函数被调用');
    // 确保所有子节点都已更新
  }
});
```

#### unbind 钩子函数
- 指令与元素解绑时调用
- 只调用一次，可以在这里清理资源

```javascript
Vue.directive('demo', {
  bind: function (el, binding) {
    // 绑定事件监听器
    el.addEventListener('click', binding.value);
  },
  unbind: function (el, binding) {
    // 解绑事件监听器，防止内存泄漏
    el.removeEventListener('click', binding.value);
  }
});
```

### 3. 钩子函数参数详解

#### el 参数
- 指令所绑定的元素，可以用来直接操作 DOM

```javascript
Vue.directive('color', {
  bind: function (el, binding) {
    // 直接操作 DOM 元素
    el.style.color = binding.value;
  }
});
```

#### binding 参数
- 一个对象，包含以下属性：
  - name: 指令名，不包括 v- 前缀
  - value: 指令的绑定值
  - oldValue: 指令绑定的前一个值
  - expression: 字符串形式的指令表达式
  - arg: 传给指令的参数
  - modifiers: 一个包含修饰符的对象

```javascript
Vue.directive('demo', {
  bind: function (el, binding) {
    console.log('指令名:', binding.name);           // 'demo'
    console.log('绑定值:', binding.value);          // 如：'red'
    console.log('旧值:', binding.oldValue);         // undefined (首次绑定)
    console.log('表达式:', binding.expression);     // 如："'red'"
    console.log('参数:', binding.arg);              // 如：'color'
    console.log('修饰符:', binding.modifiers);      // 如：{bold: true}
  }
});
```

#### vnode 参数
- Vue 编译生成的虚拟节点

```javascript
Vue.directive('demo', {
  bind: function (el, binding, vnode) {
    console.log('虚拟节点:', vnode);
    console.log('标签名:', vnode.tag);
    console.log('数据:', vnode.data);
    console.log('子节点:', vnode.children);
  }
});
```

#### oldVnode 参数
- 上一个虚拟节点，仅在 update 和 componentUpdated 钩子中可用

### 4. 实际应用示例

#### v-focus 指令实现

```vue
<template>
  <div>
    <h3>自定义 v-focus 指令</h3>
    <input v-focus placeholder="自动获取焦点">
    <input placeholder="普通输入框">
    <button @click="showInput = !showInput">切换显示</button>
    
    <input v-if="showInput" v-focus placeholder="动态插入的输入框">
  </div>
</template>

<script>
export default {
  name: 'FocusDirective',
  directives: {
    focus: {
      // 简化写法，相当于只定义了 inserted 钩子
      inserted: function (el) {
        el.focus();
      }
    }
  },
  data() {
    return {
      showInput: false
    };
  }
};
</script>
```

#### v-check 指令实现

```vue
<template>
  <div>
    <h3>自定义 v-check 指令</h3>
    <input type="checkbox" v-check="isChecked" @change="handleChange">
    <p>复选框状态: {{ isChecked ? '选中' : '未选中' }}</p>
    <button @click="toggleCheck">切换状态</button>
  </div>
</template>

<script>
export default {
  name: 'CheckDirective',
  directives: {
    check: {
      bind: function (el, binding) {
        // 初始化时设置复选框状态
        el.checked = binding.value;
      },
      update: function (el, binding) {
        // 当绑定值更新时同步复选框状态
        if (binding.value !== binding.oldValue) {
          el.checked = binding.value;
        }
      }
    }
  },
  data() {
    return {
      isChecked: false
    };
  },
  methods: {
    handleChange(event) {
      this.isChecked = event.target.checked;
    },
    toggleCheck() {
      this.isChecked = !this.isChecked;
    }
  }
};
</script>
```

#### 更复杂的自定义指令示例

```vue
<template>
  <div>
    <h3>复杂自定义指令示例</h3>
    <!-- 带参数和修饰符的指令 -->
    <div v-demo:foo.bar="message">文本内容</div>
    <input v-model="message" placeholder="修改文本">
    
    <!-- 防抖指令 -->
    <input v-debounce:1000="handleDebounce" placeholder="防抖输入框">
    <p>防抖计数: {{ debounceCount }}</p>
  </div>
</template>

<script>
export default {
  name: 'ComplexDirective',
  directives: {
    demo: {
      bind: function (el, binding, vnode) {
        console.log('参数:', binding.arg);        // 'foo'
        console.log('修饰符:', binding.modifiers); // {bar: true}
        console.log('值:', binding.value);        // message 的值
        
        el.style.backgroundColor = 'yellow';
        el.innerHTML += ` - 参数: ${binding.arg}`;
      },
      update: function (el, binding) {
        el.innerHTML = binding.value + ` - 参数: ${binding.arg}`;
      }
    },
    debounce: {
      bind: function (el, binding) {
        let timeoutId;
        const delay = binding.arg || 300;
        
        el.handler = function (...args) {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            binding.value.apply(this, args);
          }, delay);
        };
        
        el.addEventListener('input', el.handler);
      },
      unbind: function (el) {
        el.removeEventListener('input', el.handler);
      }
    }
  },
  data() {
    return {
      message: 'Hello Vue',
      debounceCount: 0
    };
  },
  methods: {
    handleDebounce(event) {
      this.debounceCount++;
      console.log('防抖输入:', event.target.value);
    }
  }
};
</script>
```

### 5. Vue 3 中的变化

在 Vue 3 中，自定义指令的钩子函数有所变化：

```javascript
// Vue 3 中的自定义指令
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode, prevVnode) {
    // 在元素上设置一些属性
  },
  
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {
    // ...
  },
  
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {
    // ...
  },
  
  // 在元素本身被更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {
    // ...
  },
  
  // 在元素本身被更新后调用
  updated(el, binding, vnode, prevVnode) {
    // ...
  },
  
  // 在绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {
    // ...
  },
  
  // 在绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {
    // ...
  }
};
```

通过理解自定义指令的创建方法、钩子函数和参数，开发者可以创建功能丰富的指令来扩展 Vue.js 的能力。
