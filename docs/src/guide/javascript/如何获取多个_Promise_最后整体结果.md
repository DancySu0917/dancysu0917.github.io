# 如何获取多个 Promise 最后整体结果？（必会）

**题目**: 如何获取多个 Promise 最后整体结果？（必会）

## 标准答案

获取多个 Promise 的整体结果有以下几种方法：

1. **Promise.all()**：所有 Promise 都成功时返回结果数组，任何一个失败则立即返回失败
2. **Promise.allSettled()**：等待所有 Promise 完成（无论成功或失败），返回每个 Promise 的状态和结果
3. **Promise.race()**：返回第一个完成的 Promise 的结果（无论是成功还是失败）
4. **Promise.any()**：返回第一个成功的 Promise，如果全部失败则抛出 AggregateError

## 深入理解

### Promise.all() - 全部成功才成功

```javascript
// Promise.all 基本用法
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
    .then(results => {
        console.log(results); // [1, 2, 3] - 按照数组顺序返回结果
    })
    .catch(error => {
        console.error('有 Promise 失败:', error);
    });

// 实际应用：并行请求多个 API
const fetchUser = () => fetch('/api/user').then(res => res.json());
const fetchPosts = () => fetch('/api/posts').then(res => res.json());
const fetchComments = () => fetch('/api/comments').then(res => res.json());

Promise.all([fetchUser(), fetchPosts(), fetchComments()])
    .then(([user, posts, comments]) => {
        console.log('用户:', user);
        console.log('文章:', posts);
        console.log('评论:', comments);
    })
    .catch(error => {
        console.error('获取数据失败:', error);
    });
```

```javascript
// Promise.all 的失败处理
const successPromise = Promise.resolve('成功');
const failPromise = Promise.reject('失败');
const anotherPromise = new Promise(resolve => setTimeout(() => resolve('延迟'), 100));

Promise.all([successPromise, failPromise, anotherPromise])
    .then(results => {
        console.log('不会执行');
    })
    .catch(error => {
        console.log('捕获错误:', error); // 输出：捕获错误: 失败
        // 注意：anotherPromise 即使未完成也会被取消
    });
```

### Promise.allSettled() - 等待全部完成

```javascript
// Promise.allSettled 基本用法
const promises = [
    Promise.resolve(1),
    Promise.reject('错误'),
    Promise.resolve(3),
    Promise.reject('另一个错误'),
    new Promise(resolve => setTimeout(() => resolve('延迟完成'), 100))
];

Promise.allSettled(promises)
    .then(results => {
        console.log(results);
        // 输出：
        // [
        //   { status: 'fulfilled', value: 1 },
        //   { status: 'rejected', reason: '错误' },
        //   { status: 'fulfilled', value: 3 },
        //   { status: 'rejected', reason: '另一个错误' },
        //   { status: 'fulfilled', value: '延迟完成' }
        // ]
        
        // 分析结果
        const fulfilled = results.filter(result => result.status === 'fulfilled');
        const rejected = results.filter(result => result.status === 'rejected');
        
        console.log(`成功: ${fulfilled.length}, 失败: ${rejected.length}`);
    });

// 实际应用：批量处理可能失败的请求
async function batchProcess(urls) {
    const promises = urls.map(url => fetch(url).then(res => res.json()));
    
    const results = await Promise.allSettled(promises);
    
    const successful = [];
    const failed = [];
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            successful.push({ url: urls[index], data: result.value });
        } else {
            failed.push({ url: urls[index], error: result.reason });
        }
    });
    
    return { successful, failed };
}
```

### Promise.race() - 返回最快完成的

```javascript
// Promise.race 基本用法
const promise1 = new Promise(resolve => setTimeout(() => resolve('第一个'), 3000));
const promise2 = new Promise(resolve => setTimeout(() => resolve('第二个'), 1000));
const promise3 = new Promise((_, reject) => setTimeout(() => reject('错误'), 500));

Promise.race([promise1, promise2, promise3])
    .then(result => {
        console.log('成功:', result); // 输出：成功: 第二个 (因为 promise2 最快完成)
    })
    .catch(error => {
        console.log('失败:', error); // 如果 promise3 最快，则输出：失败: 错误
    });

// 实际应用：请求超时处理
function fetchWithTimeout(url, timeout = 5000) {
    const fetchPromise = fetch(url);
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时')), timeout)
    );
    
    return Promise.race([fetchPromise, timeoutPromise]);
}

fetchWithTimeout('/api/data', 3000)
    .then(response => response.json())
    .then(data => console.log('数据:', data))
    .catch(error => console.error('错误:', error.message));
```

### Promise.any() - 返回第一个成功的

```javascript
// Promise.any 基本用法
const promises = [
    Promise.reject('失败1'),
    Promise.reject('失败2'),
    Promise.resolve('成功'),
    Promise.resolve('也成功')
];

Promise.any(promises)
    .then(result => {
        console.log('第一个成功:', result); // 输出：第一个成功: 成功
    })
    .catch(error => {
        console.log('所有都失败:', error); // 如果所有都失败，会抛出 AggregateError
    });

// 实际应用：从多个 API 获取相同数据，返回最快成功的
async function fetchFromMultipleSources() {
    const sources = [
        '/api/source1/data',
        '/api/source2/data', 
        '/api/source3/data'
    ];
    
    const promises = sources.map(url => 
        fetch(url).then(res => res.json())
    );
    
    try {
        const result = await Promise.any(promises);
        console.log('获取到数据:', result);
        return result;
    } catch (error) {
        if (error instanceof AggregateError) {
            console.error('所有数据源都失败了:', error.errors);
        }
    }
}
```

### 高级用法和实际场景

```javascript
// 1. 使用 Promise.all 并发控制
async function limitedConcurrency(promises, limit = 3) {
    const results = [];
    
    for (let i = 0; i < promises.length; i += limit) {
        const batch = promises.slice(i, i + limit);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
    }
    
    return results;
}

// 2. 自定义 Promise.allPolyfill
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            resolve([]);
            return;
        }
        
        const results = new Array(promises.length);
        let completedCount = 0;
        let rejected = false;
        
        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(value => {
                    if (rejected) return;
                    
                    results[index] = value;
                    completedCount++;
                    
                    if (completedCount === promises.length) {
                        resolve(results);
                    }
                })
                .catch(error => {
                    if (rejected) return;
                    rejected = true;
                    reject(error);
                });
        });
    });
}

// 3. 自定义 Promise.allSettledPolyfill
function promiseAllSettled(promises) {
    return new Promise(resolve => {
        if (promises.length === 0) {
            resolve([]);
            return;
        }
        
        const results = new Array(promises.length);
        let completedCount = 0;
        
        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(value => {
                    results[index] = { status: 'fulfilled', value };
                    completedCount++;
                    
                    if (completedCount === promises.length) {
                        resolve(results);
                    }
                })
                .catch(reason => {
                    results[index] = { status: 'rejected', reason };
                    completedCount++;
                    
                    if (completedCount === promises.length) {
                        resolve(results);
                    }
                });
        });
    });
}

// 4. 组合使用多种 Promise 方法
async function complexScenario() {
    const urls = ['/api/users', '/api/posts', '/api/comments'];
    const fetchPromises = urls.map(url => fetch(url));
    
    // 使用 race 设置整体超时
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('整体超时')), 10000)
    );
    
    try {
        // 等待所有请求或超时
        const responses = await Promise.race([
            Promise.all(fetchPromises),
            timeoutPromise
        ]);
        
        // 解析响应体
        const dataPromises = responses.map(res => res.json());
        const results = await Promise.allSettled(dataPromises);
        
        // 分类处理结果
        const successful = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
            
        const failed = results
            .filter(result => result.status === 'rejected')
            .map(result => result.reason);
            
        return { successful, failed };
    } catch (error) {
        console.error('请求过程出错:', error);
        throw error;
    }
}

// 5. 错误重试机制
async function fetchWithRetry(promiseFactory, maxRetries = 3) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await promiseFactory();
        } catch (error) {
            if (i === maxRetries) {
                throw error; // 最后一次重试失败，抛出错误
            }
            console.log(`重试第 ${i + 1} 次...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 递增延迟
        }
    }
}

// 使用示例
const promisesWithRetry = [
    fetchWithRetry(() => fetch('/api/data1').then(res => res.json())),
    fetchWithRetry(() => fetch('/api/data2').then(res => res.json())),
    fetchWithRetry(() => fetch('/api/data3').then(res => res.json()))
];

Promise.all(promisesWithRetry)
    .then(results => console.log('所有请求成功:', results))
    .catch(error => console.error('仍有请求失败:', error));
```

### 性能优化建议

```javascript
// 1. 避免不必要的 Promise.all 嵌套
// 不好的做法
async function badExample() {
    const users = await fetch('/api/users').then(res => res.json());
    const promises = users.map(user => 
        Promise.all([
            fetch(`/api/user/${user.id}/profile`).then(res => res.json()),
            fetch(`/api/user/${user.id}/posts`).then(res => res.json())
        ])
    );
    return Promise.all(promises);
}

// 更好的做法
async function goodExample() {
    const users = await fetch('/api/users').then(res => res.json());
    
    const profilePromises = users.map(user => 
        fetch(`/api/user/${user.id}/profile`).then(res => res.json())
    );
    
    const postPromises = users.map(user => 
        fetch(`/api/user/${user.id}/posts`).then(res => res.json())
    );
    
    const [profiles, posts] = await Promise.all([
        Promise.all(profilePromises),
        Promise.all(postPromises)
    ]);
    
    return { profiles, posts };
}
```

选择合适的 Promise 组合方法取决于具体需求：
- 如果需要所有请求都成功：使用 `Promise.all()`
- 如果需要处理可能的失败：使用 `Promise.allSettled()`
- 如果只需要最快的结果：使用 `Promise.race()`
- 如果需要至少一个成功：使用 `Promise.any()`
