# 如何利用 Webpack 来优化前端性能（高薪常问）

**题目**: 如何利用 Webpack 来优化前端性能（高薪常问）

**答案**:

利用 Webpack 优化前端性能可以从以下几个方面入手：

## 1. 代码分割（Code Splitting）

### 入口点分割
```javascript
module.exports = {
  entry: {
    main: './src/index.js',
    vendor: './src/vendor.js'
  }
};
```

### 动态导入（推荐）
```javascript
// 使用 import() 动态导入实现按需加载
const loadLodash = async () => {
  const { default: _ } = await import('lodash');
  return _;
};

// 在 React 中使用动态导入
const Component = lazy(() => import('./Component'));
```

### SplitChunksPlugin 配置
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

## 2. Tree Shaking（摇树优化）

移除未使用的代码：
```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // 生产模式自动启用 tree shaking
  optimization: {
    usedExports: true, // 标记未使用的导出
    sideEffects: false // 或指定副作用文件
  }
};

// package.json
{
  "sideEffects": [
    "./src/polyfills.js",
    "*.css"
  ]
}
```

## 3. 压缩和优化

### JavaScript 压缩
```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 移除 console
            drop_debugger: true
          }
        }
      })
    ]
  }
};
```

### CSS 压缩
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    })
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin()
    ]
  }
};
```

## 4. 图片和资源优化

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8KB以下转为base64
          }
        }
      }
    ]
  }
};
```

## 5. 缓存优化

### 长期缓存
```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  optimization: {
    moduleIds: 'deterministic', // 确保模块ID稳定
    runtimeChunk: 'single', // 提取运行时代码
  }
};
```

## 6. 模块懒加载

```javascript
// 使用魔法注释进行预加载/预获取
const Profile = lazy(() => 
  import(
    /* webpackChunkName: "profile" */ 
    './Profile'
  )
);

// 预获取
const Navigation = lazy(() => 
  import(
    /* webpackPrefetch: true */ 
    './Navigation'
  )
);
```

## 7. 外部化依赖（Externals）

将某些依赖打包到 CDN：
```javascript
module.exports = {
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  }
};
```

## 8. 开发环境优化

```javascript
// 开发环境配置
module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map', // 快速构建的 source map
  optimization: {
    moduleIds: 'named' // 便于调试
  }
};
```

## 9. 并行处理

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true // 启用多进程并行处理
      })
    ]
  }
};
```

## 10. Bundle 分析

使用 webpack-bundle-analyzer 分析打包结果：
```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static' // 生成分析报告
    })
  ]
};
```

通过这些优化策略，可以显著提升前端应用的加载速度和运行性能。
