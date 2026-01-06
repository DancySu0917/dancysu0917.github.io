# localStorage、sessionStorage、cookie 的区别？（必会）

## 标准答案

localStorage、sessionStorage和cookie是前端存储数据的三种主要方式，主要区别在于：1) 存储生命周期：localStorage持久存储，sessionStorage会话期间存储，cookie可设置过期时间；2) 存储大小：localStorage和sessionStorage约5-10MB，cookie仅4KB；3) 是否随请求发送：cookie会自动随请求发送，localStorage和sessionStorage不会；4) 作用域：cookie可设置domain和path，localStorage和sessionStorage仅限同源。

## 深入分析

### 1. 存储生命周期对比

- **localStorage**：永久存储，除非手动清除或卸载浏览器，数据不会过期
- **sessionStorage**：会话存储，仅在当前浏览器标签页/窗口有效，关闭后清除
- **cookie**：可设置过期时间，可为会话级（浏览器关闭清除）或持久性（到指定时间清除）

### 2. 存储容量对比

- **localStorage**：约5-10MB（不同浏览器略有差异）
- **sessionStorage**：约5-10MB
- **cookie**：单个cookie约4KB，总大小一般限制在4KB*50个左右

### 3. 传输特性对比

- **localStorage/sessionStorage**：仅存储在客户端，不会自动随HTTP请求发送
- **cookie**：每次HTTP请求都会携带，增加网络开销

### 4. 操作方式对比

- **localStorage/sessionStorage**：通过JavaScript API操作（setItem、getItem、removeItem等）
- **cookie**：可通过JavaScript操作，也可由服务端设置

## 代码示例

### 1. localStorage使用示例

```javascript
// localStorage基本操作
const localStorageManager = {
  // 设置数据
  set(key, value) {
    try {
      // 支持存储对象
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('localStorage设置失败:', error);
      return false;
    }
  },

  // 获取数据
  get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('localStorage读取失败:', error);
      return null;
    }
  },

  // 删除数据
  remove(key) {
    localStorage.removeItem(key);
  },

  // 清空所有数据
  clear() {
    localStorage.clear();
  },

  // 获取所有键
  getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    return keys;
  },

  // 检查存储空间使用情况
  getStorageInfo() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    return {
      itemCount: localStorage.length,
      totalSize: totalSize,
      approximateRemaining: (5 * 1024 * 1024) - totalSize // 假设5MB限制
    };
  }
};

// 使用示例
localStorageManager.set('userInfo', { id: 1, name: 'John', preferences: { theme: 'dark' } });
const userInfo = localStorageManager.get('userInfo');
console.log('用户信息:', userInfo);

// 监听storage事件
window.addEventListener('storage', function(e) {
  console.log('Storage changed:', e.key, e.oldValue, e.newValue, e.url);
});
```

### 2. sessionStorage使用示例

```javascript
// sessionStorage基本操作
const sessionStorageManager = {
  // 设置数据
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('sessionStorage设置失败:', error);
      return false;
    }
  },

  // 获取数据
  get(key) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('sessionStorage读取失败:', error);
      return null;
    }
  },

  // 删除数据
  remove(key) {
    sessionStorage.removeItem(key);
  },

  // 清空所有数据
  clear() {
    sessionStorage.clear();
  }
};

// 使用示例 - 表单数据临时存储
function setupFormPersistence(formId) {
  const form = document.getElementById(formId);
  
  // 页面加载时恢复表单数据
  window.addEventListener('load', () => {
    const formData = sessionStorageManager.get(`form_${formId}`);
    if (formData) {
      Object.keys(formData).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
          field.value = formData[key];
        }
      });
    }
  });

  // 监听表单变化并保存
  form.addEventListener('input', (e) => {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    sessionStorageManager.set(`form_${formId}`, data);
  });

  // 表单提交成功后清除数据
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // 提交表单逻辑...
    sessionStorageManager.remove(`form_${formId}`); // 清除临时数据
  });
}

// 页面间数据传递示例
function navigateWithState(url, stateData) {
  // 将状态数据存储到sessionStorage
  sessionStorageManager.set('navigationState', stateData);
  // 跳转页面
  window.location.href = url;
}

// 在目标页面获取传递的数据
function getNavigationState() {
  const state = sessionStorageManager.get('navigationState');
  if (state) {
    sessionStorageManager.remove('navigationState'); // 用完即删
    return state;
  }
  return null;
}
```

### 3. Cookie操作示例

```javascript
// Cookie工具类
class CookieManager {
  // 设置cookie
  static set(name, value, options = {}) {
    const { expires, path = '/', domain, secure, httpOnly, sameSite } = options;
    
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    // 设置过期时间
    if (expires) {
      if (typeof expires === 'number') {
        const date = new Date();
        date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
        cookieString += `; expires=${date.toUTCString()}`;
      } else {
        cookieString += `; expires=${expires.toUTCString()}`;
      }
    }
    
    // 设置路径
    cookieString += `; path=${path}`;
    
    // 设置域名
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    // 设置安全标志
    if (secure) {
      cookieString += '; secure';
    }
    
    // 设置SameSite属性
    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }
    
    document.cookie = cookieString;
  }

  // 获取cookie
  static get(name) {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }

  // 删除cookie
  static remove(name, path = '/', domain) {
    this.set(name, '', { 
      expires: new Date(0), 
      path, 
      domain 
    });
  }

  // 获取所有cookie
  static getAll() {
    const cookies = {};
    const all = document.cookie.split(';');
    
    all.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    });
    
    return cookies;
  }

  // 检查是否支持cookie
  static isSupported() {
    try {
      this.set('__test__', 'test');
      const result = this.get('__test__') === 'test';
      this.remove('__test__');
      return result;
    } catch (e) {
      return false;
    }
  }
}

// 使用示例
// 设置用户偏好设置
CookieManager.set('userPreferences', JSON.stringify({
  theme: 'dark',
  language: 'zh-CN',
  notifications: true
}), {
  expires: 30, // 30天后过期
  path: '/',
  sameSite: 'Lax'
});

// 获取用户偏好
const userPreferences = JSON.parse(CookieManager.get('userPreferences') || '{}');
console.log('用户偏好:', userPreferences);

// 设置会话cookie（浏览器关闭后清除）
CookieManager.set('sessionId', 'abc123xyz', {
  path: '/',
  httpOnly: true, // 仅HTTP访问，JavaScript无法访问
  secure: true,   // 仅HTTPS传输
  sameSite: 'Strict'
});
```

### 4. 存储方案选择工具类

```javascript
// 智能存储管理器 - 根据数据特性和需求选择合适的存储方式
class SmartStorage {
  constructor() {
    this.storageMethods = {
      localStorage: {
        available: this.isStorageAvailable('localStorage'),
        sizeLimit: 5 * 1024 * 1024, // 5MB
        persistence: 'persistent'
      },
      sessionStorage: {
        available: this.isStorageAvailable('sessionStorage'),
        sizeLimit: 5 * 1024 * 1024, // 5MB
        persistence: 'session'
      },
      cookie: {
        available: CookieManager.isSupported(),
        sizeLimit: 4096, // 4KB
        persistence: 'configurable'
      }
    };
  }

  // 检查存储是否可用
  isStorageAvailable(type) {
    try {
      const storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 智能存储 - 根据数据大小和持久性需求选择存储方式
  smartSet(key, value, options = {}) {
    const { persistent = true, sizeEstimate } = options;
    const serializedValue = JSON.stringify(value);
    const estimatedSize = new Blob([serializedValue]).size;

    // 优先级：localStorage > sessionStorage > cookie
    if (persistent && this.storageMethods.localStorage.available) {
      // 检查localStorage是否足够存储
      if (estimatedSize < this.storageMethods.localStorage.sizeLimit) {
        try {
          localStorage.setItem(key, serializedValue);
          return 'localStorage';
        } catch (e) {
          console.warn('localStorage存储失败，尝试其他方式');
        }
      }
    }

    if (this.storageMethods.sessionStorage.available) {
      if (estimatedSize < this.storageMethods.sessionStorage.sizeLimit) {
        try {
          sessionStorage.setItem(key, serializedValue);
          return 'sessionStorage';
        } catch (e) {
          console.warn('sessionStorage存储失败');
        }
      }
    }

    // 最后尝试cookie（仅适用于小数据）
    if (this.storageMethods.cookie.available && estimatedSize < 4000) {
      CookieManager.set(key, serializedValue, {
        path: '/',
        expires: persistent ? 365 : undefined // 持久数据保存一年，临时数据为会话级
      });
      return 'cookie';
    }

    throw new Error('没有可用的存储方式或数据太大');
  }

  // 智能获取
  smartGet(key) {
    // 按优先级顺序尝试获取
    if (this.storageMethods.localStorage.available) {
      const value = localStorage.getItem(key);
      if (value !== null) return JSON.parse(value);
    }

    if (this.storageMethods.sessionStorage.available) {
      const value = sessionStorage.getItem(key);
      if (value !== null) return JSON.parse(value);
    }

    const value = CookieManager.get(key);
    if (value !== null) return JSON.parse(value);

    return null;
  }

  // 智能删除
  smartRemove(key) {
    if (this.storageMethods.localStorage.available) {
      localStorage.removeItem(key);
    }
    if (this.storageMethods.sessionStorage.available) {
      sessionStorage.removeItem(key);
    }
    CookieManager.remove(key);
  }

  // 获取存储统计信息
  getStorageStats() {
    const stats = {};

    if (this.storageMethods.localStorage.available) {
      let localStorageSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageSize += (key.length + localStorage[key].length) * 2; // 估算字节数
        }
      }
      stats.localStorage = {
        used: localStorageSize,
        limit: this.storageMethods.localStorage.sizeLimit,
        percentage: (localStorageSize / this.storageMethods.localStorage.sizeLimit * 100).toFixed(2)
      };
    }

    if (this.storageMethods.sessionStorage.available) {
      let sessionStorageSize = 0;
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          sessionStorageSize += (key.length + sessionStorage[key].length) * 2;
        }
      }
      stats.sessionStorage = {
        used: sessionStorageSize,
        limit: this.storageMethods.sessionStorage.sizeLimit,
        percentage: (sessionStorageSize / this.storageMethods.sessionStorage.sizeLimit * 100).toFixed(2)
      };
    }

    return stats;
  }
}

// 使用示例
const smartStorage = new SmartStorage();

// 存储用户设置（需要持久化，数据量中等）
const userSettings = {
  theme: 'dark',
  language: 'zh-CN',
  preferences: {
    autoSave: true,
    fontSize: 14,
    notifications: { email: true, push: false }
  }
};

try {
  const storageMethod = smartStorage.smartSet('userSettings', userSettings, { persistent: true });
  console.log(`用户设置已存储到: ${storageMethod}`);
} catch (error) {
  console.error('存储失败:', error.message);
}

// 存储表单临时数据（仅需会话期间）
const formData = { name: 'John', email: 'john@example.com', message: 'Hello World' };
smartStorage.smartSet('tempFormData', formData, { persistent: false });

// 获取数据
const retrievedSettings = smartStorage.smartGet('userSettings');
console.log('获取的用户设置:', retrievedSettings);

// 查看存储统计
const storageStats = smartStorage.getStorageStats();
console.log('存储统计:', storageStats);
```

## 实际应用场景

### 1. 用户偏好设置存储
- **localStorage**: 用户主题、语言、界面配置等需要长期保存的设置
- **cookie**: 用户登录状态、会话标识等需要随请求发送的数据

### 2. 表单数据持久化
- **sessionStorage**: 在用户填写长表单时防止数据丢失
- **localStorage**: 保存用户经常使用的表单模板

### 3. 缓存机制
- **localStorage**: 缓存API响应数据、静态资源等
- **sessionStorage**: 临时缓存页面状态数据

### 4. 购物车功能
- **localStorage**: 持久化购物车内容
- **cookie**: 存储购物车ID，便于服务端识别

## 延伸知识点

### 1. 安全性考虑
- **localStorage/sessionStorage**: 易受XSS攻击，不应存储敏感信息
- **cookie**: 可设置HttpOnly、Secure、SameSite等属性增强安全性

### 2. 性能优化
- **localStorage/sessionStorage**: 访问速度快，但大量数据影响性能
- **cookie**: 每次请求都携带，影响网络性能

### 3. 浏览器兼容性
- **localStorage/sessionStorage**: IE8+支持
- **cookie**: 所有浏览器支持

正确理解三种存储方式的特点和适用场景，有助于在实际项目中做出合适的选择。
