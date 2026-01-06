# React-如何进行路由变化监听？（了解）

**题目**: React-如何进行路由变化监听？（了解）

**答案**:

在React中进行路由变化监听主要有以下几种方式：

## 1. 使用useLocation Hook (React Router v6)
```javascript
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('路由变化:', location.pathname);
    // 在这里处理路由变化的逻辑
  }, [location.pathname]);
  
  return <div>...</div>;
}
```

## 2. 使用useHistory Hook (React Router v5) 或 useNavigate Hook (React Router v6)
```javascript
// React Router v5
import { useHistory } from 'react-router-dom';

function Component() {
  const history = useHistory();
  
  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      console.log('路由变化:', location.pathname);
    });
    
    return () => {
      unlisten(); // 清理监听器
    };
  }, [history]);
}

// React Router v6 中没有history.listen，需要使用其他方式
```

## 3. 使用自定义Hook监听路由变化
```javascript
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function useRouteChange(callback) {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  useEffect(() => {
    callback(location, navigationType);
  }, [location, navigationType, callback]);
}

// 使用示例
function App() {
  useRouteChange((location, navigationType) => {
    console.log('路由变化:', location.pathname);
    console.log('导航类型:', navigationType); // PUSH, POP, REPLACE
  });
  
  return <div>...</div>;
}
```

## 4. 使用RouteChange事件监听
```javascript
// 全局监听路由变化
const originalPush = history.push;
history.push = function(...args) {
  const result = originalPush.apply(this, args);
  // 触发自定义事件
  window.dispatchEvent(new Event('routeChange'));
  return result;
};
```

## 5. 在类组件中使用withRouter HOC
```javascript
import { withRouter } from 'react-router-dom';

class MyComponent extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      console.log('路由变化:', this.props.location.pathname);
    }
  }
  
  render() {
    return <div>...</div>;
  }
}

export default withRouter(MyComponent);
```

## 实际应用场景

1. **页面埋点统计**：监听路由变化，上报页面访问数据
2. **权限控制**：根据路由变化检查用户权限
3. **页面标题更新**：根据路由动态更新页面标题
4. **清理操作**：路由切换时清理定时器、取消请求等

最常用的是使用`useLocation` Hook的方式，它简单易用且符合React Hooks的编程范式。
