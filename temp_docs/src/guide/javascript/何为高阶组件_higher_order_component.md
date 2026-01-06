# 何为高阶组件(higher order component) ？（必会）

**题目**: 何为高阶组件(higher order component) ？（必会）

### 标准答案

高阶组件（Higher-Order Component，HOC）是 React 中用于复用组件逻辑的一种高级技巧。HOC 是一个函数，它接受一个组件并返回一个新的组件。HOC 是纯 JavaScript 函数，不依赖于 React 的具体语法，本质上是装饰器模式在 React 中的实现。

HOC 的主要作用是：
1. 逻辑复用：将组件中可复用的逻辑提取到高阶组件中
2. 跨组件功能增强：如权限控制、日志记录、状态管理等
3. 代码解耦：将业务逻辑与 UI 逻辑分离

### 深入理解

高阶组件本质上是一个函数，它接收一个组件作为参数，并返回一个新的组件。这种模式允许我们进行逻辑的复用，而不需要重复编写相同的代码。

HOC 的基本结构如下：
```javascript
// 高阶组件的基本形式
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

#### HOC 的实现示例

1. **属性代理（Props Proxy）模式**：
```jsx
// 示例1：日志记录的 HOC
function withLogging(WrappedComponent) {
  return class extends React.Component {
    componentDidMount() {
      console.log(`Component ${WrappedComponent.name} mounted`);
    }

    componentWillUnmount() {
      console.log(`Component ${WrappedComponent.name} unmounted`);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

// 使用示例
class MyComponent extends React.Component {
  render() {
    return <div>My Component Content</div>;
  }
}

const EnhancedMyComponent = withLogging(MyComponent);
```

2. **反向继承（Inheritance Inversion）模式**：
```jsx
// 示例2：状态增强的 HOC
function withStateEnhancement(WrappedComponent) {
  return class extends WrappedComponent {
    constructor(props) {
      super(props);
      this.state = {
        ...this.state,
        enhanced: true,
        timestamp: Date.now()
      };
    }

    render() {
      return super.render();
    }
  };
}
```

3. **权限控制 HOC**：
```jsx
// 示例3：权限验证 HOC
function withAuth(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isAuthenticated: false,
        checking: true
      };
    }

    componentDidMount() {
      // 模拟权限检查
      setTimeout(() => {
        const user = this.checkAuth();
        this.setState({
          isAuthenticated: user !== null,
          checking: false
        });
      }, 1000);
    }

    checkAuth() {
      // 简单的权限检查逻辑
      return localStorage.getItem('userToken') ? { name: 'user' } : null;
    }

    render() {
      const { checking, isAuthenticated } = this.state;

      if (checking) {
        return <div>Checking authentication...</div>;
      }

      if (!isAuthenticated) {
        return <div>Please log in to access this content.</div>;
      }

      return <WrappedComponent {...this.props} />;
    }
  };
}

// 使用权限控制 HOC
class Dashboard extends React.Component {
  render() {
    return <div>Dashboard Content</div>;
  }
}

const ProtectedDashboard = withAuth(Dashboard);
```

4. **数据获取 HOC**：
```jsx
// 示例4：数据获取 HOC
function withDataFetching(url) {
  return function(WrappedComponent) {
    return class extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          data: null,
          loading: true,
          error: null
        };
      }

      async componentDidMount() {
        try {
          const response = await fetch(url);
          const data = await response.json();
          this.setState({ data, loading: false });
        } catch (error) {
          this.setState({ error, loading: false });
        }
      }

      render() {
        const { data, loading, error } = this.state;
        return (
          <WrappedComponent
            {...this.props}
            data={data}
            loading={loading}
            error={error}
          />
        );
      }
    };
  };
}

// 使用数据获取 HOC
class UserList extends React.Component {
  render() {
    const { data, loading, error } = this.props;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
      <ul>
        {data && data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    );
  }
}

const UserListWithData = withDataFetching('/api/users')(UserList);
```

#### HOC 的优势

1. **逻辑复用**：可以在多个组件间共享相同的逻辑
2. **关注点分离**：将横切关注点（如认证、日志、数据获取）与组件的主要功能分离
3. **可组合性**：可以将多个 HOC 组合使用来创建功能更丰富的组件

#### HOC 的缺点

1. **调试困难**：增加了组件层级，使调试变得复杂
2. **属性命名冲突**：可能会与被包装组件的属性发生冲突
3. **静态方法丢失**：HOC 不会自动复制被包装组件的静态方法
4. **ref 传递问题**：ref 不会自动传递到被包装的组件

#### 现代替代方案

React Hooks 的出现为组件逻辑复用提供了更现代的解决方案：
- 自定义 Hooks 可以实现与 HOC 相同的逻辑复用功能
- 更简洁的语法，更好的可读性
- 避免了 HOC 的一些缺点

```jsx
// 使用自定义 Hook 替代 HOC
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('userToken') ? { name: 'user' } : null;
      setIsAuthenticated(!!user);
      setChecking(false);
    };

    checkAuth();
  }, []);

  return { isAuthenticated, checking };
}

// 在组件中使用
function Dashboard() {
  const { isAuthenticated, checking } = useAuth();

  if (checking) return <div>Checking authentication...</div>;
  if (!isAuthenticated) return <div>Please log in to access this content.</div>;

  return <div>Dashboard Content</div>;
}
```

虽然 Hooks 是更现代的解决方案，但理解 HOC 仍然很重要，因为它们在许多现有代码库中被广泛使用。
