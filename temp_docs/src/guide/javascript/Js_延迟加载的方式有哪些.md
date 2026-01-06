# Js 延迟加载的方式有哪些？（了解）

**题目**: Js 延迟加载的方式有哪些？（了解）

## 详细解析

JavaScript延迟加载（Lazy Loading）是一种优化技术，它延迟脚本的加载或执行，直到真正需要时才进行。这可以减少页面初始加载时间，提高性能。

### 1. defer属性

`defer`属性告诉浏览器延迟执行脚本，直到文档解析完成。

```html
<!-- 在HTML中使用defer -->
<script src="script.js" defer></script>

<!-- 多个脚本按顺序执行 -->
<script src="first.js" defer></script>
<script src="second.js" defer></script>
<script src="third.js" defer></script>
```

```javascript
// defer脚本的特点
// 1. 脚本在后台下载，不阻塞HTML解析
// 2. 脚本在DOM解析完成后执行
// 3. 多个defer脚本按顺序执行
// 4. 在DOMContentLoaded事件之前执行
```

### 2. async属性

`async`属性让脚本异步下载，下载完成后立即执行。

```html
<!-- 在HTML中使用async -->
<script src="analytics.js" async></script>
<script src="ads.js" async></script>
```

```javascript
// async脚本的特点
// 1. 脚本在后台下载，不阻塞HTML解析
// 2. 下载完成后立即执行，不保证执行顺序
// 3. 可能会在DOM解析完成前或完成后执行
// 4. 适用于相互独立的脚本，如分析脚本
```

### 3. 动态脚本加载

使用JavaScript动态创建和加载脚本。

```javascript
// 基础动态加载
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    
    if (callback) {
        script.onload = function() {
            callback();
        };
    }
    
    document.head.appendChild(script);
}

// 使用示例
loadScript('deferred-script.js', function() {
    console.log('脚本加载完成');
});
```

```javascript
// 带错误处理的动态加载
function loadScriptWithRetry(src, maxRetries = 3) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        function attemptLoad() {
            const script = document.createElement('script');
            script.src = src;
            
            script.onload = () => resolve(script);
            script.onerror = () => {
                attempts++;
                if (attempts < maxRetries) {
                    console.log(`重试加载 ${src}, 尝试 ${attempts + 1}`);
                    setTimeout(attemptLoad, 1000 * attempts); // 递增延迟
                } else {
                    reject(new Error(`加载失败: ${src}`));
                }
            };
            
            document.head.appendChild(script);
        }
        
        attemptLoad();
    });
}

// 使用示例
loadScriptWithRetry('critical-module.js')
    .then(() => console.log('模块加载成功'))
    .catch(err => console.error('模块加载失败:', err));
```

### 4. 模块动态导入（Dynamic Import）

ES2020引入的动态导入允许按需加载模块。

```javascript
// 动态导入语法
async function loadModule() {
    const module = await import('./myModule.js');
    return module;
}

// 使用示例
async function initializeFeature() {
    const { myFunction, MyClass } = await import('./featureModule.js');
    return new MyClass();
}
```

```javascript
// 条件加载模块
async function loadBasedOnCondition(userType) {
    let module;
    
    if (userType === 'admin') {
        module = await import('./adminPanel.js');
    } else if (userType === 'guest') {
        module = await import('./guestView.js');
    } else {
        module = await import('./userDashboard.js');
    }
    
    return module;
}
```

```javascript
// 懒加载组件（如React中）
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
    return (
        <div>
            <Suspense fallback={<div>加载中...</div>}>
                <LazyComponent />
            </Suspense>
        </div>
    );
}
```

### 5. Intersection Observer API

用于检测元素何时进入视口，实现图片、内容等的懒加载。

```javascript
// 图片懒加载
function setupImageLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // 将占位符src替换为实际图片
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                
                // 停止观察已加载的图片
                observer.unobserve(img);
            }
        });
    });
    
    // 观察所有懒加载图片
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// HTML示例
/*
<img 
    class="lazy" 
    data-src="actual-image.jpg" 
    src="placeholder.jpg" 
    alt="描述">
*/
```

```javascript
// 内容懒加载
function lazyLoadContent() {
    const contentObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                const contentUrl = container.dataset.contentUrl;
                
                fetch(contentUrl)
                    .then(response => response.text())
                    .then(html => {
                        container.innerHTML = html;
                        container.classList.add('loaded');
                    })
                    .catch(err => console.error('加载内容失败:', err));
                
                observer.unobserve(container);
            }
        });
    });
    
    document.querySelectorAll('[data-content-url]').forEach(el => {
        contentObserver.observe(el);
    });
}
```

### 6. 事件驱动加载

根据用户交互事件延迟加载功能。

```javascript
// 点击时加载功能
function setupLazyFeature() {
    const button = document.getElementById('feature-button');
    let featureLoaded = false;
    
    button.addEventListener('click', async function() {
        if (!featureLoaded) {
            // 显示加载指示器
            button.textContent = '加载中...';
            button.disabled = true;
            
            try {
                const { featureFunction } = await import('./heavyFeature.js');
                featureLoaded = true;
                
                // 使用加载的功能
                featureFunction();
                
                // 更新按钮状态
                button.textContent = '功能已加载';
            } catch (error) {
                console.error('功能加载失败:', error);
                button.textContent = '加载失败，重试';
                button.disabled = false;
            }
        } else {
            // 功能已加载，直接使用
            console.log('功能已可用');
        }
    });
}
```

```javascript
// 滚动时加载更多内容
class LazyScrollLoader {
    constructor(container, loadMoreCallback) {
        this.container = container;
        this.loadMoreCallback = loadMoreCallback;
        this.isLoading = false;
        this.threshold = 100; // 距离底部100px时加载
        
        this.bindScrollEvent();
    }
    
    bindScrollEvent() {
        let timeoutId;
        
        this.container.addEventListener('scroll', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => this.checkScrollPosition(), 100);
        });
    }
    
    async checkScrollPosition() {
        const { scrollTop, scrollHeight, clientHeight } = this.container;
        
        if (scrollHeight - scrollTop - clientHeight < this.threshold && !this.isLoading) {
            this.isLoading = true;
            await this.loadMoreCallback();
            this.isLoading = false;
        }
    }
}
```

### 7. Service Worker缓存

使用Service Worker实现资源的延迟加载和缓存。

```javascript
// service-worker.js
const CACHE_NAME = 'lazy-cache-v1';
const urlsToCache = [
    '/api/data',
    '/assets/lazy-content.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 返回缓存的响应，否则发起网络请求
                return response || fetch(event.request);
            })
    );
});
```

```javascript
// 在主页面注册Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker 注册成功');
        } catch (error) {
            console.error('Service Worker 注册失败:', error);
        }
    }
}

// 使用缓存的资源
async function loadCachedResource(url) {
    const response = await fetch(url);
    if (response.ok) {
        return response.json();
    }
    throw new Error('获取资源失败');
}
```

### 8. 预加载策略

结合预加载和懒加载的策略。

```javascript
// 预加载关键资源
function preloadCriticalResources() {
    const resources = [
        { href: '/api/user-data', as: 'fetch' },
        { href: '/assets/critical.js', as: 'script' },
        { href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossorigin: true }
    ];
    
    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        Object.keys(resource).forEach(key => {
            link[key] = resource[key];
        });
        document.head.appendChild(link);
    });
}

// 预获取可能需要的资源
function prefetchFutureResources() {
    const futurePages = ['/dashboard', '/settings', '/profile'];
    
    futurePages.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    });
}
```

### 9. Webpack代码分割

使用构建工具实现自动的代码分割和懒加载。

```javascript
// Webpack动态导入实现代码分割
async function loadFeature() {
    // Webpack会自动分割这个模块
    const { default: FeatureModule } = await import(
        /* webpackChunkName: "feature-module" */ 
        './featureModule'
    );
    
    return new FeatureModule();
}

// 路由级别的代码分割
const routes = [
    {
        path: '/home',
        component: () => import(/* webpackChunkName: "home" */ './Home')
    },
    {
        path: '/about',
        component: () => import(/* webpackChunkName: "about" */ './About')
    }
];
```

### 选择合适的延迟加载策略

不同场景下选择合适的延迟加载方式：

- **页面级脚本**：使用`defer`或`async`
- **功能模块**：使用动态导入
- **媒体资源**：使用Intersection Observer
- **路由组件**：使用框架的懒加载功能
- **API数据**：使用事件驱动加载

通过合理使用这些延迟加载技术，可以显著提升页面加载性能和用户体验。
