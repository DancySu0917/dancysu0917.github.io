# class、extends 是什么，有什么作用（必会）

**题目**: class、extends 是什么，有什么作用（必会）

## 标准答案

`class` 和 `extends` 是 ES6 引入的语法特性，用于实现面向对象编程：

1. **class**：定义类的语法糖，提供更清晰、更简洁的面向对象语法
2. **extends**：用于创建一个类继承另一个类，实现继承机制
3. **作用**：简化原型继承的写法，提供更直观的面向对象编程方式

## 深入理解

### class 基本语法

`class` 是 ES6 引入的语法糖，本质上仍然是基于原型的继承机制，但它提供了更清晰的语法来定义类：

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
        return `Hello, my name is ${this.name} and I'm ${this.age} years old.`;
    }

    // getter 方法
    get description() {
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

    // 静态属性（ES2022+）
    static planet = 'Earth';
}

// 使用类
const person1 = new Person('Alice', 25);
console.log(person1.greet()); // Hello, my name is Alice and I'm 25 years old.
console.log(person1.description); // Alice is 25 years old
console.log(Person.species()); // Homo sapiens
```

### extends 继承语法

`extends` 关键字用于创建一个类继承另一个类：

```javascript
// 父类
class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
    }

    makeSound() {
        return `${this.name} makes a sound`;
    }

    static info() {
        return 'This is an animal class';
    }
}

// 子类继承父类
class Dog extends Animal {
    constructor(name, breed) {
        // 调用父类构造函数
        super(name, 'Canine'); // super 必须在使用 this 之前调用
        this.breed = breed;
    }

    // 重写父类方法
    makeSound() {
        return `${this.name} barks`;
    }

    // 添加新方法
    fetch() {
        return `${this.name} fetches the ball`;
    }

    // 调用父类方法
    parentMakeSound() {
        return super.makeSound();
    }
}

const dog = new Dog('Buddy', 'Golden Retriever');
console.log(dog.makeSound()); // Buddy barks
console.log(dog.parentMakeSound()); // Buddy makes a sound
console.log(dog.fetch()); // Buddy fetches the ball
console.log(Dog.info()); // This is an animal class (继承静态方法)
```

### super 关键字详解

`super` 关键字在继承中有重要作用：

```javascript
class Parent {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    greet() {
        return `Hello from ${this.name}`;
    }

    static parentStatic() {
        return 'Parent static method';
    }
}

class Child extends Parent {
    constructor(name, age, grade) {
        // 1. 在构造函数中调用父类构造函数
        super(name, age);
        this.grade = grade;
    }

    greet() {
        // 2. 在方法中调用父类方法
        const parentGreet = super.greet();
        return `${parentGreet}, I'm in grade ${this.grade}`;
    }

    static childStatic() {
        // 3. 在静态方法中调用父类静态方法
        const parentStatic = super.parentStatic();
        return `${parentStatic} - Child addition`;
    }
}

const child = new Child('Tom', 10, 5);
console.log(child.greet()); // Hello from Tom, I'm in grade 5
console.log(Child.childStatic()); // Parent static method - Child addition
```

### class 与传统构造函数对比

```javascript
// 传统构造函数方式
function PersonES5(name, age) {
    this.name = name;
    this.age = age;
}

PersonES5.prototype.greet = function() {
    return `Hello, my name is ${this.name} and I'm ${this.age} years old.`;
};

function StudentES5(name, age, grade) {
    PersonES5.call(this, name, age); // 调用父类构造函数
    this.grade = grade;
}

// 设置原型链
StudentES5.prototype = Object.create(PersonES5.prototype);
StudentES5.prototype.constructor = StudentES5;

StudentES5.prototype.study = function() {
    return `${this.name} is studying in grade ${this.grade}`;
};

// ES6 class 方式
class PersonES6 {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    greet() {
        return `Hello, my name is ${this.name} and I'm ${this.age} years old.`;
    }
}

class StudentES6 extends PersonES6 {
    constructor(name, age, grade) {
        super(name, age); // 调用父类构造函数
        this.grade = grade;
    }

    study() {
        return `${this.name} is studying in grade ${this.grade}`;
    }
}

// 使用对比
const student1 = new StudentES5('Alice', 15, 10);
const student2 = new StudentES6('Bob', 16, 11);

console.log(student1.greet()); // Hello, my name is Alice and I'm 15 years old.
console.log(student2.greet()); // Hello, my name is Bob and I'm 16 years old.
```

### class 的特殊性质

```javascript
// 1. 类声明不会被提升
// console.log(MyClass); // ReferenceError: Cannot access 'MyClass' before initialization
class MyClass {}

// 2. 类内部默认使用严格模式
class StrictClass {
    // 类内部自动使用严格模式
    constructor() {
        // this 的行为会有所不同
    }
}

// 3. 类方法不可枚举
class Example {
    method() {}
    static staticMethod() {}
}

console.log(Object.keys(Example.prototype)); // [] - 实例方法不可枚举
console.log(Example.prototype.propertyIsEnumerable('method')); // false
```

### 实际应用场景

```javascript
// 1. UI 组件继承
class Component {
    constructor(props) {
        this.props = props;
        this.state = {};
    }

    render() {
        return '<div>Base Component</div>';
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }
}

class Button extends Component {
    constructor(props) {
        super(props);
        this.state = { clicked: false };
    }

    render() {
        return `<button>${this.props.text || 'Button'}</button>`;
    }

    click() {
        this.setState({ clicked: true });
        console.log('Button clicked');
    }
}

// 2. 数据模型继承
class Model {
    constructor(data = {}) {
        this.data = data;
    }

    toJSON() {
        return this.data;
    }

    validate() {
        return true;
    }
}

class User extends Model {
    constructor(data) {
        super(data);
    }

    validate() {
        return this.data.name && this.data.email;
    }

    get fullName() {
        return `${this.data.firstName} ${this.data.lastName}`;
    }
}
```

## 总结

- `class` 是 ES6 引入的语法糖，提供更清晰的面向对象编程语法
- `extends` 用于实现类之间的继承关系
- `super` 关键字用于调用父类的构造函数和方法
- class 语法比传统构造函数更简洁、更易读
- class 声明不会被提升，内部默认使用严格模式
- 现代 JavaScript 开发中，推荐使用 class 语法进行面向对象编程
- 虽然 class 看起来像传统面向对象语言，但底层仍然是基于原型的继承机制
