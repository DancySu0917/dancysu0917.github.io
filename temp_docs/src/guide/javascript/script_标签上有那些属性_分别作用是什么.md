# script 标签上有那些属性，分别作用是什么？（了解）

**题目**: script 标签上有那些属性，分别作用是什么？（了解）

**答案**:

HTML 的 `<script>` 标签有多个属性，用于控制脚本的加载和执行行为。以下是主要的属性及其作用：

## 1. src
- **作用**：指定外部 JavaScript 文件的 URL 地址
- **示例**：
```html
<script src="./js/main.js"></script>
```

## 2. type
- **作用**：定义脚本的 MIME 类型
- **常见值**：
  - `text/javascript`（默认值，可省略）
  - `module`（ES6 模块）
  - `application/json`（用于 JSON 配置）
- **示例**：
```html
<script type="module" src="./js/app.js"></script>
<script type="application/json" id="config">
  {"apiUrl": "https://api.example.com"}
</script>
```

## 3. async
- **作用**：异步加载脚本，下载完成后立即执行，不阻塞页面解析
- **特点**：
  - 只对外部脚本有效（有 src 属性）
  - 脚本执行顺序无法保证
  - 适用于独立的第三方脚本
- **示例**：
```html
<script async src="./js/analytics.js"></script>
```

## 4. defer
- **作用**：延迟执行脚本，页面解析完成后按顺序执行
- **特点**：
  - 只对外部脚本有效
  - 脚本按顺序执行
  - 适用于依赖 DOM 的脚本
- **示例**：
```html
<script defer src="./js/main.js"></script>
```

## 5. crossorigin
- **作用**：设置跨域请求的策略
- **常见值**：
  - `anonymous`：跨域请求不携带凭据
  - `use-credentials`：跨域请求携带凭据
- **示例**：
```html
<script src="https://cdn.example.com/lib.js" crossorigin="anonymous"></script>
```

## 6. integrity
- **作用**：提供 SRI（Subresource Integrity）校验，确保资源完整性
- **示例**：
```html
<script src="https://cdn.example.com/lib.js" 
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"></script>
```

## 7. nomodule
- **作用**：在不支持 ES6 模块的浏览器中执行
- **示例**：
```html
<script type="module" src="./es6-module.js"></script>
<script nomodule src="./legacy-bundle.js"></script>
```

## 8. referrerpolicy
- **作用**：设置请求的引用页策略
- **常见值**：
  - `no-referrer`
  - `origin`
  - `strict-origin-when-cross-origin`
- **示例**：
```html
<script src="./js/tracking.js" referrerpolicy="no-referrer"></script>
```

## 9. nonce
- **作用**：用于 CSP（Content Security Policy）的随机数
- **示例**：
```html
<script nonce="abc123">
  // 内联脚本
</script>
```

## 10. charset
- **作用**：指定外部脚本文件的字符编码（已废弃，不推荐使用）
- **示例**：
```html
<script src="./js/script.js" charset="utf-8"></script>
```

## 11. language
- **作用**：指定脚本语言（已废弃，不推荐使用）
- **示例**：
```html
<script language="javascript">
  // 代码
</script>
```

## async vs defer 对比

| 属性 | 下载时机 | 执行时机 | 执行顺序 | 适用场景 |
|------|----------|----------|----------|----------|
| async | 并行下载 | 下载完成立即执行 | 不保证 | 独立脚本，如分析工具 |
| defer | 并行下载 | 页面解析完成后 | 按顺序 | 依赖 DOM 的脚本 |

## 实际应用建议

1. **外部脚本**：使用 `async` 或 `defer` 避免阻塞页面渲染
2. **模块脚本**：使用 `type="module"` 享受 ES6 模块功能
3. **安全性**：对 CDN 资源使用 `integrity` 属性
4. **兼容性**：使用 `nomodule` 提供降级方案