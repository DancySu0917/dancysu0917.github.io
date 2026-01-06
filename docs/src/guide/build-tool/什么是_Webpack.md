# 什么是 Webpack（必会）

**题目**: 什么是 Webpack（必会）

**答案**:

Webpack 是一个现代 JavaScript 应用程序的静态模块打包器。它将项目中的各种资源（JavaScript、CSS、图片等）都视为模块，并通过依赖关系图将它们打包成静态资源。

## 核心概念

### 1. 入口（Entry）
指定 Webpack 开始构建依赖图的起点文件：
```javascript
module.exports = {
  entry: './src/index.js' // 单入口
  // 或
  entry: {
    app: './src/app.js',
    admin: './src/admin.js' // 多入口
  }
};
```

### 2. 输出（Output）
指定打包后文件的输出位置和命名规则：
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};
```

### 3. 加载器（Loaders）
让 Webpack 能够处理非 JavaScript 文件：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
```

### 4. 插件（Plugins）
执行更广泛的任务，如打包优化、资源管理、环境变量注入等：
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

### 5. 模式（Mode）
设置预定义的优化配置：
```javascript
module.exports = {
  mode: 'development' // 'production' 或 'none'
};
```

## 工作原理

1. **解析**：从入口文件开始，递归解析所有依赖的模块
2. **转换**：使用加载器转换非 JavaScript 模块
3. **打包**：将所有模块按照依赖关系打包成一个或多个 bundle

## 主要功能

- **模块打包**：支持 ES6 模块、CommonJS、AMD 等模块规范
- **代码分割**：将代码拆分成多个块，实现按需加载
- **热模块替换**：开发时实时更新模块而无需刷新页面
- **Tree Shaking**：移除未使用的代码，减少包体积
- **开发服务器**：提供实时重载和热替换的开发环境

## 优势

1. **灵活性**：高度可配置，支持各种类型的资源
2. **生态系统**：丰富的插件和加载器生态
3. **性能优化**：内置代码分割、压缩等优化功能
4. **开发体验**：支持热更新、Source Map 等开发功能

Webpack 通过模块化的方式组织和处理前端资源，是现代前端工程化不可或缺的工具。
