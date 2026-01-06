# 简述弹性盒子 flex 布局及 rem 布局？（必会）

**题目**: 简述弹性盒子 flex 布局及 rem 布局？（必会）

**答案**:

### 弹性盒子（Flex）布局

Flex（Flexible Box）是CSS3中引入的一种布局模型，旨在提供一种更有效的方式来对容器内的项目进行排列、对齐和分配空间，即使它们的大小是未知或动态的。

#### Flex容器属性：
1. **display**: 设置为flex或inline-flex来创建弹性容器
2. **flex-direction**: 决定主轴方向（row、row-reverse、column、column-reverse）
3. **flex-wrap**: 决定项目是否换行（nowrap、wrap、wrap-reverse）
4. **flex-flow**: flex-direction和flex-wrap的简写
5. **justify-content**: 定义项目在主轴上的对齐方式
6. **align-items**: 定义项目在交叉轴上的对齐方式
7. **align-content**: 定义多根轴线的对齐方式

#### Flex项目属性：
1. **order**: 定义项目的排列顺序
2. **flex-grow**: 定义项目的放大比例
3. **flex-shrink**: 定义项目的缩小比例
4. **flex-basis**: 定义项目占据的主轴空间
5. **flex**: grow、shrink、basis的简写
6. **align-self**: 允许单个项目有与其他项目不同的对齐方式

#### 示例：
```css
.container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.item {
    flex: 1 1 auto; /* grow, shrink, basis */
}
```

### rem布局

rem（root em）是CSS中的一个相对单位，相对于HTML根元素的font-size计算值。

#### rem布局原理：
- 1rem = 根元素的font-size值
- 通过动态改变根元素的font-size，可以实现整体页面的等比缩放
- 通常用于移动端适配

#### rem布局实现方式：
1. **手动设置**：根据设计稿尺寸手动计算rem值
2. **JavaScript动态设置**：根据屏幕宽度动态计算根字体大小
3. **使用第三方库**：如lib-flexible等

#### 示例：
```css
/* 假设设计稿宽度为750px，期望根字体大小为100px */
html {
    font-size: 100px; /* 在375px屏幕宽度时 */
}

/* 其他元素使用rem单位 */
.container {
    width: 3.75rem; /* 375px对应3.75rem */
    height: 2rem;    /* 200px对应2rem */
}
```

```javascript
// 动态设置根字体大小
function setRootFontSize() {
    const screenWidth = document.documentElement.clientWidth;
    const designWidth = 750;  // 设计稿宽度
    const baseFontSize = 100; // 基准字体大小
    const rootFontSize = (screenWidth / designWidth) * baseFontSize;
    document.documentElement.style.fontSize = rootFontSize + 'px';
}

// 页面加载和窗口大小改变时执行
window.addEventListener('resize', setRootFontSize);
setRootFontSize();
```

### Flex布局与rem布局的区别：
1. **用途不同**：Flex主要用于布局排列，rem主要用于尺寸适配
2. **单位性质**：Flex是布局模型，rem是长度单位
3. **应用场景**：Flex适合复杂布局，rem适合响应式设计

### 总结：
- Flex布局提供了强大的一维布局能力，适合处理复杂的排列和对齐需求
- rem布局通过相对单位实现响应式适配，特别适合移动端开发
- 两者可以结合使用，实现既灵活又响应式的布局方案
