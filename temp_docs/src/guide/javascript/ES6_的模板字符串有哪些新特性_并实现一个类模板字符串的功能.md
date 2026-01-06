# ES6 的模板字符串有哪些新特性？并实现一个类模板字符串的功能（必会）

**题目**: ES6 的模板字符串有哪些新特性？并实现一个类模板字符串的功能（必会）

## 标准答案

ES6 模板字符串的新特性：

1. **多行字符串**：使用反引号定义，支持真正的多行字符串
2. **字符串插值**：使用 `${expression}` 语法插入变量和表达式
3. **表达式计算**：插值中可以包含任意 JavaScript 表达式
4. **标签模板**：可以使用函数处理模板字符串
5. **嵌套模板**：可以在模板字符串中嵌套使用

## 深入理解

### 基本语法和多行字符串

```javascript
// 传统字符串拼接
const traditionalString = 'Hello, ' + 
                        'world! ' + 
                        'This is a ' + 
                        'multi-line string.';

// ES6 模板字符串
const templateString = `Hello, world!
This is a multi-line string.
No need for concatenation.`;

// 多行字符串的真实换行
const poem = `春眠不觉晓，
处处闻啼鸟。
夜来风雨声，
花落知多少。`;

console.log(templateString);
console.log(poem);

// 在模板字符串中转义
const escaped = `This is a backtick: \`
And this is a dollar and braces: \${expression}`;
```

### 字符串插值

```javascript
const name = 'Alice';
const age = 25;
const city = 'Beijing';

// 基本插值
const greeting = `Hello, my name is ${name} and I'm ${age} years old.`;

// 表达式计算
const message = `Next year I'll be ${age + 1} years old.`;

// 函数调用
const info = `I live in ${city.toUpperCase()}.`;

// 复杂表达式
const calculation = `The result of (5 + 3) * 2 is ${(5 + 3) * 2}.`;

// 条件表达式
const status = `User is ${age >= 18 ? 'adult' : 'minor'}.`;

// 对象属性访问
const user = { name: 'Bob', profile: { age: 30 } };
const userDetails = `User: ${user.name}, Age: ${user.profile.age}`;

// 数组操作
const numbers = [1, 2, 3, 4, 5];
const summary = `Array has ${numbers.length} elements, sum is ${numbers.reduce((a, b) => a + b, 0)}.`;

console.log(greeting); // Hello, my name is Alice and I'm 25 years old.
console.log(message); // Next year I'll be 26 years old.
console.log(info); // I live in BEIJING.
console.log(calculation); // The result of (5 + 3) * 2 is 16.
console.log(status); // User is adult.
```

### 标签模板（Tagged Templates）

```javascript
// 基本标签函数
function highlight(strings, ...values) {
    console.log('Strings:', strings); // 模板中除插值外的部分
    console.log('Values:', values);   // 插值表达式的值
    
    let result = '';
    for (let i = 0; i < values.length; i++) {
        result += strings[i] + `<mark>${values[i]}</mark>`;
    }
    result += strings[strings.length - 1]; // 添加最后一个字符串部分
    return result;
}

const name = 'Alice';
const age = 25;
const highlighted = highlight`Hello, ${name}! You are ${age} years old.`;
console.log(highlighted);
// 输出: Hello, <mark>Alice</mark>! You are <mark>25</mark> years old.

// 实际应用：HTML 转义
function safeHTML(strings, ...values) {
    const escapeHtml = (str) => {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };
    
    let result = '';
    for (let i = 0; i < values.length; i++) {
        result += strings[i] + escapeHtml(values[i]);
    }
    result += strings[strings.length - 1];
    return result;
}

const userInput = '<script>alert("XSS")</script>';
const safeOutput = safeHTML`User input: ${userInput}`;
console.log(safeOutput); // User input: &lt;script&gt;alert("XSS")&lt;/script&gt;

// 实际应用：国际化
function i18n(strings, ...values) {
    // 简化版国际化处理
    const translations = {
        'Welcome': '欢迎',
        'Hello': '你好'
    };
    
    let result = '';
    for (let i = 0; i < values.length; i++) {
        const translated = translations[strings[i].trim()] || strings[i];
        result += translated + values[i];
    }
    const lastString = strings[strings.length - 1];
    result += translations[lastString.trim()] || lastString;
    return result;
}

const greetingCN = i18n`Hello, ${name}! Welcome to our site.`;
console.log(greetingCN);
```

### 模板字符串的高级应用

```javascript
// 实现简单的模板引擎
function createTemplate(templateStr) {
    return function(data) {
        // 将模板中的变量替换为数据对象中的值
        return templateStr.replace(/\$\{([^}]+)\}/g, (match, expr) => {
            try {
                // 安全地执行表达式（仅限简单属性访问）
                const keys = expr.trim().split('.');
                let value = data;
                for (const key of keys) {
                    value = value[key];
                    if (value === undefined) break;
                }
                return value !== undefined ? value : '';
            } catch (e) {
                return '';
            }
        });
    };
}

const template = createTemplate(`
    <div>
        <h1>${name}</h1>
        <p>Age: ${age}</p>
        <p>City: ${address.city}</p>
    </div>
`);

const data = {
    name: 'Alice',
    age: 25,
    address: { city: 'Beijing' }
};

console.log(template(data));

// 实现条件渲染的模板
function conditionalTemplate(strings, ...expressions) {
    let result = '';
    for (let i = 0; i < expressions.length; i++) {
        result += strings[i];
        
        // 处理条件表达式
        if (typeof expressions[i] === 'object' && expressions[i].hasOwnProperty('condition')) {
            if (expressions[i].condition) {
                result += expressions[i].content;
            }
        } else {
            result += expressions[i];
        }
    }
    result += strings[strings.length - 1];
    return result;
}

// 使用示例
const user = { name: 'Alice', isAdmin: true };
const templateResult = conditionalTemplate`
    <div>
        <p>Hello, ${user.name}!</p>
        ${user.isAdmin ? { condition: true, content: '<p>Admin panel</p>' } : { condition: false, content: '' }}
    </div>
`;
console.log(templateResult);
```

### 实现类模板字符串功能

```javascript
// 方法1: 使用正则表达式实现简单的模板字符串功能
function simpleTemplate(str, data) {
    return str.replace(/\$\{([^}]+)\}/g, (match, expr) => {
        // 简单的表达式求值
        try {
            // 创建一个函数来安全地求值
            const func = new Function(...Object.keys(data), `return ${expr};`);
            return func(...Object.values(data));
        } catch (e) {
            console.warn(`Error evaluating expression: ${expr}`);
            return '';
        }
    });
}

// 使用示例
const templateStr = 'Hello, ${name}! You are ${age} years old.';
const result1 = simpleTemplate(templateStr, { name: 'Alice', age: 25 });
console.log(result1); // Hello, Alice! You are 25 years old.

// 方法2: 更安全的模板实现
class Template {
    constructor(templateString) {
        this.templateString = templateString;
        this.parsed = this.parseTemplate(templateString);
    }
    
    parseTemplate(str) {
        // 将模板字符串解析为字符串片段和表达式片段
        const regex = /\$\{([^}]+)\}/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(str)) !== null) {
            // 添加普通字符串部分
            if (match.index > lastIndex) {
                parts.push({ type: 'string', value: str.slice(lastIndex, match.index) });
            }
            
            // 添加表达式部分
            parts.push({ type: 'expression', value: match[1].trim() });
            lastIndex = match.index + match[0].length;
        }
        
        // 添加最后的字符串部分
        if (lastIndex < str.length) {
            parts.push({ type: 'string', value: str.slice(lastIndex) });
        }
        
        return parts;
    }
    
    render(data) {
        return this.parsed.map(part => {
            if (part.type === 'string') {
                return part.value;
            } else if (part.type === 'expression') {
                try {
                    // 安全地求值表达式
                    return this.evaluateExpression(part.value, data);
                } catch (e) {
                    console.warn(`Error evaluating expression: ${part.value}`, e);
                    return '';
                }
            }
        }).join('');
    }
    
    evaluateExpression(expr, data) {
        // 安全的表达式求值实现
        // 支持属性访问和简单操作
        const context = { ...data };
        
        // 使用 with 语句（注意：在严格模式下不推荐，这里仅作演示）
        // 实际项目中应使用更安全的方法
        return new Function(...Object.keys(context), `return (${expr})`)(...Object.values(context));
    }
}

// 使用 Template 类
const templateInstance = new Template('Hello, ${name}! You are ${age} years old. In 5 years, you will be ${age + 5}.');
const result2 = templateInstance.render({ name: 'Alice', age: 25 });
console.log(result2); // Hello, Alice! You are 25 years old. In 5 years, you will be 30.

// 方法3: 支持更多功能的模板类
class AdvancedTemplate {
    constructor(templateString) {
        this.templateString = templateString;
        this.parsed = this.parseTemplate(templateString);
    }
    
    parseTemplate(str) {
        const regex = /\$\{([^}]+)\}/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(str)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: 'string', value: str.slice(lastIndex, match.index) });
            }
            
            parts.push({ type: 'expression', value: match[1].trim() });
            lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < str.length) {
            parts.push({ type: 'string', value: str.slice(lastIndex) });
        }
        
        return parts;
    }
    
    render(data) {
        const context = { ...data, ...this.getHelpers() };
        
        return this.parsed.map(part => {
            if (part.type === 'string') {
                return part.value;
            } else if (part.type === 'expression') {
                try {
                    const func = new Function(...Object.keys(context), `return (${part.value})`);
                    return func(...Object.values(context));
                } catch (e) {
                    console.warn(`Error evaluating expression: ${part.value}`, e);
                    return '';
                }
            }
        }).join('');
    }
    
    getHelpers() {
        return {
            // 工具函数
            upper: (str) => String(str).toUpperCase(),
            lower: (str) => String(str).toLowerCase(),
            capitalize: (str) => String(str).charAt(0).toUpperCase() + String(str).slice(1).toLowerCase(),
            join: (arr, separator = ', ') => arr.join(separator),
            // 条件函数
            if: (condition, trueValue, falseValue) => condition ? trueValue : falseValue,
            // 数组工具
            map: (arr, callback) => arr.map(callback),
            filter: (arr, callback) => arr.filter(callback)
        };
    }
}

// 使用高级模板
const advancedTemplate = new AdvancedTemplate(`
    <div>
        <h1>${upper(title)}</h1>
        <p>${if(isAdmin, 'Admin User', 'Regular User')}</p>
        <ul>
            ${join(items, ', ')}
        </ul>
    </div>
`);

const advancedResult = advancedTemplate.render({
    title: 'welcome page',
    isAdmin: true,
    items: ['apple', 'banana', 'orange']
});

console.log(advancedResult);
```

### 模板字符串的性能考虑

```javascript
// 性能对比：模板字符串 vs 传统字符串拼接
function performanceTest() {
    const name = 'Alice';
    const age = 25;
    const city = 'Beijing';
    
    console.time('Template String');
    for (let i = 0; i < 100000; i++) {
        const str = `Hello, ${name}! You are ${age} years old and live in ${city}.`;
    }
    console.timeEnd('Template String');
    
    console.time('String Concatenation');
    for (let i = 0; i < 100000; i++) {
        const str = 'Hello, ' + name + '! You are ' + age + ' years old and live in ' + city + '.';
    }
    console.timeEnd('String Concatenation');
    
    console.time('Array Join');
    for (let i = 0; i < 100000; i++) {
        const str = ['Hello, ', name, '! You are ', age, ' years old and live in ', city, '.'].join('');
    }
    console.timeEnd('Array Join');
}

// performanceTest(); // 取消注释以运行性能测试
```

### 模板字符串的常见陷阱

```javascript
// 1. 空格和换行符
const templateWithSpaces = `
    Line 1
    Line 2
    Line 3
`;
console.log(templateWithSpaces);
// 会包含前导和尾随的换行符以及每行前的空格

// 2. 模板字符串中不能使用反斜杠转义某些字符
// const invalid = `This is a backtick: \` and this is a quote: \"`;

// 3. 表达式中的错误处理
const riskyTemplate = `Result: ${undefinedProperty}`; // 会抛出错误
// 安全的做法
const safeTemplate = `Result: ${typeof undefinedProperty !== 'undefined' ? undefinedProperty : 'N/A'}`;

// 4. 在标签模板中，表达式可能为 undefined
function tag(strings, ...values) {
    console.log(strings, values); // values 中的某些值可能为 undefined
}
tag`Hello ${undefined} world`;
```
