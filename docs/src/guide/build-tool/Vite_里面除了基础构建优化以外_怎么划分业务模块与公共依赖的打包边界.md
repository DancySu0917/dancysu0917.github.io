# Vite 里面除了基础构建优化以外，怎么划分业务模块与公共依赖的打包边界？（了解）

**题目**: Vite 里面除了基础构建优化以外，怎么划分业务模块与公共依赖的打包边界？（了解）

**答案**:

在 Vite 中，划分业务模块与公共依赖的打包边界主要通过以下几种方式：

## 1. 依赖预构建（Pre-bundling）

Vite 在开发环境下会自动预构建依赖，将 CommonJS 和 UMD 依赖转换为 ESM 格式：

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 自动预构建的依赖
    include: ['vue', 'vue-router', 'lodash-es'],
    // 排除某些依赖的预构建
    exclude: ['my-lib'],
    // 强制预构建某些依赖
    force: true
  }
}
```

## 2. 生产环境构建配置

在生产环境中，Vite 使用 Rollup 进行构建，通过 `build.rollupOptions` 配置模块划分：

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        // 配置代码分割
        manualChunks: {
          // 将核心依赖打包到 vendor chunk
          vendor: ['vue', 'vue-router'],
          // 将工具库打包到 utils chunk
          utils: ['lodash-es', 'axios'],
          // 将 UI 库打包到 ui chunk
          ui: ['element-plus', '@vant/vue']
        }
      }
    }
  }
}
```

## 3. 动态导入（Dynamic Import）

通过动态导入实现代码分割，按需加载：

```javascript
// 按路由分割
const Home = () => import('./views/Home.vue');
const About = () => import('./views/About.vue');

// 按功能分割
async function loadChart() {
  const { Chart } = await import('./components/Chart.js');
  return Chart;
}

// 按条件分割
async function loadHeavyFeature() {
  if (window.innerWidth > 1200) {
    const { heavyFeature } = await import('./heavy-feature.js');
    return heavyFeature;
  }
}
```

## 4. 手动代码分割配置

更精细的代码分割控制：

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的依赖打包到 vendor
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('react')) {
              return 'vendor-core';
            }
            if (id.includes('chart') || id.includes('d3')) {
              return 'charts';
            }
            return 'vendor';
          }
          
          // 将公共工具函数打包到 common
          if (id.includes('utils') || id.includes('helpers')) {
            return 'common';
          }
          
          // 按业务模块划分
          if (id.includes('components/')) {
            return 'components';
          }
          if (id.includes('views/')) {
            return 'pages';
          }
        }
      }
    }
  }
}
```

## 5. 入口文件划分

通过多个入口文件来划分模块边界：

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      input: {
        // 主应用入口
        main: 'src/main.js',
        // 管理后台入口
        admin: 'src/admin/main.js',
        // 第三方组件库入口
        widgets: 'src/widgets/index.js'
      },
      output: {
        // 为不同入口生成不同的 chunk
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'admin' ? 'admin/[name].[hash].js' : '[name].[hash].js';
        }
      }
    }
  }
}
```

## 6. 动态导入与命名 chunks

使用魔法注释来命名动态导入的 chunks：

```javascript
// 命名动态导入的 chunk
const ChartComponent = await import(
  /* webpackChunkName: "chart" */ 
  './components/ChartComponent'
);

// 或在 Vite 中使用
const ChartComponent = await import(
  /* @vite-ignore */
  './components/ChartComponent'
);

// 按功能模块分组
const { debounce } = await import(
  /* webpackChunkName: "lodash" */ 
  'lodash-es'
);
```

## 7. 资源预加载优化

通过资源提示优化加载顺序：

```javascript
// 在 HTML 中添加资源预加载
// <link rel="modulepreload" href="/chunks/vendor-core.js">
// <link rel="modulepreload" href="/chunks/common.js">

// 或在代码中动态预加载
async function preloadModules() {
  await Promise.all([
    import('./chunks/vendor-core.js'),
    import('./chunks/common.js')
  ]);
}
```

## 最佳实践

1. **合理划分依赖**: 将第三方库与业务代码分离
2. **按需加载**: 对非核心功能使用动态导入
3. **避免过度分割**: 平衡 HTTP 请求数量和缓存效果
4. **利用缓存**: 将稳定不变的依赖单独打包以利用浏览器缓存
5. **监控包大小**: 使用构建分析工具监控各 chunk 的大小

通过这些方式，Vite 可以有效划分业务模块与公共依赖的打包边界，实现更好的加载性能和缓存策略。
