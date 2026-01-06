# 为什么使用 requestAnimationFrame？有什么特性？能保证回调一定会被执行吗？（了解）

**题目**: 为什么使用 requestAnimationFrame？有什么特性？能保证回调一定会被执行吗？（了解）

## 标准答案

requestAnimationFrame（rAF）是浏览器提供的专门用于动画的API，主要特性包括：

1. **同步刷新率**：自动与浏览器刷新率同步（通常是60Hz），确保动画流畅
2. **性能优化**：浏览器可优化渲染，当页面不可见时会暂停执行
3. **节能**：避免不必要的计算，节省CPU、GPU和电池资源
4. **回调执行**：不能保证回调一定会执行，会根据浏览器优化策略决定

## 深入分析

### requestAnimationFrame的优势

**1. 与屏幕刷新率同步**
- rAF会根据设备的屏幕刷新率（通常是60Hz或144Hz）来执行回调
- 确保每一帧都在最佳时机执行，避免跳帧或卡顿
- 提供最流畅的动画体验

**2. 智能调度**
- 当标签页不可见或动画元素不在视口内时，浏览器会暂停执行
- 避免在不需要时消耗资源
- 智能地管理动画执行时机

**3. 批量处理**
- 浏览器会在下一个重绘之前批量执行所有rAF回调
- 优化渲染性能，减少重排和重绘

### requestAnimationFrame的工作原理

rAF基于浏览器的刷新机制，其执行流程如下：
1. 浏览器检测到rAF调用
2. 将回调函数添加到动画帧回调队列
3. 在下一个浏览器刷新周期执行所有队列中的回调
4. 执行DOM操作和样式更新
5. 进行重排和重绘

### 与传统定时器的对比

| 特性 | setInterval/setTimeout | requestAnimationFrame |
|------|------------------------|------------------------|
| 同步刷新率 | ❌ 不同步 | ✅ 自动同步 |
| 性能优化 | ❌ 无优化 | ✅ 智能优化 |
| 节能 | ❌ 不节能 | ✅ 节能 |
| 页面不可见时 | ❌ 仍执行 | ✅ 暂停执行 |
| 动画流畅度 | ❌ 可能卡顿 | ✅ 流畅 |

### 回调执行的不确定性

rAF不能保证回调一定会执行，原因包括：
1. 页面不可见时会被暂停
2. 浏览器可能根据性能策略跳过某些帧
3. 在低性能设备上可能会降低执行频率
4. 用户可能切换标签页或最小化浏览器

### 浏览器兼容性

现代浏览器都支持rAF，对于不支持的浏览器需要polyfill：
- Chrome 24+
- Firefox 23+
- Safari 6.1+
- IE 10+

## 代码实现

```javascript
// 1. 基础requestAnimationFrame使用
class BasicAnimation {
  constructor(element) {
    this.element = element;
    this.startTime = null;
    this.duration = 2000; // 2秒动画
    this.startValue = 0;
    this.endValue = 100;
  }

  animate(currentTime) {
    if (!this.startTime) {
      this.startTime = currentTime;
    }

    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    // 计算当前值
    const currentValue = this.startValue + (this.endValue - this.startValue) * progress;
    
    // 应用到元素
    this.element.style.width = `${currentValue}%`;

    // 如果动画未完成，继续执行
    if (progress < 1) {
      requestAnimationFrame(this.animate.bind(this));
    } else {
      console.log('动画完成');
    }
  }

  start() {
    requestAnimationFrame(this.animate.bind(this));
  }
}

// 2. 动画控制类
class AnimationController {
  constructor() {
    this.animationId = null;
    this.isRunning = false;
  }

  // 开始动画
  start(callback) {
    if (this.isRunning) {
      this.stop();
    }

    const animate = (timestamp) => {
      if (this.isRunning) {
        callback(timestamp);
        this.animationId = requestAnimationFrame(animate);
      }
    };

    this.isRunning = true;
    this.animationId = requestAnimationFrame(animate);
  }

  // 停止动画
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.isRunning = false;
    }
  }

  // 暂停动画
  pause() {
    this.isRunning = false;
  }

  // 恢复动画
  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.start((timestamp) => {
        // 恢复时需要重新定义回调
      });
    }
  }
}

// 3. 多元素动画管理
class MultiElementAnimator {
  constructor() {
    this.animations = new Map();
    this.globalAnimationId = null;
    this.isRunning = false;
  }

  // 添加动画元素
  addElement(element, animationFn, options = {}) {
    const id = Symbol('animation');
    this.animations.set(id, {
      element,
      animationFn,
      options,
      startTime: null,
      ...options
    });
    
    if (!this.isRunning) {
      this.start();
    }
    
    return id;
  }

  // 移除动画元素
  removeElement(id) {
    this.animations.delete(id);
    
    if (this.animations.size === 0 && this.isRunning) {
      this.stop();
    }
  }

  // 开始所有动画
  start() {
    if (this.isRunning) return;

    const animate = (timestamp) => {
      let hasActiveAnimations = false;

      for (const [id, animation] of this.animations) {
        if (!animation.startTime) {
          animation.startTime = timestamp;
        }

        const elapsed = timestamp - animation.startTime;
        const shouldContinue = animation.animationFn(
          animation.element,
          elapsed,
          animation
        );

        if (shouldContinue !== false) {
          hasActiveAnimations = true;
        } else {
          // 动画完成，移除
          this.animations.delete(id);
        }
      }

      if (hasActiveAnimations || this.animations.size > 0) {
        this.globalAnimationId = requestAnimationFrame(animate);
      } else {
        this.isRunning = false;
      }
    };

    this.isRunning = true;
    this.globalAnimationId = requestAnimationFrame(animate);
  }

  // 停止所有动画
  stop() {
    if (this.globalAnimationId) {
      cancelAnimationFrame(this.globalAnimationId);
      this.isRunning = false;
    }
  }
}

// 4. 缓动函数实现
class EasingFunctions {
  // 线性缓动
  static linear(t) {
    return t;
  }

  // 二次缓动 - 从慢到快
  static easeInQuad(t) {
    return t * t;
  }

  // 二次缓动 - 从快到慢
  static easeOutQuad(t) {
    return t * (2 - t);
  }

  // 二次缓动 - 先慢后快再慢
  static easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // 三次缓动
  static easeInCubic(t) {
    return t * t * t;
  }

  // 弹性缓动
  static easeOutElastic(t) {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  }
}

// 5. 高级动画类 - 支持缓动和链式调用
class AdvancedAnimator {
  constructor(element) {
    this.element = element;
    this.queue = [];
    this.isRunning = false;
    this.currentAnimationId = null;
  }

  // 添加动画到队列
  animate(properties, duration = 1000, easing = EasingFunctions.easeInOutQuad) {
    this.queue.push({
      properties,
      duration,
      easing,
      startTime: null
    });
    
    if (!this.isRunning) {
      this.processQueue();
    }
    
    return this; // 支持链式调用
  }

  // 等待指定时间
  wait(delay) {
    this.queue.push({
      type: 'wait',
      delay,
      startTime: null
    });
    
    return this;
  }

  // 处理动画队列
  processQueue() {
    if (this.queue.length === 0 || this.isRunning) {
      return;
    }

    this.isRunning = true;
    const currentTask = this.queue[0];
    let taskStartTime = null;

    const runTask = (timestamp) => {
      if (!taskStartTime) {
        taskStartTime = timestamp;
      }

      const elapsed = timestamp - taskStartTime;

      if (currentTask.type === 'wait') {
        // 等待任务
        if (elapsed >= currentTask.delay) {
          this.queue.shift(); // 移除已完成的任务
          taskStartTime = null;
          this.isRunning = false;
          this.processQueue(); // 处理下一个任务
          return;
        }
      } else {
        // 动画任务
        const progress = Math.min(elapsed / currentTask.duration, 1);
        const easedProgress = currentTask.easing(progress);

        // 应用属性变化
        this.applyProperties(easedProgress, currentTask.properties);

        if (progress >= 1) {
          // 动画完成
          this.queue.shift(); // 移除已完成的动画
          taskStartTime = null;
          this.isRunning = false;
          this.processQueue(); // 处理下一个动画
          return;
        }
      }

      this.currentAnimationId = requestAnimationFrame(runTask);
    };

    this.currentAnimationId = requestAnimationFrame(runTask);
  }

  // 应用属性变化
  applyProperties(progress, properties) {
    const elementStyle = this.element.style;

    for (const [property, [startValue, endValue]] of Object.entries(properties)) {
      const currentValue = startValue + (endValue - startValue) * progress;
      
      switch (property) {
        case 'x':
          elementStyle.transform = `translateX(${currentValue}px)`;
          break;
        case 'y':
          elementStyle.transform = `translateY(${currentValue}px)`;
          break;
        case 'scale':
          elementStyle.transform = `scale(${currentValue})`;
          break;
        case 'opacity':
          elementStyle.opacity = currentValue;
          break;
        case 'width':
          elementStyle.width = `${currentValue}px`;
          break;
        case 'height':
          elementStyle.height = `${currentValue}px`;
          break;
        default:
          elementStyle[property] = currentValue;
      }
    }
  }

  // 停止动画
  stop() {
    if (this.currentAnimationId) {
      cancelAnimationFrame(this.currentAnimationId);
      this.isRunning = false;
      this.queue = [];
    }
  }
}

// 6. 性能监控和调试
class AnimationPerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTimestamp = 0;
    this.fps = 0;
    this.fpsHistory = [];
  }

  // 监控动画性能
  monitor(timestamp) {
    this.frameCount++;

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      return 0;
    }

    const delta = (timestamp - this.lastTimestamp) / 1000; // 转换为秒
    this.lastTimestamp = timestamp;

    // 计算当前FPS
    const currentFps = delta > 0 ? Math.round(1 / delta) : 0;
    this.fps = currentFps;

    // 记录FPS历史（最近60帧）
    this.fpsHistory.push({ timestamp, fps: currentFps });
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    return currentFps;
  }

  // 获取平均FPS
  getAverageFps() {
    if (this.fpsHistory.length === 0) return 0;
    
    const sum = this.fpsHistory.reduce((acc, frame) => acc + frame.fps, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  // 获取FPS统计信息
  getStats() {
    if (this.fpsHistory.length === 0) return null;

    const fpsValues = this.fpsHistory.map(frame => frame.fps);
    const minFps = Math.min(...fpsValues);
    const maxFps = Math.max(...fpsValues);
    const avgFps = this.getAverageFps();

    return {
      currentFps: this.fps,
      averageFps: avgFps,
      minFps,
      maxFps,
      frameCount: this.fpsHistory.length
    };
  }
}

// 7. requestAnimationFrame Polyfill
(function() {
  if (!window.requestAnimationFrame) {
    // 使用setTimeout模拟rAF
    window.requestAnimationFrame = function(callback) {
      // 理论上应该是1000/60 ≈ 16.67ms，但使用16ms更接近实际
      const start = Date.now();
      return setTimeout(function() {
        callback(start + 16.67);
      }, 16.67);
    };

    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();

// 8. 实际使用示例
console.log('=== requestAnimationFrame 演示 ===');

// 创建演示元素
const demoBox = document.createElement('div');
demoBox.style.cssText = `
  width: 100px;
  height: 100px;
  background-color: #3498db;
  position: absolute;
  left: 0;
  top: 100px;
  transition: none;
`;
document.body.appendChild(demoBox);

// 基础动画示例
const basicAnimation = new BasicAnimation(demoBox);
// basicAnimation.start(); // 取消注释以运行动画

// 动画控制器示例
const controller = new AnimationController();
let position = 0;

const moveBox = (timestamp) => {
  position += 1;
  demoBox.style.left = `${position}px`;
  
  if (position < 500) {
    return true; // 继续动画
  }
  return false; // 停止动画
};

// 使用多元素动画管理器
const animator = new MultiElementAnimator();

// 创建多个动画元素
for (let i = 0; i < 3; i++) {
  const element = document.createElement('div');
  element.textContent = `动画元素 ${i + 1}`;
  element.style.cssText = `
    position: absolute;
    top: ${200 + i * 50}px;
    left: 0;
    width: 100px;
    height: 30px;
    background-color: #e74c3c;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  document.body.appendChild(element);

  // 添加动画
  animator.addElement(element, (el, elapsed, animation) => {
    const x = (elapsed / 1000) * 100; // 每秒移动100px
    el.style.left = `${x % 500}px`;
    
    // 持续5秒后停止
    return elapsed < 5000;
  });
}

// 高级动画示例
const advancedAnimator = new AdvancedAnimator(demoBox);
// advancedAnimator
//   .animate({ x: [0, 300], opacity: [1, 0.5] }, 2000)
//   .wait(500)
//   .animate({ x: [300, 0], opacity: [0.5, 1] }, 2000);

// 性能监控示例
const monitor = new AnimationPerformanceMonitor();

let animationStartTime = null;
const performanceAnimated = (timestamp) => {
  if (!animationStartTime) animationStartTime = timestamp;
  
  // 简单的动画逻辑
  const elapsed = timestamp - animationStartTime;
  const x = (elapsed / 10) % 400; // 每4000ms循环
  demoBox.style.left = `${x}px`;
  
  // 监控性能
  const fps = monitor.monitor(timestamp);
  if (elapsed % 1000 < 16) { // 每秒输出一次
    console.log(`当前FPS: ${fps}, 平均FPS: ${monitor.getAverageFps()}`);
  }
  
  // 继续动画
  requestAnimationFrame(performanceAnimated);
};

// 启动性能监控动画
// requestAnimationFrame(performanceAnimated);

console.log('requestAnimationFrame 演示设置完成');
```

## 实际应用场景

### 1. CSS动画的JavaScript替代方案
- 当CSS动画无法满足复杂需求时
- 需要精确控制动画进度时
- 需要根据用户交互动态调整动画时

### 2. 游戏开发
- 游戏主循环
- 角色移动和动画
- 粒子效果
- 碰撞检测

### 3. 数据可视化
- 图表动画
- 进度条动画
- 动态数据更新的平滑过渡

### 4. 滚动动画
- 平滑滚动效果
- 滚动视差效果
- 滚动触发的动画

### 5. 性能敏感应用
- 需要保持高FPS的应用
- 移动端动画优化
- 长时间运行的动画

## 总结

requestAnimationFrame是现代Web动画的标准API，相比传统的setInterval和setTimeout具有明显优势。它能自动与屏幕刷新率同步，提供流畅的动画体验，同时具备智能调度和节能特性。虽然不能保证回调一定会执行（受浏览器优化策略影响），但在绝大多数场景下都是动画开发的首选方案。
