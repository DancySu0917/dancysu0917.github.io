# Web应用中如何对静态资源加载失败的场景做降级处理？（进阶）

## 标准答案

静态资源加载失败的降级处理主要包括以下几个方面：

1. **事件监听处理**：监听资源加载失败事件（onerror），执行降级逻辑
2. **备用资源加载**：提供备用CDN或本地资源作为备选方案
3. **多级降级策略**：实现多层备用方案，如CDN -> 本地 -> 内联代码
4. **缓存机制**：利用Service Worker或localStorage缓存关键资源
5. **优雅降级**：确保页面核心功能在资源加载失败时仍可使用

这些策略可以有效提升Web应用在各种网络环境下的稳定性和用户体验。

## 深入分析

静态资源加载失败是Web开发中常见的问题，可能由以下原因导致：
- CDN服务不可用
- 网络连接问题
- 资源路径错误
- 服务器故障
- 防火墙或网络策略限制

为应对这些问题，需要建立完整的资源加载失败处理机制：

### 1. 资源加载失败的检测

- 通过`onerror`事件检测资源加载失败
- 使用`Promise`包装资源加载过程
- 监控资源加载性能指标

### 2. 多级降级策略

- **第一级**：首选CDN资源
- **第二级**：备用CDN或本地资源
- **第三级**：内联代码或简化功能
- **第四级**：提示用户并提供重试机制

### 3. 缓存与预加载

- 使用Service Worker缓存关键资源
- 利用localStorage存储小型资源
- 预加载重要资源以提高成功率

## 代码演示

### 1. 基础的资源加载失败处理

```javascript
// 图片加载失败处理
function handleImageError(img, fallbackSrc) {
  img.onerror = function() {
    console.warn(`图片加载失败: ${this.src}, 尝试加载备用资源`);
    
    if (fallbackSrc && this.src !== fallbackSrc) {
      this.src = fallbackSrc;
    } else {
      // 如果备用资源也失败，显示占位图
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
      this.alt = '图片加载失败';
    }
  };
}

// 使用示例
const img = new Image();
img.src = 'https://example.com/image.jpg';
handleImageError(img, '/local-fallback/image.jpg');
document.body.appendChild(img);
```

### 2. JavaScript/CSS资源加载失败处理

```javascript
// 动态加载脚本的失败处理
function loadScript(src, options = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    
    script.onload = () => {
      console.log(`脚本加载成功: ${src}`);
      resolve(script);
    };
    
    script.onerror = () => {
      console.error(`脚本加载失败: ${src}`);
      reject(new Error(`Script load error for ${src}`));
    };
    
    script.src = src;
    
    if (options.integrity) script.integrity = options.integrity;
    if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
    
    document.head.appendChild(script);
  });
}

// 多级降级加载脚本
async function loadScriptWithFallback(urls) {
  for (let i = 0; i < urls.length; i++) {
    try {
      const script = await loadScript(urls[i]);
      console.log(`使用第 ${i + 1} 个源加载成功`);
      return script;
    } catch (error) {
      console.warn(`第 ${i + 1} 个源加载失败:`, error.message);
      
      if (i === urls.length - 1) {
        // 所有源都失败，尝试内联代码
        console.error('所有外部源加载失败，使用内联代码');
        // 这里可以执行备用逻辑
        return null;
      }
    }
  }
}

// 使用示例
const scriptUrls = [
  'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
  '/local-assets/lodash.min.js'
];

loadScriptWithFallback(scriptUrls)
  .then(script => {
    if (script) {
      console.log('Lodash加载成功');
    } else {
      console.log('使用备用实现');
      // 在这里提供lodash的简化实现或功能降级
    }
  });
```

### 3. CSS资源加载失败处理

```javascript
// 加载CSS样式表的失败处理
function loadCSS(href, options = {}) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    
    // 检测CSS加载状态
    link.onload = () => {
      console.log(`CSS加载成功: ${href}`);
      resolve(link);
    };
    
    link.onerror = () => {
      console.error(`CSS加载失败: ${href}`);
      reject(new Error(`CSS load error for ${href}`));
    };
    
    document.head.appendChild(link);
  });
}

// CSS加载失败的降级处理
async function loadCSSWithFallback(cssUrls, fallbackStyles) {
  for (let i = 0; i < cssUrls.length; i++) {
    try {
      await loadCSS(cssUrls[i]);
      console.log(`CSS加载成功，使用第 ${i + 1} 个源`);
      return true;
    } catch (error) {
      console.warn(`CSS加载失败，尝试下一个源:`, error.message);
      
      if (i === cssUrls.length - 1) {
        // 所有CSS加载失败，应用备用样式
        console.warn('所有CSS加载失败，应用备用样式');
        if (fallbackStyles) {
          applyInlineStyles(fallbackStyles);
        }
        return false;
      }
    }
  }
}

// 应用内联样式作为降级方案
function applyInlineStyles(cssText) {
  const style = document.createElement('style');
  style.textContent = cssText;
  document.head.appendChild(style);
}

// 使用示例
const cssUrls = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  '/local-assets/bootstrap.min.css'
];

const fallbackCSS = `
  .btn { 
    display: inline-block; 
    padding: 6px 12px; 
    margin-bottom: 0; 
    font-size: 14px; 
    font-weight: 400; 
    line-height: 1.42857143; 
    text-align: center; 
    white-space: nowrap; 
    vertical-align: middle; 
    cursor: pointer; 
    background-image: none; 
    border: 1px solid transparent; 
    border-radius: 4px; 
  }
  .btn-primary { 
    color: #fff; 
    background-color: #007bff; 
    border-color: #007bff; 
  }
`;

loadCSSWithFallback(cssUrls, fallbackCSS);
```

### 4. 资源加载管理器

```javascript
// 综合资源加载管理器
class ResourceManager {
  constructor(options = {}) {
    this.cdnList = options.cdnList || [
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
      'https://unpkg.com'
    ];
    this.localPrefix = options.localPrefix || '/local-assets';
    this.retryAttempts = options.retryAttempts || 3;
    this.timeout = options.timeout || 10000; // 10秒超时
  }
  
  // 创建带超时的加载Promise
  loadWithTimeout(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Resource load timeout')), timeout)
      )
    ]);
  }
  
  // 加载脚本
  async loadScript(src, options = {}) {
    const urls = this.generateFallbackUrls(src);
    
    for (let i = 0; i < urls.length; i++) {
      try {
        const script = await this.loadWithTimeout(
          this.createScriptElement(urls[i], options),
          this.timeout
        );
        console.log(`脚本加载成功: ${urls[i]}`);
        return script;
      } catch (error) {
        console.warn(`脚本加载失败 (${i + 1}/${urls.length}):`, error.message);
        
        if (i === urls.length - 1) {
          throw new Error(`所有脚本源都加载失败: ${src}`);
        }
      }
    }
  }
  
  // 创建脚本元素
  createScriptElement(src, options) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(`Script load error: ${src}`));
      
      script.src = src;
      
      if (options.integrity) script.integrity = options.integrity;
      if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
      if (options.async !== undefined) script.async = options.async;
      if (options.defer !== undefined) script.defer = options.defer;
      
      document.head.appendChild(script);
    });
  }
  
  // 生成备用URL列表
  generateFallbackUrls(originalSrc) {
    const urls = [originalSrc]; // 首先尝试原始URL
    
    // 如果是CDN资源，生成备用CDN URL
    if (this.isCDNResource(originalSrc)) {
      this.cdnList.forEach(cdn => {
        if (!originalSrc.startsWith(cdn)) {
          const newUrl = this.replaceCDN(originalSrc, cdn);
          urls.push(newUrl);
        }
      });
    }
    
    // 添加本地资源作为最后备选
    urls.push(this.convertToLocalStorage(originalSrc));
    
    return urls;
  }
  
  // 判断是否为CDN资源
  isCDNResource(src) {
    return this.cdnList.some(cdn => src.startsWith(cdn));
  }
  
  // 替换CDN域名
  replaceCDN(originalSrc, newCDN) {
    const path = originalSrc.replace(/^https?:\/\/[^\/]+\//, '');
    return `${newCDN}/${path}`;
  }
  
  // 转换为本地资源路径
  convertToLocalStorage(originalSrc) {
    const path = originalSrc.replace(/^https?:\/\/[^\/]+/, '');
    return `${this.localPrefix}${path}`;
  }
  
  // 加载图片资源
  loadImage(src, fallbackSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (fallbackSrc && src !== fallbackSrc) {
          this.loadImage(fallbackSrc).then(resolve).catch(reject);
        } else {
          reject(new Error(`Image load error: ${src}`));
        }
      };
      
      img.src = src;
    });
  }
  
  // 批量加载资源
  async loadResources(resources) {
    const results = [];
    const errors = [];
    
    for (const resource of resources) {
      try {
        let result;
        if (resource.type === 'script') {
          result = await this.loadScript(resource.src, resource.options);
        } else if (resource.type === 'image') {
          result = await this.loadImage(resource.src, resource.fallback);
        }
        results.push({ resource, success: true, result });
      } catch (error) {
        console.error(`资源加载失败:`, resource, error);
        errors.push({ resource, success: false, error });
        
        // 执行降级处理
        if (resource.onFailure) {
          try {
            await resource.onFailure(error);
          } catch (degradeError) {
            console.error('降级处理也失败:', degradeError);
          }
        }
      }
    }
    
    return { results, errors };
  }
}

// 使用示例
const resourceManager = new ResourceManager({
  cdnList: [
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com'
  ],
  localPrefix: '/assets'
});

// 批量加载资源
const resources = [
  {
    type: 'script',
    src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    options: { integrity: 'sha256-v2umGqhYJRi7fHVJ6rN1U5LRIv60L0/A0qaU8Y98=', crossOrigin: 'anonymous' },
    onFailure: () => {
      console.log('Lodash加载失败，使用简化实现');
      // 在这里提供简化实现
      window._ = {
        debounce: function(func, wait) {
          let timeout;
          return function executedFunction(...args) {
            const later = () => {
              clearTimeout(timeout);
              func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          };
        }
      };
    }
  },
  {
    type: 'image',
    src: 'https://example.com/image.jpg',
    fallback: '/local/image.jpg'
  }
];

resourceManager.loadResources(resources)
  .then(({ results, errors }) => {
    console.log('资源加载完成:', { results, errors });
  })
  .catch(error => {
    console.error('资源加载过程中出现严重错误:', error);
  });
```

### 5. Service Worker缓存策略

```javascript
// Service Worker缓存静态资源
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function(registration) {
    console.log('Service Worker 注册成功:', registration);
  }).catch(function(error) {
    console.log('Service Worker 注册失败:', error);
  });
}

// sw.js 内容
/*
self.addEventListener('fetch', event => {
  // 只缓存同域的请求
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open('static-resources-v1')
        .then(cache => {
          return cache.match(event.request)
            .then(response => {
              // 如果缓存中有，则返回缓存
              if (response) {
                return response;
              }
              
              // 否则发起网络请求
              return fetch(event.request).then(networkResponse => {
                // 将网络响应存入缓存
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            })
            .catch(() => {
              // 网络请求也失败时，返回备用响应
              return caches.match('/offline.html');
            });
        })
    );
  }
});
*/
```

### 6. 高级降级策略

```javascript
// 高级资源加载与降级策略
class AdvancedResourceLoader {
  constructor() {
    this.cache = new Map(); // 内存缓存
    this.failedResources = new Set(); // 记录失败的资源
    this.retryQueue = []; // 重试队列
  }
  
  // 智能加载资源（带缓存和重试）
  async loadResource(src, options = {}) {
    // 检查是否已缓存
    if (this.cache.has(src)) {
      console.log(`使用缓存资源: ${src}`);
      return this.cache.get(src);
    }
    
    // 检查是否已标记为失败
    if (this.failedResources.has(src)) {
      console.warn(`资源已标记为失败: ${src}`);
      return this.handleFailedResource(src, options);
    }
    
    try {
      const result = await this.attemptLoad(src, options);
      this.cache.set(src, result);
      return result;
    } catch (error) {
      console.error(`资源加载失败: ${src}`, error);
      this.failedResources.add(src);
      
      // 添加到重试队列
      this.scheduleRetry(src, options);
      
      return this.handleFailedResource(src, options);
    }
  }
  
  // 尝试加载资源
  async attemptLoad(src, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
    
    try {
      const response = await fetch(src, {
        signal: controller.signal,
        ...options.fetchOptions
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  // 处理失败的资源
  async handleFailedResource(src, options) {
    // 尝试备用资源
    if (options.fallback) {
      console.log(`尝试备用资源: ${options.fallback}`);
      return this.loadResource(options.fallback, {
        ...options,
        fallback: null // 避免无限递归
      });
    }
    
    // 如果有降级函数，执行降级
    if (options.degrade) {
      console.log(`执行降级策略: ${src}`);
      return options.degrade();
    }
    
    // 返回默认值或抛出错误
    if (options.defaultValue !== undefined) {
      return options.defaultValue;
    }
    
    throw new Error(`无法加载资源且无降级方案: ${src}`);
  }
  
  // 计划重试
  scheduleRetry(src, options) {
    // 5秒后重试
    setTimeout(() => {
      console.log(`重试加载资源: ${src}`);
      this.loadResource(src, options)
        .then(() => {
          console.log(`重试成功: ${src}`);
          this.failedResources.delete(src);
        })
        .catch(() => {
          console.log(`重试失败: ${src}`);
        });
    }, 5000);
  }
  
  // 预加载资源
  preloadResources(resources) {
    return Promise.allSettled(
      resources.map(src => this.loadResource(src))
    );
  }
  
  // 清理缓存
  clearCache() {
    this.cache.clear();
  }
}

// 使用示例
const loader = new AdvancedResourceLoader();

// 加载带降级的资源
async function loadWithDegrade() {
  try {
    const response = await loader.loadResource('https://api.example.com/data.json', {
      fallback: '/local-data.json',
      degrade: () => {
        // 返回默认数据
        return {
          json: () => Promise.resolve({ message: '使用默认数据', status: 'fallback' })
        };
      },
      defaultValue: { message: '离线模式', status: 'offline' }
    });
    
    const data = await response.json();
    console.log('获取到数据:', data);
    return data;
  } catch (error) {
    console.error('所有加载方案都失败:', error);
    return null;
  }
}

loadWithDegrade();
```

### 7. 实际应用示例

```javascript
// 实际项目中的资源加载管理
class AppResourceManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }
  
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('网络连接恢复');
      this.retryFailedResources();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('网络连接断开');
    });
  }
  
  // 根据网络状态选择加载策略
  async loadCriticalAssets() {
    const criticalAssets = [
      { type: 'script', src: '/js/app-bundle.js', critical: true },
      { type: 'css', src: '/css/app-styles.css', critical: true }
    ];
    
    for (const asset of criticalAssets) {
      try {
        if (this.isOnline) {
          // 在线时使用正常加载流程
          await this.loadAsset(asset);
        } else {
          // 离线时使用缓存或降级
          await this.loadAssetOffline(asset);
        }
      } catch (error) {
        console.error(`关键资源加载失败:`, asset, error);
        
        if (asset.critical) {
          // 关键资源失败，显示错误页面
          this.showOfflinePage();
        }
      }
    }
  }
  
  async loadAsset(asset) {
    switch (asset.type) {
      case 'script':
        return this.loadScript(asset.src);
      case 'css':
        return this.loadCSS(asset.src);
      default:
        throw new Error(`不支持的资源类型: ${asset.type}`);
    }
  }
  
  async loadAssetOffline(asset) {
    // 离线时的加载策略
    switch (asset.type) {
      case 'script':
        // 检查Service Worker缓存
        if (await this.isInCache(asset.src)) {
          return this.loadFromCache(asset.src);
        } else {
          return this.loadInlineScript(asset.src);
        }
      case 'css':
        // 检查是否有内联样式
        return this.loadInlineCSS(asset.src);
      default:
        throw new Error(`不支持的资源类型: ${asset.type}`);
    }
  }
  
  async isInCache(url) {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(url);
        if (cachedResponse) return true;
      }
    }
    return false;
  }
  
  async loadFromCache(url) {
    const cache = await caches.open('app-cache-v1');
    return cache.match(url);
  }
  
  loadInlineScript(url) {
    // 从localStorage或其他本地存储加载
    const cachedScript = localStorage.getItem(`script_${url}`);
    if (cachedScript) {
      const script = document.createElement('script');
      script.textContent = cachedScript;
      document.head.appendChild(script);
      return Promise.resolve(script);
    }
    throw new Error('离线模式下无可用脚本');
  }
  
  loadInlineCSS(url) {
    // 返回基础样式
    const style = document.createElement('style');
    style.textContent = `
      /* 基础样式，确保页面可读 */
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      .container { max-width: 800px; margin: 0 auto; }
    `;
    document.head.appendChild(style);
    return Promise.resolve(style);
  }
  
  showOfflinePage() {
    document.body.innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <h1>离线模式</h1>
        <p>当前处于离线状态，部分功能可能不可用</p>
        <p>请检查网络连接后刷新页面</p>
        <button onclick="location.reload()">重新加载</button>
      </div>
    `;
  }
  
  retryFailedResources() {
    // 网络恢复后重试加载失败的资源
    console.log('开始重试加载资源...');
    this.loadCriticalAssets();
  }
}

// 初始化应用资源管理器
const appResourceManager = new AppResourceManager();
appResourceManager.loadCriticalAssets();
```

## 实际应用场景

1. **CDN故障处理**：当主要CDN服务不可用时，自动切换到备用CDN
2. **网络不稳定环境**：在弱网环境下提供基础功能
3. **离线应用**：支持PWA应用的离线使用
4. **跨域资源加载**：处理第三方资源加载失败
5. **性能优化**：预加载关键资源，提供流畅用户体验

## 注意事项

1. **性能权衡**：降级方案可能影响性能，需权衡用户体验
2. **维护成本**：多级降级策略增加代码复杂度
3. **缓存管理**：合理管理缓存，避免占用过多存储空间
4. **安全性**：确保降级资源的安全性，防止XSS等攻击
5. **监控告警**：监控资源加载失败率，及时发现问题

## 扩展思考

现代Web应用的资源加载策略需要考虑：
- 用户的网络环境差异
- 不同设备的性能特点
- 应用的核心功能优先级
- 成本与用户体验的平衡

通过合理的降级策略，可以确保应用在各种环境下都能提供基本可用的功能，这是构建高质量Web应用的重要组成部分。