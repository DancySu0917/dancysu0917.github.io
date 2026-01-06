# event 对象的常见应用？（必会）

**题目**: event 对象的常见应用？（必会）

**答案**:

## Event 对象概述

Event 对象是 DOM 事件系统中的核心对象，当事件被触发时，浏览器会自动创建一个 Event 对象并将其作为参数传递给事件处理函数。Event 对象包含了事件的详细信息和操作方法。

## Event 对象的常见属性

### 1. target 和 currentTarget
```javascript
document.getElementById('container').addEventListener('click', function(event) {
    console.log('target:', event.target);       // 实际触发事件的元素
    console.log('currentTarget:', event.currentTarget); // 绑定事件的元素
});

// HTML: <div id="container"><button id="btn">点击</button></div>
// 点击按钮时：
// target: <button id="btn">
// currentTarget: <div id="container">
```

### 2. type
```javascript
element.addEventListener('click', function(event) {
    console.log('事件类型:', event.type); // 'click'
});

element.addEventListener('mouseover', function(event) {
    console.log('事件类型:', event.type); // 'mouseover'
});
```

### 3. bubbles
```javascript
element.addEventListener('click', function(event) {
    console.log('是否冒泡:', event.bubbles); // true
});

element.addEventListener('focus', function(event) {
    console.log('是否冒泡:', event.bubbles); // false
});
```

### 4. cancelable
```javascript
element.addEventListener('click', function(event) {
    console.log('是否可取消:', event.cancelable); // true
});

element.addEventListener('load', function(event) {
    console.log('是否可取消:', event.cancelable); // false
});
```

## Event 对象的常用方法

### 1. preventDefault()
```javascript
// 阻止链接的默认跳转行为
document.getElementById('myLink').addEventListener('click', function(event) {
    event.preventDefault();
    console.log('链接点击被阻止');
    // 执行自定义逻辑
});

// 阻止表单的默认提交行为
document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('表单提交被阻止');
    // 执行自定义提交逻辑
});

// 阻止右键菜单
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    console.log('右键菜单被阻止');
});
```

### 2. stopPropagation()
```javascript
// 阻止事件冒泡
document.getElementById('inner').addEventListener('click', function(event) {
    console.log('内层元素被点击');
    event.stopPropagation(); // 阻止事件冒泡到父元素
});

document.getElementById('outer').addEventListener('click', function(event) {
    console.log('外层元素被点击');
});

// 点击内层元素时，只会输出"内层元素被点击"
```

### 3. stopImmediatePropagation()
```javascript
// 不仅阻止冒泡，还阻止同级其他事件处理器执行
element.addEventListener('click', function(event) {
    console.log('第一个事件处理器');
    event.stopImmediatePropagation();
});

element.addEventListener('click', function(event) {
    console.log('第二个事件处理器'); // 不会执行
});

// 输出：第一个事件处理器
```

## 事件对象的高级应用

### 1. 事件委托中的应用
```javascript
// 利用事件对象实现事件委托
document.getElementById('list').addEventListener('click', function(event) {
    // 通过事件对象判断实际点击的元素
    if (event.target.tagName === 'LI') {
        console.log('列表项被点击:', event.target.textContent);
    }
});

// 动态添加的元素也具有点击功能
function addListItem() {
    const newItem = document.createElement('li');
    newItem.textContent = '新项目';
    document.getElementById('list').appendChild(newItem);
    // 无需为新元素单独绑定事件
}
```

### 2. 键盘事件的应用
```javascript
document.addEventListener('keydown', function(event) {
    console.log('按键代码:', event.keyCode || event.key);
    console.log('是否按下 Ctrl:', event.ctrlKey);
    console.log('是否按下 Shift:', event.shiftKey);
    console.log('是否按下 Alt:', event.altKey);
    
    // ESC 键关闭模态框
    if (event.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl+S 保存文档
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveDocument();
    }
});
```

### 3. 鼠标事件的应用
```javascript
let startX, startY;

document.addEventListener('mousedown', function(event) {
    startX = event.clientX;
    startY = event.clientY;
    console.log('鼠标按下位置:', startX, startY);
});

document.addEventListener('mouseup', function(event) {
    const endX = event.clientX;
    const endY = event.clientY;
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    console.log('鼠标拖拽距离:', distance);
});

// 获取鼠标相对于元素的位置
function getRelativePosition(element, event) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
}
```

### 4. 自定义事件
```javascript
// 创建自定义事件
const customEvent = new CustomEvent('customEvent', {
    detail: { message: '自定义事件数据' },
    bubbles: true,
    cancelable: true
});

// 监听自定义事件
document.addEventListener('customEvent', function(event) {
    console.log('自定义事件触发:', event.detail.message);
});

// 触发自定义事件
document.dispatchEvent(customEvent);
```

## 事件对象的兼容性处理

### 1. 事件对象获取
```javascript
function handleEvent(event) {
    // 现代浏览器
    event = event || window.event; // IE8 及以下版本
    return event;
}
```

### 2. 事件目标获取
```javascript
function getEventTarget(event) {
    // 现代浏览器
    return event.target || 
           // IE8 及以下版本
           event.srcElement;
}
```

### 3. 事件方法兼容性
```javascript
function stopEvent(event) {
    // 阻止默认行为
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        // IE8 及以下版本
        event.returnValue = false;
    }
    
    // 阻止冒泡
    if (event.stopPropagation) {
        event.stopPropagation();
    } else {
        // IE8 及以下版本
        event.cancelBubble = true;
    }
}
```

## 实际应用场景

### 1. 表单验证
```javascript
document.getElementById('emailInput').addEventListener('blur', function(event) {
    const email = event.target.value;
    if (!isValidEmail(email)) {
        event.target.classList.add('error');
        showError('请输入有效的邮箱地址');
        event.preventDefault(); // 在 blur 事件中通常不使用
    }
});
```

### 2. 拖拽功能
```javascript
let isDragging = false;
let dragElement;

document.addEventListener('mousedown', function(event) {
    if (event.target.classList.contains('draggable')) {
        isDragging = true;
        dragElement = event.target;
        event.target.classList.add('dragging');
    }
});

document.addEventListener('mousemove', function(event) {
    if (isDragging && dragElement) {
        dragElement.style.left = event.clientX + 'px';
        dragElement.style.top = event.clientY + 'px';
    }
});

document.addEventListener('mouseup', function(event) {
    if (isDragging) {
        isDragging = false;
        dragElement.classList.remove('dragging');
        dragElement = null;
    }
});
```

### 3. 轮播图控制
```javascript
document.getElementById('carousel').addEventListener('click', function(event) {
    if (event.target.classList.contains('prev-btn')) {
        event.preventDefault();
        showPrevSlide();
    } else if (event.target.classList.contains('next-btn')) {
        event.preventDefault();
        showNextSlide();
    }
});
```

## 性能优化考虑

### 1. 事件对象的合理使用
```javascript
// 避免不必要的事件对象属性访问
function handleClick(event) {
    // 只访问需要的属性
    const target = event.target;
    if (target.classList.contains('button')) {
        // 处理逻辑
    }
}
```

### 2. 事件委托优化
```javascript
// 使用事件委托减少事件监听器数量
document.getElementById('container').addEventListener('click', function(event) {
    // 通过事件对象判断目标元素
    if (event.target.matches('.item')) {
        handleItemClick(event.target);
    }
});
```

Event 对象是 JavaScript 事件处理的核心，掌握其属性和方法对于开发交互式 Web 应用至关重要。通过合理使用 Event 对象，可以实现复杂的交互逻辑和优化应用性能。
