# 是否写过 Loader 和 Plugin？描述一下编写 loader 或 plugin 的思路（了解）

## Loader 的编写思路

Loader 是 Webpack 用来处理不同文件类型的转换器，本质上是一个函数，接收源码作为参数，返回转换后的结果。

### Loader 的基本特点
- 一个函数，输入源码，输出转换后的代码
- 遵循单一职责原则，一个 Loader 只做一件事
- 可以链式调用，前一个 Loader 的输出是后一个 Loader 的输入
- 运行在 Node.js 中，可以执行任意操作

### 编写 Loader 的基本示例

```javascript
// 简单的 Loader 示例
module.exports = function(source) {
  // source 是源码内容
  const options = this.getOptions(); // 获取配置选项
  const callback = this.async(); // 异步回调
  
  // 处理源码
  const result = source.replace(/console\.log/g, 'console.warn');
  
  // 如果是异步操作
  if (callback) {
    callback(null, result);
  } else {
    return result;
  }
};
```

### 更完整的 Loader 示例

```javascript
// markdown-loader.js
const marked = require('marked');

module.exports = function(source) {
  // 设置缓存依赖
  this.cacheable && this.cacheable();
  
  // 添加依赖文件，当依赖文件变化时重新编译
  this.addDependency(this.resourcePath + '.meta.json');
  
  // 转换 Markdown 为 HTML
  const html = marked(source);
  
  // 返回 ES6 模块格式
  return `export default ${JSON.stringify(html)}`;
};
```

### 编写 Loader 的注意事项
1. **同步与异步**：使用 `this.async()` 处理异步操作
2. **缓存优化**：使用 `this.cacheable()` 启用缓存
3. **依赖追踪**：使用 `this.addDependency()` 添加额外依赖
4. **错误处理**：使用 `this.emitError()` 发送错误信息
5. **代码转换**：确保返回有效的 JavaScript 代码

## Plugin 的编写思路

Plugin 是用来扩展 Webpack 功能的插件，通过监听 Webpack 的生命周期事件来执行特定任务。

### Plugin 的基本结构
- 一个包含 `apply` 方法的对象或类
- 通过 `compiler` 和 `compilation` 对象访问 Webpack 的内部对象
- 监听特定的生命周期事件

### 编写 Plugin 的基本示例

```javascript
class MyWebpackPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    // 在编译开始时执行
    compiler.hooks.run.tap('MyWebpackPlugin', (compilation) => {
      console.log('开始编译...');
    });

    // 在生成资源到 output 目录之前执行
    compiler.hooks.emit.tapAsync('MyWebpackPlugin', (compilation, callback) => {
      // 遍历所有编译后的资源
      for (let filename in compilation.assets) {
        // 修改资源内容
        let content = compilation.assets[filename].source();
        content = content.replace(/process\.env\.NODE_ENV/g, '"production"');
        
        // 替换资源
        compilation.assets[filename] = {
          source: () => content,
          size: () => content.length
        };
      }
      
      callback();
    });
  }
}

module.exports = MyWebpackPlugin;
```

### 更实用的 Plugin 示例

```javascript
// 生成资源清单文件的 Plugin
class AssetsManifestPlugin {
  constructor(options = {}) {
    this.filename = options.filename || 'manifest.json';
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('AssetsManifestPlugin', (compilation, callback) => {
      // 收集所有生成的资源文件
      const manifest = {};
      for (let filename in compilation.assets) {
        manifest[filename] = filename;
      }

      // 将清单写入资源
      const manifestContent = JSON.stringify(manifest, null, 2);
      compilation.assets[this.filename] = {
        source: () => manifestContent,
        size: () => manifestContent.length
      };

      callback();
    });
  }
}

module.exports = AssetsManifestPlugin;
```

### Webpack 生命周期钩子

- `entry-option`：处理入口选项
- `run`：开始编译
- `compile`：准备编译
- `compilation`：生成资源
- `make`：完成构建
- `emit`：输出资源前
- `done`：完成编译

### 编写 Plugin 的最佳实践
1. **命名规范**：Plugin 名称以 Plugin 结尾
2. **事件选择**：选择合适的生命周期事件
3. **错误处理**：妥善处理错误情况
4. **性能考虑**：避免不必要的重复计算
5. **兼容性**：考虑不同 Webpack 版本的兼容性

## Loader vs Plugin 区别

| 特性 | Loader | Plugin |
|------|--------|--------|
| 作用 | 转换特定类型文件 | 扩展 Webpack 功能 |
| 时机 | 模块加载时 | 整个构建过程 |
| 实现 | 函数 | 类，包含 apply 方法 |
| 调用 | 链式调用 | 通过事件钩子 |
| 适用场景 | 文件预处理 | 构建流程控制 |

## 实际应用场景

### 常见的 Loader
- `babel-loader`：转换 ES6+ 代码
- `css-loader`：处理 CSS 文件
- `file-loader`：处理文件资源
- `url-loader`：将小文件转为 Data URL

### 常见的 Plugin
- `HtmlWebpackPlugin`：生成 HTML 文件
- `MiniCssExtractPlugin`：提取 CSS 到单独文件
- `DefinePlugin`：定义环境变量
- `CleanWebpackPlugin`：清理输出目录的思路？（高薪常问）

**题目**: 是否写过 Loader 和 Plugin？描述一下编写 loader 或 plugin 的思路？（高薪常问）
