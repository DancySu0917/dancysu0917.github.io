# React 中组件如何进行数据传值？（必会）

**题目**: React 中组件如何进行数据传值？（必会）

## 标准答案

React组件间数据传值主要有以下几种方式：
1. **Props传递**：父子组件间传递数据的最常见方式
2. **回调函数**：子组件向父组件传递数据
3. **Context API**：跨层级组件间的数据传递
4. **状态提升**：多个组件共享状态
5. **Refs**：父组件访问子组件或DOM元素
6. **自定义事件**：使用事件系统传递数据
7. **第三方状态管理库**：如Redux、MobX、Zustand等

## 深入理解

### 1. Props传递（父组件向子组件）

这是最常见的数据传递方式，用于父组件向子组件传递数据：

```jsx
// 父组件
function Parent() {
  const userData = {
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  };
  
  return (
    <div>
      <ChildComponent 
        name={userData.name} 
        age={userData.age} 
        email={userData.email}
        isActive={true}
      />
    </div>
  );
}

// 子组件接收props
function ChildComponent({ name, age, email, isActive }) {
  return (
    <div className={`user-card ${isActive ? 'active' : ''}`}>
      <h3>{name}</h3>
      <p>年龄: {age}</p>
      <p>邮箱: {email}</p>
      <span className="status">{isActive ? '在线' : '离线'}</span>
    </div>
  );
}
```

### 2. 回调函数（子组件向父组件）

子组件通过回调函数向父组件传递数据：

```jsx
// 父组件
function Parent() {
  const [message, setMessage] = useState('');
  
  const handleMessageFromChild = (data) => {
    setMessage(data);
  };
  
  return (
    <div>
      <h2>来自子组件的消息: {message}</h2>
      <ChildComponent onSendMessage={handleMessageFromChild} />
    </div>
  );
}

// 子组件
function ChildComponent({ onSendMessage }) {
  const [inputValue, setInputValue] = useState('');
  
  const handleClick = () => {
    onSendMessage(inputValue);  // 调用父组件传递的回调函数
    setInputValue('');  // 清空输入框
  };
  
  return (
    <div>
      <input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="输入消息"
      />
      <button onClick={handleClick}>发送给父组件</button>
    </div>
  );
}
```

### 3. Context API（跨层级传递）

适用于跨越多层组件的数据传递，避免props钻取：

```jsx
import React, { createContext, useContext, useState } from 'react';

// 创建Context
const UserContext = createContext();

// Provider组件
function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Alice',
    role: 'admin',
    theme: 'dark'
  });
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// 消费Context的组件
function UserProfile() {
  const { user, setUser } = useContext(UserContext);
  
  return (
    <div>
      <h2>用户信息</h2>
      <p>姓名: {user.name}</p>
      <p>角色: {user.role}</p>
      <p>主题: {user.theme}</p>
    </div>
  );
}

// 在任意层级使用
function App() {
  return (
    <UserProvider>
      <div>
        <UserProfile />
        <AnotherComponent />
      </div>
    </UserProvider>
  );
}

function AnotherComponent() {
  const { user, setUser } = useContext(UserContext);
  
  const changeTheme = () => {
    setUser(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };
  
  return <button onClick={changeTheme}>切换主题</button>;
}
```

### 4. 状态提升（多组件共享状态）

当多个组件需要共享状态时，将状态提升到最近的共同父组件：

```jsx
function Calculator() {
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');
  
  const handleCelsiusChange = (temperature) => {
    setScale('c');
    setTemperature(temperature);
  };
  
  const handleFahrenheitChange = (temperature) => {
    setScale('f');
    setTemperature(temperature);
  };
  
  const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;
  
  return (
    <div>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={handleCelsiusChange} />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={handleFahrenheitChange} />
      <BoilingVerdict
        celsius={parseFloat(celsius)} />
    </div>
  );
}

function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  const scaleName = scale === 'c' ? 'Celsius' : 'Fahrenheit';
  
  const handleChange = (e) => {
    onTemperatureChange(e.target.value);
  };
  
  return (
    <fieldset>
      <legend>Enter temperature in {scaleName}:</legend>
      <input 
        value={temperature}
        onChange={handleChange} />
    </fieldset>
  );
}
```

### 5. Refs（父组件访问子组件）

用于父组件直接访问子组件实例或DOM元素：

```jsx
import React, { useRef, forwardRef, useImperativeHandle } from 'react';

// 使用forwardRef的子组件
const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    getValue: () => {
      return inputRef.current.value;
    },
    clear: () => {
      inputRef.current.value = '';
    }
  }));
  
  return <input ref={inputRef} type="text" {...props} />;
});

// 父组件
function ParentComponent() {
  const fancyInputRef = useRef();
  
  const handleFocus = () => {
    fancyInputRef.current.focus();  // 调用子组件暴露的方法
  };
  
  const handleGetValue = () => {
    const value = fancyInputRef.current.getValue();
    alert(`输入框的值是: ${value}`);
  };
  
  const handleClear = () => {
    fancyInputRef.current.clear();
  };
  
  return (
    <div>
      <FancyInput ref={fancyInputRef} placeholder="输入一些内容" />
      <button onClick={handleFocus}>聚焦</button>
      <button onClick={handleGetValue}>获取值</button>
      <button onClick={handleClear}>清空</button>
    </div>
  );
}
```

### 6. 自定义事件（使用事件系统）

通过自定义事件机制传递数据：

```jsx
// 使用自定义事件发射器
class EventEmitter {
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

// 创建全局事件中心
const eventCenter = new EventEmitter();

// 发送数据的组件
function DataSender() {
  const sendData = () => {
    eventCenter.emit('dataTransfer', { message: 'Hello from sender!' });
  };
  
  return <button onClick={sendData}>发送数据</button>;
}

// 接收数据的组件
function DataReceiver() {
  const [receivedData, setReceivedData] = useState(null);
  
  useEffect(() => {
    const handleDataReceive = (data) => {
      setReceivedData(data);
    };
    
    eventCenter.on('dataTransfer', handleDataReceive);
    
    return () => {
      eventCenter.off('dataTransfer', handleDataReceive);
    };
  }, []);
  
  return <div>接收到的数据: {receivedData?.message}</div>;
}
```

### 7. 第三方状态管理（Redux/Zustand）

使用第三方库进行全局状态管理：

```jsx
// 使用Zustand的示例
import { create } from 'zustand';

// 创建store
const useStore = create((set, get) => ({
  count: 0,
  user: null,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setUser: (user) => set({ user }),
  reset: () => set({ count: 0, user: null }),
}));

// 在组件中使用
function Counter() {
  const { count, increment, decrement } = useStore();
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

function UserProfile() {
  const { user, setUser } = useStore();
  
  return (
    <div>
      {user ? (
        <p>用户: {user.name}</p>
      ) : (
        <button onClick={() => setUser({ name: 'Alice' })}>
          设置用户
        </button>
      )}
    </div>
  );
}
```

### 8. 组合使用场景

在实际项目中，通常会组合使用多种数据传递方式：

```jsx
// 复杂应用示例
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navigation />
          <MainContent />
          <GlobalModals />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Navigation组件通过Context获取用户信息
function Navigation() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  
  return (
    <nav className={`nav-${theme}`}>
      <UserProfile user={user} />
      <button onClick={logout}>退出</button>
    </nav>
  );
}

// UserProfile组件接收props并使用Context
function UserProfile({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  
  return (
    <div ref={dropdownRef} className="user-profile">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        {user?.name}
      </button>
      {showDropdown && (
        <UserDropdown 
          user={user}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
```

### 选择合适的数据传递方式

- **Props**: 简单的父子组件通信
- **回调函数**: 子组件向父组件传递数据
- **Context**: 跨多层级组件或全局状态
- **状态提升**: 多个组件共享状态
- **Refs**: 父组件访问子组件实例
- **第三方库**: 复杂应用的全局状态管理

正确选择数据传递方式是构建可维护React应用的关键。
