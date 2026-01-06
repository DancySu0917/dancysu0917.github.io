# 一直在 window 上面挂东西是否有什么风险？（了解）

## 标准答案

在 window 对象上挂载属性和方法存在多种风险：

1. **全局命名空间污染**：增加全局变量，容易造成命名冲突
2. **安全风险**：暴露敏感数据或功能给恶意脚本
3. **内存泄漏**：引用无法被垃圾回收，导致内存持续占用
4. **性能影响**：增加全局对象大小，影响查找性能
5. **维护困难**：代码结构不清晰，难以追踪和管理
6. **调试困难**：难以定位问题来源，增加调试复杂度
7. **意外修改**：其他代码可能意外覆盖或修改全局属性

## 深入分析

### 1. 全局命名空间污染问题

在 window 对象上挂载属性会污染全局命名空间，这可能导致：

- 不同库或模块间的命名冲突
- 变量覆盖问题
- 代码可维护性降低
- 意外的副作用

### 2. 安全风险

- **XSS 攻击**：暴露的全局变量可能被恶意脚本访问
- **数据泄露**：敏感信息可能被第三方脚本获取
- **功能滥用**：暴露的 API 可能被恶意利用

### 3. 内存管理问题

- 全局变量生命周期与页面一致，难以释放
- 循环引用导致内存无法回收
- 持久化的全局对象占用内存

### 4. 性能影响

- 全局对象查找时间增加
- JavaScript 引擎优化效率降低
- 作用域链查找变慢

## 代码实现

### 1. 避免全局污染的模块模式

```javascript
// 不好的做法：直接挂载到 window
window.myUtility = {
  formatDate: function(date) {
    return date.toLocaleDateString();
  },
  calculateTax: function(amount, rate) {
    return amount * rate;
  }
};

// 更好的做法：使用模块模式
const MyModule = (function() {
  // 私有变量
  const privateData = {};
  
  // 私有方法
  function privateMethod() {
    // 私有逻辑
  }
  
  // 公共接口
  return {
    publicMethod: function() {
      // 公共方法
      return privateMethod();
    },
    
    formatDate: function(date) {
      return date.toLocaleDateString();
    },
    
    calculateTax: function(amount, rate) {
      return amount * rate;
    }
  };
})();

// 使用命名空间避免冲突
window.MyApp = window.MyApp || {};
window.MyApp.Utilities = MyModule;
```

### 2. 使用 ES6 模块系统

```javascript
// utils.js
export const dateUtils = {
  formatDate(date) {
    return date.toLocaleDateString();
  },
  
  formatDateTime(date) {
    return date.toLocaleString();
  }
};

export const numberUtils = {
  calculateTax(amount, rate) {
    return amount * rate;
  },
  
  formatCurrency(amount) {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  }
};

export default {
  dateUtils,
  numberUtils
};

// main.js
import Utils from './utils.js';
import { dateUtils, numberUtils } from './utils.js';

// 使用导入的模块，不污染全局作用域
const formattedDate = dateUtils.formatDate(new Date());
```

### 3. 使用立即执行函数表达式 (IIFE) 隔离作用域

```javascript
// 创建隔离作用域避免全局污染
(function(global) {
  'use strict';
  
  // 私有变量和方法
  const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000
  };
  
  function validateInput(input) {
    return typeof input === 'string' && input.length > 0;
  }
  
  // 公共 API
  const PublicAPI = {
    getData: function(url) {
      if (!validateInput(url)) {
        throw new Error('Invalid URL');
      }
      
      return fetch(url, {
        timeout: config.timeout
      });
    },
    
    formatData: function(data) {
      if (!data) return null;
      return JSON.stringify(data, null, 2);
    }
  };
  
  // 有条件地挂载到全局对象
  if (typeof global.MyPublicAPI === 'undefined') {
    global.MyPublicAPI = PublicAPI;
  }
  
})(window);

// 检查全局污染的工具函数
function checkGlobalPollution() {
  const initialGlobals = Object.keys(window);
  
  // 在代码执行前后比较全局变量
  setTimeout(() => {
    const currentGlobals = Object.keys(window);
    const newGlobals = currentGlobals.filter(g => !initialGlobals.includes(g));
    
    console.log('新增的全局变量:', newGlobals);
    
    // 可以在这里实现警告或错误处理
    if (newGlobals.length > 10) { // 假设阈值为10
      console.warn('检测到大量全局变量，可能存在命名空间污染');
    }
  }, 0);
}
```

### 4. 使用 WeakMap 避免全局引用

```javascript
// 使用 WeakMap 存储私有数据，避免全局引用
const privateData = new WeakMap();

class DataManager {
  constructor(data) {
    // 私有数据存储在 WeakMap 中
    privateData.set(this, {
      data: data,
      timestamp: Date.now()
    });
  }
  
  getData() {
    const internal = privateData.get(this);
    return internal ? internal.data : null;
  }
  
  updateData(newData) {
    const internal = privateData.get(this);
    if (internal) {
      internal.data = newData;
      internal.timestamp = Date.now();
    }
  }
}

// 使用闭包创建私有作用域
function createSecureStorage() {
  // 这些变量不会暴露到全局作用域
  const storage = new Map();
  const encryptionKey = generateKey(); // 假设这是安全的密钥生成函数
  
  return {
    set: function(key, value) {
      const encryptedValue = encrypt(value, encryptionKey);
      storage.set(key, encryptedValue);
    },
    
    get: function(key) {
      const encryptedValue = storage.get(key);
      return encryptedValue ? decrypt(encryptedValue, encryptionKey) : null;
    },
    
    remove: function(key) {
      return storage.delete(key);
    }
  };
}

// 安全的全局访问点
const SecureStorage = createSecureStorage();
```

### 5. 检测和管理全局变量的工具

```javascript
// 全局变量监控工具
class GlobalVariableMonitor {
  constructor() {
    this.initialGlobals = new Set(Object.keys(window));
    this.trackedVariables = new Map();
    this.changeListeners = [];
  }
  
  // 监控全局变量变化
  startMonitoring() {
    this.monitorInterval = setInterval(() => {
      this.checkForNewGlobals();
    }, 1000); // 每秒检查一次
  }
  
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }
  
  checkForNewGlobals() {
    const currentGlobals = Object.keys(window);
    const newGlobals = currentGlobals.filter(g => !this.initialGlobals.has(g));
    
    if (newGlobals.length > 0) {
      console.warn('发现新的全局变量:', newGlobals);
      
      newGlobals.forEach(gVar => {
        if (!this.trackedVariables.has(gVar)) {
          this.trackedVariables.set(gVar, {
            created: new Date(),
            value: window[gVar],
            type: typeof window[gVar]
          });
          
          // 触发变化监听器
          this.changeListeners.forEach(listener => {
            listener('new', gVar, window[gVar]);
          });
        }
      });
    }
  }
  
  // 添加变化监听器
  onChange(callback) {
    this.changeListeners.push(callback);
  }
  
  // 获取全局变量报告
  getReport() {
    return {
      initialCount: this.initialGlobals.size,
      currentCount: Object.keys(window).length,
      newVariables: Array.from(this.trackedVariables.entries())
    };
  }
  
  // 清理特定全局变量
  cleanupVariable(varName) {
    if (window.hasOwnProperty(varName)) {
      delete window[varName];
      this.trackedVariables.delete(varName);
      return true;
    }
    return false;
  }
}

// 使用示例
const globalMonitor = new GlobalVariableMonitor();
globalMonitor.startMonitoring();

// 监听全局变量变化
globalMonitor.onChange((type, varName, value) => {
  console.log(`全局变量变化: ${type} - ${varName}`, value);
});
```

## 实际应用场景

### 1. 第三方库集成

```javascript
// 安全集成第三方库
function safeLoadLibrary(libUrl, globalVarName, callback) {
  // 检查全局变量是否已存在
  if (window[globalVarName]) {
    console.warn(`${globalVarName} 已存在，可能造成冲突`);
  }
  
  const script = document.createElement('script');
  script.src = libUrl;
  
  script.onload = function() {
    // 验证库是否正确加载
    if (window[globalVarName]) {
      callback(window[globalVarName]);
    } else {
      console.error(`Failed to load ${globalVarName}`);
    }
  };
  
  script.onerror = function() {
    console.error(`Failed to load library from ${libUrl}`);
  };
  
  document.head.appendChild(script);
}
```

### 2. 插件系统设计

```javascript
// 插件系统，避免全局污染
class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  // 注册插件（不污染全局作用域）
  registerPlugin(name, plugin) {
    if (this.plugins.has(name)) {
      console.warn(`Plugin ${name} already exists`);
      return false;
    }
    
    this.plugins.set(name, plugin);
    
    // 如果插件有初始化方法
    if (typeof plugin.init === 'function') {
      plugin.init(this);
    }
    
    return true;
  }
  
  // 触发钩子
  triggerHook(hookName, data) {
    const hooks = this.hooks.get(hookName) || [];
    return hooks.map(hook => hook(data));
  }
  
  // 添加钩子
  addHook(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(callback);
  }
}

// 使用插件系统
const pluginSystem = new PluginSystem();

// 注册插件而不污染全局作用域
pluginSystem.registerPlugin('dataProcessor', {
  init: function(system) {
    system.addHook('dataReceived', (data) => {
      // 处理数据
      return data;
    });
  }
});
```

## 注意事项

1. **最小化全局暴露**：只暴露必要的接口
2. **使用命名空间**：创建有意义的命名空间组织代码
3. **版本管理**：为全局变量添加版本信息便于管理
4. **文档记录**：记录所有全局变量的用途和生命周期
5. **定期清理**：定期检查和清理不必要的全局变量
6. **安全验证**：验证全局变量的访问权限和数据安全性
7. **错误处理**：为全局变量操作添加适当的错误处理

## 总结

在 window 对象上挂载属性虽然方便，但会带来命名空间污染、安全风险、内存泄漏等多种问题。现代前端开发应该采用模块化、命名空间、闭包等技术来避免全局污染，提高代码的可维护性、安全性和性能。最佳实践是尽可能减少全局变量的使用，采用现代模块系统来组织代码结构。
