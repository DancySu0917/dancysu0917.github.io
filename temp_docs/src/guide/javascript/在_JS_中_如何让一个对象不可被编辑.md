# 在 JS 中，如何让一个对象不可被编辑？（了解）
### 标准答案

在JavaScript中，有多种方式可以让对象不可被编辑：1) `Object.freeze()` - 冻结对象，防止添加、删除或修改属性值；2) `Object.seal()` - 密封对象，防止添加或删除属性，但可以修改现有属性值；3) `Object.preventExtensions()` - 防止扩展对象，不能添加新属性；4) 使用`defineProperty`设置属性为不可写。这些方法提供不同级别的对象保护。

### 深入理解

JavaScript提供了多种级别的对象不可变性控制，从完全冻结到仅防止扩展，每种方法都有其特定用途。

**1. Object.freeze() - 完全冻结对象：**
```javascript
// 冻结对象，使其完全不可变
const user = {
    name: 'Alice',
    age: 25,
    address: {
        city: 'Beijing',
        country: 'China'
    }
};

Object.freeze(user);

// 尝试修改属性
user.name = 'Bob'; // 无效，静默失败（在严格模式下会抛出错误）
user.email = 'alice@example.com'; // 无效，无法添加新属性
delete user.age; // 无效，无法删除属性

console.log(user.name); // 'Alice' - 原值保持不变
console.log(user.email); // undefined - 新属性未添加

// 注意：freeze是浅冻结
user.address.city = 'Shanghai'; // 这个修改是有效的
console.log(user.address.city); // 'Shanghai'

// 深冻结函数
function deepFreeze(obj) {
    // 获取对象的所有属性名
    Object.getOwnPropertyNames(obj).forEach(prop => {
        // 如果属性值是对象，则递归冻结
        if (obj[prop] !== null && typeof obj[prop] === 'object') {
            deepFreeze(obj[prop]);
        }
    });
    return Object.freeze(obj);
}

const deepFrozenUser = deepFreeze({
    name: 'Alice',
    profile: {
        age: 25,
        preferences: ['reading', 'music']
    }
});

// 现在所有嵌套对象也被冻结
deepFrozenUser.profile.age = 30; // 无效
console.log(deepFrozenUser.profile.age); // 25 - 值未改变
```

**2. Object.seal() - 密封对象：**
```javascript
// 密封对象，防止添加或删除属性，但可以修改现有属性值
const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000
};

Object.seal(config);

// 可以修改现有属性
config.timeout = 10000;
console.log(config.timeout); // 10000

// 无法添加新属性
config.retry = 3; // 静默失败
console.log(config.retry); // undefined

// 无法删除属性
delete config.apiUrl; // 静默失败
console.log(config.apiUrl); // 'https://api.example.com'

console.log(Object.isSealed(config)); // true
console.log(Object.isFrozen(config)); // false - sealed对象不一定是frozen的
```

**3. Object.preventExtensions() - 防止扩展：**
```javascript
// 防止对象扩展，不能添加新属性
const settings = {
    theme: 'dark',
    language: 'zh-CN'
};

Object.preventExtensions(settings);

// 可以修改现有属性
settings.theme = 'light';
console.log(settings.theme); // 'light'

// 可以删除属性
delete settings.language;
console.log(settings.language); // undefined

// 无法添加新属性
settings.newOption = true; // 静默失败（严格模式下抛出错误）
console.log(settings.newOption); // undefined

console.log(Object.isExtensible(settings)); // false
```

**4. 使用defineProperty设置属性特性：**
```javascript
// 使用defineProperty创建不可写的属性
const constants = {};

Object.defineProperty(constants, 'PI', {
    value: 3.14159,
    writable: false,    // 不可写
    enumerable: true,   // 可枚举
    configurable: false // 不可配置（不能被删除或修改属性描述符）
});

Object.defineProperty(constants, 'MAX_RETRY', {
    value: 3,
    writable: false,
    enumerable: true,
    configurable: false
});

console.log(constants.PI); // 3.14159
constants.PI = 3.14; // 无效
console.log(constants.PI); // 3.14159 - 值未改变

// 使用defineProperties同时定义多个属性
const appConfig = {};
Object.defineProperties(appConfig, {
    VERSION: {
        value: '1.0.0',
        writable: false,
        enumerable: true,
        configurable: false
    },
    DEBUG: {
        value: false,
        writable: false,
        enumerable: true,
        configurable: false
    },
    API_BASE_URL: {
        value: 'https://api.example.com',
        writable: false,
        enumerable: true,
        configurable: false
    }
});
```

**5. 使用Proxy创建不可变代理：**
```javascript
// 使用Proxy创建不可变对象
function createImmutable(obj) {
    return new Proxy(obj, {
        set(target, property, value) {
            throw new Error(`Cannot modify immutable object. Attempted to set ${property} = ${value}`);
        },
        deleteProperty(target, property) {
            throw new Error(`Cannot delete property from immutable object. Attempted to delete ${property}`);
        },
        defineProperty(target, property) {
            throw new Error(`Cannot define property on immutable object. Attempted to define ${property}`);
        }
    });
}

const immutableData = createImmutable({
    name: 'Immutable Object',
    value: 42
});

// 尝试修改会抛出错误
try {
    immutableData.name = 'New Name';
} catch (error) {
    console.error(error.message); // Cannot modify immutable object...
}

// 使用Proxy创建更灵活的不可变对象
function createAdvancedImmutable(obj) {
    // 深拷贝对象以避免修改原始对象
    const clone = JSON.parse(JSON.stringify(obj));
    
    return new Proxy(clone, {
        get(target, property) {
            const value = target[property];
            // 如果属性值是对象，也返回不可变代理
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return createAdvancedImmutable(value);
            }
            return value;
        },
        set(target, property, value) {
            if (Object.keys(target).includes(property)) {
                console.warn(`Property ${property} is immutable and cannot be changed`);
            } else {
                console.warn(`Cannot add new property ${property} to immutable object`);
            }
            return true; // 静默失败，不抛出错误
        },
        deleteProperty(target, property) {
            console.warn(`Cannot delete property ${property} from immutable object`);
            return true;
        }
    });
}
```

**6. 实际应用场景：**
```javascript
// 应用场景1: 配置对象保护
const AppConfig = {
    API_ENDPOINTS: Object.freeze({
        USER: '/api/user',
        POST: '/api/post',
        COMMENT: '/api/comment'
    }),
    THEMES: Object.freeze(['light', 'dark', 'auto']),
    DEFAULT_TIMEOUT: 5000
};

Object.freeze(AppConfig);

// 应用场景2: 常量对象
const HTTP_STATUS = Object.freeze({
    OK: 200,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
    UNAUTHORIZED: 401
});

// 应用场景3: 环境配置
function createEnvironmentConfig(env) {
    const baseConfig = {
        development: {
            debug: true,
            apiUrl: 'http://localhost:3000',
            logLevel: 'debug'
        },
        production: {
            debug: false,
            apiUrl: 'https://api.production.com',
            logLevel: 'error'
        }
    };
    
    return Object.freeze(baseConfig[env] || baseConfig.development);
}

const config = createEnvironmentConfig('production');
// config.debug = true; // 无效，对象被冻结
```

**7. 不可变性库的使用：**
```javascript
// 虽然不是原生JavaScript，但可以提及流行的不可变性库
// 例如：Immutable.js 或使用函数式编程方法

// 简单的不可变更新辅助函数
function immutableUpdate(obj, updates) {
    return Object.freeze({ ...obj, ...updates });
}

const state = Object.freeze({
    user: { name: 'Alice', age: 25 },
    posts: []
});

const newState = immutableUpdate(state, {
    user: { ...state.user, age: 26 }
});

console.log(state.user.age); // 25 - 原对象未改变
console.log(newState.user.age); // 26 - 新对象包含更新
```

**8. 性能考虑：**
```javascript
// 冻结大对象的性能影响
function performanceTest() {
    // 创建大对象
    const largeObject = {};
    for (let i = 0; i < 100000; i++) {
        largeObject[`prop${i}`] = i;
    }
    
    console.time('Freeze time');
    Object.freeze(largeObject);
    console.timeEnd('Freeze time'); // 可能需要较长时间
    
    // 测试访问性能
    console.time('Access time');
    for (let i = 0; i < 1000; i++) {
        const value = largeObject.prop50000;
    }
    console.timeEnd('Access time');
}

// performanceTest();
```

**总结：**
1. `Object.freeze()` 提供最严格的不可变性，但只进行浅冻结
2. `Object.seal()` 允许修改属性值，但阻止添加/删除属性
3. `Object.preventExtensions()` 只阻止添加新属性
4. `defineProperty` 可以精确控制单个属性的可变性
5. 对于深度不可变性，需要递归处理或使用专门的库
6. 不可变性有助于避免意外修改，但可能影响性能
7. 在生产环境中，通常结合使用多种方法来实现所需的保护级别