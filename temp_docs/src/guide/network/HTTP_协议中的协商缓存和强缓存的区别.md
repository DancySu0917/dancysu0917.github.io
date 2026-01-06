# HTTP 协议中的协商缓存和强缓存的区别（了解）

**题目**: HTTP 协议中的协商缓存和强缓存的区别（了解）

## 标准答案

HTTP 缓存机制分为强缓存和协商缓存两种：

1. **强缓存（Strong Cache）**：浏览器在请求资源时，直接从本地缓存中获取资源，不会向服务器发送请求。通过 `Cache-Control` 和 `Expires` 响应头控制。
   - `Cache-Control: max-age=3600` - 表示资源在3600秒内有效，直接使用缓存
   - `Expires` - 指定资源过期的具体时间

2. **协商缓存（Negotiated Cache）**：浏览器先向服务器询问资源是否更新，服务器根据资源状态决定返回304（未修改）或200（已更新）。通过 `ETag/If-None-Match` 和 `Last-Modified/If-Modified-Since` 头控制。

## 深入理解

### 强缓存详解

强缓存是优先级最高的缓存策略，浏览器在缓存有效期内直接使用本地资源，不向服务器发送任何请求。主要通过以下两个头部字段控制：

1. **Expires**：HTTP/1.0 的产物，指定资源过期的绝对时间
   ```http
   Expires: Wed, 21 Oct 2025 07:28:00 GMT
   ```

2. **Cache-Control**：HTTP/1.1 的产物，更灵活，优先级高于 Expires
   ```http
   Cache-Control: max-age=3600
   ```

Cache-Control 常用指令：
- `max-age=<seconds>`：资源在指定秒数内有效
- `no-cache`：跳过强缓存，但仍使用协商缓存
- `no-store`：禁止缓存
- `public`：允许所有中间节点缓存
- `private`：只允许浏览器缓存，不允许代理服务器缓存

### 协商缓存详解

当强缓存失效后，浏览器会使用协商缓存策略。服务器通过比较资源的标识来判断是否需要重新传输：

1. **Last-Modified / If-Modified-Since**：
   - 服务器通过 `Last-Modified` 告知资源最后修改时间
   - 浏览器下次请求时通过 `If-Modified-Since` 发送该时间
   - 服务器比较时间，若未修改则返回 304，否则返回 200

2. **ETag / If-None-Match**：
   - 服务器通过 `ETag` 为资源生成唯一标识符（通常是哈希值）
   - 浏览器下次请求时通过 `If-None-Match` 发送该标识
   - 服务器比较标识，若未变化则返回 304，否则返回 200

### 实际应用场景

1. **静态资源（CSS、JS、图片）**：通常使用强缓存，通过文件名加版本号或哈希值来确保更新
2. **动态数据**：通常使用协商缓存或禁用缓存
3. **API 接口**：根据数据更新频率选择合适的缓存策略

### 完整缓存流程

1. 浏览器发起请求
2. 检查强缓存是否有效（Cache-Control、Expires）
   - 有效：直接使用缓存（200 from disk cache）
   - 无效：进入协商缓存流程
3. 发送协商请求（携带 ETag/If-None-Match 或 Last-Modified/If-Modified-Since）
4. 服务器验证资源状态
   - 资源未变化：返回 304 Not Modified
   - 资源已变化：返回 200 和新资源

### 代码示例

前端处理缓存的示例：

```javascript
// 使用 fetch 时处理缓存
fetch('/api/data', {
  cache: 'no-cache' // 强制跳过缓存
})
.then(response => {
  if (response.status === 304) {
    console.log('资源未变化，使用缓存');
  } else if (response.status === 200) {
    console.log('获取到新资源');
    return response.json();
  }
});

// 或者强制刷新缓存
const forceRefresh = () => {
  fetch('/api/data?t=' + Date.now()) // 添加时间戳参数避免缓存
    .then(response => response.json())
    .then(data => console.log(data));
};
```

服务端设置缓存头的示例：

```javascript
// Node.js Express 示例
app.get('/static/:file', (req, res) => {
  // 设置强缓存
  res.set({
    'Cache-Control': 'public, max-age=31536000', // 缓存一年
    'ETag': 'unique-etag-value' // 设置 ETag
  });
  
  res.sendFile(path.join(__dirname, 'public', req.params.file));
});

app.get('/api/data', (req, res) => {
  // 设置协商缓存
  const lastModified = 'Wed, 21 Oct 2024 07:28:00 GMT';
  const clientModifiedSince = req.get('If-Modified-Since');
  
  if (clientModifiedSince === lastModified) {
    res.status(304).end(); // 资源未变化
  } else {
    res.set('Last-Modified', lastModified);
    res.json({ data: 'api data' });
  }
});
```
