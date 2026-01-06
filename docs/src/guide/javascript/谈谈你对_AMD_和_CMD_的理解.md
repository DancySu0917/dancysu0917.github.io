# 谈谈你对 AMD 和 CMD 的理解？（高薪常问）

**题目**: 谈谈你对 AMD 和 CMD 的理解？（高薪常问）

## 答案

AMD (Asynchronous Module Definition) 和 CMD (Common Module Definition) 是两种前端模块化规范，它们都是在 ES6 模块出现之前的 JavaScript 模块化解决方案。

### 1. AMD (Asynchronous Module Definition)

AMD 是一种异步模块定义规范，主要用于浏览器环境。它允许模块异步加载，适合在浏览器中使用。

#### 特点：
- **依赖前置**：在模块定义时就需要声明所有依赖
- **异步加载**：模块可以异步加载，不会阻塞浏览器
- **提前执行**：依赖模块在定义时就会被加载和执行

#### 代表库：RequireJS

```javascript
// AMD 模块定义示例
define(['./moduleA', './moduleB'], function(moduleA, moduleB) {
  // 依赖在定义时就声明
  function doSomething() {
    moduleA.method();
    moduleB.method();
  }
  
  return {
    doSomething: doSomething
  };
});

// AMD 模块使用示例
require(['./myModule'], function(myModule) {
  myModule.doSomething();
});
```

### 2. CMD (Common Module Definition)

CMD 是另一种模块定义规范，由国内的 Sea.js 提出。它更接近 CommonJS 的写法，但又支持异步加载。

#### 特点：
- **依赖就近**：在需要时才声明依赖
- **按需执行**：依赖模块在实际使用时才被执行
- **更接近 CommonJS**：写法更像 Node.js 的模块系统

#### 代表库：Sea.js

```javascript
// CMD 模块定义示例
define(function(require, exports, module) {
  // 依赖就近声明
  var moduleA = require('./moduleA');
  var moduleB = require('./moduleB');
  
  function doSomething() {
    // 在需要时引入模块
    var moduleC = require('./moduleC');
    moduleA.method();
    moduleB.method();
    moduleC.method();
  }
  
  module.exports = {
    doSomething: doSomething
  };
});
```

### 3. AMD 与 CMD 的主要区别

| 特性 | AMD | CMD |
|------|-----|-----|
| 依赖声明方式 | 依赖前置 | 依赖就近 |
| 执行时机 | 提前执行依赖模块 | 按需执行依赖模块 |
| 代码风格 | 回调函数风格 | 更接近 CommonJS 风格 |
| 适用场景 | 需要提前加载多个模块的场景 | 按需加载，灵活控制模块加载时机 |

### 4. 详细对比

#### 加载时机差异

```javascript
// AMD - 依赖前置，提前加载
define(['./a', './b'], function(a, b) {
  // a 和 b 在定义时就被加载执行了
  console.log('a and b are loaded');
  
  function method() {
    // 实际使用时 a 和 b 已经准备好了
    return a.doSomething() + b.doSomething();
  }
  
  return { method: method };
});

// CMD - 依赖就近，按需加载
define(function(require, exports, module) {
  console.log('module defined');
  
  function method() {
    // 只在实际需要时才加载 a 和 b
    var a = require('./a');
    var b = require('./b');
    return a.doSomething() + b.doSomething();
  }
  
  return { method: method };
});
```

#### 性能差异

```javascript
// AMD - 适合依赖关系明确的场景
define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
  // 所有依赖都已加载，适合复杂应用
  var AppView = Backbone.View.extend({
    // ...
  });
  
  return AppView;
});

// CMD - 适合需要懒加载的场景
define(function(require, exports, module) {
  function init() {
    // 根据条件按需加载
    if (window.innerWidth < 768) {
      var mobileModule = require('./mobile');
      mobileModule.init();
    } else {
      var desktopModule = require('./desktop');
      desktopModule.init();
    }
  }
  
  return { init: init };
});
```

### 5. 与现代模块系统的对比

随着 ES6 模块的普及和打包工具的发展，AMD 和 CMD 已经逐渐被取代：

```javascript
// ES6 模块 (现代标准)
import $ from 'jquery';
import _ from 'underscore';
import { Component } from './Component';

export default class App {
  constructor() {
    // 模块在需要时自动加载
  }
};

// 或者动态导入 (类似 AMD/CMD 的按需加载)
async function loadModule() {
  const module = await import('./dynamicModule');
  return module.default;
}
```

### 6. 优缺点分析

#### AMD 优缺点
**优点：**
- 适合依赖关系复杂的大型项目
- 模块加载过程清晰可控
- 社区生态成熟（RequireJS）

**缺点：**
- 语法相对复杂
- 可能造成不必要的模块预加载

#### CMD 优缺点
**优点：**
- 语法更简洁，接近 CommonJS
- 支持按需加载，更灵活
- 代码组织更自然

**缺点：**
- 社区生态相对较小
- 调试可能更复杂

### 7. 总结

AMD 和 CMD 都是前端模块化发展过程中的重要规范，它们解决了 JavaScript 在浏览器环境中模块化的问题。虽然现在已经被 ES6 模块和各种打包工具所取代，但理解它们的设计理念对理解现代前端工程化仍然有重要意义：

1. AMD 采用依赖前置、提前执行的方式，适合依赖关系明确的场景
2. CMD 采用依赖就近、按需执行的方式，更加灵活
3. 两者都为后续的模块化标准奠定了基础
4. 现代开发中应优先使用 ES6 模块系统
