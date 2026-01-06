# 用 JS 写一个 cookies 解析函数，输出结果为一个对象？（了解）

**题目**: 用 JS 写一个 cookies 解析函数，输出结果为一个对象？（了解）

**答案**:

## Cookie解析函数实现

### 基础版本
```javascript
function parseCookies(cookieStr) {
  const cookies = {};
  
  if (!cookieStr || typeof cookieStr !== 'string') {
    return cookies;
  }
  
  const pairs = cookieStr.split(';');
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].trim();
    
    if (!pair) continue;
    
    const indexOfEquals = pair.indexOf('=');
    let name, value;
    
    if (indexOfEquals === -1) {
      name = pair;
      value = '';
    } else {
      name = pair.substr(0, indexOfEquals).trim();
      value = pair.substr(indexOfEquals + 1).trim();
    }
    
    // 解码cookie名称和值
    name = decodeURIComponent(name);
    value = decodeURIComponent(value);
    
    cookies[name] = value;
  }
  
  return cookies;
}

// 使用示例
const cookieString = "name=John; age=25; city=Beijing; token=abc123";
const parsedCookies = parseCookies(cookieString);
console.log(parsedCookies); 
// 输出: { name: 'John', age: '25', city: 'Beijing', token: 'abc123' }
```

### 增强版本（处理更多边界情况）
```javascript
function parseCookiesAdvanced(cookieStr) {
  const cookies = {};
  
  if (!cookieStr || typeof cookieStr !== 'string') {
    return cookies;
  }
  
  // 处理document.cookie或自定义cookie字符串
  const pairs = cookieStr.split(/;\s*/);
  
  for (const pair of pairs) {
    if (!pair) continue;
    
    const [name, ...valueParts] = pair.split('=');
    const nameTrimmed = name.trim();
    
    if (!nameTrimmed) continue;
    
    // 组合可能包含等号的值
    const value = valueParts.join('=').trim();
    
    try {
      // 解码cookie名称和值
      const decodedName = decodeURIComponent(nameTrimmed);
      const decodedValue = decodeURIComponent(value);
      
      cookies[decodedName] = decodedValue;
    } catch (e) {
      // 如果解码失败，使用原始值
      cookies[nameTrimmed] = value;
    }
  }
  
  return cookies;
}
```

### 获取当前页面cookie的函数
```javascript
function getCookies() {
  return parseCookies(document.cookie);
}

// 使用示例
const allCookies = getCookies();
console.log(allCookies);
```

### 完整的Cookie工具类
```javascript
class CookieUtil {
  // 解析cookie字符串
  static parse(str) {
    const cookies = {};
    
    if (!str || typeof str !== 'string') {
      return cookies;
    }
    
    const pairs = str.split(/;\s*/);
    
    for (const pair of pairs) {
      if (!pair) continue;
      
      const [name, ...valueParts] = pair.split('=');
      const nameTrimmed = name.trim();
      
      if (!nameTrimmed) continue;
      
      const value = valueParts.join('=').trim();
      
      try {
        const decodedName = decodeURIComponent(nameTrimmed);
        const decodedValue = decodeURIComponent(value);
        cookies[decodedName] = decodedValue;
      } catch (e) {
        cookies[nameTrimmed] = value;
      }
    }
    
    return cookies;
  }
  
  // 获取当前页面的所有cookie
  static getAll() {
    return this.parse(document.cookie);
  }
  
  // 获取指定名称的cookie值
  static get(name) {
    const cookies = this.getAll();
    return cookies[name];
  }
  
  // 设置cookie
  static set(name, value, options = {}) {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (options.expires) {
      cookieStr += `; expires=${options.expires.toUTCString()}`;
    }
    
    if (options.maxAge) {
      cookieStr += `; max-age=${options.maxAge}`;
    }
    
    if (options.domain) {
      cookieStr += `; domain=${options.domain}`;
    }
    
    if (options.path) {
      cookieStr += `; path=${options.path}`;
    }
    
    if (options.secure) {
      cookieStr += '; secure';
    }
    
    if (options.httpOnly) {
      cookieStr += '; httponly';
    }
    
    if (options.sameSite) {
      cookieStr += `; samesite=${options.sameSite}`;
    }
    
    document.cookie = cookieStr;
  }
  
  // 删除cookie
  static remove(name, path, domain) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${path ? `; path=${path}` : ''}${domain ? `; domain=${domain}` : ''}`;
  }
}

// 使用示例
// 解析cookie字符串
const cookieObj = CookieUtil.parse("username=john; age=30; city=shanghai");
console.log(cookieObj); // { username: 'john', age: '30', city: 'shanghai' }

// 获取当前页面所有cookie
const allCookies = CookieUtil.getAll();
console.log(allCookies);

// 获取特定cookie
const username = CookieUtil.get('username');
console.log(username);

// 设置cookie
CookieUtil.set('theme', 'dark', { 
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
  path: '/' 
});
```

## 注意事项

1. **安全性**: Cookie中的数据是明文存储的，不应存放敏感信息
2. **大小限制**: 单个Cookie大小通常限制在4KB左右
3. **编码处理**: 需要正确处理URL编码和解码
4. **特殊字符**: Cookie值中不能包含某些特殊字符，如分号、逗号等
5. **域名限制**: Cookie只能在设置它的域名及其子域名下访问
6. **HTTPS**: 敏感Cookie应设置secure标志，只在HTTPS连接中传输

## 实际应用场景

- 用户身份验证
- 购物车信息存储
- 用户偏好设置
- 跟踪用户行为
- Session管理
