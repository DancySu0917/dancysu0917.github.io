# 比较 attachEvent 和 addEventListener?（必会）

**题目**: 比较 attachEvent 和 addEventListener?（必会）

**答案**:

## 概述

`attachEvent` 和 `addEventListener` 都是用来绑定事件处理函数的方法，但它们分别属于不同的浏览器标准，有着显著的区别。

### attachEvent
- **浏览器支持**: IE8 及以下版本
- **语法**: `element.attachEvent(event, function)`
- **事件类型前缀**: 需要添加 "on" 前缀（如 "onclick"）

### addEventListener
- **浏览器支持**: 现代浏览器（IE9+）
- **语法**: `element.addEventListener(event, function, useCapture)`
- **事件类型前缀**: 不需要添加 "on" 前缀（如 "click"）

## 详细对比

### 1. 语法差异

```javascript
// attachEvent (IE8及以下)
const button = document.getElementById('myButton');
button.attachEvent('onclick', function() {
    console.log('按钮被点击');
});

// addEventListener (现代浏览器)
const button = document.getElementById('myButton');
button.addEventListener('click', function() {
    console.log('按钮被点击');
}, false);
```

### 2. 事件类型前缀

```javascript
// attachEvent - 需要 "on" 前缀
element.attachEvent('onclick', handler);      // 正确
element.attachEvent('click', handler);        // 错误

// addEventListener - 不需要 "on" 前缀
element.addEventListener('click', handler, false);    // 正确
element.addEventListener('onclick', handler, false);  // 错误
```

### 3. 事件流处理

```javascript
// attachEvent - 只支持冒泡阶段，不支持捕获阶段
element.attachEvent('onclick', function() {
    console.log('事件处理 - 只能冒泡');
});

// addEventListener - 支持捕获和冒泡两个阶段
element.addEventListener('click', function() {
    console.log('捕获阶段处理');
}, true);  // true 表示捕获阶段

element.addEventListener('click', function() {
    console.log('冒泡阶段处理');
}, false); // false 表示冒泡阶段（默认值）
```

### 4. 事件对象处理

```javascript
// attachEvent 中的事件对象
element.attachEvent('onclick', function(e) {
    e = e || window.event;           // 标准化事件对象
    
    // 需要手动设置属性
    e.target = e.srcElement;         // target 属性
    e.currentTarget = this;          // currentTarget 属性
    e.preventDefault = function() {  // 阻止默认行为
        e.returnValue = false;
    };
    e.stopPropagation = function() { // 阻止冒泡
        e.cancelBubble = true;
    };
});

// addEventListener 中的事件对象
element.addEventListener('click', function(e) {
    // 事件对象已经包含了所有标准属性
    console.log(e.target);        // 目标元素
    console.log(e.currentTarget); // 当前处理事件的元素
    e.preventDefault();           // 阻止默认行为
    e.stopPropagation();          // 阻止事件传播
}, false);
```

### 5. 函数上下文 (this)

```javascript
// attachEvent - this 指向 window 而不是元素
element.attachEvent('onclick', function() {
    console.log(this); // window 对象
    console.log(this === window); // true
});

// addEventListener - this 指向绑定事件的元素
element.addEventListener('click', function() {
    console.log(this); // 绑定事件的元素
    console.log(this === element); // true
}, false);
```

### 6. 重复绑定处理

```javascript
function handler1() {
    console.log('处理器1');
}

function handler2() {
    console.log('处理器2');
}

// attachEvent - 允许重复绑定同一个函数
element.attachEvent('onclick', handler1);
element.attachEvent('onclick', handler1); // 会执行两次
// 点击元素时输出: "处理器1" "处理器1"

// addEventListener - 相同的函数和参数只绑定一次
element.addEventListener('click', handler1, false);
element.addEventListener('click', handler1, false); // 只绑定一次
// 点击元素时输出: "处理器1"
```

### 7. 解除事件

```javascript
function clickHandler() {
    console.log('点击处理');
}

// attachEvent - 使用 detachEvent 解除
element.attachEvent('onclick', clickHandler);
element.detachEvent('onclick', clickHandler);

// addEventListener - 使用 removeEventListener 解除
element.addEventListener('click', clickHandler, false);
element.removeEventListener('click', clickHandler, false);
```

## 兼容性处理函数

```javascript
// 跨浏览器事件处理工具
const EventUtil = {
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            // 标准浏览器
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            // IE8及以下
            element.attachEvent('on' + type, handler);
        } else {
            // 更老的浏览器
            element['on' + type] = handler;
        }
    },
    
    removeHandler: function(element, type, handler) {
        if (element.removeEventListener) {
            // 标准浏览器
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            // IE8及以下
            element.detachEvent('on' + type, handler);
        } else {
            // 更老的浏览器
            element['on' + type] = null;
        }
    },
    
    getEvent: function(event) {
        return event ? event : window.event;
    },
    
    getTarget: function(event) {
        return event.target || event.srcElement;
    },
    
    preventDefault: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    
    stopPropagation: function(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }
};

// 使用示例
const button = document.getElementById('myButton');
const handler = function(event) {
    event = EventUtil.getEvent(event);
    EventUtil.preventDefault(event);
    EventUtil.stopPropagation(event);
    console.log('跨浏览器事件处理');
};

EventUtil.addHandler(button, 'click', handler);
```

## 实际应用场景

### 1. 事件委托兼容性处理

```javascript
function addEventDelegate(parent, eventType, selector, handler) {
    function eventHandler(e) {
        e = e || window.event;
        const target = e.target || e.srcElement;
        
        // 检查目标元素是否匹配选择器
        if (target && matchesSelector(target, selector)) {
            handler.call(target, e);
        }
    }
    
    // 兼容性处理
    if (parent.addEventListener) {
        parent.addEventListener(eventType, eventHandler, false);
    } else if (parent.attachEvent) {
        parent.attachEvent('on' + eventType, function() {
            // 修复IE中的事件对象
            const event = window.event;
            event.target = event.srcElement;
            event.currentTarget = parent;
            event.preventDefault = function() { event.returnValue = false; };
            event.stopPropagation = function() { event.cancelBubble = true; };
            
            eventHandler.call(parent, event);
        });
    }
}

// 辅助函数：检查元素是否匹配选择器
function matchesSelector(element, selector) {
    if (element.matches) {
        return element.matches(selector);
    } else if (element.matchesSelector) {
        return element.matchesSelector(selector);
    } else if (element.msMatchesSelector) { // IE
        return element.msMatchesSelector(selector);
    } else if (element.webkitMatchesSelector) {
        return element.webkitMatchesSelector(selector);
    }
    // 简单实现
    const nodes = document.querySelectorAll(selector);
    return Array.prototype.indexOf.call(nodes, element) !== -1;
}
```

### 2. 现代化处理

```javascript
// 现代应用中通常不需要直接使用 attachEvent
// 但了解它有助于理解历史兼容性问题
(function() {
    // 如果浏览器不支持 addEventListener，提供 polyfill
    if (!Element.prototype.addEventListener) {
        Element.prototype.addEventListener = function(eventType, handler, useCapture) {
            // 降级到 attachEvent
            this.attachEvent('on' + eventType, function(e) {
                // 修复事件对象
                e.target = e.srcElement;
                e.currentTarget = this;
                e.preventDefault = function() { e.returnValue = false; };
                e.stopPropagation = function() { e.cancelBubble = true; };
                
                handler.call(this, e);
            });
        };
    }
    
    if (!Element.prototype.removeEventListener) {
        Element.prototype.removeEventListener = function(eventType, handler, useCapture) {
            this.detachEvent('on' + eventType, handler);
        };
    }
})();
```

## 总结

| 特性 | attachEvent | addEventListener |
|------|-------------|------------------|
| 浏览器支持 | IE8及以下 | 现代浏览器 |
| 事件前缀 | 需要 "on" | 不需要 |
| 事件流 | 只支持冒泡 | 支持捕获和冒泡 |
| this 指向 | window | 绑定元素 |
| 重复绑定 | 允许 | 阻止重复 |
| 事件对象 | 需要修复 | 标准化 |
| 标准 | 非标准 | W3C 标准 |

在现代开发中，`addEventListener` 是推荐的标准方法，而 `attachEvent` 主要用于理解历史兼容性问题。随着 IE8 及更早版本的逐渐淘汰，直接使用 `addEventListener` 已经成为主流。
