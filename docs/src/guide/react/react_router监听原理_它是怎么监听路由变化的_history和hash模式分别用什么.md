# react router监听原理？它是怎么监听路由变化的？history和hash模式分别用什么？（了解）

**题目**: react router监听原理？它是怎么监听路由变化的？history和hash模式分别用什么？（了解）

## 标准答案

React Router通过history库来监听路由变化，主要使用两种模式：

1. **History模式**：使用HTML5的History API（pushState、replaceState、popstate事件）
2. **Hash模式**：使用URL的hash部分（#符号后的部分），通过hashchange事件监听

两种模式都通过监听浏览器的路由变化事件，当路由变化时通知React Router进行组件更新。

## 深入分析

### 1. History API模式
- 使用`pushState()`、`replaceState()`方法修改URL但不触发页面刷新
- 使用`popstate`事件监听浏览器前进后退操作
- 需要服务器配置支持，因为直接访问路由路径时服务器需要返回正确的HTML文件

### 2. Hash模式
- 使用URL的hash部分（#）来模拟路由
- 通过`hashchange`事件监听hash变化
- 不需要服务器配置，兼容性更好

### 3. 监听机制
- React Router创建一个history对象来管理路由状态
- 通过监听浏览器事件来感知路由变化
- 当路由变化时，更新Router组件的state，触发React重新渲染

## 代码实现

```javascript
// 1. History模式的实现原理
class HistoryRouter {
  constructor() {
    this.listeners = [];
    this.history = window.history;
    this.location = this.getCurrentLocation();
    
    // 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', this.handlePopState.bind(this));
    
    // 监听自定义的pushState和replaceState（需要重写这些方法）
    this.patchHistoryMethods();
  }
  
  // 获取当前location对象
  getCurrentLocation() {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: window.history.state
    };
  }
  
  // 处理popstate事件
  handlePopState(event) {
    const newLocation = this.getCurrentLocation();
    this.notifyListeners(newLocation, event.state);
  }
  
  // 重写history方法以监听路由变化
  patchHistoryMethods() {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    // 重写pushState
    window.history.pushState = (...args) => {
      const result = originalPushState.apply(window.history, args);
      this.notifyListeners(this.getCurrentLocation(), args[2]);
      return result;
    };
    
    // 重写replaceState
    window.history.replaceState = (...args) => {
      const result = originalReplaceState.apply(window.history, args);
      this.notifyListeners(this.getCurrentLocation(), args[2]);
      return result;
    };
  }
  
  // 通知监听器
  notifyListeners(location, state) {
    this.listeners.forEach(listener => {
      listener(location, state);
    });
  }
  
  // 添加监听器
  listen(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // 导航方法
  push(path, state) {
    window.history.pushState(state, null, path);
    this.notifyListeners(this.getCurrentLocation(), state);
  }
  
  replace(path, state) {
    window.history.replaceState(state, null, path);
    this.notifyListeners(this.getCurrentLocation(), state);
  }
  
  go(n) {
    window.history.go(n);
  }
  
  back() {
    window.history.back();
  }
  
  forward() {
    window.history.forward();
  }
}

// 2. Hash模式的实现原理
class HashRouter {
  constructor() {
    this.listeners = [];
    this.location = this.getCurrentLocation();
    
    // 监听hashchange事件
    window.addEventListener('hashchange', this.handleHashChange.bind(this));
    
    // 初始化时也要触发一次
    setTimeout(() => {
      this.notifyListeners(this.location);
    }, 0);
  }
  
  // 获取当前hash location
  getCurrentLocation() {
    const hash = window.location.hash.slice(1) || '/';
    const [pathname, search = ''] = hash.split('?');
    const [path, hashValue = ''] = pathname.split('#');
    
    return {
      pathname: path,
      search: search ? '?' + search : '',
      hash: hashValue ? '#' + hashValue : ''
    };
  }
  
  // 处理hashchange事件
  handleHashChange(event) {
    const newLocation = this.getCurrentLocation();
    this.notifyListeners(newLocation);
  }
  
  // 通知监听器
  notifyListeners(location) {
    this.listeners.forEach(listener => {
      listener(location);
    });
  }
  
  // 添加监听器
  listen(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // 导航方法
  push(path) {
    window.location.hash = path;
  }
  
  replace(path) {
    window.location.replace(window.location.pathname + window.location.search + '#' + path);
  }
}

// 3. React Router核心组件实现
import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建路由上下文
const RouterContext = createContext();

// Router组件
export function Router({ children, history }) {
  const [location, setLocation] = useState(history.location);
  
  useEffect(() => {
    // 监听路由变化
    const unlisten = history.listen((newLocation) => {
      setLocation(newLocation);
    });
    
    return unlisten;
  }, [history]);
  
  const contextValue = {
    history,
    location
  };
  
  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
}

// Route组件
export function Route({ path, component: Component, exact = false }) {
  const { location } = useContext(RouterContext);
  
  // 简单的路径匹配
  const match = exact 
    ? location.pathname === path 
    : location.pathname.startsWith(path);
  
  return match ? <Component /> : null;
}

// Link组件
export function Link({ to, children, ...props }) {
  const { history } = useContext(RouterContext);
  
  const handleClick = (event) => {
    event.preventDefault();
    history.push(to);
  };
  
  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

// 4. 实际使用示例
function App() {
  // 创建history实例（这里使用MemoryHistory作为示例）
  const history = {
    location: { pathname: window.location.pathname },
    listen: (listener) => {
      // 在实际应用中，这里会使用真正的history对象
      const unlisten = window.addEventListener('popstate', () => {
        listener({ pathname: window.location.pathname });
      });
      return () => window.removeEventListener('popstate', unlisten);
    },
    push: (path) => window.history.pushState({}, '', path)
  };
  
  return (
    <Router history={history}>
      <div>
        <nav>
          <Link to="/">首页</Link>
          <Link to="/about">关于</Link>
          <Link to="/contact">联系</Link>
        </nav>
        <main>
          <Route path="/" component={() => <h1>首页</h1>} exact />
          <Route path="/about" component={() => <h1>关于</h1>} />
          <Route path="/contact" component={() => <h1>联系</h1>} />
        </main>
      </div>
    </Router>
  );
}

// 5. History模式和Hash模式的对比
const RouterComparison = {
  history: {
    advantages: [
      'URL更美观，没有#符号',
      '更符合RESTful API风格',
      '支持更多路由功能（如query参数）'
    ],
    disadvantages: [
      '需要服务器配置支持',
      'SEO友好（但需要额外配置）',
      '某些旧浏览器可能不支持'
    ],
    useCase: '现代Web应用，需要SEO优化的场景'
  },
  hash: {
    advantages: [
      '兼容性好，不需要服务器配置',
      '实现简单，适合快速开发',
      '可以处理大部分路由需求'
    ],
    disadvantages: [
      'URL中包含#符号，不够美观',
      'SEO效果相对较差',
      'URL长度受限制'
    ],
    useCase: '快速原型开发，兼容旧浏览器的场景'
  }
};

console.log('React Router模式对比:', RouterComparison);

// 6. 自定义history对象的创建
function createBrowserHistory() {
  return {
    location: {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    },
    listen(callback) {
      const handlePopState = () => {
        callback({
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
        });
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    },
    push(path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    },
    replace(path) {
      window.history.replaceState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };
}

function createHashHistory() {
  return {
    location: {
      pathname: window.location.hash.replace(/^#/, '') || '/',
      search: '',
      hash: window.location.hash,
    },
    listen(callback) {
      const handleHashChange = () => {
        callback({
          pathname: window.location.hash.replace(/^#/, '') || '/',
          search: '',
          hash: window.location.hash,
        });
      };
      
      window.addEventListener('hashchange', handleHashChange);
      
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    },
    push(path) {
      window.location.hash = path;
    },
    replace(path) {
      window.location.replace(window.location.pathname + window.location.search + '#' + path);
    }
  };
}
```

## 实际应用场景

1. **单页应用(SPA)**：在不刷新页面的情况下实现页面切换
2. **移动端Web应用**：提供原生应用般的导航体验
3. **渐进式Web应用(PWA)**：结合Service Worker实现离线路由
4. **微前端架构**：在不同子应用间实现路由协调

通过React Router的监听机制，开发者可以创建流畅的单页应用体验，同时保持URL与应用状态的同步。
