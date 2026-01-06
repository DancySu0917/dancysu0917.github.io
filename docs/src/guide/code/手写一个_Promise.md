# 手写一个 Promise？（高薪常问）

**题目**: 手写一个 Promise？（高薪常问）

## 标准答案

手写一个完整的 Promise 实现需要遵循 Promise/A+ 规范，主要包含三个状态（pending、fulfilled、rejected）、状态不可逆转换、then 方法链式调用、异步执行、错误处理等核心特性。完整实现需要考虑微任务调度、值穿透、循环引用等边界情况。

## 详细解析

### 1. Promise 核心概念
- **三种状态**: pending（等待）、fulfilled（已成功）、rejected（已失败）
- **状态转换**: 状态只能从 pending 转换为 fulfilled 或 rejected，且不可逆
- **值/原因**: fulfilled 状态保存成功值，rejected 状态保存失败原因
- **then 方法**: 用于注册成功和失败的回调函数

### 2. Promise/A+ 规范要点
- **异步执行**: then 方法必须异步执行
- **值穿透**: 如果 onFulfilled 或 onRejected 不是函数，必须忽略
- **错误传播**: Promise 链中的错误会自动传播到下一个 catch
- **链式调用**: then 方法必须返回一个新的 Promise

### 3. 关键实现难点
- **微任务调度**: 使用 queueMicrotask 或 setTimeout 模拟
- **循环引用处理**: 防止 Promise 和 thenable 相互引用
- **错误边界**: 捕获执行器和回调函数中的错误
- **值穿透**: 保持链式调用的连贯性

## 代码实现

### 1. 基础 Promise 实现

```javascript
// 定义 Promise 的三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    // 初始状态
    this.status = PENDING;
    // 成功的值
    this.value = undefined;
    // 失败的原因
    this.reason = undefined;
    // 存储成功回调的数组
    this.onFulfilledCallbacks = [];
    // 存储失败回调的数组
    this.onRejectedCallbacks = [];

    // 成功时执行的函数
    const resolve = (value) => {
      // 只有在 pending 状态才能改变状态
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        // 执行所有成功回调
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    // 失败时执行的函数
    const reject = (reason) => {
      // 只有在 pending 状态才能改变状态
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        // 执行所有失败回调
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    // 执行器立即执行，捕获可能的错误
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  // then 方法
  then(onFulfilled, onRejected) {
    // 参数可选处理：如果 onFulfilled 不是函数，则创建一个返回原值的函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    // 参数可选处理：如果 onRejected 不是函数，则创建一个抛出错误的函数
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };

    // 创建一个新的 Promise 来实现链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 异步执行，保证 promise2 已经创建完毕
        queueMicrotask(() => {
          try {
            // 获取 onFulfilled 的执行结果
            const x = onFulfilled(this.value);
            // 解析 x 和 promise2 的关系
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status === REJECTED) {
        // 异步执行，保证 promise2 已经创建完毕
        queueMicrotask(() => {
          try {
            // 获取 onRejected 的执行结果
            const x = onRejected(this.reason);
            // 解析 x 和 promise2 的关系
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status === PENDING) {
        // 如果状态还是 pending，将回调函数保存起来
        this.onFulfilledCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  // catch 方法
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  // finally 方法
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason; })
    );
  }
}

// 解析 promise 和 x 的关系
function resolvePromise(promise2, x, resolve, reject) {
  // 如果 promise2 和 x 相等，抛出 TypeError
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  let called = false; // 防止多次调用 resolve 或 reject

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // 获取 then 方法
      const then = x.then;
      if (typeof then === 'function') {
        // 如果 x 是一个 thenable 对象
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // x 是普通对象
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // x 是普通值
    resolve(x);
  }
}

// 静态方法
MyPromise.resolve = function(value) {
  if (value instanceof MyPromise) {
    return value;
  }
  return new MyPromise(resolve => resolve(value));
};

MyPromise.reject = function(reason) {
  return new MyPromise((resolve, reject) => reject(reason));
};

MyPromise.all = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }
    
    const results = [];
    let completedCount = 0;
    
    if (promises.length === 0) {
      return resolve(results);
    }
    
    for (let i = 0; i < promises.length; i++) {
      MyPromise.resolve(promises[i]).then(
        value => {
          results[i] = value;
          completedCount++;
          
          if (completedCount === promises.length) {
            resolve(results);
          }
        },
        reason => {
          reject(reason);
        }
      );
    }
  });
};

MyPromise.race = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Promise.race accepts an array'));
    }
    
    for (let i = 0; i < promises.length; i++) {
      MyPromise.resolve(promises[i]).then(
        value => resolve(value),
        reason => reject(reason)
      );
    }
  });
};

// 测试用例
const promise1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功');
  }, 1000);
});

promise1
  .then(value => {
    console.log('第一个then:', value);
    return '链式调用';
  })
  .then(value => {
    console.log('第二个then:', value);
    return MyPromise.resolve('嵌套Promise');
  })
  .then(value => {
    console.log('第三个then:', value);
  })
  .catch(error => {
    console.error('错误:', error);
  });

// 测试循环引用
// const p = new MyPromise(resolve => resolve(1));
// const p2 = p.then(value => p2); // 这会抛出循环引用错误
```

### 2. 优化版 Promise 实现（支持更多特性）

```javascript
// 优化版 Promise 实现，增加更多功能
class EnhancedPromise {
  constructor(executor) {
    this.status = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    
    // 添加异步任务队列
    this.nextTick = (fn) => {
      if (typeof queueMicrotask === 'function') {
        queueMicrotask(fn);
      } else if (typeof Promise !== 'undefined') {
        Promise.resolve().then(fn);
      } else {
        setTimeout(fn, 0);
      }
    };

    const resolve = (value) => {
      if (value instanceof EnhancedPromise) {
        return value.then(resolve, reject);
      }
      if (this.status === 'pending') {
        this.status = 'resolved';
        this.value = value;
        this.onResolvedCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => { throw r; };

    const promise2 = new EnhancedPromise((resolve, reject) => {
      if (this.status === 'resolved') {
        this.nextTick(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status === 'rejected') {
        this.nextTick(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.status === 'pending') {
        this.onResolvedCallbacks.push(() => {
          this.nextTick(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          this.nextTick(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      value => EnhancedPromise.resolve(callback()).then(() => value),
      reason => EnhancedPromise.resolve(callback()).then(() => { throw reason; })
    );
  }
}

// resolvePromise 函数（与基础实现相同）
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  let called = false;

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}

// 静态方法实现
EnhancedPromise.resolve = function(value) {
  if (value instanceof EnhancedPromise) {
    return value;
  }
  return new EnhancedPromise(resolve => resolve(value));
};

EnhancedPromise.reject = function(reason) {
  return new EnhancedPromise((resolve, reject) => reject(reason));
};

EnhancedPromise.all = function(promises) {
  return new EnhancedPromise((resolve, reject) => {
    const results = [];
    let completedCount = 0;
    
    if (promises.length === 0) {
      return resolve(results);
    }
    
    for (let i = 0; i < promises.length; i++) {
      EnhancedPromise.resolve(promises[i]).then(
        value => {
          results[i] = value;
          completedCount++;
          
          if (completedCount === promises.length) {
            resolve(results);
          }
        },
        reason => reject(reason)
      );
    }
  });
};

EnhancedPromise.allSettled = function(promises) {
  return new EnhancedPromise(resolve => {
    const results = [];
    let completedCount = 0;
    
    if (promises.length === 0) {
      return resolve(results);
    }
    
    for (let i = 0; i < promises.length; i++) {
      EnhancedPromise.resolve(promises[i]).then(
        value => {
          results[i] = { status: 'fulfilled', value };
          completedCount++;
          if (completedCount === promises.length) {
            resolve(results);
          }
        },
        reason => {
          results[i] = { status: 'rejected', reason };
          completedCount++;
          if (completedCount === promises.length) {
            resolve(results);
          }
        }
      );
    }
  });
};

EnhancedPromise.race = function(promises) {
  return new EnhancedPromise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      EnhancedPromise.resolve(promises[i]).then(resolve, reject);
    }
  });
};

EnhancedPromise.any = function(promises) {
  return new EnhancedPromise((resolve, reject) => {
    const errors = [];
    let rejectedCount = 0;
    
    if (promises.length === 0) {
      return reject(new AggregateError('All promises were rejected'));
    }
    
    for (let i = 0; i < promises.length; i++) {
      EnhancedPromise.resolve(promises[i]).then(
        value => resolve(value),
        reason => {
          errors[i] = reason;
          rejectedCount++;
          
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    }
  });
};
```

### 3. Promise 实际应用场景

```javascript
// 1. 模拟异步请求
function fetchUser(id) {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, name: `User${id}` });
      } else {
        reject(new Error('Invalid user ID'));
      }
    }, 1000);
  });
}

// 2. 链式调用处理用户数据
fetchUser(1)
  .then(user => {
    console.log('User fetched:', user);
    return fetchUser(user.id + 1); // 获取下一个用户
  })
  .then(nextUser => {
    console.log('Next user:', nextUser);
    return { ...nextUser, profile: 'complete' }; // 添加额外信息
  })
  .then(finalData => {
    console.log('Final data:', finalData);
  })
  .catch(error => {
    console.error('Error in chain:', error.message);
  });

// 3. 并行处理多个请求
const requests = [fetchUser(1), fetchUser(2), fetchUser(3)];
MyPromise.all(requests)
  .then(users => {
    console.log('All users:', users);
  })
  .catch(error => {
    console.error('One of the requests failed:', error.message);
  });

// 4. 处理竞态条件
const fastRequest = new MyPromise(resolve => setTimeout(() => resolve('fast'), 100));
const slowRequest = new MyPromise(resolve => setTimeout(() => resolve('slow'), 1000));

MyPromise.race([fastRequest, slowRequest])
  .then(result => {
    console.log('Race winner:', result); // 'fast'
  });
```

## 实际应用场景

1. **异步请求处理**: 在现代前端开发中，Promise 是处理异步操作的基础，如 API 请求、文件上传等。
2. **链式调用**: 通过 Promise 链实现复杂的异步操作序列，避免回调地狱。
3. **错误处理**: 统一处理异步操作中的错误，提供更好的错误传播机制。
4. **并行执行**: 使用 Promise.all、Promise.race 等方法处理多个并发请求。
5. **前端框架**: React、Vue 等框架内部大量使用 Promise 来处理组件生命周期和异步数据获取。

## 面试要点

1. **Promise 的三个状态及其转换**: 理解状态转换的不可逆性。
2. **异步执行机制**: 理解 then 方法的异步执行特性。
3. **错误传播**: 掌握错误如何在 Promise 链中传播。
4. **值穿透**: 理解未提供处理函数时的值传递机制。
5. **循环引用**: 防止 Promise 和 thenable 相互引用导致的死循环。
6. **微任务与宏任务**: 理解 Promise.then 的执行时机。
7. **静态方法实现**: 熟练实现 all、race、allSettled 等方法。

掌握完整的 Promise 实现不仅有助于理解 JavaScript 异步编程的核心机制，也是高级前端工程师的必备技能。
