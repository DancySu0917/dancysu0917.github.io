# var、let、const 之间的区别（必会）

**题目**: var、let、const 之间的区别（必会）

## 标准答案

var、let、const 是 JavaScript 中声明变量的三种方式，它们有以下主要区别：

1. **作用域**：
   - var：函数作用域或全局作用域
   - let：块级作用域
   - const：块级作用域

2. **变量提升**：
   - var：声明会被提升到函数或全局作用域顶部，初始化值为 undefined
   - let：声明会被提升但不会初始化（存在暂时性死区）
   - const：声明会被提升但不会初始化（存在暂时性死区）

3. **重复声明**：
   - var：允许在同一作用域内重复声明
   - let：不允许在同一作用域内重复声明
   - const：不允许在同一作用域内重复声明

4. **重新赋值**：
   - var：可以重新赋值
   - let：可以重新赋值
   - const：不能重新赋值，必须在声明时初始化

## 深入理解

### 作用域差异

```javascript
// var 函数作用域示例
function varExample() {
    if (true) {
        var x = 1;
    }
    console.log(x); // 1 - x 在整个函数作用域内都可访问
}

// let 块级作用域示例
function letExample() {
    if (true) {
        let y = 1;
    }
    console.log(y); // ReferenceError: y is not defined
}

// const 块级作用域示例
function constExample() {
    if (true) {
        const z = 1;
    }
    console.log(z); // ReferenceError: z is not defined
}

// 块级作用域的实际应用
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log('var:', i), 100); // 输出: 3, 3, 3
}

for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log('let:', j), 100); // 输出: 0, 1, 2
}
```

### 变量提升差异

```javascript
// var 的变量提升
console.log(a); // undefined (不是 ReferenceError)
var a = 10;
console.log(a); // 10

// 等价于：
// var a;
// console.log(a); // undefined
// a = 10;
// console.log(a); // 10

// let 的暂时性死区
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;

// const 的暂时性死区
console.log(c); // ReferenceError: Cannot access 'c' before initialization
const c = 30;

// 暂时性死区的更多示例
function tempDeadZone() {
    console.log(typeof value); // ReferenceError
    let value = 'hello';
}
```

### 重复声明差异

```javascript
// var 允许重复声明
var name = 'Alice';
var name = 'Bob'; // 不会报错
console.log(name); // 'Bob'

// let 不允许重复声明
let age = 25;
// let age = 30; // SyntaxError: Identifier 'age' has already been declared
age = 30; // 这是可以的，只是重新赋值

// const 不允许重复声明
const city = 'New York';
// const city = 'London'; // SyntaxError: Identifier 'city' has already been declared

// 在不同作用域中声明同名变量是可以的
function scopeExample() {
    let x = 1;
    {
        let x = 2; // 这是允许的，因为是不同的块级作用域
        console.log(x); // 2
    }
    console.log(x); // 1
}
```

### 重新赋值差异

```javascript
// var 可以重新赋值
var greeting = 'Hello';
greeting = 'Hi';
console.log(greeting); // 'Hi'

// let 可以重新赋值
let message = 'Hello';
message = 'Hi';
console.log(message); // 'Hi'

// const 不能重新赋值
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable

// 注意：const 对于对象和数组，不能重新赋值引用，但可以修改内容
const person = { name: 'Alice', age: 25 };
person.name = 'Bob'; // 这是可以的
person.age = 30;     // 这也是可以的
console.log(person); // { name: 'Bob', age: 30 }

// 但不能重新赋值整个对象
// person = { name: 'Charlie' }; // TypeError: Assignment to constant variable

const numbers = [1, 2, 3];
numbers.push(4); // 这是可以的
console.log(numbers); // [1, 2, 3, 4]

// 但不能重新赋值整个数组
// numbers = [5, 6, 7]; // TypeError: Assignment to constant variable
```

### 实际应用场景对比

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数/全局 | 块级 | 块级 |
| 变量提升 | 提升并初始化为undefined | 提升但不初始化 | 提升但不初始化 |
| 暂时性死区 | 无 | 有 | 有 |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 声明时初始化 | 可选 | 可选 | 必须 |

### 最佳实践建议

1. **优先使用 const**：对于不需要重新赋值的变量，使用 const
2. **其次使用 let**：对于需要重新赋值的变量，使用 let
3. **避免使用 var**：除非有特殊需求，否则应避免使用 var

```javascript
// 推荐的使用方式
const userName = 'Alice'; // 不需要重新赋值的变量
const users = []; // 对象/数组，内容可变但引用不变
let counter = 0; // 需要重新赋值的变量

// 不推荐使用 var
// var temp = 'temporary';
```

## 总结

- **var** 是 JavaScript 最早的变量声明方式，具有函数作用域和变量提升特性，但容易造成作用域污染
- **let** 引入了块级作用域，解决了 var 的一些问题，适合需要重新赋值的变量
- **const** 也具有块级作用域，但变量值不能重新赋值，适合声明常量和对象引用
- 现代 JavaScript 开发中，推荐优先使用 const，其次使用 let，避免使用 var
- 三者都存在暂时性死区，但在变量提升和初始化方面有所不同
