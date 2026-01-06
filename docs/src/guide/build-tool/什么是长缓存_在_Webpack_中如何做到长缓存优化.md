# 什么是长缓存？在 Webpack 中如何做到长缓存优化？（高薪常问）

**题目**: 什么是长缓存？在 Webpack 中如何做到长缓存优化？（高薪常问）

**答案**:

## 什么是长缓存？

长缓存（Long-term caching）是一种前端性能优化策略，通过设置较长的缓存时间（如1年）来最大化利用浏览器缓存，减少重复请求，提升页面加载速度。

长缓存的核心思想是：
- 静态资源设置很长的缓存时间（max-age=31536000，即1年）
- 通过文件内容变化时改变文件名来实现缓存失效
- 确保不变的资源可以长期缓存，变化的资源能够及时更新

## Webpack 中的长缓存优化策略

### 1. 使用文件内容哈希（Content Hash）

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js', // 使用 contenthash
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true // 清理旧文件
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    }
  }
};
```

### 2. 分离第三方库和业务代码

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 分离第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        // 分离公共代码
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          enforce: true
        }
      }
    }
  }
};
```

### 3. 使用 HtmlWebpackPlugin 生成 HTML

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: true
    })
  ],
  output: {
    filename: '[name].[contenthash:8].js', // 只取8位哈希
    chunkFilename: '[name].[contenthash:8].chunk.js'
  }
};
```

### 4. CSS 文件的长缓存优化

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css'
    })
  ]
};
```

### 5. Manifest 文件优化

```javascript
const Webpack = require('webpack');

module.exports = {
  optimization: {
    runtimeChunk: 'single', // 提取运行时代码
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    }
  }
};
```

## 完整配置示例

```javascript
// webpack.prod.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    clean: true
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all'
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8KB以下转为base64
          }
        },
        generator: {
          filename: 'images/[name].[contenthash:8][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css'
    }),
    new Webpack.HashedModuleIdsPlugin() // 确保模块ID稳定
  ]
};
```

## 长缓存的优势

1. **提升加载速度**：资源长期缓存，减少网络请求
2. **降低服务器负载**：减少重复资源请求
3. **节省带宽**：客户端复用已缓存资源
4. **改善用户体验**：页面加载更快

## 注意事项

1. **哈希算法选择**：contenthash 最佳，因为只有内容变化时才改变
2. **文件名长度**：过长的文件名可能影响URL长度限制
3. **缓存策略**：HTML 文件不应设置长缓存，因为它包含引用资源的哈希
4. **版本控制**：确保构建过程稳定，避免不必要的哈希变化

通过这些策略，可以实现高效的长缓存优化，既保证了资源的长期缓存，又确保了更新的及时生效。
