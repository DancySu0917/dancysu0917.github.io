# axios 是否可以取消请求（了解）

**题目**: axios 是否可以取消请求（了解）

## 标准答案

是的，axios 提供了多种方式来取消请求：

1. **CancelToken API**（旧版本方法，v0.22.0 后已废弃）
2. **AbortController API**（推荐方法，符合 Web 标准）

## 深入解析

### 使用 AbortController 取消请求（推荐方式）

```javascript
// 基本用法
function cancelableRequest() {
    const controller = new AbortController();
    
    // 发起请求
    const request = axios.get('/api/data', {
        signal: controller.signal
    });
    
    // 取消请求
    setTimeout(() => {
        controller.abort(); // 取消请求
    }, 5000);
    
    return request;
}

// 在实际应用中使用
async function fetchData() {
    const controller = new AbortController();
    
    try {
        const response = await axios.get('/api/user', {
            signal: controller.signal
        });
        console.log(response.data);
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('请求被取消:', error.message);
        } else {
            console.log('请求失败:', error.message);
        }
    }
    
    // 某种条件下取消请求
    // controller.abort();
}

// 批量请求取消
async function batchRequestWithCancel() {
    const controller = new AbortController();
    
    const requests = [
        axios.get('/api/data1', { signal: controller.signal }),
        axios.get('/api/data2', { signal: controller.signal }),
        axios.get('/api/data3', { signal: controller.signal })
    ];
    
    // 取消所有请求
    setTimeout(() => {
        controller.abort();
    }, 3000);
    
    try {
        const results = await Promise.all(requests);
        console.log(results);
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('批量请求被取消');
        }
    }
}
```

### 使用 CancelToken（已废弃但仍可用）

```javascript
// 使用 CancelToken.source() 方法
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('/api/data', {
    cancelToken: source.token
}).catch(function (thrown) {
    if (axios.isCancel(thrown)) {
        console.log('请求被取消', thrown.message);
    } else {
        // 处理错误
    }
});

// 取消请求 (请求原因是可选的)
source.cancel('操作被用户取消');

// 或者使用 CancelToken 构造函数
let cancel;

axios.get('/api/data', {
    cancelToken: new CancelToken(function executor(c) {
        // 将取消函数赋值给变量
        cancel = c;
    })
});

// 取消请求
cancel('请求被取消');
```

### 在 React 组件中的实际应用

```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        // 创建 AbortController 实例
        const controller = new AbortController();
        
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/users/${userId}`, {
                    signal: controller.signal
                });
                
                if (!controller.signal.aborted) {
                    setUser(response.data);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    if (axios.isCancel(err)) {
                        console.log('请求被取消');
                    } else {
                        setError(err.message);
                    }
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        
        fetchUser();
        
        // 组件卸载时取消请求
        return () => {
            controller.abort();
        };
    }, [userId]);
    
    if (loading) return <div>加载中...</div>;
    if (error) return <div>错误: {error}</div>;
    if (user) return <div>用户: {user.name}</div>;
    
    return null;
}
```

### 创建可复用的取消请求工具

```javascript
// 请求管理器
class RequestManager {
    constructor() {
        this.controllers = new Map();
    }
    
    // 创建可取消的请求
    async request(config, requestId = null) {
        let controller;
        
        if (requestId) {
            // 如果存在之前的请求，先取消它
            if (this.controllers.has(requestId)) {
                this.cancelRequest(requestId);
            }
            
            controller = new AbortController();
            this.controllers.set(requestId, controller);
        } else {
            controller = new AbortController();
        }
        
        try {
            const response = await axios({
                ...config,
                signal: controller.signal
            });
            
            // 请求成功后清理控制器
            if (requestId) {
                this.controllers.delete(requestId);
            }
            
            return response;
        } catch (error) {
            // 如果是取消错误，清理控制器
            if (axios.isCancel(error) && requestId) {
                this.controllers.delete(requestId);
            }
            throw error;
        }
    }
    
    // 取消特定请求
    cancelRequest(requestId) {
        if (this.controllers.has(requestId)) {
            const controller = this.controllers.get(requestId);
            controller.abort(`请求 ${requestId} 被取消`);
            this.controllers.delete(requestId);
        }
    }
    
    // 取消所有请求
    cancelAllRequests() {
        for (const [requestId, controller] of this.controllers) {
            controller.abort(`请求 ${requestId} 被取消`);
        }
        this.controllers.clear();
    }
}

// 使用示例
const requestManager = new RequestManager();

// 搜索功能，自动取消之前的请求
async function searchUsers(query) {
    try {
        const response = await requestManager.request({
            method: 'GET',
            url: `/api/users/search?q=${query}`
        }, 'search-request');
        
        return response.data;
    } catch (error) {
        if (!axios.isCancel(error)) {
            throw error;
        }
    }
}
```

## 实际面试问答

**面试官**: 如何在组件卸载时取消 axios 请求？

**候选人**: 
在 React 组件中，可以在 useEffect 的清理函数中使用 AbortController 取消请求：

```javascript
useEffect(() => {
    const controller = new AbortController();
    
    fetchData(controller.signal);
    
    return () => {
        controller.abort(); // 组件卸载时取消请求
    };
}, []);
```

**面试官**: 取消请求的原理是什么？

**候选人**: 
取消请求的原理是：
1. 浏览器层面：AbortController 发送信号给底层网络层中断请求
2. axios 层面：检测到信号被中断，抛出取消错误而不是网络错误
3. 应用层面：开发者可以捕获取消错误并进行相应处理

**面试官**: CancelToken 和 AbortController 有什么区别？

**候选人**: 
1. **标准**: AbortController 是 Web 标准 API，CancelToken 是 axios 特有的
2. **兼容性**: AbortController 需要现代浏览器支持，CancelToken 在所有支持 axios 的环境中都可用
3. **状态**: CancelToken 已在 axios v0.22.0 中被标记为废弃，推荐使用 AbortController
4. **功能**: AbortController 功能更强大，可以用于 fetch 等其他 Web API
