# Node.js 如何充分利用多核 CPU？（了解）

**题目**: Node.js 如何充分利用多核 CPU？（了解）

**答案**:

Node.js 默认采用单线程事件循环模型，但可以通过以下几种方式充分利用多核CPU：

## 1. Cluster 模块（主要方式）

Cluster 模块允许创建共享服务器端口的子进程，充分利用多核CPU：

```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);
  
  // 衍生工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
    // 重启工作进程
    cluster.fork();
  });
} else {
  // 工作进程可以共享任意 TCP 连接
  // 在这个例子中，它是 HTTP 服务器
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello World\n');
  }).listen(8000);
  
  console.log(`工作进程 ${process.pid} 已启动`);
}
```

**Cluster 工作原理**：
- 主进程（Master）负责接收所有连接请求
- 主进程通过 Round-Robin（轮询）或其他调度策略将连接分发给工作进程
- 工作进程（Worker）独立处理请求，拥有自己的事件循环

## 2. Worker Threads 模块

对于 CPU 密集型任务，可以使用 Worker Threads 创建真正的多线程：

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // 主线程
  const worker = new Worker(__filename, {
    workerData: { start: 1, end: 1000000 }
  });
  
  worker.on('message', (result) => {
    console.log('计算结果:', result);
  });
  
  worker.on('error', (error) => {
    console.error('工作线程出错:', error);
  });
} else {
  // 工作线程
  const { start, end } = workerData;
  
  // 执行 CPU 密集型任务
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += i;
  }
  
  parentPort.postMessage(sum);
}
```

## 3. 子进程（Child Process）

对于需要完全隔离的计算任务：

```javascript
const { spawn } = require('child_process');

function runCalculation(data) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['calculation.js', JSON.stringify(data)]);
    
    child.stdout.on('data', (data) => {
      resolve(JSON.parse(data.toString()));
    });
    
    child.stderr.on('data', (error) => {
      reject(error.toString());
    });
  });
}
```

## 4. PM2 进程管理器

PM2 是一个流行的 Node.js 进程管理器，可以自动利用多核：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: './app.js',
    instances: 'max', // 使用所有可用的 CPU 核心
    exec_mode: 'cluster' // 使用集群模式
  }]
};
```

## 5. 实际应用示例

```javascript
// server.js - 多核HTTP服务器
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 启动`);
  
  // 创建与CPU核心数相同的工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // 监听工作进程退出事件
  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 退出`);
    // 根据需要重启工作进程
    cluster.fork();
  });
  
  // 监听主进程信号
  process.on('SIGUSR2', () => {
    // 优雅重启
    const workers = Object.values(cluster.workers);
    workers.forEach(worker => worker.send('shutdown'));
  });
} else {
  // 工作进程 - HTTP服务器
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`响应来自进程 ${process.pid}\n`);
  }).listen(8000, () => {
    console.log(`服务器运行在进程 ${process.pid}`);
  });
  
  // 监听主进程消息
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      // 优雅关闭
      setTimeout(() => process.exit(0), 1000);
    }
  });
}
```

## 各方案对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| Cluster | HTTP服务器、I/O密集型 | 简单易用、共享端口 | 仅适用于网络服务 |
| Worker Threads | CPU密集型计算 | 真正的多线程 | 内存开销大、复杂性高 |
| Child Process | 隔离计算、外部程序 | 完全隔离、安全 | 通信开销大 |

## 最佳实践

1. **选择合适的方式**：I/O密集型用Cluster，CPU密集型用Worker Threads
2. **进程监控**：监控工作进程状态，及时重启失败的进程
3. **负载均衡**：合理分配任务，避免某些核心过载
4. **优雅关闭**：确保进程关闭时完成正在进行的任务

通过这些方式，Node.js 应用可以有效利用多核CPU资源，提升性能和并发处理能力。
