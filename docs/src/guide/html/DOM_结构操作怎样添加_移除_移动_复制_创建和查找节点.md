# DOM 结构操作怎样添加、移除、移动、复制、创建和查找节点？（必会）

**题目**: DOM 结构操作怎样添加、移除、移动、复制、创建和查找节点？（必会）

## 答案

DOM结构操作是前端开发中的核心技能，以下是DOM节点操作的常用方法：

### 1. 创建节点

#### 创建元素节点
```javascript
const element = document.createElement('div');
```

#### 创建文本节点
```javascript
const textNode = document.createTextNode('Hello World');
```

#### 创建文档片段（提高性能）
```javascript
const fragment = document.createDocumentFragment();
```

### 2. 添加节点

#### 在父元素末尾添加子节点
```javascript
parentElement.appendChild(childNode);
```

#### 在指定位置插入节点
```javascript
parentElement.insertBefore(newNode, referenceNode);
```

#### 使用insertAdjacentElement方法
```javascript
element.insertAdjacentElement('beforebegin', newNode); // 在元素前面
element.insertAdjacentElement('afterbegin', newNode);  // 在元素内部开头
element.insertAdjacentElement('beforeend', newNode);   // 在元素内部末尾
element.insertAdjacentElement('afterend', newNode);    // 在元素后面
```

### 3. 移除节点

#### 移除子节点
```javascript
parentElement.removeChild(childNode);
```

#### 移除自身节点
```javascript
node.remove(); // 现代浏览器支持
// 或者
node.parentNode.removeChild(node);
```

### 4. 移动节点

移动节点实际上是将节点从一个位置添加到另一个位置，由于DOM节点不能同时存在于多个位置：

```javascript
// 移动现有节点到新位置
const nodeToMove = document.getElementById('myElement');
newParent.appendChild(nodeToMove); // 会自动从原位置移除
```

### 5. 复制节点

#### 浅复制（仅复制节点本身）
```javascript
const shallowCopy = node.cloneNode(false);
```

#### 深复制（复制节点及其所有子节点）
```javascript
const deepCopy = node.cloneNode(true);
```

### 6. 查找节点

#### 通过ID查找
```javascript
const element = document.getElementById('myId');
```

#### 通过类名查找
```javascript
const elements = document.getElementsByClassName('myClass');
```

#### 通过标签名查找
```javascript
const elements = document.getElementsByTagName('div');
```

#### 通过CSS选择器查找
```javascript
// 查找单个元素
const element = document.querySelector('.myClass #myId');

// 查找多个元素
const elements = document.querySelectorAll('div.myClass');
```

#### 通过name属性查找（主要用于表单元素）
```javascript
const elements = document.getElementsByName('fieldName');
```

### 7. 节点关系查找

#### 父节点
```javascript
const parent = childNode.parentNode;
```

#### 子节点
```javascript
const children = parentNode.children; // 只包含元素节点
const childNodes = parentNode.childNodes; // 包含所有类型的节点
```

#### 兄弟节点
```javascript
const nextSibling = node.nextSibling;
const previousSibling = node.previousSibling;
const nextElementSibling = node.nextElementSibling;
const previousElementSibling = node.previousElementSibling;
```

#### 第一个和最后一个子节点
```javascript
const firstChild = parentNode.firstChild;
const lastChild = parentNode.lastChild;
const firstElementChild = parentNode.firstElementChild;
const lastElementChild = parentNode.lastElementChild;
```

### 8. 实际应用示例

```javascript
// 创建一个新元素
const newDiv = document.createElement('div');
newDiv.className = 'new-element';
newDiv.textContent = '这是一个新元素';

// 添加到页面中
document.body.appendChild(newDiv);

// 复制一个现有元素
const existingElement = document.getElementById('existing');
const copiedElement = existingElement.cloneNode(true);

// 移除一个元素
const elementToRemove = document.getElementById('toBeRemoved');
elementToRemove.remove();

// 查找并修改元素
const elements = document.querySelectorAll('.item');
elements.forEach(item => {
    item.style.color = 'red';
});
```

掌握这些DOM操作方法对于动态更新页面内容、实现交互功能至关重要。
