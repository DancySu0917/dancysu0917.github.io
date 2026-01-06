# JS 放在 head 里和放在 body 里有什么区别？（了解）

**题目**: JS 放在 head 里和放在 body 里有什么区别？（了解）

**答案**:

将JavaScript代码放在HTML文档的不同位置（head vs body）会对页面加载和执行产生重要影响：

## 放在 `<head>` 中的特点：

### 优点：
- 脚本在页面内容渲染前加载，确保脚本可用
- 适用于必须在页面渲染前执行的初始化脚本
- 避免DOM元素不存在时的错误

### 缺点：
- 阻塞页面渲染（HTML解析）
- 用户看到空白页面的时间更长
- 影响页面加载速度和用户体验

```html
<!DOCTYPE html>
<html>
<head>
  <title>JS in Head Example</title>
  <!-- JS在head中会阻塞页面渲染 -->
  <script src="script.js"></script>
</head>
<body>
  <h1>页面内容</h1>
  <p>这会在JS执行完后才显示</p>
</body>
</html>
```

## 放在 `<body>` 结尾的特点：

### 优点：
- 不阻塞页面渲染，用户能更快看到内容
- 提升页面加载感知速度
- DOM元素已存在，可直接操作

### 缺点：
- 脚本执行时机较晚
- 如果有依赖关系，可能需要额外处理

```html
<!DOCTYPE html>
<html>
<head>
  <title>JS in Body Example</title>
</head>
<body>
  <h1>页面内容</h1>
  <p>这会立即显示给用户</p>
  
  <!-- JS在body底部，不阻塞渲染 -->
  <script src="script.js"></script>
</body>
</html>
```

## 现代最佳实践：

### 1. 使用 `defer` 属性
```html
<head>
  <script src="script.js" defer></script>
</head>
```
- 脚本延迟执行，在DOM解析完成后执行
- 不阻塞HTML解析
- 保持执行顺序

### 2. 使用 `async` 属性
```html
<head>
  <script src="script.js" async></script>
</head>
```
- 脚本异步加载，加载完成后立即执行
- 不阻塞HTML解析
- 执行顺序不确定

### 3. DOMContentLoaded 事件
```javascript
document.addEventListener('DOMContentLoaded', function() {
  // DOM完全加载和解析后执行
  console.log('DOM ready');
});
```

## 总结：
- **放在head**：适合必须在渲染前执行的脚本，但会影响性能
- **放在body底部**：提升用户体验，推荐用于大多数脚本
- **现代推荐**：使用 `defer` 属性，既能放在head中又不阻塞渲染
