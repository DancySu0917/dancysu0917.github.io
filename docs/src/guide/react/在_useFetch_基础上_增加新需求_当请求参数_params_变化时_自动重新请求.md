# 在 useFetch 基础上，增加新需求：当请求参数 (params) 变化时，自动重新请求。（了解）

**题目**: 在 useFetch 基础上，增加新需求：当请求参数 (params) 变化时，自动重新请求。（了解）

**答案**:

实现一个带有参数变化自动重新请求功能的 useFetch Hook：

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';

function useFetch(url, options = {}, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 使用 ref 来保存最新的 params，避免在闭包中使用过期的值
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // 创建一个请求函数，使用最新的 params
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 构建带参数的 URL
      let requestUrl = url;
      if (paramsRef.current && Object.keys(paramsRef.current).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(paramsRef.current).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        requestUrl = `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
      }

      const response = await fetch(requestUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

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
  }, [url, options]);

  // 当组件挂载或参数变化时触发请求
  useEffect(() => {
    fetchData();
  }, [fetchData]); // 依赖于 fetchData，它依赖于 url, options, 和 paramsRef.current

  // 提供手动重新请求的方法
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// 使用示例
function MyComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  // 当 searchTerm 或 category 变化时，会自动重新请求
  const { data, loading, error, refetch } = useFetch(
    '/api/search',
    { method: 'GET' },
    { q: searchTerm, category } // params 对象
  );

  return (
    <div>
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="搜索..."
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">全部</option>
        <option value="tech">技术</option>
        <option value="news">新闻</option>
      </select>
      
      {loading && <div>加载中...</div>}
      {error && <div>错误: {error}</div>}
      {data && (
        <ul>
          {data.items?.map(item => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 更高级的实现（支持依赖数组）

```javascript
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

function useFetch(url, options = {}, params = {}, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // 将 deps 与 params 结合，确保参数变化时重新请求
  const allDeps = useMemo(() => {
    return [url, ...deps, JSON.stringify(params)];
  }, [url, ...deps, JSON.stringify(params)]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let requestUrl = url;
      
      // 添加查询参数
      if (paramsRef.current && Object.keys(paramsRef.current).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(paramsRef.current).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        requestUrl = `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
      }

      const response = await fetch(requestUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

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
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, allDeps);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
```

## 使用 AbortController 取消请求

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';

function useFetch(url, options = {}, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const paramsRef = useRef(params);
  paramsRef.current = params;
  
  // 用于取消请求的控制器
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    // 如果有正在进行的请求，先取消它
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      let requestUrl = url;
      if (paramsRef.current && Object.keys(paramsRef.current).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(paramsRef.current).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        requestUrl = `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
      }

      const response = await fetch(requestUrl, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // 检查请求是否被取消
      if (!abortControllerRef.current.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      // 忽略取消错误
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
    
    // 组件卸载时取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
```

这个实现的关键点：
1. 使用 useRef 保存最新的参数，避免闭包中的过期值问题
2. 在 useEffect 中监听参数变化，自动重新请求
3. 使用 AbortController 避免组件卸载后的状态更新问题
4. 提供 refetch 方法用于手动重新请求
