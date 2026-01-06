# react的fiber为什么需要双key？fiber节点内部的key和index你了解吗？（了解）

**题目**: react的fiber为什么需要双key？fiber节点内部的key和index你了解吗？（了解）

## 答案

React Fiber中的"双key"概念实际上指的是在协调(reconciliation)过程中，Fiber节点需要处理的两个关键概念：元素的key属性和Fiber节点的索引(index)。这并不是说Fiber节点本身有两个key，而是指在协调过程中需要同时考虑元素的key和它们的索引位置。

### Fiber节点结构中的key和index

首先，让我们了解Fiber节点的基本结构中与key和index相关的部分：

```javascript
// Fiber节点基本结构
const fiberNode = {
  // 指向父节点
  return: null,
  
  // 指向第一个子节点
  child: null,
  
  // 指向兄弟节点
  sibling: null,
  
  // 对应的DOM节点或组件实例
  stateNode: null,
  
  // 组件类型
  type: null,
  
  // 元素的key属性
  key: null,
  
  // 在父节点中的索引位置
  index: 0,
  
  // 优先级
  priority: 0,
  
  // 标记需要执行的工作类型
  effectTag: 0,
  
  // 指向下一个副作用节点
  nextEffect: null,
  
  // 新旧节点的引用，用于协调
  alternate: null,
  
  // 等等...
};
```

### 为什么需要同时考虑key和index？

在React的协调过程中，key和index各自承担不同的作用：

1. **key的作用**：
   - 用于标识元素的唯一性，帮助React识别哪些元素被添加、删除或移动
   - 提高列表渲染的性能，避免不必要的重新创建
   - 保持组件状态的一致性

2. **index的作用**：
   - 标识元素在列表中的位置
   - 当没有提供key时，React会使用index作为默认标识
   - 用于确定元素的相对顺序

### Fiber节点内部的协调机制

在协调过程中，React会同时使用key和index来决定如何处理节点：

```javascript
// 简化的协调算法示例
function reconcileChildFibers(returnFiber, currentFirstChild, newChildren) {
  let resultingFirstChild = null;
  let previousNewFiber = null;
  let oldFiber = currentFirstChild;
  let newIdx = 0;
  
  // 遍历新元素
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      oldFiber = advance(oldFiber);
    }
    
    const newChild = newChildren[newIdx];
    const sameKey = oldFiber !== null && oldFiber.key === newChild.key;
    
    if (sameKey) {
      // Key相同，尝试更新现有节点
      const existing = useFiber(oldFiber, newChild.alternate);
      existing.return = returnFiber;
      
      if (previousNewFiber === null) {
        resultingFirstChild = existing;
      } else {
        previousNewFiber.sibling = existing;
      }
      previousNewFiber = existing;
      oldFiber = oldFiber.sibling;
    } else {
      // Key不同，删除旧节点
      deleteChild(returnFiber, oldFiber);
      oldFiber = oldFiber.sibling;
      newIdx--;
    }
  }
  
  // 处理剩余的新元素（新增）
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  
  // 构建key到旧fiber的映射以优化查找
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  
  // 处理剩余的新元素
  for (; newIdx < newChildren.length; newIdx++) {
    const newChild = newChildren[newIdx];
    if (newChild) {
      const matchedFiber = existingChildren.get(newChild.key || newIdx) || null;
      const newFiber = createChild(returnFiber, newChild, matchedFiber);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }
  
  return resultingFirstChild;
}

// 使用key和index创建新的fiber节点
function createChild(returnFiber, newChild, priority) {
  const element = newChild;
  if (typeof element.type === 'string') {
    // HostComponent
    const fiber = createFiber(HostComponent, element.props, element.key, priority);
    fiber.type = element.type;
    fiber.pendingProps = element.props;
    fiber.index = 0; // 在父节点中的索引
    return fiber;
  } else {
    // Function/Class Component
    const fiber = createFiber(ClassComponent, element.props, element.key, priority);
    fiber.type = element.type;
    fiber.pendingProps = element.props;
    fiber.index = 0; // 在父节点中的索引
    return fiber;
  }
}
```

### 双key机制的协调过程

在协调过程中，React通过以下方式同时利用key和index：

1. **快速路径优化**：当新旧元素的key和index都匹配时，React会走快速路径，直接复用节点。

```javascript
// 快速路径：当key和index都匹配时
function reconcileSingleChild(returnFiber, currentFirstChild, element) {
  const key = element.key;
  
  let child = currentFirstChild;
  while (child !== null) {
    if (child.key === key) {
      // 类型检查
      if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.elementType === element.type) {
        deleteRemainingChildren(returnFiber, child.sibling);
        const existing = useFiber(child, element.type === REACT_FRAGMENT_TYPE ? element.props.children : element.props);
        existing.ref = coerceRef(element);
        existing.return = returnFiber;
        return existing;
      } else {
        deleteRemainingChildren(returnFiber, child);
        break;
      }
    } else {
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }
  
  // 创建新的fiber节点
  const created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.ref = coerceRef(element);
  created.return = returnFiber;
  return created;
}
```

2. **多节点协调**：当处理多个节点时，React会构建一个基于key的映射表来快速查找对应的旧节点。

```javascript
// 构建key到fiber的映射
function mapRemainingChildren(returnFiber, currentFirstChild) {
  const existingChildren = new Map();
  
  let existingChild = currentFirstChild;
  while (existingChild !== null) {
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild);
    } else {
      // 如果没有key，使用index作为标识
      existingChildren.set(existingChild.index, existingChild);
    }
    existingChild = existingChild.sibling;
  }
  
  return existingChildren;
}
```

### Key和Index对性能的影响

1. **Key的重要性**：使用稳定的key可以显著提高列表渲染性能：

```jsx
// 不好的例子：使用index作为key
function BadList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{item.name}</div> // 不推荐
      ))}
    </div>
  );
}

// 好的例子：使用唯一ID作为key
function GoodList({ items }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div> // 推荐
      ))}
    </div>
  );
}
```

2. **Index的作用**：当没有提供key时，React会使用index，但这可能导致性能问题：

```javascript
// 当列表项顺序改变时，使用index作为key会导致不必要的重新渲染
const originalItems = ['A', 'B', 'C'];
// 渲染为: A(key=0), B(key=1), C(key=2)

const reorderedItems = ['C', 'A', 'B'];
// 渲染为: C(key=0), A(key=1), B(key=2)
// React会认为所有元素都改变了，而不是只是重新排序
```

### 总结

React Fiber中的"双key"概念实际上是指在协调过程中需要同时考虑元素的key属性和它们在列表中的index位置。这种设计使得React能够：

1. 高效地识别元素的添加、删除和移动
2. 保持组件状态的一致性
3. 优化列表渲染性能
4. 实现精确的DOM更新

Key用于标识元素的唯一性，而index用于确定元素的相对位置，两者结合使用使得React的协调算法能够在复杂场景下做出正确的决策。
