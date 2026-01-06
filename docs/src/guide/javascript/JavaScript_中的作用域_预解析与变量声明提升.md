# JavaScript 中的作用域、预解析与变量声明提升？（必会）

**题目**: JavaScript 中的作用域、预解析与变量声明提升？（必会）

## 答案

JavaScript中的作用域、预解析和变量声明提升是理解JavaScript执行机制的重要概念：

### 1. 作用域（Scope）

作用域是指变量的可访问范围，决定了变量在代码中的可见性。

#### 全局作用域（Global Scope）
在所有函数之外声明的变量具有全局作用域。

```javascript
var globalVar = 'I am global';

function test() {
    console.log(globalVar); // 'I am global' - 可以访问全局变量
}
```

#### 函数作用域（Function Scope）
在函数内部声明的变量具有函数作用域，只能在该函数内部访问。

```javascript
function test() {
    var localVar = 'I am local';
}
console.log(localVar); // ReferenceError: localVar is not defined
```

#### 块级作用域（Block Scope）
ES6引入了let和const，提供了块级作用域（由花括号{}定义）。

```javascript
if (true) {
    var a = 1;      // 函数作用域
    let b = 2;      // 块级作用域
    const c = 3;    // 块级作用域
}
console.log(a); // 1 - var没有块级作用域
console.log(b); // ReferenceError: b is not defined
console.log(c); // ReferenceError: c is not defined
```

### 2. 变量声明提升（Hoisting）

在JavaScript中，变量和函数声明会被提升到其作用域的顶部。

#### var声明的提升
使用var声明的变量会被提升到函数或全局作用域的顶部，但赋值不会被提升。

```javascript
console.log(myVar); // undefined (不是ReferenceError)
var myVar = 5;
console.log(myVar); // 5

// 实际上等同于：
// var myVar;        // 声明被提升
// console.log(myVar); // undefined
// myVar = 5;        // 赋值保持在原位置
// console.log(myVar); // 5
```

#### 函数声明的提升
函数声明会被完整地提升到作用域顶部。

```javascript
sayHello(); // "Hello!"

function sayHello() {
    console.log("Hello!");
}
```

#### 函数表达式的提升
函数表达式不会被提升，因为它们是作为赋值语句的一部分创建的。

```javascript
sayHello(); // TypeError: Cannot access 'sayHello' before initialization

const sayHello = function() {
    console.log("Hello!");
};
```

#### let和const的提升
let和const也会被提升，但存在"暂时性死区"（Temporal Dead Zone），在声明之前访问会报错。

```javascript
console.log(myLet); // ReferenceError: Cannot access 'myLet' before initialization
let myLet = 10;

console.log(myConst); // ReferenceError: Cannot access 'myConst' before initialization
const myConst = 20;
```

### 3. 预解析（Pre-parsing）

JavaScript引擎在执行代码之前会进行预解析，这个过程包括：

1. **词法分析**：将代码分解为标记（tokens）
2. **语法分析**：构建抽象语法树（AST）
3. **变量和函数声明提升**：将声明移到作用域顶部
4. **作用域链构建**：确定变量的访问路径

### 4. 作用域链（Scope Chain）

当访问一个变量时，JavaScript引擎会从当前作用域开始查找，如果找不到就向上级作用域查找，直到全局作用域。

```javascript
var globalVar = 'global';

function outer() {
    var outerVar = 'outer';
    
    function inner() {
        var innerVar = 'inner';
        console.log(globalVar); // 'global' - 从全局作用域获取
        console.log(outerVar);  // 'outer' - 从父级作用域获取
        console.log(innerVar);  // 'inner' - 从当前作用域获取
    }
    
    inner();
}
outer();
```

### 5. 不同声明方式的对比

| 声明方式 | 作用域 | 提升行为 | 暂时性死区 | 重复声明 |
|----------|--------|----------|------------|----------|
| var | 函数/全局 | 声明提升 | 无 | 允许 |
| let | 块级 | 声明提升 | 有 | 不允许 |
| const | 块级 | 声明提升 | 有 | 不允许 |

### 6. 实际应用和注意事项

- **避免变量污染**：使用let和const替代var，利用块级作用域
- **理解提升机制**：在函数开头声明所有变量，避免混淆
- **避免重复声明**：特别是在全局作用域中，防止意外覆盖

理解这些概念有助于编写更可靠的JavaScript代码，并避免常见的陷阱。
