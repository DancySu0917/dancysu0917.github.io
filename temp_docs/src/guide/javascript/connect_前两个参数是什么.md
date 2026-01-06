# connect()前两个参数是什么？（必会）

**题目**: connect()前两个参数是什么？（必会）

## 标准答案

React-Redux的connect()函数前两个参数是：
1. **mapStateToProps**：将store中的状态映射到组件的props
2. **mapDispatchToProps**：将dispatch方法映射到组件的props

## 深入理解

connect()是React-Redux库提供的高阶组件函数，用于连接React组件与Redux store。它的完整函数签名是connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])。

第一个参数mapStateToProps是一个函数，接收当前的state作为参数，返回一个对象，该对象的属性会作为props传递给被包装的组件。这个函数会在store状态更新时被调用，允许组件获取最新的状态。

第二个参数mapDispatchToProps可以是函数也可以是对象。如果是函数，接收dispatch作为参数，返回一个对象，该对象的属性包含可以dispatch action的函数。如果是对象，对象的每个字段都是action creator，React-Redux会自动将其包装成dispatch调用。

在现代React-Redux开发中，通常使用useSelector和useDispatch这两个Hook来替代connect，代码更简洁且更容易理解。

## 代码演示

```javascript
import { connect } from 'react-redux';
import { addTodo, toggleTodo, setVisibilityFilter } from '../actions';

// 定义UI组件
const TodoApp = ({ todos, visibilityFilter, addTodo, toggleTodo, setVisibilityFilter }) => {
  return (
    <div>
      <div>
        <input 
          type="text" 
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTodo(e.target.value);
              e.target.value = '';
            }
          }}
          placeholder="添加待办事项"
        />
      </div>
      
      <div>
        <button onClick={() => setVisibilityFilter('SHOW_ALL')}>全部</button>
        <button onClick={() => setVisibilityFilter('SHOW_ACTIVE')}>未完成</button>
        <button onClick={() => setVisibilityFilter('SHOW_COMPLETED')}>已完成</button>
      </div>
      
      <ul>
        {todos.map(todo => (
          <li 
            key={todo.id} 
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

// 第一个参数：mapStateToProps
const mapStateToProps = (state) => {
  const { todos, visibilityFilter } = state;
  
  // 根据过滤器筛选todos
  const filteredTodos = todos.filter(todo => {
    switch (visibilityFilter) {
      case 'SHOW_ALL':
        return true;
      case 'SHOW_ACTIVE':
        return !todo.completed;
      case 'SHOW_COMPLETED':
        return todo.completed;
      default:
        return true;
    }
  });
  
  return {
    todos: filteredTodos,
    visibilityFilter
  };
};

// 第二个参数：mapDispatchToProps（函数形式）
const mapDispatchToPropsFunction = (dispatch) => {
  return {
    addTodo: (text) => dispatch(addTodo(text)),
    toggleTodo: (id) => dispatch(toggleTodo(id)),
    setVisibilityFilter: (filter) => dispatch(setVisibilityFilter(filter))
  };
};

// 第二个参数：mapDispatchToProps（对象形式）
const mapDispatchToPropsObject = {
  addTodo,
  toggleTodo,
  setVisibilityFilter
};

// 使用connect连接组件
const ConnectedTodoApp = connect(
  mapStateToProps, 
  mapDispatchToPropsObject
)(TodoApp);

// 现代方式：使用Hooks替代connect
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

const ModernTodoApp = () => {
  // 替代mapStateToProps
  const { todos, visibilityFilter } = useSelector(state => ({
    todos: state.todos.filter(todo => {
      switch (state.visibilityFilter) {
        case 'SHOW_ALL':
          return true;
        case 'SHOW_ACTIVE':
          return !todo.completed;
        case 'SHOW_COMPLETED':
          return todo.completed;
        default:
          return true;
      }
    }),
    visibilityFilter: state.visibilityFilter
  }));
  
  // 替代mapDispatchToProps
  const dispatch = useDispatch();
  
  const handleAddTodo = (text) => {
    if (text.trim()) {
      dispatch(addTodo(text));
    }
  };
  
  return (
    <div>
      <div>
        <input 
          type="text" 
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTodo(e.target.value);
              e.target.value = '';
            }
          }}
          placeholder="添加待办事项"
        />
      </div>
      
      <ul>
        {todos.map(todo => (
          <li 
            key={todo.id} 
            onClick={() => dispatch(toggleTodo(todo.id))}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## 实际应用场景

connect()函数在传统的React-Redux应用中被广泛使用，特别是在需要将多个状态和action连接到组件的场景中。虽然现代开发更倾向于使用useSelector和useDispatch Hooks，但理解connect的工作原理仍然很重要，因为许多现有项目仍在使用这种模式。在大型应用中，合理使用connect可以精确控制组件的更新，通过优化mapStateToProps来避免不必要的渲染。
