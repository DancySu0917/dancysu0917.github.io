# MVVM 和 MVC 区别是什么？哪些场景适合？（高薪常问）

## 标准答案

MVVM（Model-View-ViewModel）和 MVC（Model-View-Controller）是两种不同的软件架构模式：

1. **结构差异**：
   - MVC：Model-View-Controller 三层结构，Controller 作为协调者
   - MVVM：Model-View-ViewModel 三层结构，ViewModel 连接 View 和 Model

2. **数据流向**：
   - MVC：数据通过 Controller 在 Model 和 View 之间传递
   - MVVM：View 和 Model 通过 ViewModel 双向绑定，自动同步

3. **职责分离**：
   - MVC：Controller 处理业务逻辑和用户交互
   - MVVM：ViewModel 专注于数据转换和绑定，View 负责展示

4. **适用场景**：
   - MVC：适合服务器端渲染、传统 Web 应用
   - MVVM：适合前端框架、单页应用（SPA）

## 深入理解

让我们通过代码示例来深入理解两种架构模式：

### MVC 架构示例

```javascript
// Model - 数据模型
class UserModel {
    constructor() {
        this.users = [
            { id: 1, name: 'Alice', email: 'alice@example.com' },
            { id: 2, name: 'Bob', email: 'bob@example.com' }
        ];
    }
    
    getAllUsers() {
        return this.users;
    }
    
    getUserById(id) {
        return this.users.find(user => user.id === id);
    }
    
    addUser(user) {
        user.id = this.users.length + 1;
        this.users.push(user);
    }
}

// View - 视图层
class UserView {
    constructor() {
        this.userListElement = document.getElementById('userList');
        this.addForm = document.getElementById('addUserForm');
    }
    
    displayUsers(users) {
        this.userListElement.innerHTML = users.map(user => 
            `<li>${user.name} - ${user.email}</li>`
        ).join('');
    }
    
    bindAddUser(handler) {
        this.addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.addForm);
            const user = {
                name: formData.get('name'),
                email: formData.get('email')
            };
            handler(user);
        });
    }
}

// Controller - 控制器
class UserController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.view.bindAddUser((user) => {
            this.model.addUser(user);
            this.updateView();
        });
    }
    
    updateView() {
        const users = this.model.getAllUsers();
        this.view.displayUsers(users);
    }
    
    initialize() {
        this.updateView();
    }
}

// 使用
const userModel = new UserModel();
const userView = new UserView();
const userController = new UserController(userModel, userView);
userController.initialize();
```

### MVVM 架构示例

```javascript
// Model - 数据模型
class UserModel {
    constructor() {
        this.users = [
            { id: 1, name: 'Alice', email: 'alice@example.com' },
            { id: 2, name: 'Bob', email: 'bob@example.com' }
        ];
    }
    
    getAllUsers() {
        return this.users;
    }
    
    addUser(user) {
        user.id = this.users.length + 1;
        this.users.push(user);
    }
}

// ViewModel - 视图模型
class UserViewModel {
    constructor(model) {
        this.model = model;
        this.users = this.model.getAllUsers();
        
        // 模拟双向数据绑定
        this.newUser = {
            name: '',
            email: ''
        };
        
        // 方法
        this.addUser = this.addUser.bind(this);
    }
    
    addUser() {
        if (this.newUser.name && this.newUser.email) {
            this.model.addUser({
                name: this.newUser.name,
                email: this.newUser.email
            });
            this.users = this.model.getAllUsers();
            // 清空表单
            this.newUser.name = '';
            this.newUser.email = '';
        }
    }
    
    // 模拟计算属性
    get userCount() {
        return this.users.length;
    }
}

// 使用 Vue 作为 MVVM 框架的示例
const app = new Vue({
    el: '#app',
    data: {
        users: [
            { id: 1, name: 'Alice', email: 'alice@example.com' },
            { id: 2, name: 'Bob', email: 'bob@example.com' }
        ],
        newUser: {
            name: '',
            email: ''
        }
    },
    computed: {
        userCount() {
            return this.users.length;
        }
    },
    methods: {
        addUser() {
            if (this.newUser.name && this.newUser.email) {
                this.newUser.id = this.users.length + 1;
                this.users.push({ ...this.newUser });
                this.newUser = { name: '', email: '' }; // 清空表单
            }
        }
    }
});
```

### 详细对比

| 特性 | MVC | MVVM |
|------|-----|------|
| **数据绑定** | 手动更新视图 | 自动双向绑定 |
| **测试性** | Controller 逻辑复杂，测试困难 | ViewModel 逻辑独立，易于测试 |
| **学习成本** | 概念简单，容易理解 | 需要理解绑定机制 |
| **代码量** | 需要编写更多模板代码 | 框架处理大部分逻辑 |
| **维护性** | 业务逻辑分散在 Controller | 业务逻辑集中在 ViewModel |

### 适用场景

**MVC 适用于**：
- 服务器端渲染的应用（如 Ruby on Rails、ASP.NET MVC）
- 传统的多页面应用
- 需要严格分离业务逻辑和展示逻辑的场景
- 团队成员对 MVC 模式比较熟悉

```javascript
// Express.js MVC 示例
const express = require('express');
const app = express();

// Model
const User = {
    findAll: () => {
        return [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    }
};

// Controller
const userController = {
    index: (req, res) => {
        const users = User.findAll();
        res.render('users/index', { users }); // 传递给 View
    },
    
    create: (req, res) => {
        // 处理创建逻辑
        res.redirect('/users');
    }
};

// Route
app.get('/users', userController.index);
app.post('/users', userController.create);
```

**MVVM 适用于**：
- 单页应用（SPA）
- 需要复杂数据绑定的前端应用
- 实时交互要求高的应用
- 前端框架（如 Vue、Angular、Knockout）

```javascript
// Vue MVVM 示例
new Vue({
    el: '#app',
    data: {
        searchQuery: '',
        users: [
            { id: 1, name: 'Alice', active: true },
            { id: 2, name: 'Bob', active: false }
        ]
    },
    computed: {
        filteredUsers() {
            return this.users.filter(user => 
                user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        activeUserCount() {
            return this.users.filter(user => user.active).length;
        }
    },
    methods: {
        toggleUserStatus(user) {
            user.active = !user.active;
        }
    }
});
```

MVVM 通过数据绑定机制大大简化了视图更新的复杂度，而 MVC 在服务器端应用中提供了清晰的职责分离。选择哪种模式取决于具体的应用场景和技术栈。