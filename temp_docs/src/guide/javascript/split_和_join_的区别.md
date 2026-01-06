# split() 和 join()的区别？（必会）

**题目**: split() 和 join()的区别？（必会）

## 标准答案

`split()` 和 `join()` 是 JavaScript 中处理字符串和数组的两个相反操作方法：

1. **split()**：将字符串按指定分隔符分割成数组
   - 语法：`str.split(separator, limit)`
   - 返回：分割后的数组

2. **join()**：将数组元素按指定分隔符合并成字符串
   - 语法：`arr.join(separator)`
   - 返回：合并后的字符串

## 深入理解

### split() 方法详解

`split()` 方法使用指定的分隔符将字符串分割成子字符串，并将这些子字符串作为数组返回。

```javascript
// 基本用法
const str = "apple,banana,orange";
const arr = str.split(",");
console.log(arr); // ['apple', 'banana', 'orange']

// 按空格分割
const sentence = "Hello world JavaScript";
const words = sentence.split(" ");
console.log(words); // ['Hello', 'world', 'JavaScript']

// 按每个字符分割
const text = "hello";
const chars = text.split("");
console.log(chars); // ['h', 'e', 'l', 'l', 'o']

// 限制分割数量
const limited = str.split(",", 2);
console.log(limited); // ['apple', 'banana']

// 使用正则表达式作为分隔符
const mixed = "apple1banana2orange";
const result = mixed.split(/\d/); // 按数字分割
console.log(result); // ['apple', 'banana', 'orange']
```

### join() 方法详解

`join()` 方法将数组的所有元素连接成一个字符串，并返回这个字符串。元素之间用指定的分隔符连接。

```javascript
// 基本用法
const arr = ['apple', 'banana', 'orange'];
const str = arr.join(",");
console.log(str); // "apple,banana,orange"

// 默认分隔符是逗号
const defaultJoin = arr.join();
console.log(defaultJoin); // "apple,banana,orange"

// 使用空字符串连接
const noSeparator = arr.join("");
console.log(noSeparator); // "applebananaorange"

// 使用空格连接
const withSpace = arr.join(" ");
console.log(withSpace); // "apple banana orange"

// 处理非字符串元素
const mixedArr = [1, 2, 3, 'hello', null, undefined];
const mixedStr = mixedArr.join('-');
console.log(mixedStr); // "1-2-3-hello--" (null变成空字符串，undefined也变成空字符串)
```

### 详细对比

| 特性 | split() | join() |
|------|---------|---------|
| 操作对象 | 字符串 | 数组 |
| 返回类型 | 数组 | 字符串 |
| 主要功能 | 分割字符串 | 合并数组元素 |
| 语法 | `str.split(separator, limit)` | `arr.join(separator)` |
| 分隔符 | 用于分割 | 用于连接 |
| 默认分隔符 | 无默认分隔符 | 默认为逗号 |
| 原始数据 | 不变 | 不变 |

### 实际应用示例

```javascript
// 字符串转数组 - 处理CSV数据
const csvData = "name,age,city";
const headers = csvData.split(",");
console.log(headers); // ['name', 'age', 'city']

// 数组转字符串 - 生成URL参数
const params = ['name=Alice', 'age=30', 'city=Beijing'];
const queryString = params.join('&');
console.log(queryString); // "name=Alice&age=30&city=Beijing"

// 单词统计
const sentence = "JavaScript is awesome and JavaScript is fun";
const words = sentence.split(/\s+/); // 按空格分割
console.log(words.length); // 7

// 首字母大写
const title = "hello world javascript";
const capitalized = title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
console.log(capitalized); // "Hello World JavaScript"

// 反转字符串
const originalStr = "hello";
const reversedStr = originalStr.split('').reverse().join('');
console.log(reversedStr); // "olleh"
```

### 注意事项

1. `split()` 如果分隔符不存在，会返回包含原字符串的数组
2. `split("")` 会将字符串按每个字符分割
3. `join()` 会将数组中的 `undefined` 和 `null` 转换为空字符串
4. `join()` 不会跳过数组中的空元素，但会将 `undefined` 和 `null` 转为空字符串
5. 两个方法都不会修改原始数据，而是返回新值

## 总结

- `split()` 将字符串分割为数组，是字符串的方法
- `join()` 将数组元素连接为字符串，是数组的方法
- 它们是相反的操作，经常配合使用来处理数据
- `split()` 按分隔符分割，`join()` 按分隔符合并
- 两者都是非破坏性操作，不修改原数据
