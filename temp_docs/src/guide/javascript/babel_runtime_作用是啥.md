# babel-runtime 作用是啥？（了解）

**题目**: babel-runtime 作用是啥？（了解）

**答案**:

`babel-runtime`（现在通常使用 `@babel/runtime`）是 Babel 转译工具的重要组成部分，主要用于提供运行时支持，使转译后的代码能够在各种环境中正常运行。以下是关于 Babel runtime 的详细说明：

## 1. Babel Runtime 的基本概念

Babel runtime 是一个包含 Babel 转译后辅助代码和内置对象 polyfill 的运行时库。它解决了 Babel 转译 ES6+ 代码时需要的辅助函数和新 API 支持问题。

## 2. 主要作用

### 2.1 提供辅助函数（Helpers）
Babel 在转译一些 ES6+ 语法时会生成辅助函数，如 `_classCallCheck`、`_createClass` 等。这些函数可以通过 runtime 提供，避免在每个文件中重复生成。

### 2.2 提供 Polyfill
为新的 JavaScript API（如 Promise、Array.from、Object.assign 等）提供兼容性实现，使代码能在不支持这些特性的环境中运行。

## 3. 核心组件

### 3.1 @babel/runtime
运行时库本身，包含所有辅助函数和 polyfill。

### 3.2 @babel/plugin-transform-runtime
Babel 插件，用于自动引入 `@babel/runtime` 中的辅助函数和 polyfill。

## 4. 配置示例

### 4.1 安装依赖
```bash
# 安装 runtime
npm install --save @babel/runtime

# 安装 transform 插件
npm install --save-dev @babel/plugin-transform-runtime
```

### 4.2 Babel 配置
```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "browsers": ["last 2 versions"]
      }
    }]
  ],
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      "absoluteRuntime": false,
      "corejs": 3,
      "helpers": true,
      "regenerator": true,
      "useESModules": false
    }]
  ]
}
```

## 5. 代码转换示例

### 5.1 没有 runtime 的转换
```javascript
// 源代码
class MyClass {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return `Hello, ${this.name}!`;
  }
}

// Babel 转换后（没有 runtime）
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var MyClass = /*#__PURE__*/function () {
  function MyClass(name) {
    _classCallCheck(this, MyClass);
    this.name = name;
  }

  _createClass(MyClass, [{
    key: "greet",
    value: function greet() {
      return "Hello, " + this.name + "!";
    }
  }]);

  return MyClass;
}();
```

### 5.2 使用 runtime 的转换
```javascript
// 源代码
class MyClass {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return `Hello, ${this.name}!`;
  }
}

// Babel 转换后（使用 runtime）
var _createClass = require("@babel/runtime/helpers/createClass");
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var MyClass = /*#__PURE__*/function () {
  function MyClass(name) {
    _classCallCheck(this, MyClass);
    this.name = name;
  }

  _createClass(MyClass, [{
    key: "greet",
    value: function greet() {
      return "Hello, " + this.name + "!";
    }
  }]);

  return MyClass;
}();
```

## 6. 不同的 Runtime 配置

### 6.1 helpers 配置
```javascript
// 配置 helpers: true，会自动引入辅助函数
["@babel/plugin-transform-runtime", {
  "helpers": true,
  "regenerator": false
}]
```

### 6.2 regenerator 配置
```javascript
// 配置 regenerator: true，支持 async/await
["@babel/plugin-transform-runtime", {
  "helpers": true,
  "regenerator": true
}]
```

### 6.3 corejs 配置
```javascript
// 配置 corejs 版本，提供 ES 标准 API 的 polyfill
["@babel/plugin-transform-runtime", {
  "corejs": 3,
  "helpers": true,
  "regenerator": true
}]
```

## 7. Core-js 集成

```javascript
// 使用 core-js 提供完整的 polyfill 支持
["@babel/plugin-transform-runtime", {
  "corejs": {
    "version": 3,
    "proposals": true
  }
}]
```

## 8. 实际应用示例

### 8.1 完整的 Babel 配置
```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        "absoluteRuntime": false,
        "corejs": 3,
        "helpers": true,
        "regenerator": true,
        "version": "7.12.0"
      }
    ]
  ],
};
```

### 8.2 package.json 依赖
```json
{
  "dependencies": {
    "@babel/runtime": "^7.12.0",
    "core-js": "^3.6.5"
  },
  "devDependencies": {
    "@babel/core": "^7.12.0",
    "@babel/plugin-transform-runtime": "^7.12.0",
    "@babel/preset-env": "^7.12.0"
  }
}
```

## 9. 优势

1. **代码体积优化**: 避免在每个文件中重复生成相同的辅助函数
2. **性能提升**: 通过模块化引入，减少重复代码
3. **自动 polyfill**: 自动引入所需的 polyfill，无需手动管理
4. **版本管理**: 统一管理 polyfill 版本，避免冲突

## 10. 注意事项

1. **生产依赖**: `@babel/runtime` 应该作为生产依赖安装（--save 而不是 --save-dev）
2. **版本兼容**: 确保 `@babel/runtime` 和 `@babel/plugin-transform-runtime` 版本兼容
3. **Core-js 版本**: 选择合适的 core-js 版本，v3 提供了更好的模块化支持

Babel runtime 是现代前端项目中不可或缺的工具，它让开发者能够使用最新的 JavaScript 特性，同时保证代码在各种环境中的兼容性。