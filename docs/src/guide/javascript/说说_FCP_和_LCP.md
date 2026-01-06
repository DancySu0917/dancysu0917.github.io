# 说说 FCP 和 LCP？（了解）

**题目**: 说说 FCP 和 LCP？（了解）

## 标准答案

FCP (First Contentful Paint) 和 LCP (Largest Contentful Paint) 是 Web 性能测量中的两个核心指标，都属于 Core Web Vitals 指标。FCP 衡量页面从开始加载到页面内容的任何部分在屏幕上呈现的时间，标志着浏览器渲染出第一个文本、图片、SVG 或非白色 canvas 的时间点。LCP 则衡量页面主要内容的加载完成时间，具体是页面视窗中最大的图像或文本块完成渲染的时间。这两个指标对于衡量用户体验至关重要，其中 FCP 反映首次渲染速度，LCP 反映主要内容加载速度。

## 深入分析

### FCP (First Contentful Paint) 详解

FCP 关注的是用户感知的首次内容渲染时间。它记录了浏览器渲染出第一个内容元素的时间点，包括文本、图片、SVG、canvas 等元素，但不包括 iframe 中的内容。FCP 是用户体验的重要指标，因为它标志着页面不再是空白状态，用户开始看到页面内容。

FCP 的优化重点包括：
- 减少关键资源数量和大小
- 优化关键资源加载路径
- 减少 JavaScript 和 CSS 阻塞时间
- 使用 CDN 加速资源加载

### LCP (Largest Contentful Paint) 详解

LCP 关注的是页面主要内容的渲染时间，通常是最影响用户体验的指标。LCP 的计算会考虑页面视窗中最大的图像（img、image、video 元素）或文本块（p、h1-h6 等），并随着页面加载过程不断更新计算结果，直到页面加载完成或用户开始与页面交互。

LCP 的优化策略包括：
- 图像优化（使用适当的格式、尺寸和懒加载）
- 字体加载优化（使用 font-display 属性）
- 服务器响应时间优化
- 资源优先级设置（preload、prefetch）
- 避免大型布局偏移（CLS）

### FCP 与 LCP 的关系

FCP 和 LCP 都是时间性指标，但关注点不同。FCP 关注首次渲染，LCP 关注主要内容渲染。通常，FCP 会早于 LCP 发生，因为首次渲染的元素可能不是最大的内容元素。优化 FCP 有助于提升用户感知的加载速度，而优化 LCP 有助于提升主要内容的加载体验。

## 代码实现

```javascript
// 监测 FCP 和 LCP 指标
function measureCoreWebVitals() {
  // 监测 FCP
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const firstEntry = entries[0];
    if (firstEntry) {
      console.log('FCP:', firstEntry.startTime);
      // 发送指标到分析服务
      // sendMetricToAnalytics('FCP', firstEntry.startTime);
    }
  }).observe({ entryTypes: ['paint'] });

  // 监测 LCP
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      console.log('LCP:', lastEntry.startTime);
      // 发送指标到分析服务
      // sendMetricToAnalytics('LCP', lastEntry.startTime);
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });
}

// 使用 Web Vitals 库进行更精确的监测
import { getFCP, getLCP } from 'web-vitals';

getFCP((metric) => {
  console.log('FCP:', metric.value);
  // metric.value 是以毫秒为单位的测量值
  // metric.id 是用于区分多个相同指标的唯一标识
  // metric.name 是指标名称 ('FCP')
  // metric.rating 是评级 ('good', 'needs-improvement', 'poor')
});

getLCP((metric) => {
  console.log('LCP:', metric.value);
  // 类似于 FCP，包含值、ID、名称和评级
});

// 自定义 LCP 监测实现
class CustomLCPMonitor {
  constructor() {
    this.lcpValue = 0;
    this.lcpRating = '';
    this.entries = [];
    this.onReport = this.onReport.bind(this);
  }

  init() {
    // 监测 Largest Contentful Paint
    new PerformanceObserver(this.handleLCP.bind(this))
      .observe({ entryTypes: ['largest-contentful-paint'] });
    
    // 页面卸载时报告最终结果
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.onReport();
      }
    });
  }

  handleLCP(entryList) {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    if (lastEntry) {
      this.lcpValue = lastEntry.startTime;
      this.entries.push(lastEntry);
      
      // 根据时间评级
      if (this.lcpValue <= 2500) {
        this.lcpRating = 'good';
      } else if (this.lcpValue <= 4000) {
        this.lcpRating = 'needs-improvement';
      } else {
        this.lcpRating = 'poor';
      }
    }
  }

  onReport() {
    console.log({
      name: 'LCP',
      value: this.lcpValue,
      rating: this.lcpRating,
      entries: this.entries
    });
  }
}

// 使用自定义 LCP 监测
const lcpMonitor = new CustomLCPMonitor();
lcpMonitor.init();

// 性能指标收集工具
class PerformanceMetricsCollector {
  constructor() {
    this.metrics = {
      FCP: null,
      LCP: null
    };
    
    this.init();
  }
  
  init() {
    // 收集 FCP
    if ('paint' in PerformanceObserver) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = {
              value: entry.startTime,
              rating: this.getRating(entry.startTime, [1800, 2500])
            };
            console.log(`FCP: ${entry.startTime}ms (Rating: ${this.metrics.FCP.rating})`);
          }
        }
      }).observe({ entryTypes: ['paint'] });
    }
    
    // 收集 LCP
    if ('largest-contentful-paint' in PerformanceObserver) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.LCP = {
          value: lastEntry.startTime,
          url: lastEntry.url,
          size: lastEntry.size,
          rating: this.getRating(lastEntry.startTime, [2500, 4000])
        };
        console.log(`LCP: ${lastEntry.startTime}ms (Rating: ${this.metrics.LCP.rating})`);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }
  
  getRating(value, thresholds) {
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  }
  
  getMetrics() {
    return this.metrics;
  }
}

// 实例化并使用
const metricsCollector = new PerformanceMetricsCollector();
</script>
```

## 实际应用场景

1. **性能监控平台**: 在生产环境中部署性能监控脚本，持续收集 FCP 和 LCP 指标，建立性能基线并监测性能回归。

2. **A/B 测试**: 在进行 UI/UX 变更时，通过对比 FCP 和 LCP 指标来评估变更对用户体验的影响。

3. **性能优化验证**: 在实施性能优化措施后，通过对比优化前后的 FCP 和 LCP 指标来验证优化效果。

4. **用户体验优化**: 通过分析 FCP 和 LCP 数据，识别影响用户体验的关键瓶颈，制定针对性的优化策略。

5. **SEO 优化**: Google 将 Core Web Vitals 作为搜索排名因素，优化 FCP 和 LCP 有助于提升搜索排名。

6. **业务指标关联**: 将 FCP 和 LCP 指标与业务指标（如转化率、跳出率）关联分析，量化性能对业务的影响。
