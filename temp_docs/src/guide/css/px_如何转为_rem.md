# px 如何转为 rem（了解）

**题目**: px 如何转为 rem（了解）

**答案**:

将px单位转换为rem单位是响应式开发中的常见需求。rem是相对于根元素（html）字体大小的单位，转换方法如下：

## 基本转换公式

```
rem值 = px值 ÷ 根元素字体大小
```

## 具体转换方法

### 1. 手动计算转换

假设根元素字体大小为16px（浏览器默认值）：
- 16px = 1rem (16 ÷ 16 = 1)
- 32px = 2rem (32 ÷ 16 = 2)
- 24px = 1.5rem (24 ÷ 16 = 1.5)

如果根元素字体大小为100px：
- 100px = 1rem (100 ÷ 100 = 1)
- 50px = 0.5rem (50 ÷ 100 = 0.5)
- 150px = 1.5rem (150 ÷ 100 = 1.5)

### 2. 转换示例

```css
/* 假设根字体大小为100px */
html {
    font-size: 100px;
}

/* px转换为rem */
.container {
    width: 375px;      /* 设计稿中的宽度 */
    width: 3.75rem;    /* 转换后的rem值 (375 ÷ 100 = 3.75) */
    height: 200px;     /* 设计稿中的高度 */
    height: 2rem;      /* 转换后的rem值 (200 ÷ 100 = 2) */
    padding: 20px;     /* 设计稿中的内边距 */
    padding: 0.2rem;   /* 转换后的rem值 (20 ÷ 100 = 0.2) */
    font-size: 28px;   /* 设计稿中的字体大小 */
    font-size: 0.28rem; /* 转换后的rem值 (28 ÷ 100 = 0.28) */
}
```

### 3. 常用转换对照表（根字体大小为100px）

| px值 | rem值 | px值 | rem值 |
|------|-------|------|-------|
| 1px  | 0.01rem | 50px | 0.5rem |
| 2px  | 0.02rem | 100px| 1rem  |
| 5px  | 0.05rem | 150px| 1.5rem|
| 10px | 0.1rem  | 200px| 2rem  |
| 15px | 0.15rem | 300px| 3rem  |
| 20px | 0.2rem  | 400px| 4rem  |

### 4. JavaScript动态转换

```javascript
// 根据根字体大小转换px到rem
function pxToRem(pxValue) {
    // 获取根元素字体大小
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    // 计算rem值
    return pxValue / rootFontSize;
}

// 使用示例
console.log(pxToRem(100)); // 如果根字体是100px，输出1
console.log(pxToRem(50));  // 如果根字体是100px，输出0.5
```

### 5. 构建工具自动转换

使用PostCSS插件自动转换：

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 100,      // 根字体大小基准
      unitPrecision: 5,    // 保留小数位数
      propList: ['*'],     // 需要转换的属性，*表示所有
      selectorBlackList: [], // 忽略转换的选择器
      replace: true,       // 直接替换原值
      mediaQuery: false,   // 是否转换媒体查询中的px
      minPixelValue: 0     // 小于该值的px不转换
    }
  }
}
```

配置说明：
- `rootValue`: 根字体大小，对应html元素的font-size
- `unitPrecision`: 转换后rem值的小数位数
- `propList`: 需要转换的CSS属性列表
- `selectorBlackList`: 不需要转换的选择器列表

### 6. 在线转换工具

在开发过程中，可以使用在线px-to-rem转换工具，或者浏览器开发者工具的计算功能：

```css
/* 在浏览器开发者工具中可以直接计算 */
.container {
    width: calc(375 / 100 * 1rem);  /* 直接计算，结果为3.75rem */
}
```

### 7. 实际项目中的转换策略

1. **确定基准根字体大小**：通常根据设计稿宽度确定，如设计稿750px，设置根字体为75px或100px
2. **统一转换标准**：团队内约定统一的转换方法和工具
3. **使用构建工具**：通过自动化工具处理转换，减少手动计算错误
4. **测试适配效果**：在不同设备上测试转换后的效果

## 注意事项

1. **根字体大小一致性**：确保转换时使用的根字体大小与实际设置的值一致
2. **小数精度**：转换后可能产生多位小数，注意设置合适的精度
3. **特殊元素**：某些固定像素值的元素（如border: 1px）可能不需要转换
4. **性能考虑**：大量转换可能影响性能，可使用缓存或优化转换函数

通过合理的px到rem转换，可以实现更好的响应式设计效果。
