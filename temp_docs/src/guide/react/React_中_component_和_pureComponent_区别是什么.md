# React 中 component 和 pureComponent 区别是什么？（必会）

**题目**: React 中 component 和 pureComponent 区别是什么？（必会）

## 标准答案

React.Component 和 React.PureComponent 的主要区别在于性能优化策略：

1. **默认比较策略**：
   - React.Component：默认每次状态或props改变时都重新渲染
   - React.PureComponent：浅比较props和state，仅在发生改变时重新渲染

2. **shouldComponentUpdate**：
   - React.Component：默认返回true，始终重新渲染
   - React.PureComponent：实现了浅比较逻辑的shouldComponentUpdate

3. **性能表现**：
   - React.Component：没有内置性能优化
   - React.PureComponent：通过避免不必要的渲染提升性能

## 深入理解

### React.Component 基础

React.Component 是React中最基本的组件类，它提供了一套完整的生命周期方法：

```jsx
import React, { Component } from 'react';

class RegularComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    console.log('RegularComponent render called');
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <p>Prop value: {this.props.value}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}
```

### React.PureComponent 特性

React.PureComponent 与 Component 类似，但内置了性能优化：

```jsx
import React, { PureComponent } from 'react';

class PureExampleComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    console.log('PureExampleComponent render called');
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <p>Prop value: {this.props.value}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}
```

### 浅比较机制详解

PureComponent 使用浅比较来判断props和state是否改变：

```jsx
// 浅比较示例
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || 
      typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    if (!objB.hasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}
```

### 实际对比示例

```jsx
import React, { Component, PureComponent } from 'react';

// 普通组件 - 每次都会重新渲染
class NormalComponent extends Component {
  render() {
    console.log('NormalComponent rendered');
    return <div>Normal Component: {this.props.data.value}</div>;
  }
}

// 纯组件 - 只有当props真正改变时才重新渲染
class PureComp extends PureComponent {
  render() {
    console.log('PureComp rendered');
    return <div>Pure Component: {this.props.data.value}</div>;
  }
}

// 使用示例
class ParentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      normalData: { value: 1 },
      pureData: { value: 1 },
      otherState: 'unchanged'
    };
  }

  render() {
    return (
      <div>
        <h3>Normal Component (always re-renders)</h3>
        <NormalComponent data={this.state.normalData} />
        
        <h3>Pure Component (only re-renders when data actually changes)</h3>
        <PureComp data={this.state.pureData} />
        
        <button onClick={() => {
          // 这会触发所有子组件重新渲染
          this.setState({ otherState: Math.random().toString() });
        }}>
          Update Other State
        </button>
        
        <button onClick={() => {
          // 这会创建新的对象，PureComponent会检测到变化
          this.setState({ 
            pureData: { value: this.state.pureData.value + 1 },
            normalData: { value: this.state.normalData.value + 1 }
          });
        }}>
          Update Data
        </button>
        
        <button onClick={() => {
          // 这不会触发PureComponent重新渲染（浅比较无法检测到嵌套对象的变化）
          const newData = this.state.pureData;
          newData.value = newData.value + 1;
          this.setState({ 
            normalData: { ...newData }, // NormalComponent会重新渲染
            pureData: newData // PureComponent不会重新渲染
          });
        }}>
          Update Data Without New Object
        </button>
      </div>
    );
  }
}
```

### PureComponent 的限制

PureComponent 的浅比较机制有一些限制：

```jsx
// 问题示例：嵌套对象的改变无法被检测
class ProblematicPureComponent extends PureComponent {
  render() {
    // 如果 this.props.user.address.street 改变了，
    // 但 this.props.user 对象引用未变，PureComponent不会重新渲染
    return <div>{this.props.user.name}, {this.props.user.address.street}</div>;
  }
}

// 解决方案：确保使用新的对象引用
function ParentWithPureChild() {
  const [user, setUser] = useState({
    name: 'John',
    address: { street: '123 Main St' }
  });

  const updateAddress = () => {
    // 正确：创建新对象以触发PureComponent更新
    setUser({
      ...user,
      address: {
        ...user.address,
        street: '456 Oak Ave'
      }
    });
  };

  return (
    <div>
      <ProblematicPureComponent user={user} />
      <button onClick={updateAddress}>Update Address</button>
    </div>
  );
}
```

### 性能考虑

```jsx
// PureComponent 适合的场景
class OptimizedList extends PureComponent {
  render() {
    // 当列表数据未改变时，不会重新渲染整个列表
    return (
      <ul>
        {this.props.items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
}

// 不适合使用PureComponent的场景 - 频繁改变或复杂计算
class ExpensivePureComponent extends PureComponent {
  // 如果这里的计算很复杂，浅比较的开销可能超过收益
  complexCalculation = () => {
    // 假设这里有复杂的计算
    return this.props.data.reduce((acc, item) => acc + item.value, 0);
  }

  render() {
    return <div>Result: {this.complexCalculation()}</div>;
  }
}
```

### 函数组件中的等价实现

在函数组件中，可以使用 React.memo 来实现类似 PureComponent 的效果：

```jsx
import React, { memo } from 'react';

// 默认的浅比较
const MemoizedComponent = memo(({ value, data }) => {
  console.log('MemoizedComponent rendered');
  return <div>{value}: {data.text}</div>;
});

// 自定义比较函数
const CustomMemoComponent = memo(({ value, data }) => {
  console.log('CustomMemoComponent rendered');
  return <div>{value}: {data.text}</div>;
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return prevProps.value === nextProps.value && 
         prevProps.data.text === nextProps.data.text;
});

// 使用示例
function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState({ text: 'Hello' });

  return (
    <div>
      <p>Count: {count}</p>
      <MemoizedComponent value={count} data={data} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setData({ text: 'World' })}>Change Data</button>
    </div>
  );
}
```

### 最佳实践

1. **何时使用 PureComponent**：
   - 组件props和state主要是原始值或简单对象
   - 组件渲染频率高但数据变化频率低
   - 有明确的性能问题需要优化

2. **何时避免使用 PureComponent**：
   - props和state包含复杂嵌套对象
   - 频繁更新的组件
   - 自定义比较函数比渲染更耗时

3. **注意事项**：
   - 确保props和state的不可变性
   - 谨慎处理嵌套对象的更新
   - 在开发环境中使用性能分析工具验证效果

理解 Component 和 PureComponent 的区别有助于在合适的场景中选择正确的组件类型，从而优化应用性能。
