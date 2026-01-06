# 列出 Redux 的核心方法？（必会）

**题目**: 列出 Redux 的核心方法？（必会）

## 标准答案

Redux的核心方法包括：

### Store相关方法
- **createStore(reducer, [preloadedState], [enhancer])**: 创建Redux store来存放应用所有的state
- **combineReducers(reducers)**: 将多个reducer函数合并成一个reducer函数
- **applyMiddleware(...middleware)**: 扩展store的dispatch方法，用于处理异步操作等

### Store实例方法
- **getState()**: 获取当前state树的状态
- **dispatch(action)**: 分发action，是触发state改变的唯一方式
- **subscribe(listener)**: 添加状态变化监听器
- **replaceReducer(nextReducer)**: 替换当前reducer

### 中间件相关
- **thunk**: 处理异步action的中间件
- **logger**: 记录action日志的中间件

## 深入理解

Redux是一个可预测的状态容器，用于JavaScript应用程序。其核心概念包括：

### 基本使用示例
```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// 定义reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

// 创建store
const store = createStore(
  combineReducers({ counter: counterReducer }),
  applyMiddleware(thunk)
);

// 使用store
console.log(store.getState()); // 获取当前状态

// 订阅状态变化
const unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

// 分发action
store.dispatch({ type: 'INCREMENT' });

// 取消订阅
unsubscribe();
```

### 核心方法详解

#### createStore
- `reducer`: 指定state转换函数
- `preloadedState`: 初始状态
- `enhancer`: store enhancer，如applyMiddleware

#### combineReducers
- 将多个reducer合并为一个root reducer
- 每个reducer管理state树中的一个分支

#### applyMiddleware
- 为Redux提供第三方插件能力
- 常用于异步操作、日志记录等

Redux通过单一数据源、状态只读、纯函数更新三大原则，确保了状态管理的可预测性和可维护性。
