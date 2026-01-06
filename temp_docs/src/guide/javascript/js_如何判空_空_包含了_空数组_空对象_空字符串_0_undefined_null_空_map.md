# js 如何判空「空」包含了：空数组、空对象、空字符串、0、undefined、null、空 map（了解）

**题目**: js 如何判空「空」包含了：空数组、空对象、空字符串、0、undefined、null、空 map（了解）

## 标准答案

JavaScript 中判断各种"空"值需要根据具体类型使用不同的方法：

1. **null/undefined**: 使用严格相等比较或类型检查
2. **空字符串**: 检查长度为0
3. **空数组**: 检查长度为0
4. **空对象**: 检查属性个数为0
5. **空 Map/Set**: 检查大小为0

## 深入解析

### 基础类型判空

```javascript
// null 和 undefined 检查
function isNullish(value) {
    return value === null || value === undefined;
}

// 使用可选链和空值合并操作符 (ES2020)
function modernNullishCheck(value) {
    return value == null; // 同时检查 null 和 undefined
}

// 0, false, NaN 的特殊处理
function isFalsyButNotZero(value) {
    return !value && value !== 0 && value !== false && !Number.isNaN(value);
}

// 综合基础类型检查
function isEmptyBasic(value) {
    // null 或 undefined
    if (value == null) {
        return true;
    }
    
    // 空字符串
    if (typeof value === 'string' && value.length === 0) {
        return true;
    }
    
    // NaN
    if (Number.isNaN(value)) {
        return true;
    }
    
    return false;
}
```

### 数组判空

```javascript
// 数组判空
function isEmptyArray(value) {
    return Array.isArray(value) && value.length === 0;
}

// 更严格的数组检查
function isArrayEmpty(value) {
    if (!Array.isArray(value)) {
        return false; // 不是数组，返回 false
    }
    return value.length === 0;
}

// 检查数组是否为空或只包含空值
function isArrayEmptyOrContainsOnlyEmpty(value) {
    if (!Array.isArray(value)) {
        return false;
    }
    
    if (value.length === 0) {
        return true;
    }
    
    // 检查是否所有元素都是空值
    return value.every(item => isEmpty(item));
}
```

### 对象判空

```javascript
// 普通对象判空
function isEmptyObject(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    
    return Object.keys(value).length === 0;
}

// 更全面的对象检查（包括不可枚举属性）
function isEmptyObjectFull(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    
    // 检查自有属性（包括不可枚举的）
    return Object.getOwnPropertyNames(value).length === 0;
}

// 检查对象是否为空或只包含空值
function isObjectEmptyOrContainsOnlyEmpty(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    
    const keys = Object.keys(value);
    if (keys.length === 0) {
        return true;
    }
    
    // 检查所有属性值是否都为空
    return keys.every(key => isEmpty(value[key]));
}
```

### Map 和 Set 判空

```javascript
// Map 判空
function isEmptyMap(value) {
    if (!(value instanceof Map)) {
        return false;
    }
    return value.size === 0;
}

// Set 判空
function isEmptySet(value) {
    if (!(value instanceof Set)) {
        return false;
    }
    return value.size === 0;
}

// WeakMap 和 WeakSet 无法直接检查大小，但可以检查是否为实例
function isEmptyWeakCollection(value) {
    if (value instanceof WeakMap || value instanceof WeakSet) {
        // 无法确定大小，但可以确认是弱集合类型
        return { isEmpty: true, type: value.constructor.name };
    }
    return false;
}
```

### 通用判空函数

```javascript
// 通用判空函数
function isEmpty(value) {
    // null 或 undefined
    if (value == null) {
        return true;
    }
    
    // 字符串
    if (typeof value === 'string') {
        return value.length === 0;
    }
    
    // 数组
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    
    // 数字 (0 通常不认为是"空")
    if (typeof value === 'number') {
        return Number.isNaN(value); // NaN 被认为是空
    }
    
    // 布尔值 (false 不认为是空)
    if (typeof value === 'boolean') {
        return false;
    }
    
    // Map
    if (value instanceof Map) {
        return value.size === 0;
    }
    
    // Set
    if (value instanceof Set) {
        return value.size === 0;
    }
    
    // 对象 (检查自有可枚举属性)
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    
    // 其他类型认为不为空
    return false;
}

// 更灵活的判空函数，可配置是否将 0 视为"空"
function isEmptyFlexible(value, options = {}) {
    const {
        treatZeroAsEmpty = false,
        treatFalseAsEmpty = false,
        checkPrototype = false
    } = options;
    
    // null 或 undefined
    if (value == null) {
        return true;
    }
    
    // NaN
    if (Number.isNaN(value)) {
        return true;
    }
    
    // 数字
    if (typeof value === 'number') {
        if (treatZeroAsEmpty && value === 0) {
            return true;
        }
        return false;
    }
    
    // 布尔值
    if (typeof value === 'boolean') {
        if (treatFalseAsEmpty && value === false) {
            return true;
        }
        return false;
    }
    
    // 字符串
    if (typeof value === 'string') {
        return value.length === 0;
    }
    
    // 数组
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    
    // Map
    if (value instanceof Map) {
        return value.size === 0;
    }
    
    // Set
    if (value instanceof Set) {
        return value.size === 0;
    }
    
    // 对象
    if (typeof value === 'object') {
        if (checkPrototype) {
            // 检查包括原型链上的属性
            let current = value;
            do {
                if (Object.keys(current).length > 0) {
                    return false;
                }
                current = Object.getPrototypeOf(current);
            } while (current !== null);
            return true;
        } else {
            // 只检查自身属性
            return Object.keys(value).length === 0;
        }
    }
    
    return false;
}
```

### 实际应用示例

```javascript
// 测试各种情况
function testEmptyChecks() {
    const testCases = [
        { value: null, expected: true, type: 'null' },
        { value: undefined, expected: true, type: 'undefined' },
        { value: '', expected: true, type: 'empty string' },
        { value: 'hello', expected: false, type: 'non-empty string' },
        { value: [], expected: true, type: 'empty array' },
        { value: [1, 2, 3], expected: false, type: 'non-empty array' },
        { value: {}, expected: true, type: 'empty object' },
        { value: { a: 1 }, expected: false, type: 'non-empty object' },
        { value: 0, expected: false, type: 'zero (not empty)' },
        { value: -0, expected: false, type: 'negative zero (not empty)' },
        { value: NaN, expected: true, type: 'NaN (empty)' },
        { value: false, expected: false, type: 'false (not empty)' },
        { value: new Map(), expected: true, type: 'empty Map' },
        { value: new Map([['key', 'value']]), expected: false, type: 'non-empty Map' },
        { value: new Set(), expected: true, type: 'empty Set' },
        { value: new Set([1, 2, 3]), expected: false, type: 'non-empty Set' }
    ];
    
    console.log('=== 基础判空测试 ===');
    testCases.forEach(testCase => {
        const result = isEmpty(testCase.value);
        const status = result === testCase.expected ? '✓' : '✗';
        console.log(`${status} ${testCase.type}: ${result} (expected: ${testCase.expected})`);
    });
    
    // 测试灵活配置
    console.log('\n=== 灵活配置测试 ===');
    console.log(`0 (treatZeroAsEmpty=false): ${isEmptyFlexible(0, { treatZeroAsEmpty: false })}`);
    console.log(`0 (treatZeroAsEmpty=true): ${isEmptyFlexible(0, { treatZeroAsEmpty: true })}`);
    console.log(`false (treatFalseAsEmpty=false): ${isEmptyFlexible(false, { treatFalseAsEmpty: false })}`);
    console.log(`false (treatFalseAsEmpty=true): ${isEmptyFlexible(false, { treatFalseAsEmpty: true })}`);
}

// 实用的工具类
class EmptyChecker {
    static isNullish(value) {
        return value == null;
    }
    
    static isEmpty(value) {
        return isEmpty(value);
    }
    
    static isEmptyWithConfig(value, config = {}) {
        return isEmptyFlexible(value, config);
    }
    
    // 检查值是否为"真实"的空值（包括深度检查）
    static isDeepEmpty(value) {
        if (isEmpty(value)) {
            return true;
        }
        
        if (Array.isArray(value)) {
            return value.every(item => EmptyChecker.isDeepEmpty(item));
        }
        
        if (typeof value === 'object' && value !== null) {
            const keys = Object.keys(value);
            return keys.length === 0 || keys.every(key => EmptyChecker.isDeepEmpty(value[key]));
        }
        
        return false;
    }
}
```

## 实际面试问答

**面试官**: JavaScript 中如何判断一个值是否为空？

**候选人**: 
需要根据数据类型分别处理：
- null/undefined: 使用 `value == null`
- 字符串: 检查 `value.length === 0`
- 数组: 检查 `Array.isArray(value) && value.length === 0`
- 对象: 检查 `Object.keys(value).length === 0`
- Map/Set: 检查 `value.size === 0`

**面试官**: 为什么 0 通常不被认为是"空"？

**候选人**: 
0 是一个有效的数值，在很多业务场景中具有实际意义（如数组索引、计数器等）。如果将0视为"空"，可能会导致逻辑错误。只有在特定业务场景下，才可能需要将0视为"空"值。

**面试官**: 如何判断嵌套对象是否包含空值？

**候选人**: 
需要递归检查，可以使用深度遍历的方式，对每个属性值递归调用判空函数。对于数组，检查每个元素；对于对象，检查每个属性值。
