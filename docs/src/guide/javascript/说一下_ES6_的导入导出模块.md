# 说一下 ES6 的导入导出模块（高薪常问）

**题目**: 说一下 ES6 的导入导出模块（高薪常问）
### 标准答案

ES6模块系统提供了静态导入导出功能，主要包括 `export` 和 `import` 两种语法。`export` 用于导出模块中的变量、函数或类，`import` 用于从其他模块导入需要的内容。ES6模块支持默认导出（default export）和命名导出（named export），具有编译时确定依赖、支持循环引用等优势。

### 深入理解

ES6模块系统是JavaScript官方的模块标准，它与CommonJS、AMD等模块系统有本质区别。ES6模块采用静态分析，在编译阶段就能确定模块的依赖关系，这使得代码优化和Tree Shaking成为可能。

**命名导出（Named Export）：**
```javascript
// mathUtils.js - 多种命名导出方式
// 方式1：直接在声明前导出
export const PI = 3.14159;
export function add(a, b) {
    return a + b;
}
export class Calculator {
    multiply(a, b) {
        return a * b;
    }
}

// 方式2：统一导出（在文件末尾）
const MAX_VALUE = 100;
function subtract(a, b) {
    return a - b;
}
export { MAX_VALUE, subtract };

// 方式3：导出时重命名
function divide(a, b) {
    return a / b;
}
export { divide as divideNumbers };
```

**命名导入（Named Import）：**
```javascript
// main.js
import { add, PI, Calculator } from './mathUtils.js';

console.log(add(2, 3)); // 5
console.log(PI); // 3.14159
const calc = new Calculator();
console.log(calc.multiply(4, 5)); // 20

// 导入时重命名
import { divideNumbers as divide } from './mathUtils.js';
console.log(divide(10, 2)); // 5

// 导入所有命名导出
import * as math from './mathUtils.js';
console.log(math.add(1, 2)); // 3
console.log(math.PI); // 3.14159
```

**默认导出（Default Export）：**
```javascript
// user.js
// 每个模块只能有一个默认导出
export default class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
    
    getInfo() {
        return `${this.name} (${this.email})`;
    }
}

// 或者先声明再导出
const defaultUser = {
    name: 'Anonymous',
    email: 'anonymous@example.com'
};
export default defaultUser;

// 或者导出函数
export default function greet(name) {
    return `Hello, ${name}!`;
}
```

**默认导入：**
```javascript
// main.js
import User from './user.js'; // 导入默认导出，名称可自定义
const user = new User('John', 'john@example.com');
console.log(user.getInfo());

// 同时导入默认导出和命名导出
import User, { MAX_VALUE, subtract } from './mathUtils.js';

// 混合导入
import defaultExport, { namedExport1, namedExport2 } from './module.js';
```

**动态导入（Dynamic Import）：**
```javascript
// ES2020引入的动态导入，返回Promise
async function loadModule() {
    const { add, PI } = await import('./mathUtils.js');
    console.log(add(1, 2)); // 3
    console.log(PI); // 3.14159
}

// 条件导入
async function conditionalImport() {
    if (window.innerWidth < 768) {
        const mobileModule = await import('./mobile.js');
        mobileModule.init();
    } else {
        const desktopModule = await import('./desktop.js');
        desktopModule.init();
    }
}
```

**模块系统的高级特性：**
```javascript
// 重新导出（Re-exporting）
// utils.js
export { add, subtract } from './mathUtils.js'; // 重新导出
export { default as User } from './user.js'; // 重新导出默认导出

// 导入并立即导出
export * from './mathUtils.js'; // 导出所有命名导出，但不包括默认导出

// 聚合模块
// index.js
export { default as User } from './User.js';
export { add, subtract } from './mathUtils.js';
export { config } from './config.js';

// 在其他文件中可以这样使用
// main.js
import { User, add, config } from './index.js'; // 聚合导入
```

**模块加载机制：**
ES6模块是静态的，这意味着：
1. 导入导出关系在编译时确定
2. 可以进行静态分析，实现Tree Shaking
3. 导入绑定是只读的引用，不是值的拷贝
4. 模块只会被加载执行一次，后续导入共享同一实例

**与CommonJS的对比：**
```javascript
// CommonJS (Node.js)
const { add } = require('./mathUtils'); // 运行时加载
module.exports = { PI: 3.14159 }; // 运行时导出

// ES6 Module
import { add } from './mathUtils.js'; // 编译时确定
export const PI = 3.14159; // 编译时导出
```