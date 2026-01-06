# setTimeout 和 requestAnimationFrame 哪个更精确？（了解）

**题目**: setTimeout 和 requestAnimationFrame 哪个更精确？（了解）

**答案**:

在动画和时间控制方面，`requestAnimationFrame` 比 `setTimeout` 更精确，原因如下：

## requestAnimationFrame 的优势

### 1. 同步刷新率
- `requestAnimationFrame` 会根据屏幕的刷新率（通常是60Hz，即16.67ms一次）来执行回调
- 与屏幕刷新同步，避免了不必要的重绘和重排

### 2. 浏览器优化
- 浏览器可以对 `requestAnimationFrame` 进行优化，确保在最佳时机执行动画
- 当标签页不可见时，浏览器会暂停 `requestAnimationFrame`，节省资源

### 3. 避免掉帧
- 由于与屏幕刷新率同步，动画更加流畅，不会出现跳帧现象
- `setTimeout` 可能会在某些帧之间执行多次或跳过某些帧

## 技术对比

```javascript
// setTimeout 方式 - 不够精确
let startTime = Date.now();
let count = 0;

function animateWithSetTimeout() {
    count++;
    const elapsed = Date.now() - startTime;
    console.log(`setTimeout: Frame ${count}, Elapsed: ${elapsed}ms`);
    
    // 尝试每16.67ms执行一次（60fps）
    setTimeout(animateWithSetTimeout, 16.67);
}

// requestAnimationFrame 方式 - 更精确
let rafCount = 0;
let rafStartTime = performance.now();

function animateWithRAF(timestamp) {
    rafCount++;
    const elapsed = timestamp - rafStartTime;
    console.log(`rAF: Frame ${rafCount}, Elapsed: ${elapsed.toFixed(2)}ms`);
    
    requestAnimationFrame(animateWithRAF);
}

// 启动两种动画
animateWithSetTimeout();
requestAnimationFrame(animateWithRAF);
```

## 实际应用差异

### setTimeout 的问题
```javascript
// setTimeout 可能出现的问题
function problematicAnimation() {
    // 即使设置为 16.67ms，实际执行时间可能因为浏览器调度而延迟
    setTimeout(() => {
        // 元素移动
        element.style.left = parseInt(element.style.left) + 1 + 'px';
        problematicAnimation();
    }, 16.67);
}
```

### requestAnimationFrame 的优势
```javascript
// 更精确的动画
let start = null;
const duration = 2000; // 2秒动画

function smoothAnimation(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    
    // 计算动画进度（0-1）
    const percent = Math.min(progress / duration, 1);
    
    // 更新元素位置
    element.style.left = (percent * 100) + '%';
    
    if (percent < 1) {
        requestAnimationFrame(smoothAnimation);
    }
}

requestAnimationFrame(smoothAnimation);
```

## 精度对比总结

| 特性 | setTimeout | requestAnimationFrame |
|------|------------|----------------------|
| 同步刷新率 | ❌ 不同步 | ✅ 同步屏幕刷新率 |
| 性能优化 | ❌ 无法优化 | ✅ 浏览器自动优化 |
| 节能 | ❌ 持续执行 | ✅ 不可见时暂停 |
| 掉帧风险 | ✅ 有风险 | ❌ 无风险 |
| 精度 | 较低 | 更高 |

## 选择建议

- **动画场景**：优先使用 `requestAnimationFrame`，因为它与屏幕刷新率同步，动画更流畅
- **定时任务**：使用 `setTimeout` 或 `setInterval`，适用于不需要与屏幕刷新同步的任务
- **混合场景**：根据具体需求选择，但动画相关的操作应使用 `requestAnimationFrame`

因此，`requestAnimationFrame` 在动画精度和性能方面都优于 `setTimeout`。
