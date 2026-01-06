# React 性能优化的方案？（高薪常问）

**题目**: React 性能优化的方案？（高薪常问）

### 标准答案

React 性能优化的主要方案包括：

1. **组件层面优化**：
   - 使用 React.memo 防止不必要的重新渲染
   - 使用 useCallback 缓存函数引用
   - 使用 useMemo 缓存计算结果
   - 合理使用 shouldComponentUpdate 或 PureComponent

2. **状态管理优化**：
   - 避免在渲染期间创建新对象或数组
   - 合理拆分状态，避免不必要的状态更新
   - 使用 useReducer 处理复杂状态逻辑

3. **渲染优化**：
   - 虚拟化长列表（使用 react-window 等库）
   - 代码分割和懒加载（React.lazy 和 Suspense）
   - 避免在 JSX 中使用内联对象和函数

4. **架构层面优化**：
   - 合理使用 Context，避免 Context 导致的不必要渲染
   - 使用性能分析工具（React DevTools Profiler）
   - 服务端渲染（SSR）或静态生成（SSG）

### 深入理解

React 性能优化涉及多个层面，从组件设计到架构选择都需要考虑性能因素。

#### 1. React.memo 组件记忆化

React.memo 是一个高阶组件，用于记忆化函数组件，当 props 没有变化时跳过重新渲染：

```jsx
import React, { memo, useState } from 'react';

// 使用 React.memo 包装的组件
const MemoizedComponent = memo(({ data, onUpdate }) => {
  console.log('MemoizedComponent 渲染');
  
  return (
    <div>
      <p>数据: {data}</p>
      <button onClick={onUpdate}>更新</button>
    </div>
  );
});

// 不使用 memo 的组件
const RegularComponent = ({ data, onUpdate }) => {
  console.log('RegularComponent 渲染');
  
  return (
    <div>
      <p>数据: {data}</p>
      <button onClick={onUpdate}>更新</button>
    </div>
  );
};

function MemoExample() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  const handleUpdate = () => {
    setCount(c => c + 1);
  };

  return (
    <div>
      <h3>计数: {count}</h3>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="输入文本"
      />
      
      <h4>使用 memo 的组件</h4>
      <MemoizedComponent data={count} onUpdate={handleUpdate} />
      
      <h4>普通组件</h4>
      <RegularComponent data={count} onUpdate={handleUpdate} />
    </div>
  );
}
```

还可以自定义比较函数：

```jsx
const CustomMemoComponent = memo(
  ({ user }) => {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // 自定义比较逻辑
    return prevProps.user.id === nextProps.user.id && 
           prevProps.user.name === nextProps.user.name;
  }
);
```

#### 2. useCallback 缓存函数

useCallback 用于缓存函数引用，防止子组件因函数引用变化而重新渲染：

```jsx
import React, { useState, useCallback, memo } from 'react';

const ChildComponent = memo(({ onClick, data }) => {
  console.log('ChildComponent 渲染');
  return (
    <div>
      <p>数据: {data}</p>
      <button onClick={onClick}>点击</button>
    </div>
  );
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 使用 useCallback 缓存函数
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 空依赖数组，函数引用永远不变

  // 有依赖的 useCallback
  const handleTextUpdate = useCallback((newText) => {
    setText(newText);
  }, []);

  return (
    <div>
      <input 
        value={text} 
        onChange={(e) => handleTextUpdate(e.target.value)} 
      />
      <ChildComponent onClick={handleClick} data={count} />
    </div>
  );
}
```

#### 3. useMemo 缓存计算结果

useMemo 用于缓存昂贵的计算结果：

```jsx
import React, { useState, useMemo } from 'react';

function ExpensiveComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 昂贵的计算，使用 useMemo 缓存结果
  const expensiveValue = useMemo(() => {
    console.log('执行昂贵计算');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += i;
    }
    return result + count; // 依赖 count
  }, [count]); // 只有 count 变化时才重新计算

  return (
    <div>
      <p>昂贵计算结果: {expensiveValue}</p>
      <p>计数: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
      />
    </div>
  );
}
```

#### 4. 虚拟化长列表

对于长列表，使用虚拟化技术只渲染可见部分：

```jsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';

const Item = ({ index, style }) => (
  <div style={style}>
    项目 {index}
  </div>
);

const VirtualizedList = ({ itemCount }) => (
  <List
    height={400} // 容器高度
    itemCount={itemCount} // 项目总数
    itemSize={50} // 每个项目高度
    width="100%" // 容器宽度
  >
    {Item}
  </List>
);
```

#### 5. 代码分割和懒加载

使用 React.lazy 和 Suspense 实现代码分割：

```jsx
import React, { lazy, Suspense } from 'react';

// 懒加载组件
const LazyComponent = lazy(() => import('./LazyComponent'));
const AnotherLazyComponent = lazy(() => import('./AnotherLazyComponent'));

function App() {
  return (
    <div>
      <h1>主应用</h1>
      
      <Suspense fallback={<div>加载中...</div>}>
        <LazyComponent />
      </Suspense>
      
      <Suspense fallback={<div>加载中...</div>}>
        <AnotherLazyComponent />
      </Suspense>
    </div>
  );
}

// 带加载状态和错误处理的懒加载
function withSuspense(WrappedComponent) {
  return function LazyComponent(props) {
    return (
      <Suspense 
        fallback={
          <div className="loading-state">
            <Spinner />
          </div>
        }
      >
        <WrappedComponent {...props} />
      </Suspense>
    );
  };
}
```

#### 6. Context 优化

避免 Context 导致的不必要渲染：

```jsx
import React, { createContext, useContext, useState, useMemo } from 'react';

// 将 Context 拆分为多个，避免不必要的更新
const CountContext = createContext();
const ThemeContext = createContext();

// 优化的 Context Provider
function AppProvider({ children }) {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  // 分别提供不同的 Context 值
  const countValue = useMemo(() => ({
    count,
    setCount
  }), [count]);

  const themeValue = useMemo(() => ({
    theme,
    setTheme
  }), [theme]);

  const userValue = useMemo(() => ({
    user,
    setUser
  }), [user]);

  return (
    <CountContext.Provider value={countValue}>
      <ThemeContext.Provider value={themeValue}>
        {children}
      </ThemeContext.Provider>
    </CountContext.Provider>
  );
}

// 只订阅需要的 Context
function CountComponent() {
  const { count, setCount } = useContext(CountContext);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

#### 7. 避免不必要的渲染

在 JSX 中避免创建新对象：

```jsx
// 错误做法：每次渲染都创建新对象
function BadComponent({ items }) {
  return (
    <div>
      {items.map(item => (
        <ChildComponent 
          key={item.id}
          style={{ color: 'red', fontSize: '14px' }} // 每次都是新对象
          onClick={() => console.log(item.id)} // 每次都是新函数
        />
      ))}
    </div>
  );
}

// 正确做法：预定义对象和函数
function GoodComponent({ items }) {
  // 使用 useMemo 缓存样式对象
  const defaultStyle = useMemo(() => ({
    color: 'red',
    fontSize: '14px'
  }), []);

  // 使用 useCallback 缓存函数
  const handleClick = useCallback((itemId) => {
    return () => console.log(itemId);
  }, []);

  return (
    <div>
      {items.map(item => (
        <ChildComponent 
          key={item.id}
          style={defaultStyle}
          onClick={handleClick(item.id)}
        />
      ))}
    </div>
  );
}
```

#### 8. 性能监控和分析

使用 React DevTools Profiler 进行性能分析：

```jsx
// 自定义性能监控 Hook
import { useEffect, useRef } from 'react';

function usePerformanceMonitor(componentName) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} 渲染次数: ${renderCount.current}`);
    
    // 记录渲染时间
    const renderTime = Date.now() - startTime.current;
    if (renderTime > 16) { // 超过一帧的时间（60fps）
      console.warn(`${componentName} 渲染时间过长: ${renderTime}ms`);
    }
    
    startTime.current = Date.now();
  });
}

// 在组件中使用
function MonitoredComponent() {
  usePerformanceMonitor('MonitoredComponent');
  
  return <div>监控组件</div>;
}
```

#### 9. 服务端渲染优化

对于首屏性能，使用 SSR 或 SSG：

```jsx
// Next.js 示例
import { useState, useEffect } from 'react';

export async function getServerSideProps() {
  // 服务端获取数据
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();

  return {
    props: {
      serverData: data,
    },
  };
}

export default function SSRComponent({ serverData }) {
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    // 客户端获取额外数据
    fetch('/api/client-data')
      .then(res => res.json())
      .then(setClientData);
  }, []);

  return (
    <div>
      <h1>服务端数据: {serverData.title}</h1>
      <h2>客户端数据: {clientData?.title || '加载中...'}</h2>
    </div>
  );
}
```

通过这些优化策略的综合运用，可以显著提升 React 应用的性能表现，改善用户体验。
</toolcall_result>

