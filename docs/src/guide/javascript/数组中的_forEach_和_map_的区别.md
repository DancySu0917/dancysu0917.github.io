# 数组中的 forEach 和 map 的区别？（必会）

**题目**: 数组中的 forEach 和 map 的区别？（必会）

## 标准答案

`forEach` 和 `map` 都是 JavaScript 数组的遍历方法，但它们在功能、返回值和使用场景上有重要区别：

### 1. 返回值差异

**forEach**：
- 返回 `undefined`
- 不返回新数组
- 不能链式调用

```javascript
const numbers = [1, 2, 3, 4];
const result = numbers.forEach(num => num * 2);
console.log(result); // undefined
console.log(numbers); // [1, 2, 3, 4] - 原数组未变
```

**map**：
- 返回一个新数组
- 新数组长度与原数组相同
- 可以链式调用

```javascript
const numbers = [1, 2, 3, 4];
const result = numbers.map(num => num * 2);
console.log(result); // [2, 4, 6, 8] - 新数组
console.log(numbers); // [1, 2, 3, 4] - 原数组未变
```

### 2. 主要用途

**forEach**：
- 用于执行副作用操作
- 适合不需要返回值的场景
- 用于遍历数组并执行操作

```javascript
const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 }
];

// 打印每个用户信息
users.forEach(user => {
    console.log(`${user.name} is ${user.age} years old`);
});

// 修改外部变量
let totalAge = 0;
users.forEach(user => {
    totalAge += user.age;
});
console.log(totalAge); // 55
```

**map**：
- 用于数据转换
- 适合需要返回新数组的场景
- 函数式编程中常用

```javascript
const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 }
];

// 提取用户名字
const names = users.map(user => user.name);
console.log(names); // ['Alice', 'Bob']

// 创建新的对象数组
const userInfos = users.map(user => ({
    name: user.name,
    isAdult: user.age >= 18
}));
console.log(userInfos); 
// [
//   { name: 'Alice', isAdult: true },
//   { name: 'Bob', isAdult: true }
// ]
```

### 3. 性能差异

**forEach**：
- 通常性能稍好（不需要创建新数组）
- 内存占用较少

**map**：
- 需要创建新数组，占用额外内存
- 略微的性能开销

### 4. 链式调用能力

**forEach**：
```javascript
// 无法链式调用，因为返回 undefined
const result = [1, 2, 3, 4]
    .forEach(x => x * 2)  // 返回 undefined
    .map(x => x + 1);     // 报错，Cannot read property 'map' of undefined
```

**map**：
```javascript
// 可以链式调用
const result = [1, 2, 3, 4]
    .map(x => x * 2)      // [2, 4, 6, 8]
    .map(x => x + 1)      // [3, 5, 7, 9]
    .filter(x => x > 5);  // [7, 9]
console.log(result); // [7, 9]
```

### 5. 中断执行

**forEach**：
- 无法使用 `break` 或 `return` 中断循环
- `return` 只能跳过当前迭代，不能中断整个循环

```javascript
const numbers = [1, 2, 3, 4, 5];

// 无法中断 forEach
numbers.forEach(num => {
    if (num === 3) {
        // return; // 只是跳过当前迭代，不能中断整个循环
        // break; // SyntaxError: Illegal break statement
    }
    console.log(num);
});
// 输出: 1, 2, 3, 4, 5
```

**map**：
- 同样无法中断，但通常不用于需要中断的场景

### 6. 实际应用场景对比

**使用 forEach 的场景**：
```javascript
// 1. 打印日志
const items = ['apple', 'banana', 'orange'];
items.forEach(item => console.log(item));

// 2. 发送 API 请求
const userIds = [1, 2, 3];
userIds.forEach(async id => {
    await fetch(`/api/users/${id}`);
});

// 3. DOM 操作
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('click', handleClick);
});
```

**使用 map 的场景**：
```javascript
// 1. 数据转换
const prices = [100, 200, 300];
const pricesWithTax = prices.map(price => price * 1.1);

// 2. JSX 渲染（React）
const items = ['apple', 'banana', 'orange'];
const listItems = items.map(item => <li key={item}>{item}</li>);

// 3. 创建映射对象
const users = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
const userMap = users.map(user => ({[user.id]: user.name}));
```

### 7. 错误处理

**forEach**：
```javascript
const numbers = [1, 2, 3, 4];
numbers.forEach(num => {
    if (num === 0) {
        throw new Error('Division by zero');
    }
    console.log(10 / num);
});
// 会继续执行后续元素，直到遇到错误
```

**map**：
```javascript
const numbers = [1, 2, 0, 4];
try {
    const results = numbers.map(num => {
        if (num === 0) {
            throw new Error('Division by zero');
        }
        return 10 / num;
    });
} catch (error) {
    console.log('Error occurred during mapping');
}
```

## 深入理解

1. **函数式编程**：`map` 是函数式编程的核心概念，它是一个纯函数，不改变原数组，返回新数组。

2. **副作用处理**：`forEach` 适合处理副作用（如 DOM 操作、API 调用等），而 `map` 适合纯数据转换。

3. **性能考虑**：如果只是需要遍历数组并执行操作，`forEach` 更合适；如果需要转换数据，`map` 更合适。

## 总结

- **forEach**：用于执行操作，无返回值，不创建新数组，不能链式调用
- **map**：用于数据转换，返回新数组，支持链式调用
- 选择原则：需要返回新数组用 `map`，只需要执行操作用 `forEach`
- `map` 更适合函数式编程范式，`forEach` 更适合命令式编程范式
