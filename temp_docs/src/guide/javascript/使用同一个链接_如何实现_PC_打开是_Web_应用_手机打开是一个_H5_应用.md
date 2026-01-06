# 使用同一个链接，如何实现 PC 打开是 Web 应用、手机打开是一个 H5 应用？（了解）

**题目**: 使用同一个链接，如何实现 PC 打开是 Web 应用、手机打开是一个 H5 应用？（了解）

在实际开发中，我们经常需要使用同一个链接来区分用户是使用PC还是移动端访问，然后展示相应的页面版本。以下是几种实现方式：

## 1. 服务端 User-Agent 检测

这是最常见和推荐的方式，在服务端检测用户设备类型并返回相应版本的页面。

```javascript
// Node.js 示例
app.get('/', (req, res) => {
  const userAgent = req.headers['user-agent'];
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  
  if (isMobile) {
    // 返回移动端页面
    res.render('mobile-app', { /* mobile data */ });
  } else {
    // 返回 PC 端页面
    res.render('web-app', { /* web data */ });
  }
});
```

## 2. 客户端重定向

在页面加载时检测设备类型，然后重定向到相应版本：

```javascript
// 检测设备类型
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 页面加载时检测并重定向
(function() {
  if (isMobile()) {
    // 检查是否已经在移动端路径
    if (!window.location.pathname.includes('/mobile')) {
      window.location.href = '/mobile' + window.location.search + window.location.hash;
    }
  } else {
    // 检查是否已经在PC端路径
    if (window.location.pathname.includes('/mobile')) {
      window.location.href = window.location.pathname.replace('/mobile', '') + 
                             window.location.search + window.location.hash;
    }
  }
})();
```

## 3. 前端条件渲染

使用单页应用的方式，根据设备类型渲染不同的UI组件：

```javascript
// React 示例
import { useState, useEffect } from 'react';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(navigator.userAgent));
    };
    
    checkDevice();
    
    // 监听窗口大小变化
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="app">
      {isMobile ? <MobileApp /> : <WebApp />}
    </div>
  );
}
```

## 4. 响应式设计 + 功能适配

使用响应式设计，同时根据设备特性启用/禁用特定功能：

```css
/* CSS 媨应式设计 */
.web-app {
  display: block;
}

.mobile-app {
  display: none;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .web-app {
    display: none;
  }
  
  .mobile-app {
    display: block;
  }
}
```

```javascript
// 设备检测和功能适配
class DeviceDetector {
  static isMobile() {
    return {
      Android: () => Boolean(navigator.userAgent.match(/Android/i)),
      BlackBerry: () => Boolean(navigator.userAgent.match(/BlackBerry/i)),
      iOS: () => Boolean(navigator.userAgent.match(/iPhone|iPad|iPod/i)),
      Opera: () => Boolean(navigator.userAgent.match(/Opera Mini/i)),
      Windows: () => Boolean(navigator.userAgent.match(/IEMobile/i)),
      any: function() {
        return (this.Android() || this.BlackBerry() || this.iOS() || 
                this.Opera() || this.Windows());
      }
    };
  }
  
  static getDeviceInfo() {
    const isMobile = this.isMobile().any();
    const isTablet = /tablet|ipad/i.test(navigator.userAgent);
    const isDesktop = !isMobile && !isTablet;
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      userAgent: navigator.userAgent
    };
  }
}

// 根据设备信息渲染不同内容
function renderApp() {
  const deviceInfo = DeviceDetector.getDeviceInfo();
  
  if (deviceInfo.isMobile) {
    return renderMobileApp();
  } else if (deviceInfo.isTablet) {
    return renderTabletApp();
  } else {
    return renderWebApp();
  }
}
```

## 5. 服务端渲染 (SSR) 方案

使用 Next.js 或 Nuxt.js 等框架实现服务端渲染：

```javascript
// Next.js 示例
import { useEffect, useState } from 'react';

export async function getServerSideProps({ req }) {
  const userAgent = req.headers['user-agent'];
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  
  return {
    props: {
      isMobile
    }
  };
}

export default function App({ isMobile }) {
  const [deviceType, setDeviceType] = useState(isMobile ? 'mobile' : 'desktop');
  
  // 客户端水合时再次检测（防止服务端和客户端不一致）
  useEffect(() => {
    const mobileRegex = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
    setDeviceType(mobileRegex ? 'mobile' : 'desktop');
  }, []);
  
  return (
    <div>
      {deviceType === 'mobile' ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}
```

## 6. 渐进式 Web 应用 (PWA) 方案

结合 PWA 技术，提供一致但适应性的体验：

```javascript
// service worker 检测设备并提供相应资源
self.addEventListener('fetch', event => {
  if (event.request.destination === 'document') {
    const userAgent = event.request.headers.get('User-Agent');
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    
    if (isMobile) {
      event.respondWith(
        fetch('/mobile-index.html')
      );
    } else {
      event.respondWith(
        fetch('/web-index.html')
      );
    }
  }
});
```

## 7. 最佳实践建议

1. **服务端检测优先**：在服务端进行设备检测可以减少客户端的重定向次数，提升首屏加载速度
2. **性能考虑**：避免频繁的客户端重定向，这会影响用户体验
3. **SEO友好**：确保搜索引擎能够正确索引不同版本的页面
4. **功能一致性**：虽然界面不同，但核心功能应保持一致
5. **缓存策略**：针对不同设备版本采用合适的缓存策略

通过这些方法，可以有效地使用同一个链接为不同设备用户提供最适合的体验。
