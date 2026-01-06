# 何为受控组件(controlled component) ？（必会）

**题目**: 何为受控组件(controlled component) ？（必会）

## 标准答案

受控组件是React中一种表单元素的处理模式，其中表单元素的值由React组件的state控制。表单元素的值不是由DOM自身维护，而是由组件的state维护，每当用户输入时，会触发事件处理器来更新state，进而更新UI。这种模式下，React组件拥有表单元素的"单一数据源"。

## 深入理解

### 受控组件的核心概念

受控组件是指表单元素（如input、textarea、select等）的值由React组件的state控制，而不是由DOM自身控制。每当表单元素的值发生变化时，会触发对应的事件处理器（如onChange），在事件处理器中更新组件的state，从而更新UI。

### 受控组件的特点

1. **单一数据源**：表单元素的值由React state控制，state是唯一的可信数据源
2. **状态同步**：表单元素的值始终与组件state保持同步
3. **可预测性**：由于值由state控制，组件的行为更加可预测和可控

### 基本实现方式

```jsx
import React, { useState } from 'react';

function ControlledForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email, message });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">姓名:</label>
        <input
          type="text"
          id="name"
          value={name}           // 受控：值由state控制
          onChange={(e) => setName(e.target.value)}  // 受控：通过事件更新state
        />
      </div>
      
      <div>
        <label htmlFor="email">邮箱:</label>
        <input
          type="email"
          id="email"
          value={email}          // 受控：值由state控制
          onChange={(e) => setEmail(e.target.value)} // 受控：通过事件更新state
        />
      </div>
      
      <div>
        <label htmlFor="message">留言:</label>
        <textarea
          id="message"
          value={message}        // 受控：值由state控制
          onChange={(e) => setMessage(e.target.value)} // 受控：通过事件更新state
        />
      </div>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 受控组件与非受控组件对比

```jsx
// 受控组件
function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input 
      value={value}  // 值由state控制
      onChange={(e) => setValue(e.target.value)} 
    />
  );
}

// 非受控组件
function UncontrolledInput() {
  const inputRef = useRef();
  
  const handleSubmit = () => {
    console.log(inputRef.current.value); // 通过ref获取值
  };
  
  return (
    <div>
      <input ref={inputRef} />  // 值由DOM自身控制
      <button onClick={handleSubmit}>获取值</button>
    </div>
  );
}
```

### 受控组件在实际项目中的应用

#### 1. 表单验证

```jsx
import React, { useState } from 'react';

function ValidatedForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  
  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    switch (name) {
      case 'username':
        if (!value) return '用户名不能为空';
        if (value.length < 3) return '用户名至少3个字符';
        break;
      case 'email':
        if (!value) return '邮箱不能为空';
        if (!/\S+@\S+\.\S+/.test(value)) return '邮箱格式不正确';
        break;
      case 'password':
        if (!value) return '密码不能为空';
        if (value.length < 6) return '密码至少6个字符';
        break;
      default:
        break;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 更新表单数据
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // 实时验证
    const error = validate(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 提交前验证所有字段
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validate(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('提交成功:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="username"
          placeholder="用户名"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div>
        <input
          type="email"
          name="email"
          placeholder="邮箱"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          name="password"
          placeholder="密码"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

#### 2. 动态表单

```jsx
import React, { useState } from 'react';

function DynamicForm() {
  const [fields, setFields] = useState([
    { id: 1, name: '', value: '' }
  ]);

  const addField = () => {
    setFields([
      ...fields,
      { id: Date.now(), name: '', value: '' }
    ]);
  };

  const removeField = (id) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id, name, value) => {
    setFields(
      fields.map(field =>
        field.id === id ? { ...field, [name]: value } : field
      )
    );
  };

  return (
    <div>
      {fields.map((field) => (
        <div key={field.id} style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="字段名"
            value={field.name}
            onChange={(e) => updateField(field.id, 'name', e.target.value)}
          />
          <input
            type="text"
            placeholder="值"
            value={field.value}
            onChange={(e) => updateField(field.id, 'value', e.target.value)}
          />
          <button onClick={() => removeField(field.id)}>删除</button>
        </div>
      ))}
      <button onClick={addField}>添加字段</button>
    </div>
  );
}
```

### 受控组件的优势

1. **数据同步**：表单数据与组件状态始终保持同步
2. **易于验证**：可以实时验证用户输入
3. **条件逻辑**：可以根据表单状态实现复杂的条件逻辑
4. **数据收集**：方便收集和处理表单数据
5. **测试友好**：更容易编写单元测试

### 性能考虑

对于大型表单，频繁的state更新可能影响性能，可以考虑以下优化：

```jsx
import React, { useState, useCallback, useMemo } from 'react';

function OptimizedForm() {
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
    field3: '',
    // ... 更多字段
  });

  // 使用useCallback优化事件处理器
  const handleFieldChange = useCallback((name) => (e) => {
    setFormData(prev => ({
      ...prev,
      [name]: e.target.value
    }));
  }, []);

  // 使用useMemo优化复杂计算
  const processedData = useMemo(() => {
    // 复杂的数据处理逻辑
    return formData;
  }, [formData]);

  return (
    <form>
      <input 
        value={formData.field1} 
        onChange={handleFieldChange('field1')} 
      />
      <input 
        value={formData.field2} 
        onChange={handleFieldChange('field2')} 
      />
      <input 
        value={formData.field3} 
        onChange={handleFieldChange('field3')} 
      />
    </form>
  );
}
```

### 与非受控组件的选择

- **使用受控组件**：需要实时验证、条件逻辑、数据同步、复杂表单逻辑
- **使用非受控组件**：简单表单、性能敏感场景、与第三方库集成

受控组件是React表单处理的标准模式，它提供了对表单数据的完全控制，使组件行为更加可预测和可控。
