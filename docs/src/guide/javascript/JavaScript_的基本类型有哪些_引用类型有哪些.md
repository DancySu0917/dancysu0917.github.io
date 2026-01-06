# JavaScript 的基本类型有哪些？引用类型有哪些？（必会）

**题目**: JavaScript 的基本类型有哪些？引用类型有哪些？（必会）

**答案**:

JavaScript 中的数据类型可以分为两大类：基本类型（原始类型）和引用类型。了解这些类型的区别对于理解 JavaScript 的内存管理和变量赋值非常重要。

### 基本类型（Primitive Types）

基本类型也称为原始类型，存储在栈内存中，赋值时是值的复制：

1. **Number** - 数值类型
   - 包括整数、浮点数、NaN、Infinity
   - 示例：`let age = 25; let price = 19.99;`

2. **String** - 字符串类型
   - 表示文本数据
   - 示例：`let name = "JavaScript";`

3. **Boolean** - 布尔类型
   - 只有两个值：true 和 false
   - 示例：`let isActive = true;`

4. **Undefined** - 未定义类型
   - 变量已声明但未赋值时的默认值
   - 示例：`let variable; console.log(variable); // undefined`

5. **Null** - 空值类型
   - 表示一个空对象指针
   - 示例：`let obj = null;`

6. **Symbol** (ES6新增) - 符号类型
   - 表示独一无二的值，主要用于对象属性的标识符
   - 示例：`let sym = Symbol('description');`

7. **BigInt** (ES2020新增) - 大整数类型
   - 用于表示任意精度的整数
   - 示例：`let bigNumber = 123n;`

### 引用类型（Reference Types）

引用类型存储在堆内存中，变量中存储的是指向对象的引用（地址）：

1. **Object** - 对象类型
   - 最基本的引用类型
   - 示例：`let person = { name: "张三", age: 25 };`

2. **Array** - 数组类型
   - 用于存储有序的数据集合
   - 示例：`let fruits = ["苹果", "香蕉", "橙子"];`

3. **Function** - 函数类型
   - 在 JavaScript 中函数也是对象
   - 示例：`let greet = function() { return "Hello"; };`

4. **Date** - 日期类型
   - 用于处理日期和时间
   - 示例：`let now = new Date();`

5. **RegExp** - 正则表达式类型
   - 用于模式匹配
   - 示例：`let pattern = /abc/g;`

6. **Error** - 错误类型
   - 用于表示错误信息
   - 示例：`let error = new Error("出错了");`

### 主要区别

| 特性 | 基本类型 | 引用类型 |
|------|----------|----------|
| 存储位置 | 栈内存 | 堆内存 |
| 赋值行为 | 值复制 | 引用复制 |
| 比较方式 | 按值比较 | 按引用比较 |
| 内存大小 | 固定大小 | 动态大小 |

### 代码示例

**基本类型的赋值**：
```javascript
let a = 10;
let b = a;  // b 获得 a 的值副本
a = 20;
console.log(b);  // 输出: 10 (b 不受影响)
```

**引用类型的赋值**：
```javascript
let obj1 = { name: "张三" };
let obj2 = obj1;  // obj2 获得 obj1 的引用
obj1.name = "李四";
console.log(obj2.name);  // 输出: "李四" (obj2 受影响)
```

**比较差异**：
```javascript
// 基本类型比较
console.log(1 === 1);  // true
console.log("hello" === "hello");  // true

// 引用类型比较
let arr1 = [1, 2, 3];
let arr2 = [1, 2, 3];
let arr3 = arr1;

console.log(arr1 === arr2);  // false (不同引用)
console.log(arr1 === arr3);  // true (相同引用)
```

### 类型检测方法

```javascript
// typeof 检测基本类型
console.log(typeof 123);        // "number"
console.log(typeof "hello");    // "string"
console.log(typeof true);       // "boolean"
console.log(typeof undefined);  // "undefined"
console.log(typeof Symbol());   // "symbol"
console.log(typeof BigInt(1));  // "bigint"

// typeof 对于 null 的特殊情况
console.log(typeof null);       // "object" (历史遗留问题)

// 检测引用类型
console.log(typeof {});         // "object"
console.log(typeof []);         // "object"
console.log(typeof function(){}); // "function"

// 更精确的类型检测
console.log(Object.prototype.toString.call([]));  // "[object Array]"
console.log(Array.isArray([]));  // true
console.log(obj instanceof Object);  // true
```

理解 JavaScript 的数据类型对于编写高效、正确的代码至关重要，特别是在处理变量赋值、函数参数传递和对象比较时。
