# Object.defineProperty 和 Proxy 的区别？（高薪常问）

## 标准答案

Object.defineProperty 和 Proxy 都是 JavaScript 中用于拦截对象操作的 API，但它们有重要区别：

1. **拦截范围**：
   - Object.defineProperty：只能拦截对象属性的 getter/setter
   - Proxy：可以拦截对象的 13 种操作（如 get、set、has、deleteProperty 等）

2. **使用方式**：
   - Object.defineProperty：直接修改原对象
   - Proxy：创建一个代理对象，不修改原对象

3. **兼容性**：
   - Object.defineProperty：ES5，兼容性好
   - Proxy：ES6，需要现代浏览器支持

4. **数组支持**：
   - Object.defineProperty：无法监听数组索引变化和 length 变化
   - Proxy：可以完全监听数组的所有变化

## 深入理解

让我们通过代码示例来深入理解两者的区别：

### Object.defineProperty 基本用法

```javascript
// Object.defineProperty 基本用法
const obj = { name: 'John', age: 25 };

Object.defineProperty(obj, 'age', {
    get() {
        console.log('获取 age 属性');
        return this._age;
    },
    set(value) {
        console.log('设置 age 属性', value);
        this._age = value;
    },
    enumerable: true,
    configurable: true
});

obj.age = 26; // 设置 age 属性 26
console.log(obj.age); // 获取 age 属性 26
```

### Object.defineProperty 的局限性

```javascript
// 1. 无法监听数组索引变化
const arr = [1, 2, 3];
Object.defineProperty(arr, '0', {
    get() {
        console.log('访问索引 0');
        return this._0;
    },
    set(value) {
        console.log('设置索引 0', value);
        this._0 = value;
    }
});

// 直接设置索引不会触发定义的 getter/setter
arr[0] = 10; // 不会触发 setter

// 2. 无法监听对象新增属性
const obj = { name: 'John' };
Object.defineProperty(obj, 'name', {
    get() {
        console.log('获取 name');
        return this._name;
    },
    set(value) {
        console.log('设置 name', value);
        this._name = value;
    }
});

// 新增属性不会触发响应
obj.age = 25; // 不会触发任何拦截

// 3. 需要遍历对象属性进行定义
function observe(obj) {
    Object.keys(obj).forEach(key => {
        let value = obj[key];
        
        // 对嵌套对象进行递归处理
        if (typeof value === 'object' && value !== null) {
            observe(value);
        }
        
        Object.defineProperty(obj, key, {
            get() {
                console.log(`获取 ${key}`);
                return value;
            },
            set(newVal) {
                console.log(`设置 ${key} 为 ${newVal}`);
                if (typeof newVal === 'object' && newVal !== null) {
                    observe(newVal); // 递归处理新对象
                }
                value = newVal;
            },
            enumerable: true,
            configurable: true
        });
    });
}

const data = { user: { name: 'John' } };
observe(data);
data.user.name = 'Jane'; // 正常工作
data.user = { name: 'Bob' }; // 也能工作
```

### Proxy 的基本用法

```javascript
// Proxy 基本用法
const target = { name: 'John', age: 25 };

const proxy = new Proxy(target, {
    get(obj, prop, receiver) {
        console.log(`访问属性 ${prop}`);
        return Reflect.get(obj, prop, receiver);
    },
    set(obj, prop, value, receiver) {
        console.log(`设置属性 ${prop} 为 ${value}`);
        return Reflect.set(obj, prop, value, receiver);
    },
    has(obj, prop) {
        console.log(`检查属性 ${prop} 是否存在`);
        return Reflect.has(obj, prop);
    },
    deleteProperty(obj, prop) {
        console.log(`删除属性 ${prop}`);
        return Reflect.deleteProperty(obj, prop);
    }
});

proxy.age = 26; // 设置属性 age 为 26
console.log(proxy.age); // 访问属性 age
console.log('age' in proxy); // 检查属性 age 是否存在
delete proxy.age; // 删除属性 age
```

### Proxy 完全支持数组

```javascript
// Proxy 对数组的完整支持
const arr = [1, 2, 3];

const proxyArr = new Proxy(arr, {
    get(target, prop, receiver) {
        console.log(`访问数组 ${prop}`);
        return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
        console.log(`设置数组索引 ${prop} 为 ${value}`);
        return Reflect.set(target, prop, value, receiver);
    }
});

proxyArr[0] = 10; // 设置数组索引 0 为 10
proxyArr.push(4); // 设置数组索引 length 为 4 (实际上会触发多次 set)
proxyArr.length = 2; // 设置数组索引 length 为 2

// 代理数组方法
const arrWithProxy = new Proxy([1, 2, 3], {
    get(target, prop, receiver) {
        if (typeof target[prop] === 'function') {
            return function(...args) {
                console.log(`调用数组方法 ${prop}`, args);
                const result = target[prop].apply(target, args);
                console.log(`方法 ${prop} 结果:`, result);
                return result;
            };
        }
        return Reflect.get(target, prop, receiver);
    }
});

arrWithProxy.push(4); // 会显示方法调用日志
arrWithProxy.splice(0, 1); // 会显示方法调用日志
```

### Proxy 支持的拦截操作

```javascript
// Proxy 支持的所有拦截操作
const target = { name: 'John' };

const handler = {
    // 拦截属性读取
    get(target, prop, receiver) {
        console.log(`get: ${prop}`);
        return Reflect.get(target, prop, receiver);
    },
    
    // 拦截属性设置
    set(target, prop, value, receiver) {
        console.log(`set: ${prop} = ${value}`);
        return Reflect.set(target, prop, value, receiver);
    },
    
    // 拦截 in 操作符
    has(target, prop) {
        console.log(`has: ${prop}`);
        return Reflect.has(target, prop);
    },
    
    // 拦截 delete 操作
    deleteProperty(target, prop) {
        console.log(`delete: ${prop}`);
        return Reflect.deleteProperty(target, prop);
    },
    
    // 拦截函数调用
    apply(target, thisArg, argumentsList) {
        console.log('apply:', argumentsList);
        return Reflect.apply(target, thisArg, argumentsList);
    },
    
    // 拦截构造函数调用
    construct(target, argumentsList, newTarget) {
        console.log('construct:', argumentsList);
        return Reflect.construct(target, argumentsList, newTarget);
    },
    
    // 拦截 Object.getOwnPropertyDescriptor()
    getOwnPropertyDescriptor(target, prop) {
        console.log(`getOwnPropertyDescriptor: ${prop}`);
        return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    
    // 拦截 Object.defineProperty()
    defineProperty(target, prop, descriptor) {
        console.log(`defineProperty: ${prop}`);
        return Reflect.defineProperty(target, prop, descriptor);
    },
    
    // 拦截 Object.getPrototypeOf()
    getPrototypeOf(target) {
        console.log('getPrototypeOf');
        return Reflect.getPrototypeOf(target);
    },
    
    // 拦截 Object.setPrototypeOf()
    setPrototypeOf(target, proto) {
        console.log('setPrototypeOf');
        return Reflect.setPrototypeOf(target, proto);
    },
    
    // 拦截 isExtensible()
    isExtensible(target) {
        console.log('isExtensible');
        return Reflect.isExtensible(target);
    },
    
    // 拦截 preventExtensions()
    preventExtensions(target) {
        console.log('preventExtensions');
        return Reflect.preventExtensions(target);
    },
    
    // 拦截 ownKeys() (Object.keys, Object.getOwnPropertyNames 等)
    ownKeys(target) {
        console.log('ownKeys');
        return Reflect.ownKeys(target);
    }
};

const proxy = new Proxy(target, handler);

// 测试各种操作
proxy.name = 'Jane'; // set
console.log(proxy.name); // get
console.log('name' in proxy); // has
delete proxy.name; // deleteProperty
```

### Vue 2 与 Vue 3 的响应式实现对比

```javascript
// Vue 2 使用 Object.defineProperty 的实现（简化版）
function defineReactive(obj, key, val) {
    // 递归处理嵌套对象
    if (typeof val === 'object' && val !== null) {
        observe(val);
    }
    
    let dep = new Dep();
    
    Object.defineProperty(obj, key, {
        get() {
            if (Dep.target) {
                dep.addDep(Dep.target);
            }
            return val;
        },
        set(newVal) {
            if (newVal === val) return;
            
            if (typeof newVal === 'object' && newVal !== null) {
                observe(newVal);
            }
            
            val = newVal;
            dep.notify();
        },
        enumerable: true,
        configurable: true
    });
}

function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return;
    }
    
    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key]);
    });
}

// Vue 3 使用 Proxy 的实现（简化版）
function reactive(target) {
    if (typeof target !== 'object' || target === null) {
        return target;
    }
    
    return new Proxy(target, {
        get(target, key, receiver) {
            // 依赖收集
            track(target, key);
            
            const result = Reflect.get(target, key, receiver);
            
            // 如果获取的值是对象，递归创建响应式
            if (typeof result === 'object' && result !== null) {
                return reactive(result);
            }
            
            return result;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            
            if (oldValue !== value) {
                // 触发更新
                trigger(target, key);
            }
            
            return result;
        },
        deleteProperty(target, key) {
            const result = Reflect.deleteProperty(target, key);
            trigger(target, key);
            return result;
        }
    });
}
```

### 性能和使用场景对比

```javascript
// 性能对比示例
const largeObj = {};
for (let i = 0; i < 10000; i++) {
    largeObj[`prop${i}`] = i;
}

// Object.defineProperty 需要一次性处理所有属性
console.time('Object.defineProperty');
const objWithDefine = { ...largeObj };
Object.keys(objWithDefine).forEach(key => {
    let value = objWithDefine[key];
    Object.defineProperty(objWithDefine, key, {
        get() { return value; },
        set(newVal) { value = newVal; },
        enumerable: true,
        configurable: true
    });
});
console.timeEnd('Object.defineProperty');

// Proxy 在访问时才进行拦截
console.time('Proxy');
const proxyForLargeObj = new Proxy(largeObj, {
    get(target, key) {
        return target[key];
    },
    set(target, key, value) {
        target[key] = value;
        return true;
    }
});
console.timeEnd('Proxy');

// 实际应用：创建响应式数据
function createReactiveData(data, callback) {
    return new Proxy(data, {
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver);
            
            // 如果是对象，递归代理
            if (typeof value === 'object' && value !== null && !value.__isProxied) {
                return createReactiveData(value, callback);
            }
            
            return value;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            
            if (oldValue !== value) {
                callback && callback(key, value, oldValue);
            }
            
            return result;
        }
    });
}

// 使用示例
const reactiveData = createReactiveData(
    { user: { name: 'John', age: 25 } },
    (key, newVal, oldVal) => {
        console.log(`数据变化: ${key} 从 ${oldVal} 变为 ${newVal}`);
    }
);

reactiveData.user.name = 'Jane'; // 数据变化: name 从 John 变为 Jane
```

### 兼容性处理方案

```javascript
// 降级处理：根据浏览器支持情况选择实现方式
function createObservable(target, callback) {
    if (typeof Proxy !== 'undefined') {
        // 使用 Proxy（现代浏览器）
        return new Proxy(target, {
            get(target, key, receiver) {
                const value = Reflect.get(target, key, receiver);
                if (typeof value === 'object' && value !== null) {
                    return createObservable(value, callback);
                }
                return value;
            },
            set(target, key, value, receiver) {
                const oldValue = target[key];
                const result = Reflect.set(target, key, value, receiver);
                
                if (oldValue !== value) {
                    callback && callback(key, value, oldValue);
                }
                
                return result;
            }
        });
    } else {
        // 降级到 Object.defineProperty（IE 等旧浏览器）
        if (typeof target === 'object' && target !== null) {
            Object.keys(target).forEach(key => {
                let value = target[key];
                
                if (typeof value === 'object' && value !== null) {
                    target[key] = createObservable(value, callback);
                }
                
                Object.defineProperty(target, key, {
                    get() {
                        return value;
                    },
                    set(newVal) {
                        const oldVal = value;
                        if (typeof newVal === 'object' && newVal !== null) {
                            newVal = createObservable(newVal, callback);
                        }
                        value = newVal;
                        
                        if (oldVal !== newVal) {
                            callback && callback(key, newVal, oldVal);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
            });
        }
        return target;
    }
}
```

Proxy 相比 Object.defineProperty 提供了更全面的对象拦截能力，解决了 Vue 2 中的一些限制，如无法监听数组索引变化、无法监听对象属性的新增/删除等问题。但 Proxy 需要 ES6 支持，且在某些性能敏感的场景下需要注意使用方式。