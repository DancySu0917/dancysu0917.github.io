# 介绍一下 requestIdleCallback API？（了解）

**题目**: 介绍一下 requestIdleCallback API？（了解）

**答案**:

`requestIdleCallback` 是一个浏览器 API，用于在浏览器空闲期间调度执行低优先级任务，以避免影响关键任务（如动画、用户输入响应等）的执行。

## 基本概念

`requestIdleCallback` 允许开发者在浏览器的空闲时间段执行代码，从而避免阻塞浏览器的关键操作。它会在浏览器渲染、布局、绘制等关键任务完成后，如果还有剩余时间，才执行回调函数。

## API 语法

```javascript
const handle = requestIdleCallback(callback, options);
```

### 参数说明

- `callback`: 在空闲期间执行的函数
- `options`: 可选配置对象，包含 `timeout` 属性

### 回调函数参数

回调函数接收一个 `IdleDeadline` 对象，包含以下属性：

- `timeRemaining()`: 返回当前空闲周期的剩余时间（毫秒）
- `didTimeout`: 布尔值，表示回调是否因为超时而执行

## 基本使用示例

```javascript
function myNonEssentialWork(deadline) {
    // 当有空闲时间或超时
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && tasks.length > 0) {
        // 执行一个任务
        performTask();
    }
    
    // 如果还有任务未完成，继续调度
    if (tasks.length > 0) {
        requestIdleCallback(myNonEssentialWork);
    }
}

// 开始调度非必要工作
requestIdleCallback(myNonEssentialWork);
```

## 高级使用示例

### 1. 任务优先级管理

```javascript
const taskQueue = [];

function processTasks(deadline) {
    while (deadline.timeRemaining() > 0 && taskQueue.length > 0) {
        const task = taskQueue.shift();
        task();
    }
    
    if (taskQueue.length > 0) {
        requestIdleCallback(processTasks);
    }
}

// 添加任务到队列
function addTask(task) {
    taskQueue.push(task);
    // 如果队列之前是空的，开始处理
    if (taskQueue.length === 1) {
        requestIdleCallback(processTasks);
    }
}

// 使用示例
addTask(() => console.log('Task 1'));
addTask(() => console.log('Task 2'));
addTask(() => console.log('Task 3'));
```

### 2. 带超时的空闲回调

```javascript
function urgentWork(deadline) {
    if (deadline.timeRemaining() === 0 && !deadline.didTimeout) {
        // 如果没有剩余时间且不是因为超时，推迟执行
        requestIdleCallback(urgentWork, { timeout: 1000 }); // 1秒后强制执行
        return;
    }
    
    // 执行紧急任务
    console.log('Executing urgent work');
}

// 设置1秒超时
requestIdleCallback(urgentWork, { timeout: 1000 });
```

## 实际应用场景

### 1. 数据预加载

```javascript
function preloadData(deadline) {
    while (deadline.timeRemaining() > 0 && dataQueue.length > 0) {
        const url = dataQueue.shift();
        fetch(url).then(response => response.json());
    }
    
    if (dataQueue.length > 0) {
        requestIdleCallback(preloadData);
    }
}

// 预加载数据队列
const dataQueue = ['/api/data1', '/api/data2', '/api/data3'];
requestIdleCallback(preloadData);
```

### 2. 统计数据上报

```javascript
let analyticsQueue = [];

function processAnalytics(deadline) {
    while (deadline.timeRemaining() > 0 && analyticsQueue.length > 0) {
        const event = analyticsQueue.shift();
        // 发送分析数据
        sendAnalytics(event);
    }
    
    if (analyticsQueue.length > 0) {
        requestIdleCallback(processAnalytics);
    }
}

function trackEvent(event) {
    analyticsQueue.push(event);
    // 如果队列刚开始，安排处理
    if (analyticsQueue.length === 1) {
        requestIdleCallback(processAnalytics);
    }
}
```

### 3. DOM 清理工作

```javascript
let elementsToCleanup = [];

function cleanupDOM(deadline) {
    while (deadline.timeRemaining() > 0 && elementsToCleanup.length > 0) {
        const element = elementsToCleanup.shift();
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    
    if (elementsToCleanup.length > 0) {
        requestIdleCallback(cleanupDOM);
    }
}

// 标记元素待清理
function markForCleanup(element) {
    elementsToCleanup.push(element);
    if (elementsToCleanup.length === 1) {
        requestIdleCallback(cleanupDOM);
    }
}
```

## 与相关 API 的对比

### 与 requestAnimationFrame 的区别

| 特性 | requestAnimationFrame | requestIdleCallback |
|------|----------------------|---------------------|
| 执行时机 | 下一帧开始时 | 浏览器空闲时 |
| 用途 | 动画 | 低优先级任务 |
| 执行频率 | 每帧一次（约60fps） | 不固定，取决于空闲时间 |
| 优先级 | 高 | 低 |

### 与 setTimeout/setInterval 的区别

- `setTimeout` 在指定时间后执行，不管浏览器状态
- `requestIdleCallback` 只在浏览器空闲时执行
- `requestIdleCallback` 会考虑浏览器的性能和用户交互

## 兼容性处理

```javascript
// requestIdleCallback 兼容性处理
if (!window.requestIdleCallback) {
    window.requestIdleCallback = function(callback) {
        const start = Date.now();
        return setTimeout(function() {
            callback({
                didTimeout: false,
                timeRemaining: function() {
                    return Math.max(0, 50 - (Date.now() - start));
                }
            });
        }, 1);
    };
}

if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = function(id) {
        clearTimeout(id);
    };
}
```

## 最佳实践

### 1. 检查剩余时间

```javascript
function doWork(deadline) {
    while (deadline.timeRemaining() > 0 && tasks.length > 0) {
        performTask(); // 执行任务
    }
    
    if (tasks.length > 0) {
        requestIdleCallback(doWork);
    }
}
```

### 2. 处理超时情况

```javascript
function importantWork(deadline) {
    if (deadline.didTimeout) {
        // 即使没有空闲时间也要执行
        performTask();
    } else if (deadline.timeRemaining() > 0) {
        performTask();
    } else {
        // 没有足够时间，重新调度
        requestIdleCallback(importantWork, { timeout: 1000 });
    }
}
```

## 注意事项

1. **不能保证执行时间**: 回调的执行时间取决于浏览器的空闲情况
2. **避免长时间运行**: 单次回调执行时间不应超过空闲时间
3. **考虑超时**: 对于重要任务，设置合理的超时时间
4. **兼容性**: 部分浏览器可能不支持，需要提供 polyfill

`requestIdleCallback` 是优化 Web 应用性能的重要工具，特别适合处理那些不需要立即执行的低优先级任务，从而确保关键任务的流畅执行。
