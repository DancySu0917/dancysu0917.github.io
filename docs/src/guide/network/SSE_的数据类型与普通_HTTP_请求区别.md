# SSE 的数据类型与普通 HTTP 请求区别？（了解）

**题目**: SSE 的数据类型与普通 HTTP 请求区别？（了解）

## 标准答案

SSE（Server-Sent Events）与普通 HTTP 请求在数据类型处理上的主要区别：

1. **数据格式**：SSE 使用纯文本格式传输数据，每行以换行符分隔，包含特定字段如 `data`、`event`、`id`、`retry` 等；普通 HTTP 请求可返回任意格式数据（JSON、XML、HTML 等）。

2. **传输方式**：SSE 是服务器单向推送，建立持久连接后持续传输；普通 HTTP 请求是请求-响应模式，每次请求获得一次响应。

3. **数据类型**：SSE 传输的数据本质上是文本，需要客户端解析；普通 HTTP 可直接传输结构化数据。

## 深入理解

### SSE 数据格式详解

SSE 有严格的文本格式规范，每个消息包含以下字段：

1. **data**：消息的实际数据内容
2. **event**：事件类型标识
3. **id**：事件 ID，用于断线重连时的恢复
4. **retry**：重连时间间隔（毫秒）

SSE 消息格式示例：
```
data: 这是第一条消息的数据
event: message
id: 1

data: {"type": "notification", "content": "新通知"}
event: notification

data: 第三行数据
data: 第四行数据
retry: 5000
```

### 与普通 HTTP 数据类型的对比

| 特性 | SSE | 普通 HTTP |
|------|-----|-----------|
| 数据格式 | 纯文本，遵循 SSE 格式规范 | 任意格式（JSON、XML、HTML、二进制等） |
| Content-Type | text/event-stream | 根据数据类型变化 |
| 数据处理 | 客户端需解析文本格式 | 直接使用对应格式解析器 |
| 传输方向 | 服务器单向推送到客户端 | 双向请求-响应 |
| 连接持久性 | 持久连接，持续传输 | 短连接，一次请求一次响应 |

### 代码示例

SSE 服务端实现（Node.js）：

```javascript
// SSE 服务端示例
app.get('/events', (req, res) => {
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 发送 SSE 格式数据
  const sendSSE = (data, event = 'message', id = null) => {
    if (id) res.write(`id: ${id}\n`);
    if (event) res.write(`event: ${event}\n`);
    
    // SSE 要求数据分行为 data: 开头
    const lines = data.split('\n');
    lines.forEach(line => {
      res.write(`data: ${line}\n`);
    });
    res.write('\n'); // SSE 消息以双换行符结束
  };
  
  // 定时发送数据
  const interval = setInterval(() => {
    const timestamp = new Date().toISOString();
    sendSSE(JSON.stringify({
      message: '实时数据',
      timestamp: timestamp,
      type: 'data'
    }), 'data', Date.now());
  }, 2000);
  
  // 客户端断开连接时清理
  req.on('close', () => {
    clearInterval(interval);
  });
});
```

SSE 客户端实现：

```javascript
// SSE 客户端实现
const eventSource = new EventSource('/events');

// 监听默认 message 事件
eventSource.onmessage = function(event) {
  console.log('收到消息:', event.data);
  const data = JSON.parse(event.data);
  updateUI(data);
};

// 监听自定义事件
eventSource.addEventListener('data', function(event) {
  console.log('收到数据事件:', event.data);
  const data = JSON.parse(event.data);
  renderData(data);
});

// 连接打开事件
eventSource.onopen = function(event) {
  console.log('SSE 连接已建立');
};

// 错误处理
eventSource.onerror = function(event) {
  console.error('SSE 连接错误:', event);
  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('连接已关闭');
  }
};

// 手动关闭连接
function closeSSE() {
  eventSource.close();
}
```

普通 HTTP 请求实现对比：

```javascript
// 普通 HTTP 请求示例
async function fetchNormalData() {
  try {
    const response = await fetch('/api/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // 直接获取结构化数据
      const data = await response.json(); // JSON 格式
      console.log('获取到数据:', data);
      return data;
    } else {
      throw new Error(`HTTP Error: ${response.status}`);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 轮询方式模拟实时数据获取
function pollForData() {
  const pollInterval = setInterval(async () => {
    try {
      const data = await fetchNormalData();
      if (data) {
        updateUI(data);
      }
    } catch (error) {
      console.error('轮询失败:', error);
    }
  }, 3000); // 每3秒轮询一次
  
  // 清理轮询
  return () => clearInterval(pollInterval);
}
```

### 实际应用场景

1. **SSE 适用场景**：
   - 实时通知系统
   - 股票价格更新
   - 新闻推送
   - 日志实时查看
   - 聊天应用（单向消息推送）

2. **普通 HTTP 适用场景**：
   - 页面数据加载
   - 表单提交
   - API 接口调用
   - 文件上传下载

### 性能对比

- **SSE 优势**：减少 HTTP 请求开销，服务器主动推送，适合实时数据更新
- **普通 HTTP 优势**：协议简单，兼容性好，适合传统请求-响应模式
- **数据处理**：SSE 需要额外的文本解析步骤，普通 HTTP 可直接处理结构化数据
