# 说说你对原型（prototype）理解？（必会）

**题目**: 说说你对原型（prototype）理解？（必会）

## 答案

原型（prototype）是JavaScript中一个核心的概念，它为对象提供了继承机制。在JavaScript中，每个函数（除了箭头函数）都有一个prototype属性，这个属性是一个对象，包含了可以被该函数的实例共享的属性和方法。

### 1. 原型的基本概念

在JavaScript中，每个对象都有一个内部属性[[Prototype]]（可以通过__proto__访问），它指向该对象的原型对象。原型对象本身也是一个对象，它也有自己的原型，这样就形成了一个原型链。

```javascript
// 每个函数都有一个prototype属性
function Person(name) {
    this.name = name;
}

// 在原型上添加方法
Person.prototype.sayHello = function() {
    console.log(`Hello, my name is ${this.name}`);
};

// 创建实例
const person1 = new Person('Alice');
const person2 = new Person('Bob');

// 两个实例都可以访问原型上的方法
person1.sayHello(); // "Hello, my name is Alice"
person2.sayHello(); // "Hello, my name is Bob"

// 验证原型关系
console.log(person1.__proto__ === Person.prototype); // true
console.log(person2.__proto__ === Person.prototype); // true
```

### 2. 原型链的工作原理

当访问对象的一个属性时，JavaScript引擎会首先在对象本身上查找，如果找不到，就会沿着原型链向上查找，直到找到该属性或到达原型链的顶端（null）。

```javascript
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    console.log(`${this.name} makes a sound`);
};

function Dog(name, breed) {
    Animal.call(this, name); // 调用父构造函数
    this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 在Dog原型上添加特定方法
Dog.prototype.bark = function() {
    console.log(`${this.name} barks`);
};

const myDog = new Dog('Buddy', 'Golden Retriever');

// myDog可以访问Dog原型上的方法
myDog.bark(); // "Buddy barks"

// myDog也可以访问Animal原型上的方法（通过原型链）
myDog.speak(); // "Buddy makes a sound"

// 查看原型链
console.log(myDog.__proto__ === Dog.prototype); // true
console.log(Dog.prototype.__proto__ === Animal.prototype); // true
console.log(Animal.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true
```

### 3. 原型的属性和方法

原型对象通常包含以下属性和方法：

- **constructor**: 指向构造函数本身
- **其他自定义属性和方法**: 供实例共享

```javascript
function Car(brand) {
    this.brand = brand;
}

// 原型上的方法
Car.prototype.start = function() {
    console.log(`${this.brand} car started`);
};

Car.prototype.stop = function() {
    console.log(`${this.brand} car stopped`);
};

// constructor属性指向构造函数
console.log(Car.prototype.constructor === Car); // true

const myCar = new Car('Toyota');
console.log(myCar.constructor === Car); // true
```

### 4. 原型的使用场景

#### 4.1 方法共享

将方法定义在原型上，可以被所有实例共享，节省内存。

```javascript
function User(name, email) {
    this.name = name;
    this.email = email;
    // 如果方法定义在构造函数内部，每个实例都会有自己的方法副本
    // this.getInfo = function() { return `${this.name}: ${this.email}`; }
}

// 将方法定义在原型上，所有实例共享同一个方法
User.prototype.getInfo = function() {
    return `${this.name}: ${this.email}`;
};

User.prototype.updateEmail = function(newEmail) {
    this.email = newEmail;
};

const user1 = new User('Alice', 'alice@example.com');
const user2 = new User('Bob', 'bob@example.com');

// 两个实例共享同一个getInfo方法
console.log(user1.getInfo === user2.getInfo); // true
```

#### 4.2 继承实现

通过原型链实现继承机制。

```javascript
// 父类
function Shape(color) {
    this.color = color;
}

Shape.prototype.getInfo = function() {
    return `This is a ${this.color} shape`;
};

// 子类
function Circle(color, radius) {
    Shape.call(this, color); // 调用父构造函数
    this.radius = radius;
}

// 设置继承关系
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

// 子类特有方法
Circle.prototype.getArea = function() {
    return Math.PI * this.radius * this.radius;
};

const circle = new Circle('red', 5);
console.log(circle.getInfo()); // "This is a red shape" (继承自Shape)
console.log(circle.getArea()); // 约78.54 (Circle特有方法)
```

### 5. ES6 Class 与原型

ES6引入的class语法实际上是基于原型的语法糖，底层仍然是原型机制。

```javascript
// ES6 Class语法
class Rectangle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    getArea() {
        return this.width * this.height;
    }
    
    static getClassName() {
        return 'Rectangle';
    }
}

// 等价于传统的原型写法
function RectangleOld(width, height) {
    this.width = width;
    this.height = height;
}

RectangleOld.prototype.getArea = function() {
    return this.width * this.height;
};

RectangleOld.getClassName = function() {
    return 'Rectangle';
};

// 两种方式创建的实例行为相同
const rect1 = new Rectangle(10, 5);
const rect2 = new RectangleOld(10, 5);

console.log(rect1.getArea()); // 50
console.log(rect2.getArea()); // 50
console.log(rect1.__proto__ === Rectangle.prototype); // true
console.log(rect2.__proto__ === RectangleOld.prototype); // true
```

### 6. 原型的检查方法

JavaScript提供了多种方法来检查原型关系：

```javascript
function Animal() {}
function Dog() {}
Dog.prototype = Object.create(Animal.prototype);

const myDog = new Dog();

// instanceof 操作符
console.log(myDog instanceof Dog); // true
console.log(myDog instanceof Animal); // true

// isPrototypeOf 方法
console.log(Dog.prototype.isPrototypeOf(myDog)); // true
console.log(Animal.prototype.isPrototypeOf(myDog)); // true

// hasOwnProperty 方法
function Cat(name) {
    this.name = name; // 实例属性
}
Cat.prototype.species = 'feline'; // 原型属性

const myCat = new Cat('Fluffy');
console.log(myCat.hasOwnProperty('name')); // true
console.log(myCat.hasOwnProperty('species')); // false
console.log('species' in myCat); // true (in操作符会检查原型链)
```

### 7. 原型的注意事项

#### 7.1 原型中的引用类型属性

在原型中定义引用类型属性会被所有实例共享，这可能导致意外的问题。

```javascript
function BadExample() {}
// 危险：在原型中定义引用类型
BadExample.prototype.items = []; // 所有实例共享同一个数组

const obj1 = new BadExample();
const obj2 = new BadExample();

obj1.items.push('item1');
console.log(obj2.items); // ['item1'] - 意外共享！

// 正确做法：在构造函数中定义引用类型属性
function GoodExample() {
    this.items = []; // 每个实例有自己的数组
}

const obj3 = new GoodExample();
const obj4 = new GoodExample();

obj3.items.push('item1');
console.log(obj4.items); // [] - 各自独立
```

#### 7.2 原型污染

要小心不要意外修改内置对象的原型。

```javascript
// 危险操作 - 修改内置对象原型
// Array.prototype.customMethod = function() { /* ... */ };

// 更安全的做法 - 创建工具函数
function customArrayMethod(arr) {
    // 处理数组
}
```

### 8. 实际应用示例

```javascript
// 创建一个可扩展的事件系统
function EventEmitter() {
    this.events = {};
}

EventEmitter.prototype.on = function(event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
};

EventEmitter.prototype.emit = function(event, ...args) {
    if (this.events[event]) {
        this.events[event].forEach(callback => callback(...args));
    }
};

EventEmitter.prototype.off = function(event, callback) {
    if (this.events[event]) {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
};

// 使用示例
class MyComponent extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
    }
    
    doSomething() {
        // 执行某些操作
        this.emit('done', this.name);
    }
}

const component = new MyComponent('test');
component.on('done', (name) => console.log(`${name} is done`));
component.doSomething(); // "test is done"
```

原型是JavaScript中实现继承和代码复用的重要机制，理解原型的概念和工作原理对于掌握JavaScript至关重要。它不仅影响代码的组织方式，还影响性能和内存使用。
