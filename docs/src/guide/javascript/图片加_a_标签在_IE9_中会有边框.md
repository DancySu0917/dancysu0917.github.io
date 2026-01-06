# 图片加 a 标签在 IE9 中会有边框？（必会）

**题目**: 图片加 a 标签在 IE9 中会有边框？（必会）

**答案**:

是的，在 IE9 中，当图片被 `<a>` 标签包裹时，会自动添加一个蓝色或黑色的边框。这是 IE9 的默认样式行为，主要是为了表示该图片是一个可点击的链接元素。

## 问题原因

- **默认样式**: IE9 为链接元素（包括包含图片的链接）添加了默认边框样式
- **无障碍访问**: 这种边框有助于用户识别可点击的元素
- **浏览器差异**: 其他浏览器可能没有这种默认样式或样式不同

## 解决方案

### 1. 使用 CSS 去除边框

```css
/* 方法一：直接设置边框为0 */
a img {
  border: none;
}

/* 或者 */
a img {
  border: 0;
}
```

### 2. 使用 outline 属性

```css
/* 去除链接的轮廓 */
a {
  outline: none;
}

/* 或者只针对图片链接 */
a img {
  outline: none;
}
```

### 3. 使用 CSS Reset

```css
/* 通用的链接图片样式重置 */
a img,
img a {
  border: none;
  outline: none;
  text-decoration: none;
}
```

### 4. 使用特定类名

```css
/* 为特定需要去除边框的图片链接添加类 */
.no-border img,
img.no-border {
  border: none !important;
}
```

### 5. 使用属性选择器

```css
/* 针对所有包含图片的链接 */
a[href] img {
  border: none;
}

/* 或者针对所有包含图片的链接 */
a img[alt] {
  border: none;
}
```

### 6. 完整的兼容性解决方案

```css
/* 针对 IE6-IE9 的兼容性处理 */
a img {
  border: none;
  /* 防止 IE 中的边框 */
  border-style: none;
}

/* 确保在所有浏览器中都没有边框 */
img {
  border: none;
}

/* 去除链接样式 */
a img {
  text-decoration: none;
  outline: none;
}
```

### 7. 使用条件注释（针对 IE9）

```html
<style>
/* 所有浏览器 */
a img {
  border: none;
}
</style>

<!--[if IE 9]>
<style>
/* IE9 专用样式 */
a img {
  border: 0;
  border-style: none;
}
</style>
<![endif]-->
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* 去除图片链接的边框 */
    a img {
      border: none;
      outline: none;
    }
    
    /* 或者更完整的重置 */
    img {
      border: none;
    }
    
    a:link img,
    a:visited img,
    a:hover img,
    a:active img {
      border: none;
      outline: none;
    }
  </style>
</head>
<body>
  <!-- 有边框的问题示例（在IE9中） -->
  <a href="#">
    <img src="example.jpg" alt="Example Image">
  </a>
  
  <!-- 修复后的示例 -->
  <a href="#" class="no-border-link">
    <img src="example.jpg" alt="Example Image" class="no-border-img">
  </a>
</body>
</html>
```

## 高级解决方案

### 使用 JavaScript 动态修复

```javascript
// 检测 IE9 并动态添加样式
function fixIE9ImageBorder() {
  // 检测 IE9
  var isIE9 = navigator.userAgent.indexOf('MSIE 9') !== -1;
  
  if (isIE9) {
    // 为所有图片链接添加边框样式
    var imgLinks = document.querySelectorAll('a img');
    for (var i = 0; i < imgLinks.length; i++) {
      imgLinks[i].style.border = 'none';
    }
  }
}

// 页面加载完成后执行
window.onload = fixIE9ImageBorder;
```

### 使用现代 CSS 方法

```css
/* 使用 CSS3 选择器更精确地定位 */
a[href^="http://"] img,
a[href^="https://"] img {
  border: none;
}

/* 或者使用 :not() 选择器 */
a:not([class*="border"]) img {
  border: none;
}
```

## 注意事项

1. **无障碍访问**: 去除边框可能影响无障碍访问，考虑使用其他视觉提示
2. **焦点样式**: 确保键盘导航用户仍能识别焦点元素
3. **浏览器前缀**: 在某些情况下可能需要使用浏览器特定的样式

```css
/* 保持键盘导航的焦点指示 */
a img:focus {
  outline: 2px dotted #000; /* 为键盘用户提供视觉反馈 */
}
```

4. **测试验证**: 在 IE9 中测试以确保修复有效

## 最佳实践

1. **CSS Reset**: 在项目开始时使用 CSS Reset 来统一各浏览器的默认样式
2. **渐进增强**: 确保去除边框不影响用户体验
3. **无障碍考虑**: 提供替代的焦点指示方式

```css
/* 推荐的通用解决方案 */
img {
  border: none;
}

a img {
  border: none;
  outline: none;
}

/* 为键盘用户提供焦点样式 */
a:focus img {
  outline: 2px solid #007cba; /* 为键盘用户提供视觉反馈 */
}
```

虽然 IE9 已经是历史浏览器，但了解这些兼容性问题有助于理解浏览器的发展历程和 CSS 的演进。
