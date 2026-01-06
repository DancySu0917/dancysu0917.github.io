# display：none 与 visibility：hidden 的区别？（必会）

**题目**: display：none 与 visibility：hidden 的区别？（必会）

**答案**:

`display: none` 和 `visibility: hidden` 都可以用来隐藏元素，但它们在实现方式和效果上有显著的区别：

## 主要区别

### 1. 占用空间方面
- `display: none`：元素完全从文档流中移除，不占用任何空间
- `visibility: hidden`：元素仍然占据原来的空间位置，只是视觉上不可见

### 2. 对子元素的影响
- `display: none`：所有子元素也会被隐藏，即使子元素设置了 `display: block`
- `visibility: hidden`：子元素也会被隐藏，但如果子元素设置了 `visibility: visible`，则子元素会显示

### 3. 重排（Reflow）和重绘（Repaint）
- `display: none`：会触发重排和重绘，因为改变了文档结构
- `visibility: hidden`：只触发重绘，不会触发重排，因为元素仍占据空间

## 详细对比

| 特性 | display: none | visibility: hidden |
|------|---------------|--------------------|
| 占用空间 | 否 | 是 |
| 触发重排 | 是 | 否 |
| 触发重绘 | 是 | 是 |
| 影响布局 | 是 | 否 |
| 子元素影响 | 完全隐藏 | 可以通过visible覆盖 |
| 性能影响 | 较大 | 较小 |

## 代码示例

### display: none 示例
```html
<div class="container">
    <div class="box" style="display: none;">隐藏的盒子</div>
    <div class="visible-box">可见的盒子</div>
</div>
```

```css
.container {
    width: 300px;
    border: 1px solid #ccc;
}

.box {
    width: 100px;
    height: 50px;
    background-color: red;
    display: none; /* 元素不显示，也不占用空间 */
}

.visible-box {
    width: 100px;
    height: 50px;
    background-color: blue;
}
```

在这种情况下，"隐藏的盒子"不显示，"可见的盒子"会紧贴容器顶部。

### visibility: hidden 示例
```html
<div class="container">
    <div class="box" style="visibility: hidden;">隐藏的盒子</div>
    <div class="visible-box">可见的盒子</div>
</div>
```

```css
.container {
    width: 300px;
    border: 1px solid #ccc;
}

.box {
    width: 100px;
    height: 50px;
    background-color: red;
    visibility: hidden; /* 元素不显示，但占用空间 */
}

.visible-box {
    width: 100px;
    height: 50px;
    background-color: blue;
}
```

在这种情况下，"隐藏的盒子"虽然不可见，但仍占用50px的高度空间，"可见的盒子"会位于其下方。

### 子元素控制示例
```html
<div class="parent" style="visibility: hidden;">
    <div class="child" style="visibility: visible;">子元素</div>
</div>
```

```css
.parent {
    width: 200px;
    height: 100px;
    background-color: red;
    visibility: hidden; /* 父元素隐藏 */
}

.child {
    width: 50px;
    height: 30px;
    background-color: blue;
    visibility: visible; /* 子元素显示，但不会生效，因为父元素是hidden */
}
```

注意：即使子元素设置了 `visibility: visible`，如果父元素是 `visibility: hidden`，子元素仍然不会显示。

## 使用场景

### display: none 适用于：
- 完全不需要元素参与布局时
- 动态添加/删除元素时
- 需要彻底移除元素对布局的影响时
- 性能要求不敏感的场景

### visibility: hidden 适用于：
- 需要保持元素在文档流中的位置时
- 频繁切换元素显示/隐藏状态时（性能更好）
- 不希望影响页面布局的情况下隐藏元素
- 需要保留元素的占位空间时

## JavaScript操作

```javascript
// 使用display
element.style.display = 'none';   // 隐藏
element.style.display = 'block';  // 显示

// 使用visibility
element.style.visibility = 'hidden';  // 隐藏
element.style.visibility = 'visible'; // 显示
```

## 性能考虑

- `display: none`：由于会触发重排，性能开销较大，特别是在大型页面中
- `visibility: hidden`：只触发重绘，性能开销较小，适合频繁切换

选择使用哪种方法取决于具体的使用场景和对布局的影响需求。
