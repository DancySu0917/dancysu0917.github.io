# 手撕：手写实现 Event Emitter，包含 on、off、emit、once 等方法？（高薪常问）

**题目**: 手撕：手写实现 Event Emitter，包含 on、off、emit、once 等方法？（高薪常问）

**答案**:

Event Emitter 是一种观察者模式的实现，允许我们定义自定义事件并监听这些事件。以下是完整的 Event Emitter 实现：

```javascript
class EventEmitter {
  constructor() {
    // 存储事件监听器
    this.events = {};
  }

  /**
   * 添加事件监听器
   * @param {string} eventName - 事件名称
   * @param {function} callback - 回调函数
   * @param {boolean} once - 是否只执行一次
   */
  _addListener(eventName, callback, once = false) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push({
      callback,
      once
    });

    return this;
  }

  /**
   * 添加事件监听器（多次触发）
   * @param {string} eventName - 事件名称
   * @param {function} callback - 回调函数
   */
  on(eventName, callback) {
    return this._addListener(eventName, callback, false);
  }

  /**
   * 添加事件监听器（只触发一次）
   * @param {string} eventName - 事件名称
   * @param {function} callback - 回调函数
   */
  once(eventName, callback) {
    return this._addListener(eventName, callback, true);
  }

  /**
   * 移除事件监听器
   * @param {string} eventName - 事件名称
   * @param {function} callback - 要移除的回调函数
   */
  off(eventName, callback) {
    if (!this.events[eventName]) {
      return this;
    }

    // 如果没有指定回调函数，移除所有该事件的监听器
    if (!callback) {
      delete this.events[eventName];
      return this;
    }

    // 过滤掉指定的回调函数
    this.events[eventName] = this.events[eventName].filter(
      listener => listener.callback !== callback
    );

    // 如果没有监听器了，删除事件
    if (this.events[eventName].length === 0) {
      delete this.events[eventName];
    }

    return this;
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {...any} args - 传递给回调函数的参数
   */
  emit(eventName, ...args) {
    if (!this.events[eventName]) {
      return false;
    }

    // 复制数组以避免在回调中修改数组时出现问题
    const listeners = [...this.events[eventName]];
    
    // 过滤出需要移除的监听器（once 类型）
    const toRemove = [];

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener.callback.apply(this, args);

      if (listener.once) {
        toRemove.push(listener.callback);
      }
    }

    // 移除 once 类型的监听器
    toRemove.forEach(callback => {
      this.off(eventName, callback);
    });

    return true;
  }

  /**
   * 获取指定事件的所有监听器
   * @param {string} eventName - 事件名称
   */
  listeners(eventName) {
    if (!this.events[eventName]) {
      return [];
    }

    return this.events[eventName].map(listener => listener.callback);
  }

  /**
   * 获取指定事件的监听器数量
   * @param {string} eventName - 事件名称
   */
  listenerCount(eventName) {
    if (!this.events[eventName]) {
      return 0;
    }

    return this.events[eventName].length;
  }

  /**
   * 移除所有事件的所有监听器
   * @param {string} eventName - 事件名称，如果未提供则移除所有事件
   */
  removeAllListeners(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
    return this;
  }
}

// 使用示例
const emitter = new EventEmitter();

// 监听事件
const logHandler = (data) => console.log('Log:', data);
emitter.on('test', logHandler);

// 一次性监听器
emitter.once('once', (data) => console.log('Once:', data));

// 触发事件
emitter.emit('test', 'Hello World'); // 输出: Log: Hello World
emitter.emit('once', 'Only once');   // 输出: Once: Only once

// 再次触发 once 事件，不会有任何输出
emitter.emit('once', 'This will not be logged');

// 触发多次触发事件
emitter.emit('test', 'Another test'); // 输出: Log: Another test

// 移除监听器
emitter.off('test', logHandler);
emitter.emit('test', 'After removal'); // 不会有输出

// 高级用法示例
class AdvancedEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.maxListeners = 10; // 默认最大监听器数量
  }

  /**
   * 设置最大监听器数量
   * @param {number} n - 最大监听器数量
   */
  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }

  /**
   * 添加事件监听器，检查最大监听器数量限制
   */
  on(eventName, callback) {
    if (this.listenerCount(eventName) >= this.maxListeners) {
      console.warn(`Possible EventEmitter memory leak detected. ${this.listenerCount(eventName) + 1} ${eventName} listeners added.`);
    }
    return super.on(eventName, callback);
  }
}

// 使用高级事件发射器
const advancedEmitter = new AdvancedEventEmitter();
advancedEmitter.setMaxListeners(2);

// 添加多个监听器
advancedEmitter.on('many-listeners', () => console.log('First'));
advancedEmitter.on('many-listeners', () => console.log('Second'));
advancedEmitter.on('many-listeners', () => console.log('Third')); // 会触发警告
```

这个实现包含了以下特性：

1. **on()** - 添加事件监听器，可以多次触发
2. **once()** - 添加一次性事件监听器，触发后自动移除
3. **emit()** - 触发事件并传递参数给监听器
4. **off()** - 移除指定的事件监听器
5. **listeners()** - 获取指定事件的所有监听器
6. **listenerCount()** - 获取指定事件的监听器数量
7. **removeAllListeners()** - 移除所有监听器

实现的关键点包括：
- 使用对象存储事件和监听器的映射关系
- 区分普通监听器和一次性监听器
- 在 emit 时正确处理一次性监听器的移除
- 避免在 emit 过程中修改监听器数组导致的问题
- 提供额外的实用方法，如获取监听器列表和数量
