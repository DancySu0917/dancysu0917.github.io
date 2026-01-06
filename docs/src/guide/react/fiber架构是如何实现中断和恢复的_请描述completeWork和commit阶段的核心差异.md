# fiber架构是如何实现中断和恢复的？请描述completeWork和commit阶段的核心差异？（了解）

**题目**: fiber架构是如何实现中断和恢复的？请描述completeWork和commit阶段的核心差异？（了解）

## 答案

React Fiber是React 16引入的新的协调算法，它通过将渲染工作拆分成小块来实现可中断的渲染过程。以下是详细的解析：

### 1. Fiber架构概述

Fiber架构的主要目标是：
- 使渲染过程可中断，避免长时间占用主线程
- 实现增量渲染
- 支持优先级调度
- 改进错误边界处理

### 2. Fiber节点结构

```javascript
// Fiber节点的基本结构
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
  
  // 优先级
  priority: 0,
  
  // 标记需要执行的工作类型
  effectTag: 0,
  
  // 指向下一个副作用节点
  nextEffect: null,
  
  // 等等...
};
```

### 3. Fiber的中断和恢复机制

#### 3.1 时间切片（Time Slicing）
Fiber通过将渲染工作分解成小的时间片来实现中断和恢复：

```javascript
// 模拟React的时间切片机制
let deadline = 0;
const frameLength = 5; // 5ms per frame

function performUnitOfWork() {
  // 检查是否有剩余时间
  if (window.performance.now() < deadline) {
    // 有时间，继续执行工作单元
    const next = performWorkOnRoot();
    if (next) {
      // 返回下一个工作单元
      return next;
    } else {
      // 没有更多工作单元，返回null
      return null;
    }
  } else {
    // 没有剩余时间，中断渲染
    return nextUnitOfWork;
  }
}

function workLoop(deadlineArg) {
  if (nextUnitOfWork === null) {
    // 没有更多工作，渲染完成
    return;
  }
  
  // 继续执行工作单元，直到时间用完
  while (nextUnitOfWork && window.performance.now() < deadlineArg) {
    nextUnitOfWork = performUnitOfWork();
  }
  
  // 请求下一帧继续工作
  requestIdleCallback(workLoop);
}
```

#### 3.2 中断和恢复的实现
```javascript
// Fiber渲染的中断和恢复机制
class FiberScheduler {
  constructor() {
    this.workInProgressRoot = null;
    this.nextUnitOfWork = null;
    this.shouldYield = false;
  }
  
  scheduleUpdate(fiber) {
    // 将更新加入队列
    this.workInProgressRoot = fiber;
    this.nextUnitOfWork = fiber;
    
    // 使用requestIdleCallback来安排工作
    requestIdleCallback(this.workLoop.bind(this));
  }
  
  workLoop(deadline) {
    let shouldYield = false;
    
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1; // 如果剩余时间少于1ms就中断
    }
    
    if (this.nextUnitOfWork) {
      // 还有工作未完成，继续调度
      requestIdleCallback(this.workLoop.bind(this));
    } else {
      // 所有工作完成，提交变更
      this.commitRoot();
    }
  }
  
  performUnitOfWork(fiber) {
    const next = this.beginWork(fiber);
    
    if (next) {
      // 返回下一个工作单元
      return next;
    }
    
    // 没有子节点，向上回溯
    return this.completeUnitOfWork(fiber);
  }
  
  beginWork(fiber) {
    // 创建或更新子节点
    return this.reconcileChildren(fiber);
  }
  
  completeUnitOfWork(fiber) {
    let completedWork = fiber;
    
    while (completedWork) {
      const returnFiber = completedWork.return;
      
      // 完成工作并收集副作用
      this.completeWork(completedWork);
      
      if (returnFiber) {
        // 设置下一个工作单元
        return completedWork.sibling || returnFiber;
      }
      
      completedWork = returnFiber;
    }
    
    return null;
  }
}
```

### 4. Render阶段（协调阶段）

Render阶段是可中断的，包含两个子阶段：

#### 4.1 BeginWork阶段
```javascript
function beginWork(currentFiber, workInProgressFiber) {
  // 根据Fiber类型执行不同的工作
  switch (workInProgressFiber.tag) {
    case HostRoot:
      return updateHostRoot(currentFiber, workInProgressFiber);
    case HostComponent:
      return updateHostComponent(currentFiber, workInProgressFiber);
    case FunctionComponent:
      return updateFunctionComponent(currentFiber, workInProgressFiber);
    case ClassComponent:
      return updateClassComponent(currentFiber, workInProgressFiber);
    default:
      return null;
  }
}

function updateFunctionComponent(current, workInProgress) {
  const Component = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  
  // 执行函数组件
  const nextChildren = Component(nextProps);
  
  // 调和子节点
  reconcileChildren(current, workInProgress, nextChildren);
  
  return workInProgress.child;
}
```

#### 4.2 CompleteWork阶段
```javascript
function completeWork(current, workInProgress) {
  const newProps = workInProgress.pendingProps;
  
  switch (workInProgress.tag) {
    case HostComponent:
      // 准备DOM操作
      const instance = workInProgress.stateNode;
      const type = workInProgress.type;
      
      if (current !== null && workInProgress.stateNode != null) {
        // 更新现有实例
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        // 创建新实例
        const instance = createInstance(type, newProps);
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;
      }
      
      // 标记副作用
      bubbleProperties(workInProgress);
      return null;
      
    case HostText:
      // 处理文本节点
      if (current !== null && workInProgress.stateNode != null) {
        // 更新文本内容
        const oldText = current.memoizedProps;
        const newText = newProps;
        if (oldText !== newText) {
          workInProgress.flags |= Update;
        }
      } else {
        // 创建文本节点
        workInProgress.stateNode = createTextInstance(newProps);
      }
      
      bubbleProperties(workInProgress);
      return null;
      
    default:
      bubbleProperties(workInProgress);
      return null;
  }
}

function bubbleProperties(fiber) {
  // 向上冒泡副作用信息
  let child = fiber.child;
  let effectTag = fiber.effectTag;
  
  if (child !== null) {
    effectTag |= child.effectTag;
    
    let sibling = child.sibling;
    while (sibling !== null) {
      effectTag |= sibling.effectTag;
      sibling = sibling.sibling;
    }
  }
  
  fiber.subtreeTag = effectTag;
}
```

### 5. Commit阶段（提交阶段）

Commit阶段是不可中断的，负责实际的DOM操作：

```javascript
function commitRoot(root) {
  const finishedWork = root.finishedWork;
  
  if (!finishedWork) {
    return null;
  }
  
  root.finishedWork = null;
  
  // 三个子阶段
  commitBeforeMutationEffects(finishedWork);
  commitMutationEffects(finishedWork);
  commitLayoutEffects(finishedWork);
  
  // 重置
  root.finishedWork = null;
}

// Before Mutation阶段
function commitBeforeMutationEffects(finishedWork) {
  // 调用getSnapshotBeforeUpdate
  nextEffect = finishedWork;
  
  while (nextEffect !== null) {
    const current = nextEffect.alternate;
    
    if ((nextEffect.effectTag & Snapshot) !== NoFlags) {
      commitBeforeMutationEffectOnFiber(current, nextEffect);
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

// Mutation阶段
function commitMutationEffects(finishedWork) {
  nextEffect = finishedWork;
  
  while (nextEffect !== null) {
    const flags = nextEffect.effectTag;
    
    // 执行DOM操作
    if (flags & ContentReset) {
      commitResetTextContent(nextEffect);
    }
    
    if (flags & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }
    
    const primaryFlags = flags & (Placement | Update | Deletion);
    switch (primaryFlags) {
      case Placement: {
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;
        break;
      }
      case Update: {
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Deletion: {
        commitDeletion(nextEffect);
        break;
      }
      case PlacementAndUpdate: {
        // 先执行插入
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;
        
        // 再执行更新
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

// Layout阶段
function commitLayoutEffects(finishedWork) {
  nextEffect = finishedWork;
  
  while (nextEffect !== null) {
    const flags = nextEffect.effectTag;
    
    if (flags & (Update | Callback)) {
      const current = nextEffect.alternate;
      commitLayoutEffectOnFiber(current, nextEffect);
    }
    
    if (flags & Ref) {
      commitAttachRef(nextEffect);
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}
```

### 6. CompleteWork和Commit阶段的核心差异

| 特性 | CompleteWork阶段 | Commit阶段 |
|------|------------------|------------|
| **可中断性** | 可中断 | 不可中断 |
| **主要任务** | 准备副作用，收集变更信息 | 执行实际的DOM操作 |
| **执行时机** | Render阶段的第二部分 | Render完成后立即执行 |
| **工作内容** | 创建实例、更新属性、收集副作用 | 插入、更新、删除DOM节点 |
| **性能影响** | 低，可分片执行 | 高，必须立即完成 |
| **错误处理** | 可恢复 | 需要错误边界 |

### 7. 优先级调度

Fiber还实现了优先级调度机制：

```javascript
// 优先级常量
const NoPriority = 0;
const ImmediatePriority = 1;  // 立即执行
const UserBlockingPriority = 2;  // 用户阻塞
const NormalPriority = 3;  // 正常
const LowPriority = 4;  // 低优先级
const IdlePriority = 5;  // 空闲优先级

function scheduleUpdate(fiber, priorityLevel) {
  // 根据优先级安排更新
  switch (priorityLevel) {
    case ImmediatePriority:
      // 立即执行
      performSyncWorkOnRoot(fiber);
      break;
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
      // 异步执行
      requestIdleCallback(() => performConcurrentWorkOnRoot(fiber));
      break;
    case IdlePriority:
      // 空闲时执行
      requestIdleCallback(() => performIdleWorkOnRoot(fiber), { timeout: 1000 });
      break;
  }
}
```

### 8. 总结

React Fiber通过以下机制实现了中断和恢复：
1. 将渲染工作分解为小的时间片
2. 使用requestIdleCallback API来检测空闲时间
3. 在时间片内完成一个或多个工作单元
4. 保存当前进度，以便后续恢复
5. 通过双缓冲技术维护两个Fiber树（current和workInProgress）

CompleteWork和Commit阶段的核心差异在于：
- CompleteWork阶段是可中断的，主要负责准备工作和收集副作用
- Commit阶段是不可中断的，负责执行实际的DOM操作和调用生命周期方法

这种设计使得React能够响应用户交互，避免长时间阻塞主线程，提供更流畅的用户体验。
