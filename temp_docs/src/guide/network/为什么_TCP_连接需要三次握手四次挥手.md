# 为什么 TCP 连接需要三次握手四次挥手？（高薪常问）

**题目**: 为什么 TCP 连接需要三次握手四次挥手？（高薪常问）

## 标准答案

**三次握手的原因**：
1. 为了同步双方的初始序列号，确保数据传输的可靠性
2. 确认双方都具备发送和接收数据的能力
3. 防止历史连接的干扰

**四次挥手的原因**：
1. TCP 是全双工协议，双方都需要独立关闭连接
2. 确保数据完全传输完毕再关闭连接
3. 防止数据丢失

## 深入理解

三次握手和四次挥手是 TCP 协议的核心机制，确保了连接的可靠建立和安全关闭。

```javascript
// 四次挥手过程示意
const fourWayHandshakeDiagram = `
Client                    Server
  |                         |
  |------ FIN (seq=u) ------->|  // 第一次挥手：客户端发送FIN
  |                         |
  |<- ACK (seq=v, ack=u+1) ---|  // 第二次挥手：服务器响应ACK
  |                         |
  |<-- FIN (seq=w, ack=u+1) --|  // 第三次挥手：服务器发送FIN
  |                         |
  |------ ACK (seq=u+1,ack=w+1)-->|  // 第四次挥手：客户端响应ACK
  |                         |
  |<=> Connection Closed     |  // 连接关闭
`;

// 模拟四次挥手的代码示例
function simulateFourWayHandshake() {
  console.log('=== TCP 四次挥手过程模拟 ===');
  
  // 第一次挥手：客户端发起关闭请求
  console.log('客户端 -> 服务器: FIN (请求关闭连接)');
  
  setTimeout(() => {
    // 第二次挥手：服务器确认收到关闭请求
    console.log('服务器 -> 客户端: ACK (确认收到关闭请求)');
    
    // 服务器处理完剩余数据
    console.log('服务器处理剩余数据...');
    
    setTimeout(() => {
      // 第三次挥手：服务器也准备关闭连接
      console.log('服务器 -> 客户端: FIN (服务器也准备关闭)');
      
      setTimeout(() => {
        // 第四次挥手：客户端确认服务器关闭
        console.log('客户端 -> 服务器: ACK (确认服务器关闭)');
        console.log('连接已完全关闭');
      }, 100);
    }, 200);
  }, 100);
}

simulateFourWayHandshake();

// 为什么需要四次挥手而不是三次？
const whyFourWay = {
  '全双工特性': 'TCP 是全双工协议，两端可以独立发送数据，所以关闭也需要独立处理',
  '数据完整性': '确保双方都完成数据发送后再关闭，防止数据丢失',
  '半关闭状态': '允许一端先关闭发送功能，但仍能接收数据'
};

// 三次握手的必要性
const whyThreeWay = {
  '防止历史连接': '避免使用过期的连接请求造成混乱',
  '同步序列号': '确保双方都知道对方的初始序列号',
  '确认通信能力': '验证双方都具备发送和接收数据的能力'
};

// TCP状态转换
const tcpStates = {
  '三次握手': [
    'CLOSED -> SYN_SENT (客户端发送SYN)',
    'LISTEN -> SYN_RCVD (服务器收到SYN，发送SYN+ACK)',
    'SYN_RCVD -> ESTABLISHED (服务器收到ACK)',
    'SYN_SENT -> ESTABLISHED (客户端收到SYN+ACK，发送ACK)'
  ],
  '四次挥手': [
    'ESTABLISHED -> FIN_WAIT_1 (客户端发送FIN)',
    'FIN_WAIT_1 -> FIN_WAIT_2 (客户端收到ACK)',
    'ESTABLISHED -> CLOSE_WAIT (服务器收到FIN)',
    'CLOSE_WAIT -> LAST_ACK (服务器发送FIN)',
    'FIN_WAIT_2 -> TIME_WAIT (客户端收到FIN)',
    'TIME_WAIT -> CLOSED (客户端超时后关闭)',
    'LAST_ACK -> CLOSED (服务器收到ACK后关闭)'
  ]
};
```

TCP 的三次握手和四次挥手机制是网络协议设计的精华，它们确保了数据传输的可靠性。在实际应用中，如果出现握手失败或挥手异常，可能会导致连接问题，需要通过网络抓包工具分析解决。
