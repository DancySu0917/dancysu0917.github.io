## 标准答案

React Portal是React提供的一个功能，允许将子节点渲染到存在于父组件DOM层次结构之外的DOM节点中。通过React.createPortal(child, container)方法创建Portal，其中child是要渲染的React元素，container是要渲染到的DOM节点。Portal的主要用途包括：创建全局模态框、弹出窗口、工具提示等需要脱离当前组件层级的UI组件，以及处理样式隔离和z-index问题。

## 深入理解

React Portal是React DOM的一个重要特性，它解决了组件渲染位置的限制问题：

### 1. Portal的基本使用

```javascript
import React from 'react';
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, children }) {
    // Portal将内容渲染到body元素下，而不是组件的父元素
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose}>×</button>
                {children}
            </div>
        </div>,
        document.body // 渲染到body元素
    );
}

// 使用Portal的组件
function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>
                打开模态框
            </button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2>模态框内容</h2>
                <p>这是通过Portal渲染的内容</p>
            </Modal>
        </div>
    );
}
```

### 2. Portal的事件冒泡机制

```javascript
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

function PortalEventExample() {
    const [clickCount, setClickCount] = useState(0);
    const [portalClickCount, setPortalClickCount] = useState(0);

    const handleContainerClick = () => {
        setClickCount(prev => prev + 1);
        console.log('容器点击');
    };

    const handlePortalClick = () => {
        setPortalClickCount(prev => prev + 1);
        console.log('Portal内容点击');
    };

    return (
        <div onClick={handleContainerClick}>
            <h3>容器点击次数: {clickCount}</h3>
            <p>Portal外的内容</p>
            
            {/* Portal内容会冒泡到React组件树中对应的父组件 */}
            {createPortal(
                <div 
                    onClick={handlePortalClick}
                    style={{ 
                        border: '2px solid red', 
                        padding: '20px', 
                        margin: '10px',
                        backgroundColor: 'lightblue'
                    }}
                >
                    <h4>Portal内容点击次数: {portalClickCount}</h4>
                    <p>这个元素在DOM中位于body下，但事件会冒泡到React组件树中的父组件</p>
                </div>,
                document.getElementById('portal-root') || document.body
            )}
        </div>
    );
}
```

### 3. 常见的Portal应用场景

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// 1. 模态框组件
function Modal({ isOpen, onClose, title, children }) {
    const modalRef = useRef();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // 防止背景滚动
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-backdrop" onClick={onClose}>
            <div 
                className="modal" 
                ref={modalRef}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

// 2. 工具提示组件
function Tooltip({ children, content, position = 'top' }) {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef();

    const showTooltip = (e) => {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
            x: rect.left + rect.width / 2,
            y: position === 'top' ? rect.top : rect.bottom
        });
        setVisible(true);
    };

    return (
        <div 
            ref={triggerRef}
            onMouseEnter={showTooltip}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && createPortal(
                <div 
                    className={`tooltip tooltip-${position}`}
                    style={{
                        position: 'fixed',
                        left: coords.x,
                        top: coords.y,
                        transform: 'translateX(-50%)',
                        zIndex: 9999
                    }}
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
}

// 3. 全屏加载指示器
function FullScreenLoader({ loading, message = '加载中...' }) {
    if (!loading) return null;

    return createPortal(
        <div className="full-screen-loader">
            <div className="loader-content">
                <div className="spinner"></div>
                <p>{message}</p>
            </div>
        </div>,
        document.body
    );
}
```

### 4. Portal的DOM结构和样式处理

```javascript
import React from 'react';
import { createPortal } from 'react-dom';

// 创建Portal容器的工具函数
function createPortalContainer() {
    let container = document.getElementById('react-portal-root');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'react-portal-root';
        document.body.appendChild(container);
    }
    
    return container;
}

// 带有样式的Portal组件
function StyledPortal({ children, className = '', style = {} }) {
    const container = createPortalContainer();
    
    return createPortal(
        <div className={`portal-wrapper ${className}`} style={style}>
            {children}
        </div>,
        container
    );
}

// 解决z-index问题的示例
function ZIndexExample() {
    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            <h3>普通内容</h3>
            <div style={{ 
                position: 'relative', 
                zIndex: 2, 
                background: 'lightgray', 
                padding: '20px' 
            }}>
                <p>这个元素的z-index是2</p>
                
                {/* Portal内容可以有更高的z-index */}
                {createPortal(
                    <div style={{ 
                        position: 'fixed', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        zIndex: 9999, // 可以设置非常高的z-index
                        background: 'white',
                        border: '2px solid blue',
                        padding: '20px'
                    }}>
                        <p>通过Portal渲染的高z-index内容</p>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
}
```

### 5. Portal与Context的结合使用

```javascript
import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

// 创建Portal上下文
const PortalContext = createContext();

function PortalProvider({ children }) {
    const [portalContainers, setPortalContainers] = useState(new Map());

    const registerPortal = (id, container) => {
        setPortalContainers(prev => new Map(prev).set(id, container));
    };

    const unregisterPortal = (id) => {
        setPortalContainers(prev => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
        });
    };

    return (
        <PortalContext.Provider value={{ 
            portalContainers, 
            registerPortal, 
            unregisterPortal 
        }}>
            {children}
        </PortalContext.Provider>
    );
}

// Portal组件
function Portal({ id, children }) {
    const { registerPortal, unregisterPortal } = useContext(PortalContext);
    const [container, setContainer] = useState(null);

    useEffect(() => {
        const newContainer = document.createElement('div');
        newContainer.setAttribute('data-portal-id', id);
        document.body.appendChild(newContainer);
        setContainer(newContainer);
        
        registerPortal(id, newContainer);

        return () => {
            if (newContainer && document.body.contains(newContainer)) {
                document.body.removeChild(newContainer);
            }
            unregisterPortal(id);
        };
    }, [id]);

    if (!container) return null;

    return createPortal(children, container);
}

// 使用Portal上下文
function AppWithPortalContext() {
    return (
        <PortalProvider>
            <div>
                <button onClick={() => {
                    // 可以通过上下文管理多个Portal
                }}>
                    创建Portal内容
                </button>
            </div>
        </PortalProvider>
    );
}
```

### 6. Portal的性能优化和最佳实践

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// 性能优化的Portal组件
function OptimizedPortal({ children, containerId = 'default-portal' }) {
    const [portalContainer, setPortalContainer] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        // 查找或创建容器
        let container = document.getElementById(containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.setAttribute('data-portal', 'true');
            document.body.appendChild(container);
        }
        
        containerRef.current = container;
        setPortalContainer(container);

        // 清理函数
        return () => {
            // 只有当没有其他组件使用此容器时才移除
            if (container && document.body.contains(container)) {
                document.body.removeChild(container);
            }
        };
    }, [containerId]);

    if (!portalContainer) return null;

    return createPortal(children, portalContainer);
}

// 防止内存泄漏的Portal
function SafePortal({ children, isOpen, containerId }) {
    const [portalContainer, setPortalContainer] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setPortalContainer(null);
            return;
        }

        let container = document.getElementById(containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            document.body.appendChild(container);
        }

        setPortalContainer(container);

        return () => {
            // 确保容器被正确清理
            if (container && document.body.contains(container)) {
                document.body.removeChild(container);
            }
        };
    }, [isOpen, containerId]);

    if (!isOpen || !portalContainer) return null;

    return createPortal(children, portalContainer);
}

// Portal的性能监控
function MonitoredPortal({ children, name }) {
    const startTime = useRef(performance.now());

    useEffect(() => {
        const renderTime = performance.now() - startTime.current;
        console.log(`Portal ${name} 渲染时间: ${renderTime}ms`);
    }, [name]);

    return createPortal(
        <div data-portal-name={name}>
            {children}
        </div>,
        document.body
    );
}
```

### 7. Portal的高级用法和注意事项

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// 动态Portal位置
function DynamicPortal({ children, targetElement, enabled = true }) {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        if (!enabled || !targetElement) {
            setContainer(null);
            return;
        }

        const newContainer = document.createElement('div');
        targetElement.appendChild(newContainer);
        setContainer(newContainer);

        return () => {
            if (newContainer && targetElement.contains(newContainer)) {
                targetElement.removeChild(newContainer);
            }
        };
    }, [targetElement, enabled]);

    if (!container) return null;

    return createPortal(children, container);
}

// 多层Portal嵌套
function NestedPortals() {
    return (
        <div>
            <h3>原始容器</h3>
            {createPortal(
                <div>
                    <h4>第一层Portal</h4>
                    {createPortal(
                        <div>
                            <h5>第二层Portal（嵌套）</h5>
                            <p>Portal可以嵌套使用</p>
                        </div>,
                        document.getElementById('nested-portal-target')
                    )}
                </div>,
                document.getElementById('first-portal-target')
            )}
        </div>
    );
}

// Portal的错误处理
function ErrorBoundaryPortal({ children }) {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        try {
            let portalContainer = document.getElementById('error-safe-portal');
            if (!portalContainer) {
                portalContainer = document.createElement('div');
                portalContainer.id = 'error-safe-portal';
                document.body.appendChild(portalContainer);
            }
            setContainer(portalContainer);
        } catch (error) {
            console.error('Portal容器创建失败:', error);
        }

        return () => {
            try {
                const existingContainer = document.getElementById('error-safe-portal');
                if (existingContainer && document.body.contains(existingContainer)) {
                    document.body.removeChild(existingContainer);
                }
            } catch (error) {
                console.error('Portal容器清理失败:', error);
            }
        };
    }, []);

    if (!container) return null;

    return createPortal(children, container);
}
```

React Portal是一个强大的功能，它允许组件将其子节点渲染到DOM树中的任何位置，而不仅仅局限于组件的父节点。这在创建模态框、弹出窗口、工具提示等需要脱离当前组件层级的UI组件时非常有用。Portal保持了React组件树和DOM树的分离，使得事件冒泡等React特性仍然能够正常工作，同时解决了样式隔离和z-index等常见问题。