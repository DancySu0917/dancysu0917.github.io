# React 生命周期函数有哪些？（必会）

**题目**: React 生命周期函数有哪些？（必会）

## 标准答案

React生命周期函数分为三个阶段：挂载阶段（Mounting）、更新阶段（Updating）和卸载阶段（Unmounting）。在React 16.3+版本中，部分生命周期函数被标记为不安全并引入了新的生命周期。函数组件使用Hooks替代传统生命周期。

## 深入理解

### 类组件生命周期函数详解

#### 1. 挂载阶段（Mounting）

组件实例被创建并插入到DOM中：

```jsx
class Component extends React.Component {
  // 1. 构造函数
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    console.log('1. Constructor - 组件初始化');
  }

  // 2. 静态方法：计算初始状态
  static getDerivedStateFromProps(props, state) {
    console.log('2. getDerivedStateFromProps - 根据props更新state');
    // 返回null或要更新的状态对象
    return null;
  }

  // 3. 渲染前调用
  render() {
    console.log('3. Render - 渲染组件');
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          增加
        </button>
      </div>
    );
  }

  // 4. 组件挂载完成后调用（仅执行一次）
  componentDidMount() {
    console.log('4. componentDidMount - 组件已挂载到DOM');
    // 适合进行API调用、设置订阅等
    // DOM操作、网络请求、定时器设置
  }
}
```

#### 2. 更新阶段（Updating）

组件状态或属性发生变化时触发：

```jsx
class UpdateComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0, name: 'React' };
  }

  // 在组件接收到新props或state前调用
  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('getDerivedStateFromProps - 更新前获取派生状态');
    return null;
  }

  // 决定组件是否需要重新渲染（性能优化）
  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate - 判断是否需要更新');
    // 返回true则更新，返回false则跳过更新
    return true;
  }

  // 渲染前调用，获取更新前的DOM快照
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('getSnapshotBeforeUpdate - 获取更新前快照');
    // 通常用于获取滚动位置等信息
    return null;
  }

  // 组件更新完成后调用
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate - 组件更新完成');
    // 适合进行更新后的DOM操作
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <p>Name: {this.state.name}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          增加
        </button>
      </div>
    );
  }
}
```

#### 3. 卸载阶段（Unmounting）

组件从DOM中移除时调用：

```jsx
class UnmountComponent extends React.Component {
  componentDidMount() {
    // 设置定时器或订阅
    this.timer = setInterval(() => {
      console.log('Timer running...');
    }, 1000);

    // 设置事件监听器
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    console.log('Window resized');
  }

  // 组件卸载前调用，清理工作
  componentWillUnmount() {
    console.log('componentWillUnmount - 组件即将卸载');
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize);
    
    // 取消订阅
    // 取消网络请求
  }

  render() {
    return <div>Unmount Component</div>;
  }
}
```

### 已废弃的生命周期函数

以下生命周期函数在React 16.3+版本中被标记为不安全，在React 17+中被移除：

```jsx
class LegacyComponent extends React.Component {
  // 旧的挂载生命周期（已废弃）
  componentWillMount() {
    // 不推荐使用
  }

  // 旧的更新生命周期（已废弃）
  componentWillReceiveProps(nextProps) {
    // 不推荐使用
  }

  componentWillUpdate(nextProps, nextState) {
    // 不推荐使用
  }
}
```

### 函数组件中的生命周期替代方案（Hooks）

函数组件使用Hooks来模拟生命周期行为：

```jsx
import React, { useState, useEffect } from 'react';

function FunctionalComponent({ name }) {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate
  useEffect(() => {
    console.log('组件挂载或更新后执行');
    document.title = `Count: ${count}`;
  });

  // 相当于 componentDidMount（只执行一次）
  useEffect(() => {
    console.log('组件挂载后执行一次');
    
    // 相当于 componentWillUnmount
    return () => {
      console.log('组件卸载前清理');
      // 清理定时器、取消订阅等
    };
  }, []); // 空依赖数组表示只在挂载时执行

  // 相当于 componentDidUpdate（仅在name变化时执行）
  useEffect(() => {
    console.log('name变化时执行', name);
  }, [name]); // 依赖name，仅在name变化时执行

  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

### 生命周期执行顺序示例

```jsx
class LifecycleDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    console.log('Constructor');
  }

  static getDerivedStateFromProps(props, state) {
    console.log('getDerivedStateFromProps');
    return null;
  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate');
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('getSnapshotBeforeUpdate');
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate');
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
  }

  render() {
    console.log('Render');
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          增加
        </button>
      </div>
    );
  }
}
```

### 实际应用场景

#### 1. 数据获取
```jsx
class DataFetchingComponent extends React.Component {
  state = { data: null, loading: true };

  async componentDidMount() {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      this.setState({ data, loading: false });
    } catch (error) {
      console.error('Error fetching data:', error);
      this.setState({ loading: false });
    }
  }

  render() {
    if (this.state.loading) return <div>Loading...</div>;
    return <div>{JSON.stringify(this.state.data)}</div>;
  }
}
```

#### 2. 性能优化
```jsx
class OptimizedComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // 只有在关键属性变化时才重新渲染
    return nextProps.value !== this.props.value || 
           nextState.data !== this.state.data;
  }

  render() {
    return <div>{this.props.value}</div>;
  }
}
```

### 错误边界生命周期

React 16+引入了错误处理生命周期：

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // 捕获子组件错误
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // 记录错误信息
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### 生命周期最佳实践

1. **避免在render中执行副作用**：render函数应该是纯函数
2. **在componentDidMount中执行副作用**：如数据获取、订阅设置
3. **在componentWillUnmount中清理资源**：避免内存泄漏
4. **谨慎使用getDerivedStateFromProps**：只在需要根据props更新state时使用
5. **优先使用函数组件和Hooks**：更现代、更简洁的写法

React生命周期函数是理解组件行为的关键，正确使用它们可以提高应用性能和用户体验。
