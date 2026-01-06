# 输出今天的日期，以 YYYY-MM-DD 的方式，比如今天是 2014 年 9 月 26 日，则输出 2014-09-26？（必会）

**题目**: 输出今天的日期，以 YYYY-MM-DD 的方式，比如今天是 2014 年 9 月 26 日，则输出 2014-09-26？（必会）

**答案**:

有多种方法可以获取并格式化今天的日期为 YYYY-MM-DD 格式，以下是几种常见的实现方式：

## 1. 使用原生 JavaScript 的 Date 对象

```javascript
// 方法一：手动格式化
function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要+1
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

console.log(getTodayDate()); // 输出格式如：2026-01-02
```

## 2. 使用 toISOString() 方法

```javascript
// 方法二：使用 toISOString 并截取日期部分
function getTodayDateISO() {
  const date = new Date();
  return date.toISOString().split('T')[0]; // 获取 "YYYY-MM-DD" 部分
}

console.log(getTodayDateISO()); // 输出格式如：2026-01-02
```

## 3. 使用 toLocaleDateString() 方法

```javascript
// 方法三：使用 toLocaleDateString
function getTodayDateLocale() {
  const date = new Date();
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-'); // 将分隔符从 "/" 替换为 "-"
}

console.log(getTodayDateLocale()); // 输出格式如：2026-01-02
```

## 4. 使用 padStart() 确保两位数格式

```javascript
// 方法四：更安全的格式化方法
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

const today = formatDate(new Date());
console.log(today); // 输出格式如：2026-01-02
```

## 5. 使用扩展方法创建可复用的函数

```javascript
// 方法五：创建可复用的日期格式化函数
Date.prototype.formatYYYYMMDD = function() {
  const year = this.getFullYear();
  const month = String(this.getMonth() + 1).padStart(2, '0');
  const day = String(this.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// 使用示例
const today = new Date().formatYYYYMMDD();
console.log(today); // 输出格式如：2026-01-02
```

## 6. 使用第三方库（如 moment.js 或 date-fns）

```javascript
// 使用 moment.js
const moment = require('moment');
console.log(moment().format('YYYY-MM-DD')); // 输出格式如：2026-01-02

// 使用 date-fns
const { format } = require('date-fns');
console.log(format(new Date(), 'yyyy-MM-dd')); // 输出格式如：2026-01-02
```

## 7. 处理时区问题

```javascript
// 方法六：处理时区问题，确保获取的是本地日期
function getTodayDateLocal() {
  const date = new Date();
  // 调整时区，确保获取的是本地日期而非UTC日期
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
}

console.log(getTodayDateLocal()); // 输出格式如：2026-01-02
```

## 推荐方案

对于大多数场景，推荐使用第一种方法（手动格式化），因为它：
- 不依赖外部库
- 代码清晰易懂
- 性能好
- 兼容性好

```javascript
function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 使用示例
const today = getTodayDate();
console.log(today); // 输出今天的日期，格式为 YYYY-MM-DD
```

注意：`padStart(2, '0')` 方法确保月份和日期始终是两位数格式，如果是个位数则在前面补0。
