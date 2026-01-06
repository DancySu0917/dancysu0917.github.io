# display:inline-block IE6/7 不支持？（必会）

**题目**: display:inline-block IE6/7 不支持？（必会）

**答案**:

在 IE6 和 IE7 中，`display: inline-block` 属性确实不被原生支持，这在早期的前端开发中是一个常见的兼容性问题。不过，IE6 和 IE7 提供了一个私有属性 `zoom: 1`，结合 `display: inline` 可以模拟 `inline-block` 的效果。

## IE6/7 中的问题

在 IE6/7 中直接使用 `display: inline-block` 会无效：

```css
/* 在 IE6/7 中不起作用 */
.element {
  display: inline-block;
  width: 100px;
  height: 100px;
  background: red;
}
```

## 解决方案

### 1. 使用 zoom 和 display:inline 组合

```css
/* IE6/7 兼容的 inline-block */
.element {
  display: inline; /* 或者 display: inline-block */
  zoom: 1;         /* 触发 IE 的 hasLayout */
  width: 100px;
  height: 100px;
  background: red;
}

/* 标准浏览器 */
.element {
  display: inline-block;
  width: 100px;
  height: 100px;
  background: red;
}
```

### 2. 使用条件注释区分 IE6/7

```html
<style>
/* 标准浏览器 */
.element {
  display: inline-block;
  width: 100px;
  height: 100px;
  background: red;
}
</style>

<!--[if lte IE 7]>
<style>
/* IE6/7 专用 */
.element {
  display: inline;
  zoom: 1;
}
</style>
<![endif]-->
```

### 3. CSS Hack 方式

```css
.element {
  display: inline-block;
  width: 100px;
  height: 100px;
  background: red;
}

/* IE6/7 Hack */
.element {
  *display: inline; /* IE6/7 */
  *zoom: 1;         /* IE6/7 */
}
```

### 4. 使用 display:inline + zoom:1 的原理

在 IE6/7 中，`zoom: 1` 会触发元素的 "hasLayout" 属性，使得元素具有块级元素的特性（可以设置宽高），同时保持 `display: inline` 的特性（不会独占一行）：

```css
/* 完整的跨浏览器兼容方案 */
.cross-browser-inline-block {
  display: inline-block;
  width: 100px;
  height: 100px;
  background: red;
}

/* IE6/7 兼容 */
.cross-browser-inline-block {
  *display: inline;
  *zoom: 1;
}

/* 或者使用 */
.cross-browser-inline-block-ie67 {
  display: inline;
  zoom: 1;
  width: 100px;
  height: 100px;
  background: red;
}
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .item {
      display: inline-block;
      width: 100px;
      height: 50px;
      background: lightblue;
      margin: 5px;
      border: 1px solid #ccc;
      text-align: center;
      line-height: 50px;
    }
    
    /* IE6/7 兼容 */
    .item {
      *display: inline;
      *zoom: 1;
    }
  </style>
</head>
<body>
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</body>
</html>
```

## 注意事项

1. **zoom 属性**: `zoom: 1` 只在 IE 浏览器中有效，它会触发元素的 hasLayout，这是 IE6/7 中解决许多布局问题的关键。
2. **兼容性**: 现代浏览器已经完全支持 `display: inline-block`，这个问题主要出现在需要兼容旧版 IE 的项目中。
3. **替代方案**: 在现代开发中，可以使用 Flexbox 或 Grid 来实现更复杂的布局需求。

虽然现在很少需要兼容 IE6/7，但了解这个历史问题有助于理解 CSS 的发展历程和一些遗留代码的解决方案。
