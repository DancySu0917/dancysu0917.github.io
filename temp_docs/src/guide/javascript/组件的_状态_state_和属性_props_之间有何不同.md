# (组件的)状态(state)和属性(props)之间有何不同？（必会）

**题目**: (组件的)状态(state)和属性(props)之间有何不同？（必会）

## 标准答案

State（状态）是组件内部的可变数据，只能在组件内部修改，用于管理组件的动态数据。Props（属性）是组件的输入参数，从父组件传递到子组件，具有只读特性，子组件不能直接修改 props。State 是组件的"私有"数据，而 Props 是组件与其他组件通信的接口。

## 深入理解

### 1. State（状态）的特点

State 是组件内部管理的数据，具有以下特点：

```jsx
// 类组件中的 state
class Counter extends React.Component {
  constructor(props) {
    super(props);
    // 初始化状态
    this.state = {
      count: 0,
      name: 'React'
    };
  }
  
  increment = () => {
    // 通过 setState 修改状态
    this.setState({ count: this.state.count + 1 });
  }
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <p>Name: {this.state.name}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}

// 函数组件中使用 useState Hook
import React, { useState } from 'react';

function Counter() {
  // 返回状态值和更新函数
  const [count, setCount] = useState(0);
  const [name, setName] = useState('React');
  
  const increment = () => {
    // 更新状态
    setCount(count + 1);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

### 2. Props（属性）的特点

Props 是从父组件传递给子组件的数据，具有以下特点：

```jsx
// 父组件
function App() {
  return (
    <div>
      {/* 传递 props 给子组件 */}
      <UserCard 
        name="Alice" 
        email="alice@example.com" 
        age={25} 
        isActive={true}
      />
      <UserCard 
        name="Bob" 
        email="bob@example.com" 
        age={30} 
        isActive={false}
      />
    </div>
  );
}

// 子组件接收 props
function UserCard(props) {
  return (
    <div className={`user-card ${props.isActive ? 'active' : 'inactive'}`}>
      <h3>{props.name}</h3>
      <p>Email: {props.email}</p>
      <p>Age: {props.age}</p>
      <span className="status">
        {props.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}

// 使用解构语法接收 props
function Greeting({ name, greeting = 'Hello' }) {
  return <h1>{greeting}, {name}!</h1>;
}
```

### 3. 主要区别对比

| 特性 | State | Props |
|------|-------|-------|
| **数据来源** | 组件内部定义和管理 | 从父组件传递而来 |
| **可变性** | 可变，通过 setState 或状态更新函数修改 | 不可变（只读），子组件不能直接修改 |
| **作用域** | 组件内部私有 | 组件间通信的接口 |
| **更新机制** | 状态变化触发组件重新渲染 | props 变化触发子组件重新渲染 |
| **初始化** | 在组件内部初始化 | 在使用组件时提供 |

### 4. State 的详细说明

**类组件中的 state：**
```jsx
class UserProfile extends React.Component {
  state = {
    user: {
      name: '',
      email: ''
    },
    loading: true,
    error: null
  };
  
  componentDidMount() {
    this.fetchUserData();
  }
  
  fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      this.setState({
        user: userData,
        loading: false
      });
    } catch (error) {
      this.setState({
        error: error.message,
        loading: false
      });
    }
  }
  
  // 更新嵌套状态
  updateUserName = (newName) => {
    this.setState(prevState => ({
      user: {
        ...prevState.user,
        name: newName
      }
    }));
  }
  
  render() {
    const { user, loading, error } = this.state;
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <button onClick={() => this.updateUserName('New Name')}>
          Update Name
        </button>
      </div>
    );
  }
}
```

**函数组件中的 state（使用 Hooks）：**
```jsx
import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 更新嵌套状态
  const updateUserName = (newName) => {
    setUser(prevUser => ({
      ...prevUser,
      name: newName
    }));
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => updateUserName('New Name')}>
        Update Name
      </button>
    </div>
  );
}
```

### 5. Props 的详细说明

**Props 的传递：**
```jsx
// 父组件
function App() {
  const [theme, setTheme] = useState('light');
  const user = { name: 'Alice', role: 'admin' };
  
  return (
    <div>
      {/* 传递基本类型 */}
      <Header title="My App" version={1.0} />
      
      {/* 传递对象 */}
      <UserProfile user={user} />
      
      {/* 传递函数 */}
      <ThemeButton 
        theme={theme} 
        onThemeChange={setTheme} 
      />
      
      {/* 传递数组 */}
      <ItemList items={['apple', 'banana', 'orange']} />
      
      {/* 传递 JSX 元素 */}
      <Modal 
        title={<h2>Custom Title</h2>}
        children={<p>Modal content</p>}
      />
    </div>
  );
}

// 接收各种类型的 props
function Header({ title, version }) {
  return (
    <header>
      <h1>{title} v{version}</h1>
    </header>
  );
}

function ThemeButton({ theme, onThemeChange }) {
  return (
    <button onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}>
      Switch to {theme === 'light' ? 'dark' : 'light'} theme
    </button>
  );
}
```

**Props 验证：**
```jsx
import PropTypes from 'prop-types';

function UserCard({ name, email, age, isActive }) {
  return (
    <div className={`user-card ${isActive ? 'active' : 'inactive'}`}>
      <h3>{name}</h3>
      <p>{email}</p>
      <p>Age: {age}</p>
    </div>
  );
}

// 定义 props 类型
UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  age: PropTypes.number,
  isActive: PropTypes.bool
};

// 定义默认 props
UserCard.defaultProps = {
  age: 0,
  isActive: false
};

// 使用 TypeScript 的类型定义
interface UserCardProps {
  name: string;
  email: string;
  age?: number;
  isActive?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ name, email, age = 0, isActive = false }) => {
  return (
    <div className={`user-card ${isActive ? 'active' : 'inactive'}`}>
      <h3>{name}</h3>
      <p>{email}</p>
      <p>Age: {age}</p>
    </div>
  );
};
```

### 6. State 与 Props 的交互

**通过回调函数从子组件向父组件传递数据：**
```jsx
// 父组件
function Parent() {
  const [count, setCount] = useState(0);
  
  // 回调函数，传递给子组件
  const handleIncrement = () => {
    setCount(count + 1);
  };
  
  return (
    <div>
      <p>Parent Count: {count}</p>
      {/* 将回调函数作为 props 传递给子组件 */}
      <Child onIncrement={handleIncrement} />
    </div>
  );
}

// 子组件
function Child({ onIncrement }) {
  return (
    <div>
      <p>This is the child component</p>
      {/* 调用父组件传递的回调函数 */}
      <button onClick={onIncrement}>Increment in Child</button>
    </div>
  );
}
```

**状态提升（State Lifting）：**
```jsx
// 当多个组件需要共享状态时，将状态提升到最近的共同父组件
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
  
  const celsius = scale === 'f' ? 
    tryConvert(temperature, toCelsius) : 
    temperature;
  const fahrenheit = scale === 'c' ? 
    tryConvert(temperature, toFahrenheit) : 
    temperature;
  
  return (
    <div>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={handleCelsiusChange}
      />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={handleFahrenheitChange}
      />
      <BoilingVerdict celsius={parseFloat(celsius)} />
    </div>
  );
}

function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  const scaleName = scale === 'c' ? 'Celsius' : 'Fahrenheit';
  
  return (
    <fieldset>
      <legend>Enter temperature in {scaleName}:</legend>
      <input
        value={temperature}
        onChange={(e) => onTemperatureChange(e.target.value)}
      />
    </fieldset>
  );
}
```

### 7. 性能考虑

**Props 变化导致的重新渲染：**
```jsx
// 问题：每次父组件渲染时，都会创建新的函数
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment: {count}</button>
      {/* 每次渲染都会创建新的函数，导致子组件不必要的重渲染 */}
      <Child onButtonClick={() => console.log('Button clicked')} />
    </div>
  );
}

// 解决方案1：使用 useCallback
function Parent() {
  const [count, setCount] = useState(0);
  
  // 使用 useCallback 缓存函数
  const handleButtonClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // 空依赖数组，函数不会重新创建
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment: {count}</button>
      <Child onButtonClick={handleButtonClick} />
    </div>
  );
}

// 解决方案2：使用 useMemo 优化复杂对象
function Parent() {
  const [count, setCount] = useState(0);
  
  // 使用 useMemo 缓存复杂对象
  const complexData = useMemo(() => {
    return expensiveCalculation(count);
  }, [count]);
  
  return (
    <div>
      <Child data={complexData} />
    </div>
  );
}
```

### 8. 最佳实践

**State 管理最佳实践：**
1. 将状态放在需要它的组件层级的最低位置
2. 避免冗余状态，确保状态是必要的
3. 使用不可变更新模式
4. 对于复杂状态，考虑使用 useReducer

```jsx
// 使用 useReducer 管理复杂状态
const initialState = {
  count: 0,
  step: 1,
  name: ''
};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'setName':
      return { ...state, name: action.payload };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Step: {state.step}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <input 
        type="number" 
        value={state.step}
        onChange={(e) => dispatch({ type: 'setStep', payload: Number(e.target.value) })}
      />
    </div>
  );
}
```

**Props 使用最佳实践：**
1. 明确组件的接口，使用 PropTypes 或 TypeScript
2. 保持 props 简洁，避免传递过多属性
3. 使用默认值处理可选 props
4. 合理使用解构赋值

State 和 Props 是 React 组件系统的核心概念，正确理解它们的区别和用法对于构建可维护的 React 应用至关重要。State 用于管理组件内部的数据，而 Props 用于组件间的数据传递和通信。
