# class 和普通构造函数有何区别？（高薪常问）

**题目**: class 和普通构造函数有何区别？（高薪常问）

## 标准答案

ES6 中的 `class` 语法和普通构造函数在功能上是等价的，都是基于原型的继承机制，但它们在语法、语义和行为上存在重要区别：

### 1. 语法差异

**构造函数语法**：
```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.sayHello = function() {
    console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Alice', 25);
```

**Class 语法**：
```javascript
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    sayHello() {
        console.log(`Hello, I'm ${this.name}`);
    }
}

const person = new Person('Alice', 25);
```

### 2. 声明提升（Hoisting）差异

**构造函数**：函数声明会被提升，可以在声明前调用
```javascript
const person = new Person('Alice', 25); // 可以正常工作

function Person(name, age) {
    this.name = name;
    this.age = age;
}
```

**Class**：class 声明不会被提升，存在暂时性死区
```javascript
const person = new Person('Alice', 25); // ReferenceError: Cannot access 'Person' before initialization

class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
```

### 3. 严格模式（Strict Mode）

**构造函数**：需要显式启用严格模式
```javascript
function Person(name) {
    'use strict'; // 需要手动添加
    this.name = name;
}
```

**Class**：默认启用严格模式
```javascript
class Person {
    constructor(name) {
        // 默认运行在严格模式下
        this.name = name;
    }
}
```

### 4. 调用方式限制

**构造函数**：可以直接调用，也可以用 new 调用
```javascript
function Person(name) {
    this.name = name;
}

const person1 = Person('Alice'); // 可以直接调用，this 指向全局对象
const person2 = new Person('Alice'); // 正确的构造函数调用
```

**Class**：只能通过 new 调用，直接调用会报错
```javascript
class Person {
    constructor(name) {
        this.name = name;
    }
}

const person = Person('Alice'); // TypeError: Class constructor Person cannot be invoked without 'new'
const person = new Person('Alice'); // 正确的调用方式
```

### 5. 原型方法的可枚举性

**构造函数**：原型方法默认可枚举
```javascript
function Person(name) {
    this.name = name;
}

Person.prototype.sayHello = function() {
    console.log('Hello');
};

// sayHello 方法是可枚举的
for (let key in new Person()) {
    console.log(key); // 会列出 sayHello
}
```

**Class**：类中定义的方法默认不可枚举
```javascript
class Person {
    constructor(name) {
        this.name = name;
    }
    
    sayHello() {
        console.log('Hello');
    }
}

// sayHello 方法不可枚举
for (let key in new Person()) {
    console.log(key); // 不会列出 sayHello
}
```

### 6. 继承实现方式

**构造函数继承**：
```javascript
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    console.log(`${this.name} makes a sound`);
};

function Dog(name, breed) {
    Animal.call(this, name); // 调用父类构造函数
    this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
```

**Class 继承**：
```javascript
class Animal {
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        console.log(`${this.name} makes a sound`);
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name); // 调用父类构造函数
        this.breed = breed;
    }
}
```

### 7. 内部方法和属性

**构造函数**：没有内置的静态方法语法，需要手动添加
```javascript
function Person(name) {
    this.name = name;
}

Person.getClassName = function() { // 手动添加静态方法
    return 'Person';
};
```

**Class**：内置静态方法和私有字段支持（ES2022）
```javascript
class Person {
    static className = 'Person'; // 静态属性
    
    static getClassName() { // 静态方法
        return this.className;
    }
    
    #privateField; // 私有字段（ES2022）
    
    constructor(name) {
        this.name = name;
        this.#privateField = 'private';
    }
}
```

### 8. 子类中的 this 操作

**构造函数**：可以在调用父类构造函数前操作 this
```javascript
function Animal(name) {
    this.name = name;
}

function Dog(name, breed) {
    this.breed = breed; // 可以在调用父类构造函数前操作 this
    Animal.call(this, name);
}
```

**Class**：必须在 super() 调用后才能使用 this
```javascript
class Animal {
    constructor(name) {
        this.name = name;
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        this.breed = breed; // SyntaxError: Must call super constructor in derived class before accessing 'this'
        super(name);
    }
    
    // 正确写法
    constructor(name, breed) {
        super(name); // 必须先调用 super()
        this.breed = breed; // 然后才能操作 this
    }
}
```

## 深入理解

1. **语法糖本质**：ES6 的 class 本质上是构造函数的语法糖，编译后仍然是基于原型的实现。
2. **设计哲学**：class 语法提供更清晰的面向对象编程模型，使代码更易读易维护。
3. **兼容性**：虽然 class 语法更现代化，但在某些场景下构造函数仍有其用武之地，特别是在需要兼容旧环境时。

## 总结

虽然 ES6 的 class 和传统构造函数在底层实现上本质相同，但 class 提供了更清晰、更安全的语法，具有默认严格模式、不可重复调用、更好的继承语法等优势。在现代 JavaScript 开发中，推荐使用 class 语法，但在理解 JavaScript 原型机制时，了解构造函数的原理仍然非常重要。
