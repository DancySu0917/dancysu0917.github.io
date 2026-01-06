# setTimeout、Promise、Async/Await 的区别（必会）

**题目**: setTimeout、Promise、Async/Await 的区别（必会）

## 标准答案

setTimeout、Promise、Async/Await 的主要区别：

1. **执行时机**：
   - setTimeout：属于宏任务，进入宏任务队列
   - Promise：属于微任务，进入微任务队列
   - Async/Await：基于 Promise 实现，执行顺序遵循 Promise 规则

2. **任务队列**：
   - setTimeout：宏任务队列
   - Promise：微任务队列，优先级高于宏任务
   - Async/Await：微任务队列

3. **错误处理**：
   - setTimeout：错误不会中断执行栈
   - Promise：需要 .catch() 处理错误
   - Async/Await：使用 try/catch 处理错误

4. **语法复杂度**：
   - setTimeout：最简单，但容易造成回调地狱
   - Promise：解决回调地狱，但链式调用仍复杂
   - Async/Await：最简洁，同步风格的异步代码

## 深入理解

### 任务队列和执行顺序

```javascript
console.log('1');

setTimeout(() => {
    console.log('2');
}, 0);

Promise.resolve().then(() => {
    console.log('3');
}).then(() => {
    console.log('4');
});

async function asyncFunc() {
    console.log('5');
    await Promise.resolve();
    console.log('6');
}
asyncFunc();

console.log('7');

// 输出顺序：1, 5, 7, 3, 4, 6, 2
// 解释：
// 1. 同步代码：1, 5, 7
// 2. 微任务：3, 4, 6 (Promise.then 和 await 后面的代码)
// 3. 宏任务：2 (setTimeout)
```

### setTimeout 详解

```javascript
// setTimeout 基本用法
setTimeout(() => {
    console.log('This runs after 1 second');
}, 1000);

// setTimeout 的特点
function setTimeoutExample() {
    console.log('Start');
    
    setTimeout(() => {
        console.log('setTimeout callback');
    }, 0);
    
    console.log('End');
    
    // 输出顺序：Start -> End -> setTimeout callback
}

setTimeoutExample();

// setTimeout 实现重复任务
function intervalUsingTimeout() {
    let count = 0;
    const timer = setTimeout(function run() {
        console.log(`Count: ${count}`);
        count++;
        
        if (count < 5) {
            setTimeout(run, 1000); // 递归调用实现类似 setInterval 的效果
        }
    }, 1000);
}

// intervalUsingTimeout();

// setTimeout 中的 this 问题
const obj = {
    name: 'Object',
    method: function() {
        // setTimeout 中的 this 指向全局对象（非严格模式）或 undefined（严格模式）
        setTimeout(function() {
            console.log(this.name); // undefined 或 window.name
        }, 100);
        
        // 解决方案1：使用箭头函数
        setTimeout(() => {
            console.log(this.name); // 'Object'
        }, 200);
        
        // 解决方案2：使用 bind
        setTimeout(function() {
            console.log(this.name); // 'Object'
        }.bind(this), 300);
    }
};

obj.method();
```

### Promise 详解

```javascript
// Promise 的三种状态
// 1. pending（进行中）
// 2. fulfilled（已成功）
// 3. rejected（已失败）

function promiseExample() {
    const promise = new Promise((resolve, reject) => {
        console.log('Promise executor');
        
        setTimeout(() => {
            const success = Math.random() > 0.5;
            if (success) {
                resolve('Success!');
            } else {
                reject('Error!');
            }
        }, 1000);
    });
    
    console.log('After promise creation');
    
    promise.then(result => {
        console.log('Resolved:', result);
    }).catch(error => {
        console.log('Rejected:', error);
    });
    
    console.log('End of function');
}

promiseExample();

// Promise 链式调用
function promiseChain() {
    Promise.resolve(1)
        .then(value => {
            console.log('Step 1:', value);
            return value + 1;
        })
        .then(value => {
            console.log('Step 2:', value);
            return value + 1;
        })
        .then(value => {
            console.log('Step 3:', value);
            return value + 1;
        })
        .then(value => {
            console.log('Final:', value);
        });
}

promiseChain();

// Promise 并行执行
function parallelPromises() {
    const promise1 = new Promise(resolve => setTimeout(() => resolve('Promise 1'), 1000));
    const promise2 = new Promise(resolve => setTimeout(() => resolve('Promise 2'), 500));
    const promise3 = new Promise(resolve => setTimeout(() => resolve('Promise 3'), 1500));
    
    console.log('Start parallel execution');
    
    Promise.all([promise1, promise2, promise3])
        .then(results => {
            console.log('All results:', results); // ['Promise 1', 'Promise 2', 'Promise 3']
        });
        
    Promise.race([promise1, promise2, promise3])
        .then(result => {
            console.log('Race result:', result); // 'Promise 2' (最先完成)
        });
}

// parallelPromises();
```

### Async/Await 详解

```javascript
// 基本的 async/await 用法
async function basicAsync() {
    console.log('Start async function');
    
    const result = await new Promise(resolve => {
        setTimeout(() => resolve('Promise resolved'), 1000);
    });
    
    console.log('Result:', result);
    console.log('End async function');
    
    return 'Async function return value';
}

// 调用 async 函数
const asyncResult = basicAsync();
console.log('Async function returned:', asyncResult); // Promise 对象
asyncResult.then(value => console.log('Async return value:', value));

// async/await 错误处理
async function errorHandling() {
    try {
        const result = await new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Something went wrong')), 1000);
        });
        
        console.log('This will not be executed');
    } catch (error) {
        console.log('Error caught:', error.message);
    }
}

errorHandling();

// 多个 await 的执行顺序
async function multipleAwaits() {
    console.log('Start multiple awaits');
    
    const start = Date.now();
    
    // 串行执行 - 每个 await 等待前一个完成
    const result1 = await new Promise(resolve => setTimeout(() => resolve('1'), 1000));
    const result2 = await new Promise(resolve => setTimeout(() => resolve('2'), 1000));
    const result3 = await new Promise(resolve => setTimeout(() => resolve('3'), 1000));
    
    console.log('Serial results:', result1, result2, result3);
    console.log('Serial time:', Date.now() - start, 'ms'); // 约 3000ms
    
    // 并行执行 - 同时开始，然后等待所有完成
    const startParallel = Date.now();
    
    const promise1 = new Promise(resolve => setTimeout(() => resolve('1'), 1000));
    const promise2 = new Promise(resolve => setTimeout(() => resolve('2'), 1000));
    const promise3 = new Promise(resolve => setTimeout(() => resolve('3'), 1000));
    
    const [res1, res2, res3] = await Promise.all([promise1, promise2, promise3]);
    
    console.log('Parallel results:', res1, res2, res3);
    console.log('Parallel time:', Date.now() - startParallel, 'ms'); // 约 1000ms
}

// multipleAwaits();
```

### 详细对比示例

```javascript
// 比较三种异步处理方式
console.log('=== 比较三种异步处理方式 ===');

// 1. setTimeout 方式
function setTimeoutWay() {
    console.log('1. setTimeout start');
    
    setTimeout(() => {
        console.log('1. setTimeout callback 1');
        setTimeout(() => {
            console.log('1. setTimeout callback 2');
            setTimeout(() => {
                console.log('1. setTimeout callback 3');
            }, 100);
        }, 100);
    }, 100);
    
    console.log('1. setTimeout end');
}

// 2. Promise 方式
function promiseWay() {
    console.log('2. Promise start');
    
    Promise.resolve()
        .then(() => {
            console.log('2. Promise step 1');
            return new Promise(resolve => setTimeout(() => resolve(), 100));
        })
        .then(() => {
            console.log('2. Promise step 2');
            return new Promise(resolve => setTimeout(() => resolve(), 100));
        })
        .then(() => {
            console.log('2. Promise step 3');
        });
    
    console.log('2. Promise end');
}

// 3. Async/Await 方式
async function asyncWay() {
    console.log('3. Async start');
    
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    console.log('3. Async step 1');
    
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    console.log('3. Async step 2');
    
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    console.log('3. Async step 3');
    
    console.log('3. Async end');
}

// 执行比较
setTimeoutWay();
promiseWay();
asyncWay();

console.log('Main execution finished');
```

### 事件循环和任务队列详解

```javascript
// 详细的事件循环示例
console.log('Main start');

// 同步任务
console.log('Sync 1');

// 宏任务
setTimeout(() => {
    console.log('Macro task 1');
    Promise.resolve().then(() => {
        console.log('Micro task in macro 1');
    });
}, 0);

// 微任务
Promise.resolve().then(() => {
    console.log('Micro task 1');
});

// 同步任务
console.log('Sync 2');

// 微任务
Promise.resolve().then(() => {
    console.log('Micro task 2');
    setTimeout(() => {
        console.log('Nested macro in micro');
    }, 0);
});

// 宏任务
setTimeout(() => {
    console.log('Macro task 2');
}, 0);

// 同步任务
console.log('Sync 3');

// async/await 任务
async function asyncExample() {
    console.log('Async start');
    await Promise.resolve();
    console.log('After await');
}
asyncExample();

console.log('Main end');

// 预期输出：
// Main start
// Sync 1
// Sync 2
// Sync 3
// Async start
// Main end
// Micro task 1
// Micro task 2
// After await
// Macro task 1
// Micro task in macro 1
// Macro task 2
// Nested macro in micro
```

### 实际应用场景

```javascript
// 实际场景：API 调用比较

// 使用 setTimeout（不推荐，仅作对比）
function apiCallWithSetTimeout(url, callback) {
    setTimeout(() => {
        // 模拟 API 调用
        const result = { data: `Data from ${url}`, status: 200 };
        callback(null, result);
    }, 1000);
}

// 使用 Promise
function apiCallWithPromise(url) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = Math.random() > 0.2; // 80% 成功率
            if (success) {
                const result = { data: `Data from ${url}`, status: 200 };
                resolve(result);
            } else {
                reject(new Error('API call failed'));
            }
        }, 1000);
    });
}

// 使用 async/await
async function apiCallWithAsync(url) {
    const result = await apiCallWithPromise(url);
    return result;
}

// 使用示例
// 1. setTimeout 方式（回调地狱）
apiCallWithSetTimeout('/api/users', (err, users) => {
    if (err) {
        console.log('Error:', err);
        return;
    }
    
    apiCallWithSetTimeout(`/api/users/${users.data}/posts`, (err, posts) => {
        if (err) {
            console.log('Error:', err);
            return;
        }
        
        apiCallWithSetTimeout(`/api/posts/${posts.data}/comments`, (err, comments) => {
            if (err) {
                console.log('Error:', err);
                return;
            }
            
            console.log('All data:', users, posts, comments);
        });
    });
});

// 2. Promise 方式
apiCallWithPromise('/api/users')
    .then(users => {
        console.log('Users:', users);
        return apiCallWithPromise(`/api/users/${users.data}/posts`);
    })
    .then(posts => {
        console.log('Posts:', posts);
        return apiCallWithPromise(`/api/posts/${posts.data}/comments`);
    })
    .then(comments => {
        console.log('Comments:', comments);
    })
    .catch(err => {
        console.log('Error:', err);
    });

// 3. async/await 方式
async function fetchAllData() {
    try {
        const users = await apiCallWithPromise('/api/users');
        console.log('Users:', users);
        
        const posts = await apiCallWithPromise(`/api/users/${users.data}/posts`);
        console.log('Posts:', posts);
        
        const comments = await apiCallWithPromise(`/api/posts/${posts.data}/comments`);
        console.log('Comments:', comments);
        
        return { users, posts, comments };
    } catch (error) {
        console.log('Error:', error);
    }
}

fetchAllData();
```

### 性能和内存考虑

```javascript
// 性能对比示例
function performanceComparison() {
    const iterations = 10000;
    
    // 测试 Promise 创建开销
    console.time('Promise creation');
    for (let i = 0; i < iterations; i++) {
        new Promise(() => {});
    }
    console.timeEnd('Promise creation');
    
    // 测试 setTimeout 创建开销
    console.time('setTimeout creation');
    for (let i = 0; i < iterations; i++) {
        setTimeout(() => {}, 0);
    }
    console.timeEnd('setTimeout creation');
    
    // 测试 async 函数创建开销
    console.time('async function creation');
    for (let i = 0; i < iterations; i++) {
        async function test() {}
    }
    console.timeEnd('async function creation');
}

// performanceComparison();
```
