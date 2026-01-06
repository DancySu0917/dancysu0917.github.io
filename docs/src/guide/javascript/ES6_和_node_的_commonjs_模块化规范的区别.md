# ES6 和 node 的 commonjs 模块化规范的区别（高薪常问）

**题目**: ES6 和 node 的 commonjs 模块化规范的区别（高薪常问）

## 标准答案

ES6 模块（ESM）和 CommonJS 模块（CJS）是两种不同的模块系统，主要区别包括：

1. **加载时机**：ES6 模块是静态的，编译时加载；CommonJS 是动态的，运行时加载
2. **输出方式**：ES6 模块输出的是值的引用；CommonJS 输出的是值的拷贝
3. **语法差异**：ES6 使用 import/export；CommonJS 使用 require/module.exports
4. **循环依赖处理**：ES6 模块通过动态引用处理；CommonJS 在运行时处理
5. **顶层作用域**：ES6 模块顶层 this 为 undefined；CommonJS 为 module 对象

## 深入理解

### 1. 加载时机差异

ES6 模块在编译时确定依赖关系，支持静态分析，可以在代码打包时进行优化（如 Tree Shaking）：

```javascript
// ES6 模块 - 静态加载
import { foo, bar } from './module.js';  // 在编译时确定依赖

// 这种导入方式不被支持
if (condition) {
    import { something } from './conditional-module.js';  // 语法错误
}
```

CommonJS 模块在运行时确定依赖关系，可以动态加载：

```javascript
// CommonJS - 运行时加载
const module = require('./module.js');  // 在运行时确定依赖

// 可以根据条件动态加载
if (condition) {
    const dynamicModule = require('./conditional-module.js');
}
```

### 2. 值的引用 vs 值的拷贝

**ES6 模块 - 值的引用（动态绑定）：**

```javascript
// lib.js
export let counter = 3;
export function increment() {
    counter++;
}

// main.js
import { counter, increment } from './lib.js';
console.log(counter);  // 3
increment();
console.log(counter);  // 4 - 值是动态绑定的
```

**CommonJS 模块 - 值的拷贝：**

```javascript
// lib.js
let counter = 3;
function increment() {
    counter++;
}
module.exports = {
    counter: counter,
    increment: increment
};

// main.js
const { counter, increment } = require('./lib.js');
console.log(counter);  // 3
increment();
console.log(counter);  // 3 - 值是拷贝，不会改变
```

### 3. 语法对比

**ES6 模块语法：**

```javascript
// 导出
export const name = 'module';
export function myFunction() {}
export default function() {}

// 导入
import { name, myFunction } from './module.js';
import defaultExport from './module.js';
import * as namespace from './module.js';
import { name as localName } from './module.js';
```

**CommonJS 模块语法：**

```javascript
// 导出
module.exports.name = 'module';
module.exports.myFunction = function() {};
exports.name = 'module';  // 语法糖

// 导入
const module = require('./module.js');
```

### 4. 循环依赖处理

**ES6 模块处理循环依赖：**

```javascript
// a.js
import { bar } from './b.js';
console.log('a.js', bar);  // b.js 还没执行完，可能输出 undefined 或者部分导出
export let foo = 'foo';

// b.js
import { foo } from './a.js';
console.log('b.js', foo);  // a.js 还没执行完，可能输出 undefined
export let bar = 'bar';
```

**CommonJS 处理循环依赖：**

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
const a = require('./a.js');  // 此时 a.js 只执行了一部分
console.log('in b, a.done = %j', a.done);
exports.done = true;
console.log('b done');

// main.js
console.log('main starting');
const a = require('./a.js');
const b = require('./b.js');
console.log('in main, a.done=%j, b.done=%j', a.done, b.done);
```

### 5. 性能和工具支持

**ES6 模块的优势：**
- 支持 Tree Shaking（移除未使用的代码）
- 支持静态分析，便于构建工具优化
- 支持代码分割和懒加载
- 更好的作用域隔离

**CommonJS 的优势：**
- 运行时灵活性更高
- Node.js 环境原生支持
- 错误处理更直观

### 6. 在 Node.js 中的使用

Node.js 同时支持两种模块系统：

```javascript
// package.json 中设置 type
{
  "type": "module"  // 启用 ES6 模块
}

// 或者使用 .mjs 扩展名
// file.mjs - ES6 模块
// file.cjs - CommonJS 模块
```

### 7. 实际应用场景

**ES6 模块适用于：**
- 现代前端项目
- 需要静态分析和优化的场景
- 与构建工具配合使用

**CommonJS 适用于：**
- 传统的 Node.js 项目
- 需要动态加载的场景
- 与旧版工具和库的兼容性
