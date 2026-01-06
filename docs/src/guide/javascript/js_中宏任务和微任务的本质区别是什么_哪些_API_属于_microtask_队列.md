# js 中宏任务和微任务的本质区别是什么？哪些 API 属于 microtask 队列？（高薪常问）

**题目**: js 中宏任务和微任务的本质区别是什么？哪些 API 属于 microtask 队列？（高薪常问）

## 标准答案

宏任务（Macrotask）和微任务（Microtask）的本质区别：
1. 执行优先级：微任务优先级高于宏任务
2. 执行时机：微任务在当前宏任务结束后、下一个宏任务开始前执行
3. 执行顺序：所有微任务执行完后才执行下一个宏任务

属于 microtask 队列的 API：
1. Promise.then/catch/finally 回调
2. MutationObserver 回调
3. queueMicrotask() 函数
4. process.nextTick() (Node.js 环境)

## 深入理解

JavaScript 的事件循环机制中，任务分为宏任务和微任务两个队列。宏任务包括：script(整体代码)、setTimeout、setInterval、I/O、UI 渲染等；微任务包括：Promise 回调、MutationObserver 回调等。

事件循环执行顺序：
1. 执行当前宏任务
2. 执行所有微任务（如果微任务中又创建了微任务，也会被添加到队列中并执行）
3. 渲染更新（如果需要）
4. 执行下一个宏任务

微任务的执行时机非常关键：在当前宏任务执行完成后，但在浏览器渲染之前。这意味着微任务可以修改 DOM，而这些修改不会导致额外的重排/重绘，因为渲染会在所有微任务执行完毕后统一进行。

## 代码示例

```javascript
// 1. 基本的宏任务和微任务执行顺序
console.log('1. 同步代码');

setTimeout(() => {
  console.log('2. 宏任务 - setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3. 微任务 - Promise');
});

console.log('4. 同步代码');

// 输出顺序: 1, 4, 3, 2

// 2. 复杂的嵌套场景
console.log('start');

setTimeout(() => {
  console.log('setTimeout1');
  Promise.resolve().then(() => {
    console.log('promise1');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('promise2');
});

setTimeout(() => {
  console.log('setTimeout2');
}, 0);

console.log('end');

// 输出顺序: start, end, promise2, setTimeout1, promise1, setTimeout2

// 3. 微任务中创建微任务的场景
Promise.resolve().then(() => {
  console.log('promise1');
  Promise.resolve().then(() => {
    console.log('promise3');
  });
});

Promise.resolve().then(() => {
  console.log('promise2');
});

// 输出顺序: promise1, promise2, promise3

// 4. queueMicrotask 的使用
console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

queueMicrotask(() => {
  console.log('queueMicrotask1');
  queueMicrotask(() => {
    console.log('queueMicrotask2');
  });
});

Promise.resolve().then(() => {
  console.log('promise');
});

console.log('script end');

// 输出顺序: script start, script end, queueMicrotask1, promise, queueMicrotask2, setTimeout

// 5. MutationObserver 作为微任务的示例
const observer = new MutationObserver(() => {
  console.log('MutationObserver callback');
});

const target = document.body;
const config = { attributes: true };

observer.observe(target, config);

console.log('Before mutation');
target.setAttribute('test', 'value'); // 这会触发 MutationObserver
console.log('After mutation');

// 输出顺序: Before mutation, After mutation, MutationObserver callback

// 6. 微任务执行顺序测试
async function testMicrotaskOrder() {
  console.log('async function start');
  
  Promise.resolve().then(() => {
    console.log('promise1');
  });
  
  queueMicrotask(() => {
    console.log('queueMicrotask');
  });
  
  Promise.resolve().then(() => {
    console.log('promise2');
  });
  
  console.log('async function end');
}

testMicrotaskOrder();

// 输出顺序: async function start, async function end, promise1, queueMicrotask, promise2

// 7. Node.js 中 process.nextTick 的特殊性
// 注意：process.nextTick 在 Node.js 中比普通微任务有更高的优先级
// 在浏览器中没有对应的 API
// process.nextTick(() => {
//   console.log('nextTick');
// });
// 
// Promise.resolve().then(() => {
//   console.log('promise');
// });
// 
// 输出顺序 (Node.js): nextTick, promise

// 8. 实际应用：使用微任务进行异步操作
function asyncOperation() {
  return new Promise((resolve) => {
    // 模拟异步操作
    setTimeout(() => {
      console.log('异步操作完成');
      resolve('操作结果');
    }, 1000);
  });
}

// 在异步操作完成后立即执行某些逻辑
asyncOperation().then(result => {
  console.log('处理结果:', result);
  // 在这里可以继续添加微任务来处理后续逻辑
  return Promise.resolve(result).then(res => {
    console.log('进一步处理:', res);
  });
});

// 9. 微任务在状态管理中的应用
class StateManager {
  constructor() {
    this.state = {};
    this.listeners = [];
    this.pending = false;
    this.jobs = [];
  }
  
  setState(newState) {
    // 将状态更新加入微任务队列，实现批量更新
    this.jobs.push(() => {
      this.state = { ...this.state, ...newState };
      this.notifyListeners();
    });
    
    if (!this.pending) {
      this.pending = true;
      queueMicrotask(() => {
        this.flushJobs();
        this.pending = false;
      });
    }
  }
  
  flushJobs() {
    this.jobs.forEach(job => job());
    this.jobs = [];
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
  }
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

const stateManager = new StateManager();
stateManager.subscribe((state) => {
  console.log('状态更新:', state);
});

// 连续多次状态更新会被批量处理
stateManager.setState({ count: 1 });
stateManager.setState({ name: 'test' });
stateManager.setState({ value: 'demo' });

// 10. 事件循环可视化示例
function visualizeEventLoop() {
  console.log('1. 同步代码开始');
  
  setTimeout(() => {
    console.log('2. 宏任务 - setTimeout 1');
  }, 0);
  
  Promise.resolve().then(() => {
    console.log('3. 微任务 - Promise 1');
    Promise.resolve().then(() => {
      console.log('4. 微任务 - Promise 2 (嵌套)');
    });
    setTimeout(() => {
      console.log('5. 宏任务 - setTimeout 2 (在微任务中创建)');
    }, 0);
  });
  
  setTimeout(() => {
    console.log('6. 宏任务 - setTimeout 3');
  }, 0);
  
  console.log('7. 同步代码结束');
}

visualizeEventLoop();
// 输出顺序: 1, 7, 3, 4, 2, 6, 5
```

## 实践场景

1. **Promise 实现**：理解微任务机制对于实现 Promise 和理解其执行顺序非常重要。

2. **性能优化**：合理使用微任务可以在不影响 UI 渲染的情况下处理异步逻辑。

3. **状态管理**：在 Redux、Vuex 等状态管理库中，使用微任务实现批量更新，避免不必要的重复渲染。

4. **框架实现**：React 的 setState 批量更新、Vue 的 nextTick 都利用了微任务机制。

5. **DOM 操作优化**：在需要批量 DOM 操作时，使用微任务可以减少重排和重绘次数。

在实际开发中，理解宏任务和微任务的执行机制对于编写高性能的异步代码至关重要，特别是在处理复杂的状态更新和 UI 渲染场景中。
