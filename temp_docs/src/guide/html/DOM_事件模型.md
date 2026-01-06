# DOM 事件模型？（必会）

**题目**: DOM 事件模型？（必会）

**答案**:

DOM 事件模型描述了事件在文档对象模型中的传播方式，主要包括三个阶段和两种事件绑定方式：

## 1. DOM 事件传播的三个阶段

### 1.1 事件捕获阶段 (Capture Phase)
- 事件从 `window` 对象开始，逐级向下传播到目标元素
- 事件沿着 DOM 树从外向内传播
- 在这个阶段，祖先元素可以捕获到事件

### 1.2 目标阶段 (Target Phase)
- 事件到达目标元素本身
- 这是事件处理的核心阶段
- 目标元素处理事件

### 1.3 事件冒泡阶段 (Bubbling Phase)
- 事件从目标元素开始，逐级向上传播到 `window` 对象
- 事件沿着 DOM 树从内向外传播
- 祖先元素可以处理冒泡上来的事件

```javascript
// 示例：事件传播演示
document.getElementById('outer').addEventListener('click', function() {
    console.log('外层元素 - 捕获阶段');
}, true); // true 表示在捕获阶段监听

document.getElementById('inner').addEventListener('click', function() {
    console.log('目标元素 - 目标阶段');
});

document.getElementById('outer').addEventListener('click', function() {
    console.log('外层元素 - 冒泡阶段');
}, false); // false 表示在冒泡阶段监听
```

## 2. 事件绑定方式

### 2.1 HTML 事件处理程序（内联事件）
```html
<button onclick="alert('Hello World!')">点击我</button>
```

**优点**：
- 简单直观
- 浏览器支持好

**缺点**：
- HTML 与 JavaScript 耦合
- 不利于维护
- 作用域问题

### 2.2 DOM0 级事件处理程序
```javascript
const button = document.getElementById('myButton');
button.onclick = function() {
    console.log('按钮被点击了');
};

// 移除事件
button.onclick = null;
```

**优点**：
- 简单易用
- 兼容性好

**缺点**：
- 一个事件只能绑定一个处理函数
- 无法控制事件阶段

### 2.3 DOM2 级事件处理程序（addEventListener）
```javascript
const button = document.getElementById('myButton');

// 添加事件监听器
button.addEventListener('click', function() {
    console.log('按钮被点击了');
}, false); // 第三个参数：false 表示冒泡阶段，true 表示捕获阶段

// 可以添加多个相同事件的监听器
button.addEventListener('click', function() {
    console.log('另一个点击事件');
}, false);

// 移除事件监听器
const clickHandler = function() {
    console.log('点击事件');
};
button.addEventListener('click', clickHandler);
button.removeEventListener('click', clickHandler);
```

## 3. 事件对象 (Event Object)

当事件触发时，会创建一个事件对象，包含事件的详细信息：

```javascript
element.addEventListener('click', function(event) {
    console.log(event.type);        // 事件类型，如 'click'
    console.log(event.target);      // 触发事件的元素
    console.log(event.currentTarget); // 当前处理事件的元素
    console.log(event.clientX);     // 鼠标 X 坐标
    console.log(event.clientY);     // 鼠标 Y 坐标
});
```

### 常用事件对象属性和方法：

| 属性/方法 | 说明 |
|-----------|------|
| `type` | 事件类型 |
| `target` | 事件的实际目标元素 |
| `currentTarget` | 当前处理事件的元素 |
| `bubbles` | 事件是否冒泡 |
| `cancelable` | 事件是否可取消 |
| `preventDefault()` | 阻止默认行为 |
| `stopPropagation()` | 阻止事件传播 |
| `stopImmediatePropagation()` | 阻止剩余事件处理器调用 |

## 4. 事件阻止方法

### 4.1 阻止默认行为
```javascript
formElement.addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单默认提交行为
    // 自定义处理逻辑
});
```

### 4.2 阻止事件传播
```javascript
// 阻止事件冒泡或捕获
element.addEventListener('click', function(event) {
    event.stopPropagation();
    // 事件不会继续传播到父元素
});

// 阻止同一元素的其他事件处理器执行
element.addEventListener('click', function(event) {
    event.stopImmediatePropagation();
    // 不仅阻止传播，还阻止同级其他事件处理器
});
```

## 5. 事件委托 (Event Delegation)

利用事件冒泡机制，将事件处理器绑定到父元素上：

```javascript
// 事件委托示例
document.getElementById('list').addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
        console.log('列表项被点击:', event.target.textContent);
    }
});

// 适用于动态添加的元素
function addItem() {
    const newItem = document.createElement('li');
    newItem.textContent = '新项目';
    document.getElementById('list').appendChild(newItem);
    // 不需要为新项目单独添加事件监听器
}
```

## 6. 常见事件类型

| 事件类型 | 说明 |
|----------|------|
| `click` | 鼠标点击 |
| `mouseover` | 鼠标悬停 |
| `mouseout` | 鼠标离开 |
| `keydown` | 键盘按下 |
| `keyup` | 键盘释放 |
| `focus` | 元素获得焦点 |
| `blur` | 元素失去焦点 |
| `load` | 页面或资源加载完成 |
| `submit` | 表单提交 |

## 7. 事件处理最佳实践

### 7.1 选择合适的事件绑定方式
- 现代开发推荐使用 `addEventListener`
- 避免内联事件处理程序
- 合理使用事件委托

### 7.2 内存管理
```javascript
// 记住移除事件监听器以避免内存泄漏
const handler = function() {
    // 处理逻辑
};
element.addEventListener('click', handler);

// 在适当时候移除
element.removeEventListener('click', handler);
```

### 7.3 性能优化
- 对于频繁触发的事件（如 scroll、resize），使用节流或防抖
- 使用事件委托减少事件监听器数量

```javascript
// 防抖示例
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

window.addEventListener('resize', debounce(function() {
    console.log('窗口大小改变');
}, 300));
```

DOM 事件模型是前端开发的基础知识，理解事件传播机制对于正确处理用户交互和优化性能至关重要。
