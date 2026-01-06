# webpack 打包时 hash 码是如何生成的（了解）

**题目**: webpack 打包时 hash 码是如何生成的（了解）

## 标准答案

Webpack 中有三种 hash 生成方式：

1. **hash**: 每次构建都会生成一个唯一的 hash，所有文件共享同一个 hash
2. **chunkhash**: 每个 chunk 有自己的 hash，只有该 chunk 内容变化时 hash 才会改变
3. **contenthash**: 基于文件内容生成 hash，只有文件内容变化时 hash 才会改变

Hash 生成基于文件内容、依赖关系等信息，通过哈希算法（如 MD5、SHA）计算得出，用于实现浏览器缓存策略。

## 深入理解

### 1. Hash 生成原理

Webpack 使用哈希算法来生成 hash 码，主要目的是实现缓存策略。当文件内容发生变化时，hash 也会随之改变，从而让浏览器重新加载资源。

```javascript
// webpack 配置中的 hash 使用
module.exports = {
  output: {
    // 传统 hash - 每次构建所有文件使用相同 hash
    filename: '[name].[hash].js',
    
    // chunkhash - 每个 chunk 有独立 hash
    chunkFilename: '[name].[chunkhash].js',
    
    // contenthash - 基于文件内容生成 hash
    assetModuleFilename: '[name].[contenthash].[ext]'
  },
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 2. 不同类型 Hash 的实现机制

#### hash - 全局哈希
```javascript
// hash 基于整个构建过程生成
class Compilation {
  constructor() {
    // 构建开始时生成全局 hash
    this.hash = crypto.createHash('md5')
      .update(Date.now().toString())
      .update(JSON.stringify(this.options))
      .digest('hex');
  }
  
  createHash() {
    // 为所有资源使用相同的 hash
    return this.hash;
  }
}
```

#### chunkhash - 块级哈希
```javascript
// chunkhash 基于 chunk 内容生成
class Chunk {
  constructor(modules) {
    this.modules = modules;
  }
  
  getChunkHash() {
    const chunkHash = crypto.createHash('md5');
    
    // 将 chunk 内所有模块的内容和依赖关系加入哈希计算
    this.modules.forEach(module => {
      chunkHash.update(module.source);
      chunkHash.update(JSON.stringify(module.dependencies));
    });
    
    return chunkHash.digest('hex');
  }
}
```

#### contenthash - 内容哈希
```javascript
// contenthash 基于文件内容生成
function generateContentHash(content) {
  return crypto.createHash('md5')
    .update(content)
    .digest('hex');
}

// 在文件生成时计算
class Asset {
  constructor(content) {
    this.content = content;
    this.contentHash = generateContentHash(content);
  }
  
  getFilename() {
    return `file.[contenthash:${this.contentHash}].js`;
  }
}
```

### 3. 实际应用示例

```javascript
// webpack.config.js - hash 类型对比
module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js',
    vendor: './src/vendor.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    // hash: 每次构建所有文件使用相同 hash
    // 构建时间: 2023-01-01 10:00:00 -> hash: a1b2c3d4
    // filename: '[name].[hash].js' -> main.a1b2c3d4.js, vendor.a1b2c3d4.js
    
    // chunkhash: 每个 chunk 独立 hash
    // filename: '[name].[chunkhash].js'
    
    // contenthash: 基于文件内容
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
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

### 4. Hash 生成的算法实现

```javascript
// 简化的 hash 生成算法
class WebpackHashGenerator {
  static generateHash(data) {
    const hash = crypto.createHash('md5');
    
    // 根据数据类型处理不同的内容
    if (typeof data === 'string') {
      hash.update(data);
    } else if (typeof data === 'object') {
      hash.update(JSON.stringify(data));
    }
    
    return hash.digest('hex');
  }
  
  // 生成 contenthash
  static generateContentHash(content) {
    return this.generateHash(content);
  }
  
  // 生成 chunkhash
  static generateChunkHash(chunkInfo) {
    const hash = crypto.createHash('md5');
    
    // 包含 chunk 的基本信息
    hash.update(chunkInfo.id);
    hash.update(chunkInfo.name);
    
    // 包含 chunk 内模块信息
    chunkInfo.modules.forEach(module => {
      hash.update(module.identifier);
      hash.update(module.content);
    });
    
    // 包含依赖关系
    if (chunkInfo.dependencies) {
      hash.update(JSON.stringify(chunkInfo.dependencies));
    }
    
    return hash.digest('hex');
  }
  
  // 生成全局 hash
  static generateGlobalHash(compilationInfo) {
    const hash = crypto.createHash('md5');
    
    // 包含编译时间
    hash.update(compilationInfo.time.toString());
    
    // 包含配置信息
    hash.update(JSON.stringify(compilationInfo.options));
    
    // 包含入口点信息
    Object.keys(compilationInfo.entries).forEach(entry => {
      hash.update(entry);
      hash.update(compilationInfo.entries[entry]);
    });
    
    return hash.digest('hex');
  }
}
```

### 5. 缓存策略优化

```javascript
// 最佳实践配置
module.exports = {
  output: {
    // JS 文件使用 contenthash，只有内容变化时才改变
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // CSS 文件也使用 contenthash
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 分离第三方库，减少业务代码变化对 vendor 的影响
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all'
        },
        // 分离公共代码
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all'
        }
      }
    }
  }
};
```

### 6. Hash 与缓存策略

通过使用不同的 hash 策略，可以实现更精准的缓存控制：

- **contenthash**: 最精准的缓存策略，只有文件内容变化才更新 hash
- **chunkhash**: 适中的缓存策略，chunk 内容变化时更新 hash
- **hash**: 最保守的缓存策略，任何变化都更新所有文件的 hash

这种机制确保了浏览器能够正确地缓存静态资源，同时在文件内容发生变化时能够及时更新缓存，优化了用户体验和加载性能。
