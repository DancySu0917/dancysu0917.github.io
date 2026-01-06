# Promise 中 reject 和 catch 处理上有什么区别（高薪常问）

**题目**: Promise 中 reject 和 catch 处理上有什么区别（高薪常问）

## 标准答案

Promise 中 reject 和 catch 的主要区别：

1. **作用不同**：reject 用于主动拒绝一个 Promise，改变 Promise 状态为 rejected；catch 用于捕获和处理 Promise 链中的错误
2. **使用时机不同**：reject 通常在 Promise 构造函数内部或执行器函数中使用；catch 用于 Promise 链的末尾
3. **链式调用**：reject 会中断当前 Promise 链并跳转到下一个错误处理；catch 处理错误后可以继续 Promise 链
4. **语法位置**：reject 是 Promise 构造函数的参数之一；catch 是 Promise 原型上的方法

## 深入理解

### 1. reject 的作用和使用

**reject 是 Promise 构造函数的参数之一：**

```javascript
// 在 Promise 构造函数中使用 reject
const myPromise = new Promise((resolve, reject) => {
    // 模拟异步操作
    setTimeout(() => {
        const error = true;
        if (error) {
            // 主动拒绝 Promise
            reject(new Error('操作失败'));
        } else {
            resolve('操作成功');
        }
    }, 1000);
});

myPromise
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.log('错误:', error.message); // 输出: 错误: 操作失败
    });
```

**在 Promise 链中使用 reject：**

```javascript
// 通过 Promise.reject() 创建一个已拒绝的 Promise
const rejectedPromise = Promise.reject(new Error('这是个错误'));

rejectedPromise
    .then(result => {
        console.log('这不会执行');
    })
    .catch(error => {
        console.log('捕获到错误:', error.message);
    });
```

### 2. catch 的作用和使用

**catch 用于捕获 Promise 链中的错误：**

```javascript
// catch 捕获错误并可以继续 Promise 链
Promise.resolve()
    .then(() => {
        throw new Error('发生错误');
    })
    .catch(error => {
        console.log('捕获错误:', error.message);
        // 返回正常值，Promise 链可以继续
        return '错误已处理';
    })
    .then(result => {
        console.log('继续执行:', result); // 输出: 继续执行: 错误已处理
    });
```

### 3. reject 和 catch 的详细区别对比

**区别一：错误传播方式**

```javascript
// reject 会中断当前链并跳转到错误处理
Promise.resolve()
    .then(() => {
        return Promise.reject(new Error('错误1'));
    })
    .then(() => {
        console.log('这不会执行'); // 不会执行
    })
    .catch(error => {
        console.log('捕获:', error.message); // 捕获: 错误1
        // 不处理错误，继续传播
        throw new Error('错误2');
    })
    .then(() => {
        console.log('这也不会执行'); // 不会执行
    })
    .catch(error => {
        console.log('最终捕获:', error.message); // 最终捕获: 错误2
    });
```

**区别二：错误处理后的行为**

```javascript
// catch 处理错误后可以恢复 Promise 链
Promise.resolve()
    .then(() => {
        throw new Error('原始错误');
    })
    .catch(error => {
        console.log('处理错误:', error.message); // 处理错误: 原始错误
        // 返回一个值，让 Promise 链继续
        return '错误已处理，继续执行';
    })
    .then(result => {
        console.log('恢复执行:', result); // 恢复执行: 错误已处理，继续执行
    });
```

### 4. 实际应用场景

**使用 reject 进行主动错误处理：**

```javascript
function validateUser(user) {
    return new Promise((resolve, reject) => {
        if (!user || !user.name) {
            // 主动拒绝，因为用户数据无效
            reject(new Error('用户数据无效'));
        } else if (user.age < 18) {
            reject(new Error('用户年龄不符合要求'));
        } else {
            resolve(user);
        }
    });
}

validateUser({name: 'Alice', age: 16})
    .then(user => {
        console.log('用户验证通过:', user);
    })
    .catch(error => {
        console.log('验证失败:', error.message); // 验证失败: 用户年龄不符合要求
    });
```

**使用 catch 进行统一错误处理：**

```javascript
// API 请求链
function fetchUserData(userId) {
    return fetch(`/api/users/${userId}`)
        .then(response => {
            if (!response.ok) {
                // 将 HTTP 错误转换为 Promise 错误
                return Promise.reject(new Error(`HTTP Error: ${response.status}`));
            }
            return response.json();
        })
        .then(user => {
            if (!user) {
                // 主动拒绝，因为没有用户数据
                return Promise.reject(new Error('用户不存在'));
            }
            return user;
        })
        .catch(error => {
            // 统一处理所有错误
            console.error('获取用户数据失败:', error.message);
            // 可以返回默认值或重新抛出错误
            throw error; // 或者返回默认值
        });
}
```

### 5. 错误处理的最佳实践

**使用 catch 进行错误边界处理：**

```javascript
// 不好的做法 - 每个 then 都处理错误
Promise.resolve()
    .then(() => {
        throw new Error('错误');
    })
    .then(
        result => result,
        error => console.log('错误处理1:', error.message) // 不推荐
    );

// 好的做法 - 使用 catch 集中处理错误
Promise.resolve()
    .then(() => {
        throw new Error('错误');
    })
    .then(result => {
        return result;
    })
    .catch(error => {
        console.log('统一错误处理:', error.message); // 推荐
    });
```

**链式调用中的错误处理：**

```javascript
// Promise 链中多个可能的错误点
function complexOperation() {
    return Promise.resolve('开始')
        .then(data => {
            console.log(data);
            return '步骤1完成';
        })
        .then(data => {
            console.log(data);
            // 这里可能出错
            if (Math.random() < 0.5) {
                return Promise.reject(new Error('步骤2失败'));
            }
            return '步骤2完成';
        })
        .then(data => {
            console.log(data);
            // 这里也可能出错
            throw new Error('步骤3失败');
        })
        .catch(error => {
            console.log('捕获链中任何地方的错误:', error.message);
            // 可以选择返回默认值继续执行
            return '错误已处理';
        })
        .then(data => {
            console.log('最终结果:', data);
        });
}
```

### 6. Promise.reject() vs throw

```javascript
// 两种方式在 Promise 中效果相同
Promise.resolve()
    .then(() => {
        // 方式1: 使用 Promise.reject()
        return Promise.reject(new Error('错误1'));
    })
    .catch(error => {
        console.log(error.message); // 错误1
        // 方式2: 使用 throw
        throw new Error('错误2');
    })
    .catch(error => {
        console.log(error.message); // 错误2
    });
```

总结：reject 用于主动创建拒绝状态的 Promise 或在 Promise 构造函数中拒绝 Promise，而 catch 用于捕获和处理 Promise 链中的错误。catch 处理错误后可以让 Promise 链继续执行，而 reject 会中断当前执行路径。
