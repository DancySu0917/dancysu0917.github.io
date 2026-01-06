## 标准答案

React Context是一种跨层级组件传递数据的机制，它允许在组件树中共享值，而无需手动地通过props一层层传递。Context由三个核心部分组成：React.createContext()创建Context对象、Context.Provider提供数据、Context.Consumer消费数据。在函数组件中，通常使用useContext Hook来消费Context值。Context主要用于共享那些对于一个组件树而言是"全局"的数据，如当前认证的用户、主题或语言设置等。

## 深入理解

React Context是一个强大的状态共享机制，其工作原理和使用方式包含多个层面：

### 1. Context的基本工作原理

```javascript
import React, { createContext, useContext, useState } from 'react';

// 1. 创建Context对象
const ThemeContext = createContext();

// 2. Provider组件 - 提供数据
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    const value = {
        theme,
        toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// 3. Consumer组件 - 消费数据
function ThemedButton() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    
    return (
        <button 
            style={{ 
                backgroundColor: theme === 'light' ? '#fff' : '#333',
                color: theme === 'light' ? '#000' : '#fff'
            }}
            onClick={toggleTheme}
        >
            当前主题: {theme}
        </button>
    );
}

// 使用Context
function App() {
    return (
        <ThemeProvider>
            <ThemedButton />
        </ThemeProvider>
    );
}
```

### 2. Context的内部实现机制

```javascript
// 模拟React Context的工作原理
function createCustomContext(defaultValue) {
    const context = {
        _currentValue: defaultValue,
        _subscribers: [],
        
        Provider: function({ value, children }) {
            // 当Provider的value改变时，通知所有订阅者
            context._currentValue = value;
            
            // 模拟订阅机制
            const subscribers = context._subscribers;
            subscribers.forEach(subscriber => {
                subscriber(value);
            });
            
            return children;
        },
        
        Consumer: function({ children }) {
            // 消费当前值
            return children(context._currentValue);
        }
    };
    
    return context;
}
```

### 3. 多个Context的使用

```javascript
import React, { createContext, useContext } from 'react';

// 创建多个Context
const UserContext = createContext();
const ThemeContext = createContext();
const LocaleContext = createContext();

// 组合多个Provider
function AppProviders({ children }) {
    return (
        <UserContext.Provider value={{ user: { name: 'John', id: 1 } }}>
            <ThemeContext.Provider value={{ theme: 'dark' }}>
                <LocaleContext.Provider value={{ locale: 'zh-CN' }}>
                    {children}
                </LocaleContext.Provider>
            </ThemeContext.Provider>
        </UserContext.Provider>
    );
}

// 在组件中使用多个Context
function UserProfile() {
    const { user } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const { locale } = useContext(LocaleContext);

    return (
        <div className={`profile theme-${theme} locale-${locale}`}>
            <h2>{user.name}</h2>
            <p>Theme: {theme}</p>
            <p>Locale: {locale}</p>
        </div>
    );
}

function App() {
    return (
        <AppProviders>
            <UserProfile />
        </AppProviders>
    );
}
```

### 4. Context与性能优化

```javascript
import React, { createContext, useContext, useMemo, useState } from 'react';

const OptimizedContext = createContext();

// 性能优化的Provider
function OptimizedProvider({ children }) {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState({});

    // 使用useMemo优化value对象，避免不必要的重渲染
    const contextValue = useMemo(() => ({
        user,
        updateUser: setUser,
        settings,
        updateSettings: setSettings
    }), [user, settings]);

    return (
        <OptimizedContext.Provider value={contextValue}>
            {children}
        </OptimizedContext.Provider>
    );
}

// 避免Context导致的不必要重渲染
function ExpensiveComponent() {
    const { user } = useContext(OptimizedContext);
    
    // 只有当user改变时才重新渲染
    console.log('ExpensiveComponent渲染');
    
    return <div>{user?.name}</div>;
}
```

### 5. Context的更新机制

```javascript
import React, { createContext, useContext, useState, useCallback } from 'react';

const DataContext = createContext();

function DataProvider({ children }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 使用useCallback优化更新函数
    const updateData = useCallback((newData) => {
        setData(newData);
    }, []);

    const addItem = useCallback((item) => {
        setData(prev => [...prev, item]);
    }, []);

    const removeItem = useCallback((id) => {
        setData(prev => prev.filter(item => item.id !== id));
    }, []);

    const contextValue = {
        data,
        loading,
        setLoading,
        updateData,
        addItem,
        removeItem
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
}

// Context更新如何触发重渲染
function DataConsumer() {
    const { data, addItem, loading } = useContext(DataContext);

    const handleAdd = () => {
        addItem({ id: Date.now(), name: `Item ${Date.now()}` });
    };

    // 当data改变时，组件会重新渲染
    return (
        <div>
            <button onClick={handleAdd} disabled={loading}>
                添加项目
            </button>
            <ul>
                {data.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
}
```

### 6. Context的错误处理和默认值

```javascript
import React, { createContext, useContext } from 'react';

// 创建带有默认值的Context
const AuthContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false
});

// 自定义Hook包装Context，提供更好的错误处理
function useAuth() {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
}

function AuthProvider({ children, value }) {
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// 在组件中安全使用Context
function ProtectedComponent() {
    try {
        const { user, isAuthenticated } = useAuth();
        
        if (!isAuthenticated) {
            return <div>请先登录</div>;
        }
        
        return <div>欢迎, {user.name}!</div>;
    } catch (error) {
        console.error('Context使用错误:', error.message);
        return <div>Context配置错误</div>;
    }
}
```

### 7. Context的高级用法

```javascript
import React, { createContext, useContext, useReducer } from 'react';

// 使用useReducer与Context结合
const AppReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

const AppStateContext = createContext();
const AppDispatchContext = createContext();

function AppProvider({ children }) {
    const [state, dispatch] = useReducer(AppReducer, {
        user: null,
        theme: 'light',
        loading: false
    });

    return (
        <AppStateContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                {children}
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    );
}

// 自定义Hook分别获取state和dispatch
function useAppState() {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within AppProvider');
    }
    return context;
}

function useAppDispatch() {
    const context = useContext(AppDispatchContext);
    if (context === undefined) {
        throw new Error('useAppDispatch must be used within AppProvider');
    }
    return context;
}

// 使用分离的Context
function UserProfile() {
    const { user, loading } = useAppState();
    const dispatch = useAppDispatch();

    const updateUser = (userData) => {
        dispatch({ type: 'SET_USER', payload: userData });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>{user?.name || '未登录'}</h2>
            <button onClick={() => updateUser({ name: 'New User', id: 1 })}>
                更新用户
            </button>
        </div>
    );
}
```

### 8. Context性能问题和解决方案

```javascript
import React, { createContext, useContext, useState, useMemo, memo } from 'react';

// 问题：Context值改变导致所有消费者重渲染
const ProblematicContext = createContext();

function ProblematicProvider({ children }) {
    const [count, setCount] = useState(0);
    const [user, setUser] = useState({ name: 'John' });

    // 每次渲染都创建新对象，导致不必要的重渲染
    return (
        <ProblematicContext.Provider value={{ count, setCount, user, setUser }}>
            {children}
        </ProblematicContext.Provider>
    );
}

// 解决方案：分离Context或使用useMemo
const CountContext = createContext();
const UserContext = createContext();

function SolutionProvider({ children }) {
    const [count, setCount] = useState(0);
    const [user, setUser] = useState({ name: 'John' });

    const countValue = useMemo(() => ({ count, setCount }), [count]);
    const userValue = useMemo(() => ({ user, setUser }), [user]);

    return (
        <CountContext.Provider value={countValue}>
            <UserContext.Provider value={userValue}>
                {children}
            </UserContext.Provider>
        </CountContext.Provider>
    );
}

// 只有相关数据改变时才重渲染
const CountDisplay = memo(() => {
    const { count } = useContext(CountContext);
    console.log('CountDisplay渲染');
    return <div>Count: {count}</div>;
});

const UserDisplay = memo(() => {
    const { user } = useContext(UserContext);
    console.log('UserDisplay渲染');
    return <div>User: {user.name}</div>;
});
```

### 9. Context与其他状态管理的比较

```javascript
// Context vs Props drilling
// ❌ Props drilling - 通过多层组件传递数据
function BadExample() {
    return (
        <Level1 data="important data" />
    );
}

function Level1({ data }) {
    return <Level2 data={data} />;
}

function Level2({ data }) {
    return <Level3 data={data} />;
}

function Level3({ data }) {
    return <div>{data}</div>; // 实际使用数据的组件
}

// ✅ 使用Context避免Props drilling
const DataContext = createContext();

function GoodExample() {
    return (
        <DataContext.Provider value="important data">
            <Level1 />
        </DataContext.Provider>
    );
}

function Level1() {
    return <Level2 />;
}

function Level2() {
    return <Level3 />;
}

function Level3() {
    const data = useContext(DataContext);
    return <div>{data}</div>;
}
```

React Context通过创建一个数据传递的"通道"，使得组件可以跨越层级直接访问所需的数据。它的核心机制是基于发布-订阅模式，当Provider的value改变时，会通知所有使用该Context的消费者组件进行更新。合理使用Context可以有效解决props drilling问题，但需要注意性能影响，避免将频繁变化的数据放在Context中导致不必要的重渲染。