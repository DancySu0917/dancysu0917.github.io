# 解释一下 useEffect 的作用？（了解）

**题目**: 解释一下 useEffect 的作用？（了解）

### 标准答案

useEffect 是 React Hooks 中的一个重要函数，用于处理函数组件中的副作用（side effects）。副作用包括数据获取、订阅、手动修改 DOM、定时器等操作。useEffect 会在组件渲染后执行，模拟了类组件中的生命周期方法（如 componentDidMount、componentDidUpdate 和 componentWillUnmount）的功能。

useEffect 接收两个参数：第一个是副作用函数，第二个是依赖数组（可选）。当依赖数组发生变化时，副作用函数会重新执行。通过返回一个清理函数，可以处理组件卸载或依赖项变化时的清理工作。

### 深入理解

useEffect 是 React 函数组件中处理副作用的核心 Hook，它将类组件中的生命周期概念统一到了一个 API 中。

#### useEffect 的基本语法

```javascript
useEffect(didUpdate, dependencies);
```

- `didUpdate`: 副作用函数，包含需要执行的副作用操作
- `dependencies`: 依赖数组，指定当哪些变量变化时重新执行副作用函数

#### useEffect 的执行时机

1. **组件挂载后**：当组件首次渲染完成后执行
2. **依赖项变化后**：当依赖数组中的值发生变化时重新执行
3. **组件卸载前**：如果副作用函数返回清理函数，则在组件卸载前执行清理函数

#### useEffect 的不同使用模式

1. **无依赖数组**：每次渲染后都执行
```jsx
import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `计数: ${count}`;
    console.log('每次渲染后都执行');
  });

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加计数
      </button>
    </div>
  );
}
```

2. **空依赖数组**：仅在组件挂载后执行一次（相当于 componentDidMount）
```jsx
import React, { useState, useEffect } from 'react';

function Welcome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 只在组件挂载时执行一次
    fetchUserData()
      .then(data => setUser(data))
      .catch(error => console.error('获取用户数据失败:', error));
  }, []); // 空依赖数组

  const fetchUserData = async () => {
    // 模拟 API 请求
    return new Promise(resolve => {
      setTimeout(() => resolve({ name: 'John', id: 1 }), 1000);
    });
  };

  return (
    <div>
      {user ? <h1>欢迎, {user.name}!</h1> : <p>加载中...</p>}
    </div>
  );
}
```

3. **有依赖项**：当依赖项变化时执行（相当于 componentDidUpdate）
```jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 当 userId 变化时重新获取用户数据
    if (userId) {
      fetchUserById(userId)
        .then(data => setUser(data))
        .catch(error => console.error('获取用户失败:', error));
    }
  }, [userId]); // 依赖于 userId

  const fetchUserById = async (id) => {
    // 模拟根据 ID 获取用户
    return new Promise(resolve => {
      setTimeout(() => resolve({ id, name: `User${id}` }), 500);
    });
  };

  return (
    <div>
      {user ? <p>用户: {user.name}</p> : <p>加载用户信息...</p>}
    </div>
  );
}
```

#### 清理副作用

useEffect 可以返回一个清理函数，该函数在组件卸载时或依赖项变化前执行：

```jsx
import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 设置定时器
    const interval = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);

    // 返回清理函数
    return () => {
      clearInterval(interval);
      console.log('定时器已清理');
    };
  }, []); // 仅在挂载时设置定时器

  return (
    <div>
      <p>计时器: {seconds} 秒</p>
    </div>
  );
}

// 订阅示例
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 模拟订阅聊天室
    const subscription = subscribeToRoom(roomId, (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    });

    // 清理订阅
    return () => {
      subscription.unsubscribe();
      console.log('已取消订阅聊天室:', roomId);
    };
  }, [roomId]); // 当 roomId 变化时重新订阅

  const subscribeToRoom = (roomId, callback) => {
    // 模拟订阅对象
    const timer = setInterval(() => {
      if (Math.random() > 0.8) { // 随机发送消息
        callback({ id: Date.now(), text: `来自 ${roomId} 的消息`, timestamp: Date.now() });
      }
    }, 2000);

    return {
      unsubscribe: () => clearInterval(timer)
    };
  };

  return (
    <div>
      <h3>聊天室: {roomId}</h3>
      <div>
        {messages.map(msg => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>
    </div>
  );
}
```

#### 常见的 useEffect 使用场景

1. **数据获取**：
```jsx
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false; // 防止内存泄漏

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const result = await response.json();
        
        if (!isCancelled) {
          setData(result);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('数据获取失败:', error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true; // 组件卸载时设置标志
    };
  }, [userId]);

  if (loading) return <div>加载中...</div>;
  return <div>{data && JSON.stringify(data)}</div>;
}
```

2. **DOM 操作**：
```jsx
function FocusInput() {
  const inputRef = useRef();

  useEffect(() => {
    // 组件挂载后聚焦到输入框
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} type="text" placeholder="自动聚焦" />;
}
```

3. **事件监听器**：
```jsx
function WindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      窗口尺寸: {windowSize.width} x {windowSize.height}
    </div>
  );
}
```

#### useEffect 的注意事项

1. **避免无限循环**：确保依赖数组正确，避免依赖项在副作用中被修改
2. **避免内存泄漏**：在清理函数中取消订阅、清除定时器等
3. **函数依赖**：如果副作用函数使用了组件内部的函数，应将其加入依赖数组
4. **对象和数组依赖**：注意对象和数组的引用变化，可能导致不必要的重执行

useEffect 是 React 函数组件中处理副作用的关键工具，正确使用它可以有效管理组件的生命周期和副作用操作。
