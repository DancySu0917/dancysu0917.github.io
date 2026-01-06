# Array 有哪些常用的增删改查方法？（了解）

**题目**: Array 有哪些常用的增删改查方法？（了解）

## 标准答案

JavaScript 数组的增删改查方法包括：增（push、unshift、splice）、删（pop、shift、splice、slice）、改（splice、sort、reverse、fill）、查（indexOf、lastIndexOf、includes、find、findIndex、forEach、map、filter、every、some、reduce、reduceRight）。这些方法可以对数组元素进行各种操作，是 JavaScript 开发中的基础技能。

## 深入理解

JavaScript 数组提供了丰富的增删改查方法，根据是否修改原数组可以分为两类：变异方法（mutator methods）和非变异方法（accessor methods）。

### 1. 增加元素的方法

#### push() - 在数组末尾添加元素
```javascript
const arr = [1, 2, 3];
const newLength = arr.push(4, 5); // 返回新数组长度
console.log(arr); // [1, 2, 3, 4, 5]
console.log(newLength); // 5
```

#### unshift() - 在数组开头添加元素
```javascript
const arr = [3, 4, 5];
const newLength = arr.unshift(1, 2); // 返回新数组长度
console.log(arr); // [1, 2, 3, 4, 5]
console.log(newLength); // 5
```

#### splice() - 在任意位置添加元素
```javascript
const arr = [1, 2, 5];
// 在索引2处添加元素3和4
arr.splice(2, 0, 3, 4); // 参数：起始位置，删除个数，插入元素...
console.log(arr); // [1, 2, 3, 4, 5]
```

#### 扩展运算符 - 创建新数组添加元素
```javascript
const arr = [2, 3, 4];
const newArr = [1, ...arr, 5]; // 不修改原数组
console.log(newArr); // [1, 2, 3, 4, 5]
console.log(arr); // [2, 3, 4] - 原数组未变
```

### 2. 删除元素的方法

#### pop() - 删除数组末尾元素
```javascript
const arr = [1, 2, 3, 4, 5];
const removedElement = arr.pop(); // 返回被删除的元素
console.log(arr); // [1, 2, 3, 4]
console.log(removedElement); // 5
```

#### shift() - 删除数组开头元素
```javascript
const arr = [1, 2, 3, 4, 5];
const removedElement = arr.shift(); // 返回被删除的元素
console.log(arr); // [2, 3, 4, 5]
console.log(removedElement); // 1
```

#### splice() - 删除任意位置的元素
```javascript
const arr = [1, 2, 3, 4, 5];
// 从索引1开始删除2个元素
const removedElements = arr.splice(1, 2); // 返回被删除元素组成的数组
console.log(arr); // [1, 4, 5]
console.log(removedElements); // [2, 3]
```

#### slice() - 提取数组的一部分（不修改原数组）
```javascript
const arr = [1, 2, 3, 4, 5];
const subArray = arr.slice(1, 4); // 提取索引1到3的元素
console.log(subArray); // [2, 3, 4]
console.log(arr); // [1, 2, 3, 4, 5] - 原数组未变
```

#### filter() - 过滤元素（不修改原数组）
```javascript
const arr = [1, 2, 3, 4, 5];
const filtered = arr.filter(item => item !== 3); // 过滤掉等于3的元素
console.log(filtered); // [1, 2, 4, 5]
console.log(arr); // [1, 2, 3, 4, 5] - 原数组未变
```

### 3. 修改元素的方法

#### splice() - 修改任意位置的元素
```javascript
const arr = [1, 2, 3, 4, 5];
// 从索引2开始，删除1个元素，插入'new'
const removed = arr.splice(2, 1, 'new');
console.log(arr); // [1, 2, 'new', 4, 5]
console.log(removed); // ['3']
```

#### 直接索引赋值 - 修改特定位置元素
```javascript
const arr = [1, 2, 3, 4, 5];
arr[2] = 'modified'; // 直接修改索引2的元素
console.log(arr); // [1, 2, 'modified', 4, 5]
```

#### fill() - 填充数组元素
```javascript
const arr = [1, 2, 3, 4, 5];
arr.fill(0, 1, 4); // 从索引1到3填充为0
console.log(arr); // [1, 0, 0, 0, 5]

const newArr = new Array(5).fill(1); // 创建并填充新数组
console.log(newArr); // [1, 1, 1, 1, 1]
```

#### sort() - 排序数组
```javascript
const arr = [3, 1, 4, 1, 5];
arr.sort(); // 默认按字符串排序
console.log(arr); // [1, 1, 3, 4, 5]

// 数字排序需要提供比较函数
const numArr = [3, 1, 4, 1, 5];
numArr.sort((a, b) => a - b); // 升序
console.log(numArr); // [1, 1, 3, 4, 5]

numArr.sort((a, b) => b - a); // 降序
console.log(numArr); // [5, 4, 3, 1, 1]
```

#### reverse() - 反转数组
```javascript
const arr = [1, 2, 3, 4, 5];
arr.reverse(); // 反转原数组
console.log(arr); // [5, 4, 3, 2, 1]
```

#### map() - 通过映射函数修改元素（不修改原数组）
```javascript
const arr = [1, 2, 3, 4, 5];
const doubled = arr.map(item => item * 2);
console.log(doubled); // [2, 4, 6, 8, 10]
console.log(arr); // [1, 2, 3, 4, 5] - 原数组未变
```

### 4. 查询元素的方法

#### indexOf() - 查找元素首次出现的索引
```javascript
const arr = [1, 2, 3, 2, 4];
console.log(arr.indexOf(2)); // 1 - 第一次出现的索引
console.log(arr.indexOf(5)); // -1 - 未找到
```

#### lastIndexOf() - 查找元素最后一次出现的索引
```javascript
const arr = [1, 2, 3, 2, 4];
console.log(arr.lastIndexOf(2)); // 3 - 最后一次出现的索引
```

#### includes() - 检查元素是否存在
```javascript
const arr = [1, 2, 3, 4, 5];
console.log(arr.includes(3)); // true
console.log(arr.includes(6)); // false
console.log(arr.includes(3, 3)); // false - 从索引3开始查找
```

#### find() - 查找满足条件的第一个元素
```javascript
const arr = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
];

const found = arr.find(item => item.id === 2);
console.log(found); // { id: 2, name: 'Bob' }

const notFound = arr.find(item => item.id === 5);
console.log(notFound); // undefined
```

#### findIndex() - 查找满足条件的第一个元素的索引
```javascript
const arr = [10, 20, 30, 40, 50];
const index = arr.findIndex(item => item > 25);
console.log(index); // 2 - 第一个大于25的元素的索引
```

#### forEach() - 遍历数组
```javascript
const arr = [1, 2, 3, 4, 5];
arr.forEach((item, index, array) => {
    console.log(`索引${index}: ${item}`);
    // 无法中途退出循环
});
```

#### filter() - 过滤满足条件的元素
```javascript
const arr = [1, 2, 3, 4, 5];
const evenNumbers = arr.filter(item => item % 2 === 0);
console.log(evenNumbers); // [2, 4]
```

#### some() - 检查是否有元素满足条件
```javascript
const arr = [1, 2, 3, 4, 5];
const hasEven = arr.some(item => item % 2 === 0);
console.log(hasEven); // true - 存在偶数

const hasNegative = arr.some(item => item < 0);
console.log(hasNegative); // false - 不存在负数
```

#### every() - 检查是否所有元素都满足条件
```javascript
const arr = [2, 4, 6, 8, 10];
const allEven = arr.every(item => item % 2 === 0);
console.log(allEven); // true - 所有都是偶数

const allPositive = arr.every(item => item > 0);
console.log(allPositive); // true - 所有都大于0
```

#### reduce() - 归约操作
```javascript
const arr = [1, 2, 3, 4, 5];
const sum = arr.reduce((accumulator, current) => accumulator + current, 0);
console.log(sum); // 15

// 复杂的归约操作 - 统计字符出现次数
const words = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
const count = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
}, {});
console.log(count); // { apple: 3, banana: 2, orange: 1 }
```

### 5. 实际应用示例

```javascript
// 实现一个简单的任务管理器
class TaskManager {
    constructor() {
        this.tasks = [];
    }
    
    // 增加任务
    addTask(task) {
        this.tasks.push({
            id: Date.now(),
            content: task,
            completed: false,
            createdAt: new Date()
        });
    }
    
    // 删除任务
    removeTask(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index > -1) {
            this.tasks.splice(index, 1);
        }
    }
    
    // 修改任务状态
    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
        }
    }
    
    // 查询未完成的任务
    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }
    
    // 查询任务
    findTask(id) {
        return this.tasks.find(task => task.id === id);
    }
    
    // 获取所有任务
    getAllTasks() {
        return [...this.tasks]; // 返回副本，避免外部修改
    }
}

const taskManager = new TaskManager();
taskManager.addTask('学习JavaScript数组方法');
taskManager.addTask('完成面试准备');
console.log(taskManager.getPendingTasks());
```

### 6. 性能考虑

- `push()` 和 `pop()` 操作效率最高，时间复杂度为 O(1)
- `unshift()` 和 `shift()` 操作需要移动所有元素，时间复杂度为 O(n)
- `splice()` 在中间插入或删除元素需要移动后续元素，时间复杂度为 O(n)
- 非变异方法（如 `map`, `filter`, `slice`）会创建新数组，消耗更多内存

理解这些方法的特性和适用场景，有助于在开发中选择最合适的方法来操作数组。
