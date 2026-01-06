# interface 和 type 的区别？（高薪常问）

**题目**: interface 和 type 的区别？（高薪常问）

## 标准答案

interface 和 type alias 在 TypeScript 中都用于定义类型，但有以下关键区别：
- interface 只能定义对象形状，type 可以定义原始类型、联合类型、元组等任何类型
- interface 支持声明合并，多个同名 interface 会自动合并，type 不支持
- interface 只能继承其他 interface，type 可以使用交叉类型组合任意类型
- interface 在扩展时更直观，type 在复杂类型组合时更灵活
- 两者编译后都不产生运行时代码

## 深入理解

interface 和 type alias 是 TypeScript 中定义类型的两种方式，虽然功能有重叠，但在使用场景和特性上有显著差异：

### 1. 基本定义能力
- interface 主要用于定义对象的结构
- type 可以定义更广泛的类型，包括原始类型、联合类型、元组等

```typescript
// interface 只能定义对象结构
interface User {
    name: string;
    age: number;
}

// type 可以定义各种类型
type Name = string;
type Age = number;
type Status = 'active' | 'inactive' | 'pending';
type Coordinates = [number, number, number];
type Callback = (data: string) => void;
```

### 2. 声明合并（Declaration Merging）
- interface 支持同名合并，可以逐步扩展定义
- type 不支持声明合并，重复定义会报错

```typescript
// interface 声明合并
interface Config {
    apiUrl: string;
}

interface Config {
    timeout: number;
}

// 最终 Config 等同于：
// interface Config {
//     apiUrl: string;
//     timeout: number;
// }

const config: Config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000
};

// type 不支持合并，以下代码会报错
type Settings = {
    theme: string;
};

// 错误：不能重复定义
// type Settings = {
//     language: string;
// };
```

### 3. 继承和扩展方式
- interface 使用 extends 关键字继承
- type 使用交叉类型（&）组合

```typescript
// interface 继承
interface Shape {
    color: string;
}

interface Circle extends Shape {
    radius: number;
}

// type 交叉类型
type ShapeType = {
    color: string;
};

type CircleType = ShapeType & {
    radius: number;
};

// type 也可以组合多个类型
type Timestamped = {
    createdAt: Date;
    updatedAt: Date;
};

type Versioned = {
    version: number;
};

type Entity = ShapeType & Timestamped & Versioned;
```

### 4. 联合类型处理
- interface 无法直接表达联合类型
- type 天然支持联合类型定义

```typescript
// type 定义联合类型
type Result<T> = 
    | { success: true; data: T }
    | { success: false; error: string };

type ApiResponse = Result<User[]>;

// interface 需要通过其他方式实现
interface SuccessResponse<T> {
    success: true;
    data: T;
}

interface ErrorResponse {
    success: false;
    error: string;
}

type ApiResponseInterface = SuccessResponse<User[]> | ErrorResponse;
```

### 5. 实现类的能力
- interface 可以被类实现（implements）
- type 通常不能被类直接实现（除非是对象类型别名）

```typescript
interface Drawable {
    draw(): void;
    area: number;
}

class Circle implements Drawable {
    constructor(public radius: number) {}
    
    draw() {
        console.log(`Drawing circle with radius ${this.radius}`);
    }
    
    get area() {
        return Math.PI * this.radius ** 2;
    }
}

// type 作为对象类型时也可以实现，但不推荐
type DrawableType = {
    draw(): void;
    area: number;
};

class Square implements DrawableType {
    constructor(public side: number) {}
    
    draw() {
        console.log(`Drawing square with side ${this.side}`);
    }
    
    get area() {
        return this.side ** 2;
    }
}
```

### 6. 索引类型和映射类型
- 两者都支持索引类型和映射类型
- 在复杂映射类型场景下，type 通常更灵活

```typescript
// 两者都支持索引类型
interface Dictionary<T> {
    [key: string]: T;
}

type NumberDictionary = {
    [key: string]: number;
};

// 映射类型 - 两者都支持
type Partial<T> = {
    [P in keyof T]?: T[P];
};

type ReadOnly<T> = {
    readonly [P in keyof T]: T[P];
};

interface User {
    name: string;
    email: string;
    age: number;
}

type PartialUser = Partial<User>;
type ReadOnlyUser = ReadOnly<User>;
```

### 7. 泛型支持
- 两者都支持泛型参数
- 使用方式略有不同

```typescript
// interface 泛型
interface Container<T> {
    value: T;
    add: (item: T) => void;
}

// type 泛型
type ContainerType<T> = {
    value: T;
    add: (item: T) => void;
};

// 泛型约束
interface Response<T extends Record<string, any>> {
    data: T;
    status: number;
}
```

### 8. 工具类型互操作
- 两者在工具类型中可以互换使用
- 但在某些高级类型操作中可能有细微差异

```typescript
// keyof 操作符
interface Person {
    name: string;
    age: number;
}

type PersonKeys = keyof Person; // "name" | "age"

// typeof 操作符
const obj = { name: 'Alice', age: 30 };
type ObjType = typeof obj; // { name: string; age: number }

// extends 条件类型
type IsString<T> = T extends string ? true : false;
type Test = IsString<'hello'>; // true
```

### 9. 实际使用建议
- 优先使用 interface 定义对象形状，特别是需要被类实现时
- 使用 type 定义联合类型、原始类型别名、复杂类型组合
- 当需要声明合并时使用 interface
- 在库或框架设计中，interface 更适合公开 API 定义

```typescript
// 推荐的使用模式
interface ComponentProps {
    className?: string;
    children?: React.ReactNode;
}

type Status = 'loading' | 'success' | 'error';
type ApiResponse<T> = 
    | { status: 'success'; data: T }
    | { status: 'error'; message: string };

interface ComponentState {
    status: Status;
    data?: any;
}
```

### 10. 性能和编译产物
- 两者在编译后都不产生运行时代码
- 对最终 bundle 大小没有影响
- 类型检查性能基本相同

理解 interface 和 type 的区别有助于在 TypeScript 项目中选择合适的类型定义方式，提高代码的可读性和可维护性。
