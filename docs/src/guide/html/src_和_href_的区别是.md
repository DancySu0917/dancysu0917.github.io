# src 和 href 的区别是？（了解）

**题目**: src 和 href 的区别是？（了解）

**答案**:

`src` 和 `href` 是 HTML 中两个重要的属性，它们的主要区别如下：

## 1. 基本定义

### src (Source)
- **含义**：表示资源的来源，用于指定外部资源的 URL
- **作用**：将外部资源嵌入到当前文档中，浏览器会下载并执行该资源
- **使用场景**：`<img>`, `<script>`, `<iframe>`, `<audio>`, `<video>`, `<source>` 等

### href (Hypertext Reference)
- **含义**：表示超文本引用，用于建立当前文档与引用资源之间的链接关系
- **作用**：创建一个链接，指向另一个资源，不会直接嵌入到当前文档
- **使用场景**：`<a>`, `<link>`, `<area>`, `<base>` 等

## 2. 处理方式的区别

### src 的处理方式
```html
<!-- 浏览器会下载并执行 script.js -->
<script src="script.js"></script>

<!-- 浏览器会下载并显示图片 -->
<img src="image.jpg" alt="描述">

<!-- 浏览器会下载并嵌入 iframe 内容 -->
<iframe src="page.html"></iframe>
```

- 浏览器会立即下载并执行/嵌入 `src` 指定的资源
- 资源会被直接插入到当前文档流中
- 对于脚本，会阻塞页面解析（除非使用 async 或 defer）

### href 的处理方式
```html
<!-- 创建一个指向 example.com 的链接 -->
<a href="https://example.com">链接文本</a>

<!-- 链接外部样式表，不阻塞页面渲染 -->
<link rel="stylesheet" href="style.css">

<!-- 链接页面中的锚点 -->
<a href="#section1">跳转到章节1</a>
```

- 建立链接关系，但不会立即加载资源（除非用户点击）
- 资源不会直接嵌入到当前文档中
- 通常用于导航或建立文档关系

## 3. 具体元素中的使用

### 在 `<script>` 标签中
```html
<!-- 使用 src -->
<script src="app.js"></script>
<!-- 浏览器会下载并执行 app.js -->

<!-- 直接在页面中写脚本（不使用 src） -->
<script>
  console.log('直接写在页面中的脚本');
</script>
```

### 在 `<link>` 标签中
```html
<!-- 使用 href 链接外部 CSS -->
<link rel="stylesheet" href="style.css">

<!-- 链接其他资源 -->
<link rel="icon" href="favicon.ico">
<link rel="canonical" href="https://example.com/page">
```

### 在 `<img>` 标签中
```html
<!-- 使用 src 加载图片 -->
<img src="photo.jpg" alt="照片">
<!-- 图片会直接显示在页面上 -->
```

## 4. 加载时机和性能影响

### src 属性
- **立即加载**：当浏览器解析到带有 `src` 的元素时，会立即开始下载资源
- **阻塞行为**：某些元素（如 `<script>`）会阻塞页面解析
- **资源嵌入**：资源内容会成为当前文档的一部分

### href 属性
- **按需加载**：通常只在用户交互时（如点击链接）才加载资源
- **非阻塞**：大多数情况下不会阻塞页面解析（如 `<link>` 标签）
- **建立关系**：只是建立文档间的链接关系

## 5. 常见应用场景对比

| 元素 | 属性 | 用途 | 示例 |
|------|------|------|------|
| `<script>` | `src` | 加载外部 JavaScript 文件 | `<script src="main.js"></script>` |
| `<a>` | `href` | 创建超链接 | `<a href="about.html">关于我们</a>` |
| `<img>` | `src` | 显示图片 | `<img src="logo.png" alt="Logo">` |
| `<link>` | `href` | 链接外部资源（CSS、图标等） | `<link rel="stylesheet" href="style.css">` |
| `<iframe>` | `src` | 嵌入其他页面 | `<iframe src="content.html"></iframe>` |

## 6. 实际开发中的注意事项

### 性能优化
- 对于 `<script>` 标签，考虑使用 `async` 或 `defer` 属性来优化加载
- 对于 `<link>` 标签，可以使用 `rel="preload"` 来预加载关键资源

### SEO 考虑
- 正确使用 `href` 属性有助于搜索引擎理解页面结构
- 避免滥用 `src` 属性加载不必要的资源

### 可访问性
- `href` 链接应提供有意义的链接文本
- `src` 指定的媒体资源应提供适当的替代文本（如 `alt` 属性）

## 7. 总结

| 特征 | src | href |
|------|-----|------|
| 含义 | 资源来源 | 超文本引用 |
| 作用 | 嵌入资源到当前文档 | 建立链接关系 |
| 加载时机 | 立即加载 | 按需加载（通常） |
| 阻塞行为 | 可能阻塞解析 | 通常不阻塞 |
| 使用元素 | `<img>`, `<script>`, `<iframe>` 等 | `<a>`, `<link>`, `<area>` 等 |

简单来说，`src` 是"把东西拿过来放在当前页面"，而 `href` 是"告诉用户/浏览器这个东西在哪里"。理解这个区别对于正确使用 HTML 标签和优化页面性能非常重要。
