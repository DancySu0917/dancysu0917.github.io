# HTTP 缓存机制（高薪常问）

**题目**: HTTP 缓存机制（高薪常问）

**标准答案**:
HTTP 缓存机制分为强缓存和协商缓存两种类型：

1. 强缓存：直接从本地缓存获取资源，不向服务器发送请求
   - Expires：HTTP/1.0 标准，使用绝对时间
   - Cache-Control：HTTP/1.1 标准，优先级更高，包括 max-age、no-cache、no-store 等指令

2. 协商缓存：向服务器发送请求验证资源是否更新
   - Last-Modified / If-Modified-Since：基于时间戳验证
   - ETag / If-None-Match：基于资源内容的哈希值验证

**深入理解**:
HTTP 缓存机制详解：

**强缓存**:
强缓存通过设置缓存头来控制浏览器是否需要向服务器发送请求。当缓存有效时，浏览器直接从本地缓存获取资源。

```http
# 响应头设置
Cache-Control: max-age=3600
# 或者使用Expires（HTTP/1.0）
Expires: Wed, 21 Oct 2024 07:28:00 GMT
```

Cache-Control 常用指令：
- max-age=`<seconds>`：缓存的最大有效时间
- no-cache：必须向服务器验证缓存是否过期
- no-store：禁止缓存
- public：可以被任何缓存存储
- private：只能被单个用户缓存

**协商缓存**:
当强缓存失效后，浏览器会向服务器发送请求验证资源是否更新。

```http
# 第一次请求响应头
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# 再次请求时的请求头
If-Modified-Since: Wed, 21 Oct 2023 07:28:00 GMT
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

**缓存策略选择**:
- 对于静态资源（如图片、CSS、JS）：使用强缓存 + 文件名哈希
- 对于动态资源：使用协商缓存
- 对于HTML文件：通常不缓存或使用协商缓存

```javascript
// 实际开发中的缓存处理示例
class CacheManager {
  constructor() {
    this.cache = new Map();
  }
  
  async requestWithCache(url, options = {}) {
    // 检查是否有强缓存
    const cached = this.cache.get(url);
    if (cached && Date.now() < cached.expiry) {
      console.log('从缓存获取数据');
      return cached.data;
    }
    
    // 发送请求
    const response = await fetch(url, options);
    
    if (response.status === 304) {
      // 协商缓存有效，使用本地缓存
      console.log('协商缓存有效');
      return cached.data;
    }
    
    const data = await response.json();
    
    // 设置缓存时间（从响应头获取）
    const cacheControl = response.headers.get('Cache-Control');
    let maxAge = 300; // 默认5分钟
    
    if (cacheControl) {
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        maxAge = parseInt(maxAgeMatch[1]);
      }
    }
    
    // 存储到缓存
    this.cache.set(url, {
      data,
      expiry: Date.now() + (maxAge * 1000)
    });
    
    return data;
  }
}
```

**缓存优先级**:
1. 如果存在 Cache-Control 的 max-age 指令，则忽略 Expires
2. 强缓存优先于协商缓存
3. ETag 优先于 Last-Modified（更精确）

**实际应用**:
- 静态资源使用文件指纹（如 webpack 的 hash）实现长期缓存
- API 接口使用协商缓存处理数据更新
- 合理设置缓存时间以平衡性能和数据新鲜度
