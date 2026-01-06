# Vue 渲染模板时怎么保留模板中的 HTML 注释呢？（必会）

**题目**: Vue 渲染模板时怎么保留模板中的 HTML 注释呢？（必会）

## 标准答案

在 Vue 2.x 中，默认情况下，HTML 注释在模板渲染时会被移除。如果需要保留注释，需要在 Vue 实例配置中设置 `comments: true` 选项。在 Vue 3.x 中，注释默认会被保留，无需特殊配置。

## 深入理解

### Vue 2.x 中保留注释

在 Vue 2.x 中，HTML 注释默认不会出现在渲染结果中，如果需要保留注释，可以通过设置 Vue 实例的 `comments` 选项：

```html
<!-- 模板 -->
<div id="app">
  <!-- 这是一个注释 -->
  <p>{{ message }}</p>
</div>
```

```javascript
// Vue 2.x 中保留注释的配置
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  comments: true  // 关键配置，保留注释
})
```

渲染结果：
```html
<div id="app">
  <!-- 这是一个注释 -->
  <p>Hello Vue!</p>
</div>
```

### Vue 3.x 中的注释处理

在 Vue 3.x 中，注释默认会被保留，无需特殊配置：

```javascript
// Vue 3.x
const { createApp } = Vue

createApp({
  data() {
    return {
      message: 'Hello Vue 3!'
    }
  }
}).mount('#app')
```

### 实际应用场景

1. **调试和开发**：保留注释有助于调试和理解模板结构
2. **文档生成**：注释可以作为自动生成文档的依据
3. **条件渲染标记**：在复杂模板中使用注释标记不同条件分支

### 注意事项

- `comments: true` 选项只在 Vue 2.x 中有效
- 保留注释会增加 HTML 体积，生产环境中应考虑是否必要
- 在服务器端渲染（SSR）中，注释的处理方式与客户端渲染一致
