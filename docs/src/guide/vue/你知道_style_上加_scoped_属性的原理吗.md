# 你知道 style 上加 scoped 属性的原理吗？（必会）

**题目**: 你知道 style 上加 scoped 属性的原理吗？（必会）

## 标准答案

`scoped` 属性是 Vue 单文件组件中的一个特性，用于实现样式的作用域隔离。它通过在组件的 DOM 元素上添加唯一的属性标识符，并在 CSS 选择器中添加对应的属性选择器，从而实现样式仅作用于当前组件的效果。

## 深入理解

### scoped 的基本原理

Vue 的 `scoped` 属性通过 PostCSS 转换实现样式隔离：

```vue
<!-- 源码 -->
<template>
  <div class="container">
    <p class="text">这是一个组件</p>
  </div>
</template>

<style scoped>
.container {
  background-color: #f0f0f0;
}
.text {
  color: blue;
}
</style>
```

编译后：
```html
<div data-v-f3f3eg9 data-v-66666666>
  <p class="text" data-v-f3f3eg9 data-v-66666666>这是一个组件</p>
</div>
```

```css
/* 编译后的 CSS */
.container[data-v-f3f3eg9] {
  background-color: #f0f0f0;
}
.text[data-v-f3f3eg9] {
  color: blue;
}
```

### scoped 的实现机制

Vue 在编译过程中会为每个组件生成唯一的哈希值，并将其作为自定义属性添加到组件的所有元素上：

```javascript
// Vue 内部为每个组件生成唯一的哈希值
const componentId = 'data-v-' + hash(componentName)

// 然后将此 ID 添加到组件的所有元素上
// 并在 CSS 中使用属性选择器
```

### scoped 的局限性

1. **深度选择器**：对于子组件的样式修改，需要使用深度选择器：
```vue
<style scoped>
/* Vue 2.x 深度选择器 */
.parent >>> .child {
  color: red;
}

/* 或者使用 /deep/ */
.parent /deep/ .child {
  color: red;
}

/* 或者使用 ::v-deep */
.parent ::v-deep .child {
  color: red;
}
</style>
```

2. **Vue 3.x 中的深度选择器**：
```vue
<style scoped>
/* Vue 3.x 中的深度选择器 */
.parent :deep(.child) {
  color: red;
}
</style>
```

### scoped 的优势

1. **样式隔离**：防止样式污染全局
2. **避免命名冲突**：不同组件可以使用相同的类名
3. **模块化**：样式与组件绑定，便于维护

### scoped 的注意事项

1. **性能影响**：添加唯一属性和修改选择器会增加少量开销
2. **子组件样式**：无法直接修改子组件样式，需要使用深度选择器
3. **动态样式**：动态添加的元素不会自动添加 scoped 属性

### scoped 与 CSS Modules 的对比

```vue
<!-- scoped 方式 -->
<template>
  <div :class="$style.container">
    <p :class="$style.text">内容</p>
  </div>
</template>

<style module>
.container {
  background: #f0f0f0;
}
.text {
  color: blue;
}
</style>
```

### 实现原理的源码分析

Vue 编译器会：

1. 解析 `<style scoped>` 标签
2. 为组件生成唯一 ID
3. 将 ID 添加到模板的所有元素上
4. 修改 CSS 选择器，添加属性选择器
5. 输出到浏览器

```javascript
// 伪代码示例
function compileScopedStyle(template, styles, componentId) {
  // 1. 为所有元素添加唯一 ID
  const compiledTemplate = addAttributeToAllElements(template, componentId)
  
  // 2. 修改 CSS 选择器
  const compiledStyles = modifySelectors(styles, componentId)
  
  return { compiledTemplate, compiledStyles }
}
```

通过这种机制，`scoped` 属性实现了组件级别的样式隔离，确保每个组件的样式只影响自己的元素，而不影响其他组件。
