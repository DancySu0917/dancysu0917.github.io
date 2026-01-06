## 标准答案

受控组件和非受控组件是React中处理表单数据的两种不同方式：

- **受控组件**：表单元素的值由React组件的state控制，通过onChange事件处理用户输入并更新state
- **非受控组件**：表单元素的值由DOM自身管理，通过ref获取表单值，不需要维护state

## 深入理解

受控组件和非受控组件代表了React中表单数据管理的两种哲学：

### 受控组件 (Controlled Components)

在受控组件中，表单数据由React组件的状态(state)来管理。每当用户输入数据时，会触发onChange事件处理器，更新组件的state，然后重新渲染UI。

```javascript
// 受控组件示例
class ControlledForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            message: ''
        };
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log('提交的数据:', this.state);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleInputChange}
                    placeholder="姓名"
                />
                <input
                    type="email"
                    name="email"
                    value={this.state.email}
                    onChange={this.handleInputChange}
                    placeholder="邮箱"
                />
                <textarea
                    name="message"
                    value={this.state.message}
                    onChange={this.handleInputChange}
                    placeholder="留言"
                />
                <button type="submit">提交</button>
            </form>
        );
    }
}

// 函数组件中的受控组件
import React, { useState } from 'react';

function FunctionalControlledForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('提交的数据:', formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="姓名"
            />
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="邮箱"
            />
            <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="留言"
            />
            <button type="submit">提交</button>
        </form>
    );
}
```

### 非受控组件 (Uncontrolled Components)

非受控组件不需要为每个状态更新都编写事件处理程序，而是使用refs来从DOM获取表单值。

```javascript
// 非受控组件示例
import React, { useRef } from 'react';

function UncontrolledForm() {
    const nameRef = useRef();
    const emailRef = useRef();
    const messageRef = useRef();

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // 直接从DOM获取值
        const formData = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            message: messageRef.current.value
        };
        
        console.log('提交的数据:', formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                ref={nameRef}
                defaultValue=""  // 设置默认值
                placeholder="姓名"
            />
            <input
                type="email"
                ref={emailRef}
                defaultValue=""
                placeholder="邮箱"
            />
            <textarea
                ref={messageRef}
                defaultValue=""
                placeholder="留言"
            />
            <button type="submit">提交</button>
        </form>
    );
}

// 使用useRef的另一种方式
function UncontrolledFormWithDefault() {
    const formRef = useRef();

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // 获取表单中所有输入的值
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());
        console.log('提交的数据:', data);
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="姓名"
            />
            <input
                type="email"
                name="email"
                placeholder="邮箱"
            />
            <textarea
                name="message"
                placeholder="留言"
            />
            <button type="submit">提交</button>
        </form>
    );
}
```

### 选择器和文件输入的特殊处理

```javascript
// 受控选择器组件
function ControlledSelect() {
    const [selectedValue, setSelectedValue] = useState('option1');

    return (
        <select value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)}>
            <option value="option1">选项1</option>
            <option value="option2">选项2</option>
            <option value="option3">选项3</option>
        </select>
    );
}

// 非受控选择器组件
function UncontrolledSelect() {
    const selectRef = useRef();

    const handleSubmit = () => {
        console.log('选中的值:', selectRef.current.value);
    };

    return (
        <select ref={selectRef} defaultValue="option1">
            <option value="option1">选项1</option>
            <option value="option2">选项2</option>
            <option value="option3">选项3</option>
        </select>
    );
}

// 文件输入只能是非受控的
function FileUpload() {
    const fileInputRef = useRef();

    const handleFileUpload = () => {
        const file = fileInputRef.current.files[0];
        if (file) {
            console.log('选择的文件:', file.name);
            // 处理文件上传逻辑
        }
    };

    return (
        <div>
            <input type="file" ref={fileInputRef} />
            <button onClick={handleFileUpload}>上传文件</button>
        </div>
    );
}
```

### 受控与非受控组件的比较

| 特性 | 受控组件 | 非受控组件 |
|------|----------|------------|
| 数据管理 | React State | DOM |
| 实时验证 | 支持 | 不支持 |
| 即时反馈 | 支持 | 不支持 |
| 代码复杂度 | 较高 | 较低 |
| 性能 | 有状态更新开销 | 无状态更新开销 |
| 适用场景 | 复杂表单验证、实时数据处理 | 简单表单、快速原型 |

### 实际应用中的最佳实践

```javascript
// 混合使用：在某些场景下可以结合使用
function MixedForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    
    const fileInputRef = useRef();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // 获取受控组件的数据
        const controlledData = formData;
        
        // 获取非受控组件的数据
        const file = fileInputRef.current.files[0];
        
        console.log('表单数据:', { ...controlledData, file });
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* 受控组件 */}
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="姓名"
            />
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="邮箱"
            />
            
            {/* 非受控组件 */}
            <input
                type="file"
                ref={fileInputRef}
            />
            
            <button type="submit">提交</button>
        </form>
    );
}
```

### 总结

- **受控组件**适合需要实时验证、数据同步、复杂表单逻辑的场景
- **非受控组件**适合简单表单、性能敏感、快速开发的场景
- 在实际开发中，可以根据具体需求选择合适的模式，甚至混合使用