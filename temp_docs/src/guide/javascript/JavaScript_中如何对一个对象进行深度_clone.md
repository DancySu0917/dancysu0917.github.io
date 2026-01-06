# JavaScript 中如何对一个对象进行深度 clone？（必会）

**题目**: JavaScript 中如何对一个对象进行深度 clone？（必会）

## 标准答案

JavaScript 中深度克隆对象的方法有：

1. **JSON 方法**：`JSON.parse(JSON.stringify(obj))`（简单对象）
2. **递归实现**：手动实现深拷贝函数
3. **structuredClone API**：现代浏览器提供的原生方法（ES2021+）
4. **第三方库**：如 Lodash 的 cloneDeep 方法

## 深入理解

### 1. JSON 方法（最常用但有限制）

```javascript
function deepCloneByJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 示例
const original = {
    name: 'Alice',
    age: 30,
    hobbies: ['reading', 'swimming'],
    address: {
        city: 'Beijing',
        country: 'China'
    }
};

const cloned = deepCloneByJSON(original);
cloned.address.city = 'Shanghai';

console.log(original.address.city); // 'Beijing'
console.log(cloned.address.city);   // 'Shanghai'
```

**限制**：
- 无法处理函数、undefined、Symbol
- 无法处理循环引用
- 会丢失对象的原型链
- 无法处理 Date 对象（会变成字符串）
- 无法处理 RegExp、Error 等特殊对象

### 2. 递归实现深度克隆

```javascript
function deepClone(obj, hash = new WeakMap()) {
    // 处理 null 和非对象类型
    if (obj === null || typeof obj !== 'object') return obj;
    
    // 处理循环引用
    if (hash.has(obj)) return hash.get(obj);
    
    // 处理日期对象
    if (obj instanceof Date) return new Date(obj);
    
    // 处理正则表达式
    if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
    
    // 创建新对象
    const cloned = new obj.constructor();
    hash.set(obj, cloned);
    
    // 递归复制所有属性
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key], hash);
        }
    }
    
    return cloned;
}

// 示例
const original = {
    name: 'Alice',
    date: new Date(),
    regex: /test/gi,
    nested: {
        value: 42
    },
    arr: [1, {a: 2}]
};

const cloned = deepClone(original);
console.log(cloned.name); // 'Alice'
cloned.name = 'Bob';
console.log(original.name); // 'Alice'
```

### 3. 更完善的递归实现

```javascript
function advancedDeepClone(obj, hash = new WeakMap()) {
    // 基本类型和 null 直接返回
    if (obj === null || typeof obj !== 'object') return obj;
    
    // 处理循环引用
    if (hash.has(obj)) return hash.get(obj);
    
    // 处理各种特殊对象类型
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
    if (obj instanceof Set) {
        const clonedSet = new Set();
        hash.set(obj, clonedSet);
        obj.forEach(value => clonedSet.add(advancedDeepClone(value, hash)));
        return clonedSet;
    }
    if (obj instanceof Map) {
        const clonedMap = new Map();
        hash.set(obj, clonedMap);
        obj.forEach((value, key) => clonedMap.set(advancedDeepClone(key, hash), advancedDeepClone(value, hash)));
        return clonedMap;
    }
    
    // 处理数组和对象
    const cloned = Array.isArray(obj) ? [] : {};
    hash.set(obj, cloned);
    
    // 复制所有可枚举属性
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = advancedDeepClone(obj[key], hash);
        }
    }
    
    return cloned;
}
```

### 4. structuredClone API（现代方法）

```javascript
// 现代浏览器支持的原生深拷贝方法
const original = {
    name: 'Alice',
    date: new Date(),
    regex: /test/gi,
    nested: {
        value: 42
    }
};

const cloned = structuredClone(original);
console.log(cloned.name); // 'Alice'
cloned.name = 'Bob';
console.log(original.name); // 'Alice'
```

**支持的类型**：
- 基本类型
- 数组和对象
- 函数（在某些环境中）
- 日期对象
- 正则表达式
- Map、Set
- ArrayBuffer 等

**限制**：
- 不能克隆函数（在某些环境中）
- 不能克隆 DOM 节点
- 浏览器兼容性问题

### 5. Lodash 的 cloneDeep 方法

```javascript
const _ = require('lodash');

const original = {
    name: 'Alice',
    nested: {
        value: 42
    }
};

const cloned = _.cloneDeep(original);
```

### 深拷贝 vs 浅拷贝

```javascript
// 浅拷贝示例
const shallowOriginal = {
    name: 'Alice',
    address: { city: 'Beijing' }
};

const shallowCloned = Object.assign({}, shallowOriginal);
// 或者使用扩展运算符: const shallowCloned = {...shallowOriginal};

shallowCloned.address.city = 'Shanghai';
console.log(original.address.city); // 'Shanghai' - 原对象也被改变了

// 深拷贝示例
const deepOriginal = {
    name: 'Alice',
    address: { city: 'Beijing' }
};

const deepCloned = deepClone(deepOriginal);
deepCloned.address.city = 'Shanghai';
console.log(deepOriginal.address.city); // 'Beijing' - 原对象未被改变
```

### 性能对比

| 方法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| JSON 方法 | 简单快速 | 限制多，不支持复杂类型 | 简单纯数据对象 |
| 递归实现 | 完整支持各种类型 | 代码复杂，性能一般 | 复杂对象，需要完全控制 |
| structuredClone | 原生支持，功能完整 | 浏览器兼容性 | 现代浏览器环境 |
| Lodash | 稳定可靠 | 额外依赖 | 项目已使用 Lodash |

### 注意事项

1. **循环引用**：在递归实现中必须处理循环引用，否则会导致栈溢出
2. **类型检查**：需要正确识别和处理各种对象类型
3. **原型链**：深拷贝通常不保留原始对象的原型链
4. **性能考虑**：深拷贝操作通常比浅拷贝慢，特别是在处理大型对象时
5. **浏览器兼容性**：`structuredClone` 在较老的浏览器中不可用

## 总结

- 对于简单的数据对象，`JSON.parse(JSON.stringify())` 是最快捷的方法
- 对于复杂对象，建议使用递归实现或 `structuredClone`
- 在生产环境中，Lodash 的 `cloneDeep` 是可靠的选择
- 深拷贝的目的是创建一个完全独立的副本，修改副本不会影响原对象
- 需要根据具体需求和环境选择合适的深拷贝方法
