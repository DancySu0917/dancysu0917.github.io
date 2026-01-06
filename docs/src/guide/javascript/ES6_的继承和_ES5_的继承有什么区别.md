# ES6 的继承和 ES5 的继承有什么区别（必会）

**题目**: ES6 的继承和 ES5 的继承有什么区别（必会）

## 标准答案

ES6 的继承和 ES5 的继承主要有以下几个区别：

1. **语法差异**：
   - ES5：使用构造函数和原型链实现继承，语法较为复杂
   - ES6：使用 `class` 和 `extends` 关键字，语法更简洁直观

2. **实现机制**：
   - ES5：通过修改原型链（prototype）实现继承
   - ES6：使用 `super` 关键字调用父类构造函数和方法

3. **调用父类构造函数**：
   - ES5：使用 `Parent.call(this, args...)` 的方式
   - ES6：使用 `super(args...)` 的方式

4. **静态方法继承**：
   - ES5：静态方法不会自动继承，需要手动实现
   - ES6：静态方法会自动继承

## 深入理解

### ES5 继承实现

ES5 中的继承主要通过构造函数和原型链实现：

```javascript
// ES5 继承示例
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    console.log(this.name + ' makes a sound.');
};

function Dog(name, breed) {
    // 调用父类构造函数
    Animal.call(this, name);
    this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 添加子类方法
Dog.prototype.bark = function() {
    console.log('Woof!');
};

var dog = new Dog('Rex', 'Golden Retriever');
dog.speak(); // Rex makes a sound.
dog.bark(); // Woof!
```

### ES6 继承实现

ES6 中使用 `class` 语法实现继承，更加简洁：

```javascript
// ES6 继承示例
class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        console.log(this.name + ' makes a sound.');
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        // 调用父类构造函数
        super(name);
        this.breed = breed;
    }

    bark() {
        console.log('Woof!');
    }

    // 重写父类方法
    speak() {
        super.speak(); // 调用父类方法
        console.log(this.name + ' barks loudly.');
    }
}

const dog = new Dog('Rex', 'Golden Retriever');
dog.speak(); // Rex makes a sound. Rex barks loudly.
dog.bark(); // Woof!
```

### 主要区别对比

| 特性 | ES5 | ES6 |
|------|-----|-----|
| 语法 | 构造函数 + 原型链 | class + extends |
| 继承调用 | Parent.call(this, args) | super(args) |
| 原型设置 | Object.create(Parent.prototype) | 自动处理 |
| 代码可读性 | 较复杂 | 更清晰 |
| 静态方法继承 | 需手动实现 | 自动继承 |

### 静态方法继承差异

```javascript
// ES5 静态方法继承
function Parent() {}
Parent.staticMethod = function() {
    console.log('Parent static method');
};

function Child() {}
// 需要手动继承静态方法
Child.staticMethod = Parent.staticMethod;

// ES6 静态方法继承
class Parent {
    static staticMethod() {
        console.log('Parent static method');
    }
}

class Child extends Parent {}

Child.staticMethod(); // "Parent static method" - 自动继承
```

### super 关键字详解

在 ES6 中，`super` 关键字有以下用途：

1. 在构造函数中调用父类构造函数
2. 在方法中调用父类的同名方法
3. 访问父类的属性

```javascript
class Parent {
    constructor(name) {
        this.name = name;
        this.type = 'parent';
    }

    greet() {
        return `Hello from ${this.name}`;
    }
}

class Child extends Parent {
    constructor(name, age) {
        super(name); // 调用父类构造函数
        this.age = age;
    }

    greet() {
        const parentGreeting = super.greet(); // 调用父类方法
        return `${parentGreeting}, I'm ${this.age} years old`;
    }

    getParentType() {
        return super.type; // 访问父类属性（注意：这在运行时会是 undefined，因为 super 不用于属性访问）
    }
}
```

## 总结

ES6 的 `class` 和 `extends` 提供了更清晰、更简洁的继承语法，使得面向对象编程在 JavaScript 中更加直观。主要优势包括：

1. 语法更简洁，易于理解和维护
2. 自动处理原型链设置
3. 使用 `super` 关键字简化父类方法调用
4. 静态方法自动继承
5. 更好的错误提示和调试支持

虽然 ES6 的 `class` 语法看起来像传统面向对象语言，但底层仍然是基于原型的继承机制。理解这种差异有助于更好地掌握 JavaScript 的继承机制。
