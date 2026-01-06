# ES6 怎么写 class ，为何会出现 class（必会）

**题目**: ES6 怎么写 class ，为何会出现 class（必会）

## 标准答案

ES6 中的 class 是语法糖，提供了更简洁的面向对象编程方式：

1. **基本语法**：使用 class 关键字定义类
2. **构造函数**：使用 constructor 方法定义构造函数
3. **方法定义**：直接定义方法，无需 function 关键字
4. **继承**：使用 extends 关键字实现继承，super 关键字调用父类

class 的出现是为了：
1. 提供更清晰的面向对象语法
2. 让类的概念更明确
3. 更好地支持继承和多态
4. 与传统面向对象语言保持一致

## 深入理解

### ES6 Class 基本语法

```javascript
// 基本类定义
class Person {
    // 构造函数
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    // 实例方法
    greet() {
        return `Hello, I'm ${this.name}, ${this.age} years old.`;
    }

    // getter 方法
    get info() {
        return `${this.name} is ${this.age} years old`;
    }

    // setter 方法
    set setName(name) {
        this.name = name;
    }

    // 静态方法
    static species() {
        return 'Homo sapiens';
    }
}

// 使用类
const person = new Person('Alice', 25);
console.log(person.greet()); // Hello, I'm Alice, 25 years old.
console.log(person.info); // Alice is 25 years old
person.setName = 'Bob';
console.log(Person.species()); // Homo sapiens
```

### Class 的各种特性

```javascript
class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
        this._age = 0; // 私有属性约定（ES2022 才有真正的私有属性）
    }

    // 实例方法
    speak() {
        console.log(`${this.name} makes a sound`);
    }

    // getter/setter
    get age() {
        return this._age;
    }

    set age(value) {
        if (value >= 0) {
            this._age = value;
        }
    }

    // 静态方法
    static isAnimal(obj) {
        return obj instanceof Animal;
    }

    // 静态属性（ES2022 支持）
    static category = 'Living beings';
}

// 类表达式
const Dog = class extends Animal {
    constructor(name, breed) {
        super(name, 'Canine'); // 调用父类构造函数
        this.breed = breed;
    }

    // 重写父类方法
    speak() {
        console.log(`${this.name} barks`);
    }

    // 新增方法
    fetch() {
        console.log(`${this.name} fetches the ball`);
    }
};

const dog = new Dog('Buddy', 'Golden Retriever');
dog.speak(); // Buddy barks
dog.fetch(); // Buddy fetches the ball
console.log(Animal.isAnimal(dog)); // true
console.log(Dog.category); // Living beings
```

### ES6 Class 与 ES5 构造函数的对比

```javascript
// ES5 构造函数写法
function PersonES5(name, age) {
    this.name = name;
    this.age = age;
}

PersonES5.prototype.greet = function() {
    return `Hello, I'm ${this.name}, ${this.age} years old.`;
};

PersonES5.species = function() {
    return 'Homo sapiens';
};

// ES6 Class 写法
class PersonES6 {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    greet() {
        return `Hello, I'm ${this.name}, ${this.age} years old.`;
    }

    static species() {
        return 'Homo sapiens';
    }
}

// 两种方式创建实例
const person1 = new PersonES5('Alice', 25);
const person2 = new PersonES6('Bob', 30);

console.log(person1.greet()); // Hello, I'm Alice, 25 years old.
console.log(person2.greet()); // Hello, I'm Bob, 30 years old.
console.log(PersonES5.species()); // Homo sapiens
console.log(PersonES6.species()); // Homo sapiens
```

### Class 继承详解

```javascript
// 父类
class Vehicle {
    constructor(brand, model) {
        this.brand = brand;
        this.model = model;
    }

    start() {
        return `${this.brand} ${this.model} is starting`;
    }

    static type() {
        return 'Vehicle';
    }
}

// 子类
class Car extends Vehicle {
    constructor(brand, model, doors) {
        super(brand, model); // 调用父类构造函数
        this.doors = doors;
    }

    // 重写父类方法
    start() {
        return `${super.start()} with ${this.doors} doors`;
    }

    // 新增方法
    honk() {
        return `${this.brand} ${this.model} is honking`;
    }

    // 静态方法也可以继承
    static type() {
        return 'Car';
    }
}

// 多层继承
class ElectricCar extends Car {
    constructor(brand, model, doors, batteryCapacity) {
        super(brand, model, doors);
        this.batteryCapacity = batteryCapacity;
    }

    charge() {
        return `${this.brand} ${this.model} is charging with ${this.batteryCapacity}kWh battery`;
    }
}

const tesla = new ElectricCar('Tesla', 'Model 3', 4, 75);
console.log(tesla.start()); // Tesla Model 3 is starting with 4 doors
console.log(tesla.honk()); // Tesla Model 3 is honking
console.log(tesla.charge()); // Tesla Model 3 is charging with 75kWh battery
```

### 为什么会出现 class

1. **更清晰的语法**：
```javascript
// 之前需要复杂的原型操作
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
}

Rectangle.prototype.getArea = function() {
    return this.width * this.height;
};

Rectangle.prototype.toString = function() {
    return `Rectangle: ${this.width}x${this.height}`;
};

// 现在可以使用更清晰的语法
class RectangleClass {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    getArea() {
        return this.width * this.height;
    }

    toString() {
        return `Rectangle: ${this.width}x${this.height}`;
    }
}
```

2. **更好的继承机制**：
```javascript
// ES5 继承需要手动处理原型链
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

function Dog(name, breed) {
    Animal.call(this, name); // 调用父类构造函数
    this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.speak = function() {
    return `${this.name} barks`;
};

// ES6 继承更简洁
class AnimalClass {
    constructor(name) {
        this.name = name;
    }

    speak() {
        return `${this.name} makes a sound`;
    }
}

class DogClass extends AnimalClass {
    constructor(name, breed) {
        super(name); // 调用父类构造函数
        this.breed = breed;
    }

    speak() {
        return `${this.name} barks`;
    }
}
```

3. **静态方法和属性**：
```javascript
class MathUtils {
    static add(a, b) {
        return a + b;
    }

    static multiply(a, b) {
        return a * b;
    }

    static PI = 3.14159; // ES2022+
}

console.log(MathUtils.add(2, 3)); // 5
console.log(MathUtils.PI); // 3.14159
```

### Class 注意事项

```javascript
// 1. Class 必须使用 new 调用
class MyClass {
    constructor() {
        this.name = 'MyClass';
    }
}

// 以下会报错：Class constructor MyClass cannot be invoked without 'new'
// MyClass();

// 2. Class 声明不会被提升（与函数声明不同）
// console.log(MyClass2); // ReferenceError: Cannot access MyClass2 before initialization

class MyClass2 {
    constructor() {}
}

// 3. Class 内部默认是严格模式
class StrictClass {
    constructor() {
        // 这里是严格模式
        // 一些在严格模式下会报错的操作
    }
}

// 4. 方法不能被枚举
class MethodEnum {
    method1() {}
    method2() {}
}

const obj = new MethodEnum();
console.log(Object.keys(obj)); // [] - 实例方法不会被枚举
console.log(Object.getOwnPropertyNames(MethodEnum.prototype)); // ['constructor', 'method1', 'method2']
```

### 私有属性和方法（ES2022）

```javascript
class BankAccount {
    #balance = 0; // 私有属性
    #pin;

    constructor(initialBalance, pin) {
        this.#balance = initialBalance;
        this.#pin = pin;
    }

    deposit(amount) {
        if (amount > 0) {
            this.#balance += amount;
            return `Deposited ${amount}. New balance: ${this.#balance}`;
        }
        return 'Invalid amount';
    }

    #validatePin(pin) { // 私有方法
        return pin === this.#pin;
    }

    withdraw(amount, pin) {
        if (this.#validatePin(pin) && amount <= this.#balance) {
            this.#balance -= amount;
            return `Withdrew ${amount}. New balance: ${this.#balance}`;
        }
        return 'Invalid operation';
    }

    getBalance(pin) {
        if (this.#validatePin(pin)) {
            return this.#balance;
        }
        return 'Invalid PIN';
    }
}

const account = new BankAccount(1000, '1234');
console.log(account.deposit(500)); // Deposited 500. New balance: 1500
console.log(account.withdraw(200, '1234')); // Withdrew 200. New balance: 1300
// console.log(account.#balance); // SyntaxError: Private field '#balance' must be declared in an enclosing class
```

ES6 的 class 语法为 JavaScript 提供了更清晰、更易于理解的面向对象编程方式，虽然本质上仍是基于原型的实现，但提供了更现代化的语法糖，使代码更易读和维护。
