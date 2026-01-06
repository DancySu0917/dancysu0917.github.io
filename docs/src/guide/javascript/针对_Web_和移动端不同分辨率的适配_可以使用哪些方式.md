# 针对 Web 和移动端不同分辨率的适配，可以使用哪些方式？（了解）

**题目**: 针对 Web 和移动端不同分辨率的适配，可以使用哪些方式？（了解）

**答案**:

针对 Web 和移动端不同分辨率的适配，有多种技术和策略可以使用。以下是主要的适配方式：

## 1. 响应式设计 (Responsive Design)

### 媒体查询 (Media Queries)
使用 CSS 媒体查询根据设备特性应用不同样式：

```css
/* 基础样式 */
.container {
    width: 100%;
    padding: 20px;
}

/* 平板设备 */
@media screen and (max-width: 768px) {
    .container {
        padding: 15px;
    }
    
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* 手机设备 */
@media screen and (max-width: 480px) {
    .container {
        padding: 10px;
    }
    
    .grid {
        grid-template-columns: 1fr;
    }
    
    .nav-menu {
        display: none;
    }
    
    .mobile-nav {
        display: block;
    }
}
```

### 弹性布局 (Flexbox)
```css
.flex-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.flex-item {
    flex: 1 1 300px; /* 最小宽度300px，可伸缩 */
    margin: 10px;
}
```

### 网格布局 (Grid)
```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}
```

## 2. 视口单位 (Viewport Units)

### 使用 vw, vh, vmin, vmax
```css
/* 全屏高度 */
.full-height {
    height: 100vh;
}

/* 相对视口宽度的字体大小 */
.responsive-text {
    font-size: 4vw; /* 视口宽度的4% */
}

/* 响应式边距 */
.responsive-padding {
    padding: 5vw;
}
```

## 3. REM 单位适配

### 基于根元素字体大小的适配
```css
/* 根据设备宽度动态设置根字体大小 */
html {
    font-size: 16px; /* 基准大小 */
}

@media screen and (max-width: 375px) {
    html {
        font-size: 14px;
    }
}

@media screen and (min-width: 768px) {
    html {
        font-size: 18px;
    }
}

/* 使用 rem 单位 */
.title {
    font-size: 1.5rem; /* 1.5 × 根字体大小 */
    padding: 1rem;
}
```

### JavaScript 动态设置
```javascript
function setRootFontSize() {
    const deviceWidth = document.documentElement.clientWidth || document.body.clientWidth;
    const rootFontSize = (deviceWidth / 375) * 16; // 以iPhone6为基准
    document.documentElement.style.fontSize = rootFontSize + 'px';
}

// 页面加载和窗口大小改变时设置
window.addEventListener('resize', setRootFontSize);
window.addEventListener('DOMContentLoaded', setRootFontSize);
```

## 4. 百分比布局

### 相对宽度布局
```css
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.sidebar {
    width: 25%;
    float: left;
}

.main-content {
    width: 75%;
    float: right;
}

/* 清除浮动 */
.container::after {
    content: "";
    display: table;
    clear: both;
}
```

## 5. 图片响应式适配

### 使用 srcset 属性
```html
<img src="image-400.jpg" 
     srcset="image-400.jpg 400w, 
             image-800.jpg 800w, 
             image-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px, 
            (max-width: 1000px) 800px, 
            1200px"
     alt="响应式图片">
```

### 使用 picture 元素
```html
<picture>
    <source media="(max-width: 600px)" srcset="mobile-image.jpg">
    <source media="(max-width: 1200px)" srcset="tablet-image.jpg">
    <img src="desktop-image.jpg" alt="适配图片">
</picture>
```

## 6. 移动端适配方案

### 1. viewport 缩放适配
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 2. flexible.js 方案 (淘宝方案)
```javascript
// 动态设置 viewport 和 rem
(function flexible(window, document) {
    var docEl = document.documentElement;
    var dpr = window.devicePixelRatio || 1;
    
    // 设置 data-dpr 属性
    docEl.setAttribute('data-dpr', dpr);
    
    // 设置 rem 基准值
    var rem = docEl.clientWidth * dpr / 10;
    docEl.style.fontSize = rem + 'px';
})(window, document);
```

### 3. viewport 适配 (vw 方案)
```html
<!-- 使用 postcss-px-to-viewport 插件 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

```css
/* 编译前 */
.title {
    font-size: 32px; /* 编译后会转换为 vw 单位 */
    padding: 20px;
}

/* 编译后 */
.title {
    font-size: 8.53333vw;
    padding: 5.33333vw;
}
```

## 7. 设备检测和条件渲染

### CSS 设备检测
```css
/* 检测触摸设备 */
@media (hover: hover) {
    /* 鼠标设备 */
    .button:hover {
        background-color: #007bff;
    }
}

@media (hover: none) {
    /* 触摸设备 */
    .button:active {
        background-color: #007bff;
    }
}

/* 检测设备方向 */
@media screen and (orientation: landscape) {
    /* 横屏 */
    .container {
        flex-direction: row;
    }
}

@media screen and (orientation: portrait) {
    /* 竖屏 */
    .container {
        flex-direction: column;
    }
}
```

### JavaScript 设备检测
```javascript
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getDeviceInfo() {
    return {
        isMobile: isMobile(),
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1
    };
}

// 根据设备类型应用不同逻辑
if (getDeviceInfo().isMobile) {
    // 移动端特定逻辑
    document.body.classList.add('mobile');
} else {
    // PC端特定逻辑
    document.body.classList.add('desktop');
}
```

## 8. UI 框架适配

### 使用 Ant Design Mobile
```jsx
import { Button, List, Input } from 'antd-mobile';

function ResponsiveComponent() {
    return (
        <div className="responsive-container">
            <List>
                <List.Item>
                    <Input placeholder="请输入内容" />
                </List.Item>
            </List>
            <Button color="primary" size="large">提交</Button>
        </div>
    );
}
```

### 使用 Bootstrap 响应式类
```html
<div class="container">
    <div class="row">
        <div class="col-12 col-md-8 col-lg-9">主内容</div>
        <div class="col-12 col-md-4 col-lg-3">侧边栏</div>
    </div>
</div>
```

## 9. 服务端渲染适配

### 检测 User Agent
```javascript
// 服务端检测设备类型
function detectDevice(req) {
    const userAgent = req.headers['user-agent'];
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    return {
        isMobile: mobileRegex.test(userAgent),
        userAgent: userAgent
    };
}

// 根据设备类型返回不同内容
app.get('/', (req, res) => {
    const device = detectDevice(req);
    
    if (device.isMobile) {
        res.render('mobile-template');
    } else {
        res.render('desktop-template');
    }
});
```

## 10. 性能优化考虑

### 按需加载
```javascript
// 根据屏幕大小加载不同资源
function loadResponsiveAssets() {
    const width = window.innerWidth;
    
    if (width < 768) {
        // 加载移动端资源
        import('./mobile-components').then(module => {
            // 使用移动端组件
        });
    } else {
        // 加载桌面端资源
        import('./desktop-components').then(module => {
            // 使用桌面端组件
        });
    }
}
```

## 总结

选择合适的适配方案需要考虑以下因素：
1. **项目需求**: 单一应用还是多端适配
2. **目标设备**: 主要支持的设备类型
3. **开发成本**: 维护复杂度和时间成本
4. **性能要求**: 加载速度和运行效率
5. **团队技术栈**: 现有技术方案的兼容性

现代前端开发通常采用响应式设计结合适当的适配方案，以实现一次开发、多端适配的目标。
