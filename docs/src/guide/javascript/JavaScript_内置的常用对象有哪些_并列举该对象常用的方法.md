# JavaScript 内置的常用对象有哪些？并列举该对象常用的方法？（必会）

**题目**: JavaScript 内置的常用对象有哪些？并列举该对象常用的方法？（必会）

## 答案

JavaScript提供了许多内置对象，这些对象为开发者提供了丰富的功能。以下是JavaScript中常用的内置对象及其常用方法：

### 1. Object对象
JavaScript中所有对象的基类，用于操作对象。

**常用方法：**
- `Object.keys(obj)` - 返回对象自身可枚举属性的数组
- `Object.values(obj)` - 返回对象自身可枚举属性值的数组
- `Object.entries(obj)` - 返回对象自身可枚举属性键值对的数组
- `Object.assign(target, ...sources)` - 对象合并
- `Object.create(prototype)` - 创建一个新对象，使用现有对象作为新对象的原型

### 2. Array对象
用于处理数组数据结构。

**常用方法：**
- `push(element)` - 在数组末尾添加元素
- `pop()` - 删除并返回数组最后一个元素
- `shift()` - 删除并返回数组第一个元素
- `unshift(element)` - 在数组开头添加元素
- `slice(start, end)` - 返回数组的一部分
- `splice(start, deleteCount, item...)` - 删除或替换数组元素
- `map(callback)` - 创建新数组，对每个元素执行函数
- `filter(callback)` - 过滤数组元素
- `forEach(callback)` - 遍历数组元素
- `reduce(callback)` - 将数组元素归约为单个值
- `find(callback)` - 查找满足条件的第一个元素
- `includes(element)` - 检查数组是否包含指定元素

### 3. String对象
用于处理字符串。

**常用方法：**
- `charAt(index)` - 返回指定位置的字符
- `indexOf(searchValue)` - 返回子字符串首次出现的位置
- `substring(start, end)` - 返回字符串的一部分
- `slice(start, end)` - 提取字符串的一部分
- `split(separator)` - 将字符串分割成数组
- `replace(searchValue, newValue)` - 替换字符串中的子串
- `toUpperCase()` - 转换为大写
- `toLowerCase()` - 转换为小写
- `trim()` - 去除首尾空白字符
- `concat(str)` - 连接字符串
- `startsWith(searchString)` - 检查字符串是否以指定字符串开头
- `endsWith(searchString)` - 检查字符串是否以指定字符串结尾

### 4. Number对象
用于处理数字。

**常用方法：**
- `toFixed(digits)` - 格式化数字为指定小数位数的字符串
- `parseInt(string)` - 将字符串解析为整数
- `parseFloat(string)` - 将字符串解析为浮点数
- `isNaN(value)` - 检查值是否为NaN
- `isFinite(value)` - 检查值是否为有限数

### 5. Math对象
提供数学计算功能。

**常用方法：**
- `Math.max(...values)` - 返回最大值
- `Math.min(...values)` - 返回最小值
- `Math.random()` - 生成0-1之间的随机数
- `Math.round(number)` - 四舍五入
- `Math.floor(number)` - 向下取整
- `Math.ceil(number)` - 向上取整
- `Math.pow(base, exponent)` - 幂运算
- `Math.sqrt(number)` - 平方根

### 6. Date对象
用于处理日期和时间。

**常用方法：**
- `getFullYear()` - 获取年份
- `getMonth()` - 获取月份（0-11）
- `getDate()` - 获取日期（1-31）
- `getDay()` - 获取星期几（0-6）
- `getHours()` - 获取小时（0-23）
- `getMinutes()` - 获取分钟（0-59）
- `getSeconds()` - 获取秒数（0-59）
- `getTime()` - 获取时间戳
- `setFullYear(year)` - 设置年份
- `toISOString()` - 返回ISO格式的日期字符串

### 7. RegExp对象
用于处理正则表达式。

**常用方法：**
- `test(string)` - 测试字符串是否匹配正则表达式
- `exec(string)` - 执行正则表达式并返回匹配结果

### 8. Boolean对象
用于处理布尔值。

**常用方法：**
- `Boolean(value)` - 将值转换为布尔类型

### 9. Function对象
JavaScript中所有函数都是Function对象的实例。

**常用方法：**
- `call(thisArg, ...args)` - 调用函数并设置this值
- `apply(thisArg, argsArray)` - 调用函数并设置this值
- `bind(thisArg, ...args)` - 创建新函数并绑定this值

### 10. JSON对象
用于处理JSON数据。

**常用方法：**
- `JSON.parse(text)` - 将JSON字符串解析为JavaScript对象
- `JSON.stringify(value)` - 将JavaScript值转换为JSON字符串

这些内置对象是JavaScript编程的核心组成部分，熟练掌握它们的方法对于前端开发至关重要。
