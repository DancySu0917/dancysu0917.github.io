# JavaScript 中的定时器有哪些？他们的区别及用法是什么？（必会）

**题目**: JavaScript 中的定时器有哪些？他们的区别及用法是什么？（必会
）

## 核心答案

JavaScript 中主要有四种定时器相关的方法：

1. \`setTimeout()\` - 延迟执行一次
2. \`setInterval()\` - 重复执行
3. \`clearTimeout()\` - 清除 setTimeout
4. \`clearInterval()\` - 清除 setInterval

此外，还有现代浏览器提供的 \`requestAnimationFrame()\`。

## 详细说明

### 1. setTimeout() - 延迟执行一次

\`setTimeout()\` 用于在指定的延迟时间后执行一次函数。

\`\`\`javascript
// 基本语法
setTimeout(function() {
    console.log("延迟执行的函数");
}, 1000); // 1秒后执行

// ES6 箭头函数写法
setTimeout(() => {
    console.log("箭头函数版本");
}, 2000);

// 传参给回调函数
setTimeout((name, age) => {
    console.log(\`姓名: \${name}, 年龄: \${age}\`);
}, 1000, "张三", 25);

// 传递字符串（不推荐）
setTimeout("console.log(\"字符串方式\")", 1000);
\`\`\`

### 2. setInterval() - 重复执行

\`setInterval()\` 用于每隔指定时间重复执行函数。

\`\`\`javascript
// 基本用法
let count = 0;
const intervalId = setInterval(() => {
    console.log(\`执行次数: \${++count}\`);
    if (count >= 5) {
        clearInterval(intervalId); // 执行5次后停止
        console.log("定时器已清除");
    }
}, 1000); // 每秒执行一次

// 计时器示例
let seconds = 0;
const timer = setInterval(() => {
    console.log(\`已运行 \${seconds++} 秒\`);
}, 1000);
\`\`\`

### 3. clearTimeout() - 清除 setTimeout

用于清除由 \`setTimeout()\` 设置的定时器。

\`\`\`javascript
const timeoutId = setTimeout(() => {
    console.log("这行代码不会执行");
}, 3000);

// 在3秒之前清除定时器
clearTimeout(timeoutId);
console.log("setTimeout 已被清除");
\`\`\`

### 4. clearInterval() - 清除 setInterval

用于清除由 \`setInterval()\` 设置的重复定时器。

\`\`\`javascript
const intervalId = setInterval(() => {
    console.log("重复执行");
}, 1000);

// 5秒后停止重复执行
setTimeout(() => {
    clearInterval(intervalId);
    console.log("setInterval 已被清除");
}, 5000);
\`\`\`

## 主要区别

| 特性 | setTimeout | setInterval |
|------|------------|-------------|
| 执行次数 | 只执行一次 | 重复执行 |
| 适用场景 | 延迟操作、防抖 | 轮询、动画、计时器 |
| 内存影响 | 执行后自动释放 | 需手动清除，否则持续占用内存 |
| 精确性 | 相对精确 | 可能因执行时间累积误差 |

## 高级用法

### 1. 递归 setTimeout 实现间隔执行

\`\`\`javascript
// 使用递归 setTimeout 替代 setInterval
function recursiveTimeout() {
    console.log("递归 setTimeout 执行");
    
    setTimeout(recursiveTimeout, 1000); // 1秒后再次执行
}

recursiveTimeout(); // 开始执行

// 与 setInterval 的区别：
// - setInterval 可能因执行时间长而累积误差
// - 递归 setTimeout 确保每次执行间隔固定
\`\`\`

### 2. Promise 包装的延时函数

\`\`\`javascript
// 创建延时 Promise
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用 async/await
async function example() {
    console.log("开始");
    await delay(2000); // 等待2秒
    console.log("2秒后执行");
}

example();
\`\`\`

### 3. 防抖和节流实现

\`\`\`javascript
// 防抖：在事件停止触发 n 秒后才执行
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 节流：在 n 秒内只执行一次
function throttle(func, delay) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= delay) {
            func.apply(this, args);
            lastTime = now;
        }
    };
}

// 使用示例
const debouncedSearch = debounce((query) => {
    console.log("搜索:", query);
}, 300);

const throttledScroll = throttle(() => {
    console.log("滚动事件");
}, 100);
\`\`\`

### 4. requestAnimationFrame()

现代浏览器提供的专门用于动画的定时器。

\`\`\`javascript
// requestAnimationFrame 用于平滑动画
let start;
function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    
    // 更新动画元素
    const element = document.getElementById("animated-element");
    element.style.left = Math.min(progress / 10, 200) + "px";
    
    if (progress < 2000) { // 动画持续2秒
        requestAnimationFrame(animate);
    }
}

requestAnimationFrame(animate);

// 与 setTimeout/setInterval 的区别：
// - 更适合动画，浏览器会优化性能
// - 帧率与显示器刷新率同步（通常60fps）
// - 页面不可见时会暂停，节省资源
\`\`\`

## 实际应用场景

### 1. 页面倒计时

\`\`\`javascript
function countdown(seconds) {
    const timer = setInterval(() => {
        console.log(\`倒计时: \${seconds--}\`);
        if (seconds < 0) {
            clearInterval(timer);
            console.log("时间到！");
        }
    }, 1000);
}

countdown(10); // 10秒倒计时
\`\`\`

### 2. 自动保存功能

\`\`\`javascript
function autoSave(content) {
    setTimeout(() => {
        // 模拟保存操作
        console.log("自动保存:", content);
    }, 3000); // 3秒后自动保存
}
\`\`\`

### 3. 轮询数据更新

\`\`\`javascript
function pollData() {
    fetch("/api/data")
        .then(response => response.json())
        .then(data => {
            console.log("获取到数据:", data);
        })
        .catch(error => {
            console.error("轮询失败:", error);
        });
    
    // 5秒后继续轮询
    setTimeout(pollData, 5000);
}

pollData(); // 开始轮询
\`\`\`

## 注意事项和最佳实践

1. **及时清理定时器**：避免内存泄漏
2. **避免在循环中创建定时器**：可能导致意外的执行顺序
3. **考虑性能**：频繁的定时器会影响性能
4. **处理异常**：定时器中的错误不会中断主线程
5. **页面可见性**：使用 Page Visibility API 优化后台定时器

\`\`\`javascript
// 页面可见性检测
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // 页面隐藏时停止定时器
        console.log("页面隐藏，可暂停定时器");
    } else {
        // 页面显示时恢复定时器
        console.log("页面显示，可恢复定时器");
    }
});
\`\`\`

## 面试要点

- 理解 setTimeout 和 setInterval 的区别
- 掌握定时器的清除方法
- 了解递归 setTimeout 与 setInterval 的区别
- 知道 requestAnimationFrame 的用途
- 能处理定时器相关的内存泄漏问题
- 理解事件循环与定时器的关系
