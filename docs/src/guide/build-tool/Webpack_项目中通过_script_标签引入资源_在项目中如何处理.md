# Webpack 项目中通过 script 标签引入资源，在项目中如何处理（了解）

**题目**: Webpack 项目中通过 script 标签引入资源，在项目中如何处理（了解）

## 标准答案

在Webpack项目中处理script标签引入的资源有多种方式：1）使用html-webpack-plugin管理外部资源；2）通过externals配置排除特定依赖；3）使用webpack的ProvidePlugin提供全局变量；4）动态导入处理运行时加载。关键是要避免模块冲突，确保全局变量正确暴露，并处理好资源的加载时机。

## 深入分析

### 1. 外部依赖管理
- **externals配置**：将某些依赖标记为外部依赖，不打包进bundle中
- **CDN资源引入**：通过script标签从CDN加载库文件
- **全局变量处理**：确保外部库提供的全局变量能被Webpack模块识别

### 2. HTML模板管理
- **html-webpack-plugin**：管理HTML模板和资源注入
- **资源注入策略**：自动或手动注入script标签
- **资源顺序管理**：确保依赖关系正确

### 3. 模块兼容处理
- **UMD模块处理**：处理通用模块定义的库
- **全局变量映射**：将全局变量映射为模块导入
- **模块转换**：将非模块化的库转换为模块化使用

### 4. 动态资源加载
- **运行时加载**：在运行时动态加载外部资源
- **按需加载**：根据需要动态引入script资源
- **资源预加载**：优化资源加载时机

## 代码实现示例

### 1. Webpack配置处理外部资源

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  
  // 外部依赖配置 - 不将这些库打包进bundle
  externals: {
    // 键是模块名，值是全局变量名
    'jquery': 'jQuery',  // import $ from 'jquery' -> window.jQuery
    'lodash': '_',       // import _ from 'lodash' -> window._
    'react': 'React',    // import React from 'react' -> window.React
    'react-dom': 'ReactDOM' // import ReactDOM from 'react-dom' -> window.ReactDOM
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // 手动注入外部资源
      scriptLoading: 'defer',
      // 在模板中注入额外的script标签
      inject: 'body',
      // 可以添加额外的script标签
      additionalScripts: [
        'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
        'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
      ]
    })
  ]
};
```

### 2. 使用html-webpack-plugin管理外部资源

```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webpack with External Scripts</title>
</head>
<body>
    <div id="app"></div>
    
    <!-- 外部资源在HTML中手动引入 -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- Webpack生成的bundle会自动注入 -->
</body>
</html>
```

### 3. ProvidePlugin提供全局变量

```javascript
// webpack.config.js
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    
    // 提供全局变量，无需import即可使用
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      _: 'lodash',
      // 提供特定方法
      'Promise': ['es6-promise', 'Promise']
    })
  ],
  
  // 外部依赖配置
  externals: {
    'jquery': 'jQuery',
    'lodash': '_'
  }
};
```

### 4. 动态加载外部脚本的工具函数

```javascript
// utils/scriptLoader.js
class ScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.loadingPromises = new Map();
  }

  // 加载单个脚本
  loadScript(src, options = {}) {
    // 如果脚本已加载，直接返回resolved promise
    if (this.loadedScripts.has(src)) {
      return Promise.resolve();
    }

    // 如果正在加载，返回相同的promise
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    // 创建加载promise
    const loadPromise = new Promise((resolve, reject) => {
      // 检查是否已存在相同src的脚本
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        if (existingScript.dataset.loaded === 'true') {
          this.loadedScripts.add(src);
          resolve();
          return;
        }
      }

      const script = document.createElement('script');
      
      // 设置属性
      script.src = src;
      script.async = options.async !== false; // 默认异步加载
      script.defer = options.defer || false;
      
      if (options.type) {
        script.type = options.type;
      }
      
      if (options.integrity) {
        script.integrity = options.integrity;
        script.crossOrigin = options.crossOrigin || 'anonymous';
      }

      script.onload = () => {
        script.dataset.loaded = 'true';
        this.loadedScripts.add(src);
        this.loadingPromises.delete(src);
        resolve(script);
      };

      script.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  // 批量加载脚本
  loadScripts(scripts) {
    const promises = scripts.map(script => {
      if (typeof script === 'string') {
        return this.loadScript(script);
      } else {
        return this.loadScript(script.src, script.options);
      }
    });
    return Promise.all(promises);
  }

  // 检查脚本是否已加载
  isScriptLoaded(src) {
    return this.loadedScripts.has(src);
  }

  // 预加载脚本（不等待执行完成）
  preloadScript(src) {
    if (this.loadedScripts.has(src) || this.loadingPromises.has(src)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  }
}

// 使用示例
const scriptLoader = new ScriptLoader();

// 加载单个脚本
scriptLoader.loadScript('https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js')
  .then(() => {
    console.log('Moment.js loaded successfully');
    // 现在可以使用moment全局变量
  })
  .catch(error => {
    console.error('Failed to load Moment.js:', error);
  });

// 批量加载脚本
scriptLoader.loadScripts([
  'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
  {
    src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
    async: false
  }
]).then(() => {
  console.log('jQuery and Bootstrap loaded');
});
```

### 5. 动态导入与外部资源结合

```javascript
// dynamicLoader.js
class DynamicLoader {
  constructor() {
    this.modules = new Map();
    this.scriptLoader = new ScriptLoader(); // 使用上面定义的ScriptLoader
  }

  // 动态加载并返回模块
  async loadExternalModule(src, globalName, checkFunction = null) {
    // 检查是否已缓存
    if (this.modules.has(src)) {
      return this.modules.get(src);
    }

    // 检查全局变量是否已存在
    if (globalName && window[globalName]) {
      const module = window[globalName];
      this.modules.set(src, module);
      return module;
    }

    // 加载脚本
    await this.scriptLoader.loadScript(src);

    // 等待全局变量可用（如果有检查函数）
    if (checkFunction) {
      await this.waitForCondition(checkFunction);
    } else if (globalName) {
      // 等待全局变量可用
      await this.waitForGlobal(globalName);
    }

    const module = globalName ? window[globalName] : {};
    this.modules.set(src, module);
    return module;
  }

  // 等待条件满足
  waitForCondition(conditionFn, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (conditionFn()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  }

  // 等待全局变量可用
  waitForGlobal(globalName, timeout = 5000) {
    return this.waitForCondition(() => window[globalName] !== undefined, timeout);
  }

  // 加载第三方库并返回Promise
  loadLibrary(name) {
    const libraries = {
      chartjs: {
        src: 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
        global: 'Chart'
      },
      moment: {
        src: 'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js',
        global: 'moment'
      },
      axios: {
        src: 'https://cdn.jsdelivr.net/npm/axios@0.27.2/dist/axios.min.js',
        global: 'axios'
      }
    };

    const lib = libraries[name];
    if (!lib) {
      throw new Error(`Unknown library: ${name}`);
    }

    return this.loadExternalModule(lib.src, lib.global);
  }
}

// 使用示例
const dynamicLoader = new DynamicLoader();

// 在React组件中使用
async function loadChartJS() {
  try {
    const Chart = await dynamicLoader.loadLibrary('chartjs');
    // 现在可以使用Chart.js
    return Chart;
  } catch (error) {
    console.error('Failed to load Chart.js:', error);
  }
}

// 按需加载外部库
async function initializeChart(canvasId) {
  const Chart = await loadChartJS();
  
  if (Chart) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
          label: 'Sample Data',
          data: [12, 19, 3],
          backgroundColor: ['red', 'blue', 'yellow']
        }]
      }
    });
  }
}
```

### 6. Webpack与CDN资源混合使用

```javascript
// src/main.js
// 即使通过script标签引入，也可以在模块中使用externals配置的库
import React from 'react';
import ReactDOM from 'react-dom/client';
import _ from 'lodash'; // 通过ProvidePlugin提供

// 也可以直接使用全局变量（如果通过script标签引入）
// import $ from 'jquery'; // 如果配置了externals，可以从全局获取

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  async componentDidMount() {
    // 动态加载额外的外部库
    const Chart = await dynamicLoader.loadLibrary('chartjs');
    
    if (Chart) {
      // 使用Chart.js创建图表
      this.createChart();
    }
  }

  createChart() {
    // 图表创建逻辑
    console.log('Creating chart with Chart.js');
  }

  render() {
    return (
      <div className="app">
        <h1>Webpack with External Scripts</h1>
        <p>Using React loaded from CDN with Webpack bundle</p>
      </div>
    );
  }
}

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
```

### 7. 处理第三方库的类型声明（TypeScript）

```typescript
// types/external.d.ts
declare global {
  interface Window {
    jQuery: any;
    $: any;
    _: any;
    React: any;
    ReactDOM: any;
    Chart: any;
  }
}

export {};

// webpack配置中处理typescript
// webpack.config.js
module.exports = {
  // ... 其他配置
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
```

## 实际应用场景

### 1. CDN资源优化
- **场景**：项目中使用大型第三方库如React、Vue等
- **实现**：通过CDN加载，减少打包体积，利用浏览器缓存
- **效果**：提升首屏加载速度，减少服务器带宽使用

### 2. 按需加载第三方库
- **场景**：某些功能模块才需要特定的第三方库
- **实现**：动态加载所需的外部脚本
- **效果**：减少初始包大小，按需加载功能

### 3. 遗留系统集成
- **场景**：在Webpack项目中集成遗留的全局脚本
- **实现**：使用externals和ProvidePlugin处理全局变量
- **效果**：平滑迁移，保持兼容性

### 4. A/B测试脚本管理
- **场景**：动态加载不同的分析或测试脚本
- **实现**：根据条件动态加载不同的外部脚本
- **效果**：灵活的实验管理，不影响主应用

## 总结

在Webpack项目中处理script标签引入的资源需要综合考虑构建配置、运行时加载和模块兼容性。通过合理使用externals配置、html-webpack-plugin、ProvidePlugin和动态加载技术，可以有效地管理外部资源，优化应用性能，并保持良好的开发体验。关键是要根据具体场景选择合适的方案，并注意处理好资源加载的时机和依赖关系。
