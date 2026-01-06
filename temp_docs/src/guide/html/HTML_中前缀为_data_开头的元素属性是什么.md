# HTML 中前缀为 data- 开头的元素属性是什么？（了解）

**题目**: HTML 中前缀为 data- 开头的元素属性是什么？（了解）

## 答案

HTML中以`data-`开头的属性被称为自定义数据属性（Custom Data Attributes），是HTML5引入的特性，用于存储页面或应用程序的私有自定义数据。

### 1. 定义和用途

#### 自定义数据属性
- 以`data-`前缀开头的属性
- 用于存储与元素相关的自定义数据
- 不影响元素的渲染和行为
- 为JavaScript提供额外的数据存储方式

### 2. 语法规范

#### 基本语法
```html
<div data-name="value" data-age="25" data-user-id="12345"></div>
```

#### 命名规则
- 必须以`data-`开头
- 不能包含大写字母
- 可以包含字母、数字、连字符、点号、冒号、下划线
- 不能是空字符串

### 3. 使用场景

#### 存储额外信息
- 存储与元素相关的业务数据
- 传递参数给JavaScript函数
- 保存配置选项

#### 前后端数据交互
- 从后端模板引擎传递数据到前端
- 存储API返回的元数据
- 保存表单验证规则

### 4. JavaScript操作

#### 获取数据属性值
```javascript
const element = document.querySelector('div');
const value = element.dataset.name; // 获取 data-name 的值
const age = element.dataset.age; // 获取 data-age 的值
```

#### 设置数据属性值
```javascript
element.dataset.name = 'newName'; // 设置 data-name 的值
element.setAttribute('data-status', 'active'); // 另一种设置方式
```

#### 驼峰命名转换
- HTML中的`data-user-id`对应JavaScript中的`dataset.userId`
- 连字符后的字母会被转换为大写

### 5. dataset API

#### dataset属性
- 每个HTML元素都有`dataset`属性
- 返回一个DOMStringMap对象
- 包含元素的所有data属性

#### 操作示例
```javascript
// HTML: <div id="user" data-name="John" data-age="30" data-is-admin="true"></div>
const userElement = document.getElementById('user');

// 读取数据
console.log(userElement.dataset.name); // "John"
console.log(userElement.dataset.age); // "30"
console.log(userElement.dataset.isAdmin); // "true" (驼峰转换)

// 设置数据
userElement.dataset.status = 'online';
// 结果: <div data-name="John" data-age="30" data-is-admin="true" data-status="online"></div>

// 删除数据
delete userElement.dataset.age;
// 结果: <div data-name="John" data-is-admin="true" data-status="online"></div>
```

### 6. 实际应用示例

#### 模态框数据传递
```html
<button data-modal-title="用户信息" data-modal-content="用户详细资料">打开模态框</button>
```

```javascript
document.querySelector('button').addEventListener('click', function() {
    const title = this.dataset.modalTitle;
    const content = this.dataset.modalContent;
    // 使用数据打开模态框
});
```

#### 列表项标识
```html
<ul>
    <li data-id="1" data-category="tech">技术文章</li>
    <li data-id="2" data-category="news">新闻资讯</li>
    <li data-id="3" data-category="sports">体育新闻</li>
</ul>
```

```javascript
document.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', function() {
        const id = this.dataset.id;
        const category = this.dataset.category;
        console.log(`点击了${category}分类，ID为${id}的项目`);
    });
});
```

### 7. 与CSS的结合使用

#### CSS选择器
```css
/* 选择具有特定data属性的元素 */
div[data-status="active"] {
    background-color: green;
}

/* 选择具有特定data属性值的元素 */
li[data-category="tech"] {
    color: blue;
}

/* 使用属性选择器 */
[data-hidden="true"] {
    display: none;
}
```

#### 伪元素内容
```css
.item::before {
    content: attr(data-label);
}
```

### 8. 最佳实践

#### 数据类型
- data属性值始终是字符串类型
- 复杂数据建议使用JSON格式
- 数值需要手动转换

#### 性能考虑
- 不要存储大量数据
- 避免存储敏感信息
- 考虑使用localStorage或sessionStorage存储大量数据

#### 可访问性
- 不要将关键信息仅存储在data属性中
- 确保数据对辅助技术可用

### 9. 与其他技术的集成

#### 框架集成
- React、Vue等框架都有对应的处理方式
- 可以在组件中使用data属性传递数据

#### AJAX请求
- 可以存储API端点信息
- 保存请求参数和配置

自定义数据属性是HTML5的重要特性，为前端开发提供了灵活的数据存储和传递方式，是连接HTML和JavaScript的重要桥梁。
