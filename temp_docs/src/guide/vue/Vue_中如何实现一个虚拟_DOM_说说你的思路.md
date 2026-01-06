# Vue 中如何实现一个虚拟 DOM？说说你的思路（高薪常问）

**题目**: Vue 中如何实现一个虚拟 DOM？说说你的思路（高薪常问）

## 标准答案

实现虚拟 DOM 需要包含三个核心部分：VNode 创建函数、渲染函数和 Diff 算法。VNode 函数将真实 DOM 结构转换为 JavaScript 对象，渲染函数将 VNode 渲染为真实 DOM，Diff 算法则比较新旧 VNode 树并生成最小化更新。

## 深入理解

### 1. VNode 创建函数实现

VNode 是虚拟 DOM 的基本单元，需要创建一个函数来生成 VNode 对象：

```javascript
// VNode 创建函数
function VNode(tag, data, children, text, elm) {
  this.tag = tag;           // 标签名
  this.data = data;         // 节点数据（属性、事件等）
  this.children = children; // 子节点
  this.text = text;         // 文本内容
  this.elm = elm;           // 对应的真实 DOM 元素
  this.key = data && data.key; // 节点唯一标识
}

// 创建 VNode 的工厂函数
function createElement(tag, data = {}, children = []) {
  // 处理子节点，确保是数组
  if (typeof children === 'string' || typeof children === 'number') {
    children = [createTextVNode(children.toString())];
  } else if (!Array.isArray(children)) {
    children = [children];
  }
  
  return new VNode(tag, data, children, undefined, undefined);
}

// 创建文本节点的 VNode
function createTextVNode(text) {
  return new VNode(undefined, undefined, undefined, text, undefined);
}
```

### 2. 渲染函数实现

渲染函数将 VNode 转换为真实的 DOM 元素：

```javascript
// 将 VNode 渲染为真实 DOM
function render(vnode) {
  if (vnode.text !== undefined) {
    // 文本节点
    return document.createTextNode(vnode.text);
  }
  
  if (!vnode.tag) {
    // 没有标签，可能是注释或其他节点
    return document.createComment('');
  }
  
  // 创建元素
  const elm = document.createElement(vnode.tag);
  
  // 设置节点数据（属性、事件等）
  if (vnode.data) {
    setElementData(elm, vnode.data);
  }
  
  // 渲染并添加子节点
  if (vnode.children) {
    vnode.children.forEach(child => {
      elm.appendChild(render(child));
    });
  }
  
  // 保存对应的真实 DOM 元素
  vnode.elm = elm;
  
  return elm;
}

// 设置元素数据（属性、事件等）
function setElementData(elm, data) {
  if (!data) return;
  
  // 设置属性
  if (data.attrs) {
    for (let key in data.attrs) {
      elm.setAttribute(key, data.attrs[key]);
    }
  }
  
  // 设置类名
  if (data.staticClass) {
    elm.className = data.staticClass;
  }
  
  // 设置事件
  if (data.on) {
    for (let event in data.on) {
      elm.addEventListener(event, data.on[event]);
    }
  }
}
```

### 3. Diff 算法实现

Diff 算法是虚拟 DOM 的核心，用于比较新旧 VNode 树并找出差异：

```javascript
// 比较新旧 VNode，更新真实 DOM
function patch(oldVNode, newVNode) {
  if (sameVNode(oldVNode, newVNode)) {
    // 如果是同一个节点，进行深度比较和更新
    patchVNode(oldVNode, newVNode);
  } else {
    // 如果不是同一个节点，直接替换
    const newElm = render(newVNode);
    const parentElm = oldVNode.elm.parentNode;
    
    if (parentElm) {
      parentElm.replaceChild(newElm, oldVNode.elm);
      oldVNode.elm = null; // 清除旧节点的引用
    }
  }
}

// 判断是否为同一节点
function sameVNode(a, b) {
  return (
    a.key === b.key &&  // key 相同
    a.tag === b.tag &&  // 标签相同
    a.isComment === b.isComment && // 注释节点相同
    isDef(a.data) === isDef(b.data) // data 存在性相同
  );
}

// 深度比较和更新节点
function patchVNode(oldVNode, newVNode) {
  // 更新节点数据（属性、事件等）
  updateData(oldVNode, newVNode);
  
  // 获取真实 DOM 元素
  const elm = newVNode.elm = oldVNode.elm;
  const oldCh = oldVNode.children;
  const newCh = newVNode.children;
  
  if (!newVNode.text) {
    // 如果新节点不是文本节点
    if (oldCh && newCh && oldCh !== newCh) {
      // 比较子节点
      updateChildren(elm, oldCh, newCh);
    } else if (newCh) {
      // 新节点有子节点而旧节点没有
      createElm(newVNode);
    } else if (oldCh) {
      // 旧节点有子节点而新节点没有
      removeChildren(oldCh);
    }
  } else if (oldVNode.text !== newVNode.text) {
    // 文本节点内容不同，直接更新文本
    elm.textContent = newVNode.text;
  }
}

// 比较子节点
function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newEndIdx = newCh.length - 1;
  
  let oldStartVNode = oldCh[0];
  let oldEndVNode = oldCh[oldEndIdx];
  let newStartVNode = newCh[0];
  let newEndVNode = newCh[newEndIdx];
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = oldCh[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = oldCh[--oldEndIdx];
    } else if (sameVNode(oldStartVNode, newStartVNode)) {
      // 头头比较
      patchVNode(oldStartVNode, newStartVNode);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    } else if (sameVNode(oldEndVNode, newEndVNode)) {
      // 尾尾比较
      patchVNode(oldEndVNode, newEndVNode);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (sameVNode(oldStartVNode, newEndVNode)) {
      // 头尾比较
      patchVNode(oldStartVNode, newEndVNode);
      parentElm.insertBefore(oldStartVNode.elm, oldEndVNode.elm.nextSibling);
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (sameVNode(oldEndVNode, newStartVNode)) {
      // 尾头比较
      patchVNode(oldEndVNode, newStartVNode);
      parentElm.insertBefore(oldEndVNode.elm, oldStartVNode.elm);
      oldEndVNode = oldCh[--oldEndIdx];
      newStartVNode = newCh[++newStartIdx];
    } else {
      // 无法简单匹配，使用 key 进行查找
      const keyToOldIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      const idxInOld = keyToOldIdx[newStartVNode.key];
      
      if (!idxInOld) {
        // 新节点在旧节点中不存在，创建新元素
        parentElm.insertBefore(render(newStartVNode), oldStartVNode.elm);
        newStartVNode = newCh[++newStartIdx];
      } else {
        // 找到了对应的旧节点
        const elmToMove = oldCh[idxInOld];
        patchVNode(elmToMove, newStartVNode);
        oldCh[idxInOld] = undefined; // 标记为已处理
        parentElm.insertBefore(elmToMove.elm, oldStartVNode.elm);
        newStartVNode = newCh[++newStartIdx];
      }
    }
  }
  
  // 处理剩余的新节点
  if (newStartIdx <= newEndIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      parentElm.appendChild(render(newCh[i]));
    }
  }
  
  // 处理剩余的旧节点
  if (oldStartIdx <= oldEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldCh[i]) {
        parentElm.removeChild(oldCh[i].elm);
      }
    }
  }
}

// 创建 key 到索引的映射
function createKeyToOldIdx(children, startIdx, endIdx) {
  const map = {};
  for (let i = startIdx; i <= endIdx; i++) {
    const key = children[i].key;
    if (key !== undefined) {
      map[key] = i;
    }
  }
  return map;
}
```

### 4. 完整的虚拟 DOM 实现示例

```javascript
// 完整的虚拟 DOM 实现
class VirtualDOM {
  constructor() {
    this.vnode = null;
  }
  
  // 渲染虚拟 DOM
  mount(vnode, container) {
    this.vnode = vnode;
    const elm = render(vnode);
    container.appendChild(elm);
    return elm;
  }
  
  // 更新虚拟 DOM
  update(newVNode) {
    const oldVNode = this.vnode;
    this.vnode = newVNode;
    patch(oldVNode, newVNode);
  }
}

// 使用示例
const vdom = new VirtualDOM();

// 创建虚拟 DOM 树
const vnode = createElement('div', { staticClass: 'container' }, [
  createElement('h1', {}, ['Hello Virtual DOM']),
  createElement('p', {}, ['This is a virtual DOM implementation']),
  createElement('ul', {}, [
    createElement('li', { key: 'item1' }, ['Item 1']),
    createElement('li', { key: 'item2' }, ['Item 2']),
    createElement('li', { key: 'item3' }, ['Item 3'])
  ])
]);

// 挂载到真实 DOM
const container = document.getElementById('app');
vdom.mount(vnode, container);

// 更新虚拟 DOM
const newVnode = createElement('div', { staticClass: 'container' }, [
  createElement('h1', {}, ['Updated Virtual DOM']),
  createElement('p', {}, ['This is an updated virtual DOM implementation']),
  createElement('ul', {}, [
    createElement('li', { key: 'item1' }, ['Updated Item 1']),
    createElement('li', { key: 'item3' }, ['Item 3']),
    createElement('li', { key: 'item4' }, ['Item 4'])
  ])
]);

vdom.update(newVnode);
```

### 5. 性能优化策略

- **使用 key 属性**：提高节点复用效率
- **避免深度嵌套**：减少 diff 算法复杂度
- **组件级别的缓存**：使用 keep-alive 缓存组件
- **异步更新队列**：批量处理 DOM 更新

### 6. 虚拟 DOM 的局限性

- 首次渲染开销较大
- 对于简单静态内容，可能不如直接操作 DOM 高效
- 需要额外的内存来存储虚拟 DOM 树
- 学习成本相对较高
