# 已知有字符串 foo="get-element-by-id",写一个 function 将其转化成驼峰表示法"getElementById"？（必会）

**题目**: 已知有字符串 foo="get-element-by-id",写一个 function 将其转化成驼峰表示法"getElementById"？（必会）

**答案**:

有多种方法可以将连字符分隔的字符串转换为驼峰命名法：

## 方法一：使用 split 和 map

```javascript
function toCamelCase(str) {
  // 按连字符分割字符串
  const parts = str.split('-');
  
  // 第一部分保持小写，其余部分首字母大写
  return parts.map((part, index) => {
    if (index === 0) {
      return part.toLowerCase();
    }
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  }).join('');
}

// 测试
console.log(toCamelCase("get-element-by-id")); // "getElementById"
console.log(toCamelCase("foo-bar-baz")); // "fooBarBaz"
```

## 方法二：使用正则表达式

```javascript
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (match, letter) => {
    return letter.toUpperCase();
  });
}

// 测试
console.log(toCamelCase("get-element-by-id")); // "getElementById"
console.log(toCamelCase("background-color")); // "backgroundColor"
```

## 方法三：更通用的实现（支持多种分隔符）

```javascript
function toCamelCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (match, chr) => {
    return chr ? chr.toUpperCase() : '';
  });
}

// 测试多种分隔符
console.log(toCamelCase("get-element-by-id")); // "getElementById"
console.log(toCamelCase("get_element_by_id")); // "getElementById"
console.log(toCamelCase("get element by id")); // "getElementById"
```

## 方法四：使用数组方法的完整实现

```javascript
function toCamelCase(str) {
  if (!str) return '';
  
  // 将字符串按分隔符分割
  const words = str.split(/[-_\s]+/);
  
  // 第一个单词小写，其余单词首字母大写
  return words
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

// 测试
console.log(toCamelCase("get-element-by-id")); // "getElementById"
console.log(toCamelCase("hello-world-test")); // "helloWorldTest"
```

## 方法五：函数式编程风格

```javascript
const toCamelCase = (str) => {
  const [first, ...rest] = str.split('-');
  return first.toLowerCase() + 
         rest.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
};

// 测试
console.log(toCamelCase("get-element-by-id")); // "getElementById"
```

## 处理边界情况的完整实现

```javascript
function toCamelCase(str) {
  // 处理边界情况
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  // 移除首尾分隔符并转换
  return str
    .replace(/^[-_\s]+|[-_\s]+$/g, '') // 移除首尾分隔符
    .replace(/[-_\s]+(.)?/g, (match, chr) => {
      return chr ? chr.toUpperCase() : '';
    });
}

// 测试各种情况
console.log(toCamelCase("get-element-by-id")); // "getElementById"
console.log(toCamelCase("-get-element-by-id-")); // "getElementById"
console.log(toCamelCase("")); // ""
console.log(toCamelCase("single")); // "single"
```

## 性能优化版本

```javascript
function toCamelCase(str) {
  let result = '';
  let shouldCapitalize = false;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (char === '-' || char === '_' || char === ' ') {
      shouldCapitalize = true;
    } else {
      result += shouldCapitalize ? char.toUpperCase() : (i === 0 ? char.toLowerCase() : char);
      shouldCapitalize = false;
    }
  }
  
  return result;
}

// 测试
console.log(toCamelCase("get-element-by-id")); // "getElementById"
```

## 在实际项目中的应用

```javascript
// CSS 属性名转换
const cssToJS = (cssProp) => {
  return toCamelCase(cssProp);
};

console.log(cssToJS("background-color")); // "backgroundColor"
console.log(cssToJS("font-size")); // "fontSize"
console.log(cssToJS("text-align")); // "textAlign"

// API 响应数据转换
function convertKeysToCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[toCamelCase(key)] = convertKeysToCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// 示例
const apiResponse = {
  "user-name": "John",
  "user-age": 30,
  "account-info": {
    "email-address": "john@example.com",
    "phone-number": "123-456-7890"
  }
};

console.log(convertKeysToCamelCase(apiResponse));
// { userName: "John", userAge: 30, accountInfo: { emailAddress: "john@example.com", phoneNumber: "123-456-7890" }}
```

其中，使用正则表达式的方法（方法二）是最简洁高效的实现方式，推荐在实际项目中使用。
