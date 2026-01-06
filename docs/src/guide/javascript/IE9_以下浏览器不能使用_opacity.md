# IE9 以下浏览器不能使用 opacity？（必会）

**题目**: IE9 以下浏览器不能使用 opacity？（必会）

**答案**:

是的，IE8及更早版本的Internet Explorer浏览器不支持标准的CSS `opacity` 属性，需要使用IE特有的滤镜（filter）属性来实现透明效果。

## 1. IE8及以下浏览器的透明度实现

### 使用IE滤镜（filter）
```css
/* IE8及以下版本使用滤镜实现透明度 */
.transparent-element {
  /* 标准CSS（IE9+和其他现代浏览器） */
  opacity: 0.5;
  
  /* IE8及以下版本的滤镜 */
  filter: alpha(opacity=50);
}

/* 完整的兼容性写法 */
.element {
  opacity: 0.7;                    /* 标准浏览器 */
  filter: alpha(opacity=70);        /* IE8及以下 */
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=70)"; /* IE8 */
}
```

### 滤镜属性详解
- `alpha(opacity=X)`：X为0-100的数值，0表示完全透明，100表示完全不透明
- `progid:DXImageTransform.Microsoft.Alpha`：完整的滤镜标识符

## 2. 不同IE版本的透明度支持

### IE9
- **支持**：标准的 `opacity` 属性
- **兼容性**：可以使用标准CSS写法

### IE8及以下
- **不支持**：标准的 `opacity` 属性
- **支持**：`filter` 属性和 `alpha` 滤镜

## 3. 实现兼容性的完整方案

### CSS兼容写法
```css
/* 实现半透明效果的兼容性写法 */
.semitransparent {
  opacity: 0.5;                    /* 现代浏览器 */
  filter: alpha(opacity=50);        /* IE8及以下 */
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)"; /* IE8 */
}

/* 渐变透明效果 */
.gradient-transparent {
  opacity: 0.8;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#CCFFFFFF, endColorstr=#CC000000);
  zoom: 1; /* 触发IE的hasLayout */
}
```

### JavaScript动态设置透明度
```javascript
function setOpacity(element, opacity) {
  // 标准浏览器
  if (typeof element.style.opacity !== 'undefined') {
    element.style.opacity = opacity;
  }
  // IE8及以下
  else if (typeof element.style.filter !== 'undefined') {
    element.style.filter = 'alpha(opacity=' + Math.round(opacity * 100) + ')';
  }
}

// 使用示例
var myElement = document.getElementById('myDiv');
setOpacity(myElement, 0.5); // 设置50%透明度
```

## 4. IE滤镜的其他透明度效果

### 基本透明度滤镜
```css
/* 不同透明度值 */
.transparent-10 { filter: alpha(opacity=10); }  /* 10%不透明 */
.transparent-25 { filter: alpha(opacity=25); }  /* 25%不透明 */
.transparent-50 { filter: alpha(opacity=50); }  /* 50%不透明 */
.transparent-75 { filter: alpha(opacity=75); }  /* 75%不透明 */
.transparent-90 { filter: alpha(opacity=90); }  /* 90%不透明 */
```

### 高级滤镜效果
```css
/* 渐变透明效果 */
.gradient-opacity {
  filter: progid:DXImageTransform.Microsoft.Gradient(
    GradientType=0, 
    StartColorStr='#00FFFFFF', 
    EndColorStr='#FFFFFFFF'
  );
}

/* 模糊效果 */
.blur-effect {
  filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=2);
}
```

## 5. 现代替代方案

### 使用CSS3渐变
```css
/* 现代浏览器的透明度实现 */
.modern-transparent {
  opacity: 0.5;
  /* 支持rgba颜色值 */
  background-color: rgba(255, 255, 255, 0.5);
}
```

### 使用CSS前缀
```css
.cross-browser-transparent {
  opacity: 0.6;
  -webkit-opacity: 0.6;  /* 旧版Safari/Chrome */
  -moz-opacity: 0.6;     /* 旧版Firefox */
  filter: alpha(opacity=60); /* IE8及以下 */
}
```

## 6. 条件注释方案

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .transparent {
      opacity: 0.5;  /* 现代浏览器 */
    }
  </style>
  
  <!--[if lte IE 8]>
  <style>
    .transparent {
      filter: alpha(opacity=50);  /* IE8及以下 */
    }
  </style>
  <![endif]-->
</head>
<body>
  <div class="transparent">这个元素在所有浏览器中都有透明效果</div>
</body>
</html>
```

## 7. 注意事项

### 性能考虑
- IE滤镜可能影响渲染性能
- 频繁改变透明度可能导致页面重绘

### 兼容性测试
- 在实际的IE8及以下版本中测试效果
- 注意滤镜对子元素的影响

### 渐进增强
```css
/* 基础样式 */
.element {
  background-color: white;
}

/* 增强样式（支持透明度的浏览器） */
.supports-opacity .element {
  opacity: 0.8;
  background-color: rgba(255, 255, 255, 0.8);
}

/* IE8及以下的特殊处理 */
.ie8 .element {
  filter: alpha(opacity=80);
}
```

**总结**：IE8及以下版本确实不支持标准的opacity属性，需要使用IE特有的filter属性配合alpha滤镜来实现透明效果。在开发需要兼容旧版IE的项目时，必须考虑这种差异并提供相应的兼容性处理。
