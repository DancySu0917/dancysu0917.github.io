# typeof 和 instanceof 区别？（必会）

**题目**: typeof 和 instanceof 区别？（必会）

**答案**:

`typeof` 和 `instanceof` 是 JavaScript 中两种不同的类型检测操作符，它们有着本质的区别和不同的使用场景。

### 1. 基本概念

**typeof**：
- 一元操作符，用于检测变量的基本数据类型
- 返回表示数据类型的字符串

**instanceof**：
- 二元操作符，用于检测对象是否是某个构造函数的实例
- 返回布尔值

### 2. 检测范围对比

**typeof 可以检测的类型**：
```javascript
console.log(typeof undefined);    // "undefined"
console.log(typeof null);         // "object" (历史遗留 bug)
console.log(typeof true);         // "boolean"
console.log(typeof 123);          // "number"
console.log(typeof "hello");      // "string"
console.log(typeof Symbol());     // "symbol"
console.log(typeof BigInt(1));    // "bigint"
console.log(typeof function(){}); // "function"
console.log(typeof {});           // "object"
console.log(typeof []);           // "object"
```

**instanceof 可以检测的类型**：
```javascript
// 基本类型无法检测（基本类型不是对象）
// console.log(123 instanceof Number); // false

// 只能检测对象类型
console.log(new String("hello") instanceof String);  // true
console.log(new Number(123) instanceof Number);      // true
console.log(new Boolean(true) instanceof Boolean);   // true
console.log([] instanceof Array);                    // true
console.log(new Date() instanceof Date);             // true
console.log(/regex/ instanceof RegExp);              // true
console.log(function(){} instanceof Function);       // true
console.log({} instanceof Object);                   // true
```

### 3. 返回值类型

```javascript
// typeof 返回字符串
let type = typeof "hello";
console.log(type);           // "string"
console.log(typeof type);    // "string"

// instanceof 返回布尔值
let result = "hello" instanceof String;
console.log(result);         // false (因为 "hello" 是基本类型)
console.log(typeof result);  // "boolean"

let result2 = new String("hello") instanceof String;
console.log(result2);        // true
```

### 4. 检测原理

**typeof 检测原理**：
- 在 JavaScript 引擎底层，每个值都有一个内部属性 `[[Class]]`，typeof 根据这个属性来判断类型
- 对于基本类型直接返回对应的类型字符串
- 对于对象统一返回 "object"（除了 function 返回 "function"）

**instanceof 检测原理**：
- 检查右侧构造函数的 `prototype` 属性是否存在于左侧对象的原型链上
- 通过原型链查找来确定对象的类型

```javascript
// instanceof 的内部实现原理（简化版）
function myInstanceof(left, right) {
    // 获取对象的原型
    let leftProto = Object.getPrototypeOf(left);
    // 获取构造函数的 prototype 对象
    let rightProto = right.prototype;
    
    while (true) {
        if (leftProto === null) {
            return false;
        }
        if (leftProto === rightProto) {
            return true;
        }
        leftProto = Object.getPrototypeOf(leftProto);
    }
}
```

### 5. 特殊情况处理

**typeof 的特殊情况**：
```javascript
// null 的特殊情况
console.log(typeof null);  // "object" - 这是 JavaScript 的历史 bug

// 函数的特殊情况
console.log(typeof function(){});  // "function" - 尽管函数也是对象
console.log(typeof class{});       // "function" - 类也是函数
```

**instanceof 的特殊情况**：
```javascript
// 继承关系
console.log([] instanceof Array);   // true
console.log([] instanceof Object);  // true (数组也是对象)

// 多层继承
function Animal() {}
function Dog() {}
Dog.prototype = Object.create(Animal.prototype);

let dog = new Dog();
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
console.log(dog instanceof Object); // true
```

### 6. 跨框架问题

**instanceof 的跨框架问题**：
```javascript
// 在不同框架或窗口中，构造函数可能不同
// 这会导致 instanceof 检测失败

// 假设在 iframe 中
/*
let iframeArray = iframe.contentWindow.Array;
let arr = new iframeArray(1, 2, 3);
console.log(arr instanceof Array);        // false
console.log(Array.isArray(arr));          // true
console.log(Object.prototype.toString.call(arr)); // "[object Array]"
*/
```

### 7. 使用场景对比

**使用 typeof 的场景**：
- 检测基本数据类型
- 快速判断变量是否已定义
- 参数类型验证

```javascript
function checkParam(param) {
    if (typeof param === 'undefined') {
        console.log('参数未定义');
        return;
    }
    if (typeof param !== 'string') {
        console.log('参数必须是字符串类型');
        return;
    }
    console.log('参数有效:', param);
}
```

**使用 instanceof 的场景**：
- 检测复杂对象类型
- 判断对象的继承关系
- 多态性处理

```javascript
function processValue(value) {
    if (value instanceof Array) {
        console.log('处理数组:', value);
        return value.map(item => item * 2);
    } else if (value instanceof Date) {
        console.log('处理日期:', value);
        return value.getTime();
    } else if (value instanceof RegExp) {
        console.log('处理正则:', value);
        return value.test('test string');
    } else {
        console.log('处理普通值:', value);
        return value;
    }
}
```

### 8. 优缺点对比

| 特性 | typeof | instanceof |
|------|--------|------------|
| 检测基本类型 | ✅ 支持 | ❌ 不支持 |
| 检测对象类型 | ❌ 只能区分是否为对象 | ✅ 可区分具体对象类型 |
| 继承关系检测 | ❌ 不支持 | ✅ 支持 |
| 跨框架兼容性 | ✅ 好 | ❌ 差 |
| 返回值 | 字符串 | 布尔值 |
| 性能 | 高 | 中等 |

### 9. 实际应用示例

```javascript
// 综合类型检测函数
function comprehensiveTypeCheck(value) {
    // 使用 typeof 检测基本类型
    const basicType = typeof value;
    
    // 如果是对象类型，使用 instanceof 进行进一步检测
    if (basicType === 'object' && value !== null) {
        if (value instanceof Array) {
            return 'array';
        } else if (value instanceof Date) {
            return 'date';
        } else if (value instanceof RegExp) {
            return 'regexp';
        } else if (value instanceof Error) {
            return 'error';
        } else {
            return 'object';
        }
    }
    
    // 基本类型直接返回 typeof 结果
    return basicType;
}

// 测试
console.log(comprehensiveTypeCheck(123));        // "number"
console.log(comprehensiveTypeCheck("hello"));    // "string"
console.log(comprehensiveTypeCheck([]));         // "array"
console.log(comprehensiveTypeCheck(new Date())); // "date"
console.log(comprehensiveTypeCheck({}));         // "object"
```

### 10. 最佳实践

1. **检测基本类型**：优先使用 `typeof`
2. **检测复杂对象类型**：使用 `instanceof` 或 `Object.prototype.toString.call()`
3. **检测数组**：使用 `Array.isArray()`（ES5+）
4. **跨框架场景**：避免使用 `instanceof`，使用 `Object.prototype.toString.call()`

总的来说，`typeof` 适用于基本类型检测，`instanceof` 适用于对象类型检测和继承关系判断，两者各有优势，应根据具体需求选择合适的方法。
