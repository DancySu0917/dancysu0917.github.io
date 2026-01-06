# Vue 生命周期总共分为几个阶段？

## 标准答案

Vue 实例从创建到销毁的整个过程称为生命周期。Vue 生命周期总共可以分为4个阶段：

1. **创建阶段（Creation）**：在组件实例被创建时执行，此时还未挂载到DOM上
2. **挂载阶段（Mounting）**：将组件挂载到DOM节点上
3. **运行阶段（Runtime）**：组件运行时，响应数据变化
4. **销毁阶段（Destruction）**：组件被销毁时执行清理工作

每个阶段都对应了多个生命周期钩子函数，开发者可以在特定时机执行自定义逻辑。

## 深入理解

Vue 的生命周期是组件系统的核心概念，理解生命周期有助于在正确时机执行相应操作。以下是 Vue 2 和 Vue 3 中完整的生命周期钩子函数：

### Vue 2 生命周期详解

```javascript
// Vue 2 完整生命周期示例
new Vue({
    // 1. 创建阶段 - Creation
    beforeCreate() {
        // 实例初始化之后，数据观测和事件配置之前
        console.log('beforeCreate: 实例刚创建，数据观测和事件配置尚未开始');
        // 此时无法访问 data、methods、computed 等
    },
    
    created() {
        // 实例创建完成，数据观测、属性和方法的运算已完成
        console.log('created: 实例已创建，可以访问 data、methods 等');
        // 此时还未挂载到 DOM，$el 属性还不存在
        // 适合进行数据初始化、API 调用等
    },
    
    // 2. 挂载阶段 - Mounting
    beforeMount() {
        // 挂载开始之前被调用
        console.log('beforeMount: 模板编译完成，但尚未挂载到真实DOM');
        // $el 已存在，但内容还是未经编译的模板
    },
    
    mounted() {
        // 实例挂载到DOM后调用
        console.log('mounted: 组件已挂载到DOM，可以访问真实DOM');
        // 适合进行 DOM 操作、发起初始数据请求、设置定时器等
        this.initData();
    },
    
    // 3. 运行阶段 - Runtime
    beforeUpdate() {
        // 数据更新时调用，发生在虚拟DOM重新渲染之前
        console.log('beforeUpdate: 数据已更新，DOM即将重新渲染');
        // 适合在更新前访问现有DOM
    },
    
    updated() {
        // 数据更新导致DOM重新渲染后调用
        console.log('updated: DOM已重新渲染完成');
        // 适合执行依赖于更新后DOM的操作
    },
    
    activated() {
        // 被 keep-alive 缓存的组件激活时调用
        console.log('activated: 缓存组件被激活');
    },
    
    deactivated() {
        // 被 keep-alive 缓存的组件失活时调用
        console.log('deactivated: 缓存组件被失活');
    },
    
    // 4. 销毁阶段 - Destruction
    beforeDestroy() {
        // 实例销毁之前调用
        console.log('beforeDestroy: 实例即将被销毁');
        // 此时实例仍然完全可用
        // 适合进行清理工作，如清除定时器、取消订阅等
    },
    
    destroyed() {
        // 实例销毁后调用
        console.log('destroyed: 实例已销毁，所有事件监听器和子实例也被销毁');
        // DOM 引用已移除，组件实例已不存在
    },
    
    data() {
        return {
            message: 'Hello Vue!'
        };
    },
    
    methods: {
        initData() {
            // 初始化数据
            console.log('执行初始化数据操作');
        }
    }
});
```

### Vue 3 生命周期详解

```javascript
// Vue 3 Composition API 生命周期示例
import { createApp, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';

const app = createApp({
    // 创建阶段
    setup() {
        // 相当于 beforeCreate 和 created
        console.log('setup: 组合式API初始化');
        
        onBeforeMount(() => {
            console.log('onBeforeMount: 挂载前');
        });
        
        onMounted(() => {
            console.log('onMounted: 组件已挂载');
            // 执行初始化操作
        });
        
        onBeforeUpdate(() => {
            console.log('onBeforeUpdate: 更新前');
        });
        
        onUpdated(() => {
            console.log('onUpdated: 更新后');
        });
        
        onBeforeUnmount(() => {
            console.log('onBeforeUnmount: 卸载前');
        });
        
        onUnmounted(() => {
            console.log('onUnmounted: 已卸载');
        });
        
        return {
            message: 'Hello Vue 3!'
        };
    }
});

// Vue 3 Options API 对应关系
// beforeCreate -> setup() (组合式API中)
// created -> setup() (组合式API中)
// beforeMount -> onBeforeMount
// mounted -> onMounted
// beforeUpdate -> onBeforeUpdate
// updated -> onUpdated
// beforeDestroy -> onBeforeUnmount
// destroyed -> onUnmounted
```

### 生命周期的实际应用场景

```javascript
// 实际应用示例：组件中使用生命周期
export default {
    name: 'LifecycleExample',
    
    data() {
        return {
            timer: null,
            data: [],
            loading: false
        };
    },
    
    async created() {
        // 数据初始化，API 请求
        this.loading = true;
        try {
            // 在 created 阶段发起数据请求
            const response = await fetch('/api/data');
            this.data = await response.json();
        } catch (error) {
            console.error('数据加载失败:', error);
        } finally {
            this.loading = false;
        }
    },
    
    mounted() {
        // DOM 操作，定时器设置
        this.timer = setInterval(() => {
            console.log('定时器执行');
        }, 1000);
        
        // 图表初始化
        this.initChart();
    },
    
    beforeUpdate() {
        // 更新前的操作
        console.log('数据即将更新');
    },
    
    updated() {
        // 更新后的 DOM 操作
        console.log('DOM已更新');
        // 重新计算某些DOM尺寸
    },
    
    beforeDestroy() {
        // 清理工作
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 取消未完成的请求
        console.log('清理定时器等资源');
    },
    
    methods: {
        initChart() {
            // 初始化图表等需要DOM的操作
            console.log('图表初始化');
        }
    }
};
```

### 各阶段关键特点

1. **创建阶段**：
   - `beforeCreate`: 实例刚创建，无法访问数据和方法
   - `created`: 数据观测完成，可访问数据，未挂载DOM

2. **挂载阶段**：
   - `beforeMount`: 模板编译完成，未挂载DOM
   - `mounted`: 已挂载DOM，可访问真实DOM元素

3. **运行阶段**：
   - `beforeUpdate`: 数据更新，DOM未更新
   - `updated`: DOM已更新

4. **销毁阶段**：
   - `beforeDestroy`: 实例即将销毁
   - `destroyed`: 实例已销毁

理解生命周期的每个阶段有助于开发者在合适的时机执行相应的操作，避免在错误的时机进行DOM操作或数据处理。