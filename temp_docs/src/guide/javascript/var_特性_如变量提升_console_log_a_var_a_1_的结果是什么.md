# var 特性（如变量提升）？console.log(a); var a = 1; 的结果是什么？（了解）

**题目**: var 特性（如变量提升）？console.log(a); var a = 1; 的结果是什么？（了解）

## 标准答案

执行 `console.log(a); var a = 1;` 的结果是输出 `undefined`，而不是报错。这是因为var声明具有"变量提升"（hoisting）的特性，变量声明会被提升到函数或全局作用域的顶部，但赋值操作不会被提升。

## 详细解释

JavaScript中的"变量提升"是指在JavaScript引擎的编译阶段，会将所有变量和函数的声明提升到当前作用域的顶部。对于var声明，具体行为如下：

1. **声明提升**：var声明的变量会被提升到当前作用域的顶部
2. **初始化不提升**：变量的赋值操作不会被提升
3. **初始值为undefined**：被提升的变量在执行到赋值语句之前，值为undefined

在执行`console.log(a); var a = 1;`时，JavaScript引擎实际上会按以下顺序处理：
1. 首先，提升var a的声明，此时a被初始化为undefined
2. 然后，执行console.log(a)，输出undefined
3. 最后，执行a = 1的赋值操作

## 代码示例

```javascript
// 示例1：基本的变量提升
console.log(a); // 输出: undefined
var a = 1;
console.log(a); // 输出: 1

// 等价于：
var a; // 声明被提升，初始化为undefined
console.log(a); // 输出: undefined
a = 1; // 赋值操作
console.log(a); // 输出: 1

// 示例2：函数内部的变量提升
function example() {
    console.log(b); // 输出: undefined
    var b = 2;
    console.log(b); // 输出: 2
}
example();

// 示例3：变量提升只在当前作用域内有效
var c = 1;
function example2() {
    console.log(c); // 输出: undefined（不是全局的1）
    var c = 2;
    console.log(c); // 输出: 2
}
example2();

// 等价于：
var c = 1;
function example2() {
    var c; // 函数作用域内的声明被提升
    console.log(c); // 输出: undefined
    c = 2;
    console.log(c); // 输出: 2
}
example2();
console.log(c); // 输出: 1（全局变量未受影响）

// 示例4：与let/const的对比
console.log(d); // ReferenceError: Cannot access 'd' before initialization
let d = 1;

console.log(e); // ReferenceError: Cannot access 'e' before initialization
const e = 1;

// 示例5：函数声明的提升
console.log(f()); // 输出: "Hello"
function f() {
    return "Hello";
}

// 函数表达式的提升行为不同
console.log(g()); // TypeError: g is not a function
var g = function() {
    return "World";
};
