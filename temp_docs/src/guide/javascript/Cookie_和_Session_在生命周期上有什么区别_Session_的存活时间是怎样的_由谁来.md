# Cookie 和 Session 在生命周期上有什么区别？Session 的存活时间是怎样的，由谁来销毁？（了解）

**题目**: Cookie 和 Session 在生命周期上有什么区别？Session 的存活时间是怎样的，由谁来销毁？（了解）

## 标准答案

Cookie和Session在生命周期上有显著区别：Cookie的生命周期由max-age或expires控制，可持久存储在客户端；Session的生命周期由服务器控制，在用户会话期间存在，超时后自动销毁。Session存活时间通常由服务器配置决定，可通过setMaxInactiveInterval()设置，由服务器在超时时自动销毁，也可通过invalidate()手动销毁。

## 详细解析

### 1. Cookie生命周期

Cookie的生命周期有以下特点：

#### 持久性Cookie
- 通过设置`expires`或`max-age`属性，Cookie可以在浏览器关闭后仍然存在
- `expires`设置具体的过期时间（GMT格式）
- `max-age`设置从创建开始的秒数

#### 会话Cookie
- 不设置`expires`或`max-age`的Cookie
- 浏览器关闭时自动删除

### 2. Session生命周期

Session的生命周期由服务器控制：

#### 创建时机
- 用户首次访问服务器时创建
- 服务器生成唯一的Session ID并发送给客户端

#### 销毁时机
- 会话超时（超过设定的非活动时间）
- 用户主动登出
- 服务器重启或关闭
- 手动调用销毁方法

### 3. 生命周期控制机制

#### Cookie控制机制
- 客户端控制生命周期
- 可以设置不同的过期时间
- 可以通过JavaScript修改

#### Session控制机制
- 服务器端控制生命周期
- 超时时间由服务器配置决定
- 安全性更高，客户端无法直接修改

## 完整代码实现

### Cookie管理实现

```javascript
// Cookie操作工具类
class CookieManager {
  // 设置Cookie
  static set(name, value, options = {}) {
    const {
      expires = null,     // 过期时间（Date对象或秒数）
      maxAge = null,      // 最大存活时间（秒）
      domain = null,      // 域名
      path = '/',         // 路径
      secure = false,     // 是否仅HTTPS传输
      httpOnly = false,   // 是否仅HTTP访问
      sameSite = 'Lax'    // SameSite属性
    } = options;

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    // 设置过期时间
    if (expires instanceof Date) {
      cookieString += `; expires=${expires.toUTCString()}`;
    } else if (typeof expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + expires * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    }

    // 设置最大存活时间
    if (maxAge !== null) {
      cookieString += `; max-age=${maxAge}`;
    }

    // 设置域名
    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    // 设置路径
    if (path) {
      cookieString += `; path=${path}`;
    }

    // 设置安全标志
    if (secure) {
      cookieString += '; secure';
    }

    // 设置HttpOnly标志
    if (httpOnly) {
      cookieString += '; HttpOnly';
    }

    // 设置SameSite属性
    if (sameSite) {
      cookieString += `; SameSite=${sameSite}`;
    }

    document.cookie = cookieString;
  }

  // 获取Cookie
  static get(name) {
    const cookies = this.getAll();
    return cookies[name] || null;
  }

  // 获取所有Cookie
  static getAll() {
    const cookies = {};
    if (document.cookie) {
      document.cookie.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          cookies[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }
    return cookies;
  }

  // 删除Cookie
  static remove(name, options = {}) {
    const { domain = null, path = '/' } = options;
    
    // 设置过期时间为过去，实现删除
    this.set(name, '', {
      expires: new Date(0),
      domain,
      path
    });
  }

  // 检查Cookie是否存在
  static has(name) {
    return this.get(name) !== null;
  }

  // 获取Cookie生命周期信息
  static getLifetimeInfo(name) {
    // 注意：JavaScript无法直接获取Cookie的过期时间
    // 这里只是模拟实现
    const value = this.get(name);
    if (value) {
      return {
        exists: true,
        name: name,
        value: value
      };
    }
    return { exists: false };
  }
}

// 使用示例
// 设置一个30分钟过期的Cookie
CookieManager.set('sessionId', 'abc123xyz', {
  maxAge: 1800,  // 30分钟（秒）
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'Strict'
});

// 设置一个持久化Cookie（7天）
const oneWeekFromNow = new Date();
oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
CookieManager.set('rememberMe', 'true', {
  expires: oneWeekFromNow,
  path: '/'
});
```

### Session管理实现（Node.js/Express）

```javascript
// Session管理器
class SessionManager {
  constructor(options = {}) {
    this.sessions = new Map(); // 存储会话数据
    this.maxInactiveInterval = options.maxInactiveInterval || 1800; // 默认30分钟
    this.cleanupInterval = options.cleanupInterval || 60000; // 默认1分钟清理一次
    this.startCleanupTimer();
  }

  // 生成Session ID
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 创建新会话
  createSession(userId = null) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId: userId,
      data: new Map(),
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      maxInactiveInterval: this.maxInactiveInterval
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // 获取会话
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // 更新最后访问时间
      session.lastAccessed = Date.now();
      
      // 检查是否过期
      if (this.isExpired(session)) {
        this.destroySession(sessionId);
        return null;
      }
      
      return session;
    }
    
    return null;
  }

  // 检查会话是否过期
  isExpired(session) {
    const now = Date.now();
    const timeSinceLastAccess = now - session.lastAccessed;
    return timeSinceLastAccess > (session.maxInactiveInterval * 1000);
  }

  // 销毁会话
  destroySession(sessionId) {
    this.sessions.delete(sessionId);
  }

  // 手动销毁会话
  invalidateSession(sessionId) {
    this.destroySession(sessionId);
  }

  // 设置会话数据
  setSessionData(sessionId, key, value) {
    const session = this.getSession(sessionId);
    if (session) {
      session.data.set(key, value);
      session.lastAccessed = Date.now();
      return true;
    }
    return false;
  }

  // 获取会话数据
  getSessionData(sessionId, key) {
    const session = this.getSession(sessionId);
    if (session && session.data.has(key)) {
      return session.data.get(key);
    }
    return null;
  }

  // 获取所有活跃会话
  getActiveSessions() {
    const activeSessions = [];
    
    for (const [sessionId, session] of this.sessions) {
      if (!this.isExpired(session)) {
        activeSessions.push({
          id: session.id,
          userId: session.userId,
          createdAt: session.createdAt,
          lastAccessed: session.lastAccessed,
          data: Object.fromEntries(session.data)
        });
      } else {
        // 清理过期会话
        this.sessions.delete(sessionId);
      }
    }
    
    return activeSessions;
  }

  // 设置会话非活动间隔时间
  setMaxInactiveInterval(sessionId, seconds) {
    const session = this.getSession(sessionId);
    if (session) {
      session.maxInactiveInterval = seconds;
      return true;
    }
    return false;
  }

  // 获取会话非活动间隔时间
  getMaxInactiveInterval(sessionId) {
    const session = this.getSession(sessionId);
    if (session) {
      return session.maxInactiveInterval;
    }
    return null;
  }

  // 启动定期清理定时器
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupInterval);
  }

  // 清理过期会话
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastAccessed > (session.maxInactiveInterval * 1000)) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    console.log(`清理了 ${cleanedCount} 个过期会话`);
  }

  // 获取会话剩余时间
  getSessionTimeRemaining(sessionId) {
    const session = this.getSession(sessionId);
    if (session) {
      const timeSinceLastAccess = Date.now() - session.lastAccessed;
      const remainingTime = (session.maxInactiveInterval * 1000) - timeSinceLastAccess;
      return Math.max(0, remainingTime);
    }
    return 0;
  }
}

// Express中间件实现Session管理
const express = require('express');
const app = express();

// 简单的Session中间件
const sessionManager = new SessionManager({ maxInactiveInterval: 1800 }); // 30分钟

function sessionMiddleware(req, res, next) {
  // 从请求头或Cookie中获取Session ID
  let sessionId = req.headers['x-session-id'] || 
                  (req.headers.cookie && 
                   req.headers.cookie.split('; ')
                   .find(row => row.startsWith('sessionId='))
                   ?.split('=')[1]);

  if (!sessionId) {
    // 创建新会话
    const session = sessionManager.createSession();
    sessionId = session.id;
    
    // 将Session ID设置到响应头
    res.setHeader('X-Session-Id', sessionId);
    
    // 可选：设置Cookie存储Session ID
    res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly; Secure`);
  }

  // 获取会话对象
  const session = sessionManager.getSession(sessionId);
  
  if (session) {
    // 将会话对象附加到请求对象
    req.session = {
      id: session.id,
      data: session.data,
      destroy: () => sessionManager.destroySession(session.id),
      regenerate: () => {
        sessionManager.destroySession(session.id);
        const newSession = sessionManager.createSession();
        req.session = {
          id: newSession.id,
          data: newSession.data,
          destroy: () => sessionManager.destroySession(newSession.id)
        };
      }
    };
  } else {
    // 会话已过期，创建新会话
    const newSession = sessionManager.createSession();
    req.session = {
      id: newSession.id,
      data: newSession.data,
      destroy: () => sessionManager.destroySession(newSession.id)
    };
    res.setHeader('X-Session-Id', newSession.id);
  }

  next();
}

// 使用Session中间件
app.use(sessionMiddleware);

// 示例路由
app.get('/login', (req, res) => {
  // 模拟登录，设置用户信息到Session
  req.session.data.set('userId', 123);
  req.session.data.set('username', 'john_doe');
  req.session.data.set('loginTime', new Date().toISOString());
  
  res.json({ 
    message: '登录成功', 
    sessionId: req.session.id,
    userInfo: {
      userId: req.session.data.get('userId'),
      username: req.session.data.get('username')
    }
  });
});

app.get('/profile', (req, res) => {
  if (!req.session.data.get('userId')) {
    return res.status(401).json({ error: '未登录' });
  }
  
  res.json({
    userId: req.session.data.get('userId'),
    username: req.session.data.get('username'),
    loginTime: req.session.data.get('loginTime')
  });
});

app.get('/logout', (req, res) => {
  // 销毁会话
  req.session.destroy();
  res.json({ message: '已登出' });
});

// 启动服务器
// app.listen(3000, () => {
//   console.log('服务器运行在端口3000');
// });
```

### Java Servlet中的Session管理

```java
// Session管理示例（Java Servlet）
import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.Enumeration;

public class SessionManagementServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 获取当前会话，如果不存在则创建
        HttpSession session = request.getSession(true);
        
        String action = request.getParameter("action");
        
        if ("create".equals(action)) {
            // 设置会话属性
            session.setAttribute("username", "john_doe");
            session.setAttribute("loginTime", System.currentTimeMillis());
            
            // 设置会话超时时间为30分钟
            session.setMaxInactiveInterval(1800);
            
            response.getWriter().println("Session created with ID: " + session.getId());
            response.getWriter().println("Max inactive interval: " + session.getMaxInactiveInterval() + " seconds");
            
        } else if ("info".equals(action)) {
            // 获取会话信息
            response.getWriter().println("Session ID: " + session.getId());
            response.getWriter().println("Creation Time: " + new java.util.Date(session.getCreationTime()));
            response.getWriter().println("Last Accessed Time: " + new java.util.Date(session.getLastAccessedTime()));
            response.getWriter().println("Max Inactive Interval: " + session.getMaxInactiveInterval() + " seconds");
            
            // 获取会话属性
            Enumeration<String> attributeNames = session.getAttributeNames();
            while (attributeNames.hasMoreElements()) {
                String name = attributeNames.nextElement();
                response.getWriter().println(name + ": " + session.getAttribute(name));
            }
            
        } else if ("destroy".equals(action)) {
            // 销毁会话
            session.invalidate();
            response.getWriter().println("Session destroyed");
            
        } else if ("update".equals(action)) {
            // 更新会话最后访问时间
            // 这会重置超时计时器
            session.getAttributeNames(); // 简单访问以更新最后访问时间
            response.getWriter().println("Session accessed, timeout timer reset");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        HttpSession session = request.getSession(false); // 不创建新会话
        
        if (session != null) {
            String username = request.getParameter("username");
            if (username != null) {
                session.setAttribute("username", username);
                response.getWriter().println("Username updated in session");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().println("No active session");
        }
    }
}

// Session监听器示例
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

public class SessionListener implements HttpSessionListener {
    
    @Override
    public void sessionCreated(HttpSessionEvent se) {
        System.out.println("Session created: " + se.getSession().getId());
        
        // 可以在这里进行会话创建后的初始化工作
        se.getSession().setMaxInactiveInterval(1800); // 30分钟
    }
    
    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        System.out.println("Session destroyed: " + se.getSession().getId());
        
        // 可以在这里进行资源清理工作
        // 例如：从数据库中删除临时数据、记录日志等
    }
}
```

## 实际应用场景

### 1. 用户登录状态管理
- Cookie: 存储"记住我"功能的令牌
- Session: 存储用户认证信息和权限数据

### 2. 购物车功能
- Cookie: 存储匿名用户的购物车（小数据量）
- Session: 存储登录用户的购物车（大数据量）

### 3. 用户偏好设置
- Cookie: 存储界面主题、语言偏好等
- Session: 存储临时的表单数据

## 注意事项

1. 安全性：敏感数据应存储在Session中，而非Cookie
2. 存储限制：Cookie有大小限制（通常4KB），Session无此限制
3. 性能：频繁的Session操作可能影响服务器性能
4. 集群环境：在分布式系统中需要Session共享机制
5. 内存管理：及时清理过期Session，避免内存泄漏
