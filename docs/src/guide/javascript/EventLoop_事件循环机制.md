# EventLoop 事件循环机制？（必会）

**题目**: EventLoop 事件循环机制？（必会）

## 标准答案

Event Loop（事件循环）是 JavaScript 实现异步操作的核心机制，它协调执行同步任务、异步回调和微任务。JavaScript 是单线程的，Event Loop 确保了非阻塞的 I/O 操作。

主要组成部分：
1. **调用栈（Call Stack）**：执行同步代码
2. **回调队列（Callback Queue）**：存放宏任务（macrotask）
3. **微任务队列（Microtask Queue）**：存放微任务（microtask）
4. **宿主环境 API**：如 setTimeout、DOM API 等

执行顺序：同步任务 → 微任务 → 宏任务

## 深入理解

### JavaScript 单线程模型

JavaScript 引擎是单线程的，意味着同一时间只能执行一个任务。为了处理异步操作而不阻塞主线程，引入了事件循环机制。

### 事件循环执行流程

```
开始 → 执行同步代码 → 检查微任务队列 → 执行所有微任务 → 检查宏任务队列 → 执行一个宏任务 → 检查微任务队列 → ...（循环）
```

具体流程：
1. 执行调用栈中的所有同步代码
2. 检查微任务队列是否有任务，如果有则全部执行
3. 执行一个宏任务
4. 再次检查微任务队列，执行所有微任务
5. 重复步骤 3-4

### 宏任务（Macrotask）与微任务（Microtask）

#### 宏任务（Macrotask）
宏任务包括：
- setTimeout
- setInterval
- setImmediate (Node.js)
- I/O 操作
- UI 渲染
- script 整体代码

```javascript
console.log('1');

setTimeout(() => {
    console.log('2');
}, 0);

console.log('3');

// 输出顺序：1, 3, 2
```

#### 微任务（Microtask）
微任务包括：
- Promise.then/catch/finally
- queueMicrotask
- MutationObserver (浏览器)

```javascript
console.log('1');

Promise.resolve().then(() => {
    console.log('2');
});

console.log('3');

// 输出顺序：1, 3, 2
```

### 完整的执行顺序示例

```javascript
console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
    console.log('promise1');
}).then(function() {
    console.log('promise2');
});

console.log('script end');

// 输出顺序：
// script start
// script end
// promise1
// promise2
// setTimeout
```

### 更复杂的示例

```javascript
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}

async function async2() {
    console.log('async2');
}

console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0);

async1();

new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});

console.log('script end');

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

### Node.js 中的事件循环阶段

在 Node.js 中，事件循环分为多个阶段：

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤   connections,│
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

1. **timers**: 执行 setTimeout 和 setInterval 的回调
2. **pending callbacks**: 执行系统操作的回调，如 TCP 错误
3. **idle, prepare**: 内部使用
4. **poll**: 检索新的 I/O 事件，执行 I/O 回调
5. **check**: 执行 setImmediate 的回调
6. **close callbacks**: 执行 close 事件的回调

### 浏览器与 Node.js 的差异

#### 浏览器环境
- 一次事件循环只执行一个宏任务
- 微任务执行期间如果添加新的微任务，会在当前循环中执行

#### Node.js 环境
- 一次事件循环可能执行多个宏任务（同一阶段）
- 在 Node.js 11 之前，宏任务和微任务的执行顺序与浏览器不一致

```javascript
// 浏览器和 Node.js 11+ 输出一致
setTimeout(() => console.log('timer1'), 0)
Promise.resolve().then(() => console.log('promise1'))

// 输出：promise1, timer1
```

### 实际应用场景

事件循环机制在以下场景中非常重要：
1. **性能优化**：合理安排任务，避免长时间阻塞主线程
2. **异步编程**：理解执行顺序，避免竞态条件
3. **UI 更新**：确保 DOM 操作在正确时机执行
4. **调试异步代码**：理解代码执行顺序，便于调试

### 注意事项

1. **微任务优先级**：微任务总是在下一个宏任务之前执行
2. **递归微任务**：避免在微任务中创建新的微任务，可能导致阻塞
3. **浏览器渲染**：UI 渲染通常在宏任务之间进行
4. **性能考虑**：大量异步操作可能影响性能，需合理安排

## 总结

- Event Loop 是 JavaScript 实现异步操作的核心机制
- 执行顺序：同步代码 → 微任务 → 宏任务
- 宏任务包括 setTimeout、setInterval、I/O 等
- 微任务包括 Promise、queueMicrotask 等
- 微任务优先级高于宏任务
- 浏览器和 Node.js 的事件循环机制略有差异
- 理解事件循环有助于编写高效的异步代码
