# 手写实现一个 call 函数？实现原理？原型链知道多少？（高薪常问）

**题目**: 手写实现一个 call 函数？实现原理？原型链知道多少？（高薪常问）

## 标准答案

### 1. call函数的基本概念
call() 是 JavaScript 中 Function 对象的一个方法，用于调用一个函数，并显式地设置函数内部的 this 值。call() 方法接受一个对象作为 this 的值和一系列参数，参数是以逗号分隔的形式传递给函数。

### 2. call函数的实现原理
- 将函数作为指定对象的临时方法
- 执行函数并传入参数
- 删除临时方法
- 返回函数执行结果

### 3. 原型链的基本概念
JavaScript 中的原型链是一种实现继承的方式，每个对象都有一个内部属性 [[Prototype]]（可通过 __proto__ 访问），指向其构造函数的原型对象。当访问对象的属性时，如果对象本身没有该属性，JavaScript 会沿着原型链向上查找。

## 深入分析

### 1. call函数的实现原理详解

call() 方法的核心思想是改变函数执行时的上下文环境（this 指向）。当我们调用 obj.func.call(context, arg1, arg2, ...) 时，实际上是将 func 临时附加到 context 对象上，然后调用它，最后再删除。

call() 方法的执行步骤：
1. 检查调用 call 的对象是否为函数
2. 获取 this 值和参数
3. 将函数作为 this 值对象的临时属性
4. 使用提供的参数调用函数
5. 删除临时属性
6. 返回函数执行结果

### 2. 原型链详解

在 JavaScript 中，每个函数都有一个 prototype 属性，指向一个对象，这个对象就是原型对象。原型对象默认会有一个 constructor 属性，指向函数本身。每个对象都有一个内部属性 [[Prototype]]，可通过 __proto__ 访问，指向其构造函数的原型对象。

原型链的形成：
- 当访问一个对象的属性时，JavaScript 会首先在该对象自身上查找
- 如果找不到，会沿着 [[Prototype]] 指向的原型对象继续查找
- 直到查找到 Object.prototype 为止
- 如果整个原型链上都没有找到，则返回 undefined

### 3. call函数与原型链的关系

call 函数本身也体现了原型链的概念，因为它存在于 Function.prototype 上，所有函数都继承了 call 方法。这展示了 JavaScript 中方法通过原型链共享的机制。

## 代码实现

### 1. 手写实现 call 函数

```javascript
Function.prototype.myCall = function(context) {
  // 检查调用者是否为函数
  if (typeof this !== 'function') {
    throw new TypeError('Call apply on a non-function');
  }

  // 如果 context 为 null 或 undefined，则设置为全局对象(window 或 global)
  context = context || globalThis;

  // 创建一个唯一的属性名，避免覆盖已有属性
  const fnSymbol = Symbol('fn');
  
  // 将当前函数作为 context 的一个临时方法
  context[fnSymbol] = this;

  // 获取除了第一个参数外的其余参数
  const args = [];
  for (let i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }

  // 调用函数并获取返回值
  const result = context[fnSymbol](...args);

  // 删除临时方法
  delete context[fnSymbol];

  // 返回函数执行结果
  return result;
};

// 使用示例
function greet(greeting, punctuation) {
  return greeting + ' ' + this.name + punctuation;
}

const person = { name: 'Alice' };
const result = greet.myCall(person, 'Hello', '!');
console.log(result); // 输出: "Hello Alice!"
```

### 2. 更完善的 call 实现（兼容性增强）

```javascript
Function.prototype.myCallAdvanced = function(context) {
  // 检查调用者是否为函数
  if (typeof this !== 'function') {
    throw new TypeError('Call apply on a non-function');
  }

  // 处理 null 和 undefined
  if (context === null || context === undefined) {
    context = typeof window !== 'undefined' ? window : global;
  }

  // 将函数作为 context 的方法
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;

  // 获取参数
  const args = Array.prototype.slice.call(arguments, 1);

  // 执行函数
  let result;
  try {
    result = context[fnSymbol](...args);
  } finally {
    // 确保无论如何都会删除临时属性
    delete context[fnSymbol];
  }

  return result;
};

// 测试用例
function testFunction(age, city) {
  console.log(`Name: ${this.name}, Age: ${age}, City: ${city}`);
  return this.name + ' is ' + age + ' years old';
}

const person2 = { name: 'Bob' };
const result2 = testFunction.myCallAdvanced(person2, 25, 'New York');
console.log(result2); // 输出: "Bob is 25 years old"
```

### 3. 原型链相关代码示例

```javascript
// 构造函数
function Animal(name) {
  this.name = name;
}

// 在原型上添加方法
Animal.prototype.speak = function() {
  console.log(this.name + ' makes a noise.');
};

// 创建另一个构造函数继承自Animal
function Dog(name, breed) {
  Animal.call(this, name); // 调用父构造函数
  this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 在子类原型上添加方法
Dog.prototype.speak = function() {
  console.log(this.name + ' barks.');
};

// 测试原型链
const dog = new Dog('Rex', 'Golden Retriever');
dog.speak(); // 输出: "Rex barks."

// 检查原型链
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
console.log(Dog.prototype.__proto__ === Animal.prototype); // true

// 使用call改变this指向
function introduce() {
  console.log('I am ' + this.name + ' and I am a ' + this.breed);
}

introduce.call(dog); // 输出: "I am Rex and I am a Golden Retriever"
```

### 4. 原型链深度探索

```javascript
// 深入理解原型链
function getPrototypeChain(obj) {
  const chain = [];
  let current = obj;
  
  while (current) {
    chain.push(current);
    current = Object.getPrototypeOf(current);
    
    // 避免无限循环（到达Object.prototype时停止）
    if (current === Object.prototype) {
      chain.push(current);
      break;
    }
  }
  
  return chain;
}

// 示例
function Person(name) {
  this.name = name;
}

Person.prototype.getName = function() {
  return this.name;
};

const person3 = new Person('Charlie');

// 获取原型链
const prototypeChain = getPrototypeChain(person3);
console.log('原型链:');
prototypeChain.forEach((obj, index) => {
  console.log(`${index}:`, obj);
});

// 检查属性是否在原型链上存在
console.log('Has getName in prototype chain:', Person.prototype.isPrototypeOf(person3));
console.log('Has name property:', person3.hasOwnProperty('name'));
console.log('Has getName method:', 'getName' in person3);
```

## 实际应用场景

### 1. 借用其他对象的方法
```javascript
// 数组方法借用
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr); // ['a', 'b', 'c']

// 或使用call实现数组的其他方法
Array.prototype.forEach.call(arrayLike, function(item) {
  console.log(item);
});
```

### 2. 继承和构造函数调用
```javascript
// 在子类构造函数中调用父类构造函数
function Parent(name) {
  this.name = name;
}

Parent.prototype.sayHello = function() {
  console.log('Hello, I am ' + this.name);
};

function Child(name, age) {
  Parent.call(this, name); // 使用call调用父类构造函数
  this.age = age;
}

// 继承原型
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

const child = new Child('Tom', 10);
child.sayHello(); // "Hello, I am Tom"
```

### 3. 函数上下文切换
```javascript
// 在不同对象间复用函数
const obj1 = { value: 10 };
const obj2 = { value: 20 };

function multiply(factor) {
  return this.value * factor;
}

console.log(multiply.call(obj1, 5)); // 50
console.log(multiply.call(obj2, 5)); // 100
```

## 注意事项和最佳实践

1. call() 方法会立即执行函数
2. 传递给 call() 的参数必须逐个列出
3. 如果不传入对象或传入 null/undefined，this 将指向全局对象
4. 使用 Symbol 作为临时属性名可以避免属性冲突
5. 在严格模式下，this 不会指向全局对象，而是 undefined
6. 原型链过长可能影响性能，应合理设计继承结构
