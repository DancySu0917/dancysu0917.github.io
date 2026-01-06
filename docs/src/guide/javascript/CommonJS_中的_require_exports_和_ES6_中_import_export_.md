# CommonJS 中的 require/exports 和 ES6 中 import/export 的区别是什么？（必会）

**题目**: CommonJS 中的 require/exports 和 ES6 中 import/export 的区别是什么？（必会）

## 答案

CommonJS 的 `require/exports` 和 ES6 的 `import/export` 是两种不同的模块系统，它们有以下主要区别：

### 1. 加载方式

**CommonJS (动态加载)**:
```javascript
// 动态加载，可以在条件语句中使用
if (condition) {
  const module = require('./module');
}
```

**ES6 (静态加载)**:
```javascript
// 静态加载，在编译时确定依赖关系
import { method } from './module'; // 必须在顶层
```

### 2. 输出值的时机

**CommonJS**:
```javascript
// 输出的是值的拷贝，模块加载时执行
const obj = { value: 1 };
module.exports = obj;

// 在其他文件中
const importedObj = require('./module');
obj.value = 2;
console.log(importedObj.value); // 仍然是 1，因为是拷贝
```

**ES6**:
```javascript
// 输出的是值的引用，实时绑定
export let value = 1;

// 在其他文件中
import { value } from './module';
console.log(value); // 1
value = 2; // 这个会报错，因为是只读引用
```

### 3. 循环依赖处理

**CommonJS**:
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
const a = require('./a.js');
const b = require('./b.js');
console.log('in main, a.done=%j, b.done=%j', a.done, b.done);

// 输出：
// a starting
// b starting
// in b, a.done = false  // a模块未执行完
// b done
// in a, b.done = true
// a done
// in main, a.done=true, b.done=true
```

**ES6**:
```javascript
// a.js
import { bValue } from './b.js';
export const aValue = 'a';

// b.js
import { aValue } from './a.js';
export const bValue = 'b';

// ES6 在编译时建立依赖关系，运行时执行，循环依赖处理更清晰
```

### 4. 语法差异

**CommonJS**:
```javascript
// 导出
module.exports = {
  method1: function() {},
  method2: function() {}
};

// 或者
exports.method = function() {};

// 导入
const module = require('./module');
const specificMethod = require('./module').method;
```

**ES6**:
```javascript
// 导出
export const value = 1;
export function method() {}
export default function() {}

// 导入
import { value, method } from './module';
import defaultValue from './module';
import * as module from './module';
import { value as alias } from './module';
```

### 5. 加载时机

**CommonJS**:
- 运行时加载
- 同步加载
- 每次都执行整个模块

**ES6**:
- 编译时确定依赖
- 运行时加载
- 支持 tree-shaking（摇树优化）

### 6. 使用场景

**CommonJS**:
- 主要用于 Node.js 环境
- 适合服务端模块加载

**ES6**:
- 浏览器和 Node.js 都支持
- 更适合现代前端开发
- 支持更好的代码分割和懒加载

### 7. 性能差异

**CommonJS**:
- 每次 require 都会执行模块
- 有缓存机制，但首次加载较慢

**ES6**:
- 静态分析，支持更好的优化
- tree-shaking 可以减少打包体积

### 8. 兼容性

**CommonJS**:
- Node.js 原生支持
- 需要构建工具在浏览器中使用

**ES6**:
- 现代浏览器支持
- Node.js 12+ 原生支持
- 需要构建工具处理兼容性

### 实际应用示例

```javascript
// CommonJS 示例
// utils.js
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

// main.js
const { add, subtract } = require('./utils');
console.log(add(2, 3)); // 5

// ES6 示例
// utils.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// main.js
import { add, subtract } from './utils';
console.log(add(2, 3)); // 5

// 或者使用动态导入 (ES2020)
async function loadModule() {
  const { add } = await import('./utils');
  return add(2, 3);
}
```

总结：CommonJS 和 ES6 模块系统各有优势，CommonJS 适合 Node.js 环境，ES6 模块更现代且支持更好的优化，现代项目通常使用 ES6 模块配合构建工具。
