# 常见的 HTTP 状态码以及代表的意义（必会）

**题目**: 常见的 HTTP 状态码以及代表的意义（必会）

**标准答案**:
HTTP 状态码是服务器响应客户端请求时返回的三位数字代码，用于表示请求的处理结果。

常见状态码分类：
- 1xx：信息响应，表示请求已被接收，需要继续处理
- 2xx：成功响应，表示请求已成功被服务器接收、理解并接受
- 3xx：重定向，表示需要客户端采取进一步的操作才能完成请求
- 4xx：客户端错误，表示请求包含语法错误或无法完成请求
- 5xx：服务器错误，表示服务器在处理请求的过程中发生了错误

**深入理解**:
详细的状态码含义：

**2xx 成功状态码**:
- 200 OK：请求成功，是最常见的成功状态码
- 201 Created：请求成功并且服务器创建了新的资源
- 204 No Content：请求成功，但没有返回内容

**3xx 重定向状态码**:
- 301 Moved Permanently：永久重定向，请求的资源已被分配了新的 URL
- 302 Found：临时重定向，请求的资源临时被分配了新的 URL
- 304 Not Modified：资源未修改，客户端可以使用缓存的版本

**4xx 客户端错误状态码**:
- 400 Bad Request：请求报文存在语法错误
- 401 Unauthorized：请求需要身份验证
- 403 Forbidden：服务器理解请求但拒绝执行
- 404 Not Found：请求的资源未找到
- 405 Method Not Allowed：请求方法不允许
- 409 Conflict：请求存在冲突无法处理

**5xx 服务器错误状态码**:
- 500 Internal Server Error：服务器内部错误
- 502 Bad Gateway：服务器作为网关或代理时收到无效响应
- 503 Service Unavailable：服务器暂时无法处理请求
- 504 Gateway Timeout：网关超时

在实际开发中，正确使用HTTP状态码有助于：
1. 前端根据状态码做出相应处理
2. 调试和错误排查
3. API 文档的清晰性
4. 用户体验的提升

```javascript
// 在前端处理不同状态码的示例
fetch('/api/data')
  .then(response => {
    switch(response.status) {
      case 200:
        return response.json();
      case 404:
        console.log('资源未找到');
        return null;
      case 500:
        console.log('服务器内部错误');
        throw new Error('服务器错误');
      default:
        throw new Error(`请求失败: ${response.status}`);
    }
  })
  .then(data => {
    if(data) {
      console.log('请求成功', data);
    }
  })
  .catch(error => {
    console.error('请求出错:', error.message);
  });
```
