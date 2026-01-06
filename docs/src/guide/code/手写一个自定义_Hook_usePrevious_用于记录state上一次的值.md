# 手写一个自定义 Hook：usePrevious (用于记录state上一次的值)（了解）

**题目**: 手写一个自定义 Hook：usePrevious (用于记录state上一次的值)（了解）

## 标准答案

`usePrevious` 是一个自定义 React Hook，用于保存并返回上一次渲染时的 state 值。它通过 `useRef` 来存储上一次的值，并在每次渲染时更新引用。核心实现是利用 `useEffect` 在 DOM 更新后将当前值赋给 ref，这样下次渲染时就能获取到上一次的值。

## 深入理解

### 1. usePrevious Hook 的核心原理
`usePrevious` Hook 的实现依赖于 `useRef` 和 `useEffect` 的组合。`useRef` 返回的 ref 对象在组件的整个生命周期内保持不变，这使得我们可以在其中存储任何可变值。`useEffect` 确保在 DOM 更新后执行副作用，这样我们就能在每次渲染后更新上一次的值。

### 2. React 渲染周期中的值保存
在 React 的渲染过程中，每次组件重新渲染时，函数组件会重新执行，局部变量会被重新初始化。但 `useRef` 返回的 ref 对象始终保持不变，这使得我们可以跨渲染保存值。`usePrevious` 利用这一特性，在渲染后更新 ref.current，确保下次渲染时能获取到上一次的值。

### 3. usePrevious 的应用场景
- **值变化追踪**: 监控某个状态值的变化，比较新旧值的差异
- **性能优化**: 避免不必要的计算或副作用，只在值真正变化时执行操作
- **动画控制**: 基于前一个值创建平滑的过渡效果
- **历史状态管理**: 在组件中维护值的历史记录

### 4. 实现细节和注意事项
- 必须在 `useEffect` 中更新 ref 值，确保获取的是上一次渲染的值
- 第一次渲染时返回 `undefined`（如果未提供默认值）
- 避免在渲染期间读取 ref 值，因为这可能导致不一致的状态

## 代码演示

```javascript
import { useEffect, useRef } from 'react';

// 基础版本的 usePrevious Hook
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// 带默认值的版本
function usePreviousWithDefault(value, defaultValue = undefined) {
  const ref = useRef(defaultValue);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// 完整示例组件
import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <h3>Previous Count: {prevCount || 'N/A'}</h3>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}

// 高级用法：追踪多个值
function useMultiplePrevious(values) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = values;
  });
  
  return ref.current || {};
}

// 使用示例
function MultiValueTracker() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  
  const prevValues = useMultiplePrevious({ name, age });
  
  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Name" 
      />
      <input 
        type="number"
        value={age} 
        onChange={(e) => setAge(Number(e.target.value))} 
        placeholder="Age" 
      />
      
      <div>Current: {name}, {age}</div>
      <div>Previous: {prevValues.name || 'N/A'}, {prevValues.age || 'N/A'}</div>
    </div>
  );
}

// 用于性能优化的 usePrevious
function OptimizedComponent({ data }) {
  const [processedData, setProcessedData] = useState(null);
  const prevData = usePrevious(data);
  
  useEffect(() => {
    // 只有当数据真正改变时才进行昂贵的计算
    if (data !== prevData) {
      console.log('Data changed, processing...');
      const result = expensiveCalculation(data);
      setProcessedData(result);
    }
  }, [data, prevData]);
  
  return <div>{processedData}</div>;
}

// 比较值变化的辅助 Hook
function usePreviousAndCompare(value) {
  const prevValue = usePrevious(value);
  
  return {
    current: value,
    previous: prevValue,
    changed: prevValue !== value,
    isFirstRender: prevValue === undefined
  };
}

// 使用示例
function ComparisonExample() {
  const [count, setCount] = useState(0);
  const comparison = usePreviousAndCompare(count);
  
  return (
    <div>
      <p>Current: {comparison.current}</p>
      <p>Previous: {comparison.previous || 'N/A'}</p>
      <p>Changed: {comparison.changed ? 'Yes' : 'No'}</p>
      <p>Is First Render: {comparison.isFirstRender ? 'Yes' : 'No'}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

// 实用工具函数：expensiveCalculation
function expensiveCalculation(data) {
  // 模拟耗时计算
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += data * i;
  }
  return result;
}
```

## 实际应用场景

### 1. 用户行为追踪
在用户界面上，我们可能需要追踪用户操作前后的状态变化，以便进行适当的反馈或记录。

### 2. 动画和过渡效果
当状态值发生变化时，可以基于前一个值创建平滑的过渡动画，提升用户体验。

### 3. 数据同步和缓存
在某些情况下，我们需要知道数据何时发生变化，以便同步到服务器或更新缓存。

### 4. 条件渲染优化
通过比较新旧值，我们可以避免不必要的重新渲染，提高应用性能。

### 5. 调试和开发工具
在开发过程中，追踪状态变化有助于调试和理解应用行为。

### 6. 表单验证
在表单中，我们可以追踪用户输入的变化，以便提供实时验证反馈。

### 7. 历史状态回退
某些应用可能需要实现简单的状态回退功能，usePrevious 可以帮助实现这一点。

### 8. 数据对比
在数据可视化或表格组件中，比较新旧数据有助于高亮显示变化的部分。
