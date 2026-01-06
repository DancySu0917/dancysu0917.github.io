# 什么是 TCP 连接的三次握手？（高薪常问）

**题目**: 什么是 TCP 连接的三次握手？（高薪常问）

## 标准答案

TCP 三次握手是建立 TCP 连接的过程，目的是为了同步客户端和服务器之间的序列号，并确认双方的通信能力。三次握手过程如下：

1. 第一次握手：客户端向服务器发送 SYN 包（SYN = 1, seq = x），进入 SYN_SENT 状态
2. 第二次握手：服务器收到 SYN 包后，向客户端发送 SYN+ACK 包（SYN = 1, ACK = 1, seq = y, ack = x+1），进入 SYN_RCVD 状态
3. 第三次握手：客户端收到 SYN+ACK 包后，向服务器发送 ACK 包（ACK = 1, seq = x+1, ack = y+1），连接建立成功

## 深入理解

TCP 三次握手的目的是为了确保通信双方都具备发送和接收数据的能力，同时同步初始序列号，防止历史连接的干扰。

```javascript
// 三次握手的时序图示意
const handshakeDiagram = `
Client                    Server
  |                         |
  |------ SYN (seq=x) ------->|  // 第一次握手：客户端发送SYN
  |                         |
  |<- SYN+ACK (seq=y,ack=x+1)-|  // 第二次握手：服务器响应SYN+ACK
  |                         |
  |------ ACK (seq=x+1,ack=y+1)-->|  // 第三次握手：客户端发送ACK
  |                         |
  |<=> Connection Established|  // 连接建立成功
`;

// 模拟三次握手的代码示例（Node.js）
const net = require('net');

// 模拟客户端
function simulateClient() {
  console.log('客户端：发送 SYN 请求');
  
  setTimeout(() => {
    console.log('客户端：收到服务器 SYN+ACK 响应');
    console.log('客户端：发送 ACK 确认');
    console.log('客户端：连接建立成功');
  }, 100);
}

// 模拟服务器
function simulateServer() {
  setTimeout(() => {
    console.log('服务器：收到客户端 SYN 请求');
    console.log('服务器：发送 SYN+ACK 响应');
    
    setTimeout(() => {
      console.log('服务器：收到客户端 ACK 确认');
      console.log('服务器：连接建立成功');
    }, 100);
  }, 50);
}

console.log('开始模拟 TCP 三次握手过程：');
simulateServer();
simulateClient();

// 三次握手的重要性
const handshakeImportance = {
  '同步序列号': '确保双方都知道对方的初始序列号，用于后续数据包的排序和确认',
  '确认通信能力': '验证双方都具备发送和接收数据的能力',
  '防止历史连接': '避免使用过期的连接请求造成混乱',
  '资源分配': '服务器在确认连接后才分配资源，防止恶意连接'
};
```

在实际网络编程中，我们可以通过抓包工具（如 Wireshark）观察三次握手过程，或使用 Node.js 的 net 模块创建 TCP 连接来理解其工作原理。三次握手是 TCP 协议可靠性的基础，确保了数据传输的准确性和完整性。
