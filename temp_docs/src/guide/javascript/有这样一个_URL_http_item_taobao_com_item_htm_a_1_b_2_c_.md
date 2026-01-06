# 有这样一个 URL：http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e，请写一段 JS 程序提取 URL 中的各个 GET 参数(参数名和参数个数不确定)，将其按 key-value 形式返回到一个 json 结构中，如{a: "1", b: "2", c: "", d: "xxx", e: undefined}？（必会）

**题目**: 有这样一个 URL：http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e，请写一段 JS 程序提取 URL 中的各个 GET 参数(参数名和参数个数不确定)，将其按 key-value 形式返回到一个 json 结构中，如{a: "1", b: "2", c: "", d: "xxx", e: undefined}？（必会）

**答案**:

有多种方法可以提取URL中的GET参数，以下是几种常见的实现方式：

## 方法1：使用URLSearchParams（推荐，现代浏览器）

```javascript
function getUrlParams(url) {
  // 创建URL对象
  const urlObj = new URL(url);
  // 创建URLSearchParams实例
  const params = new URLSearchParams(urlObj.search);
  const result = {};
  
  // 遍历所有参数
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
}

// 使用示例
const url = 'http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e';
const params = getUrlParams(url);
console.log(params); // {a: "1", b: "2", c: "", d: "xxx", e: ""}
```

## 方法2：正则表达式解析

```javascript
function getUrlParams(url) {
  // 提取查询字符串部分（?后面的部分）
  const queryString = url.split('?')[1];
  
  if (!queryString) {
    return {};
  }
  
  const params = {};
  // 按&分割参数
  const pairs = queryString.split('&');
  
  for (let pair of pairs) {
    // 按=分割键值对
    const [key, value = ''] = pair.split('=');
    // 解码参数值（处理URL编码）
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  
  return params;
}

// 使用示例
const url = 'http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e';
const params = getUrlParams(url);
console.log(params); // {a: "1", b: "2", c: "", d: "xxx", e: ""}
```

## 方法3：更完整的实现（处理边界情况）

```javascript
function getUrlParams(url) {
  try {
    // 使用URL构造函数解析URL
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const result = {};
    
    // 遍历所有参数
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  } catch (error) {
    console.error('URL解析错误:', error);
    return {};
  }
}

// 使用示例
const url = 'http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e';
console.log(getUrlParams(url)); // {a: "1", b: "2", c: "", d: "xxx", e: ""}
```

## 方法4：兼容性更好的实现（支持旧浏览器）

```javascript
function getUrlParams(url) {
  const result = {};
  
  // 提取查询字符串部分
  const queryString = url.split('?')[1];
  if (!queryString) {
    return result;
  }
  
  // 按&分割参数
  const pairs = queryString.split('&');
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    // 处理没有值的参数（如示例中的'e'）
    const separatorIndex = pair.indexOf('=');
    let key, value;
    
    if (separatorIndex === -1) {
      // 没有=号，参数值为undefined
      key = decodeURIComponent(pair);
      value = undefined;
    } else {
      key = decodeURIComponent(pair.substring(0, separatorIndex));
      value = decodeURIComponent(pair.substring(separatorIndex + 1));
    }
    
    result[key] = value;
  }
  
  return result;
}

// 使用示例
const url = 'http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e';
console.log(getUrlParams(url)); // {a: "1", b: "2", c: "", d: "xxx", e: undefined}
```

## 方法5：使用reduce的函数式编程方法

```javascript
function getUrlParams(url) {
  const queryString = url.split('?')[1] || '';
  
  return queryString
    .split('&')
    .filter(param => param) // 过滤空字符串
    .reduce((acc, param) => {
      const [key, value] = param.split('=');
      acc[decodeURIComponent(key)] = value !== undefined ? decodeURIComponent(value) : undefined;
      return acc;
    }, {});
}

// 使用示例
const url = 'http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e';
console.log(getUrlParams(url)); // {a: "1", b: "2", c: "", d: "xxx", e: undefined}
```

## 方法6：处理重复参数名的情况

```javascript
function getUrlParams(url, allowDuplicateKeys = false) {
  const queryString = url.split('?')[1] || '';
  const pairs = queryString.split('&').filter(param => param);
  const result = {};
  
  pairs.forEach(param => {
    const separatorIndex = param.indexOf('=');
    let key, value;
    
    if (separatorIndex === -1) {
      key = decodeURIComponent(param);
      value = undefined;
    } else {
      key = decodeURIComponent(param.substring(0, separatorIndex));
      value = decodeURIComponent(param.substring(separatorIndex + 1));
    }
    
    if (allowDuplicateKeys && result.hasOwnProperty(key)) {
      // 如果允许重复键，将值存储为数组
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });
  
  return result;
}

// 使用示例
const url = 'http://item.taobao.com/item.htm?a=1&b=2&c=&d=xxx&e&a=2';
console.log(getUrlParams(url)); // {a: "2", b: "2", c: "", d: "xxx", e: undefined}
console.log(getUrlParams(url, true)); // {a: ["1", "2"], b: "2", c: "", d: "xxx", e: undefined}
```

## 总结

- **现代浏览器推荐**：使用URLSearchParams API，简洁且功能完善
- **兼容性考虑**：使用正则表达式或字符串分割方法
- **特殊情况处理**：注意处理无值参数（如示例中的'e'）和URL编码
- **错误处理**：添加try-catch处理无效URL的情况

在实际开发中，推荐使用URLSearchParams方法，它提供了更好的API和错误处理。
