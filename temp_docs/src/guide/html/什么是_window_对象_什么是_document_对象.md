# 什么是 window 对象？什么是 document 对象？（必会）

**题目**: 什么是 window 对象？什么是 document 对象？（必会）

## 答案

`window`对象和`document`对象是JavaScript中两个核心的全局对象，它们在浏览器环境中扮演着不同的角色：

### 1. Window对象

#### 定义
- `window`对象是浏览器窗口的JavaScript表示
- 是JavaScript在浏览器中的全局对象
- 所有全局变量和函数都是`window`对象的属性和方法

#### 特点
- 每个浏览器窗口都有一个对应的`window`对象
- 是所有其他浏览器对象的顶层对象
- 提供了与浏览器窗口交互的接口

#### 主要功能
- 控制窗口大小和位置
- 管理弹出窗口
- 处理浏览器历史记录
- 提供定时器功能
- 访问其他浏览器API

#### 常用方法和属性
```javascript
// 窗口控制
window.open('https://example.com');
window.close();

// 窗口尺寸
window.innerWidth, window.innerHeight;
window.outerWidth, window.outerHeight;

// 定时器
window.setTimeout(), window.setInterval();

// 浏览器信息
window.navigator;
window.location;
window.history;

// 事件处理
window.addEventListener('load', handler);
window.addEventListener('resize', handler);
```

### 2. Document对象

#### 定义
- `document`对象是HTML文档的根节点
- 是DOM（文档对象模型）的入口点
- 代表整个HTML页面的内容

#### 特点
- 每个HTML文档都有一个对应的`document`对象
- 继承自`window`对象（`window.document`）
- 提供了操作HTML元素和内容的接口

#### 主要功能
- 查找和操作HTML元素
- 修改页面内容和结构
- 处理页面事件
- 管理样式和CSS

#### 常用方法和属性
```javascript
// 元素查找
document.getElementById('id');
document.querySelector('selector');
document.querySelectorAll('selector');

// 元素创建
document.createElement('div');
document.createTextNode('text');

// 内容操作
document.body;
document.title;
document.URL;

// 事件处理
document.addEventListener('click', handler);
```

### 3. 两者关系

#### 层次关系
- `window`是顶级对象
- `document`是`window`的属性之一
- `window.document`指向文档对象

#### 依赖关系
- `document`对象存在于`window`对象中
- 没有`window`就没有`document`
- `document`是`window`对象的一个重要组成部分

### 4. 使用场景

#### Window对象使用场景
- 页面跳转和窗口控制
- 浏览器功能检测
- 窗口事件监听
- 全局状态管理

#### Document对象使用场景
- DOM元素操作
- 页面内容动态更新
- 表单处理
- 事件委托

### 5. 代码示例

```javascript
// Window对象示例
console.log(window.innerWidth); // 获取窗口宽度
window.alert('Hello World'); // 弹出警告框
window.addEventListener('load', function() {
    console.log('页面加载完成');
});

// Document对象示例
const element = document.getElementById('myElement');
document.body.style.backgroundColor = 'lightblue';
document.addEventListener('click', function(event) {
    console.log('页面被点击');
});
```

### 6. 注意事项

- `window`是全局对象，可以直接访问其属性和方法
- `document`是`window`的属性，用于操作文档内容
- 理解两者的区别对于前端开发至关重要
- 在现代前端框架中，虽然直接操作DOM减少，但理解这两个对象仍然重要

理解`window`和`document`对象的区别和关系是掌握JavaScript和前端开发的基础。
