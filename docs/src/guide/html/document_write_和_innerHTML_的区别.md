# document.write 和 innerHTML 的区别？（必会）

**题目**: document.write 和 innerHTML 的区别？（必会）

## 答案

`document.write` 和 `innerHTML` 都可以用来向页面中添加内容，但它们有本质的区别：

### 1. 作用对象不同

#### document.write
- 作用于整个文档（document）
- 直接写入到HTML文档流中

#### innerHTML
- 作用于特定的DOM元素
- 修改指定元素的内部HTML内容

### 2. 执行时机

#### document.write
- 在页面加载过程中执行（<head>或<body>中）
- 如果在页面加载完成后执行，会覆盖整个页面
- 只能在页面完全加载前使用

#### innerHTML
- 可以在任何时候使用
- 页面加载完成后依然可以安全使用
- 不会影响其他页面内容

### 3. 对页面的影响

#### document.write
- 如果在页面加载完成后使用，会调用`document.open()`，清除整个页面内容
- 用新内容替换整个页面
- 可能导致页面重新渲染

#### innerHTML
- 只修改指定元素的内容
- 不会影响页面其他部分
- 更精确的控制

### 4. 性能差异

#### document.write
- 在页面加载过程中使用时性能较好
- 但在页面加载完成后使用会导致性能问题（重置整个页面）

#### innerHTML
- 性能相对较好
- 但频繁修改大量内容时可能导致重排重绘
- 可以针对特定元素进行优化

### 5. 安全性

#### document.write
- 容易受到XSS攻击
- 无法对内容进行过滤

#### innerHTML
- 同样存在XSS风险
- 但可以更容易地进行内容验证和过滤

### 6. 代码示例

#### document.write示例
```javascript
// 页面加载过程中使用
document.write('<p>Hello World</p>');

// 页面加载完成后使用（危险！）
// window.onload = function() {
//     document.write('This will clear the entire page!');
// };
```

#### innerHTML示例
```javascript
// 安全地修改特定元素
const element = document.getElementById('myDiv');
element.innerHTML = '<p>Hello World</p>';

// 页面加载完成后依然可以安全使用
window.onload = function() {
    const element = document.getElementById('myDiv');
    element.innerHTML = '<p>Safe to use after page load</p>';
};
```

### 7. 使用场景

#### document.write适用场景
- 在页面加载过程中动态生成内容
- 与外部脚本配合使用
- 简单的页面内容生成

#### innerHTML适用场景
- 动态更新页面特定区域
- 模板渲染
- AJAX响应内容更新
- 组件内容更新

### 8. 现代开发建议

- 现代前端开发中，推荐使用DOM方法如`createElement`、`appendChild`等
- 或使用现代框架（React、Vue、Angular等）进行内容更新
- 避免使用`document.write`，因为它会带来不可预测的行为
- 使用`innerHTML`时要注意内容的安全性，避免XSS攻击

总的来说，`innerHTML`更加安全和可控，是现代Web开发中的推荐选择。
