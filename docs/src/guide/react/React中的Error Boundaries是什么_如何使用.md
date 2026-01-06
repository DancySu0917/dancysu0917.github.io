## 标准答案

React Error Boundaries（错误边界）是React 16引入的错误处理机制，它是一个React组件，能够捕获并处理其子组件树中任何位置的JavaScript错误，记录错误信息，并显示降级UI而不是让整个应用崩溃。错误边界通过实现`static getDerivedStateFromError()`和`componentDidCatch()`这两个生命周期方法来工作。错误边界只能捕获组件树中的错误，不能捕获事件处理器、异步代码、服务端渲染或错误边界本身中的错误。

## 深入理解

React Error Boundaries是React应用中重要的错误处理机制，它提供了优雅的错误处理方式：

### 1. Error Boundaries基本实现

```javascript
import React from 'react';

// 错误边界的完整实现
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null 
        };
    }

    // 在渲染阶段捕获错误，返回要显示的降级状态
    static getDerivedStateFromError(error) {
        // 更新state以显示降级UI
        return { hasError: true };
    }

    // 在捕获错误后执行副作用操作
    componentDidCatch(error, errorInfo) {
        // 记录错误信息
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // 发送错误信息到错误监控服务
        this.logErrorToService(error, errorInfo);
    }

    logErrorToService = (error, errorInfo) => {
        // 发送错误到监控服务，如Sentry、Bugsnag等
        console.error('错误边界捕获到错误:', error);
        console.error('错误信息:', errorInfo);
        
        // 模拟发送错误到服务器
        fetch('/api/log-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }),
        }).catch(err => {
            console.error('错误上报失败:', err);
        });
    }

    // 重置错误状态
    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    }

    render() {
        if (this.state.hasError) {
            // 返回降级UI
            return (
                <div className="error-boundary">
                    <h2>出错了</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                    <button onClick={this.resetError}>
                        重试
                    </button>
                </div>
            );
        }

        // 正常渲染子组件
        return this.props.children;
    }
}

// 使用错误边界
function App() {
    return (
        <ErrorBoundary>
            <MyWidget />
        </ErrorBoundary>
    );
}
```

### 2. Error Boundaries的限制和注意事项

```javascript
import React, { Component } from 'react';

// 错误边界无法捕获的错误类型
class LimitationsExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    // ❌ 错误边界无法捕获事件处理器中的错误
    handleClick = () => {
        // 这个错误不会被错误边界捕获
        throw new Error('事件处理器错误');
    }

    // ❌ 错误边界无法捕获异步代码中的错误
    handleAsyncError = () => {
        setTimeout(() => {
            // 这个错误不会被错误边界捕获
            throw new Error('异步错误');
        }, 1000);
    }

    // ❌ 错误边界无法捕获服务端渲染中的错误
    // ❌ 错误边界无法捕获自身内部的错误

    render() {
        return (
            <div>
                <button onClick={this.handleClick}>触发事件错误</button>
                <button onClick={this.handleAsyncError}>触发异步错误</button>
            </div>
        );
    }
}

// 正确的错误边界实现示例
class ProperErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('捕获到错误:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
```

### 3. 高级错误边界模式

```javascript
import React, { Component } from 'react';

// 高级错误边界实现
class AdvancedErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
            lastErrorTime: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const newState = {
            hasError: true,
            error: error,
            errorInfo: errorInfo,
            errorCount: this.state.errorCount + 1,
            lastErrorTime: new Date().toISOString()
        };

        this.setState(newState);

        // 根据错误类型进行不同处理
        this.handleSpecificError(error, errorInfo);
    }

    // 根据错误类型进行特殊处理
    handleSpecificError = (error, errorInfo) => {
        const errorMessage = error.message.toLowerCase();

        // 网络错误
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            this.handleNetworkError(error, errorInfo);
        }
        // 内存错误
        else if (errorMessage.includes('memory') || errorMessage.includes('out of heap')) {
            this.handleMemoryError(error, errorInfo);
        }
        // 其他错误
        else {
            this.handleGenericError(error, errorInfo);
        }
    }

    handleNetworkError = (error, errorInfo) => {
        console.error('网络错误:', error);
        // 可能需要重试逻辑
    }

    handleMemoryError = (error, errorInfo) => {
        console.error('内存错误:', error);
        // 可能需要清理内存或提示用户
    }

    handleGenericError = (error, errorInfo) => {
        console.error('一般错误:', error);
        // 通用错误处理逻辑
        this.reportError(error, errorInfo);
    }

    // 错误上报
    reportError = (error, errorInfo) => {
        const errorReport = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            errorCount: this.state.errorCount,
            lastErrorTime: this.state.lastErrorTime,
            timestamp: new Date().toISOString()
        };

        // 发送到错误监控服务
        this.sendErrorReport(errorReport);
    }

    sendErrorReport = async (errorReport) => {
        try {
            await fetch('/api/error-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorReport),
            });
        } catch (err) {
            console.error('错误上报失败:', err);
        }
    }

    // 重置错误状态
    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    }

    // 智能重试
    smartRetry = async () => {
        // 清除错误状态
        this.setState({ hasError: false });
        
        // 延迟重试
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 重新渲染组件
        this.forceUpdate();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="advanced-error-boundary">
                    <h2>应用遇到错误</h2>
                    <p>错误信息: {this.state.error?.message}</p>
                    <p>错误次数: {this.state.errorCount}</p>
                    <p>最后错误时间: {this.state.lastErrorTime}</p>
                    
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>错误详情</summary>
                        {this.state.error?.stack}
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </details>
                    
                    <div className="error-actions">
                        <button onClick={this.resetError}>重试</button>
                        <button onClick={this.smartRetry}>智能重试</button>
                        <button onClick={() => window.location.reload()}>刷新页面</button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
```

### 4. 函数组件中的错误处理

```javascript
import React, { useState, useEffect, createContext, useContext } from 'react';

// 使用Context实现错误处理
const ErrorBoundaryContext = createContext();

// 错误边界上下文提供者
function ErrorBoundaryProvider({ children }) {
    const [error, setError] = useState(null);
    const [errorInfo, setErrorInfo] = useState(null);

    const resetError = () => {
        setError(null);
        setErrorInfo(null);
    };

    const value = {
        error,
        errorInfo,
        setError,
        setErrorInfo,
        resetError
    };

    return (
        <ErrorBoundaryContext.Provider value={value}>
            {children}
        </ErrorBoundaryContext.Provider>
    );
}

// 自定义错误处理Hook
function useErrorBoundary() {
    const context = useContext(ErrorBoundaryContext);
    if (!context) {
        throw new Error('useErrorBoundary must be used within ErrorBoundaryProvider');
    }
    return context;
}

// 错误显示组件
function ErrorDisplay() {
    const { error, errorInfo, resetError } = useErrorBoundary();

    if (!error) return null;

    return (
        <div className="error-display">
            <h2>出错了!</h2>
            <details>
                <summary>错误详情</summary>
                <p>{error.message}</p>
                <pre>{error.stack}</pre>
                {errorInfo && <pre>{errorInfo.componentStack}</pre>}
            </details>
            <button onClick={resetError}>重试</button>
        </div>
    );
}

// 使用错误边界的组件
function ErrorHandlingComponent() {
    const [data, setData] = useState(null);
    const { setError, setErrorInfo } = useErrorBoundary();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 模拟数据获取
                const response = await fetch('/api/data');
                if (!response.ok) {
                    throw new Error('数据获取失败');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                // 使用Context处理错误
                setError(err);
                setErrorInfo({ componentStack: 'ErrorHandlingComponent' });
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <ErrorDisplay />;
    }

    return <div>{/* 正常渲染逻辑 */}</div>;
}
```

### 5. 高阶组件形式的错误边界

```javascript
import React, { Component } from 'react';

// 高阶组件形式的错误边界
function withErrorBoundary(WrappedComponent, FallbackComponent) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false, error: null, errorInfo: null };
        }

        static getDerivedStateFromError(error) {
            return { hasError: true, error };
        }

        componentDidCatch(error, errorInfo) {
            this.setState({ errorInfo });

            // 发送错误到监控服务
            console.error('HOC错误边界捕获:', error, errorInfo);
            
            // 可以在这里添加错误上报逻辑
            this.reportError(error, errorInfo);
        }

        reportError = (error, errorInfo) => {
            fetch('/api/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    component: WrappedComponent.name,
                    error: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack
                })
            }).catch(err => {
                console.error('错误上报失败:', err);
            });
        }

        resetError = () => {
            this.setState({ hasError: false, error: null, errorInfo: null });
        }

        render() {
            if (this.state.hasError) {
                // 如果没有提供降级组件，使用默认的
                if (typeof FallbackComponent === 'function') {
                    return <FallbackComponent 
                        error={this.state.error} 
                        errorInfo={this.state.errorInfo}
                        resetError={this.resetError}
                    />;
                }
                
                return (
                    <div className="default-fallback">
                        <h2>Something went wrong.</h2>
                        <button onClick={this.resetError}>Try again</button>
                    </div>
                );
            }

            return <WrappedComponent {...this.props} />;
        }
    };
}

// 使用HOC包装组件
const MyComponentWithErrorBoundary = withErrorBoundary(MyComponent, ({ error, resetError }) => (
    <div className="custom-fallback">
        <h2>自定义错误界面</h2>
        <p>错误信息: {error?.message}</p>
        <button onClick={resetError}>重试</button>
    </div>
));
```

### 6. 多层错误边界的处理

```javascript
import React, { Component } from 'react';

// 应用级别的错误边界
class AppErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('应用级错误边界捕获:', error, errorInfo);
        // 上报到全局错误监控
        this.reportToGlobalErrorService(error, errorInfo);
    }

    reportToGlobalErrorService = (error, errorInfo) => {
        // 发送到全局错误监控服务
        if (window.Sentry) {
            window.Sentry.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack
                    }
                }
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="app-error-boundary">
                    <h1>应用遇到严重错误</h1>
                    <p>我们正在修复此问题，请稍后再试。</p>
                    <button onClick={() => window.location.reload()}>
                        刷新页面
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// 组件级别的错误边界
class ComponentErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('组件级错误边界捕获:', error, errorInfo);
        // 只记录，不向上抛出
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="component-error-boundary">
                    <p>组件加载失败</p>
                    <button onClick={() => this.setState({ hasError: false })}>
                        重试
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// 嵌套使用错误边界
function App() {
    return (
        <AppErrorBoundary> {/* 应用级错误边界 */}
            <header>头部</header>
            <main>
                <ComponentErrorBoundary> {/* 组件级错误边界 */}
                    <UserProfile />
                </ComponentErrorBoundary>
                
                <ComponentErrorBoundary> {/* 组件级错误边界 */}
                    <DataList />
                </ComponentErrorBoundary>
            </main>
            <footer>底部</footer>
        </AppErrorBoundary>
    );
}
```

### 7. 错误边界与状态管理的结合

```javascript
import React, { Component } from 'react';

// 与Redux或Context结合的错误边界
class StatefulErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            timestamp: null 
        };
    }

    static getDerivedStateFromError(error) {
        return { 
            hasError: true, 
            error,
            timestamp: new Date().toISOString()
        };
    }

    componentDidCatch(error, errorInfo) {
        // 更新全局状态
        if (this.props.onError) {
            this.props.onError({
                error,
                errorInfo,
                timestamp: this.state.timestamp
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="stateful-error-boundary">
                    <h2>错误发生</h2>
                    <p>时间: {this.state.timestamp}</p>
                    {this.props.children}
                </div>
            );
        }

        return this.props.children;
    }
}

// 使用示例
function AppWithGlobalErrorHandling() {
    const [globalError, setGlobalError] = useState(null);

    const handleGlobalError = (errorData) => {
        setGlobalError(errorData);
        // 可以将错误信息存储到全局状态中
        // 或者发送到错误监控服务
    };

    return (
        <StatefulErrorBoundary 
            onError={handleGlobalError}
            fallback={
                <div>
                    <h2>应用遇到错误</h2>
                    <button onClick={() => setGlobalError(null)}>
                        关闭错误提示
                    </button>
                </div>
            }
        >
            <MainApp />
        </StatefulErrorBoundary>
    );
}
```

React Error Boundaries是React应用中处理JavaScript运行时错误的重要机制。它们提供了一种优雅的方式来处理组件树中的错误，防止整个应用崩溃，并向用户提供友好的错误界面。正确使用错误边界可以显著提高应用的健壮性和用户体验，但需要注意它们的限制和适用范围。