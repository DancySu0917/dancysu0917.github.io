# Promise 有几种状态，什么时候会进入 catch？（必会）

**题目**: Promise 有几种状态，什么时候会进入 catch？（必会）

## 标准答案

Promise 有三种状态：
1. **pending（进行中）**：初始状态，既不是成功也不是失败
2. **fulfilled（已成功）**：操作成功完成
3. **rejected（已失败）**：操作失败

Promise 只能从 pending 状态转换为 fulfilled 或 rejected 状态，且状态转换不可逆。

Promise 会在以下情况进入 catch：
1. Promise 被 reject
2. Promise 执行过程中抛出异常
3. Promise 链中前面的 Promise 被 reject

## 深入理解

### Promise 状态详解

Promise 是 JavaScript 中处理异步操作的一种方式，它的状态转换是单向且不可逆的：

1. **pending → fulfilled**：异步操作成功完成
2. **pending → rejected**：异步操作失败
3. 一旦状态改变，就不会再变，会一直保持这个状态

```javascript
const promise = new Promise((resolve, reject) => {
    // 初始状态为 pending
    console.log('初始状态：pending');
    
    setTimeout(() => {
        // 根据条件决定是 resolve 还是 reject
        const success = Math.random() > 0.5;
        if (success) {
            resolve('操作成功'); // 状态变为 fulfilled
        } else {
            reject('操作失败'); // 状态变为 rejected
        }
    }, 1000);
});

// 监听状态变化
promise
    .then(result => console.log('成功：', result))
    .catch(error => console.log('失败：', error));
```

### Promise 状态转换规则

```javascript
// 状态一旦确定就不可更改
const promise = new Promise((resolve, reject) => {
    resolve('第一次 resolve');
    reject('第一次 reject'); // 这个会被忽略
    resolve('第二次 resolve'); // 这个也会被忽略
});

promise.then(result => console.log(result)); // 输出：第一次 resolve
```

### 进入 catch 的各种情况

1. **显式调用 reject**：
```javascript
const promise = new Promise((resolve, reject) => {
    reject('手动 reject');
});

promise.catch(error => console.log(error)); // 输出：手动 reject
```

2. **执行器中抛出异常**：
```javascript
const promise = new Promise((resolve, reject) => {
    throw new Error('执行器中抛出异常');
});

promise.catch(error => console.log(error.message)); // 输出：执行器中抛出异常
```

3. **then 方法中抛出异常**：
```javascript
Promise.resolve()
    .then(() => {
        throw new Error('then 中抛出异常');
    })
    .catch(error => console.log(error.message)); // 输出：then 中抛出异常
```

4. **异步操作失败**：
```javascript
function fetchWithError() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('网络请求失败'));
        }, 1000);
    });
}

fetchWithError()
    .then(result => console.log(result))
    .catch(error => console.log(error.message)); // 输出：网络请求失败
```

5. **Promise 链中的错误传播**：
```javascript
Promise.resolve(1)
    .then(value => {
        console.log('第一个 then:', value); // 输出：第一个 then: 1
        return Promise.reject('链式调用中 reject');
    })
    .then(value => {
        console.log('第二个 then 不会执行');
    })
    .catch(error => {
        console.log('catch 捕获错误:', error); // 输出：catch 捕获错误: 链式调用中 reject
        return '错误处理后返回值';
    })
    .then(value => {
        console.log('错误处理后继续:', value); // 输出：错误处理后继续: 错误处理后返回值
    });
```

### Promise.all 和 Promise.race 中的错误处理

```javascript
// Promise.all 中任何一个 Promise 失败，整个 Promise.all 就会失败
Promise.all([
    Promise.resolve(1),
    Promise.reject('失败'),
    Promise.resolve(3)
])
.then(results => console.log('不会执行'))
.catch(error => console.log('Promise.all 失败:', error)); // 输出：Promise.all 失败: 失败

// Promise.race 中第一个 resolve 或 reject 的 Promise 决定结果
Promise.race([
    Promise.reject('失败'),
    new Promise(resolve => setTimeout(() => resolve('延时'), 100))
])
.then(result => console.log('不会执行'))
.catch(error => console.log('Promise.race 失败:', error)); // 输出：Promise.race 失败: 失败
```

### 错误处理最佳实践

```javascript
// 1. 始终使用 catch 处理错误
fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => {
        console.error('请求失败:', error);
        // 进行错误处理，如显示错误信息、重试等
    });

// 2. 在 Promise 链的末尾添加 catch
Promise.resolve()
    .then(() => {
        // 一些操作
        throw new Error('错误');
    })
    .then(() => {
        // 这个不会执行
    })
    .catch(error => {
        // 捕获前面所有可能的错误
        console.error('捕获错误:', error.message);
    });

// 3. 使用 finally 进行清理工作
Promise.resolve()
    .then(() => {
        console.log('执行异步操作');
        return '结果';
    })
    .catch(error => {
        console.error('错误处理:', error);
    })
    .finally(() => {
        // 无论成功还是失败都会执行
        console.log('清理工作');
    });
```

理解 Promise 的状态和错误处理机制对于编写可靠的异步代码至关重要。正确使用 catch 可以让程序在遇到错误时优雅地处理，而不是让错误传播导致程序崩溃。
