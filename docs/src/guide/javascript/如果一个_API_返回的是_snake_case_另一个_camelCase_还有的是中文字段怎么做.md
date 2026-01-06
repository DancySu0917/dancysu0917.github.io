# 如果一个 API 返回的是 snake_case、另一个 camelCase 还有的是中文字段怎么做统一转换？（了解）

**题目**: 如果一个 API 返回的是 snake_case、另一个 camelCase 还有的是中文字段怎么做统一转换？（了解）

## 答案

在实际项目中，经常遇到不同 API 返回的数据格式不一致的问题，比如有的返回 snake_case，有的返回 camelCase，甚至还有中文字段。为了保持前端代码的一致性，我们需要统一转换这些数据格式。以下是几种解决方案：

### 1. 递归转换函数

```javascript
// snake_case 转 camelCase
function snakeToCamel(str) {
  if (typeof str !== 'string') return str;
  
  // 处理中文字段（可以转换为拼音或保留原样）
  if (/[\u4e00-\u9fa5]/.test(str)) {
    // 可以选择保留中文或转换为拼音，这里保留原样
    return str;
  }
  
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// camelCase 转 snake_case
function camelToSnake(str) {
  if (typeof str !== 'string') return str;
  
  // 处理中文字段
  if (/[\u4e00-\u9fa5]/.test(str)) {
    return str;
  }
  
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// 递归转换对象/数组中的所有键
function convertKeys(obj, converter) {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeys(item, converter));
  } else if (obj !== null && typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = converter(key);
        converted[newKey] = convertKeys(obj[key], converter);
      }
    }
    return converted;
  }
  return obj;
}

// 统一转换为 camelCase
function normalizeToCamelCase(data) {
  return convertKeys(data, snakeToCamel);
}

// 统一转换为 snake_case
function normalizeToSnakeCase(data) {
  return convertKeys(data, camelToSnake);
}

// 使用示例
const apiResponse = {
  user_name: 'John',
  user_info: {
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '123-456-7890',
    '用户地址': '北京市'
  },
  orders: [
    { order_id: 1, order_date: '2023-01-01' },
    { order_id: 2, order_date: '2023-01-02' }
  ]
};

const normalized = normalizeToCamelCase(apiResponse);
console.log(normalized);
// 输出: { userName: 'John', userInfo: { firstName: 'John', ... }, orders: [...] }
```

### 2. 使用 axios 拦截器统一处理

```javascript
import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create();

// 响应拦截器：自动转换 API 响应的数据格式
apiClient.interceptors.response.use(
  response => {
    // 只处理 JSON 响应
    if (response.headers['content-type']?.includes('application/json')) {
      response.data = normalizeToCamelCase(response.data);
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

// 请求拦截器：自动转换请求数据格式（如果需要）
apiClient.interceptors.request.use(
  config => {
    if (config.data && typeof config.data === 'object') {
      config.data = normalizeToSnakeCase(config.data);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
```

### 3. 更灵活的转换器

```javascript
class DataNormalizer {
  constructor(options = {}) {
    this.snakeToCamel = options.snakeToCamel !== false;
    this.camelToSnake = options.camelToSnake !== false;
    this.handleChinese = options.handleChinese || this.defaultChineseHandler;
  }
  
  defaultChineseHandler(str) {
    // 默认处理中文：保留原样
    return str;
  }
  
  // 高级转换函数，支持自定义规则
  convert(obj, customRules = {}) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convert(item, customRules));
    } else if (obj !== null && typeof obj === 'object') {
      const converted = {};
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          let newKey = key;
          
          // 应用自定义规则
          if (customRules[key]) {
            newKey = customRules[key];
          } else if (/[\u4e00-\u9fa5]/.test(key)) {
            // 处理中文字段
            newKey = this.handleChinese(key);
          } else if (this.snakeToCamel) {
            // snake_case 转 camelCase
            newKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
          }
          
          converted[newKey] = this.convert(obj[key], customRules);
        }
      }
      
      return converted;
    }
    
    return obj;
  }
  
  // 转换为 camelCase
  toCamelCase(obj, customRules = {}) {
    return this.convert(obj, customRules);
  }
  
  // 转换为 snake_case
  toSnakeCase(obj, customRules = {}) {
    // 这里实现 snake_case 转换逻辑
    if (Array.isArray(obj)) {
      return obj.map(item => this.toSnakeCase(item, customRules));
    } else if (obj !== null && typeof obj === 'object') {
      const converted = {};
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          let newKey = key;
          
          if (customRules[key]) {
            newKey = customRules[key];
          } else if (/[\u4e00-\u9fa5]/.test(key)) {
            newKey = this.handleChinese(key);
          } else {
            // camelCase 转 snake_case
            newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          }
          
          converted[newKey] = this.toSnakeCase(obj[key], customRules);
        }
      }
      
      return converted;
    }
    
    return obj;
  }
}

// 使用示例
const normalizer = new DataNormalizer();

const data = {
  user_name: 'John',
  '用户信息': {
    first_name: 'John',
    last_name: 'Doe'
  }
};

const result = normalizer.toCamelCase(data);
console.log(result);
```

### 4. 使用第三方库

也可以使用现成的库来处理：

```javascript
// 使用 lodash 或其他工具库
import { mapKeys, isObject, isArray } from 'lodash';

function deepMapKeys(obj, fn) {
  if (isArray(obj)) {
    return obj.map(value => deepMapKeys(value, fn));
  } else if (isObject(obj) && obj !== null) {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = fn(key);
        result[newKey] = deepMapKeys(obj[key], fn);
      }
    }
    return result;
  }
  return obj;
}

// 使用示例
const transformed = deepMapKeys(apiResponse, snakeToCamel);
```

### 5. 针对中文字段的特殊处理

```javascript
// 中文字段处理工具
class ChineseFieldHandler {
  // 将中文转换为拼音（需要引入拼音库如 pinyin）
  static chineseToPinyin(chinese) {
    // 这里需要引入拼音库
    // return pinyin(chinese, { style: pinyin.STYLE_NORMAL }).join('_');
    return chinese; // 暂时保留原样
  }
  
  // 创建中文字段映射
  static createFieldMapping() {
    return {
      '用户姓名': 'userName',
      '用户信息': 'userInfo',
      '订单号': 'orderId',
      '创建时间': 'createTime',
      // 更多映射...
    };
  }
  
  // 根据映射转换中文字段
  static convertChineseFields(obj, fieldMapping = this.createFieldMapping()) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertChineseFields(item, fieldMapping));
    } else if (obj !== null && typeof obj === 'object') {
      const converted = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = fieldMapping[key] || key; // 如果有映射则使用，否则保留原样
          converted[newKey] = this.convertChineseFields(obj[key], fieldMapping);
        }
      }
      return converted;
    }
    return obj;
  }
}

// 使用示例
const chineseMapped = ChineseFieldHandler.convertChineseFields(apiResponse);
```

### 6. 完整的解决方案

```javascript
// 综合解决方案
class APIDataNormalizer {
  static normalize(data, options = {}) {
    const {
      toCamelCase = true,
      fieldMapping = {},
      customConverter = null
    } = options;
    
    function convert(obj) {
      if (Array.isArray(obj)) {
        return obj.map(item => convert(item));
      } else if (obj !== null && typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            let newKey = key;
            
            // 应用自定义映射
            if (fieldMapping[key]) {
              newKey = fieldMapping[key];
            } else if (customConverter) {
              newKey = customConverter(key);
            } else if (toCamelCase) {
              // 默认转换为 camelCase
              newKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            }
            
            result[newKey] = convert(obj[key]);
          }
        }
        return result;
      }
      return obj;
    }
    
    return convert(data);
  }
}

// 使用示例
const fieldMapping = {
  '用户姓名': 'userName',
  '用户信息': 'userInfo'
};

const normalizedData = APIDataNormalizer.normalize(apiResponse, {
  toCamelCase: true,
  fieldMapping
});
```

### 7. 最佳实践建议

1. **统一处理点**：在 HTTP 拦截器中统一处理，避免在每个 API 调用处重复转换
2. **性能考虑**：对于大型数据集，考虑使用更高效的转换算法
3. **错误处理**：确保转换函数能处理各种边界情况
4. **可配置性**：提供灵活的配置选项以适应不同 API 的需求
5. **文档化**：记录转换规则，便于团队协作

这种统一的数据格式转换策略可以确保前端代码的一致性和可维护性。