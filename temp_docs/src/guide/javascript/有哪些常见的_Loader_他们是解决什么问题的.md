# 有哪些常见的 Loader？他们是解决什么问题的？（必会）

**题目**: 有哪些常见的 Loader？他们是解决什么问题的？（必会）

**答案**:

Webpack Loader 是 Webpack 打包工具的核心概念之一，用于将非 JavaScript 文件转换为有效的模块，使它们可以被添加到依赖图中。Loader 本质上是一个函数，接收源文件作为输入，返回转换后的结果。

## Loader 的工作原理

Loader 遵循从右到左、从下到上的执行顺序，可以链式调用。Webpack 会根据文件扩展名或正则表达式匹配对应的 Loader。

## 常见的 Loader 及其作用

### 1. css-loader
- **解决的问题**：处理 CSS 文件中的 `@import` 和 `url()` 语句
- **功能**：将 CSS 文件转换为 JavaScript 模块，允许在 JS 中 `import` CSS 文件
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader']
      }
    ]
  }
};
```

### 2. style-loader
- **解决的问题**：将 CSS 注入到 DOM 中
- **功能**：将 CSS-loader 处理后的样式动态插入到 HTML 页面的 `<style>` 标签中
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
```

### 3. babel-loader
- **解决的问题**：将 ES6+ 语法转换为向后兼容的 JavaScript
- **功能**：使用 Babel 将现代 JavaScript 语法转换为浏览器可执行的代码
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

### 4. file-loader
- **解决的问题**：处理静态资源文件（如图片、字体等）
- **功能**：将文件复制到输出目录并返回其 URL
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  }
};
```

### 5. url-loader
- **解决的问题**：将小文件转换为 Data URL（Base64 编码）
- **功能**：根据文件大小决定是转换为 Data URL 还是使用 file-loader
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192, // 小于8KB的图片转为base64
              fallback: 'file-loader',
              name: '[name].[hash].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  }
};
```

### 6. sass-loader / less-loader
- **解决的问题**：处理 Sass/SCSS 和 Less 预处理器文件
- **功能**：将 Sass/SCSS 或 Less 语法转换为标准 CSS
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  }
};
```

### 7. postcss-loader
- **解决的问题**：对 CSS 进行后处理
- **功能**：自动添加浏览器前缀、CSS 优化、CSS 降级等
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('autoprefixer')({
                  browsers: ['last 2 versions']
                })
              ]
            }
          }
        ]
      }
    ]
  }
};
```

### 8. ts-loader / awesome-typescript-loader
- **解决的问题**：处理 TypeScript 文件
- **功能**：将 TypeScript 代码编译为 JavaScript
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
```

### 9. vue-loader
- **解决的问题**：处理 Vue 单文件组件
- **功能**：将 `.vue` 文件解析为 JavaScript 模块
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
};
```

### 10. raw-loader
- **解决的问题**：将文件内容作为字符串导入
- **功能**：将文件内容直接作为字符串返回
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: 'raw-loader'
      }
    ]
  }
};
```

### 11. html-loader
- **解决的问题**：处理 HTML 文件
- **功能**：解析 HTML 文件中的资源引用，如 `<img src="...">`
- **配置示例**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'html-loader'
      }
    ]
  }
};
```

## Loader 的配置方式

### 1. 内联方式
```javascript
import Styles from '!style-loader!css-loader?modules!./styles.css';
```

### 2. 配置文件方式（推荐）
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { 
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  }
};
```

## 自定义 Loader

Loader 本质上是一个函数，接收源码作为参数，返回转换后的结果：

```javascript
// 自定义一个简单的 Loader
module.exports = function(source) {
  // source 是源文件内容
  const result = source.replace(/console\.log/g, 'console.warn');
  return result;
};
```

## Loader 的最佳实践

1. **链式调用**：充分利用 Loader 的链式调用能力
2. **性能优化**：使用 `exclude` 排除不必要的文件
3. **缓存机制**：合理利用缓存提高构建速度
4. **错误处理**：编写健壮的 Loader 代码

理解各种 Loader 的作用和配置方式是前端工程化的重要基础，能够帮助开发者更好地处理不同类型的资源文件。
