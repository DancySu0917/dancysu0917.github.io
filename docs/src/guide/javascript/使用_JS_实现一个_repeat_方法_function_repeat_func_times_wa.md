# 使用 JS 实现一个 repeat 方法 function repeat(func, times, wait)？（了解）

**题目**: 使用 JS 实现一个 repeat 方法 function repeat(func, times, wait)？（了解）

**答案**:

实现一个repeat方法，用于重复执行函数指定次数，每次执行间隔指定时间：

```javascript
/**
 * 重复执行函数指定次数，每次间隔指定时间
 * @param {Function} func - 要重复执行的函数
 * @param {number} times - 执行次数
 * @param {number} wait - 每次执行间隔时间（毫秒）
 * @returns {Function} 返回一个可执行的函数
 */
function repeat(func, times, wait) {
  return function(...args) {
    let count = 0;
    
    function execute() {
      if (count < times) {
        func.apply(this, args);
        count++;
        
        if (count < times) {
          setTimeout(execute, wait);
        }
      }
    }
    
    execute();
  };
}

// 使用示例
const logHello = (name) => console.log(`Hello ${name}!`);
const repeatLog = repeat(logHello, 3, 1000); // 重复3次，间隔1秒
repeatLog('World'); // 会输出3次 "Hello World!"，每次间隔1秒

// 更完整的实现，支持取消和完成回调
function repeatAdvanced(func, times, wait) {
  let timer = null;
  let count = 0;
  
  const repeater = function(...args) {
    const execute = () => {
      if (count < times) {
        const result = func.apply(this, args);
        count++;
        
        if (count < times) {
          timer = setTimeout(execute, wait);
        } else {
          // 执行完成后的回调
          if (repeater.onComplete) {
            repeater.onComplete();
          }
        }
      }
    };
    
    execute();
  };
  
  // 添加取消方法
  repeater.cancel = function() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  
  // 添加完成回调
  repeater.onComplete = null;
  
  return repeater;
}

// 使用示例
let counter = 0;
const increment = () => {
  console.log(`执行第 ${++counter} 次`);
};

const advancedRepeater = repeatAdvanced(increment, 5, 1000);
advancedRepeater.onComplete = () => {
  console.log('所有执行完成！');
};

// 如果需要取消执行
// setTimeout(() => advancedRepeater.cancel(), 3000);

// 使用Promise的实现方式
function repeatPromise(func, times, wait) {
  return async function(...args) {
    for (let i = 0; i < times; i++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          func.apply(this, args);
          resolve();
        }, wait);
      });
    }
  };
}

// 使用示例（需要在async函数中使用）
// const asyncRepeater = repeatPromise(logHello, 3, 1000);
// await asyncRepeater('Async');

// 使用setInterval的实现方式
function repeatWithInterval(func, times, wait) {
  return function(...args) {
    let count = 0;
    const intervalId = setInterval(() => {
      func.apply(this, args);
      count++;
      
      if (count >= times) {
        clearInterval(intervalId);
      }
    }, wait);
  };
}

// 使用示例
const intervalRepeater = repeatWithInterval(logHello, 3, 1000);
intervalRepeater('Interval'); // 会输出3次 "Hello Interval!"，每次间隔1秒
```

**关键点说明**：
1. **基础实现**：使用setTimeout递归调用来实现间隔执行
2. **参数传递**：使用apply方法传递参数给原函数
3. **上下文保持**：保持原函数的this上下文
4. **高级功能**：添加取消功能和完成回调
5. **Promise方式**：使用async/await实现更优雅的异步控制
6. **setInterval方式**：另一种实现方式，注意清理interval

**应用场景**：
- 定时轮询数据
- 动画效果重复执行
- 重试机制
- 倒计时功能
