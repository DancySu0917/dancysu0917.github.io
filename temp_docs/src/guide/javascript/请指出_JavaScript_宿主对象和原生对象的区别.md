# 请指出 JavaScript 宿主对象和原生对象的区别？（必会）

**题目**: 请指出 JavaScript 宿主对象和原生对象的区别？（必会）

## 答案

JavaScript中的对象可以分为两类：原生对象（Native Objects）和宿主对象（Host Objects）。它们有以下区别：

### 原生对象（Native Objects）

原生对象是由ECMAScript规范定义的对象，与宿主环境无关，在任何JavaScript实现中都存在。

#### 特点：
- 由ECMAScript规范定义
- 与宿主环境无关
- 在所有JavaScript引擎中都有相同的行为
- 可以在任何JavaScript环境中使用

#### 常见的原生对象包括：
- **基本包装类型**: Boolean, Number, String, Symbol
- **核心对象**: Object, Function, Array, RegExp, Date, Error, Map, Set, WeakMap, WeakSet
- **数学对象**: Math
- **JSON对象**: JSON
- **全局对象**: Global, Window(在浏览器中)

#### 示例：
```javascript
// 原生对象示例
const arr = new Array();  // Array是原生对象
const obj = new Object(); // Object是原生对象
const date = new Date();  // Date是原生对象
const regex = new RegExp(); // RegExp是原生对象
```

### 宿主对象（Host Objects）

宿主对象是由JavaScript运行环境（如浏览器或Node.js）提供的对象，用于与环境交互。

#### 特点：
- 由宿主环境提供
- 依赖于特定的运行环境
- 行为可能因环境而异
- 用于与宿主环境交互

#### 常见的宿主对象包括：

**在浏览器环境中：**
- **DOM对象**: document, Element, HTMLElement, Event, NodeList等
- **BOM对象**: window, location, history, navigator, screen等
- **API对象**: XMLHttpRequest, fetch, localStorage, sessionStorage等
- **Canvas对象**: Canvas, CanvasRenderingContext2D等

**在Node.js环境中：**
- **核心模块对象**: require, module, exports, process, Buffer等
- **全局对象**: global, __dirname, __filename等
- **内置模块**: fs, http, path, os等

#### 示例：
```javascript
// 浏览器环境中的宿主对象示例
console.log(window.location); // window是宿主对象
console.log(document.getElementById('myId')); // document是宿主对象
const xhr = new XMLHttpRequest(); // XMLHttpRequest是宿主对象

// Node.js环境中的宿主对象示例
console.log(process.env); // process是宿主对象
const fs = require('fs'); // require是宿主对象提供的功能
```

### 主要区别总结

| 特性 | 原生对象 | 宿主对象 |
|------|----------|----------|
| 定义来源 | ECMAScript规范 | 宿主环境 |
| 环境依赖 | 与环境无关 | 依赖特定环境 |
| 兼容性 | 跨环境一致 | 因环境而异 |
| 用途 | 提供核心语言功能 | 与宿主环境交互 |
| 实现 | JavaScript引擎内置 | 宿主环境实现 |

### 注意事项

1. **全局对象**：window（浏览器）或global（Node.js）既是原生对象又是宿主对象，因为它既是JavaScript的全局对象，也由宿主环境提供。

2. **宿主对象的限制**：宿主对象可能不遵循某些ECMAScript规范，例如：
   - 某些宿主对象的`typeof`结果可能不是规范中定义的
   - 宿主对象可能无法被`Object.prototype.toString`正确识别

3. **环境差异**：同一个对象在不同环境中的实现可能不同，如DOM API在不同浏览器中的实现可能有细微差异。

理解原生对象和宿主对象的区别有助于编写跨环境兼容的代码，并正确理解JavaScript的运行机制。
