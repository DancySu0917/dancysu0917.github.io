# 如果不使用脚手架，用 webpack 构建一个自己的 react 应用（了解）

**题目**: 如果不使用脚手架，用 webpack 构建一个自己的 react 应用（了解）

## 标准答案

要使用 webpack 从零构建一个 React 应用，需要进行以下步骤：

1. 初始化项目：创建 package.json 文件
2. 安装必要的依赖包：webpack、webpack-cli、react、react-dom 等
3. 配置 webpack：创建 webpack.config.js 文件，配置入口、输出、loader、plugin 等
4. 配置 Babel：处理 JSX 语法和 ES6+ 语法转换
5. 设置开发服务器：使用 webpack-dev-server 提供热更新功能
6. 配置生产环境：设置代码压缩、优化等

## 深入理解

### 1. 项目初始化和依赖安装

```bash
mkdir my-react-app
cd my-react-app
npm init -y
npm install react react-dom
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader
npm install --save-dev html-webpack-plugin clean-webpack-plugin
npm install --save-dev css-loader style-loader file-loader
```

### 2. webpack 基础配置

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // 入口文件
  entry: './src/index.js',
  
  // 开发模式
  mode: 'development',
  
  // 输出配置
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '/'
  },
  
  // 模块解析规则
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  
  // 插件配置
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  
  // 开发服务器配置
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3000,
    hot: true,
    historyApiFallback: true
  },
  
  // 解析配置
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
```

### 3. Babel 配置

```javascript
// .babelrc
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

### 4. 项目结构

```
my-react-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── App.jsx
│   ├── index.js
│   └── index.css
├── webpack.config.js
├── .babelrc
└── package.json
```

### 5. 示例代码

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My React App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

```jsx
// src/components/App.jsx
import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <h1>My React App with Webpack</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default App;
```

```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './index.css';

ReactDOM.render(<App />, document.getElementById('root'));
```

### 6. 生产环境配置

```javascript
// webpack.prod.js
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
});
```

这种方式让我们完全掌控构建过程，可以针对项目需求进行精细化配置，理解整个构建流程，而不是依赖脚手架的黑盒配置。
