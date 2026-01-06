# 现在给你一个嵌套 JSON 比如树状结构的菜单，里面包含任意层级的 children，你能不能写个函数把它扁平？（了解）

**题目**: 现在给你一个嵌套 JSON 比如树状结构的菜单，里面包含任意层级的 children，你能不能写个函数把它扁平？（了解）

## 答案

将嵌套的树形结构扁平化是前端开发中常见的需求，通常用于处理菜单、分类、组织架构等数据。以下是几种实现方式：

### 1. 递归实现

```javascript
function flattenTree(tree, childrenKey = 'children') {
  const result = [];
  
  function traverse(node, parent = null) {
    // 复制节点并移除children属性
    const { [childrenKey]: children, ...nodeWithoutChildren } = node;
    result.push(nodeWithoutChildren);
    
    // 如果有子节点，递归处理
    if (children && Array.isArray(children)) {
      children.forEach(child => traverse(child, nodeWithoutChildren));
    }
  }
  
  // 遍历树的每个根节点
  if (Array.isArray(tree)) {
    tree.forEach(node => traverse(node));
  } else {
    traverse(tree);
  }
  
  return result;
}

// 示例使用
const treeData = [
  {
    id: 1,
    name: '根节点1',
    children: [
      {
        id: 2,
        name: '子节点1-1',
        children: [
          { id: 4, name: '孙节点1-1-1' },
          { id: 5, name: '孙节点1-1-2' }
        ]
      },
      {
        id: 3,
        name: '子节点1-2',
        children: [
          { id: 6, name: '孙节点1-2-1' }
        ]
      }
    ]
  }
];

const flattened = flattenTree(treeData);
console.log(flattened);
// 输出: [{ id: 1, name: '根节点1' }, { id: 2, name: '子节点1-1' }, ...]
```

### 2. 迭代实现（使用栈）

```javascript
function flattenTreeIterative(tree, childrenKey = 'children') {
  const result = [];
  const stack = Array.isArray(tree) ? [...tree] : [tree];
  
  while (stack.length > 0) {
    const node = stack.pop();
    const { [childrenKey]: children, ...nodeWithoutChildren } = node;
    
    result.push(nodeWithoutChildren);
    
    // 将子节点添加到栈中（逆序添加以保持原有顺序）
    if (children && Array.isArray(children)) {
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
    }
  }
  
  return result;
}
```

### 3. 广度优先遍历（BFS）

```javascript
function flattenTreeBFS(tree, childrenKey = 'children') {
  const result = [];
  const queue = Array.isArray(tree) ? [...tree] : [tree];
  
  while (queue.length > 0) {
    const node = queue.shift();
    const { [childrenKey]: children, ...nodeWithoutChildren } = node;
    
    result.push(nodeWithoutChildren);
    
    // 将子节点添加到队列末尾
    if (children && Array.isArray(children)) {
      queue.push(...children);
    }
  }
  
  return result;
}
```

### 4. 保留层级信息的扁平化

有时候我们可能需要保留节点的层级信息：

```javascript
function flattenTreeWithLevel(tree, childrenKey = 'children', level = 0, parent = null) {
  const result = [];
  
  function traverse(node, currentLevel, parentNode) {
    const { [childrenKey]: children, ...nodeWithoutChildren } = node;
    
    // 添加层级和父节点信息
    result.push({
      ...nodeWithoutChildren,
      level: currentLevel,
      parentId: parentNode ? parentNode.id : null
    });
    
    if (children && Array.isArray(children)) {
      children.forEach(child => traverse(child, currentLevel + 1, node));
    }
  }
  
  if (Array.isArray(tree)) {
    tree.forEach(node => traverse(node, level, parent));
  } else {
    traverse(tree, level, parent);
  }
  
  return result;
}

// 示例
const treeWithLevels = flattenTreeWithLevel(treeData);
console.log(treeWithLevels);
// 输出: [{ id: 1, name: '根节点1', level: 0, parentId: null }, ...]
```

### 5. 更通用的实现

```javascript
function flattenTreeAdvanced(tree, options = {}) {
  const {
    childrenKey = 'children',
    idKey = 'id',
    parentKey = 'parentId',
    levelKey = 'level',
    transform = node => node // 自定义节点转换函数
  } = options;
  
  const result = [];
  
  function traverse(node, level = 0, parent = null) {
    const { [childrenKey]: children, ...nodeWithoutChildren } = node;
    
    // 应用自定义转换
    let transformedNode = transform({ ...nodeWithoutChildren });
    
    // 添加层级和父节点信息
    if (parent) {
      transformedNode[parentKey] = parent[idKey];
    }
    transformedNode[levelKey] = level;
    
    result.push(transformedNode);
    
    if (children && Array.isArray(children)) {
      children.forEach(child => traverse(child, level + 1, node));
    }
  }
  
  if (Array.isArray(tree)) {
    tree.forEach(node => traverse(node));
  } else {
    traverse(tree);
  }
  
  return result;
}

// 使用示例
const advancedFlattened = flattenTreeAdvanced(treeData, {
  transform: (node) => ({
    ...node,
    // 可以在这里对节点进行额外处理
    path: `/${node.name}` // 添加自定义属性
  })
});
```

### 6. 性能考虑

- **递归实现**：代码简洁，但对深层树结构可能导致栈溢出
- **迭代实现**：避免了栈溢出问题，适合处理深层嵌套结构
- **广度优先**：适合需要按层级顺序处理的场景

### 7. 实际应用场景

- 菜单系统的权限控制
- 组织架构图的展示
- 分类数据的处理
- 配置项的扁平化处理

选择哪种实现方式取决于具体的应用场景和性能要求。