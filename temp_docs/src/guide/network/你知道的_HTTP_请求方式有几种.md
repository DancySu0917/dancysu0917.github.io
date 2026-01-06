# 你知道的 HTTP 请求方式有几种？（高薪常问）

**题目**: 你知道的 HTTP 请求方式有几种？（高薪常问）

**标准答案**:
HTTP 标准定义了多种请求方法，常用的有：

1. GET：请求指定资源，参数在 URL 中，幂等操作
2. POST：向指定资源提交数据，通常导致状态变化或副作用
3. PUT：更新指定资源，幂等操作
4. DELETE：删除指定资源，幂等操作
5. PATCH：部分更新指定资源
6. HEAD：获取响应头信息，与 GET 类似但不返回响应体
7. OPTIONS：获取目标资源所支持的通信选项
8. CONNECT：建立隧道连接
9. TRACE：回显服务器收到的请求，主要用于测试

**深入理解**:
HTTP 请求方法的详细说明：

**1. GET 请求**:
- 用于获取资源
- 参数通过 URL 传递
- 幂等操作（多次执行结果相同）
- 可被缓存
- 有长度限制

```javascript
// GET 请求示例
fetch('/api/users?id=123&name=test')
  .then(response => response.json())
  .then(data => console.log(data));

// 或使用 XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users?status=active', true);
xhr.send();
```

**2. POST 请求**:
- 用于创建资源或提交数据
- 参数在请求体中
- 非幂等操作
- 不会被缓存

```javascript
// POST 请求示例
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John',
    email: 'john@example.com'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**3. PUT 请求**:
- 用于完整更新资源
- 幂等操作
- 通常用于更新已存在的资源

```javascript
// PUT 请求示例
fetch('/api/users/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 123,
    name: 'Updated Name',
    email: 'updated@example.com'
  })
});
```

**4. PATCH 请求**:
- 用于部分更新资源
- 非幂等操作
- 只更新指定的字段

```javascript
// PATCH 请求示例
fetch('/api/users/123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Partially Updated Name'
  })
});
```

**5. DELETE 请求**:
- 用于删除资源
- 幂等操作

```javascript
// DELETE 请求示例
fetch('/api/users/123', {
  method: 'DELETE'
});
```

**6. HEAD 请求**:
- 获取资源的元信息（响应头）
- 不返回响应体

```javascript
// HEAD 请求示例
fetch('/api/users/123', {
  method: 'HEAD'
})
.then(response => {
  console.log('Content-Type:', response.headers.get('Content-Type'));
  console.log('Content-Length:', response.headers.get('Content-Length'));
});
```

**7. OPTIONS 请求**:
- 用于获取服务器支持的请求方法
- 常用于 CORS 预检请求

```javascript
// OPTIONS 请求示例
fetch('/api/users', {
  method: 'OPTIONS'
})
.then(response => {
  const allow = response.headers.get('Allow');
  console.log('允许的方法:', allow);
});
```

**请求方法的特性对比**:

| 方法 | 幂等 | 安全 | 可缓存 | 用途 |
|------|------|------|--------|------|
| GET | 是 | 是 | 是 | 获取资源 |
| POST | 否 | 否 | 否 | 创建资源/提交数据 |
| PUT | 是 | 否 | 否 | 更新资源 |
| PATCH | 否 | 否 | 否 | 部分更新资源 |
| DELETE | 是 | 否 | 否 | 删除资源 |
| HEAD | 是 | 是 | 是 | 获取元信息 |
| OPTIONS | 是 | 是 | 是 | 获取通信选项 |

**实际应用中的注意事项**:
- RESTful API 设计中，正确使用 HTTP 方法很重要
- 浏览器自动发送的预检请求使用 OPTIONS 方法
- 语义化使用：GET 不应有副作用，POST 用于创建等操作
