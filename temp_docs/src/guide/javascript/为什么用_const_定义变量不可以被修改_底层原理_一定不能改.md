# 为什么用 const 定义变量不可以被修改？底层原理？一定不能改？（了解）

**题目**: 为什么用 const 定义变量不可以被修改？底层原理？一定不能改？（了解）

## 标准答案

const声明的变量不能被重新赋值，这是因为它创建了一个不可重新赋值的绑定。底层原理是JavaScript引擎将const变量标记为不可变绑定，当尝试重新赋值时会抛出TypeError。但需要注意的是，对于对象和数组等引用类型，虽然引用本身不能改变，但对象内部的属性或数组元素是可以修改的。

## 详细解释

const声明具有以下特点：

1. **不可重新赋值**：一旦声明并初始化，就不能再赋新值
2. **块级作用域**：与let一样，const声明的变量具有块级作用域
3. **暂时性死区**：不能在声明之前访问变量
4. **必须初始化**：声明时必须同时进行初始化

底层实现上，JavaScript引擎为const变量创建了一个不可变的绑定，这个绑定在创建后就不能被修改。引擎会跟踪每个绑定的可变性状态，并在尝试修改不可变绑定时抛出错误。

但需要注意，const只是保证变量的绑定不被改变，对于引用类型（对象、数组等），变量存储的是引用地址，const保证的是这个地址不被改变，但地址指向的对象内容是可以修改的。

## 代码示例

```javascript
// 基本类型 - 不可修改
const a = 1;
a = 2; // TypeError: Assignment to constant variable.

// 对象类型 - 引用不可变，但内容可变
const obj = { name: 'John', age: 25 };
obj.name = 'Jane'; // 这是允许的
obj.age = 30;      // 这也是允许的
console.log(obj);  // 输出: { name: 'Jane', age: 30 }

// 但不能重新赋值整个对象
obj = { name: 'Bob' }; // TypeError: Assignment to constant variable.

// 数组类型 - 同样引用不可变，但内容可变
const arr = [1, 2, 3];
arr.push(4);     // 这是允许的
arr[0] = 10;     // 这也是允许的
console.log(arr); // 输出: [10, 2, 3, 4]

// 但不能重新赋值整个数组
arr = [5, 6, 7]; // TypeError: Assignment to constant variable.

// 函数和类声明
const myFunc = function() {
    return 'Hello';
};

myFunc = function() { // TypeError: Assignment to constant variable.
    return 'World';
};

// 如果想让对象完全不可变，可以使用Object.freeze()
const frozenObj = Object.freeze({ name: 'John', details: { age: 25 } });
frozenObj.name = 'Jane'; // 在严格模式下会报错，非严格模式下静默失败
console.log(frozenObj.name); // 非严格模式下仍为 'John'

// 深度冻结对象
function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== null && typeof obj[prop] === 'object') {
            deepFreeze(obj[prop]);
        }
    });
    return Object.freeze(obj);
}

const deepFrozenObj = deepFreeze({ name: 'John', details: { age: 25 } });
deepFrozenObj.details.age = 30; // 深度冻结后，内部属性也不可修改
console.log(deepFrozenObj.details.age); // 仍为25
