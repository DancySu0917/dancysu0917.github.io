# Loader 和 Plugin 的不同？（必会）

**题目**: Loader 和 Plugin 的不同？（必会）

**答案**:

Loader 和 Plugin 是 Webpack 中两个核心但功能不同的概念，它们在构建过程中扮演着不同的角色。

## Loader（加载器）

### 定义
Loader 是一个转换器，用于将非 JavaScript 文件转换为有效的模块，使它们可以被添加到依赖图中。Loader 本质上是一个函数，接收源文件作为输入，返回转换后的结果。

### 特点
- **处理文件**：专门用于处理特定类型的文件
- **链式调用**：可以链式使用多个 Loader
- **执行顺序**：从右到左、从下到上的执行顺序
- **文件级别**：在文件级别进行转换

### 工作方式
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'] // 链式调用，从右到左执行
      },
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  }
};
```

### 常见的 Loader
- `babel-loader`：转换 ES6+ 语法
- `css-loader`：处理 CSS 文件中的 `@import` 和 `url()`
- `file-loader`：处理静态资源文件
- `sass-loader`：处理 Sass/SCSS 文件

## Plugin（插件）

### 定义
Plugin 是一个扩展，用于在构建过程的特定时机执行特定任务。Plugin 可以访问 Webpack 的整个构建生命周期，执行更广泛的功能。

### 特点
- **功能广泛**：可以执行各种任务，如打包优化、资源管理、环境变量注入等
- **生命周期**：可以监听 Webpack 的构建生命周期事件
- **全局作用**：影响整个构建过程
- **实例化**：通过 `new` 关键字实例化使用

### 工作方式
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css'
    })
  ]
};
```

### 常见的 Plugin
- `HtmlWebpackPlugin`：生成 HTML 文件
- `MiniCssExtractPlugin`：提取 CSS 到单独文件
- `DefinePlugin`：定义环境变量
- `CleanWebpackPlugin`：清理输出目录
- `UglifyJsPlugin`：压缩 JS 代码

## 主要区别对比

| 特性 | Loader | Plugin |
|------|--------|--------|
| **处理对象** | 特定类型的文件 | 整个构建过程 |
| **使用方式** | 在 `module.rules` 中配置 | 在 `plugins` 数组中实例化 |
| **作用范围** | 文件级别 | 项目级别 |
| **执行时机** | 文件加载阶段 | 构建生命周期各个阶段 |
| **主要功能** | 文件转换 | 功能扩展和优化 |
| **配置方式** | 正则匹配文件类型 | 构造函数实例化 |

## 使用场景对比

### Loader 适用场景
- 转换 ES6+ 语法为 ES5
- 将 CSS 文件转换为 JS 模块
- 处理图片、字体等静态资源
- 预处理器转换（Sass、Less、Stylus 等）

### Plugin 适用场景
- 生成 HTML 文件
- 代码压缩和优化
- 提取公共代码
- 注入环境变量
- 清理构建目录
- 资源文件重命名

## 实际应用示例

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
      // Loader 配置 - 处理文件转换
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // 使用插件提供的 loader
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    // Plugin 配置 - 功能扩展
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css'
    })
  ]
};
```

在这个例子中：
- **Loader**：`babel-loader`、`css-loader`、`postcss-loader` 用于处理文件转换
- **Plugin**：`HtmlWebpackPlugin` 生成 HTML，`MiniCssExtractPlugin` 提取 CSS

## 总结

Loader 和 Plugin 是 Webpack 生态系统中互补的两个概念：
- **Loader** 专注于文件级别的转换，处理特定类型的文件
- **Plugin** 专注于项目级别的功能扩展，影响整个构建过程

理解两者的区别和使用场景对于合理配置 Webpack、优化构建流程至关重要。Loader 解决了 Webpack 只能处理 JavaScript 的限制，而 Plugin 则提供了强大的功能扩展能力。
