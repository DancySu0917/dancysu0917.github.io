## 标准答案

状态提升（Lifting State Up）是React中的一种模式，指的是将多个组件共享的状态移动到它们共同的父组件中管理。当多个组件需要反映相同的变化数据时，应该将共享状态提升到最近的共同祖先组件中，而不是在每个组件中单独维护状态。

## 深入理解

状态提升是React数据流管理的重要概念，它体现了React单向数据流的特点，有助于维护组件间数据的一致性。

### 状态提升的基本概念

```javascript
// 未使用状态提升的示例（错误做法）
function TemperatureInput1() {
    const [temperature, setTemperature] = useState(''); // 各自维护状态
    
    return (
        <fieldset>
            <legend>摄氏度</legend>
            <input 
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
            />
        </fieldset>
    );
}

function TemperatureInput2() {
    const [temperature, setTemperature] = useState(''); // 各自维护状态
    
    return (
        <fieldset>
            <legend>华氏度</legend>
            <input 
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
            />
        </fieldset>
    );
}

// 使用状态提升的正确示例
function TemperatureCalculator() {
    const [temperature, setTemperature] = useState('');
    const [scale, setScale] = useState('c');
    
    // 计算对应的温度
    const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
    const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;
    
    return (
        <div>
            <TemperatureInput
                scale="c"
                temperature={celsius}
                onTemperatureChange={setTemperature}
            />
            <TemperatureInput
                scale="f"
                temperature={fahrenheit}
                onTemperatureChange={setTemperature}
            />
        </div>
    );
}

function TemperatureInput({ scale, temperature, onTemperatureChange }) {
    const scaleName = scale === 'c' ? '摄氏度' : '华氏度';
    
    return (
        <fieldset>
            <legend>输入温度 ({scaleName})</legend>
            <input 
                value={temperature}
                onChange={(e) => onTemperatureChange(e.target.value)}
            />
        </fieldset>
    );
}

// 温度转换函数
function toCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}

function toFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function tryConvert(temperature, convert) {
    const input = parseFloat(temperature);
    if (Number.isNaN(input)) {
        return '';
    }
    const output = convert(input);
    const rounded = Math.round(output * 1000) / 1000;
    return rounded.toString();
}
```

### 简单的状态提升示例

```javascript
// 子组件间需要共享数据的场景
function ChildComponentA({ sharedValue, onValueChange }) {
    return (
        <div>
            <h3>组件A</h3>
            <input 
                type="text"
                value={sharedValue}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder="输入值"
            />
            <p>当前值: {sharedValue}</p>
        </div>
    );
}

function ChildComponentB({ sharedValue }) {
    return (
        <div>
            <h3>组件B</h3>
            <p>共享值: {sharedValue}</p>
            <p>值的长度: {sharedValue.length}</p>
        </div>
    );
}

// 父组件提升状态
function ParentComponent() {
    const [sharedValue, setSharedValue] = useState('');
    
    return (
        <div>
            <ChildComponentA 
                sharedValue={sharedValue} 
                onValueChange={setSharedValue} 
            />
            <ChildComponentB sharedValue={sharedValue} />
        </div>
    );
}
```

### 复杂状态提升示例

```javascript
// 更复杂的状态提升场景
function TodoApp() {
    const [todos, setTodos] = useState([
        { id: 1, text: '学习React', completed: false },
        { id: 2, text: '练习状态提升', completed: true }
    ]);
    
    // 添加待办事项
    const addTodo = (text) => {
        const newTodo = {
            id: Date.now(),
            text,
            completed: false
        };
        setTodos([...todos, newTodo]);
    };
    
    // 切换完成状态
    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };
    
    // 删除待办事项
    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };
    
    return (
        <div>
            <TodoForm onAddTodo={addTodo} />
            <TodoList 
                todos={todos}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
            />
        </div>
    );
}

// 添加待办事项的表单组件
function TodoForm({ onAddTodo }) {
    const [inputValue, setInputValue] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAddTodo(inputValue);
            setInputValue('');
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="添加新的待办事项"
            />
            <button type="submit">添加</button>
        </form>
    );
}

// 待办事项列表组件
function TodoList({ todos, onToggleTodo, onDeleteTodo }) {
    return (
        <ul>
            {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => onToggleTodo(todo.id)}
                    onDelete={() => onDeleteTodo(todo.id)}
                />
            ))}
        </ul>
    );
}

// 单个待办事项组件
function TodoItem({ todo, onToggle, onDelete }) {
    return (
        <li>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={onToggle}
            />
            <span style={{
                textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
                {todo.text}
            </span>
            <button onClick={onDelete}>删除</button>
        </li>
    );
}
```

### 状态提升的高级应用

```javascript
// 表单状态提升示例
function UserForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        gender: '',
        interests: []
    });
    
    // 通用的表单更新函数
    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    // 处理复选框
    const toggleInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };
    
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            console.log('提交的数据:', formData);
        }}>
            <NameField 
                value={formData.name} 
                onChange={(value) => updateField('name', value)} 
            />
            <EmailField 
                value={formData.email} 
                onChange={(value) => updateField('email', value)} 
            />
            <AgeField 
                value={formData.age} 
                onChange={(value) => updateField('age', value)} 
            />
            <GenderField 
                value={formData.gender} 
                onChange={(value) => updateField('gender', value)} 
            />
            <InterestsField 
                selected={formData.interests} 
                onToggle={toggleInterest} 
            />
            <button type="submit">提交</button>
        </form>
    );
}

function NameField({ value, onChange }) {
    return (
        <div>
            <label>姓名:</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function EmailField({ value, onChange }) {
    return (
        <div>
            <label>邮箱:</label>
            <input
                type="email"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function AgeField({ value, onChange }) {
    return (
        <div>
            <label>年龄:</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function GenderField({ value, onChange }) {
    return (
        <div>
            <label>性别:</label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
            </select>
        </div>
    );
}

function InterestsField({ selected, onToggle }) {
    const interests = ['阅读', '运动', '音乐', '旅行', '美食'];
    
    return (
        <div>
            <label>兴趣爱好:</label>
            {interests.map(interest => (
                <label key={interest}>
                    <input
                        type="checkbox"
                        checked={selected.includes(interest)}
                        onChange={() => onToggle(interest)}
                    />
                    {interest}
                </label>
            ))}
        </div>
    );
}
```

### 状态提升与Context的结合

```javascript
// 当状态提升层级过多时，可以结合Context使用
const TodoContext = createContext();

function TodoProvider({ children }) {
    const [todos, setTodos] = useState([
        { id: 1, text: '学习Context', completed: false }
    ]);
    
    const value = {
        todos,
        addTodo: (text) => {
            const newTodo = {
                id: Date.now(),
                text,
                completed: false
            };
            setTodos([...todos, newTodo]);
        },
        toggleTodo: (id) => {
            setTodos(todos.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            ));
        },
        deleteTodo: (id) => {
            setTodos(todos.filter(todo => todo.id !== id));
        }
    };
    
    return (
        <TodoContext.Provider value={value}>
            {children}
        </TodoContext.Provider>
    );
}

function useTodos() {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error('useTodos must be used within TodoProvider');
    }
    return context;
}

// 使用Context的组件
function TodoListWithContext() {
    const { todos, toggleTodo, deleteTodo } = useTodos();
    
    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id}>
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                    />
                    <span>{todo.text}</span>
                    <button onClick={() => deleteTodo(todo.id)}>删除</button>
                </li>
            ))}
        </ul>
    );
}

function TodoAppWithContext() {
    return (
        <TodoProvider>
            <div>
                <TodoFormWithContext />
                <TodoListWithContext />
            </div>
        </TodoProvider>
    );
}
```

### 状态提升的最佳实践

```javascript
// 状态提升的最佳实践示例
function SearchableProductList() {
    const [products, setProducts] = useState([
        { id: 1, name: 'iPhone', category: '电子产品', price: 999, stocked: true },
        { id: 2, name: 'MacBook', category: '电子产品', price: 1999, stocked: false },
        { id: 3, name: 'T-Shirt', category: '服装', price: 29, stocked: true }
    ]);
    
    const [filterText, setFilterText] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    
    // 计算过滤后的产品列表
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (!product.name.toLowerCase().includes(filterText.toLowerCase())) {
                return false;
            }
            if (inStockOnly && !product.stocked) {
                return false;
            }
            return true;
        });
    }, [products, filterText, inStockOnly]);
    
    // 按类别分组
    const productsByCategory = useMemo(() => {
        const grouped = {};
        filteredProducts.forEach(product => {
            if (!grouped[product.category]) {
                grouped[product.category] = [];
            }
            grouped[product.category].push(product);
        });
        return grouped;
    }, [filteredProducts]);
    
    return (
        <div>
            <SearchBar
                filterText={filterText}
                inStockOnly={inStockOnly}
                onFilterTextChange={setFilterText}
                onInStockOnlyChange={setInStockOnly}
            />
            <ProductTable
                productsByCategory={productsByCategory}
            />
        </div>
    );
}

// 搜索栏组件
function SearchBar({ filterText, inStockOnly, onFilterTextChange, onInStockOnlyChange }) {
    return (
        <form>
            <input
                type="text"
                placeholder="搜索产品..."
                value={filterText}
                onChange={(e) => onFilterTextChange(e.target.value)}
            />
            <p>
                <label>
                    <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => onInStockOnlyChange(e.target.checked)}
                    />
                    只显示有库存的产品
                </label>
            </p>
        </form>
    );
}

// 产品表格组件
function ProductTable({ productsByCategory }) {
    const categoryRows = Object.entries(productsByCategory).map(
        ([category, products]) => (
            <ProductCategoryRow
                key={category}
                category={category}
                products={products}
            />
        )
    );
    
    return (
        <table>
            <thead>
                <tr>
                    <th>名称</th>
                    <th>价格</th>
                </tr>
            </thead>
            <tbody>
                {categoryRows}
            </tbody>
        </table>
    );
}

// 产品分类行组件
function ProductCategoryRow({ category, products }) {
    const productRows = products.map(product => (
        <ProductRow key={product.id} product={product} />
    ));
    
    return (
        <React.Fragment>
            <tr>
                <th colSpan="2">{category}</th>
            </tr>
            {productRows}
        </React.Fragment>
    );
}

// 产品行组件
function ProductRow({ product }) {
    const name = product.stocked ? (
        product.name
    ) : (
        <span style={{ color: 'red' }}>
            {product.name} (缺货)
        </span>
    );
    
    return (
        <tr>
            <td>{name}</td>
            <td>${product.price}</td>
        </tr>
    );
}
```

### 状态提升的注意事项

```javascript
// 状态提升的常见错误和解决方案
function CommonMistakes() {
    // ❌ 错误：在子组件中直接修改props
    function BadChildComponent({ value, onChange }) {
        return (
            <input
                value={value}
                onChange={(e) => {
                    // 直接修改props是错误的
                    value = e.target.value; // 不要这样做
                    onChange(e.target.value);
                }}
            />
        );
    }
    
    // ✅ 正确：通过回调函数通知父组件更新状态
    function GoodChildComponent({ value, onChange }) {
        return (
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }
    
    // ❌ 错误：不必要的状态提升
    function UnnecessaryLift({ data }) {
        const [localState, setLocalState] = useState(data); // 不必要的状态提升
        
        return <div>{localState}</div>;
    }
    
    // ✅ 正确：只提升真正需要共享的状态
    function NecessaryLift({ data }) {
        return <div>{data}</div>; // 直接使用props
    }
    
    // ✅ 状态提升的优化：使用useCallback避免不必要的重渲染
    function OptimizedLift() {
        const [count, setCount] = useState(0);
        
        // 使用useCallback缓存回调函数
        const handleIncrement = useCallback(() => {
            setCount(prev => prev + 1);
        }, []);
        
        return (
            <div>
                <p>Count: {count}</p>
                <ChildComponent onIncrement={handleIncrement} />
            </div>
        );
    }
    
    function ChildComponent({ onIncrement }) {
        // 这个组件不会因为父组件重渲染而重渲染
        return <button onClick={onIncrement}>增加</button>;
    }
}
```

### 总结

状态提升是React中管理组件间共享数据的重要模式：

1. **核心原则**：将共享状态移动到最近的共同祖先组件
2. **数据流向**：通过props向下传递数据，通过回调函数向上传递变更
3. **适用场景**：多个组件需要反映相同变化数据时
4. **最佳实践**：结合useMemo、useCallback优化性能
5. **高级应用**：与Context结合使用，处理深层组件通信