# js 防抖和节流？（必会）

**题目**: js 防抖和节流？（必会）

## 标准答案

防抖（Debounce）和节流（Throttle）都是用来控制函数执行频率的技术，用于优化频繁触发的事件处理函数：

1. **防抖（Debounce）**：在指定时间间隔内，只有当事件停止触发后才执行函数
2. **节流（Throttle）**：在指定时间间隔内，保证函数最多执行一次

## 深入理解

### 防抖（Debounce）

防抖的原理是：在事件被触发时，设置一个定时器，如果在指定时间内事件再次被触发，则清除之前的定时器，重新设置新的定时器。

#### 防抖实现

```javascript
// 非立即执行版防抖（触发后等待 delay 时间再执行）
function debounce(func, delay) {
    let timer = null;
    return function(...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

// 立即执行版防抖（触发时立即执行，然后在 delay 时间内不能再次执行）
function debounceImmediate(func, delay) {
    let timer = null;
    return function(...args) {
        const context = this;
        if (!timer) {
            func.apply(context, args);
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
        }, delay);
    };
}

// 完整版防抖（可选择是否立即执行）
function debounceComplete(func, delay, immediate = false) {
    let timer = null;
    let callNow = false;
    
    return function(...args) {
        const context = this;
        
        if (immediate && !timer) {
            callNow = true;
            func.apply(context, args);
        }
        
        clearTimeout(timer);
        
        timer = setTimeout(() => {
            if (!immediate) {
                func.apply(context, args);
            }
            timer = null;
        }, delay);
        
        if (callNow) {
            callNow = false;
        }
    };
}
```

#### 防抖应用场景

```javascript
// 搜索框输入防抖
const searchInput = document.getElementById('search');
const debouncedSearch = debounce(function(e) {
    console.log('搜索:', e.target.value);
    // 执行搜索请求
}, 300);

searchInput.addEventListener('input', debouncedSearch);

// 窗口大小调整防抖
const debouncedResize = debounce(function() {
    console.log('窗口大小改变');
    // 重新计算布局
}, 300);

window.addEventListener('resize', debouncedResize);
```

### 节流（Throttle）

节流的原理是：在指定时间间隔内，无论事件触发多少次，函数只会执行一次。

#### 节流实现

```javascript
// 时间戳版节流（立即执行）
function throttle(func, delay) {
    let previous = 0;
    return function(...args) {
        const context = this;
        const now = Date.now();
        if (now - previous > delay) {
            func.apply(context, args);
            previous = now;
        }
    };
}

// 定时器版节流
function throttleTimer(func, delay) {
    let timer = null;
    return function(...args) {
        const context = this;
        if (!timer) {
            timer = setTimeout(() => {
                func.apply(context, args);
                timer = null;
            }, delay);
        }
    };
}

// 时间戳 + 定时器版节流（结合两种方式的优点）
function throttleHybrid(func, delay) {
    let timer = null;
    let previous = 0;
    
    return function(...args) {
        const context = this;
        const now = Date.now();
        
        if (now - previous > delay) {
            func.apply(context, args);
            previous = now;
        } else {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(context, args);
                previous = Date.now();
                timer = null;
            }, delay - (now - previous));
        }
    };
}
```

#### 节流应用场景

```javascript
// 滚动事件节流
const throttledScroll = throttle(function() {
    console.log('滚动事件触发');
    // 检查元素是否进入视窗
}, 100);

window.addEventListener('scroll', throttledScroll);

// 按钮点击节流
const throttledClick = throttle(function() {
    console.log('按钮被点击');
    // 提交表单或发送请求
}, 1000);

document.getElementById('submitBtn').addEventListener('click', throttledClick);
```

### 防抖与节流对比

| 特性 | 防抖（Debounce） | 节流（Throttle） |
|------|------------------|------------------|
| 执行时机 | 事件停止触发后执行 | 按固定时间间隔执行 |
| 执行频率 | 只执行最后一次 | 在时间间隔内最多执行一次 |
| 适用场景 | 搜索输入、窗口调整 | 滚动事件、按钮防重复点击 |
| 立即执行 | 可选择是否立即执行 | 通常不立即执行 |
| 实现复杂度 | 相对简单 | 略复杂 |

### 实际应用示例

```javascript
// 完整的防抖搜索示例
class SearchComponent {
    constructor(inputElement) {
        this.input = inputElement;
        this.searchResults = [];
        this.debounceSearch = debounce(this.performSearch.bind(this), 300);
        this.input.addEventListener('input', this.debounceSearch);
    }
    
    performSearch(e) {
        const query = e.target.value.trim();
        if (query) {
            // 模拟 API 调用
            fetch(`/api/search?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    this.searchResults = data;
                    this.renderResults(data);
                });
        } else {
            this.clearResults();
        }
    }
    
    renderResults(results) {
        // 渲染搜索结果
        console.log('搜索结果:', results);
    }
    
    clearResults() {
        this.searchResults = [];
        console.log('清空搜索结果');
    }
}

// 完整的节流滚动示例
class ScrollHandler {
    constructor() {
        this.throttledScroll = throttle(this.handleScroll.bind(this), 100);
        window.addEventListener('scroll', this.throttledScroll);
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        console.log(`滚动百分比: ${Math.min(scrollPercent, 100).toFixed(2)}%`);
        
        // 检查是否滚动到底部
        if (scrollTop + windowHeight >= documentHeight - 10) {
            console.log('滚动到底部，加载更多内容');
        }
    }
}
```

### 性能优化考虑

1. **内存泄漏**：确保在组件销毁时清除定时器
2. **this 指向**：正确绑定函数的 this 上下文
3. **参数传递**：正确传递事件参数和上下文
4. **取消执行**：提供取消防抖/节流的机制

```javascript
// 带取消功能的防抖
function debounceWithCancel(func, delay) {
    let timer = null;
    
    const debounced = function(...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
    
    // 添加取消方法
    debounced.cancel = function() {
        clearTimeout(timer);
        timer = null;
    };
    
    return debounced;
}

// 使用示例
const debouncedFunc = debounceWithCancel(myFunction, 300);
// 在适当时候取消
// debouncedFunc.cancel();
```

### 注意事项

1. **选择合适的延迟时间**：根据具体场景选择合适的 delay 时间
2. **考虑用户体验**：延迟时间过长会影响用户体验
3. **处理 this 上下文**：确保函数执行时 this 指向正确
4. **参数传递**：确保事件参数能正确传递给原函数

## 总结

- 防抖适用于需要等待用户操作停止后才执行的场景（如搜索、窗口调整）
- 节流适用于需要控制执行频率的场景（如滚动、按钮点击）
- 两种技术都能有效减少函数执行次数，提升性能
- 实现时需要考虑 this 指向、参数传递、内存泄漏等问题
- 根据具体业务场景选择合适的防抖或节流策略
