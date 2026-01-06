# Node 怎么跟 MongoDB 建立连接？（高薪常问）

**题目**: Node 怎么跟 MongoDB 建立连接？（高薪常问）

**答案**:

在Node.js中连接MongoDB有多种方式，最常用的是使用官方的MongoDB驱动程序或Mongoose ODM。以下是详细的连接方法：

## 1. 使用官方MongoDB驱动程序

### 安装依赖
```bash
npm install mongodb
```

### 基础连接示例
```javascript
const { MongoClient } = require('mongodb');

// MongoDB连接URL
const url = 'mongodb://localhost:27017'; // 本地连接
// 或者使用云服务连接字符串
// const url = 'mongodb+srv://username:password@cluster.mongodb.net/databaseName';

// 数据库名称
const dbName = 'myproject';

async function connectToMongoDB() {
  const client = new MongoClient(url);
  
  try {
    // 连接到MongoDB服务器
    await client.connect();
    console.log('成功连接到MongoDB服务器');
    
    // 获取数据库引用
    const db = client.db(dbName);
    
    // 在这里可以执行数据库操作
    const collection = db.collection('documents');
    
    // 示例：插入文档
    const result = await collection.insertOne({ name: 'John', age: 30 });
    console.log('插入文档ID:', result.insertedId);
    
    return db;
  } catch (err) {
    console.error('连接MongoDB失败:', err);
    throw err;
  }
}

// 调用连接函数
connectToMongoDB();
```

### 使用连接池配置
```javascript
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url, {
  useUnifiedTopology: true,        // 使用新的拓扑引擎
  maxPoolSize: 10,                 // 连接池中最大连接数
  serverSelectionTimeoutMS: 5000,  // 服务器选择超时时间
  socketTimeoutMS: 45000,          // Socket超时时间
  bufferMaxEntries: 0,             // 禁用驱动程序的缓冲
});

async function connectWithPool() {
  try {
    await client.connect();
    console.log('使用连接池连接MongoDB成功');
    return client.db('myproject');
  } catch (err) {
    console.error('连接失败:', err);
    throw err;
  }
}
```

## 2. 使用Mongoose ODM（推荐）

### 安装依赖
```bash
npm install mongoose
```

### Mongoose连接示例
```javascript
const mongoose = require('mongoose');

// 连接字符串
const mongoURI = 'mongodb://localhost:27017/myproject';
// 或者使用云服务
// const mongoURI = 'mongodb+srv://username:password@cluster.mongodb.net/databaseName';

async function connectWithMongoose() {
  try {
    // 连接数据库
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB连接成功: ${conn.connection.host}`);
    
    // 监听连接事件
    mongoose.connection.on('connected', () => {
      console.log('Mongoose连接已建立');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose连接错误:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose连接已断开');
    });
    
    // 处理应用关闭时的优雅断开
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose连接已断开通过应用终止');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
}

connectWithMongoose();
```

### Mongoose Schema和Model定义
```javascript
const mongoose = require('mongoose');

// 定义Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建Model
const User = mongoose.model('User', userSchema);

// 使用Model进行CRUD操作
async function performCRUD() {
  try {
    // 创建文档
    const newUser = new User({
      name: 'Alice',
      email: 'alice@example.com',
      age: 25
    });
    
    const savedUser = await newUser.save();
    console.log('用户创建成功:', savedUser);
    
    // 查询文档
    const user = await User.findOne({ email: 'alice@example.com' });
    console.log('查询用户:', user);
    
  } catch (error) {
    console.error('操作失败:', error);
  }
}
```

## 3. 连接配置和最佳实践

### 环境变量配置
```javascript
// config/database.js
require('dotenv').config();

const config = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/myproject',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

module.exports = config;
```

### 数据库连接管理类
```javascript
// db/connection.js
const mongoose = require('mongoose');
const config = require('../config/database');

class Database {
  constructor() {
    this.isConnected = false;
  }
  
  async connect() {
    if (this.isConnected) {
      console.log('已连接到数据库');
      return;
    }
    
    try {
      const conn = await mongoose.connect(config.mongoURI, config.options);
      this.isConnected = true;
      console.log(`MongoDB连接成功: ${conn.connection.host}`);
      
      // 监听连接状态变化
      conn.connection.on('disconnected', () => {
        this.isConnected = false;
        console.log('MongoDB连接已断开');
      });
      
    } catch (error) {
      console.error('MongoDB连接失败:', error);
      process.exit(1);
    }
  }
  
  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('MongoDB连接已断开');
    }
  }
}

module.exports = new Database();
```

## 4. 错误处理和重连机制

```javascript
const mongoose = require('mongoose');

let isConnecting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

mongoose.connection.on('connecting', () => {
  console.log('正在连接MongoDB...');
  isConnecting = true;
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB连接成功');
  isConnecting = false;
  reconnectAttempts = 0;
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB重新连接成功');
  reconnectAttempts = 0;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB连接断开');
  isConnecting = false;
  
  // 尝试重连
  if (reconnectAttempts < maxReconnectAttempts) {
    setTimeout(() => {
      reconnectAttempts++;
      console.log(`尝试重新连接 (${reconnectAttempts}/${maxReconnectAttempts})`);
      mongoose.connect(config.mongoURI, config.options);
    }, 5000); // 5秒后重试
  }
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err);
  mongoose.disconnect();
});
```

## 总结

1. **官方驱动程序**：更底层，性能更好，适合需要精确控制的场景
2. **Mongoose ODM**：提供Schema、Model等高级功能，适合快速开发
3. **连接池管理**：合理配置连接池参数以优化性能
4. **错误处理**：实现重连机制确保应用稳定性
5. **环境配置**：使用环境变量管理不同环境的连接字符串

选择哪种方式取决于项目需求：简单项目可直接使用官方驱动，复杂项目建议使用Mongoose。
