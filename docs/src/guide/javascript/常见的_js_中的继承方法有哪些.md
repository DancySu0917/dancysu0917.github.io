# 常见的 js 中的继承方法有哪些？（必会）

**题目**: 常见的 js 中的继承方法有哪些？（必会）

## 标准答案

JavaScript 中常见的继承方法有以下几种：

### 1. 原型链继承（Prototype Chain Inheritance）

通过将子类的原型设置为父类的实例来实现继承。

```javascript
function Parent() {
    this.name = 'parent';
    this.colors = ['red', 'blue'];
}

Parent.prototype.getName = function() {
    return this.name;
};

function Child() {
    this.type = 'child';
}

// 核心：将父类实例作为子类原型
Child.prototype = new Parent();
Child.prototype.constructor = Child;

const child1 = new Child();
console.log(child1.getName()); // 'parent'
```

**优点**：父类的实例方法和属性可以被子类实例访问。
**缺点**：
- 引用类型的属性会被所有实例共享
- 创建子类实例时，无法向父类构造函数传参

### 2. 构造函数继承（Constructor Stealing）

在子类构造函数中调用父类构造函数，使用 call 或 apply 方法。

```javascript
function Parent(name) {
    this.name = name;
    this.colors = ['red', 'blue'];
}

Parent.prototype.getName = function() {
    return this.name;
};

function Child(name, age) {
    // 核心：在子类中调用父类构造函数
    Parent.call(this, name);
    this.age = age;
}

const child1 = new Child('kevin', 18);
const child2 = new Child('daisy', 19);

child1.colors.push('black');
console.log(child1.colors); // ['red', 'blue', 'black']
console.log(child2.colors); // ['red', 'blue']
```

**优点**：
- 避免了引用类型属性被共享的问题
- 可以在子类中向父类传参
**缺点**：
- 无法继承父类原型上的方法
- 每次创建实例都要执行父类构造函数

### 3. 组合继承（Combination Inheritance）

结合原型链继承和构造函数继承，是 JavaScript 中最常用的继承模式。

```javascript
function Parent(name) {
    this.name = name;
    this.colors = ['red', 'blue'];
}

Parent.prototype.getName = function() {
    return this.name;
};

function Child(name, age) {
    // 核心：构造函数继承，继承实例属性
    Parent.call(this, name);
    this.age = age;
}

// 核心：原型链继承，继承原型方法
Child.prototype = new Parent();
Child.prototype.constructor = Child;

const child1 = new Child('kevin', 18);
child1.colors.push('black');
console.log(child1.colors); // ['red', 'blue', 'black']

const child2 = new Child('daisy', 20);
console.log(child2.colors); // ['red', 'blue']
```

**优点**：融合了两种继承的优点，可以继承实例属性和方法，也可以继承原型属性和方法。
**缺点**：调用了两次父类构造函数，生成了两组实例属性（子类实例和子类原型上各一组）。

### 4. 原型式继承（Prototypal Inheritance）

基于已有对象创建新对象，同时还不必创建自定义类型。

```javascript
function createObj(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

const person = {
    name: 'kevin',
    friends: ['daisy', 'kelly']
};

const person1 = createObj(person);
const person2 = createObj(person);

person1.name = 'person1';
console.log(person2.name); // 'kevin'

person1.friends.push('taylor');
console.log(person2.friends); // ['daisy', 'kelly', 'taylor']
```

**注意**：ES5 中的 Object.create() 方法就是原型式继承的实现。

### 5. 寄生式继承（Parasitic Inheritance）

创建一个仅用于封装继承过程的函数，该函数在内部以某种方式来增强对象，最后返回这个对象。

```javascript
function createObj(o) {
    const clone = Object.create(o); // 创建一个新对象
    clone.sayName = function() { // 增强对象
        console.log('hi');
    };
    return clone;
}
```

**优点**：可以在新对象上添加新的方法。
**缺点**：做不到函数复用，每个实例都有自己的方法副本。

### 6. 寄生组合式继承（Parasitic Combination Inheritance）

通过借用构造函数来继承属性，通过原型链的混成形式来继承方法。

```javascript
function Parent(name) {
    this.name = name;
    this.colors = ['red', 'blue'];
}

Parent.prototype.getName = function() {
    return this.name;
};

function Child(name, age) {
    Parent.call(this, name);
    this.age = age;
}

// 核心：寄生组合式继承的关键
function F() {}
F.prototype = Parent.prototype;
Child.prototype = new F();
Child.prototype.constructor = Child;

// 或者使用 ES6 的 Object.setPrototypeOf
// Object.setPrototypeOf(Child.prototype, Parent.prototype);

const child1 = new Child('kevin', 18);
console.log(child1);
```

**优点**：只调用一次父类构造函数，避免了在子类原型上创建不必要的、多余的属性。

### 7. ES6 Class 继承

ES6 引入了 class 语法，通过 extends 关键字实现继承。

```javascript
class Parent {
    constructor(name) {
        this.name = name;
    }
    
    getName() {
        return this.name;
    }
}

class Child extends Parent {
    constructor(name, age) {
        super(name); // 调用父类的 constructor
        this.age = age;
    }
    
    getAge() {
        return this.age;
    }
}

const child = new Child('kevin', 18);
console.log(child.getName()); // 'kevin'
console.log(child.getAge()); // 18
```

**说明**：
- extends 关键字主要用于类声明，表示子类继承父类
- super 关键字用于访问和调用父类的属性和方法
- 子类必须在 constructor 中调用 super()，否则新建实例时会报错

## 深入理解

1. **继承的本质**：JavaScript 中的继承本质上是通过原型链实现的属性和方法查找机制。
2. **性能考虑**：寄生组合式继承是性能最好的方式，因为它只调用一次父类构造函数。
3. **实际应用**：现代开发中通常使用 ES6 的 class 语法，但在理解底层原理时，掌握各种继承方式的实现原理非常重要。

## 总结

JavaScript 的继承机制有多种实现方式，每种方式都有其优缺点。在实际开发中，推荐使用 ES6 的 class 语法，它提供了更清晰、更易理解的继承写法，但在面试或需要深入理解 JavaScript 原理时，掌握各种继承方式的实现细节是必要的。
