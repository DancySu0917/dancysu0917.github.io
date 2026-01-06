# express 中如何获取路由的参数？（高薪常问）

**题目**: express 中如何获取路由的参数？（高薪常问）

在 Express 中，可以通过多种方式获取路由参数，主要包括以下几种：

## 1. URL路径参数 (req.params)

用于获取路由定义中的动态参数：

```javascript
const express = require('express');
const app = express;

// 定义路由参数
app.get('/users/:id', (req, res) => {
  console.log(req.params.id); // 获取路径参数 id
  res.send(`User ID: ${req.params.id}`);
});

// 多个参数
app.get('/users/:userId/posts/:postId', (req, res) => {
  console.log(req.params.userId); // 获取 userId
  console.log(req.params.postId); // 获取 postId
  res.send(`User: ${req.params.userId}, Post: ${req.params.postId}`);
});
```

## 2. 查询参数 (req.query)

用于获取URL中的查询字符串参数：

```javascript
app.get('/search', (req, res) => {
  console.log(req.query.q);     // 获取 ?q=value
  console.log(req.query.limit); // 获取 ?limit=value
  res.send(`Search query: ${req.query.q}, Limit: ${req.query.limit}`);
});

// 访问 /search?q=javascript&limit=10
// req.query = { q: 'javascript', limit: '10' }
```

## 3. 请求体参数 (req.body)

用于获取POST请求中的表单数据或JSON数据：

```javascript
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // 解析JSON请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析URL编码请求体

app.post('/users', (req, res) => {
  console.log(req.body.name);  // 获取请求体中的 name 字段
  console.log(req.body.email); // 获取请求体中的 email 字段
  res.send(`User: ${req.body.name}, Email: ${req.body.email}`);
});
```

## 4. 请求头参数 (req.headers)

用于获取HTTP请求头中的信息：

```javascript
app.get('/api', (req, res) => {
  console.log(req.headers.authorization); // 获取认证信息
  console.log(req.headers['content-type']); // 获取内容类型
  res.send('Headers received');
});
```

## 5. 请求头中的Cookie (req.cookies)

需要使用中间件来解析cookies：

```javascript
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/profile', (req, res) => {
  console.log(req.cookies.sessionId); // 获取cookie中的sessionId
  res.send('Profile page');
});
```

## 6. 正则表达式路由参数

使用正则表达式匹配复杂路由：

```javascript
// 匹配数字ID
app.get(/\/book\/([0-9]+)/, (req, res) => {
  console.log(req.params[0]); // 获取正则匹配的第一个组
  res.send(`Book ID: ${req.params[0]}`);
});
```

## 7. 可选参数

定义可选的路由参数：

```javascript
// :page? 表示 page 参数是可选的
app.get('/articles/:category/:page?', (req, res) => {
  const { category, page } = req.params;
  console.log(`Category: ${category}, Page: ${page || 1}`);
  res.send(`Category: ${category}, Page: ${page || 1}`);
});
```

## 8. 使用 req.param() 方法（已废弃）

在较早版本的 Express 中，可以使用 req.param() 方法获取参数，但该方法在新版本中已被废弃，不推荐使用。

```javascript
// 不推荐使用（已废弃）
// req.param('id')
```

## 最佳实践

1. **验证参数**：始终验证获取到的参数，确保它们符合预期格式
2. **错误处理**：对缺失或无效的参数进行适当的错误处理
3. **使用中间件**：利用中间件如 express-validator 进行参数验证
4. **安全性**：对用户输入的参数进行清理和验证，防止注入攻击

```javascript
const { body, validationResult } = require('express-validator');

app.post('/users', 
  // 验证规则
  body('email').isEmail().normalizeEmail(),
  body('age').isInt({ min: 0, max: 120 }),
  (req, res) => {
    // 获取验证结果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // 参数验证通过，处理请求
    res.send('User created successfully');
  }
);
```

以上就是在 Express 中获取路由参数的主要方法，根据不同的使用场景选择合适的方式。
