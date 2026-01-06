# module、export、import 有什么作用（必会）

**题目**: module、export、import 有什么作用（必会）

## 标准答案

`module`、`export`、`import` 是 ES6 模块系统的核心语法，用于实现 JavaScript 代码的模块化：

1. **module**：将代码分割成独立的功能模块，实现代码的封装和复用
2. **export**：用于导出模块中的变量、函数、类等，供其他模块使用
3. **import**：用于导入其他模块导出的内容，实现模块间的依赖关系
4. **作用**：解决命名冲突、实现代码复用、提升代码可维护性

## 深入理解

### export 导出语法

```javascript
// math.js - 导出模块

// 1. 默认导出（一个模块只能有一个默认导出）
export default function add(a, b) {
    return a + b;
}

// 也可以先定义再导出
const PI = 3.14159;
export { PI };

// 2. 命名导出（可以有多个命名导出）
export function subtract(a, b) {
    return a - b;
}

export const multiply = (a, b) => a * b;

// 3. 批量导出
const name = 'Math Module';
const version = '1.0.0';
export { name, version };

// 4. 重命名导出
function divide(a, b) {
    return b !== 0 ? a / b : NaN;
}
export { divide as division };

// 5. 条件导出
const isNode = typeof window === 'undefined';
if (isNode) {
    export const platform = 'Node.js';
} else {
    export const platform = 'Browser';
}
// 注意：条件导出在实际中需要使用顶层导出
export const platform = typeof window === 'undefined' ? 'Node.js' : 'Browser';
```

### import 导入语法

```javascript
// main.js - 导入模块

// 1. 导入默认导出
import add from './math.js';

// 2. 导入命名导出
import { subtract, multiply } from './math.js';

// 3. 导入默认和命名导出
import add, { subtract, multiply } from './math.js';

// 4. 重命名导入
import { divide as division } from './math.js';

// 5. 导入所有内容
import * as math from './math.js';

// 6. 混合导入
import add, { subtract as sub, multiply as mul, name as moduleName } from './math.js';

// 7. 只执行模块副作用，不导入任何内容
import './sideEffect.js';

// 8. 动态导入（ES2020）
async function loadModule() {
    const { subtract } = await import('./math.js');
    return subtract(10, 5);
}
```

### 模块的执行和作用域

```javascript
// counter.js
let count = 0;

export function increment() {
    count++;
    return count;
}

export function decrement() {
    count--;
    return count;
}

export function getCount() {
    return count;
}

// 模块级别的作用域，外部无法直接访问 count 变量
// 只能通过导出的函数来操作 count

// main.js
import { increment, decrement, getCount } from './counter.js';

console.log(getCount()); // 0
increment();
increment();
console.log(getCount()); // 2
decrement();
console.log(getCount()); // 1
```

### 模块的循环依赖处理

```javascript
// a.js
import { getValueB } from './b.js';

export const valueA = 'A';
export function getValueA() {
    return valueA;
}

// 在模块初始化时，b.js 可能还没有完全初始化
export function useValueB() {
    return getValueB();
}

// b.js
import { getValueA, valueA } from './a.js';

export const valueB = 'B';
export function getValueB() {
    return valueB;
}

export function useValueA() {
    // 此时 valueA 已经可用，但需要确保 a.js 已初始化
    return valueA;
}
```

### 重新导出（Re-exporting）

```javascript
// utils.js
export { add, subtract } from './math.js'; // 重新导出
export { default as defaultMath } from './math.js'; // 重新导出默认导出

// 重命名重新导出
export { multiply as calcMultiply } from './math.js';

// 全部重新导出
export * from './math.js'; // 不包括默认导出
export * as math from './math.js'; // 语法不支持，但可以使用其他方式
```

### 模块的静态分析特性

ES6 模块在编译时就能确定依赖关系，这使得：

1. **Tree Shaking**：只打包使用的代码
2. **静态分析**：工具可以分析模块依赖关系
3. **提前错误检测**：在运行前就能发现模块错误

```javascript
// 可以在编译时确定导入导出关系
import { unusedFunction } from './utils.js'; // 如果未使用，可被 tree-shaking 移除
import { usedFunction } from './utils.js';

usedFunction(); // 只保留使用的函数
```

### 与 CommonJS 的区别

```javascript
// CommonJS (Node.js)
// 导出
module.exports = { add, subtract };
// 或
exports.add = add;

// 导入
const { add, subtract } = require('./math');

// ES6 Module
// 导出
export { add, subtract };
// 或
export default add;

// 导入
import { add, subtract } from './math';
```

主要区别：
- ES6 模块是静态的（编译时确定），CommonJS 是动态的（运行时确定）
- ES6 模块是值的引用，CommonJS 是值的拷贝
- ES6 模块支持循环依赖，处理方式更优雅
- ES6 模块可以实现 Tree Shaking

### 实际应用场景

```javascript
// api.js - API 模块
const API_BASE_URL = 'https://api.example.com';

export async function fetchData(endpoint) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    return response.json();
}

export async function postData(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
}

// auth.js - 认证模块
let token = null;

export function setToken(newToken) {
    token = newToken;
}

export function getToken() {
    return token;
}

export function isAuthenticated() {
    return !!token;
}

// main.js - 主模块
import { fetchData, postData } from './api.js';
import { setToken, isAuthenticated } from './auth.js';

// 使用模块功能
if (isAuthenticated()) {
    fetchData('users/123').then(user => console.log(user));
}
```
