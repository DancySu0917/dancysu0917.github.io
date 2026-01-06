# 截取字符串 abcdefg 的 efg？（必会）

**题目**: 截取字符串 abcdefg 的 efg？（必会）

## 标准答案

要从字符串 "abcdefg" 中截取 "efg"，可以使用以下几种方法：

1. **slice(start, end)**: `str.slice(4, 7)` - 从索引4开始到索引7（不包含）
2. **substring(start, end)**: `str.substring(4, 7)` - 从索引4开始到索引7（不包含）
3. **substr(start, length)**: `str.substr(4, 3)` - 从索引4开始，截取长度为3的子串
4. **正则表达式**: `str.match(/efg/)[0]` - 使用正则匹配

最常用和推荐的方法是 `slice()`，因为它在处理负数索引时更直观，且性能较好。

## 深入分析

### 1. JavaScript 字符串截取方法对比

JavaScript 提供了多种字符串截取方法，各有特点：

- **slice(start, end)**: 支持负数索引，从字符串的开始位置计算，如果参数为负数，则从字符串末尾开始计算
- **substring(start, end)**: 不支持负数索引，会将负数参数视为0
- **substr(start, length)**: 第二个参数是长度而非结束位置，已不推荐使用

### 2. 索引位置分析

在字符串 "abcdefg" 中：
- a: 索引 0
- b: 索引 1
- c: 索引 2
- d: 索引 3
- e: 索引 4 (开始位置)
- f: 索引 5
- g: 索引 6 (结束位置，包含)
- 总长度: 7

要截取 "efg"，起始位置是4，结束位置是7（不包含），或者指定长度为3。

### 3. 性能和兼容性

所有三种方法的性能差异很小，在现代浏览器中基本可以忽略。兼容性方面，这三种方法在所有浏览器中都有很好的支持。

## 代码示例

### 1. 基本截取方法对比

```javascript
const str = "abcdefg";

// 方法1: 使用 slice()
console.log(str.slice(4, 7));    // "efg"
console.log(str.slice(-3));      // "efg" (从倒数第3个开始到结尾)

// 方法2: 使用 substring()
console.log(str.substring(4, 7)); // "efg"
console.log(str.substring(4));    // "efg" (从索引4到结尾)

// 方法3: 使用 substr()
console.log(str.substr(4, 3));    // "efg" (从索引4开始，取3个字符)
```

### 2. 处理不同参数的示例

```javascript
const str = "abcdefg";

// slice() 方法处理负数索引
console.log(str.slice(-3, -1));   // "ef" (从倒数第3个到倒数第1个，不包含)
console.log(str.slice(2, -1));    // "cdef" (从索引2到倒数第1个，不包含)
console.log(str.slice(-5, 6));    // "cdef" (从倒数第5个到索引6，不包含)

// substring() 方法处理负数索引（会转换为0）
console.log(str.substring(-3, 7)); // "abcdefg" (等同于 substring(0, 7))
console.log(str.substring(7, 4));  // "efg" (参数会被交换，变成 substring(4, 7))

// substr() 方法（已废弃，但仍可用）
console.log(str.substr(-3, 3));    // "efg" (从倒数第3个开始，取3个字符)
```

### 3. 实用的字符串截取函数

```javascript
// 通用的字符串截取函数
function extractSubstring(str, target) {
  const index = str.indexOf(target);
  if (index !== -1) {
    return str.substring(index, index + target.length);
  }
  return null;
}

// 从右侧开始查找并截取
function extractFromRight(str, target) {
  const index = str.lastIndexOf(target);
  if (index !== -1) {
    return str.substring(index, index + target.length);
  }
  return null;
}

// 截取指定长度的字符串（带省略号）
function truncateString(str, maxLength, suffix = '...') {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - suffix.length) + suffix;
}

// 测试示例
const testStr = "abcdefg";
console.log(extractSubstring(testStr, "efg")); // "efg"
console.log(truncateString("Hello world!", 8)); // "Hello..."
```

### 4. 高级字符串操作

```javascript
// 根据多个条件截取字符串
function advancedExtract(str, options = {}) {
  const {
    startAfter = null,      // 在指定字符串之后开始
    endBefore = null,       // 在指定字符串之前结束
    startIndex = 0,         // 起始索引
    endIndex = str.length,  // 结束索引
    length = null           // 指定长度
  } = options;

  let start = startIndex;
  let end = endIndex;

  if (startAfter) {
    const pos = str.indexOf(startAfter);
    if (pos !== -1) {
      start = pos + startAfter.length;
    }
  }

  if (endBefore) {
    const pos = str.indexOf(endBefore, start);
    if (pos !== -1) {
      end = pos;
    }
  }

  if (length !== null) {
    end = start + length;
  }

  return str.slice(start, end);
}

// 使用示例
const complexStr = "prefix_abcdefg_suffix";
console.log(advancedExtract(complexStr, {
  startAfter: "prefix_",
  endBefore: "_suffix"
})); // "abcdefg"

console.log(advancedExtract("abcdefg", {
  startIndex: 4,
  length: 3
})); // "efg"
```

### 5. 实际应用中的字符串截取

```javascript
// URL 参数提取
function getParameterByName(url, name) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get(name);
}

// 提取文件扩展名
function getFileExtension(filename) {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : filename.slice(lastDotIndex + 1);
}

// 提取文件名（不含扩展名）
function getFileNameWithoutExtension(filename) {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? filename : filename.slice(0, lastDotIndex);
}

// 字符串掩码（如手机号、邮箱等）
function maskString(str, start, end, mask = '*') {
  if (str.length <= start + end) {
    return mask.repeat(str.length);
  }
  return str.slice(0, start) + mask.repeat(str.length - start - end) + str.slice(-end);
}

// 测试示例
console.log(getFileExtension("example.txt")); // "txt"
console.log(getFileNameWithoutExtension("example.txt")); // "example"
console.log(maskString("13812345678", 3, 4)); // "138****5678"
console.log(maskString("example@email.com", 2, 2)); // "ex****@em****.com"
```

## 实际应用场景

### 1. 数据处理
- 截取特定格式的字符串部分，如日期、ID、编码等
- 处理API返回的数据，提取需要的部分
- 解析URL或文件路径

### 2. 用户界面
- 文本截断显示，避免内容过长影响界面
- 显示用户名、邮箱的部分内容，保护隐私
- 格式化显示数字、电话号码等

### 3. 表单验证
- 验证输入格式，如手机号前缀、邮箱域名等
- 提取输入中的特定部分进行校验

### 4. 日志处理
- 提取日志中的关键信息
- 格式化日志输出

## 最佳实践

1. **优先使用 slice()**: 它支持负数索引，行为更可预测
2. **避免使用 substr()**: 已被废弃，虽然仍受支持但不推荐使用
3. **注意边界情况**: 确保索引不会超出字符串长度
4. **性能考虑**: 对于大量字符串操作，考虑缓存结果
5. **错误处理**: 检查字符串是否存在和有效
