# JS 的加载会阻塞浏览器渲染吗？（了解）

**题目**: JS 的加载会阻塞浏览器渲染吗？（了解）

**答案**:

JavaScript的加载和执行对浏览器渲染的影响取决于多种因素，包括脚本的位置、类型和加载方式。

## 1. 默认行为：阻塞HTML解析

### 同步脚本（默认）
- **阻塞HTML解析**：当浏览器遇到`<script>`标签时，会停止HTML解析
- **阻塞DOM构建**：在脚本执行完成前，DOM树构建会暂停
- **阻塞渲染**：由于DOM构建暂停，页面渲染也会被阻塞

```html
<!DOCTYPE html>
<html>
<head>
  <title>JS阻塞示例</title>
</head>
<body>
  <h1>页面标题</h1>
  
  <!-- 这个脚本会阻塞后续HTML的解析 -->
  <script src="heavy-script.js"></script>
  
  <!-- 这部分HTML会在脚本执行完成后才解析 -->
  <p>这段文字需要等待脚本执行完才能显示</p>
</body>
</html>
```

## 2. 阻塞机制的详细说明

### DOM构建阻塞
- 浏览器的HTML解析器和JavaScript引擎共享同一主线程
- 当遇到`<script>`标签时，HTML解析器必须暂停
- 等待脚本下载、编译和执行完成

### CSSOM依赖
- JavaScript可能需要访问CSS样式信息
- 如果CSS文件正在加载，JavaScript执行会等待CSSOM构建完成
- 这是为什么CSS也被认为是渲染阻塞资源

## 3. 解决方案和优化策略

### defer属性
- **延迟执行**：脚本在DOM解析完成后、DOMContentLoaded事件之前执行
- **不阻塞DOM解析**：HTML解析可以继续进行
- **保持执行顺序**：多个defer脚本按顺序执行

```html
<script defer src="script1.js"></script>
<script defer src="script2.js"></script>
<!-- 两个脚本都会在DOM解析完成后执行，且保持顺序 -->
```

### async属性
- **异步加载**：脚本异步下载，不阻塞HTML解析
- **立即执行**：下载完成后立即执行，可能在DOM解析完成前
- **不保证顺序**：先下载完的先执行

```html
<script async src="analytics.js"></script>
<script async src="ads.js"></script>
<!-- 两个脚本异步加载，谁先下载完谁先执行 -->
```

### 动态导入
- **运行时加载**：脚本在JavaScript运行时动态加载
- **完全不阻塞**：不会影响初始页面渲染

```javascript
// 动态导入模块
import('./module.js').then(module => {
  module.doSomething();
});

// 或者使用传统方式
function loadScript(src) {
  const script = document.createElement('script');
  script.src = src;
  document.head.appendChild(script);
}
```

## 4. 不同情况下的行为对比

| 脚本类型 | 下载时机 | 执行时机 | 阻塞DOM解析 | 阻塞页面渲染 |
|---------|---------|---------|------------|------------|
| 普通脚本 | 解析到时 | 立即执行 | 是 | 是 |
| defer脚本 | 异步下载 | DOM解析完成后 | 否 | 否 |
| async脚本 | 异步下载 | 下载完成后立即执行 | 可能（执行时） | 可能（执行时） |
| 内联脚本 | 立即 | 立即执行 | 是 | 是 |
| 动态脚本 | 动态加载 | 动态执行 | 否 | 否 |

## 5. 最佳实践

### 脚本位置
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 将CSS放在head中，避免FOUC（样式闪烁） -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- 内容 -->
  <div>页面内容</div>
  
  <!-- 将脚本放在body底部 -->
  <script src="app.js"></script>
</body>
</html>
```

### 现代化方案
```html
<!-- 使用module脚本（默认defer行为） -->
<script type="module" src="app.mjs"></script>

<!-- 使用importmaps定义模块映射 -->
<script type="importmap">
{
  "imports": {
    "utils": "./utils.mjs"
  }
}
</script>
```

## 6. 性能优化建议

### 预加载关键脚本
```html
<!-- 预加载关键资源 -->
<link rel="preload" href="critical.js" as="script">
```

### 代码分割
- 将代码分割成小块，按需加载
- 使用现代打包工具（如Webpack、Vite）实现代码分割

### 压缩和缓存
- 压缩JavaScript文件大小
- 设置合适的缓存策略

JavaScript的加载和执行确实会阻塞浏览器渲染，但通过合理的加载策略（defer、async、动态加载等），我们可以最小化这种阻塞，提升页面加载性能。
