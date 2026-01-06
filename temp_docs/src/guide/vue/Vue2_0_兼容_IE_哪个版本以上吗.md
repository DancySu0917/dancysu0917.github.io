# Vue2.0 兼容 IE 哪个版本以上吗？（必会）

**题目**: Vue2.0 兼容 IE 哪个版本以上吗？（必会）

## 标准答案

Vue 2.0 不支持 IE8 及以下版本，最低兼容 IE9。Vue 3.0 已不再支持 IE 浏览器。

## 深入理解

### Vue 2.x 对 IE 的支持

Vue 2.x 基于 ES5 特性构建，因此需要支持 ES5 的浏览器。IE8 及以下版本不完全支持 ES5，所以 Vue 2.x 最低支持 IE9。

```javascript
// Vue 2.x 需要的一些 ES5 特性
// Object.defineProperty - 用于响应式数据绑定
// 但在 IE8 中不完全支持

// Vue 2.x 在 IE9+ 中正常工作
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

### 兼容 IE9+ 的注意事项

为了在 IE9+ 中正常使用 Vue 2.x，需要考虑以下几点：

1. **ES5 特性兼容**：IE9+ 支持大部分 ES5 特性
2. **Promise 支持**：IE9-10 不原生支持 Promise，需要引入 polyfill
3. **CSS 前缀**：IE 需要特定的 CSS 前缀

```javascript
// 在 IE9-10 中需要添加 Promise polyfill
if (!window.Promise) {
  window.Promise = require('es6-promise').Promise
}
```

### Vue 3.x 对 IE 的支持

Vue 3.x 使用了更多现代浏览器特性，不再支持 IE：

```javascript
// Vue 3.x 使用了 Proxy 等现代特性
// Proxy 在 IE 中完全不支持
import { createApp } from 'vue'

createApp({
  // Vue 3.x 应用
}).mount('#app')
```

### 实际项目中的兼容处理

如果项目需要支持 IE9+，可以采用以下策略：

1. **使用 Vue 2.x**：选择 Vue 2.x 版本进行开发
2. **引入 Polyfill**：通过 Babel 和 polyfill 库兼容旧浏览器
3. **CSS 前缀处理**：使用 Autoprefixer 等工具

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        ie: '9'  // 目标浏览器
      },
      useBuiltIns: 'usage',
      corejs: 3
    }]
  ]
}
```

### 总结

- Vue 2.0 支持 IE9+，但需要适当的 polyfill
- Vue 3.0 不支持 IE 浏览器
- 现代项目建议逐步放弃对 IE 的支持
