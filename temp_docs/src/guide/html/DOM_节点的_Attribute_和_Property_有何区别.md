# DOM 节点的 Attribute 和 Property 有何区别？（必会）

**题目**: DOM 节点的 Attribute 和 Property 有何区别？（必会）

## 答案

在DOM操作中，Attribute和Property是两个容易混淆但非常重要的概念，它们之间存在显著的区别：

### 1. 定义
- **Attribute（属性）**：HTML标签上的特性，是HTML文档的一部分，定义在HTML标签中
- **Property（属性）**：DOM对象上的JavaScript属性，是元素对象的属性

### 2. 位置不同
- **Attribute**：存在于HTML文档中，是标签上的特性
- **Property**：存在于DOM对象中，是JavaScript对象的属性

### 3. 更新机制
- **Attribute**：初始化时起作用，之后的修改不一定反映到Property上
- **Property**：动态变化，反映元素的当前状态

### 4. 数据类型
- **Attribute**：只能是字符串类型
- **Property**：可以是任意JavaScript数据类型（字符串、数字、布尔值、对象等）

### 5. 举例说明

```html
<input id="myInput" type="text" value="Hello">
```

```javascript
const input = document.getElementById('myInput');
console.log(input.getAttribute('value')); // "Hello" - Attribute
console.log(input.value); // "Hello" - Property

// 用户输入或JavaScript修改值后
input.value = "World";
console.log(input.getAttribute('value')); // "Hello" - Attribute未变
console.log(input.value); // "World" - Property已变
```

### 6. 同步关系
- 当页面加载时，Attribute的值会初始化对应的Property
- 之后Property的变化不会影响Attribute
- 某些特定属性（如id、title等）的Attribute变化会同步到Property

### 7. 布尔属性
- **Attribute**：存在即为true，不存在即为false
- **Property**：始终是布尔值

```html
<input type="checkbox" checked>
```

```javascript
const checkbox = document.querySelector('input');
console.log(checkbox.getAttribute('checked')); // ""
console.log(checkbox.checked); // true
```

### 8. 使用场景
- **Attribute**：用于获取HTML中定义的初始值，或操作自定义属性
- **Property**：用于获取和设置元素的当前状态

### 9. 常见示例
- `element.getAttribute('class')` vs `element.className`
- `element.getAttribute('id')` vs `element.id`
- `element.getAttribute('value')` vs `element.value`

理解Attribute和Property的区别对于正确操作DOM元素非常重要，特别是在处理表单元素时。
