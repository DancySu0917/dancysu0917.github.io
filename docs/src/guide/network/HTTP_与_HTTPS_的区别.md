# HTTP 与 HTTPS 的区别（必会）

**题目**: HTTP 与 HTTPS 的区别（必会）

**标准答案**:
HTTP（HyperText Transfer Protocol）和HTTPS（HyperText Transfer Protocol Secure）的主要区别在于安全性：

1. 安全性：HTTP 是明文传输，数据容易被窃听和篡改；HTTPS 通过 SSL/TLS 加密传输，保证数据安全
2. 端口：HTTP 默认使用 80 端口，HTTPS 默认使用 443 端口
3. 证书：HTTPS 需要向 CA 申请 SSL 证书，HTTP 不需要
4. 性能：HTTPS 由于加密解密过程，性能略低于 HTTP，但差距不大
5. URL：HTTP 使用 http:// 开头，HTTPS 使用 https:// 开头

**深入理解**:
HTTPS 的工作原理：

1. **握手阶段**：
   - 客户端向服务器发送 HTTPS 请求
   - 服务器返回 SSL 证书（包含公钥）
   - 客户端验证证书有效性
   - 客户端生成随机对称密钥，用服务器公钥加密后发送
   - 服务器用私钥解密，获得对称密钥
   - 双方使用对称密钥进行加密通信

2. **加密方式**：
   - HTTPS 使用混合加密：非对称加密（用于密钥交换）+ 对称加密（用于数据传输）
   - 非对称加密（如 RSA）用于安全地交换对称密钥
   - 对称加密（如 AES）用于实际的数据传输，效率更高

```javascript
// 在实际开发中，HTTPS 对前端代码的影响
// 1. 混合内容问题（Mixed Content）
// 错误示例：在 HTTPS 页面中加载 HTTP 资源
// <img src="http://example.com/image.jpg"> // 会被浏览器阻止

// 正确示例：使用协议相对 URL 或 HTTPS
// <img src="//example.com/image.jpg">
// <img src="https://example.com/image.jpg">

// 2. API 请求
// 现代浏览器强制 HTTPS 站点使用 HTTPS API 请求
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({data: 'example'})
})
.then(response => response.json())
.then(data => console.log(data));
```

**HTTPS 的优势**：
- 数据加密：防止数据被窃听
- 身份验证：验证服务器身份，防止中间人攻击
- 数据完整性：防止数据被篡改

**HTTPS 的挑战**：
- 证书成本：需要购买和维护 SSL 证书
- 性能开销：加密解密过程消耗资源
- 配置复杂：需要正确配置服务器

**实际应用**：
- 现代网站几乎都使用 HTTPS（Google 等搜索引擎优先收录 HTTPS 网站）
- HTTP/2 标准要求使用 HTTPS
- 浏览器对 HTTP 网站标记为"不安全"
- 现代 Web API（如地理位置、摄像头等）要求 HTTPS 环境
