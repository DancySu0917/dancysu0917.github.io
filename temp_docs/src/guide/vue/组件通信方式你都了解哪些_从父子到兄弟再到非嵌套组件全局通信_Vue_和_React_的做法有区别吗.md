# 组件通信方式你都了解哪些？从父子到兄弟再到非嵌套组件全局通信 Vue 和 React 的做法有区别吗？（了解）

**题目**: 组件通信方式你都了解哪些？从父子到兄弟再到非嵌套组件全局通信 Vue 和 React 的做法有区别吗？（了解）

## 标准答案

组件通信方式主要包括：父子组件通信、兄弟组件通信、跨层级通信和全局通信。Vue和React在组件通信方面有相似之处，但实现方式有所不同：

1. **父子组件通信**：React使用props和回调函数；Vue使用props和$emit。
2. **兄弟组件通信**：React通过共同父组件状态提升；Vue可通过共同父组件或事件总线。
3. **跨层级通信**：React使用Context API；Vue使用provide/inject。
4. **全局通信**：React使用Redux/MobX等；Vue使用Vuex/Pinia。

## 深入理解

### React组件通信方式

#### 1. 父子组件通信

**父传子（Props）：**
```jsx
// 父组件
function Parent() {
  const data = "Hello from parent";
  
  return <ChildComponent message={data} />;
}

// 子组件接收props
function ChildComponent({ message }) {
  return <div>{message}</div>;
}
```

**子传父（回调函数）：**
```jsx
// 父组件
function Parent() {
  const [childData, setChildData] = useState('');
  
  const handleDataFromChild = (data) => {
    setChildData(data);
  };
  
  return (
    <div>
      <p>来自子组件的数据: {childData}</p>
      <ChildComponent onDataSend={handleDataFromChild} />
    </div>
  );
}

// 子组件
function ChildComponent({ onDataSend }) {
  const [inputValue, setInputValue] = useState('');
  
  const sendDataToParent = () => {
    onDataSend(inputValue);
    setInputValue('');
  };
  
  return (
    <div>
      <input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={sendDataToParent}>发送给父组件</button>
    </div>
  );
}
```

#### 2. 兄弟组件通信

通过共同父组件（状态提升）：
```jsx
function Parent() {
  const [sharedState, setSharedState] = useState('');
  
  return (
    <div>
      <SiblingA sharedState={sharedState} setSharedState={setSharedState} />
      <SiblingB sharedState={sharedState} />
    </div>
  );
}

function SiblingA({ sharedState, setSharedState }) {
  return (
    <input 
      value={sharedState}
      onChange={(e) => setSharedState(e.target.value)}
    />
  );
}

function SiblingB({ sharedState }) {
  return <div>兄弟组件B显示: {sharedState}</div>;
}
```

#### 3. 跨层级通信（Context API）
```jsx
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      当前主题: {theme}
    </button>
  );
}
```

#### 4. 全局状态管理（Redux）
```jsx
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';

const store = createStore(reducer);

function App() {
  return (
    <Provider store={store}>
      <UserProfile />
    </Provider>
  );
}

function UserProfile() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  
  return <div>{user.name}</div>;
}
```

### Vue组件通信方式

#### 1. 父子组件通信

**父传子（Props）：**
```vue
<!-- 父组件 -->
<template>
  <ChildComponent :message="parentMessage" />
</template>

<script>
import ChildComponent from './ChildComponent.vue';

export default {
  components: { ChildComponent },
  data() {
    return {
      parentMessage: 'Hello from parent'
    }
  }
}
</script>
```

```vue
<!-- 子组件 -->
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: ['message']
}
</script>
```

**子传父（$emit）：**
```vue
<!-- 子组件 -->
<template>
  <button @click="sendDataToParent">发送数据</button>
</template>

<script>
export default {
  methods: {
    sendDataToParent() {
      this.$emit('data-send', 'Hello from child');
    }
  }
}
</script>
```

```vue
<!-- 父组件 -->
<template>
  <ChildComponent @data-send="handleDataFromChild" />
</template>

<script>
export default {
  methods: {
    handleDataFromChild(data) {
      console.log(data); // 'Hello from child'
    }
  }
}
</script>
```

#### 2. 兄弟组件通信

通过共同父组件：
```vue
<!-- 父组件 -->
<template>
  <div>
    <SiblingA :sharedData="sharedData" @update="updateSharedData" />
    <SiblingB :sharedData="sharedData" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      sharedData: ''
    }
  },
  methods: {
    updateSharedData(value) {
      this.sharedData = value;
    }
  }
}
</script>
```

#### 3. 跨层级通信（Provide/Inject）
```vue
<!-- 祖先组件 -->
<template>
  <div>
    <ChildComponent />
  </div>
</template>

<script>
export default {
  provide() {
    return {
      theme: 'dark',
      updateTheme: this.updateTheme
    }
  },
  methods: {
    updateTheme(newTheme) {
      this.theme = newTheme;
    }
  }
}
</script>
```

```vue
<!-- 后代组件 -->
<template>
  <div>当前主题: {{ theme }}</div>
</template>

<script>
export default {
  inject: ['theme', 'updateTheme']
}
</script>
```

#### 4. 全局状态管理（Vuex/Pinia）
```javascript
// Pinia store
import { defineStore } from 'pinia';

export const useMainStore = defineStore('main', {
  state: () => ({
    user: null,
    theme: 'light'
  }),
  actions: {
    setUser(user) {
      this.user = user;
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    }
  }
});
```

```vue
<!-- 在组件中使用 -->
<template>
  <div>{{ store.user?.name }}</div>
  <button @click="store.toggleTheme">切换主题</button>
</template>

<script>
import { useMainStore } from '@/stores/main';

export default {
  setup() {
    const store = useMainStore();
    return { store };
  }
}
</script>
```

### Vue与React组件通信方式对比

| 通信方式 | React | Vue | 说明 |
|---------|-------|-----|------|
| 父传子 | Props | Props | 两种框架基本相同 |
| 子传父 | 回调函数 | $emit | React通过回调，Vue通过事件发射 |
| 跨层级通信 | Context API | Provide/Inject | 实现方式不同，目的相同 |
| 全局状态 | Redux/MobX/Zustand | Vuex/Pinia | 都是独立的状态管理库 |
| 兄弟通信 | 状态提升 | 状态提升/事件总线 | 都可使用共同父组件 |
| 引用访问 | Refs/forwardRef | Refs | 都可访问子组件实例 |

### 事件总线模式（Vue特有）

Vue中可以通过事件总线实现非父子组件通信：

```javascript
// 创建事件总线
import { createApp } from 'vue';
const EventBus = createApp({});

// 组件A发送事件
EventBus.emit('custom-event', data);

// 组件B接收事件
EventBus.on('custom-event', (data) => {
  console.log(data);
});
```

### Composition API下的通信（Vue 3）

```vue
<template>
  <div>{{ sharedData }}</div>
</template>

<script>
import { inject } from 'vue';

export default {
  setup() {
    const sharedData = inject('sharedData');
    return { sharedData };
  }
}
</script>
```

### React Hooks下的高级通信

```jsx
// 自定义Hook实现全局状态
function useGlobalState() {
  const [state, setState] = useState(initialState);
  
  return {
    state,
    setState,
    updateState: (newState) => setState(prev => ({ ...prev, ...newState }))
  };
}

// 在组件中使用
function Component() {
  const { state, setState } = useGlobalState();
  return <div>{state.value}</div>;
}
```

### 选择合适的通信方式

**React中的选择原则：**
- 简单父子通信：使用Props和回调
- 跨多层级：使用Context API
- 复杂全局状态：使用Redux/Zustand
- 中等复杂度：Context + useReducer

**Vue中的选择原则：**
- 简单父子通信：使用Props和$emit
- 跨多层级：使用Provide/Inject
- 复杂全局状态：使用Pinia/Vuex
- 非父子通信：使用事件总线或全局状态

总的来说，Vue和React在组件通信的核心思想上是相似的，都是通过数据流来管理组件间的数据传递，但在具体实现方式上有所区别，这主要源于两个框架的设计哲学不同。
