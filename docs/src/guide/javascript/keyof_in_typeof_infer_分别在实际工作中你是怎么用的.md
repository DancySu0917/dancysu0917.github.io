# keyof、in、typeof、infer 分别在实际工作中你是怎么用的？（了解）

**题目**: keyof、in、typeof、infer 分别在实际工作中你是怎么用的？（了解）

## 标准答案

- keyof：获取对象类型的键名联合类型，常用于类型安全的属性访问
- in：在映射类型中遍历联合类型的每个成员，用于创建新的对象类型
- typeof：获取变量或表达式的运行时类型，在类型定义中使用
- infer：在条件类型中进行类型推断，提取复杂类型中的子类型

## 深入理解

TypeScript 的高级类型操作符是实现类型安全和类型编程的核心工具，它们在实际开发中有着广泛的应用：

### 1. keyof 操作符
keyof 用于获取对象类型的键名，返回键名的联合类型。在实际工作中主要用于：

```typescript
// 类型安全的属性访问
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// 获取 User 的所有键名：'id' | 'name' | 'email' | 'age'
type UserKeys = keyof User;

// 创建类型安全的 getter 函数
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user: User = { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 };
const userName = getProperty(user, 'name'); // 类型为 string

// 动态属性操作
function updateObject<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
    return { ...obj, [key]: value } as T;
}
```

### 2. in 操作符
in 用于在映射类型中遍历联合类型的每个成员，创建新的对象类型：

```typescript
// 创建只读版本的类型
type MakeReadonly<T> = {
    readonly [K in keyof T]: T[K];
};

type ReadonlyUser = MakeReadonly<User>;

// 条件映射类型 - 添加可选属性
type PartialWithPrefix<T> = {
    [K in keyof T as `optional${Capitalize<string & K>}`]?: T[K];
};

// 结果类型：{ optionalId?: number; optionalName?: string; optionalEmail?: string; optionalAge?: number; }

// 过滤属性类型
type StringKeys<T> = {
    [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type StringUserProps = StringKeys<User>; // { name: string; email: string; }
```

### 3. typeof 操作符
typeof 获取变量或表达式的运行时类型，常用于类型复用：

```typescript
// 从现有变量推导类型
const response = {
    data: { id: 1, name: 'Product A' },
    status: 200,
    timestamp: new Date()
};

type ResponseType = typeof response; // 完整的响应类型
type DataType = typeof response.data; // { id: number; name: string; }

// 函数返回值类型推导
function getUserInfo() {
    return {
        id: 1,
        name: 'Alice',
        profile: {
            avatar: 'avatar.jpg',
            bio: 'Frontend developer'
        }
    };
}

type UserInfo = typeof getUserInfo; // 函数类型
type UserInfoResult = ReturnType<typeof getUserInfo>; // 函数返回值类型

// 在泛型中使用
function processResponse<T extends Record<string, any>>(
    data: T,
    processor: (input: typeof data) => any
) {
    return processor(data);
}
```

### 4. infer 操作符
infer 用于在条件类型中进行类型推断，是最强大的类型工具之一：

```typescript
// 提取函数返回值类型
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type StringFunc = () => string;
type NumberFunc = (x: number) => number;

type StringReturn = GetReturnType<StringFunc>; // string
type NumberReturn = GetReturnType<NumberFunc>; // number

// 提取 Promise 解包后的类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type ApiResponse = Promise<User>;
type Unwrapped = UnwrapPromise<ApiResponse>; // User

// 提取数组元素类型
type ArrayElementType<T> = T extends (infer U)[] ? U : T;

type UserArray = User[];
type SingleUser = ArrayElementType<UserArray>; // User

// 提取参数类型
type GetParameters<T> = T extends (...args: infer P) => any ? P : never;

type UpdateUser = (id: number, user: User, options?: { validate: boolean }) => boolean;
type UpdateParams = GetParameters<UpdateUser>; // [number, User, { validate?: boolean }]

// 复杂的嵌套类型提取
type UnwrapAll<T> = T extends Promise<infer U>
    ? UnwrapAll<U>
    : T extends (infer U)[]
    ? UnwrapAll<U>
    : T;

type Nested = Promise<User[]>;
type UnwrappedNested = UnwrapAll<Nested>; // User
```

### 5. 实际项目应用示例

#### API 响应类型处理
```typescript
// 定义通用的 API 响应结构
interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    meta?: {
        timestamp: Date;
        requestId: string;
    };
}

// 从响应中提取数据类型
type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;

// 使用示例
type UserResponse = ApiResponse<User>;
type UserData = ExtractData<UserResponse>; // User
```

#### 状态管理类型安全
```typescript
// Redux 状态类型定义
interface AppState {
    user: User | null;
    posts: Post[];
    ui: {
        loading: boolean;
        theme: 'light' | 'dark';
    };
}

// 创建状态选择器的类型安全函数
type StateSelector<T> = (state: AppState) => T;

function createSelector<T>(selector: StateSelector<T>) {
    return selector;
}

// 类型安全的状态访问
const userSelector = createSelector(state => state.user); // 类型为 (state: AppState) => User | null
const postCountSelector = createSelector(state => state.posts.length); // 类型为 (state: AppState) => number
```

#### 组件 Props 类型推导
```typescript
// React 组件的 props 类型推导
type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

// 高阶组件类型推导
function withLoading<T extends Record<string, any>>(
    Component: React.ComponentType<T>
) {
    return (props: Omit<T, 'loading'>) => {
        // 实现逻辑
    };
}

// 从组件推导 props 类型
type ButtonProps = {
    text: string;
    onClick: () => void;
    disabled?: boolean;
};

type EnhancedButtonProps = Omit<ButtonProps, 'loading'>; // { text: string; onClick: () => void; disabled?: boolean; }
```

#### 条件类型与联合类型处理
```typescript
// 联合类型分发
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>; // string[] | number[]

// 实用工具类型
type NonNullable<T> = T extends null | undefined ? never : T;
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;

// 参数类型转换
type MergeArgs<T, U> = {
    [K in keyof (T & U)]: K extends keyof T ? T[K] : K extends keyof U ? U[K] : never;
};
```

### 6. 最佳实践建议

1. **优先使用内置工具类型**：TypeScript 提供了许多内置工具类型，如 `Partial<T>`, `Pick<T, K>`, `Omit<T, K>` 等
2. **创建可复用的类型工具**：将常用的类型操作封装成工具类型
3. **类型安全优于便利性**：在类型安全和代码简洁之间，优先保证类型安全
4. **文档化复杂类型**：对于复杂的类型操作，添加注释说明其用途

```typescript
// 实用的类型工具库示例
type SafePick<T, K extends keyof T> = Pick<T, K>;
type SafeOmit<T, K extends keyof T> = Omit<T, K>;

// 条件类型工具
type IfEquals<X, Y, A = X, B = never> = 
    (<T>() => T extends X ? 1 : 2) extends 
    (<T>() => T extends Y ? 1 : 2) ? A : B;

// 深度只读类型
type DeepReadonly<T> = T extends (infer R)[]
    ? DeepReadonlyArray<R>
    : T extends Record<string, any>
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
```

理解这些高级类型操作符有助于编写更安全、更灵活的 TypeScript 代码，特别是在大型项目和库开发中，它们是实现类型安全的核心工具。
