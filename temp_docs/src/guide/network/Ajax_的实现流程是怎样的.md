# Ajax 的实现流程是怎样的？（必会）

**题目**: Ajax 的实现流程是怎样的？（必会）

**标准答案**:
Ajax 的实现流程主要包括以下步骤：

1. 创建 XMLHttpRequest 对象
2. 设置请求方式和 URL
3. 设置请求状态变化的回调函数
4. 发送请求
5. 在回调函数中处理服务器响应

**深入理解**:
Ajax 的完整实现流程如下：

```javascript
function ajaxRequest(method, url, data, callback) {
  // 1. 创建 XMLHttpRequest 对象
  const xhr = new XMLHttpRequest();
  
  // 2. 设置请求方式和 URL
  xhr.open(method, url, true);
  
  // 3. 设置请求头（可选）
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  // 4. 设置请求状态变化的回调函数
  xhr.onreadystatechange = function() {
    // 检查请求是否完成且成功
    if (xhr.readyState === 4) { // 请求完成
      if (xhr.status === 200) { // 请求成功
        // 5. 处理服务器响应
        callback(null, xhr.responseText);
      } else {
        callback(new Error(`Request failed with status ${xhr.status}`), null);
      }
    }
  };
  
  // 处理网络错误
  xhr.onerror = function() {
    callback(new Error('Network error'), null);
  };
  
  // 6. 发送请求
  xhr.send(data ? JSON.stringify(data) : null);
}

// 使用示例
ajaxRequest('GET', '/api/users', null, function(error, response) {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Response:', JSON.parse(response));
  }
});
```

现代开发中，我们通常使用更高级的封装：

```javascript
// 使用 Promise 封装
function promiseAjax(method, url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Request failed with status ${xhr.status}`));
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Network error'));
    };
    
    xhr.send(data ? JSON.stringify(data) : null);
  });
}

// 使用示例
promiseAjax('GET', '/api/users')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

XMLHttpRequest 的 readyState 状态码含义：
- 0: 请求未初始化（未调用 open()）
- 1: 服务器连接已建立（已调用 open()）
- 2: 请求已接收（已调用 send()）
- 3: 正在处理请求（正在接收响应）
- 4: 请求完成且响应已就绪
