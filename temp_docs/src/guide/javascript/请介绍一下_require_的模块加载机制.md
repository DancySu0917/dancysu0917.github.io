# 请介绍一下 require 的模块加载机制？（高薪常问）

**题目**: 请介绍一下 require 的模块加载机制？（高薪常问）

**答案**:

`require` 是 Node.js 中模块加载的核心机制，基于 CommonJS 规范实现。它的加载机制包括模块解析、缓存、编译和执行等多个步骤。

## 1. require 函数的基本概念

`require` 是一个全局函数，用于同步加载模块。它接收一个模块标识符（module identifier）作为参数，返回该模块的导出对象。

```javascript
// 加载内置模块
const fs = require('fs');
const path = require('path');

// 加载第三方模块
const express = require('express');

// 加载自定义模块
const myModule = require('./myModule');
```

## 2. 模块标识符的类型

### 内置模块
- Node.js 内置的核心模块，如 `fs`、`http`、`path` 等
- 直接通过模块名加载，无需路径

### 相对路径模块
- 以 `./` 或 `../` 开头的路径
- 相对于当前文件的路径

### 绝对路径模块
- 以 `/` 开头的路径
- 从文件系统根目录开始的绝对路径

### node_modules 模块
- 不以路径开头的模块名
- 会在当前目录及上级目录的 node_modules 中查找

## 3. 模块加载流程

### 步骤 1: 模块解析
```javascript
// require('./myModule') 的解析过程
// 1. 检查是否为内置模块
// 2. 解析为绝对路径
// 3. 尝试添加文件扩展名（.js, .json, .node）
// 4. 如果是目录，查找 package.json 的 main 字段或 index.js
```

### 步骤 2: 模块缓存检查
Node.js 会缓存已加载的模块，避免重复加载：

```javascript
// Node.js 内部的模块缓存
console.log(require.cache);

// 清除模块缓存（不推荐在生产环境使用）
delete require.cache[require.resolve('./myModule')];
```

### 步骤 3: 模块编译
根据文件扩展名选择不同的编译方式：
- `.js`：作为 JavaScript 脚本执行
- `.json`：使用 `JSON.parse()` 解析
- `.node`：作为已编译的 C++ 插件加载

## 4. 模块包装器

Node.js 会将模块代码包装在一个函数中：

```javascript
// 实际执行的包装函数
(function(exports, require, module, __filename, __dirname) {
    // 模块代码在这里
    const fs = require('fs');
    
    function myFunction() {
        // ...
    }
    
    module.exports = myFunction;
});
```

这解释了为什么模块内部可以使用 `require`、`module`、`exports`、`__filename`、`__dirname` 等变量。

## 5. 详细的加载机制

### 源码示例
```javascript
// Node.js 内部模块加载的部分实现原理
function Module(id = '', parent) {
    this.id = id;
    this.path = path.dirname(id);
    this.exports = {};
    module.parent = parent;
    this.filename = null;
    this.loaded = false;
    this.children = [];
}

Module._extensions = {
    '.js'(module, filename) {
        const content = fs.readFileSync(filename, 'utf8');
        module._compile(stripBOM(content), filename);
    },
    '.json'(module, filename) {
        const content = fs.readFileSync(filename, 'utf8');
        try {
            module.exports = JSON.parse(stripBOM(content));
        } catch (err) {
            err.message = filename + ': ' + err.message;
            throw err;
        }
    },
    '.node'(module, filename) {
        return process.dlopen(module, path.toNamespacedPath(filename));
    }
};

Module.prototype.load = function(filename) {
    const extension = path.extname(filename) || '.js';
    Module._extensions[extension](this, filename);
    this.loaded = true;
};
```

## 6. 模块查找算法

### 相对/绝对路径模块查找
```javascript
// require('./some-module')
// 1. 尝试加载 ./some-module.js
// 2. 尝试加载 ./some-module.json
// 3. 尝试加载 ./some-module.node
// 4. 尝试加载 ./some-module/package.json (main 字段)
// 5. 尝试加载 ./some-module/index.js
```

### node_modules 查找
```javascript
// require('some-module')
// 从当前目录开始，沿路径向上查找 node_modules
// /home/user/project/subdir/one/two/module.js
// 查找路径:
// 1. /home/user/project/subdir/one/two/node_modules/
// 2. /home/user/project/subdir/one/node_modules/
// 3. /home/user/project/subdir/node_modules/
// 4. /home/user/project/node_modules/
// 5. /home/user/node_modules/
// 6. /node_modules/
```

## 7. 模块缓存机制

```javascript
// 模块缓存示例
console.log('Module A loaded'); // 这行只会输出一次

module.exports = {
    value: Math.random()
};

// 在其他文件中多次 require
const a1 = require('./moduleA'); // 输出 "Module A loaded"
const a2 = require('./moduleA'); // 不会再次输出
const a3 = require('./moduleA'); // 不会再次输出

console.log(a1 === a2); // true，同一个对象
console.log(a1.value === a2.value); // true，值相同
```

## 8. 循环依赖处理

```javascript
// a.js
console.log('a starting');
exports.done = false;
const b = require('./b.js');
console.log('in a, b.done = %j', b.done);
exports.done = true;
console.log('a done');

// b.js
console.log('b starting');
exports.done = false;
const a = require('./a.js'); // 循环依赖
console.log('in b, a.done = %j', a.done);
exports.done = true;
console.log('b done');

// main.js
console.log('main starting');
const a = require('./a.js');
const b = require('./b.js');
console.log('in main, a.done=%j, b.done=%j', a.done, b.done);

// 输出结果:
// main starting
// a starting
// b starting
// in b, a.done = false  // a 模块尚未完成执行
// b done
// in a, b.done = true
// a done
// in main, a.done=true, b.done=true
```

## 9. 模块导出方式

### module.exports
```javascript
// math.js
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

module.exports = {
    add,
    subtract
};

// 或者逐个导出
module.exports.add = add;
module.exports.subtract = subtract;
```

### exports 简化写法
```javascript
// 注意：不能重新赋值 exports，否则会断开与 module.exports 的连接
exports.add = function(a, b) {
    return a + b;
};

exports.subtract = function(a, b) {
    return a - b;
};

// 错误用法
// exports = { add, subtract }; // 这样会断开连接
```

## 10. 性能优化和最佳实践

### 避免运行时 require
```javascript
// 不推荐：运行时动态加载
function loadModule(moduleName) {
    const module = require(moduleName); // 性能较差
    return module;
}

// 推荐：在模块顶层加载
const fs = require('fs');
const path = require('path');
```

### 模块懒加载
```javascript
// 对于大型模块，可以使用懒加载
let heavyModule = null;

function getHeavyModule() {
    if (!heavyModule) {
        heavyModule = require('heavy-module');
    }
    return heavyModule;
}
```

## 11. 与 ES6 模块的区别

| 特性 | CommonJS (require) | ES6 Modules (import/export) |
|------|-------------------|----------------------------|
| 加载方式 | 运行时加载 | 编译时加载 |
| 导入方式 | 同步加载 | 静态分析 |
| 循环依赖 | 支持，返回部分结果 | 编译时检测 |
| 导出值 | 值的拷贝 | 值的引用 |
| 顶层作用域 | 函数作用域 | 模块作用域 |

## 总结

`require` 的模块加载机制是 Node.js 的核心特性之一，理解其工作原理对于 Node.js 开发至关重要：

1. **模块解析**：根据路径规则解析模块路径
2. **缓存机制**：避免重复加载，提高性能
3. **编译执行**：将模块代码包装在函数中执行
4. **循环依赖处理**：返回部分加载的模块
5. **模块导出**：通过 module.exports 导出模块内容

掌握这些机制有助于编写更高效、可维护的 Node.js 应用程序。
