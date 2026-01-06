# js 是单线程的，为啥还能异步，我 setTimeout 放在 promise 后面它为啥最后才执行（了解）

**题目**: js 是单线程的，为啥还能异步，我 setTimeout 放在 promise 后面它为啥最后才执行（了解）

## 标准答案

JavaScript 是单线程的，但通过事件循环（Event Loop）机制实现了异步操作。setTimeout 和 Promise 的执行顺序差异源于它们在事件循环中的不同队列：

1. **微任务（Microtask）**：Promise.then 属于微任务队列，优先级高于宏任务
2. **宏任务（Macrotask）**：setTimeout 属于宏任务队列，优先级低于微任务

## 深入解析

### JavaScript 异步机制原理
JavaScript 通过以下机制实现异步：
- **调用栈（Call Stack）**：执行同步代码
- **事件循环（Event Loop）**：协调宏任务和微任务的执行
- **回调队列（Callback Queue）**：存储待执行的回调函数
- **Web APIs**：提供异步操作接口（如 setTimeout、fetch、DOM 事件等）

### 任务优先级执行顺序
```javascript
// 执行顺序示例
console.log('1');

setTimeout(() => {
    console.log('2');
}, 0);

Promise.resolve().then(() => {
    console.log('3');
});

console.log('4');

// 输出顺序：1 4 3 2
```

### 宏任务与微任务的区别
```javascript
// 宏任务（Macrotask）示例
setTimeout(() => console.log('setTimeout'), 0);           // 宏任务
setImmediate(() => console.log('setImmediate'), 0);       // 宏任务
requestAnimationFrame(() => console.log('rAF'), 0);       // 宏任务

// 微任务（Microtask）示例
Promise.resolve().then(() => console.log('Promise'));     // 微任务
queueMicrotask(() => console.log('queueMicrotask'));      // 微任务
process.nextTick(() => console.log('nextTick'));          // Node.js 特有，优先级最高

// 完整执行顺序演示
console.log('start');

setTimeout(() => {
    console.log('setTimeout1');
    Promise.resolve().then(() => {
        console.log('promise3');
    });
}, 0);

Promise.resolve().then(() => {
    console.log('promise1');
});

Promise.resolve().then(() => {
    console.log('promise2');
});

setTimeout(() => {
    console.log('setTimeout2');
}, 0);

console.log('end');

// 输出顺序：
// start
// end
// promise1
// promise2
// setTimeout1
// promise3
// setTimeout2
```

### 事件循环执行机制
```javascript
// 事件循环执行步骤
function eventLoopExample() {
    // 1. 执行同步代码
    console.log('同步代码执行');
    
    // 2. 将宏任务放入宏任务队列
    setTimeout(() => {
        console.log('宏任务执行');
        // 2.1 执行宏任务时，如果遇到微任务，放入微任务队列
        Promise.resolve().then(() => {
            console.log('宏任务中的微任务');
        });
    }, 0);
    
    // 3. 将微任务放入微任务队列
    Promise.resolve().then(() => {
        console.log('微任务执行');
    });
    
    console.log('同步代码结束');
}

eventLoopExample();

// 输出：
// 同步代码执行
// 同步代码结束
// 微任务执行
// 宏任务执行
// 宏任务中的微任务
```

## 实际面试问答

**面试官**: 为什么 setTimeout 放在 Promise 后面却最后执行？

**候选人**: 
1. **任务队列优先级不同**：
   - Promise.then 是微任务，优先级高于 setTimeout 的宏任务
   - 事件循环会优先执行完所有微任务，再执行下一个宏任务

2. **执行顺序规则**：
   - 执行当前宏任务中的同步代码
   - 执行所有微任务（Promise.then, queueMicrotask 等）
   - 执行下一个宏任务（setTimeout, setInterval 等）

**面试官**: 能详细解释一下事件循环的执行步骤吗？

**候选人**:
```javascript
// 事件循环详细执行步骤
function detailedEventLoop() {
    console.log('1');
    
    setTimeout(() => {
        console.log('2');
        Promise.resolve().then(() => {
            console.log('3');
        });
    }, 0);
    
    Promise.resolve().then(() => {
        console.log('4');
    });
    
    setTimeout(() => {
        console.log('5');
    }, 0);
    
    Promise.resolve().then(() => {
        console.log('6');
    });
    
    console.log('7');
}

detailedEventLoop();

// 执行步骤：
// 1. 执行同步代码: '1', '7'
// 2. 遇到 setTimeout: 加入宏任务队列
// 3. 遇到 Promise.then: 加入微任务队列
// 4. 遇到 setTimeout: 加入宏任务队列
// 5. 遇到 Promise.then: 加入微任务队列
// 6. 同步代码执行完毕
// 7. 执行所有微任务: '4', '6'
// 8. 执行第一个宏任务: '2'
//    - 执行宏任务中的 Promise.then: 加入微任务队列
//    - 宏任务执行完毕
// 9. 执行宏任务产生的微任务: '3'
// 10. 执行第二个宏任务: '5'

// 最终输出: 1 7 4 6 2 3 5
```

**面试官**: 如何实现一个高优先级的异步操作？

**候选人**: 
在 Node.js 环境中，process.nextTick() 优先级最高，其次是 Promise.then() 等微任务。在浏览器环境中，微任务优先级基本相同，都高于宏任务。
