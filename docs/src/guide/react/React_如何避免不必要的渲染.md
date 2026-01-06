# React 如何避免不必要的渲染？（了解）

**题目**: React 如何避免不必要的渲染？（了解）

## 答案

在React中，避免不必要的渲染是提升应用性能的关键。以下是几种主要的优化策略：

### 1. React.memo() 高阶组件

React.memo() 是一个高阶组件，用于优化函数组件的渲染。它会缓存组件的渲染结果，当下次传入的props与上次相同时，会跳过渲染过程。

```jsx
import React, { memo } from 'react';

// 使用 React.memo 包装组件
const MyComponent = memo(({ name, age }) => {
  console.log('MyComponent rendered');
  
  return (
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
    </div>
  );
});

// 默认浅比较，也可以自定义比较函数
const MyComponentWithCustomComparison = memo(({ user, config }) => {
  return <div>{user.name}</div>;
}, (prevProps, nextProps) => {
  // 返回 true 表示相同，不需要重新渲染
  // 返回 false 表示不同，需要重新渲染
  return prevProps.user.id === nextProps.user.id && 
         prevProps.config.theme === nextProps.config.theme;
});
```

### 2. PureComponent

对于类组件，可以继承自 PureComponent，它会自动实现浅比较来避免不必要的渲染。

```jsx
import React, { PureComponent } from 'react';

class MyPureComponent extends PureComponent {
  render() {
    console.log('MyPureComponent rendered');
    
    return (
      <div>
        <h1>{this.props.name}</h1>
        <p>{this.props.age}</p>
      </div>
    );
  }
}

// 等同于在 shouldComponentUpdate 中进行浅比较
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // 浅比较 props 和 state
    return !shallowEqual(this.props, nextProps) || 
           !shallowEqual(this.state, nextState);
  }
  
  render() {
    return (
      <div>
        <h1>{this.props.name}</h1>
        <p>{this.props.age}</p>
      </div>
    );
  }
}
```

### 3. useCallback Hook

useCallback 用于缓存函数，防止因函数引用变化导致的子组件不必要的重新渲染。

```jsx
import React, { useState, useCallback, memo } from 'react';

const ChildComponent = memo(({ onClick, data }) => {
  console.log('ChildComponent rendered');
  return (
    <div>
      <button onClick={onClick}>Click me</button>
      <p>{data}</p>
    </div>
  );
});

const ParentComponent = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('React');

  // 使用 useCallback 缓存函数
  const handleClick = useCallback(() => {
    setCount(count + 1);
  }, [count]); // 依赖项变化时才重新创建函数

  // 如果不使用 useCallback，每次渲染都会创建新函数
  // const handleClick = () => setCount(count + 1); // 这会导致子组件不必要的渲染

  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <button onClick={() => setName('Updated React')}>Update Name</button>
      <ChildComponent onClick={handleClick} data={name} />
    </div>
  );
};
```

### 4. useMemo Hook

useMemo 用于缓存计算结果，避免在每次渲染时都执行昂贵的计算。

```jsx
import React, { useState, useMemo } from 'react';

const ExpensiveComponent = ({ items, filter }) => {
  // 使用 useMemo 缓存计算结果
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]); // 只有当 items 或 filter 变化时才重新计算

  // 避免每次渲染都创建新数组
  const expensiveValue = useMemo(() => {
    // 模拟昂贵的计算
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  return (
    <div>
      <h2>Filtered Items Count: {filteredItems.length}</h2>
      <h3>Total Value: {expensiveValue}</h3>
      {filteredItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### 5. 避免在渲染中创建对象和数组

在组件渲染过程中创建新的对象或数组会导致不必要的重新渲染：

```jsx
import React, { memo } from 'react';

// ❌ 错误做法 - 每次渲染都创建新对象
const BadComponent = ({ userId }) => {
  // 每次渲染都创建新对象，导致子组件不必要的重新渲染
  return <ChildComponent config={{ theme: 'dark', lang: 'zh' }} userId={userId} />;
};

// ✅ 正确做法 - 使用 useMemo 或将对象定义在组件外部
const GoodComponent = ({ userId }) => {
  const config = useMemo(() => ({
    theme: 'dark',
    lang: 'zh'
  }), []); // 空依赖数组确保对象只创建一次

  return <ChildComponent config={config} userId={userId} />;
};

// 或者将静态配置定义在组件外部
const staticConfig = { theme: 'dark', lang: 'zh' };

const BetterComponent = ({ userId }) => {
  return <ChildComponent config={staticConfig} userId={userId} />;
};
```

### 6. 合理使用状态拆分

将不相关的状态拆分到不同的状态变量中，避免不必要的重新渲染：

```jsx
import React, { useState } from 'react';

// ❌ 状态耦合可能导致不必要的渲染
const BadExample = () => {
  const [state, setState] = useState({
    user: { name: '', email: '' },
    theme: 'light',
    loading: false
  });

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  // 即使只是改变 theme，user 数据也会导致相关组件重新渲染
  return (
    <div>
      <UserProfile user={state.user} />
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

// ✅ 状态分离，减少不必要的渲染
const GoodExample = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 改变 theme 不会影响 UserProfile 组件的渲染
  return (
    <div>
      <UserProfile user={user} />
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

### 7. 使用 React.lazy 和 Suspense 进行代码分割

通过代码分割，只加载当前需要的组件，减少不必要的渲染：

```jsx
import React, { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

const App = () => {
  return (
    <div>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
};
```

### 8. 使用 Fragment 减少不必要的 DOM 节点

使用 React.Fragment 或简写语法 <> </> 来避免创建不必要的 DOM 包装元素：

```jsx
// ❌ 创建了不必要的 div 包装元素
const BadComponent = () => {
  return (
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  );
};

// ✅ 使用 Fragment 避免额外的 DOM 节点
const GoodComponent = () => {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  );
};
```

### 9. 条件渲染优化

合理使用条件渲染，避免不必要的组件渲染：

```jsx
import React, { useState } from 'react';

const ConditionalComponent = ({ showDetails }) => {
  const [data, setData] = useState(null);

  // ❌ 即使不显示，组件也会被创建
  return (
    <div>
      {showDetails && <ExpensiveDetailComponent data={data} />}
    </div>
  );
};

// ✅ 使用函数式条件渲染，避免不必要的创建
const OptimizedComponent = ({ showDetails }) => {
  const [data, setData] = useState(null);

  return (
    <div>
      {showDetails ? <ExpensiveDetailComponent data={data} /> : null}
    </div>
  );
};
```

### 10. 使用 Profiler 进行性能分析

React Profiler API 可以帮助识别渲染性能问题：

```jsx
import React, { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  console.log({
    id,
    phase, // 'mount' 或 'update'
    actualDuration, // 本次更新实际渲染耗时
    baseDuration, // 预估的渲染耗时
    startTime,
    commitTime
  });
};

const App = () => {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <div>
        <Header />
        <MainContent />
      </div>
    </Profiler>
  );
};
```

### 总结

避免不必要的渲染是 React 性能优化的核心策略之一。通过合理使用 React.memo、useCallback、useMemo、状态拆分等技术，可以显著提升应用性能。但需要注意的是，过度优化也可能带来复杂性，应该根据实际性能瓶颈进行针对性优化。
