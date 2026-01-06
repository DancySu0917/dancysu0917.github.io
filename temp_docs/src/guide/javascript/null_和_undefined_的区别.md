# null 和 undefined 的区别？（必会）

**题目**: null 和 undefined 的区别？（必会）

**答案**:

`null` 和 `undefined` 都是 JavaScript 中表示"空值"的特殊值，但它们有着重要的区别和不同的使用场景。

### 1. 基本定义

- **undefined**：表示变量已声明但未赋值，或不存在的属性值
- **null**：表示一个空对象指针，是明确赋值的"空值"

### 2. 类型差异

```javascript
console.log(typeof undefined);  // "undefined"
console.log(typeof null);       // "object" (这是 JavaScript 的历史遗留 bug)
```

### 3. 产生场景

**undefined 的产生场景**：
- 变量声明但未初始化
- 函数没有返回值
- 函数参数未传递
- 对象属性不存在
- void 运算符的返回值

```javascript
// 变量声明但未赋值
let a;
console.log(a);  // undefined

// 函数无返回值
function test() {}
console.log(test());  // undefined

// 对象属性不存在
let obj = {};
console.log(obj.name);  // undefined
```

**null 的产生场景**：
- 明确赋值为 null
- 主动清空对象引用
- 作为函数参数传递空值

```javascript
let obj = { name: "张三" };
obj = null;  // 主动清空对象引用
```

### 4. 比较差异

```javascript
console.log(null == undefined);   // true (类型转换后相等)
console.log(null === undefined);  // false (类型不同，严格不相等)

// 在布尔上下文中的转换
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false

// 在数字上下文中的转换
console.log(Number(null));        // 0
console.log(Number(undefined));   // NaN
```

### 5. 使用场景

**undefined 使用场景**：
- 系统默认值，表示"未初始化"
- 检查变量是否已定义
- 函数参数默认值

**null 使用场景**：
- 表示"有意的空值"
- 清空对象引用
- 作为 API 返回值表示"无结果"

### 6. 实际应用示例

```javascript
// 检查变量是否已定义
function isDefined(value) {
    return value !== undefined;
}

// 检查值是否为空
function isEmpty(value) {
    return value === null || value === undefined;
}

// API 返回值处理
function findUser(id) {
    // 模拟查找用户
    if (id === 1) {
        return { name: "张三", age: 25 };
    } else {
        return null;  // 明确表示未找到用户
    }
}

// 清空对象引用
let largeObject = { /* 大对象数据 */ };
largeObject = null;  // 清空引用，便于垃圾回收
```

### 7. 最佳实践

- **使用 null**：当需要明确表示"无值"或"空对象"时
- **避免显式赋值 undefined**：使用 null 来表示有意的空值
- **检查值时**：使用 `===` 进行严格比较，或使用 `typeof` 检查
- **函数参数**：可使用默认参数而不是依赖 undefined

```javascript
// 推荐的检查方式
function checkValue(value) {
    if (value === null) {
        console.log("值被明确设置为空");
    } else if (value === undefined) {
        console.log("值未定义");
    } else {
        console.log("值存在:", value);
    }
}

// 使用默认参数
function greet(name = null) {
    if (name === null) {
        name = "访客";
    }
    console.log(`你好, ${name}!`);
}
```

### 8. 常见陷阱

```javascript
// 注意类型转换
if (null) {         // false
    // 不执行
}

if (undefined) {    // false
    // 不执行
}

// 数值转换
console.log(1 + null);      // 1
console.log(1 + undefined); // NaN
```

总的来说，`undefined` 通常表示系统层面的"未定义"，而 `null` 表示程序层面的"有意空值"。在实际开发中，应根据具体场景选择合适的空值表示方式。
