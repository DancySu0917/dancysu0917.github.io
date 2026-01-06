# Promise.all 和 Promise.allSettled 的区别（了解）

**题目**: Promise.all 和 Promise.allSettled 的区别（了解）

## 标准答案

Promise.all 和 Promise.allSettled 是 JavaScript 中用于处理多个 Promise 的两个重要方法，它们的主要区别如下：

### 1. 错误处理机制
- **Promise.all**: 如果任何一个 Promise 被拒绝（rejected），整个 Promise.all 立即被拒绝，其余 Promise 的结果被忽略
- **Promise.allSettled**: 等待所有 Promise 都完成（无论是 fulfilled 还是 rejected），不因单个失败而中断

### 2. 返回时机
- **Promise.all**: 所有 Promise 都 fulfilled 时才返回，返回值是所有 Promise 结果的数组
- **Promise.allSettled**: 所有 Promise 都 settled（fulfilled 或 rejected）时返回，返回值是包含每个 Promise 状态和结果的对象数组

### 3. 适用场景
- **Promise.all**: 适用于所有请求都必须成功的场景（如依赖多个接口数据）
- **Promise.allSettled**: 适用于需要等待所有请求完成，但允许部分失败的场景

## 深入解析

### Promise.all 的工作原理
```javascript
// Promise.all 示例
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
    setTimeout(resolve, 100, 'foo');
});

Promise.all([promise1, promise2, promise3])
    .then(values => {
        console.log(values); // [3, 42, 'foo']
    });

// Promise.all 错误处理
const promise4 = Promise.resolve(1);
const promise5 = Promise.reject('Error');
const promise6 = new Promise(resolve => setTimeout(resolve, 100));

Promise.all([promise4, promise5, promise6])
    .then(values => {
        console.log(values); // 不会执行
    })
    .catch(error => {
        console.log(error); // 'Error' - 第一个错误
    });
```

### Promise.allSettled 的工作原理
```javascript
// Promise.allSettled 示例
const promise1 = Promise.resolve(3);
const promise2 = new Promise((resolve, reject) => 
    setTimeout(reject, 100, 'foo')
);
const promise3 = Promise.reject(new Error('bar'));

Promise.allSettled([promise1, promise2, promise3])
    .then(results => {
        console.log(results);
        // [
        //   { status: 'fulfilled', value: 3 },
        //   { status: 'rejected', reason: 'foo' },
        //   { status: 'rejected', reason: Error: 'bar' }
        // ]
    });
```

### 性能对比
```javascript
// 性能对比示例
async function performanceComparison() {
    const promises = [
        fetch('/api/data1'),
        fetch('/api/data2'),
        fetch('/api/data3')
    ];
    
    // Promise.all - 任何一个失败都会中断
    try {
        const results = await Promise.all(promises);
        console.log('所有请求成功:', results);
    } catch (error) {
        console.log('至少一个请求失败:', error);
    }
    
    // Promise.allSettled - 等待所有完成
    const results = await Promise.allSettled(promises);
    const successful = results.filter(result => result.status === 'fulfilled');
    const failed = results.filter(result => result.status === 'rejected');
    
    console.log(`成功: ${successful.length}, 失败: ${failed.length}`);
}
```

## 实际面试问答

**面试官**: Promise.all 和 Promise.allSettled 在实际项目中如何选择？

**候选人**: 
1. **使用 Promise.all 的场景**：
   - 需要获取用户信息、权限、配置等多个接口数据，缺一不可
   - 批量上传文件，要求全部成功才视为成功
   - 依赖多个异步操作结果的业务逻辑

2. **使用 Promise.allSettled 的场景**：
   - 数据统计上报，部分失败不影响其他数据上报
   - 批量处理任务，需要了解每个任务的执行结果
   - 并行请求多个接口，允许部分失败但需要统计成功率

**面试官**: 如何实现一个兼容旧版本的 Promise.allSettled？

**候选人**:
```javascript
// 兼容实现
function promiseAllSettled(promises) {
    return Promise.all(
        promises.map(promise => 
            Promise.resolve(promise)
                .then(value => ({ status: 'fulfilled', value }))
                .catch(reason => ({ status: 'rejected', reason }))
        )
    );
}

// 使用示例
promiseAllSettled([
    Promise.resolve(1),
    Promise.reject('error'),
    fetch('/api/data')
]).then(results => {
    console.log(results);
});
```
