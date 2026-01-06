# JavaScript 动画和 CSS3 动画有什么区别？（必会）

**题目**: JavaScript 动画和 CSS3 动画有什么区别？（必会）

**答案**:

JavaScript 动画和 CSS3 动画是实现网页动画效果的两种主要方式，它们在实现原理、性能特点、控制能力等方面存在显著差异：

### 1. 实现原理
- **CSS3 动画**：通过 CSS 属性（如 `transition`、`animation`、`transform`）来实现动画效果，浏览器在渲染层处理
- **JavaScript 动画**：通过 JavaScript 代码控制元素的样式属性变化，通常使用 `setInterval`、`setTimeout` 或 `requestAnimationFrame` 来实现

### 2. 性能对比
- **CSS3 动画**：
  - 通常性能更好，因为动画在 GPU 层面处理
  - 浏览器可以对 CSS 动画进行优化
  - 适合简单的动画效果，如颜色变化、位置移动、缩放等
- **JavaScript 动画**：
  - 需要频繁操作 DOM，可能影响性能
  - 但在复杂逻辑控制下可能更高效
  - 适合需要复杂交互和逻辑判断的动画

### 3. 控制能力
- **CSS3 动画**：
  - 控制相对简单，主要通过 CSS 属性设置
  - 无法动态修改动画参数
  - 事件处理有限（`animationstart`、`animationend`、`animationiteration`）
- **JavaScript 动画**：
  - 控制能力强大，可以动态修改动画参数
  - 支持复杂的条件判断和逻辑处理
  - 可以暂停、恢复、反转动画

### 4. 代码复杂度
- **CSS3 动画**：代码简洁，易于维护，适合简单的动画效果
- **JavaScript 动画**：代码相对复杂，但灵活性更高

### 5. 兼容性
- **CSS3 动画**：需要考虑浏览器对 CSS3 属性的支持情况
- **JavaScript 动画**：兼容性更好，可以通过 polyfill 支持老版本浏览器

### 6. 实际应用示例

**CSS3 动画示例**：
```css
.animated-box {
  width: 100px;
  height: 100px;
  background-color: #3498db;
  transition: all 0.5s ease;
}

.animated-box:hover {
  background-color: #e74c3c;
  transform: translateX(100px) rotate(45deg);
}
```

**JavaScript 动画示例**：
```javascript
function animateElement(element, targetX, duration) {
  const startTime = performance.now();
  const startX = parseFloat(getComputedStyle(element).left) || 0;
  const distance = targetX - startX;

  function updateAnimation(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    element.style.left = startX + distance * easeProgress + 'px';
    
    if (progress < 1) {
      requestAnimationFrame(updateAnimation);
    }
  }
  
  requestAnimationFrame(updateAnimation);
}

// 使用示例
const box = document.querySelector('.box');
animateElement(box, 200, 1000); // 1秒内移动到200px位置
```

### 7. 选择建议
- **使用 CSS3 动画**：当动画效果简单、不需要复杂交互时
- **使用 JavaScript 动画**：当需要复杂的逻辑控制、动态参数调整或与其他代码交互时
- **结合使用**：现代项目中，通常会结合使用两者，发挥各自优势

总的来说，CSS3 动画更适合简单、独立的视觉效果，而 JavaScript 动画更适合复杂的交互逻辑和动态控制。
