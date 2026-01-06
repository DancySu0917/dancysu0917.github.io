# CSS 的定位（position 属性）有几种，分别有什么特点和应用场景？（了解）

**题目**: CSS 的定位（position 属性）有几种，分别有什么特点和应用场景？（了解）

**答案**:

CSS 的 position 属性有以下几种值：

### 1. static（默认值）
- 特点：元素按照正常的文档流进行排列，top、right、bottom、left 属性无效
- 应用场景：大部分元素的默认定位方式

```css
.element {
    position: static;
    top: 10px; /* 无效 */
}
```

### 2. relative（相对定位）
- 特点：相对于元素自身原本位置进行偏移，不脱离文档流，原来的空间保留
- 应用场景：微调元素位置，作为绝对定位元素的定位参考

```css
.relative-element {
    position: relative;
    top: 20px;
    left: 10px;
}
```

### 3. absolute（绝对定位）
- 特点：相对于最近的非 static 定位祖先元素进行定位，脱离文档流，不占空间
- 应用场景：弹窗、下拉菜单、覆盖层等需要脱离文档流的元素

```css
.parent {
    position: relative;
}
.absolute-element {
    position: absolute;
    top: 10px;
    left: 20px;
}
```

### 4. fixed（固定定位）
- 特点：相对于浏览器窗口进行定位，不随页面滚动而移动，脱离文档流
- 应用场景：固定导航栏、回到顶部按钮、悬浮广告等

```css
.fixed-element {
    position: fixed;
    top: 0;
    right: 0;
}
```

### 5. sticky（粘性定位）
- 特点：结合了 relative 和 fixed 的特性，在阈值内表现为相对定位，超过阈值后表现为固定定位
- 应用场景：表格头、导航栏等需要在滚动时固定在页面顶部的元素

```css
.sticky-element {
    position: sticky;
    top: 0;
}
```

### 总结
- static：默认定位，不支持偏移
- relative：相对自身定位，保留原空间
- absolute：相对于祖先元素定位，脱离文档流
- fixed：相对于视窗定位，脱离文档流
- sticky：滚动时表现不同，先相对后固定
