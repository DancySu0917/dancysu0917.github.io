# React 组件通信方式？React Context 和 Redux 区别？（了解）

**题目**: React 组件通信方式？React Context 和 Redux 区别？（了解）

## 标准答案

React组件通信方式包括：Props传递、回调函数、Context API、Refs、状态提升、自定义事件、第三方状态管理库等。Context API和Redux都是用于全局状态管理的解决方案，主要区别在于：Context API是React内置的轻量级方案，适用于中小型应用；Redux是功能更强大的独立状态管理库，提供中间件、时间旅行调试等高级功能，适用于大型复杂应用。

## 深入理解

### React组件通信方式详解

#### 1. Props传递（父子组件通信）

最基础的组件通信方式，用于父组件向子组件传递数据：

```jsx
// 父组件
function Parent() {
  const [message, setMessage] = useState('Hello from parent');
  
  return (
    <ChildComponent message={message} />
  );
}

// 子组件接收props
function ChildComponent({ message }) {
  return <div>{message}</div>;
}
```

#### 2. 回调函数（子父组件通信）

子组件通过回调函数向父组件传递数据：

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

#### 3. Context API（跨层级通信）

适用于跨越多层级组件的状态共享：

```jsx
import React, { createContext, useContext, useState } from 'react';

// 创建Context
const ThemeContext = createContext();

// Provider组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 消费Context的组件
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button 
      className={`btn-${theme}`}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      当前主题: {theme}
    </button>
  );
}

// 使用Context
function App() {
  return (
    <ThemeProvider>
      <div>
        <ThemedButton />
        <NestedComponent />
      </div>
    </ThemeProvider>
  );
}

function NestedComponent() {
  return <ThemedButton />; // 无需层层传递props
}
```

#### 4. Refs（父组件访问子组件）

用于父组件直接访问子组件实例或DOM元素：

```jsx
import React, { useRef, forwardRef, useImperativeHandle } from 'react';

// 子组件
const CustomInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    getValue: () => inputRef.current.value,
    clear: () => inputRef.current.value = ''
  }));
  
  return <input ref={inputRef} type="text" {...props} />;
});

// 父组件
function Parent() {
  const customInputRef = useRef();
  
  const handleFocus = () => {
    customInputRef.current.focus();
  };
  
  return (
    <div>
      <CustomInput ref={customInputRef} placeholder="输入内容" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  );
}
```

#### 5. 状态提升（兄弟组件通信）

将共享状态提升到共同的父组件：

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

#### 6. 自定义事件系统

通过事件总线模式实现组件通信：

```jsx
// 事件总线
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

const eventBus = new EventBus();

// 发送数据的组件
function Sender() {
  const sendData = () => {
    eventBus.emit('dataEvent', { message: 'Hello from sender' });
  };
  
  return <button onClick={sendData}>发送数据</button>;
}

// 接收数据的组件
function Receiver() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const handleData = (receivedData) => {
      setData(receivedData);
    };
    
    eventBus.on('dataEvent', handleData);
    
    return () => {
      eventBus.off('dataEvent', handleData);
    };
  }, []);
  
  return <div>接收到: {data?.message}</div>;
}
```

### Context API vs Redux 深入对比

#### Context API 特点

**优势：**
- React内置，无需额外依赖
- 使用简单，学习成本低
- 适合中小型应用的状态管理
- 与React生态无缝集成
- 支持嵌套Provider

**局限性：**
- 当Provider的value值变化时，所有依赖该Context的子组件都会重新渲染
- 缺乏中间件机制
- 没有开发者工具支持时间旅行调试
- 复杂状态逻辑处理能力有限

```jsx
// Context API示例
const AppContext = createContext();

function AppProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    theme: 'light',
    notifications: []
  });
  
  const updateUser = (user) => {
    setState(prev => ({ ...prev, user }));
  };
  
  const updateTheme = (theme) => {
    setState(prev => ({ ...prev, theme }));
  };
  
  return (
    <AppContext.Provider value={{
      ...state,
      updateUser,
      updateTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}
```

#### Redux 特点

**优势：**
- 完整的状态管理解决方案
- 强大的中间件生态（如redux-thunk、redux-saga）
- 时间旅行调试能力
- 可预测的状态变化
- 大型应用的成熟解决方案
- DevTools支持

**局限性：**
- 学习曲线陡峭
- 样板代码较多
- 对于简单应用可能过度设计
- 需要额外的依赖包

```jsx
// Redux示例
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';

// Reducer
const userReducer = (state = null, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    default:
      return state;
  }
};

const themeReducer = (state = 'light', action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return state === 'light' ? 'dark' : 'light';
    default:
      return state;
  }
};

const store = createStore(
  combineReducers({
    user: userReducer,
    theme: themeReducer
  })
);

// 在组件中使用
function App() {
  return (
    <Provider store={store}>
      <UserProfile />
      <ThemeToggler />
    </Provider>
  );
}

function UserProfile() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  
  return (
    <div>
      {user ? <p>用户: {user.name}</p> : <p>未登录</p>}
    </div>
  );
}
```

#### Context + useReducer 组合方案

对于中等复杂度的应用，可以结合Context和useReducer：

```jsx
import React, { createContext, useContext, useReducer } from 'react';

// 定义action类型
const actionTypes = {
  SET_USER: 'SET_USER',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
    case actionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    notifications: []
  });
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// 自定义Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// 使用示例
function UserProfile() {
  const { state, dispatch } = useAppContext();
  
  const login = () => {
    dispatch({
      type: actionTypes.SET_USER,
      payload: { id: 1, name: 'Alice' }
    });
  };
  
  return (
    <div>
      {state.user ? (
        <p>用户: {state.user.name}</p>
      ) : (
        <button onClick={login}>登录</button>
      )}
    </div>
  );
}
```

### 选择建议

**使用Context API的场景：**
- 中小型应用
- 简单的全局状态共享
- 主题、用户信息等跨层级数据传递
- 不需要复杂的状态逻辑处理

**使用Redux的场景：**
- 大型复杂应用
- 需要严格的状态管理规范
- 需要时间旅行调试功能
- 复杂的异步操作管理
- 团队协作开发

**Context + useReducer的场景：**
- 中等复杂度应用
- 需要比Context API更结构化的状态管理
- 不想引入Redux的复杂性
- 需要更好的性能优化

在实际项目中，可以根据应用复杂度和团队经验选择合适的状态管理方案，甚至可以组合使用多种方案。
