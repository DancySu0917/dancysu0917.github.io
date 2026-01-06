# WeakMap 和普通 Map 区别？（了解）
### 标准答案

WeakMap和Map的主要区别包括：1) WeakMap的键必须是对象，而Map的键可以是任意类型；2) WeakMap对键的引用是弱引用，不会阻止垃圾回收，而Map是强引用；3) WeakMap不支持遍历操作和size属性，而Map支持；4) WeakMap主要用于存储对象相关的私有数据，Map用于一般的数据映射。

### 深入理解

WeakMap和Map虽然都是键值对的集合，但在实现机制和使用场景上有本质区别。

**1. 引用类型差异：**
```javascript
// Map - 强引用
const map = new Map();
let obj = { id: 1 };
map.set(obj, 'value');

console.log(map.size); // 1
obj = null; // 即使将obj设为null，Map中仍保留对对象的引用
console.log(map.size); // 仍然是1，对象不会被垃圾回收

// WeakMap - 弱引用
const weakMap = new WeakMap();
let obj2 = { id: 2 };
weakMap.set(obj2, 'value');

console.log(weakMap.has(obj2)); // true
obj2 = null; // 将obj2设为null，WeakMap中的对象会被垃圾回收
console.log(weakMap.has(obj2)); // false，对象已被回收
```

**2. 键类型限制：**
```javascript
// Map可以使用任意类型的键
const map = new Map();
map.set('string', 'string key');
map.set(123, 'number key');
map.set(true, 'boolean key');
map.set(Symbol('sym'), 'symbol key');
map.set({}, 'object key'); // 也可以使用对象作为键

// WeakMap只能使用对象作为键
const weakMap = new WeakMap();
weakMap.set({}, 'object value'); // ✓ 正确
weakMap.set('string', 'string value'); // ✗ TypeError: Invalid value used as weak map key
```

**3. 遍历和属性差异：**
```javascript
const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
console.log(map.size); // 3 - Map有size属性
console.log([...map.keys()]); // ['a', 'b', 'c'] - Map可遍历
console.log([...map.values()]); // [1, 2, 3] - Map可遍历
console.log([...map.entries()]); // [['a', 1], ['b', 2], ['c', 3]] - Map可遍历

// 遍历整个Map
for (const [key, value] of map) {
    console.log(key, value);
}

const weakMap = new WeakMap();
const obj1 = { id: 1 };
const obj2 = { id: 2 };
const obj3 = { id: 3 };

weakMap.set(obj1, 'value1');
weakMap.set(obj2, 'value2');
weakMap.set(obj3, 'value3');

console.log(weakMap.has(obj1)); // true
// console.log(weakMap.size); // ✗ TypeError: Cannot read property 'size' of undefined
// console.log([...weakMap.keys()]); // ✗ weakMap.keys is not a function
// WeakMap不支持遍历操作和size属性
```

**4. 实际应用场景：**

**WeakMap适用场景：**
```javascript
// 场景1：存储私有数据
const privateData = new WeakMap();

class Person {
    constructor(name) {
        // 将私有数据存储在WeakMap中，外部无法直接访问
        privateData.set(this, { name, age: 0 });
    }
    
    getName() {
        return privateData.get(this).name;
    }
    
    setAge(age) {
        privateData.get(this).age = age;
    }
    
    getAge() {
        return privateData.get(this).age;
    }
}

const person = new Person('Alice');
console.log(person.getName()); // 'Alice'
console.log(privateData.has(person)); // true
person = null; // 当对象被销毁时，WeakMap中的对应项也会被自动清理
console.log(privateData.has(person)); // false

// 场景2：缓存DOM元素相关数据
const elementCache = new WeakMap();

function attachDataToElement(element, data) {
    elementCache.set(element, data);
}

function getDataFromElement(element) {
    return elementCache.get(element);
}

// 当DOM元素被移除时，对应的缓存数据也会被自动清理
const div = document.createElement('div');
attachDataToElement(div, { id: 1, name: 'test' });
console.log(getDataFromElement(div)); // { id: 1, name: 'test' }

// 场景3：避免内存泄漏
function createNodeCache() {
    const cache = new WeakMap(); // 使用WeakMap避免内存泄漏
    
    return {
        setNodeData: (node, data) => {
            cache.set(node, data);
        },
        getNodeData: (node) => {
            return cache.get(node);
        }
    };
}
```

**Map适用场景：**
```javascript
// 场景1：一般的数据映射
const userRoles = new Map([
    ['admin', 'Administrator'],
    ['editor', 'Editor'],
    ['viewer', 'Viewer']
]);

function getRoleDescription(role) {
    return userRoles.get(role) || 'Unknown Role';
}

// 场景2：需要遍历的键值对
const stats = new Map();
stats.set('page1', { views: 100, likes: 10 });
stats.set('page2', { views: 200, likes: 20 });
stats.set('page3', { views: 150, likes: 15 });

// 遍历统计信息
for (const [page, data] of stats) {
    console.log(`${page}: ${data.views} views, ${data.likes} likes`);
}

// 场景3：需要知道大小的集合
const sessionData = new Map();
// ... 添加会话数据
if (sessionData.size > 1000) {
    console.log('Warning: Too many sessions');
}
```

**5. 性能和内存管理：**
```javascript
// 内存管理对比示例
function compareMemoryUsage() {
    // 使用Map存储
    function useMap() {
        const map = new Map();
        const objects = [];
        
        for (let i = 0; i < 1000; i++) {
            const obj = { id: i };
            map.set(obj, `data for ${i}`);
            objects.push(obj);
        }
        
        // 即使清空objects数组，Map中的对象仍然被引用
        objects.length = 0;
        console.log('Map size after clearing references:', map.size); // 仍然是1000
        
        return map;
    }
    
    // 使用WeakMap存储
    function useWeakMap() {
        const weakMap = new WeakMap();
        const objects = [];
        
        for (let i = 0; i < 1000; i++) {
            const obj = { id: i };
            weakMap.set(obj, `data for ${i}`);
            objects.push(obj);
        }
        
        // 清空objects数组后，WeakMap中的对象会被垃圾回收
        objects.length = 0;
        // 注意：这里无法直接检查WeakMap的大小，因为它没有size属性
        // 但对象已经被标记为可回收
        
        return weakMap;
    }
    
    const mapResult = useMap();
    const weakMapResult = useWeakMap();
    
    // 在实际应用中，WeakMap更适合存储临时的、与对象生命周期相关的数据
}
```

**6. 方法对比：**
```javascript
// Map的方法
const map = new Map();
map.set('key', 'value');
map.get('key');
map.has('key');
map.delete('key');
map.clear();
// map.forEach(), map.keys(), map.values(), map.entries()

// WeakMap的方法
const weakMap = new WeakMap();
weakMap.set({}, 'value'); // 键必须是对象
weakMap.get({}); // 注意：这里传入的是新对象，不会获取到之前存储的值
const obj = { id: 1 };
weakMap.set(obj, 'value');
weakMap.get(obj); // 'value'
weakMap.has(obj);
weakMap.delete(obj);
// WeakMap没有clear()方法，没有遍历方法，没有size属性
```

**总结：**
1. WeakMap的键必须是对象，Map的键可以是任意类型
2. WeakMap是弱引用，有助于垃圾回收，Map是强引用
3. WeakMap不支持遍历和size属性，Map支持
4. WeakMap适用于存储对象的私有数据或缓存，Map适用于一般的数据映射
5. WeakMap有助于避免内存泄漏，特别适合存储与对象生命周期相关的数据