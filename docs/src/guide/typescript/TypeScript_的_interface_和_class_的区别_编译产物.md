# TypeScript 的 interface 和 class 的区别？编译产物？（高薪常问）

**题目**: TypeScript 的 interface 和 class 的区别？编译产物？（高薪常问）

## 标准答案

TypeScript 中的 interface 和 class 是两种不同的概念：
- interface 是一种类型契约，用于定义对象的结构，只存在于编译时，不会生成运行时代码
- class 是实际的实现，用于创建对象实例，会生成完整的运行时代码
- interface 用于描述对象的形状，class 用于封装数据和方法
- interface 支持多重继承（实现多个接口），class 只支持单继承
- interface 不能包含实现细节，class 可以包含具体的实现

## 深入理解

TypeScript 的 interface 和 class 在设计目的、使用场景和编译产物上存在显著差异：

### 1. 本质和用途
- interface 是一种抽象类型，仅用于类型检查，定义对象应具有的属性和方法签名
- class 是面向对象编程的核心，定义对象的结构和行为，包含属性、方法和构造函数

```typescript
// interface 仅定义结构
interface User {
    name: string;
    age: number;
    greet(): void;
}

// class 提供具体实现
class Person implements User {
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    greet(): void {
        console.log(`Hello, I'm ${this.name}`);
    }
}
```

### 2. 继承机制
- interface 支持多重继承，可以扩展多个接口
- class 只支持单继承，但可以实现多个接口

```typescript
// interface 多重继承
interface Identifiable {
    id: string;
}

interface Timestampable {
    createdAt: Date;
}

interface Record extends Identifiable, Timestampable {
    data: string;
}

// class 单继承，多实现
class DataRecord extends BaseClass implements Identifiable, Timestampable {
    id: string;
    createdAt: Date;
    data: string;

    constructor(id: string, data: string) {
        super();
        this.id = id;
        this.data = data;
        this.createdAt = new Date();
    }
}
```

### 3. 编译产物差异
- interface 在编译后完全消失，不产生任何 JavaScript 代码
- class 会生成完整的构造函数和原型方法

编译前（TypeScript）：
```typescript
interface Config {
    apiUrl: string;
    timeout: number;
}

class ApiService {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    async request(url: string) {
        const response = await fetch(url, {
            timeout: this.config.timeout
        });
        return response.json();
    }
}
```

编译后（JavaScript）：
```javascript
// interface Config 完全消失，仅保留类型信息
class ApiService {
    constructor(config) {
        this.config = config;
    }

    async request(url) {
        const response = await fetch(url, {
            timeout: this.config.timeout
        });
        return response.json();
    }
}
```

### 4. 访问修饰符
- interface 不支持访问修饰符（public、private、protected）
- class 支持访问修饰符，可控制成员的可见性

```typescript
class BankAccount {
    public balance: number;
    private accountNumber: string;
    protected owner: string;

    constructor(accountNumber: string, owner: string) {
        this.accountNumber = accountNumber;
        this.owner = owner;
        this.balance = 0;
    }

    private validateTransaction(amount: number): boolean {
        return amount > 0 && this.balance >= amount;
    }
}
```

### 5. 构造函数
- interface 不能定义构造函数
- class 必须有构造函数（或使用默认构造函数）

### 6. 静态成员
- interface 不能包含静态成员
- class 可以定义静态属性和方法

```typescript
class MathUtils {
    static PI = 3.14159;

    static calculateArea(radius: number): number {
        return this.PI * radius * radius;
    }
}
```

### 7. 实际应用场景
- interface 适用于定义 API 契约、组件 props 类型、回调函数结构等
- class 适用于需要封装状态和行为的场景，如服务类、工具类、组件类等

```typescript
// 使用 interface 定义组件 props
interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}

// 使用 class 创建服务
class UserService {
    async getUser(id: string): Promise<User> {
        const response = await fetch(`/api/users/${id}`);
        return response.json();
    }
}
```

### 8. 性能考虑
- interface 在运行时无开销，仅用于编译时类型检查
- class 在运行时占用内存，包含完整的原型链和方法定义
- interface 有助于减少 bundle 大小，因为编译后完全移除

理解 interface 和 class 的区别有助于在 TypeScript 项目中做出合适的设计决策，合理使用两者可以提高代码的可维护性和类型安全性。
