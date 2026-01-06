# rem 适配方法如何计算 HTML 根字号及适配方案？（必会）

**题目**: rem 适配方法如何计算 HTML 根字号及适配方案？（必会）

**答案**:

rem适配是一种常用的移动端适配方案，通过动态设置HTML根元素的字体大小，使页面元素能够根据屏幕尺寸进行自适应。

## rem适配原理

rem是相对于根元素（html）字体大小的单位。如果html的font-size为16px，那么1rem = 16px。通过动态改变根元素的字体大小，可以实现整个页面的等比缩放。

## 根字体大小计算方法

### 1. 基于设计稿的计算方法

```javascript
// 假设设计稿宽度为750px，期望在iPhone6/7/8上完美显示
function setRootFontSize() {
    // 获取设备屏幕宽度
    const screenWidth = document.documentElement.clientWidth || document.body.clientWidth;
    
    // 设计稿宽度
    const designWidth = 750;
    
    // 基准根字体大小（通常基于设计稿上的某个标准字体大小）
    const baseFontSize = 16; // px
    
    // 计算当前屏幕相对于设计稿的缩放比例
    const scale = screenWidth / designWidth;
    
    // 计算当前根字体大小
    const rootFontSize = baseFontSize * scale;
    
    // 设置根字体大小
    document.documentElement.style.fontSize = rootFontSize + 'px';
}

// 页面加载和窗口大小改变时执行
window.addEventListener('resize', setRootFontSize);
window.addEventListener('DOMContentLoaded', setRootFontSize);
setRootFontSize(); // 确保立即执行
```

### 2. 简化计算方法（常用）

```javascript
function setRootFontSize() {
    const screenWidth = document.documentElement.clientWidth;
    // 以375px屏幕宽度为基准，设置根字体大小为100px
    // 这样1rem就约等于屏幕宽度的1/3.75
    const rootFontSize = (screenWidth / 375) * 100;
    
    // 限制根字体大小范围，避免字体过大或过小
    const minFontSize = 20;
    const maxFontSize = 120;
    
    const finalFontSize = Math.min(Math.max(rootFontSize, minFontSize), maxFontSize);
    
    document.documentElement.style.fontSize = finalFontSize + 'px';
}
```

## 常见的rem适配方案

### 1. 手动计算方案

```javascript
// rem适配核心代码
(function(win, lib) {
    const doc = win.document;
    const docEl = doc.documentElement;
    
    // 设计稿宽度
    const designWidth = 750;
    // 基准字体大小
    const baseSize = 100;
    
    function refreshRem() {
        const clientWidth = docEl.clientWidth;
        if (!clientWidth) return;
        
        // 计算缩放比例
        const scale = clientWidth / designWidth;
        // 设置根字体大小
        const rem = baseSize * scale;
        docEl.style.fontSize = rem + 'px';
    }
    
    // 监听页面变化
    win.addEventListener('resize', refreshRem);
    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            refreshRem();
        }
    });
    
    refreshRem();
})(window);
```

### 2. 使用lib-flexible库

```html
<!-- 引入淘宝的flexible库 -->
<script src="https://lib.flexible.alicdn.com/lib-flexible/flexible.js"></script>
```

```javascript
// flexible库会自动计算根字体大小
// 默认以750px设计稿为基准，将屏幕宽度分成10份，1rem = 屏幕宽度/10
```

### 3. 使用vw单位替代方案

```css
/* 使用vw单位，无需JavaScript计算 */
html {
    font-size: calc(100 * 100vw / 750); /* 基于750px设计稿 */
}

/* 限制最小和最大字体大小 */
@media screen and (max-width: 320px) {
    html {
        font-size: calc(100 * 320vw / 750);
    }
}

@media screen and (min-width: 640px) {
    html {
        font-size: calc(100 * 640vw / 750);
    }
}
```

## 实际开发中的转换方法

### 1. 手动转换

假设设计稿为750px宽，期望100px在设计稿中的大小在屏幕上保持一致：
- 设计稿中元素宽度为100px
- 如果基准根字体大小为100px（对应375px屏幕），则100px = 1rem
- 如果设计稿是750px宽，基准根字体大小为200px，则100px = 0.5rem

### 2. 使用构建工具自动转换

使用postcss-pxtorem插件：

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 100,  // 根字体大小基准
      propList: ['*'], // 需要转换的属性
      selectorBlackList: ['.ignore'], // 忽略转换的选择器
      minPixelValue: 2 // 小于2px的不转换
    }
  }
}
```

```css
/* 源码 */
.container {
    width: 100px;  /* 会被转换为1rem */
    height: 200px; /* 会被转换为2rem */
    font-size: 28px; /* 会被转换为0.28rem */
}

/* 转换后 */
.container {
    width: 1rem;
    height: 2rem;
    font-size: 0.28rem;
}
```

## 完整的适配方案示例

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>rem适配示例</title>
    <script>
        (function() {
            function refreshRem() {
                const width = document.documentElement.clientWidth;
                const designWidth = 750; // 设计稿宽度
                const rem = width * 100 / designWidth; // 以100px为基准
                document.documentElement.style.fontSize = rem + 'px';
            }
            
            refreshRem();
            window.addEventListener('resize', refreshRem);
        })();
    </script>
    <style>
        .container {
            width: 3.75rem; /* 375px在750px设计稿中占一半 */
            height: 2rem;   /* 200px */
            background-color: #f0f0f0;
            margin: 0.5rem auto; /* 50px */
        }
    </style>
</head>
<body>
    <div class="container">适配容器</div>
</body>
</html>
```

## 注意事项

1. **设置viewport**：必须设置合适的viewport meta标签
2. **字体大小限制**：考虑用户体验，设置合理的最小和最大字体大小
3. **高清屏适配**：在高清屏上可能需要特殊处理
4. **兼容性**：考虑低版本浏览器的兼容性问题
5. **性能优化**：resize事件触发频繁，可使用防抖优化

rem适配方案在移动端开发中应用广泛，特别是在需要适配多种屏幕尺寸的场景中，能够有效保持设计稿的视觉一致性。
