# 设置较小高度标签（一般小于 10px），在 IE6，IE7 中高度超出自己设置高度？（必会）

**题目**: 设置较小高度标签（一般小于 10px），在 IE6，IE7 中高度超出自己设置高度？（必会）

**答案**:

在 IE6 和 IE7 中，当设置元素高度小于 10px 时，元素的实际高度会显示为 10px（或更高），而不是设置的较小高度。这是 IE6/IE7 的一个已知问题。

## 问题原因

这个问题的根本原因是 IE6/IE7 中的 "最小高度限制"：
- IE6/IE7 会强制设置一个最小高度，通常是 10px 或 1.1em
- 这是为了防止元素高度过小导致内容不可见
- 这个限制影响了所有块级元素

## 解决方案

### 1. 使用 overflow: hidden

```css
.small-height-element {
  height: 5px;
  overflow: hidden;
}
```

### 2. 使用 font-size 控制

```css
.small-height-element {
  height: 5px;
  font-size: 0;  /* 通过设置字体大小为0来突破最小高度限制 */
  line-height: 0;
  overflow: hidden;
}
```

### 3. 使用 line-height

```css
.small-height-element {
  height: 5px;
  line-height: 5px;  /* 设置与高度相同的行高 */
  font-size: 0;
  overflow: hidden;
}
```

### 4. 使用 zoom: 0.1 或其他小值

```css
.small-height-element {
  height: 5px;
  zoom: 0.1;  /* IE6/7 特有的缩放属性 */
  overflow: hidden;
}
```

### 5. 使用条件注释和 CSS Hack

```css
/* 标准浏览器 */
.small-height-element {
  height: 5px;
}

/* IE6/7 特定修复 */
.small-height-element {
  *font-size: 0;      /* IE6/7 Hack */
  *line-height: 0;    /* IE6/7 Hack */
  *overflow: hidden;  /* IE6/7 Hack */
}
```

### 6. 使用图片或背景

```css
/* 使用背景图片替代小高度元素 */
.small-height-element {
  width: 100px;
  height: 5px;
  background: url('small-height-bg.png') no-repeat;
  font-size: 0;
  line-height: 0;
  overflow: hidden;
}
```

### 7. 使用伪元素

```css
.small-height-element {
  position: relative;
  height: 20px;  /* 给容器一个足够高度 */
}

.small-height-element:after {
  content: '';
  display: block;
  height: 5px;
  background: red;
}
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* 标准浏览器样式 */
    .ie67-fix {
      height: 5px;
      background: red;
      margin: 10px 0;
    }
    
    /* IE6/7 专用修复 */
    .ie67-fix {
      *font-size: 0;
      *line-height: 0;
      *overflow: hidden;
    }
    
    /* 或者使用 */
    .ie67-fix-alt {
      height: 5px;
      background: blue;
      *font-size: 0;
      *zoom: 1;
      *overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- 这个元素在 IE6/7 中会显示为 10px 高 -->
  <div class="ie67-fix">标准样式元素</div>
  
  <!-- 这个元素在 IE6/7 中会正确显示为 5px 高 -->
  <div class="ie67-fix-alt">修复后元素</div>
</body>
</html>
```

## JavaScript 解决方案

```javascript
// 检测 IE6/7 并动态修复
function fixSmallHeightForIE() {
  var isIE67 = false;
  
  // 检测 IE6/7
  if (document.all && !window.XMLHttpRequest) {
    isIE67 = true;  // IE6
  } else if (document.all && window.XMLHttpRequest && !document.querySelector) {
    isIE67 = true;  // IE7
  }
  
  if (isIE67) {
    // 为所有需要修复的元素添加特殊类
    var elements = document.getElementsByClassName('small-height-fix');
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      element.style.fontSize = '0';
      element.style.lineHeight = '0';
      element.style.overflow = 'hidden';
    }
  }
}

// 页面加载完成后执行修复
window.onload = fixSmallHeightForIE;
```

## 注意事项

1. **测试验证**: 在 IE6/7 中测试以确保修复有效
2. **内容处理**: 使用这些方法时，元素内部不应有可见内容
3. **性能考虑**: CSS Hack 应该谨慎使用，只在必要时应用
4. **现代开发**: 现代项目通常不再需要兼容 IE6/7

## 总结

IE6/IE7 中的小高度元素问题可以通过多种方式解决，最常用的是设置 `font-size: 0` 和 `line-height: 0`，然后使用 `overflow: hidden` 隐藏可能的溢出内容。这些技巧是前端开发历史上的重要知识，帮助开发者在那个兼容性挑战巨大的时代创建跨浏览器兼容的网站。

虽然现代浏览器已经解决了这些问题，但了解这些历史兼容性问题是理解 CSS 发展历程和前端技术演进的重要部分。
