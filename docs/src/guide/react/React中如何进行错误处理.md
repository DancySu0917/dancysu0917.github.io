## 标准答案

React提供了多种错误处理机制，主要包括Error Boundaries（错误边界）、try-catch、Promise错误处理和全局错误处理。Error Boundaries是React 16引入的特性，用于捕获组件树中的JavaScript错误，并显示降级UI而不是让整个应用崩溃。错误边界通过实现static getDerivedStateFromError()和componentDidCatch()生命周期方法来工作。

## 深入理解

React的错误处理机制包含以下几个方面：

### 1. Error Boundaries（错误边界）

错误边界是React组件，能够捕获并处理其子组件树中任何位置的JavaScript错误。它们会拦截错误，防止错误向上传播导致整个应用崩溃。

```javascript
// 错误边界的实现
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    // 当捕获到错误时更新状态
    static getDerivedStateFromError(error) {
        // 更新state以显示降级UI
        return { hasError: true };
    }

    // 在捕获错误后执行副作用操作
    componentDidCatch(error, errorInfo) {
        // 记录错误信息到错误监控服务
        console.error('错误边界捕获到错误:', error);
        console.error('错误信息:', errorInfo);
        
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // 发送错误报告到监控服务
        this.logErrorToService(error, errorInfo);
    }

    logErrorToService = (error, errorInfo) => {
        // 发送到错误监控服务如Sentry、Bugsnag等
        fetch('/api/log-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: error.toString(),
                errorInfo: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
            }),
        });
    }

    render() {
        if (this.state.hasError) {
            // 返回降级UI
            return (
                <div className="error-fallback">
                    <h2>出错了</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
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
            <ComponentThatMightThrow />
        </ErrorBoundary>
    );
}
```

### 2. 函数组件中的错误处理

虽然函数组件不能直接实现错误边界，但可以通过自定义Hook或高阶组件来实现错误处理逻辑：

```javascript
// 使用自定义Hook进行错误处理
import { useState, useEffect } from 'react';

function useErrorBoundary() {
    const [error, setError] = useState(null);
    const [errorInfo, setErrorInfo] = useState(null);

    const resetError = () => {
        setError(null);
        setErrorInfo(null);
    };

    return { error, errorInfo, setError, setErrorInfo, resetError };
}

// 错误处理的高阶组件
function withErrorBoundary(WrappedComponent, FallbackComponent) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { hasError: false };
        }

        static getDerivedStateFromError(error) {
            return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
            console.error('HOC错误边界捕获:', error, errorInfo);
        }

        render() {
            if (this.state.hasError) {
                return <FallbackComponent />;
            }

            return <WrappedComponent {...this.props} />;
        }
    };
}
```

### 3. 异步错误处理

React中的异步错误需要特殊处理，因为它们不会被错误边界捕获：

```javascript
function AsyncErrorHandlingComponent() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // 处理Promise错误
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            // 捕获并处理异步错误
            setError(err.message);
            console.error('数据获取失败:', err);
        } finally {
            setLoading(false);
        }
    };

    // 处理Promise错误的另一种方式
    const handleAsyncOperation = () => {
        someAsyncOperation()
            .then(result => {
                setData(result);
            })
            .catch(err => {
                setError(err.message);
                console.error('异步操作失败:', err);
            });
    };

    if (error) {
        return (
            <div className="error-container">
                <p>发生错误: {error}</p>
                <button onClick={fetchData}>重试</button>
            </div>
        );
    }

    if (loading) {
        return <div>加载中...</div>;
    }

    return (
        <div>
            <button onClick={fetchData}>获取数据</button>
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
}
```

### 4. Context中的错误处理

在Context中处理错误，确保错误信息能够在组件树中正确传播：

```javascript
// 错误上下文
const ErrorContext = React.createContext();

function ErrorProvider({ children }) {
    const [errors, setErrors] = useState([]);

    const addError = useCallback((error) => {
        const errorId = Date.now();
        setErrors(prev => [...prev, { id: errorId, message: error, timestamp: Date.now() }]);
        
        // 自动清除错误（5秒后）
        setTimeout(() => {
            setErrors(prev => prev.filter(err => err.id !== errorId));
        }, 5000);
    }, []);

    const removeError = useCallback((errorId) => {
        setErrors(prev => prev.filter(err => err.id !== errorId));
    }, []);

    return (
        <ErrorContext.Provider value={{ errors, addError, removeError }}>
            {children}
        </ErrorContext.Provider>
    );
}

// 使用错误上下文
function useError() {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within ErrorProvider');
    }
    return context;
}

function ComponentWithErrorHandling() {
    const { addError } = useError();

    const handleOperation = async () => {
        try {
            await someOperation();
        } catch (error) {
            addError(error.message);
        }
    };

    return <button onClick={handleOperation}>执行操作</button>;
}
```

### 5. 全局错误处理

设置全局错误处理来捕获未被其他方式处理的错误：

```javascript
// 全局错误处理
class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidMount() {
        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
        // 捕获未处理的JavaScript错误
        window.addEventListener('error', this.handleError);
    }

    componentWillUnmount() {
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        window.removeEventListener('error', this.handleError);
    }

    handleUnhandledRejection = (event) => {
        console.error('未处理的Promise拒绝:', event.reason);
        this.reportError(event.reason);
    }

    handleError = (event) => {
        console.error('未处理的JavaScript错误:', event.error);
        this.reportError(event.error);
    }

    reportError = (error) => {
        // 发送错误报告到监控服务
        fetch('/api/report-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                url: window.location.href,
                timestamp: new Date().toISOString()
            })
        }).catch(err => {
            console.error('错误报告发送失败:', err);
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="global-error">
                    <h1>应用程序遇到错误</h1>
                    <p>我们已记录此错误，正在努力修复。</p>
                    <button onClick={() => window.location.reload()}>
                        重新加载页面
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
```

### 6. 错误边界的最佳实践

```javascript
// 高级错误边界实现
class AdvancedErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            shouldReset: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
            shouldReset: true
        });

        // 错误分类和上报
        this.logError(error, errorInfo);
    }

    // 根据错误类型决定是否重置状态
    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            shouldReset: false
        });
    }

    // 智能错误上报
    logError = (error, errorInfo) => {
        const errorType = this.determineErrorType(error);
        
        // 根据错误类型采取不同策略
        switch (errorType) {
            case 'network':
                // 网络错误，可能需要重试
                break;
            case 'render':
                // 渲染错误，记录并显示降级UI
                this.reportToService(error, errorInfo);
                break;
            case 'logic':
                // 逻辑错误，详细记录
                this.reportToService(error, errorInfo, true);
                break;
            default:
                this.reportToService(error, errorInfo);
        }
    }

    determineErrorType = (error) => {
        const message = error.message.toLowerCase();
        
        if (message.includes('network') || message.includes('fetch')) {
            return 'network';
        } else if (message.includes('cannot read property') || message.includes('undefined')) {
            return 'logic';
        } else {
            return 'render';
        }
    }

    reportToService = (error, errorInfo, includeFullDetails = false) => {
        const report = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        if (includeFullDetails) {
            report.fullError = error;
        }

        // 发送到错误监控服务
        fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="advanced-error-boundary">
                    <h2>Something went wrong.</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                    <button onClick={this.resetError}>
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
```

React的错误处理机制通过错误边界、异步错误处理、全局错误捕获等多种方式，确保应用程序在出现错误时能够优雅降级，提供良好的用户体验，同时收集错误信息用于问题排查和修复。