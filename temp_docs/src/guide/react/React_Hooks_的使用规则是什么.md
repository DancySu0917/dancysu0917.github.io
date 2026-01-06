### 标准答案

React Hooks的使用规则主要有：
1. **只能在函数组件中使用** - 不能在类组件中使用
2. **只能在顶层调用** - 不能在条件语句、循环或嵌套函数中调用
3. **只能在React函数中调用** - 不能在普通JavaScript函数中调用
4. **自定义Hook必须以use开头** - 便于ESLint规则检测
5. **依赖数组必须完整** - useEffect等需要正确声明依赖
6. **遵循Hook的调用顺序** - 保证Hook状态的一致性

### 深入理解

React Hooks是React 16.8引入的重要特性，它允许我们在函数组件中使用状态和其他React特性。为了确保Hooks的正确工作，React制定了严格的使用规则：

#### 1. 只能在函数组件中使用

Hooks只能在React函数组件中使用，不能在类组件中使用：

```javascript
// ✅ 正确 - 在函数组件中使用
function MyComponent() {
    const [count, setCount] = useState(0);
    
    return <div>{count}</div>;
}

// ❌ 错误 - 在类组件中使用
class MyComponent extends React.Component {
    // 不能使用useState等Hooks
    render() {
        // 这里无法使用React Hooks
        return <div>Class Component</div>;
    }
}
```

#### 2. 只能在顶层调用（Top Level Only）

Hooks必须在函数组件的顶层调用，不能在条件语句、循环或嵌套函数中调用：

```javascript
// ✅ 正确 - 在顶层调用
function MyComponent({ showUser }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    
    return showUser ? <User user={user} /> : <div>Not showing user</div>;
}

// ❌ 错误 - 在条件语句中使用
function MyComponent({ showUser }) {
    if (showUser) {
        const [user, setUser] = useState(null); // 这是错误的
    }
    
    return showUser ? <User user={user} /> : <div>Not showing user</div>;
}

// ❌ 错误 - 在循环中使用
function MyComponent() {
    const items = [1, 2, 3];
    
    for (let i = 0; i < items.length; i++) {
        const [item, setItem] = useState(items[i]); // 这是错误的
    }
    
    return <div>Items</div>;
}

// ❌ 错误 - 在嵌套函数中使用
function MyComponent() {
    function handleClick() {
        const [state, setState] = useState(0); // 这是错误的
    }
    
    return <button onClick={handleClick}>Click me</button>;
}

// ✅ 正确的条件逻辑处理
function MyComponent({ showUser }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // 条件逻辑在渲染阶段处理
    if (showUser) {
        return <User user={user} />;
    }
    
    return <div>Not showing user</div>;
}
```

#### 3. 只能在React函数中调用

Hooks只能在React函数组件或自定义Hook中调用，不能在普通JavaScript函数中调用：

```javascript
// ✅ 正确 - 在自定义Hook中使用
function useFriendStatus(friendId) {
    const [isOnline, setIsOnline] = useState(null);
    
    // ...
    
    return isOnline;
}

// ✅ 正确 - 在函数组件中使用
function FriendStatus({ friendId }) {
    const isOnline = useFriendStatus(friendId);
    
    return <div>{isOnline ? 'Online' : 'Offline'}</div>;
}

// ❌ 错误 - 在普通JavaScript函数中使用
function calculateStatus(friendId) {
    const [status, setStatus] = useState(''); // 这是错误的
    return status;
}
```

#### 4. 自定义Hook必须以use开头

自定义Hook必须以`use`前缀开头，这样ESLint插件才能正确识别并应用Hook规则：

```javascript
// ✅ 正确 - 以use开头
function useUser(initialUser) {
    const [user, setUser] = useState(initialUser);
    
    const updateUser = useCallback((newUser) => {
        setUser(newUser);
    }, []);
    
    return [user, updateUser];
}

// ❌ 错误 - 没有以use开头
function userHook(initialUser) {  // ESLint会报错
    const [user, setUser] = useState(initialUser);
    return [user, setUser];
}

// 使用自定义Hook
function UserProfile() {
    const [user, updateUser] = useUser({ name: 'John' });
    
    return (
        <div>
            <p>{user.name}</p>
            <button onClick={() => updateUser({ name: 'Jane' })}>
                Update User
            </button>
        </div>
    );
}
```

#### 5. 依赖数组必须完整

useEffect、useCallback、useMemo等Hooks的依赖数组必须包含所有依赖项：

```javascript
// ❌ 错误 - 依赖数组不完整
function Component({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        fetchUser(userId).then(setUser); // userId没有在依赖数组中
    }, []); // 缺少userId依赖
    
    return <div>{user?.name}</div>;
}

// ✅ 正确 - 依赖数组完整
function Component({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        fetchUser(userId).then(setUser);
    }, [userId]); // 包含所有依赖
    
    return <div>{user?.name}</div>;
}

// ❌ 错误 - 函数作为依赖但没有正确声明
function Component({ userId }) {
    const fetchUserData = () => {
        return fetch(`/api/users/${userId}`);
    };
    
    useEffect(() => {
        fetchUserData().then(response => response.json()).then(setUser);
    }, []); // fetchUserData函数应该在依赖数组中
    
    const [user, setUser] = useState(null);
    
    return <div>{user?.name}</div>;
}

// ✅ 正确 - 使用useCallback包装函数依赖
function Component({ userId }) {
    const [user, setUser] = useState(null);
    
    const fetchUserData = useCallback(() => {
        return fetch(`/api/users/${userId}`);
    }, [userId]); // fetchUserData依赖userId
    
    useEffect(() => {
        fetchUserData().then(response => response.json()).then(setUser);
    }, [fetchUserData]); // 现在可以将fetchUserData作为依赖
    
    return <div>{user?.name}</div>;
}

// 或者直接在useEffect内部定义函数
function Component({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        const fetchUserData = () => {
            return fetch(`/api/users/${userId}`); // 在useEffect内部定义
        };
        
        fetchUserData().then(response => response.json()).then(setUser);
    }, [userId]); // 只需要依赖userId
    
    return <div>{user?.name}</div>;
}
```

#### 6. 遵循Hook的调用顺序

React依赖于Hook调用的顺序来正确维护组件状态，因此不能改变Hook的调用顺序：

```javascript
// ❌ 错误 - Hook调用顺序可能改变
function BadComponent({ showUser }) {
    if (showUser) {
        const [user, setUser] = useState(null); // 第1个Hook（有时）
        const [loading, setLoading] = useState(false); // 第2个Hook（有时）
    }
    
    const [theme, setTheme] = useState('light'); // 总是第1个或第3个Hook
    
    return <div>Component</div>;
}

// ✅ 正确 - Hook调用顺序保持一致
function GoodComponent({ showUser }) {
    const [user, setUser] = useState(null); // 总是第1个Hook
    const [loading, setLoading] = useState(false); // 总是第2个Hook
    const [theme, setTheme] = useState('light'); // 总是第3个Hook
    
    if (showUser) {
        // 条件逻辑在渲染阶段处理
        return <User user={user} loading={loading} />;
    }
    
    return <div>Not showing user</div>;
}
```

#### 7. ESLint规则帮助

React提供了一个ESLint插件来帮助检测Hook使用规则：

```javascript
// 安装ESLint插件
// npm install eslint-plugin-react-hooks --save-dev

// .eslintrc.js
module.exports = {
    plugins: [
        'react-hooks'
    ],
    rules: {
        'react-hooks/rules-of-hooks': 'error', // 检查Hook规则
        'react-hooks/exhaustive-deps': 'warn' // 检查依赖完整性
    }
};
```

#### 8. 常见陷阱和解决方案

```javascript
// 问题：函数组件中的函数依赖
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    // ❌ 可能的问题：函数中使用了外部变量
    const fetchUser = () => {
        return fetch(`/api/users/${userId}`) // userId是依赖
            .then(response => response.json())
            .then(userData => {
                setUser(userData);
                logUserAction(userId, 'fetch'); // userId也是依赖
            });
    };
    
    useEffect(() => {
        fetchUser();
    }, [fetchUser]); // 这样可能导致无限循环
    
    return <div>{user?.name}</div>;
}

// ✅ 解决方案：使用useCallback或在useEffect内部定义
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        const fetchUser = () => {
            return fetch(`/api/users/${userId}`)
                .then(response => response.json())
                .then(userData => {
                    setUser(userData);
                    logUserAction(userId, 'fetch');
                });
        };
        
        fetchUser();
    }, [userId]); // 只依赖userId
    
    return <div>{user?.name}</div>;
}

// 或者使用useCallback包装函数
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    const fetchUser = useCallback(() => {
        return fetch(`/api/users/${userId}`)
            .then(response => response.json())
            .then(userData => {
                setUser(userData);
                logUserAction(userId, 'fetch');
            });
    }, [userId]);
    
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);
    
    return <div>{user?.name}</div>;
}
```

遵循这些规则可以确保React Hooks的正确使用，避免状态混乱和难以调试的问题。React的ESLint插件会自动检测大部分违反规则的情况，帮助开发者及时发现并修复问题。