# ES5 和 ES6 的区别，说几个 ES6 的新增方法（必会）

**题目**: ES5 和 ES6 的区别，说几个 ES6 的新增方法（必会）

## 标准答案

ES6（ECMAScript 2015）相对于ES5引入了大量新特性，主要区别包括：新增了let/const变量声明、箭头函数、模板字符串、解构赋值、类、模块化、Promise等。ES6的新增方法包括Array.from()、Array.of()、includes()、find()、findIndex()、Object.assign()、Object.is()等。

## 深入理解

### 1. 变量声明

#### ES5中的变量声明
```javascript
// ES5只有var声明变量，存在变量提升
var name = 'ES5';
var age; // 声明但未初始化

// 变量提升示例
console.log(x); // undefined（不是报错）
var x = 5;

// 函数作用域
function example() {
    if (true) {
        var localVar = 'local';
    }
    console.log(localVar); // 'local' - 变量提升到函数作用域
}
```

#### ES6中的变量声明
```javascript
// ES6引入let和const
let name = 'ES6'; // 块级作用域
const age = 25;   // 常量，块级作用域

// 块级作用域示例
function example() {
    if (true) {
        let blockVar = 'block';
        const blockConst = 'const';
    }
    // console.log(blockVar); // ReferenceError: blockVar is not defined
}

// 暂时性死区
// console.log(temp); // ReferenceError: Cannot access 'temp' before initialization
let temp = 'temporary';

// const必须初始化且不能重新赋值
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable
```

### 2. 箭头函数（Arrow Functions）

#### ES5中的函数
```javascript
// ES5函数表达式
var add = function(a, b) {
    return a + b;
};

// ES5中this的指向问题
var objES5 = {
    name: 'ES5 Object',
    items: [1, 2, 3],
    getItem: function() {
        var self = this; // 需要保存this引用
        return this.items.map(function(item) {
            return self.name + ': ' + item; // 使用保存的引用
        });
    }
};
```

#### ES6中的箭头函数
```javascript
// ES6箭头函数
const add = (a, b) => a + b;
const multiply = (a, b) => {
    return a * b;
};
const square = x => x * x; // 单参数可省略括号
const greet = () => 'Hello'; // 无参数需要括号

// 箭头函数的this绑定
const objES6 = {
    name: 'ES6 Object',
    items: [1, 2, 3],
    getItem: function() {
        return this.items.map(item => `${this.name}: ${item}`); // this指向外层作用域
    }
};

// 箭头函数不绑定arguments
function regularFunction() {
    console.log(arguments); // 正常访问
    const arrowFunc = () => {
        // console.log(arguments); // ReferenceError: arguments is not defined
    };
}
```

### 3. 模板字符串

#### ES5中的字符串拼接
```javascript
// ES5字符串拼接
var name = 'John';
var age = 30;
var message = 'Hello, my name is ' + name + ' and I am ' + age + ' years old.';
```

#### ES6中的模板字符串
```javascript
// ES6模板字符串
const name = 'John';
const age = 30;
const message = `Hello, my name is ${name} and I am ${age} years old.`;

// 多行字符串
const multiline = `
    This is a
    multi-line
    string
`;

// 模板字符串中的表达式
const calculation = `2 + 3 = ${2 + 3}`;
const fruits = ['apple', 'banana', 'orange'];
const fruitList = `
    <ul>
        ${fruits.map(fruit => `<li>${fruit}</li>`).join('')}
    </ul>
`;
```

### 4. 解构赋值

#### ES5中的值提取
```javascript
// ES5提取对象属性
var person = { name: 'Alice', age: 25, city: 'New York' };
var name = person.name;
var age = person.age;
var city = person.city;

// ES5提取数组元素
var numbers = [1, 2, 3];
var first = numbers[0];
var second = numbers[1];
var third = numbers[2];
```

#### ES6中的解构赋值
```javascript
// ES6对象解构
const person = { name: 'Alice', age: 25, city: 'New York' };
const { name, age, city } = person;

// 重命名和默认值
const { name: personName, age: personAge, country = 'USA' } = person;

// 嵌套解构
const user = {
    id: 1,
    profile: {
        name: 'Bob',
        address: {
            city: 'London',
            zip: 'SW1'
        }
    }
};
const { profile: { name: userName, address: { city: userCity } } } = user;

// 数组解构
const numbers = [1, 2, 3, 4, 5];
const [first, second, , fourth] = numbers; // 跳过第三个元素
const [head, ...tail] = numbers; // 剩余操作符

// 函数参数解构
function displayUser({ name, age, email = 'no-email' }) {
    console.log(`Name: ${name}, Age: ${age}, Email: ${email}`);
}

displayUser({ name: 'Charlie', age: 35 });
```

### 5. ES6新增的数组方法

```javascript
// Array.from() - 从类数组对象或可迭代对象创建新数组
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
const arr1 = Array.from(arrayLike);
console.log(arr1); // ['a', 'b']

// Array.from() 配合映射函数
const doubled = Array.from([1, 2, 3], x => x * 2);
console.log(doubled); // [2, 4, 6]

// Array.of() - 创建数组
const arr2 = Array.of(1, 2, 3);
console.log(arr2); // [1, 2, 3]

// Array.prototype.includes() - 检查元素是否存在
const arr3 = [1, 2, 3, 4, 5];
console.log(arr3.includes(3)); // true
console.log(arr3.includes(6)); // false

// Array.prototype.find() - 查找满足条件的第一个元素
const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
];
const user = users.find(u => u.id === 2);
console.log(user); // { id: 2, name: 'Bob' }

// Array.prototype.findIndex() - 查找满足条件的第一个元素的索引
const index = users.findIndex(u => u.name === 'Charlie');
console.log(index); // 2
```

### 6. ES6新增的对象方法

```javascript
// Object.assign() - 对象合并
const target = { a: 1, b: 2 };
const source1 = { b: 4, c: 5 };
const source2 = { c: 6, d: 7 };

const result = Object.assign(target, source1, source2);
console.log(result); // { a: 1, b: 4, c: 6, d: 7 }
console.log(target); // { a: 1, b: 4, c: 6, d: 7 } - target被修改

// 使用空对象创建新对象
const newObj = Object.assign({}, target, { e: 8 });

// Object.is() - 严格相等比较
console.log(Object.is(1, 1)); // true
console.log(Object.is(0, -0)); // false
console.log(Object.is(NaN, NaN)); // true
console.log(Object.is('hello', 'hello')); // true

// 对象属性简写
const name = 'Alice';
const age = 25;
const person = {
    name, // 等同于 name: name
    age,  // 等同于 age: age
    greet() { // 方法简写
        return `Hello, I'm ${this.name}`;
    }
};

// 计算属性名
const key = 'dynamicKey';
const obj = {
    [key]: 'value',
    [`${key}_suffix`]: 'another value',
    [key.toUpperCase()]: 'uppercase value'
};
```

### 7. 类（Class）

#### ES5中的构造函数
```javascript
// ES5构造函数和原型
function PersonES5(name, age) {
    this.name = name;
    this.age = age;
}

PersonES5.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

PersonES5.prototype.getAge = function() {
    return this.age;
};

// 继承
function StudentES5(name, age, grade) {
    PersonES5.call(this, name, age);
    this.grade = grade;
}

StudentES5.prototype = Object.create(PersonES5.prototype);
StudentES5.prototype.constructor = StudentES5;
```

#### ES6中的类
```javascript
// ES6类语法
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hello, I'm ${this.name}`;
    }
    
    getAge() {
        return this.age;
    }
    
    static species() {
        return 'Homo sapiens';
    }
}

// ES6继承
class Student extends Person {
    constructor(name, age, grade) {
        super(name, age); // 调用父类构造函数
        this.grade = grade;
    }
    
    study() {
        return `${this.name} is studying in grade ${this.grade}`;
    }
}

const student = new Student('Alice', 20, 'A');
console.log(student.greet()); // "Hello, I'm Alice"
console.log(student.study()); // "Alice is studying in grade A"
console.log(Student.species()); // "Homo sapiens"
```

### 8. 模块化

#### ES5中的模块模式
```javascript
// ES5模块模式（IIFE）
var MyModule = (function() {
    var privateVar = 'private';
    
    function privateMethod() {
        return 'private method';
    }
    
    return {
        publicMethod: function() {
            return 'public method';
        },
        getPrivateVar: function() {
            return privateVar;
        }
    };
})();
```

#### ES6中的模块
```javascript
// ES6模块语法
// math.js
export const PI = 3.14159;
export function add(a, b) {
    return a + b;
}
export default function multiply(a, b) {
    return a * b;
}

// main.js
import multiply, { PI, add } from './math.js';
import * as MathUtils from './math.js';

console.log(PI); // 3.14159
console.log(add(2, 3)); // 5
console.log(multiply(2, 3)); // 6
```

### 9. Promise

#### ES5中的异步处理（回调地狱）
```javascript
// ES5回调方式
function asyncOperation1(callback) {
    setTimeout(() => {
        console.log('Operation 1 completed');
        callback(null, 'result1');
    }, 100);
}

function asyncOperation2(data, callback) {
    setTimeout(() => {
        console.log('Operation 2 completed with', data);
        callback(null, 'result2');
    }, 100);
}

// 回调地狱
asyncOperation1((err, result1) => {
    if (err) return console.error(err);
    asyncOperation2(result1, (err, result2) => {
        if (err) return console.error(err);
        console.log('All operations completed:', result2);
    });
});
```

#### ES6中的Promise
```javascript
// ES6 Promise
function asyncOperation1() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Operation 1 completed');
            resolve('result1');
        }, 100);
    });
}

function asyncOperation2(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Operation 2 completed with', data);
            resolve('result2');
        }, 100);
    });
}

// Promise链式调用
asyncOperation1()
    .then(result1 => {
        return asyncOperation2(result1);
    })
    .then(result2 => {
        console.log('All operations completed:', result2);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// Promise.all 并行执行
Promise.all([
    asyncOperation1(),
    asyncOperation2('test')
]).then(results => {
    console.log('All promises resolved:', results);
});
```

### 10. 其他ES6重要特性

```javascript
// 默认参数
function greet(name = 'World', punctuation = '!') {
    return `Hello ${name}${punctuation}`;
}
console.log(greet()); // "Hello World!"
console.log(greet('ES6')); // "Hello ES6!"

// 剩余参数
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}
console.log(sum(1, 2, 3, 4, 5)); // 15

// 扩展运算符
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// Set和Map
const uniqueNumbers = new Set([1, 2, 2, 3, 3, 4]);
console.log([...uniqueNumbers]); // [1, 2, 3, 4]

const userMap = new Map();
userMap.set('name', 'Alice');
userMap.set('age', 25);
console.log(userMap.get('name')); // 'Alice'
```

## 总结

ES6相对于ES5的主要改进包括：

1. **变量声明**：引入let/const，解决了var的变量提升和作用域问题
2. **函数**：箭头函数提供了更简洁的语法和this绑定
3. **字符串**：模板字符串简化了字符串拼接和多行字符串
4. **解构赋值**：简化了从对象和数组中提取数据的过程
5. **数组方法**：新增Array.from()、Array.of()、includes()、find()、findIndex()等
6. **对象方法**：新增Object.assign()、Object.is()等
7. **类**：提供了更清晰的面向对象编程语法
8. **模块化**：提供了原生的模块系统
9. **异步处理**：Promise提供了更好的异步编程方式
10. **其他特性**：默认参数、剩余参数、扩展运算符、Set/Map等

ES6的这些新特性使JavaScript代码更简洁、可读性更强，也更易于维护。
