# IE 与标准事件模型有哪些差别？（了解）

**题目**: IE 与标准事件模型有哪些差别？（了解）

**答案**:

## IE 与标准事件模型的主要差别

IE 浏览器（特别是 IE8 及以下版本）与现代浏览器的标准事件模型存在显著差异，这些差异主要体现在事件绑定方法、事件对象、事件流等方面。

## 1. 事件绑定方法

### 标准事件模型 (addEventListener)
```javascript
// 现代浏览器标准方法
element.addEventListener('click', function(event) {
    console.log('点击事件');
}, false);
```

### IE 事件模型 (attachEvent)
```javascript
// IE8 及以下版本
element.attachEvent('onclick', function() {
    console.log('点击事件');
});
```

## 2. 事件对象差异

### 标准事件对象
```javascript
element.addEventListener('click', function(event) {
    console.log(event.target);        // 事件目标
    console.log(event.currentTarget); // 当前处理事件的元素
    console.log(event.preventDefault); // 阻止默认行为方法
    console.log(event.stopPropagation); // 阻止事件传播方法
});
```

### IE 事件对象
```javascript
element.attachEvent('onclick', function() {
    var event = window.event;         // IE 中通过 window.event 获取事件对象
    console.log(event.srcElement);    // IE 中的事件目标 (对应 target)
    console.log(event.preventDefault); // undefined - IE 不支持
    console.log(event.stopPropagation); // undefined - IE 不支持
});
```

## 3. 事件流处理

### 标准事件流 (捕获和冒泡)
```javascript
// 支持三个阶段：捕获 -> 目标 -> 冒泡
element.addEventListener('click', function(event) {
    console.log('捕获阶段'); // useCapture: true
}, true);

element.addEventListener('click', function(event) {
    console.log('冒泡阶段'); // useCapture: false (默认)
}, false);
```

### IE 事件流 (仅冒泡)
```javascript
// IE8 及以下只支持冒泡阶段，不支持捕获阶段
element.attachEvent('onclick', function() {
    console.log('只有冒泡阶段');
    // 无法在捕获阶段处理事件
});
```

## 4. 函数上下文 (this 指向)

### 标准事件模型
```javascript
element.addEventListener('click', function(event) {
    console.log(this === element); // true - this 指向绑定事件的元素
});
```

### IE 事件模型
```javascript
element.attachEvent('onclick', function() {
    console.log(this === window); // true - this 指向 window 对象
    console.log(this === element); // false
});
```

## 5. 事件处理函数参数

### 标准事件模型
```javascript
element.addEventListener('click', function(event) {
    // 事件对象作为参数传递
    console.log(event.type); // 'click'
    console.log(event.target); // 点击的目标元素
});
```

### IE 事件模型
```javascript
element.attachEvent('onclick', function() {
    // 需要通过 window.event 获取事件对象
    var event = window.event || arguments[0];
    console.log(event.type); // 'click'
    console.log(event.srcElement); // 点击的目标元素
});
```

## 6. 事件类型前缀

### 标准事件模型
```javascript
// 不需要 "on" 前缀
element.addEventListener('click', handler, false);
element.addEventListener('mouseover', handler, false);
element.addEventListener('focus', handler, false);
```

### IE 事件模型
```javascript
// 需要 "on" 前缀
element.attachEvent('onclick', handler);
element.attachEvent('onmouseover', handler);
element.attachEvent('onfocus', handler);
```

## 7. 重复事件绑定

### 标准事件模型
```javascript
function handler() {
    console.log('处理函数');
}

// 相同的函数和参数只绑定一次
element.addEventListener('click', handler, false);
element.addEventListener('click', handler, false); // 不会重复绑定

// 点击元素时只输出一次 "处理函数"
```

### IE 事件模型
```javascript
function handler() {
    console.log('处理函数');
}

// 允许重复绑定同一个函数
element.attachEvent('onclick', handler);
element.attachEvent('onclick', handler); // 会重复绑定

// 点击元素时输出两次 "处理函数"
```

## 8. 事件对象属性和方法

### 标准事件对象属性
```javascript
element.addEventListener('click', function(event) {
    // 常用属性
    console.log(event.target);        // 事件目标元素
    console.log(event.currentTarget); // 当前处理事件的元素
    console.log(event.type);          // 事件类型
    console.log(event.clientX);       // 鼠标X坐标
    console.log(event.clientY);       // 鼠标Y坐标
    console.log(event.bubbles);       // 是否冒泡
    console.log(event.cancelable);    // 是否可取消
    
    // 常用方法
    event.preventDefault();   // 阻止默认行为
    event.stopPropagation();  // 阻止事件传播
    event.stopImmediatePropagation(); // 阻止剩余事件处理器执行
});
```

### IE 事件对象属性
```javascript
element.attachEvent('onclick', function() {
    var event = window.event;
    
    // IE 特有属性
    console.log(event.srcElement);    // 事件目标元素 (对应 target)
    console.log(event.type);          // 事件类型
    console.log(event.clientX);       // 鼠标X坐标
    console.log(event.clientY);       // 鼠标Y坐标
    console.log(event.cancelBubble);  // 对应 stopPropagation
    console.log(event.returnValue);   // 对应 preventDefault
    
    // IE 事件方法
    event.returnValue = false;  // 阻止默认行为 (对应 preventDefault)
    event.cancelBubble = true;  // 阻止事件冒泡 (对应 stopPropagation)
});
```

## 9. 兼容性处理函数

```javascript
// 统一的事件处理工具
var EventUtil = {
    // 添加事件
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            // 标准浏览器
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            // IE
            element.attachEvent('on' + type, handler);
        } else {
            // 更老的浏览器
            element['on' + type] = handler;
        }
    },
    
    // 移除事件
    removeHandler: function(element, type, handler) {
        if (element.removeEventListener) {
            // 标准浏览器
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            // IE
            element.detachEvent('on' + type, handler);
        } else {
            // 更老的浏览器
            element['on' + type] = null;
        }
    },
    
    // 获取事件对象
    getEvent: function(event) {
        return event ? event : window.event;
    },
    
    // 获取事件目标
    getTarget: function(event) {
        return event.target || event.srcElement;
    },
    
    // 阻止默认行为
    preventDefault: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    
    // 阻止事件冒泡
    stopPropagation: function(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }
};

// 使用示例
var button = document.getElementById('myButton');
var clickHandler = function(event) {
    event = EventUtil.getEvent(event);
    var target = EventUtil.getTarget(event);
    
    console.log('点击了:', target.tagName);
    
    EventUtil.preventDefault(event);
    EventUtil.stopPropagation(event);
};

EventUtil.addHandler(button, 'click', clickHandler);
```

## 10. 事件委托处理差异

### 标准事件模型的事件委托
```javascript
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('button')) {
        console.log('按钮被点击:', event.target.textContent);
    }
}, false);
```

### IE 事件模型的事件委托
```javascript
document.attachEvent('onclick', function() {
    var event = window.event;
    var target = event.srcElement;
    
    if (target.className.indexOf('button') !== -1) {
        console.log('按钮被点击:', target.textContent);
    }
});
```

## 总结对比表

| 特性 | 标准事件模型 | IE 事件模型 |
|------|--------------|-------------|
| 绑定方法 | addEventListener | attachEvent |
| 解除方法 | removeEventListener | detachEvent |
| 事件前缀 | 不需要 "on" | 需要 "on" |
| 事件流 | 支持捕获和冒泡 | 仅支持冒泡 |
| this 指向 | 绑定元素 | window 对象 |
| 事件对象 | 作为参数传递 | window.event |
| 重复绑定 | 不允许 | 允许 |
| preventDefault | 方法 | returnValue 属性 |
| stopPropagation | 方法 | cancelBubble 属性 |
| target 属性 | target | srcElement |

随着 IE8 及更早版本的逐渐淘汰，现代 Web 开发主要使用标准事件模型，但了解这些差异对于理解历史兼容性问题和维护旧代码仍然很重要。
