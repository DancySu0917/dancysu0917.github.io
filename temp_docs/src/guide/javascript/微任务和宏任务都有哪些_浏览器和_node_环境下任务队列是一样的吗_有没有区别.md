# 微任务和宏任务都有哪些，浏览器和 node 环境下任务队列是一样的吗？有没有区别？（高薪常问）

**题目**: 微任务和宏任务都有哪些，浏览器和 node 环境下任务队列是一样的吗？有没有区别？（高薪常问）

## 标准答案

### 微任务（Microtasks）
- **Promise.then/catch/finally**
- **queueMicrotask**
- **MutationObserver**（浏览器环境）
- **process.nextTick**（Node.js 环境，优先级最高）

### 宏任务（Macrotasks）
- **setTimeout/setInterval**
- **setImmediate**（Node.js 环境）
- **requestAnimationFrame**（浏览器环境）
- **I/O 操作**
- **UI 渲染**（浏览器环境）

### 浏览器和 Node.js 环境区别
- **浏览器**：只有宏任务和微任务两个队列
- **Node.js**：有四个队列：Timers、Pending callbacks、Poll、Check，其中 process.nextTick 不属于事件循环阶段

## 深入解析

### 浏览器环境任务队列
```javascript
// 浏览器环境示例
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

setTimeout(() => console.log('4'), 0);

Promise.resolve().then(() => console.log('5'));

console.log('6');

// 输出：1 6 3 5 2 4

// 完整的浏览器事件循环执行顺序：
// 1. 执行当前宏任务（同步代码）
// 2. 执行所有微任务
// 3. 执行渲染（如果需要）
// 4. 执行下一个宏任务
```

### Node.js 环境任务队列
```javascript
// Node.js 环境示例
console.log('1');

setTimeout(() => console.log('2'), 0);

setImmediate(() => console.log('3'));

Promise.resolve().then(() => console.log('4'));

process.nextTick(() => console.log('5'));

console.log('6');

// 输出：1 6 5 4 2 3 (在I/O循环外) 或 3 2 (在I/O循环内)

// Node.js 事件循环阶段：
// 1. timers: 执行setTimeout和setInterval回调
// 2. pending callbacks: 执行延迟到下一个循环迭代的I/O回调
// 3. idle, prepare: 仅供系统内部使用
// 4. poll: 检索新的I/O事件，执行I/O相关回调
// 5. check: 执行setImmediate回调
// 6. close callbacks: 执行close事件的回调
```

### 任务类型详细分类
```javascript
// 微任务（Microtasks）
const microtasks = [
    // Promise 相关
    () => Promise.resolve().then(() => console.log('Promise.then')),
    () => Promise.resolve().catch(() => console.log('Promise.catch')),
    () => Promise.resolve().finally(() => console.log('Promise.finally')),
    
    // 队列微任务
    () => queueMicrotask(() => console.log('queueMicrotask')),
    
    // Node.js 特有（优先级最高）
    () => process.nextTick(() => console.log('process.nextTick')),
    
    // 浏览器特有
    () => {
        const observer = new MutationObserver(() => console.log('MutationObserver'));
        const target = document.body;
        observer.observe(target, { attributes: true });
        target.setAttribute('test', 'value');
    }
];

// 宏任务（Macrotasks）
const macrotasks = [
    // 定时器
    () => setTimeout(() => console.log('setTimeout'), 0),
    () => setInterval(() => console.log('setInterval'), 1000),
    
    // Node.js 特有
    () => setImmediate(() => console.log('setImmediate')),
    
    // 浏览器特有
    () => requestAnimationFrame(() => console.log('requestAnimationFrame')),
    
    // I/O 操作
    () => console.log('I/O operation'),
    
    // UI 渲染（浏览器）
    () => console.log('UI rendering')
];
```

### Node.js 事件循环阶段详解
```javascript
// Node.js 事件循环各阶段执行顺序
const fs = require('fs');

console.log('start');

// process.nextTick - 在事件循环的每个阶段之间执行
process.nextTick(() => console.log('nextTick1'));

// Promise 微任务
Promise.resolve().then(() => console.log('Promise1'));

// Timers 阶段
setTimeout(() => {
    console.log('setTimeout1');
    process.nextTick(() => console.log('timeout-nextTick'));
}, 0);

setImmediate(() => console.log('setImmediate1'));

// I/O 回调
fs.readFile(__filename, () => {
    console.log('I/O 回调');
    
    // 在 I/O 回调中设置的微任务
    Promise.resolve().then(() => console.log('I/O-Promise'));
    process.nextTick(() => console.log('I/O-nextTick'));
});

Promise.resolve().then(() => console.log('Promise2'));

console.log('end');

// 可能的输出顺序：
// start
// end
// Promise1
// Promise2
// nextTick1
// setTimeout1
// setImmediate1
// I/O 回调
// I/O-Promise
// I/O-nextTick
// timeout-nextTick
```

## 实际面试问答

**面试官**: 浏览器和 Node.js 的事件循环有什么区别？

**候选人**: 
主要区别如下：
1. **队列结构**：
   - 浏览器：宏任务队列和微任务队列
   - Node.js：多个阶段的循环（Timers、Pending callbacks、Poll、Check等）

2. **process.nextTick**：
   - 浏览器：无此 API
   - Node.js：优先级高于 Promise，每个阶段之间都会执行

3. **setImmediate vs setTimeout**：
   - 浏览器：只有 setTimeout
   - Node.js：setImmediate 在 check 阶段执行，setTimeout 在 timers 阶段执行

**面试官**: 为什么 process.nextTick 在 Node.js 中优先级最高？

**候选人**: 
process.nextTick 是 Node.js 特有的 API，它的回调会在当前操作完成后立即执行，优先级高于 Promise。这允许开发者在事件循环继续之前处理重要操作，比如错误处理或状态更新。

**面试官**: 在什么情况下 setTimeout 和 setImmediate 的执行顺序可能不同？

**候选人**:
```javascript
// 执行顺序取决于当前事件循环阶段
// 在主模块（模块加载阶段）：
setTimeout(() => console.log('timeout'), 0);      // 可能先执行
setImmediate(() => console.log('immediate'));     // 可能后执行

// 在 I/O 回调中：
require('fs').readFile(__filename, () => {
    setTimeout(() => console.log('timeout'), 0);      // 可能后执行
    setImmediate(() => console.log('immediate'));     // 可能先执行
});

// 这是因为在 I/O 阶段，poll 阶段完成后会进入 check 阶段（setImmediate），
// 而 setTimeout 需要等到下一轮事件循环的 timers 阶段
```
