# 请介绍一下 XMLHttpRequest 对象及常用方法和属性？（必会）

**题目**: 请介绍一下 XMLHttpRequest 对象及常用方法和属性？（必会）

**答案**:

XMLHttpRequest（XHR）是浏览器提供的用于在后台与服务器交换数据的对象，允许网页在不重新加载的情况下更新部分内容。

## 主要属性：

1. **readyState**：请求状态
   - 0: UNSENT (未初始化)
   - 1: OPENED (已打开连接)
   - 2: HEADERS_RECEIVED (已接收头部)
   - 3: LOADING (正在加载)
   - 4: DONE (请求完成)

2. **status**：HTTP状态码（如200, 404等）

3. **statusText**：HTTP状态文本（如"OK", "Not Found"）

4. **responseText**：响应文本（字符串格式）

5. **responseXML**：响应XML文档

6. **response**：响应内容（根据responseType设置）

7. **onreadystatechange**：状态变化事件处理器

## 主要方法：

1. **open(method, url, async, user, password)**：初始化请求
   ```javascript
   xhr.open('GET', '/api/data', true);
   ```

2. **send(body)**：发送请求
   ```javascript
   xhr.send(); // GET请求
   xhr.send(JSON.stringify(data)); // POST请求
   ```

3. **setRequestHeader(header, value)**：设置请求头
   ```javascript
   xhr.setRequestHeader('Content-Type', 'application/json');
   ```

4. **abort()**：取消请求

## 使用示例：

```javascript
// GET请求
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users', true);

xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText);
  }
};

xhr.onerror = function() {
  console.error('请求失败');
};

xhr.send();

// POST请求
const xhrPost = new XMLHttpRequest();
xhrPost.open('POST', '/api/users', true);
xhrPost.setRequestHeader('Content-Type', 'application/json');

xhrPost.onreadystatechange = function() {
  if (xhrPost.readyState === 4 && xhrPost.status === 200) {
    const response = JSON.parse(xhrPost.responseText);
    console.log(response);
  }
};

xhrPost.send(JSON.stringify({name: 'John', age: 30}));
```

## 事件处理：

- **onload**：请求成功完成
- **onerror**：请求失败
- **onprogress**：接收数据中
- **ontimeout**：请求超时

XMLHttpRequest是现代Web开发中AJAX请求的基础，虽然现在更多使用fetch API，但了解XHR仍很重要。
