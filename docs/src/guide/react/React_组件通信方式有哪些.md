### 标准答案

React组件通信方式主要有以下几种：
1. **Props** - 父组件向子组件传递数据
2. **回调函数** - 子组件向父组件传递数据
3. **Context** - 跨层级组件通信
4. **状态提升** - 多个组件共享状态
5. **自定义事件** - 使用发布订阅模式
6. **Redux/MobX** - 全局状态管理
7. **Refs** - 父组件访问子组件实例
8. **回调Ref** - 子组件向父组件暴露方法

### 深入理解

React组件通信是构建复杂应用的基础，不同的通信方式适用于不同的场景：

#### 1. Props（父传子）

最基础的通信方式，通过属性将数据从父组件传递给子组件：

```javascript
// 父组件
function Parent() {
    const message = "Hello from Parent";
    
    return <Child message={message} />;
}

// 子组件
function Child({ message }) {
    return <div>{message}</div>;
}
```

#### 2. 回调函数（子传父）

子组件通过调用父组件传递的回调函数来向父组件传递数据：

```javascript
// 父组件
function Parent() {
    const [childData, setChildData] = useState('');
    
    const handleChildData = (data) => {
        setChildData(data);
    };
    
    return (
        <div>
            <p>来自子组件的数据: {childData}</p>
            <Child onDataChange={handleChildData} />
        </div>
    );
}

// 子组件
function Child({ onDataChange }) {
    const [inputValue, setInputValue] = useState('');
    
    const handleSubmit = () => {
        onDataChange(inputValue);
    };
    
    return (
        <div>
            <input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
            />
            <button onClick={handleSubmit}>发送给父组件</button>
        </div>
    );
}
```

#### 3. Context（跨层级通信）

适用于跨越多层组件的数据传递，避免props层层传递：

```javascript
// 创建Context
const ThemeContext = React.createContext();

// 父组件提供数据
function App() {
    const [theme, setTheme] = useState('light');
    
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <Header />
            <Main />
        </ThemeContext.Provider>
    );
}

// 深层组件消费数据
function Button() {
    const { theme, setTheme } = useContext(ThemeContext);
    
    return (
        <button 
            className={theme}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
            切换主题
        </button>
    );
}
```

#### 4. 状态提升（兄弟组件通信）

将共享状态提升到最近的共同父组件：

```javascript
function Parent() {
    const [sharedState, setSharedState] = useState('');
    
    return (
        <>
            <ChildA sharedState={sharedState} onStateChange={setSharedState} />
            <ChildB sharedState={sharedState} />
        </>
    );
}

function ChildA({ sharedState, onStateChange }) {
    return (
        <input 
            value={sharedState} 
            onChange={(e) => onStateChange(e.target.value)} 
        />
    );
}

function ChildB({ sharedState }) {
    return <div>兄弟组件数据: {sharedState}</div>;
}
```

#### 5. Refs（父访问子）

父组件通过ref直接访问子组件实例或DOM元素：

```javascript
// 类组件中使用ref
class Parent extends React.Component {
    constructor(props) {
        super(props);
        this.childRef = React.createRef();
    }
    
    handleFocus = () => {
        this.childRef.current.focusInput(); // 调用子组件方法
    };
    
    render() {
        return (
            <div>
                <Child ref={this.childRef} />
                <button onClick={this.handleFocus}>聚焦到子组件输入框</button>
            </div>
        );
    }
}

class Child extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }
    
    focusInput = () => {
        this.inputRef.current.focus();
    };
    
    render() {
        return <input ref={this.inputRef} />;
    }
}

// 函数组件中使用useImperativeHandle
const Child = forwardRef((props, ref) => {
    const inputRef = useRef();
    
    useImperativeHandle(ref, () => ({
        focusInput: () => {
            inputRef.current.focus();
        },
        getValue: () => {
            return inputRef.current.value;
        }
    }));
    
    return <input ref={inputRef} />;
});
```

#### 6. 发布订阅模式

使用自定义事件系统实现组件间通信：

```javascript
// 简单的事件总线
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

const eventBus = new EventBus();

// 发布者组件
function Publisher() {
    const publishMessage = () => {
        eventBus.emit('message', 'Hello from Publisher');
    };
    
    return <button onClick={publishMessage}>发布消息</button>;
}

// 订阅者组件
function Subscriber() {
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        const handleMessage = (data) => {
            setMessage(data);
        };
        
        eventBus.on('message', handleMessage);
        
        return () => {
            eventBus.off('message', handleMessage);
        };
    }, []);
    
    return <div>接收到消息: {message}</div>;
}
```

#### 7. Redux/MobX（全局状态管理）

适用于复杂应用的全局状态管理：

```javascript
// Redux示例
import { createStore } from 'redux';

// Reducer
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

// Store
const store = createStore(counterReducer);

// 在组件中使用
function Counter() {
    const [state, setState] = useState(store.getState());
    
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setState(store.getState());
        });
        
        return unsubscribe;
    }, []);
    
    const increment = () => {
        store.dispatch({ type: 'INCREMENT' });
    };
    
    return (
        <div>
            <p>Count: {state.count}</p>
            <button onClick={increment}>+</button>
        </div>
    );
}
```

#### 8. 现代React Hooks通信

使用自定义Hooks实现更灵活的组件通信：

```javascript
// 自定义通信Hook
function useCommunication() {
    const [data, setData] = useState(null);
    const [listeners, setListeners] = useState([]);
    
    const broadcast = useCallback((newData) => {
        setData(newData);
        listeners.forEach(callback => callback(newData));
    }, [listeners]);
    
    const subscribe = useCallback((callback) => {
        setListeners(prev => [...prev, callback]);
        
        return () => {
            setListeners(prev => prev.filter(cb => cb !== callback));
        };
    }, []);
    
    return { data, broadcast, subscribe };
}

// 使用示例
function ComponentA({ comm }) {
    const [input, setInput] = useState('');
    
    const sendData = () => {
        comm.broadcast(input);
    };
    
    return (
        <div>
            <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
            />
            <button onClick={sendData}>发送数据</button>
        </div>
    );
}

function ComponentB({ comm }) {
    const [receivedData, setReceivedData] = useState('');
    
    useEffect(() => {
        const unsubscribe = comm.subscribe(setReceivedData);
        return unsubscribe;
    }, [comm]);
    
    return <div>接收到: {receivedData}</div>;
}
```

每种通信方式都有其适用场景，选择合适的通信方式可以提高应用的可维护性和性能。在实际开发中，通常会结合多种通信方式来构建复杂的用户界面。