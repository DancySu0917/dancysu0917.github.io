# 介绍下 Set、Map 的区别（必会）

**题目**: 介绍下 Set、Map 的区别（必会）

## 标准答案

Set 和 Map 的主要区别：

1. **数据结构**：
   - Set：存储唯一值的集合，类似数组但值不重复
   - Map：存储键值对的集合，键可以是任意类型

2. **键的类型**：
   - Set：每个值既是键也是值
   - Map：键可以是任意类型（对象、函数、原始值等）

3. **使用场景**：
   - Set：去重、成员检测、集合运算
   - Map：需要键值映射关系的场景

4. **API 方法**：
   - Set：add、delete、has、clear 等
   - Map：set、get、delete、has、clear 等

## 深入理解

### Set 的基本特性

```javascript
// 创建 Set
const set1 = new Set();
const set2 = new Set([1, 2, 3, 4, 4, 5]); // [1, 2, 3, 4, 5] - 自动去重

console.log(set2); // Set(5) {1, 2, 3, 4, 5}

// Set 基本操作
set1.add(1);
set1.add(2);
set1.add(1); // 重复值不会被添加
console.log(set1); // Set(2) {1, 2}

// 检查元素是否存在
console.log(set1.has(1)); // true
console.log(set1.has(3)); // false

// 删除元素
set1.delete(1);
console.log(set1); // Set(1) {2}

// 清空 Set
set1.clear();
console.log(set1.size); // 0

// Set 的唯一性
const set3 = new Set([1, '1', true, 'true', 0, false]);
console.log(set3); // Set(6) {1, '1', true, 'true', 0, false}
// 注意：1 和 '1' 是不同的值，true 和 'true' 是不同的值
```

### Map 的基本特性

```javascript
// 创建 Map
const map1 = new Map();
const map2 = new Map([['key1', 'value1'], ['key2', 'value2']]);

// Map 基本操作
map1.set('name', 'Alice');
map1.set(1, 'number one');
map1.set({ id: 1 }, 'object key');
map1.set(function() {}, 'function key');

console.log(map1); // Map(4) {'name' => 'Alice', 1 => 'number one', {...} => 'object key', ƒ => 'function key'}

// 获取值
console.log(map1.get('name')); // 'Alice'
console.log(map1.get(1)); // 'number one'

// 检查键是否存在
console.log(map1.has('name')); // true
console.log(map1.has('age')); // false

// 删除键值对
map1.delete('name');
console.log(map1.has('name')); // false

// 清空 Map
map1.clear();
console.log(map1.size); // 0
```

### Set 和 Map 的键值对比

```javascript
// Set - 值就是键
const set = new Set();
set.add('key');
set.add('key'); // 重复值不会被添加
console.log(set.size); // 1

// Map - 可以有键值对
const map = new Map();
map.set('key', 'value1');
map.set('key', 'value2'); // 会覆盖之前的值
console.log(map.size); // 1
console.log(map.get('key')); // 'value2'

// Map 的键可以是任意类型
const objKey = { id: 1 };
const funcKey = function() {};
const mapAdvanced = new Map();

mapAdvanced.set(objKey, 'object value');
mapAdvanced.set(funcKey, 'function value');
mapAdvanced.set(1, 'number value');
mapAdvanced.set('1', 'string value');

console.log(mapAdvanced.get(objKey)); // 'object value'
console.log(mapAdvanced.get(funcKey)); // 'function value'
console.log(mapAdvanced.get(1)); // 'number value'
console.log(mapAdvanced.get('1')); // 'string value'
```

### Set 的实际应用场景

```javascript
// 1. 数组去重
function removeDuplicates(arr) {
    return [...new Set(arr)];
}

const numbers = [1, 2, 2, 3, 4, 4, 5];
const uniqueNumbers = removeDuplicates(numbers);
console.log(uniqueNumbers); // [1, 2, 3, 4, 5]

// 2. 检查数组中是否有重复元素
function hasDuplicates(arr) {
    return new Set(arr).size !== arr.length;
}

console.log(hasDuplicates([1, 2, 3, 4])); // false
console.log(hasDuplicates([1, 2, 2, 3])); // true

// 3. 两个数组的交集
function intersection(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    return [...set1].filter(item => set2.has(item));
}

const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];
console.log(intersection(arr1, arr2)); // [3, 4]

// 4. 两个数组的差集
function difference(arr1, arr2) {
    const set2 = new Set(arr2);
    return [...new Set(arr1)].filter(item => !set2.has(item));
}

console.log(difference([1, 2, 3, 4], [3, 4, 5, 6])); // [1, 2]

// 5. 成员资格检测（比数组的 includes 更高效）
const largeSet = new Set([/* 假设有大量数据 */]);
console.log(largeSet.has(42)); // O(1) 时间复杂度
```

### Map 的实际应用场景

```javascript
// 1. 缓存实现
const cache = new Map();

function expensiveOperation(key) {
    if (cache.has(key)) {
        console.log('从缓存获取');
        return cache.get(key);
    }
    
    // 模拟昂贵的计算
    const result = key * key * key;
    cache.set(key, result);
    console.log('计算并缓存结果');
    return result;
}

console.log(expensiveOperation(5)); // 计算并缓存结果，返回 125
console.log(expensiveOperation(5)); // 从缓存获取，返回 125

// 2. 对象 ID 映射
const userMap = new Map();
userMap.set(1, { id: 1, name: 'Alice', email: 'alice@example.com' });
userMap.set(2, { id: 2, name: 'Bob', email: 'bob@example.com' });

function getUserById(id) {
    return userMap.get(id) || null;
}

console.log(getUserById(1)); // { id: 1, name: 'Alice', email: 'alice@example.com' }

// 3. DOM 元素与数据的映射
const elementDataMap = new Map();
const button1 = document.createElement('button');
const button2 = document.createElement('button');

elementDataMap.set(button1, { type: 'submit', action: 'save' });
elementDataMap.set(button2, { type: 'cancel', action: 'reset' });

console.log(elementDataMap.get(button1)); // { type: 'submit', action: 'save' }

// 4. 频率统计
function countFrequency(arr) {
    const frequencyMap = new Map();
    
    for (const item of arr) {
        frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
    }
    
    return frequencyMap;
}

const words = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
const frequency = countFrequency(words);
console.log(frequency); // Map(3) {'apple' => 3, 'banana' => 2, 'orange' => 1}
```

### 遍历方法对比

```javascript
// Set 的遍历
const set = new Set([1, 2, 3]);

// 1. forEach 遍历
set.forEach((value, sameValue, setRef) => {
    console.log(value, sameValue); // value 和 sameValue 是相同的
});

// 2. for...of 遍历
for (const value of set) {
    console.log(value);
}

// 3. Set 的遍历方法
console.log([...set.keys()]); // [1, 2, 3] - keys() 返回值序列
console.log([...set.values()]); // [1, 2, 3] - values() 返回值序列
console.log([...set.entries()]); // [[1, 1], [2, 2], [3, 3]] - entries() 返回 [value, value] 对

// Map 的遍历
const map = new Map([['a', 1], ['b', 2], ['c', 3]]);

// 1. forEach 遍历
map.forEach((value, key, mapRef) => {
    console.log(key, value);
});

// 2. for...of 遍历
for (const [key, value] of map) {
    console.log(key, value);
}

// 3. Map 的遍历方法
console.log([...map.keys()]); // ['a', 'b', 'c'] - 所有键
console.log([...map.values()]); // [1, 2, 3] - 所有值
console.log([...map.entries()]); // [['a', 1], ['b', 2], ['c', 3]] - 所有键值对
```

### 性能对比

```javascript
// 性能测试：Set vs Array 的查找操作
function performanceTest() {
    const array = [];
    const set = new Set();
    
    // 填充数据
    for (let i = 0; i < 10000; i++) {
        array.push(i);
        set.add(i);
    }
    
    // 测试数组查找
    console.time('Array includes');
    for (let i = 0; i < 1000; i++) {
        array.includes(9999);
    }
    console.timeEnd('Array includes');
    
    // 测试 Set 查找
    console.time('Set has');
    for (let i = 0; i < 1000; i++) {
        set.has(9999);
    }
    console.timeEnd('Set has');
    
    // 测试 Map 查找
    const map = new Map();
    for (let i = 0; i < 10000; i++) {
        map.set(i, `value_${i}`);
    }
    
    console.time('Map get');
    for (let i = 0; i < 1000; i++) {
        map.get(9999);
    }
    console.timeEnd('Map get');
}

// performanceTest(); // 取消注释以运行性能测试
```

### 与传统对象的对比

```javascript
// Map vs 普通对象
const obj = {};
const map = new Map();

// 1. 键的类型
obj['1'] = 'string key'; // 对象会将所有键转换为字符串
obj[1] = 'number key';   // 这会覆盖上面的值

console.log(obj['1']); // 'number key' - 字符串键被数字键覆盖了
console.log(obj[1]);   // 'number key'

map.set('1', 'string key');
map.set(1, 'number key'); // 不会冲突

console.log(map.get('1')); // 'string key'
console.log(map.get(1));   // 'number key'

// 2. 获取大小
console.log(Object.keys(obj).length); // 需要特殊方法获取大小
console.log(map.size); // 直接获取大小

// 3. 遍历顺序
const obj2 = {};
obj2.b = 2;
obj2.a = 1;
obj2[2] = 'number';
obj2[1] = 'number';

console.log(Object.keys(obj2)); // 在现代 JS 中保持插入顺序

map.set('b', 2);
map.set('a', 1);
map.set(2, 'number');
map.set(1, 'number');

console.log([...map.keys()]); // 保持插入顺序

// 4. 原型链问题
obj.constructor = 'modified';
console.log(obj.hasOwnProperty('constructor')); // true
console.log('constructor' in obj); // true

const map2 = new Map();
map2.set('constructor', 'modified');
console.log(map2.has('constructor')); // true，但不影响原型
```

### 选择使用建议

**使用 Set 的场景：**
- 需要去重的数据集合
- 需要快速检测元素是否存在的场景
- 集合运算（交集、并集、差集等）
- 存储唯一值的列表

**使用 Map 的场景：**
- 需要键值对映射的场景
- 键的类型不是字符串或 Symbol
- 需要频繁进行增删改查操作
- 需要保持插入顺序
- 需要统计或缓存功能
