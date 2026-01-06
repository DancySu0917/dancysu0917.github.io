# SPA 首屏加载速度慢的怎么解决？（了解）

**题目**: SPA 首屏加载速度慢的怎么解决？（了解）

**答案**:

SPA（单页应用）首屏加载速度慢是前端开发中的常见问题。以下是几种有效的解决方案：

## 1. 代码分割（Code Splitting）

将应用代码分割成小块，按需加载，而不是一次性加载所有代码。

```javascript
// 使用 React.lazy 和 Suspense 进行路由级别的代码分割
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

## 2. 路由级别懒加载

```javascript
// Webpack 动态导入实现路由懒加载
const Home = () => import('./views/Home.vue'); // Vue
const About = () => import('./views/About.vue');

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
];
```

## 3. 组件懒加载

```javascript
// 对于非首屏展示的组件进行懒加载
const HeavyComponent = lazy(() => 
  import('./HeavyComponent').then(module => ({ default: module.HeavyComponent }))
);

function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

## 4. 预加载和预获取

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/main.js" as="script">
<link rel="prefetch" href="/next-page.js">

<!-- 使用 resource hints -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

## 5. 服务端渲染（SSR）或静态生成（SSG）

```javascript
// Next.js 示例
// pages/index.js
export async function getServerSideProps() {
  // 在服务端获取数据
  const data = await fetchData();
  
  return {
    props: { data } // 将数据传递给组件
  };
}

export default function Home({ data }) {
  // 组件内容
  return <div>{data}</div>;
}
```

## 6. 骨架屏（Skeleton Screen）

```jsx
// 骨架屏组件
const SkeletonScreen = () => (
  <div className="skeleton-container">
    <div className="skeleton-header"></div>
    <div className="skeleton-content">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
    <div className="skeleton-button"></div>
  </div>
);

function App() {
  return (
    <div>
      <Suspense fallback={<SkeletonScreen />}>
        <ActualComponent />
      </Suspense>
    </div>
  );
}
```

## 7. 关键资源优化

```javascript
// Webpack 配置优化
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  // 压缩和优化
  mode: 'production',
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 250000,
  }
};
```

## 8. 图片优化

```jsx
// 使用现代图片格式和懒加载
const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <picture>
      <source srcSet={src.replace('.jpg', '.webp')} type="image/webp" />
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        decoding="async"
        {...props}
      />
    </picture>
  );
};
```

## 9. 首屏渲染优化

```javascript
// 优先加载首屏所需资源
const useFirstScreenOptimization = () => {
  useEffect(() => {
    // 预加载首屏后的资源
    const prefetchAfterFirstScreen = () => {
      const nonCriticalScripts = [
        'analytics.js',
        'chat-widget.js',
        'social-plugins.js'
      ];
      
      nonCriticalScripts.forEach(script => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = script;
        document.head.appendChild(link);
      });
    };
    
    // 首屏渲染完成后执行
    const timer = setTimeout(prefetchAfterFirstScreen, 3000);
    return () => clearTimeout(timer);
  }, []);
};
```

## 10. 缓存策略

```javascript
// Service Worker 缓存策略
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
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
        // 返回缓存版本，同时后台更新
        return response || fetch(event.request);
      })
  );
});
```

## 11. 减少第三方脚本

```javascript
// 延迟加载非关键第三方脚本
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 在用户交互后加载
const loadAnalytics = async () => {
  await loadScript('https://analytics.example.com/script.js');
  // 初始化分析代码
};
```

## 12. 首屏内容优先渲染

```jsx
// 使用 React 的优先级渲染
import { unstable_scheduleCallback, unstable_IdlePriority } from 'scheduler';

function App() {
  const [firstScreenLoaded, setFirstScreenLoaded] = useState(false);
  
  useEffect(() => {
    // 首屏内容加载完成后，再加载其他内容
    unstable_scheduleCallback(unstable_IdlePriority, () => {
      setFirstScreenLoaded(true);
    });
  }, []);
  
  return (
    <div>
      <FirstScreenContent />
      {firstScreenLoaded && <NonCriticalContent />}
    </div>
  );
}
```

通过综合运用这些技术，可以显著提升 SPA 的首屏加载速度，改善用户体验。
