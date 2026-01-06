# 你在开发过程中，使用过哪些 TS 的特性或者能力？（了解）

**题目**: 你在开发过程中，使用过哪些 TS 的特性或者能力？（了解）

## 标准答案

在开发过程中，我使用过TypeScript的多种特性，包括：类型注解（基础类型、接口、联合类型）、泛型（函数泛型、类泛型、约束泛型）、接口（继承、可选属性、索引签名）、装饰器（类装饰器、方法装饰器、属性装饰器）、命名空间和模块、高级类型（交叉类型、条件类型、映射类型）、类型守卫、枚举、类和继承等。这些特性提高了代码的可维护性、可读性和安全性。

## 深入理解

TypeScript作为JavaScript的超集，提供了丰富的静态类型检查功能，大大提升了代码质量和开发效率。以下是我在开发中经常使用的TypeScript特性：

### 1. 基础类型系统

```typescript
// 原始类型
let isDone: boolean = false;
let count: number = 123;
let name: string = 'TypeScript';
let list: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3]; // 泛型写法

// 元组
let tuple: [string, number] = ['hello', 10];

// 枚举
enum Color { Red = 1, Green = 2, Blue = 4 }
let c: Color = Color.Green;

// 任意类型和联合类型
let notSure: any = 4;
let value: string | number = 'hello';
value = 123; // 可以是string或number

// void、null、undefined
function warnUser(): void {
    console.log('This is a warning message');
}
```

### 2. 接口（Interface）

```typescript
// 基础接口
interface User {
    readonly id: number; // 只读属性
    name: string;
    age?: number; // 可选属性
    [propName: string]: any; // 索引签名
}

// 函数类型接口
interface SearchFunc {
    (source: string, subString: string): boolean;
}

let mySearch: SearchFunc = function(src: string, sub: string): boolean {
    return src.search(sub) !== -1;
};

// 接口继承
interface Shape {
    color: string;
}

interface Square extends Shape {
    sideLength: number;
}

let square: Square = { color: 'blue', sideLength: 10 };
```

### 3. 泛型（Generics）

```typescript
// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}

let output1 = identity<string>('hello'); // 类型为 string
let output2 = identity(42); // 类型推断为 number

// 泛型类
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

// 泛型约束
interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length); // 现在知道参数有length属性
    return arg;
}

// 在泛型约束中使用类型参数
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}

let x = { a: 1, b: 2, c: 3 };
let a = getProperty(x, 'a'); // ok
// let z = getProperty(x, 'm'); // error
```

### 4. 类和继承

```typescript
// 基础类
class Animal {
    protected name: string;
    private species: string;
    static maxAge: number = 20; // 静态属性
    
    constructor(name: string, species: string) {
        this.name = name;
        this.species = species;
    }
    
    move(distance: number = 0) {
        console.log(`${this.name} moved ${distance}m.`);
    }
}

// 继承
class Dog extends Animal {
    constructor(name: string) {
        super(name, 'Canine'); // 派生类的构造函数必须调用super()
    }
    
    bark() {
        console.log('Woof! Woof!');
    }
    
    move(distance = 5) {
        console.log('Running...');
        super.move(distance);
    }
}

// 抽象类
abstract class Department {
    constructor(public name: string) {}
    
    printName(): void {
        console.log('Department name: ' + this.name);
    }
    
    abstract printMeeting(): void; // 必须在派生类中实现
}
```

### 5. 装饰器（Decorators）

```typescript
// 类装饰器
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
}

// 方法装饰器
function enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}

class Person {
    name: string;
    constructor(name: string) { 
        this.name = name; 
    }
    
    @enumerable(false)
    greet() {
        return `Hello, ${this.name}`;
    }
}

// 属性装饰器
function format(target: any, propertyKey: string) {
    let value: string;

    const getter = function() {
        return value;
    };

    const setter = function(newVal: string) {
        value = newVal.toUpperCase();
    };

    Object.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });
}

class Employee {
    @format
    name: string;
}
```

### 6. 高级类型

```typescript
// 交叉类型
interface ErrorHandling {
    success: boolean;
    error?: { message: string };
}

interface ArtworksData {
    artworks: { title: string }[];
}

type ArtworksResponse = ArtworksData & ErrorHandling;

// 联合类型与类型守卫
type NetworkLoading = {
    state: 'loading';
};

type NetworkSuccess = {
    state: 'success';
    response: {
        title: string;
        duration: number;
    };
};

type NetworkFailed = {
    state: 'failed';
    code: number;
};

type NetworkState = NetworkLoading | NetworkSuccess | NetworkFailed;

function handleNetworkResponse(networkState: NetworkState): string {
    // 类型守卫
    switch (networkState.state) {
        case 'loading':
            return 'Downloading...';
        case 'success':
            return `Downloaded ${networkState.response.title}`;
        case 'failed':
            return `Error ${networkState.code}`;
    }
}

// 映射类型
interface Person {
    name: string;
    age: number;
    location: string;
}

type PartialPerson = Partial<Person>; // 所有属性变为可选
type ReadonlyPerson = Readonly<Person>; // 所有属性变为只读
type PickPerson = Pick<Person, 'name' | 'age'>; // 选择特定属性

// 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;
type Exclude<T, U> = T extends U ? never : T;

// 工具类型
type MyPartial<T> = {
    [P in keyof T]?: T[P];
};

type MyReadonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

### 7. 模块和命名空间

```typescript
// 命名空间
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }

    const lettersRegexp = /^[A-Za-z]+$/;
    const numberRegexp = /^[0-9]+$/;

    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string) {
            return lettersRegexp.test(s);
        }
    }

    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string) {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
}

// 模块
export interface StringValidator {
    isAcceptable(s: string): boolean;
}

export const numberRegexp = /^[0-9]+$/;

export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}

// 使用模块
import { ZipCodeValidator, StringValidator } from './Validation';
```

### 8. 实际项目应用示例

```typescript
// React 组件类型定义
import React, { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface UserProps {
    userId: number;
    onUserUpdate: (user: User) => void;
}

const UserComponent: React.FC<UserProps> = ({ userId, onUserUpdate }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${userId}`);
                const userData: User = await response.json();
                setUser(userData);
                onUserUpdate(userData);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
};

// Redux 状态管理
interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: [],
    loading: false,
    error: null
};

type UserAction = 
    | { type: 'FETCH_USERS_START' }
    | { type: 'FETCH_USERS_SUCCESS'; payload: User[] }
    | { type: 'FETCH_USERS_ERROR'; payload: string };

const userReducer = (state: UserState = initialState, action: UserAction): UserState => {
    switch (action.type) {
        case 'FETCH_USERS_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_USERS_SUCCESS':
            return { ...state, loading: false, users: action.payload };
        case 'FETCH_USERS_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};
```

### 9. TypeScript配置和工具

```json
// tsconfig.json 配置示例
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 10. 最佳实践

1. **渐进式采用**：在现有JavaScript项目中逐步引入TypeScript
2. **类型定义文件**：为第三方库编写类型定义文件或使用@types包
3. **严格模式**：启用strict模式以获得更严格的类型检查
4. **类型推断**：充分利用TypeScript的类型推断能力
5. **接口设计**：合理设计接口以提高代码的可维护性

通过使用TypeScript的这些特性，可以显著提高代码的可读性、可维护性和可靠性，减少运行时错误，提升开发效率。
