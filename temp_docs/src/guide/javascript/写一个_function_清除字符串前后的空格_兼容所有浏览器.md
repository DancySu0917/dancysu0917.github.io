# 写一个 function，清除字符串前后的空格。（兼容所有浏览器）？（必会）

**题目**: 写一个 function，清除字符串前后的空格。（兼容所有浏览器）？（必会）

**答案**:

在不同浏览器中，清除字符串前后空格的兼容性处理方法如下：

```javascript
// 方法1：兼容性最好的方法
function trim(str) {
  if (str == null) {
    return '';
  }
  // 使用正则表达式替换前后空格
  return str.toString().replace(/^\s+|\s+$/g, '');
}

// 方法2：现代浏览器优化，兼容旧浏览器
function trim(str) {
  if (str == null) {
    return '';
  }
  // 优先使用原生trim方法（现代浏览器支持）
  if (String.prototype.trim) {
    return str.toString().trim();
  }
  // 降级到正则表达式方法（兼容旧浏览器）
  else {
    return str.toString().replace(/^\s+|\s+$/g, '');
  }
}

// 方法3：更完整的兼容性处理
function trim(str) {
  if (str == null) {
    return '';
  }
  // 处理各种空白字符，包括空格、制表符、换行符等
  if (String.prototype.trim) {
    return str.toString().trim();
  } else {
    // \s 匹配所有空白字符（包括空格、制表符、换页符等）
    return str.toString().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  }
}

// 使用示例
var str = "  hello world  ";
console.log(trim(str)); // 输出 "hello world"

// 测试各种边界情况
console.log(trim(""));        // ""
console.log(trim(null));      // ""
console.log(trim(undefined)); // ""
console.log(trim("   "));     // ""
console.log(trim("\t\n a \r ")); // "a"
```

**方法说明**：
1. **原生方法**：现代浏览器（IE9+）支持 String.prototype.trim()，直接使用性能最好
2. **正则表达式方法**：兼容所有浏览器，包括IE6-8
   - `^\s+` 匹配字符串开头的空白字符
   - `\s+$` 匹配字符串结尾的空白字符
   - `g` 标志表示全局匹配
3. **增强兼容性**：处理特殊空白字符如零宽空格(\uFEFF)和非断空格(\xA0)

**兼容性考虑**：
- IE6-8 不支持原生 trim() 方法
- 需要处理各种类型的空白字符
- 考虑 null 和 undefined 的边界情况
- 确保传入参数是字符串类型
