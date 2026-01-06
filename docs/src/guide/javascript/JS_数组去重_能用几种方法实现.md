# JS 数组去重，能用几种方法实现？（必会）

**题目**: JS 数组去重，能用几种方法实现？（必会）

## 标准答案

JavaScript 数组去重有多种实现方法，主要包括：

1. **Set 数据结构**：利用 Set 不能存储重复值的特性
2. **filter + indexOf**：结合 filter 和 indexOf 方法
3. **reduce**：使用 reduce 方法累积去重结果
4. **双重循环**：传统的嵌套循环方法
5. **Map 数据结构**：使用 Map 存储已出现的值
6. **Object 键值对**：使用对象属性去重
7. **includes + push**：遍历数组，使用 includes 判断是否已存在

## 深入理解

### 1. 使用 Set 数据结构（ES6+，最推荐）

```javascript
function uniqueBySet(arr) {
    return [...new Set(arr)];
}

// 示例
const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(uniqueBySet(arr)); // [1, 2, 3, 4, 5]
```

### 2. 使用 filter + indexOf

```javascript
function uniqueByFilter(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

// 示例
const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(uniqueByFilter(arr)); // [1, 2, 3, 4, 5]
```

### 3. 使用 reduce

```javascript
function uniqueByReduce(arr) {
    return arr.reduce((prev, cur) => {
        if (!prev.includes(cur)) {
            prev.push(cur);
        }
        return prev;
    }, []);
}

// 示例
const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(uniqueByReduce(arr)); // [1, 2, 3, 4, 5]
```

### 4. 双重循环（传统方法）

```javascript
function uniqueByLoop(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        let isDuplicate = false;
        for (let j = 0; j < result.length; j++) {
            if (arr[i] === result[j]) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            result.push(arr[i]);
        }
    }
    return result;
}

// 示例
const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(uniqueByLoop(arr)); // [1, 2, 3, 4, 5]
```

### 5. 使用 Map 数据结构

```javascript
function uniqueByMap(arr) {
    const map = new Map();
    const result = [];
    for (const item of arr) {
        if (!map.has(item)) {
            map.set(item, true);
            result.push(item);
        }
    }
    return result;
}

// 示例
const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(uniqueByMap(arr)); // [1, 2, 3, 4, 5]
```

### 6. 使用 Object 键值对

```javascript
function uniqueByObject(arr) {
    const obj = {};
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (!obj[arr[i]]) {
            obj[arr[i]] = true;
            result.push(arr[i]);
        }
    }
    return result;
}

// 示例
const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(uniqueByObject(arr)); // [1, 2, 3, 4, 5]
```

### 7. 使用 includes + push

```javascript
function uniqueByIncludes(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (!result.includes(arr[i])) {
            result.push(arr[i]);
        }
    }
    return result;
}

// 示例
const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(uniqueByIncludes(arr)); // [1, 2, 3, 4, 5]
```

### 处理对象数组去重

对于对象数组，需要根据特定属性去重：

```javascript
// 按对象的特定属性去重
function uniqueByProperty(arr, prop) {
    const seen = new Set();
    return arr.filter(item => {
        const value = item[prop];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

// 示例
const objArr = [
    {id: 1, name: 'Alice'},
    {id: 2, name: 'Bob'},
    {id: 1, name: 'Alice'},
    {id: 3, name: 'Charlie'}
];
console.log(uniqueByProperty(objArr, 'id'));
// [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}, {id: 3, name: 'Charlie'}]

// 使用 Map 按属性去重
function uniqueByPropertyWithMap(arr, prop) {
    const map = new Map();
    return arr.filter(item => {
        if (!map.has(item[prop])) {
            map.set(item[prop], true);
            return true;
        }
        return false;
    });
}
```

### 性能对比

| 方法 | 时间复杂度 | 空间复杂度 | 优点 | 缺点 |
|------|------------|------------|------|------|
| Set | O(n) | O(n) | 简洁高效 | ES6+语法 |
| filter+indexOf | O(n²) | O(n) | 代码简洁 | 性能较差 |
| reduce | O(n²) | O(n) | 灵活性高 | 性能较差 |
| 双重循环 | O(n²) | O(n) | 兼容性好 | 代码冗长 |
| Map | O(n) | O(n) | 性能好 | ES6+语法 |
| Object | O(n) | O(n) | 兼容性好 | 只适用于基本类型 |

### 注意事项

1. Set 方法不能处理对象引用去重（不同对象但内容相同）
2. indexOf 对 NaN 不敏感，NaN === NaN 为 false，但 indexOf 判断 NaN 等于 NaN
3. 对于复杂对象去重，需要自定义比较逻辑
4. 不同方法的性能在不同数据量下表现不同

## 总结

- 最推荐使用 Set 方法，代码简洁且性能优秀
- 对于需要兼容老版本浏览器的项目，可以使用 Map 或 Object 方法
- 处理对象数组去重时，需要根据特定属性进行去重
- 不同场景下选择合适的方法，考虑性能、兼容性和代码可读性
