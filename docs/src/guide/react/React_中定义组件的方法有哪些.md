# React 中定义组件的方法有哪些？（必会）

**题目**: React 中定义组件的方法有哪些？（必会）

## 标准答案

React 中定义组件主要有两种方法：函数组件和类组件。函数组件是现代 React 开发的主流方式，通过函数定义并使用 Hooks 管理状态和副作用；类组件使用 ES6 类语法，通过生命周期方法和 this.state 管理状态。此外，还有 React.memo、forwardRef、memo 等高阶组件定义方式。

## 深入理解

### 1. 函数组件（Function Components）

函数组件是现代 React 开发中最推荐的方式，简洁且功能强大：

```jsx
// 基础函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// 箭头函数组件
const Greeting = (props) => {
  return <div>Hello, {props.name}!</div>;
};

// 使用解构赋值
const UserCard = ({ name, email, avatar }) => {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};
```

### 2. 函数组件 + Hooks

使用 Hooks 可以在函数组件中管理状态和副作用：

```jsx
import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

// 使用多个状态
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 3. 类组件（Class Components）

类组件是 React 早期的主要组件定义方式：

```jsx
import React, { Component } from 'react';

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
    // 绑定事件处理器
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }
  
  render() {
    return (
      <div>
        <h1>Hello, {this.props.name}!</h1>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Increment</button>
      </div>
    );
  }
}

// 使用类字段语法（不需要绑定）
class Timer extends Component {
  state = {
    seconds: 0
  };
  
  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(prevState => ({
        seconds: prevState.seconds + 1
      }));
    }, 1000);
  }
  
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  
  render() {
    return (
      <div>
        Timer: {this.state.seconds} seconds
      </div>
    );
  }
}
```

### 4. 高阶组件（Higher-Order Components）

高阶组件是接收组件并返回新组件的函数：

```jsx
// 基础 HOC
function withLogger(WrappedComponent) {
  return class extends Component {
    componentDidMount() {
      console.log('Component mounted:', WrappedComponent.name);
    }
    
    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

// 使用 HOC
const EnhancedWelcome = withLogger(Welcome);

// 属性代理模式的 HOC
function withAuth(WrappedComponent) {
  return function AuthComponent(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
      // 检查认证状态
      checkAuth().then(setIsAuthenticated);
    }, []);
    
    if (!isAuthenticated) {
      return <div>Please log in</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
}
```

### 5. 自定义 Hook

自定义 Hook 封装和复用组件逻辑：

```jsx
// 自定义 Hook：管理本地存储
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// 使用自定义 Hook
function MyComponent() {
  const [name, setName] = useLocalStorage('name', '');
  
  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter your name"
    />
  );
}

// 自定义 Hook：处理 API 请求
function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
}
```

### 6. React.memo 优化组件

React.memo 是一个高阶组件，用于优化函数组件的渲染：

```jsx
// 基础使用
const ExpensiveComponent = React.memo(({ items }) => {
  console.log('ExpensiveComponent rendered');
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// 自定义比较函数
const CustomMemoComponent = React.memo(({ user, theme }) => {
  return (
    <div className={theme}>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // 只比较关键属性
  return prevProps.user.id === nextProps.user.id && 
         prevProps.theme === nextProps.theme;
});
```

### 7. forwardRef 组件

forwardRef 允许组件转发 ref 到其子组件：

```jsx
// 转发 ref 到 DOM 元素
const FancyInput = React.forwardRef((props, ref) => {
  return (
    <input
      ref={ref}
      className="fancy-input"
      {...props}
    />
  );
});

// 使用
function Parent() {
  const inputRef = useRef();
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <div>
      <FancyInput ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}

// 转发 ref 到类组件
const CustomButton = React.forwardRef((props, ref) => {
  return (
    <button
      ref={ref}
      className="custom-button"
      {...props}
    >
      {props.children}
    </button>
  );
});
```

### 8. Fragment 组件

Fragment 允许返回多个元素而不需要额外的 DOM 包装：

```jsx
import React, { Fragment } from 'react';

// 使用 Fragment 标签
function List() {
  return (
    <Fragment>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </Fragment>
  );
}

// 使用简写语法
function TableRows() {
  return (
    <>
      <tr><td>Cell 1</td></tr>
      <tr><td>Cell 2</td></tr>
    </>
  );
}
```

### 9. Context 组件

Context 提供了一种在组件树中传递数据的方式：

```jsx
// 创建 Context
const ThemeContext = React.createContext();

// Provider 组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer 组件
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button
      className={`btn-${theme}`}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Toggle Theme
    </button>
  );
}
```

### 10. 组件定义方式的选择

**推荐使用函数组件 + Hooks**，因为：
- 代码更简洁、易读
- 更好的逻辑复用（自定义 Hooks）
- 更小的打包体积
- React 团队的推荐方向

**类组件仍适用的场景**：
- 需要使用旧的生命周期方法
- 项目仍在迁移过程中
- 某些复杂的逻辑难以用 Hooks 表达

**高阶组件和 Render Props**：
- 当需要逻辑复用但不适合用 Hooks 时
- 为了向后兼容

总的来说，现代 React 开发主要使用函数组件配合 Hooks，这种方式提供了更好的开发体验和性能优化。
