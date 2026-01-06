# 手写一个自定义 Hook：useFetch。(.then .catch)（了解）

**题目**: 手写一个自定义 Hook：useFetch。(.then .catch)（了解）

## 答案

实现一个自定义的 `useFetch` Hook 需要考虑状态管理、错误处理、请求取消等功能。以下是几种不同复杂度的实现方式：

### 基础版本

```jsx
import { useState, useEffect } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// 使用示例
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
```

### 带请求取消功能的版本

```jsx
import { useState, useEffect, useCallback } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      // 忽略取消请求的错误
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
    
    return () => {
      controller.abort();
    };
  }, [url, options]);

  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData]);

  return { data, loading, error };
}
```

### 支持手动触发的版本

```jsx
import { useState, useCallback, useRef } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (customUrl, customOptions = {}) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const finalUrl = customUrl || url;
      const finalOptions = { ...options, ...customOptions, signal: abortControllerRef.current.signal };
      
      const response = await fetch(finalUrl, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// 使用示例 - 手动触发
function SearchComponent() {
  const [query, setQuery] = useState('');
  const { data, loading, error, execute } = useFetch();

  const handleSearch = () => {
    if (query) {
      execute(`/api/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="搜索..."
      />
      <button onClick={handleSearch}>搜索</button>
      
      {loading && <div>搜索中...</div>}
      {error && <div>错误: {error}</div>}
      {data && <div>结果: {JSON.stringify(data)}</div>}
    </div>
  );
}
```

### 完整功能版本（推荐）

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const abortControllerRef = useRef(null);

  // 执行请求
  const execute = useCallback(async (customUrl, customOptions = {}) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const finalUrl = customUrl || url;
      const finalOptions = { 
        ...options, 
        ...customOptions, 
        signal: abortControllerRef.current.signal 
      };
      
      const res = await fetch(finalUrl, finalOptions);
      setResponse(res);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
      }
      
      const result = await res.json();
      setData(result);
      return { data: result, response: res, error: null };
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        return { data: null, response: null, error: err.message };
      }
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  // 自动执行请求
  useEffect(() => {
    if (url) {
      execute();
    }
    
    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, url]);

  // 重置状态
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setResponse(null);
  }, []);

  return {
    data,
    loading,
    error,
    response,
    execute,  // 用于手动执行请求
    reset     // 用于重置状态
  };
}

// 使用示例 - 自动请求
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// 使用示例 - 手动请求
function DataFetcher() {
  const { data, loading, error, execute, reset } = useFetch();

  const fetchData = async () => {
    const result = await execute('/api/data');
    if (result.error) {
      console.error('Fetch error:', result.error);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      <button onClick={reset}>Reset</button>
      
      {error && <div>Error: {error}</div>}
      {data && <div>Data: {JSON.stringify(data)}</div>}
    </div>
  );
}
```

### 高级版本（支持缓存和轮询）

```jsx
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// 简单的缓存实现
const cache = new Map();

function useFetch(url, options = {}, { cacheTime = 0, pollInterval = 0 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const abortControllerRef = useRef(null);
  const pollTimerRef = useRef(null);

  // 生成缓存键
  const cacheKey = useMemo(() => {
    if (!url) return null;
    const sortedOptions = JSON.stringify(options, Object.keys(options).sort());
    return `${url}_${sortedOptions}`;
  }, [url, options]);

  // 从缓存获取数据
  const getCachedData = useCallback(() => {
    if (!cacheKey || !cacheTime) return null;
    
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    return null;
  }, [cacheKey, cacheTime]);

  // 设置缓存
  const setCachedData = useCallback((data) => {
    if (cacheKey && cacheTime) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
  }, [cacheKey, cacheTime]);

  const execute = useCallback(async (customUrl, customOptions = {}) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const finalUrl = customUrl || url;
      const finalOptions = { 
        ...options, 
        ...customOptions, 
        signal: abortControllerRef.current.signal 
      };
      
      // 检查缓存
      if (cacheTime > 0) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return { data: cachedData, response: null, error: null };
        }
      }
      
      const res = await fetch(finalUrl, finalOptions);
      setResponse(res);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
      }
      
      const result = await res.json();
      
      // 设置缓存
      setCachedData(result);
      
      setData(result);
      return { data: result, response: res, error: null };
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        return { data: null, response: null, error: err.message };
      }
    } finally {
      setLoading(false);
    }
  }, [url, options, cacheTime, getCachedData, setCachedData]);

  // 自动执行请求
  useEffect(() => {
    if (url) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
      } else {
        execute();
      }
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [execute, url, getCachedData]);

  // 轮询功能
  useEffect(() => {
    if (pollInterval > 0 && url) {
      pollTimerRef.current = setInterval(() => {
        execute();
      }, pollInterval);
    }
    
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [pollInterval, url, execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setResponse(null);
  }, []);

  return {
    data,
    loading,
    error,
    response,
    execute,
    reset
  };
}

// 使用示例 - 带缓存和轮询
function RealTimeData() {
  const { data, loading, error } = useFetch(
    '/api/realtime-data', 
    {}, 
    { 
      cacheTime: 5000,    // 缓存5秒
      pollInterval: 10000 // 每10秒轮询一次
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>实时数据: {JSON.stringify(data)}</div>;
}
```

### 总结

一个完整的 `useFetch` Hook 应该具备以下特性：

1. **基础功能**：状态管理（数据、加载状态、错误）
2. **请求取消**：防止组件卸载后的状态更新
3. **错误处理**：捕获和处理各种错误情况
4. **手动触发**：支持手动执行请求
5. **缓存支持**：可选的数据缓存功能
6. **轮询支持**：可选的定时轮询功能
7. **响应对象**：提供完整的响应信息
8. **重置功能**：重置所有状态

选择合适的版本取决于具体的应用场景和需求复杂度。
