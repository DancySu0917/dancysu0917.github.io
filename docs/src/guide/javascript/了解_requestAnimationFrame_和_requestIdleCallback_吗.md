# 了解 requestAnimationFrame 和 requestIdleCallback 吗？（了解）

## 标准答案

**requestAnimationFrame (rAF)** 是浏览器提供的API，用于在浏览器下次重绘之前调度动画帧回调，确保动画与屏幕刷新率同步，通常为60Hz（每秒60帧），从而实现流畅的动画效果。

**requestIdleCallback (rIC)** 是浏览器提供的API，用于在浏览器空闲期间调度低优先级任务，允许开发者在浏览器不忙于关键任务（如渲染、用户交互）时执行非关键工作。

两者都用于优化性能，rAF用于动画渲染，rIC用于非关键任务处理，避免阻塞主线程。

## 深入分析

### 1. requestAnimationFrame (rAF) 深入理解

requestAnimationFrame是浏览器为动画专门提供的API，其核心优势在于：
- 自动调节到显示器的刷新率（通常是60Hz）
- 浏览器会在重绘前执行回调函数
- 当标签页不可见时会自动暂停，节省性能

### 2. requestIdleCallback (rIC) 深入理解

requestIdleCallback允许开发者在浏览器空闲时执行任务，其特点包括：
- 传递的回调函数会在浏览器空闲时执行
- 可设置超时时间，确保任务在指定时间内执行
- 有助于避免阻塞用户界面的关键操作

### 3. 两者的主要区别

| 特性 | requestAnimationFrame | requestIdleCallback |
|------|----------------------|-------------------|
| 主要用途 | 动画渲染 | 低优先级任务 |
| 执行时机 | 下次重绘前 | 浏览器空闲时 |
| 执行频率 | 通常60fps | 不固定，取决于空闲时间 |
| 页面不可见时 | 暂停 | 可继续执行 |
| 浏览器兼容性 | 好 | 部分浏览器不支持 |

## 代码实现

### 1. requestAnimationFrame 基础用法

```javascript
// 简单的动画示例
function animateElement(element, start, end, duration) {
  const startTime = performance.now();
  
  function animationStep(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 计算当前位置
    const currentPosition = start + (end - start) * progress;
    
    // 更新元素位置
    element.style.transform = `translateX(${currentPosition}px)`;
    
    // 如果动画未完成，继续执行
    if (progress < 1) {
      requestAnimationFrame(animationStep);
    }
  }
  
  requestAnimationFrame(animationStep);
}

// 使用示例
const element = document.getElementById('animated-box');
animateElement(element, 0, 300, 2000); // 2秒内从0移动到300px
```

### 2. requestAnimationFrame 高级动画

```javascript
// 复杂动画系统
class AnimationSystem {
  constructor() {
    this.animations = new Map();
    this.isRunning = false;
    this.lastTime = 0;
  }
  
  // 添加动画
  addAnimation(id, animationFn) {
    this.animations.set(id, {
      fn: animationFn,
      active: true
    });
    
    if (!this.isRunning) {
      this.start();
    }
  }
  
  // 移除动画
  removeAnimation(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.active = false;
      this.animations.delete(id);
    }
    
    if (this.animations.size === 0) {
      this.isRunning = false;
    }
  }
  
  // 开始动画循环
  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animateLoop(this.lastTime);
  }
  
  // 动画循环
  animateLoop(currentTime) {
    if (!this.isRunning) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // 执行所有活跃的动画
    for (let [id, animation] of this.animations) {
      if (animation.active) {
        animation.fn(deltaTime, currentTime);
      } else {
        this.animations.delete(id);
      }
    }
    
    if (this.animations.size > 0) {
      requestAnimationFrame(this.animateLoop.bind(this));
    } else {
      this.isRunning = false;
    }
  }
  
  // 暂停所有动画
  pause() {
    this.isRunning = false;
  }
  
  // 恢复动画
  resume() {
    if (!this.isRunning && this.animations.size > 0) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animateLoop(this.lastTime);
    }
  }
}

// 使用示例
const animationSystem = new AnimationSystem();

// 创建一个旋转动画
function createRotationAnimation(element) {
  let rotation = 0;
  
  return function(deltaTime, currentTime) {
    rotation += 0.1;
    element.style.transform = `rotate(${rotation}deg)`;
  };
}

const rotatingElement = document.getElementById('rotating-box');
animationSystem.addAnimation('rotation', createRotationAnimation(rotatingElement));
```

### 3. requestIdleCallback 基础用法

```javascript
// requestIdleCallback 基础示例
function performIdleWork(deadline) {
  // 在有空闲时间时执行工作
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    // 执行一个任务
    const task = tasks.shift();
    task();
  }
  
  // 如果还有任务，继续调度
  if (tasks.length > 0) {
    requestIdleCallback(performIdleWork);
  }
}

// 示例任务队列
const tasks = [
  () => console.log('执行任务1'),
  () => console.log('执行任务2'),
  () => console.log('执行任务3')
];

// 开始处理空闲任务
requestIdleCallback(performIdleWork);

// 带超时的空闲回调
function performImportantIdleWork(deadline) {
  // 检查是否超时
  if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
    // 执行重要任务
    console.log('执行重要空闲任务');
  }
}

// 设置超时时间（5秒后强制执行）
requestIdleCallback(performImportantIdleWork, { timeout: 5000 });
```

### 4. requestIdleCallback 实际应用

```javascript
// 使用 requestIdleCallback 进行数据预加载
class DataLoader {
  constructor() {
    this.dataQueue = [];
    this.isLoading = false;
  }
  
  // 添加数据加载任务
  addLoadTask(url, callback) {
    this.dataQueue.push({ url, callback });
    
    if (!this.isLoading) {
      this.startLoading();
    }
  }
  
  // 开始加载数据
  startLoading() {
    this.isLoading = true;
    requestIdleCallback(this.processQueue.bind(this));
  }
  
  // 处理队列中的数据加载
  processQueue(deadline) {
    while (deadline.timeRemaining() > 10 && this.dataQueue.length > 0) {
      const task = this.dataQueue.shift();
      this.loadSingleData(task.url, task.callback);
    }
    
    if (this.dataQueue.length > 0) {
      requestIdleCallback(this.processQueue.bind(this));
    } else {
      this.isLoading = false;
    }
  }
  
  // 加载单个数据
  async loadSingleData(url, callback) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      callback(data);
    } catch (error) {
      console.error('数据加载失败:', error);
    }
  }
}

// 使用示例
const dataLoader = new DataLoader();

// 添加多个数据加载任务
dataLoader.addLoadTask('/api/user-profile', (data) => {
  console.log('用户数据加载完成:', data);
});

dataLoader.addLoadTask('/api/recent-activity', (data) => {
  console.log('活动数据加载完成:', data);
});
```

### 5. 结合使用 rAF 和 rIC 的性能优化

```javascript
// 结合 rAF 和 rIC 的性能优化系统
class PerformanceOptimizer {
  constructor() {
    this.animationTasks = [];
    this.idleTasks = [];
    this.isRunning = false;
    this.lastTime = 0;
  }
  
  // 添加动画任务
  addAnimationTask(task) {
    this.animationTasks.push(task);
    this.startIfNeeded();
  }
  
  // 添加空闲任务
  addIdleTask(task, priority = 'low') {
    this.idleTasks.push({ task, priority, timestamp: Date.now() });
  }
  
  // 开始运行
  startIfNeeded() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.runLoop(this.lastTime);
    }
  }
  
  // 主循环
  runLoop(currentTime) {
    if (!this.isRunning) return;
    
    // 执行动画任务
    this.executeAnimationTasks(currentTime);
    
    // 调度空闲任务
    if (this.idleTasks.length > 0) {
      requestIdleCallback(this.executeIdleTasks.bind(this));
    }
    
    requestAnimationFrame(this.runLoop.bind(this));
  }
  
  // 执行动画任务
  executeAnimationTasks(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    for (const task of this.animationTasks) {
      if (task.active !== false) {
        task.fn(deltaTime, currentTime);
      }
    }
  }
  
  // 执行空闲任务
  executeIdleTasks(deadline) {
    // 优先处理高优先级任务
    const highPriorityTasks = this.idleTasks.filter(t => t.priority === 'high');
    const otherTasks = this.idleTasks.filter(t => t.priority !== 'high');
    
    // 执行高优先级任务
    this.processTaskBatch(highPriorityTasks, deadline);
    
    // 如果还有时间，执行其他任务
    if (deadline.timeRemaining() > 5) {
      this.processTaskBatch(otherTasks, deadline);
    }
    
    // 清理已完成的任务
    this.idleTasks = this.idleTasks.filter(t => !t.completed);
  }
  
  // 处理任务批次
  processTaskBatch(tasks, deadline) {
    while (deadline.timeRemaining() > 5 && tasks.length > 0) {
      const taskItem = tasks.shift();
      if (taskItem) {
        taskItem.task();
        taskItem.completed = true;
      }
    }
  }
  
  // 停止运行
  stop() {
    this.isRunning = false;
  }
}

// 使用示例
const perfOptimizer = new PerformanceOptimizer();

// 添加动画任务
perfOptimizer.addAnimationTask({
  fn: (deltaTime, currentTime) => {
    // 更新动画状态
    const element = document.getElementById('performance-box');
    if (element) {
      element.style.transform = `translateX(${Math.sin(currentTime/1000) * 100}px)`;
    }
  }
});

// 添加空闲任务
perfOptimizer.addIdleTask(() => {
  console.log('执行低优先级任务：数据清理');
}, 'low');

perfOptimizer.addIdleTask(() => {
  console.log('执行高优先级任务：关键数据更新');
}, 'high');
```

### 6. 兼容性处理和 Polyfill

```javascript
// rAF 和 rIC 的兼容性处理
(function() {
  // requestAnimationFrame 兼容性处理
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      const currentTime = Date.now();
      const timeToCall = Math.max(0, 16 - (currentTime - lastTime));
      const id = window.setTimeout(function() {
        callback(currentTime + timeToCall);
      }, timeToCall);
      lastTime = currentTime + timeToCall;
      return id;
    };
  }
  
  // requestIdleCallback 兼容性处理
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = function(callback, options) {
      const timeout = options && options.timeout ? options.timeout : 1000;
      
      setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50); // 模拟剩余时间
          }
        });
      }, 1);
    };
  }
  
  // 取消 rAF 的兼容性处理
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
  
  // 取消 rIC 的兼容性处理
  if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = function(id) {
      clearTimeout(id);
    };
  }
})();

// 实用工具类
class AnimationUtils {
  // 平滑滚动到指定位置
  static smoothScrollTo(element, targetY, duration = 300) {
    const startY = element.scrollTop;
    const distance = targetY - startY;
    const startTime = performance.now();
    
    function scrollStep(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      element.scrollTop = startY + distance * easeProgress;
      
      if (progress < 1) {
        requestAnimationFrame(scrollStep);
      }
    }
    
    requestAnimationFrame(scrollStep);
  }
  
  // 防抖动动画函数
  static debounceRAF(fn) {
    let ticking = false;
    
    return function(...args) {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
      }
    };
  }
  
  // 批量处理 DOM 更新
  static batchDOMUpdates(updates) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        updates.forEach(update => update());
        resolve();
      });
    });
  }
}

// 使用防抖动函数
const debouncedHandler = AnimationUtils.debounceRAF(() => {
  console.log('处理滚动事件');
});

window.addEventListener('scroll', debouncedHandler);
```

## 实际应用场景

### 1. 游戏开发中的应用

```javascript
// 游戏循环示例
class GameLoop {
  constructor() {
    this.isRunning = false;
    this.lastTime = 0;
    this.gameObjects = [];
  }
  
  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }
  
  gameLoop(currentTime) {
    if (!this.isRunning) return;
    
    const deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
    this.lastTime = currentTime;
    
    // 更新游戏逻辑
    this.update(deltaTime);
    
    // 渲染
    this.render();
    
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  update(deltaTime) {
    // 更新所有游戏对象
    this.gameObjects.forEach(obj => {
      if (obj.update) obj.update(deltaTime);
    });
  }
  
  render() {
    // 渲染所有游戏对象
    this.gameObjects.forEach(obj => {
      if (obj.render) obj.render();
    });
  }
  
  stop() {
    this.isRunning = false;
  }
}
```

### 2. UI 组件优化

```javascript
// 优化的 UI 组件示例
class OptimizedComponent {
  constructor(element) {
    this.element = element;
    this.pendingUpdates = [];
    this.isScheduled = false;
  }
  
  // 延迟更新，批量处理
  scheduleUpdate(updateFn) {
    this.pendingUpdates.push(updateFn);
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => {
        this.flushUpdates();
      });
    }
  }
  
  flushUpdates() {
    // 批量执行所有待更新的操作
    this.pendingUpdates.forEach(update => update());
    this.pendingUpdates = [];
    this.isScheduled = false;
  }
  
  // 非关键操作使用 idle callback
  scheduleIdleTask(task) {
    requestIdleCallback(() => {
      task();
    });
  }
}

// 使用示例
const component = new OptimizedComponent(document.getElementById('my-component'));

// 批量更新
component.scheduleUpdate(() => {
  component.element.style.left = '100px';
});

component.scheduleUpdate(() => {
  component.element.style.top = '50px';
});

// 非关键操作
component.scheduleIdleTask(() => {
  console.log('执行非关键操作');
});
```

## 注意事项

1. **rAF 的使用时机**：只用于需要与屏幕刷新率同步的动画
2. **rIC 的任务优先级**：确保传入的任务是非关键的，不会影响用户体验
3. **性能监控**：监控 rAF 和 rIC 的执行时间，避免任务过长
4. **兼容性处理**：为不支持的浏览器提供降级方案
5. **内存管理**：及时清理不再需要的动画和空闲任务
6. **错误处理**：在回调函数中处理可能的错误，避免影响主线程
7. **测试验证**：在不同设备和浏览器上测试性能表现

## 总结

requestAnimationFrame 和 requestIdleCallback 是现代前端性能优化的重要工具。rAF 确保动画与屏幕刷新率同步，提供流畅的视觉体验；rIC 允许在浏览器空闲时执行非关键任务，避免阻塞主线程。合理使用这两个 API 可以显著提升应用性能和用户体验，但需要注意它们的适用场景和使用限制。
