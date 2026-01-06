# Vue 常用的修饰符都有哪些？（必会）

**题目**: Vue 常用的修饰符都有哪些？（必会）

## 标准答案

Vue.js 中的修饰符是一些特殊的后缀，用点号（.）连接在指令后面，用于改变指令的行为。主要分为以下几类：

1. **事件修饰符**：.stop、.prevent、.capture、.self、.once、.passive
2. **按键修饰符**：.enter、.tab、.delete、.esc、.space、.up、.down、.left、.right
3. **系统修饰符**：.ctrl、.alt、.shift、.meta
4. **鼠标修饰符**：.left、.right、.middle
5. **表单修饰符**：.lazy、.number、.trim
6. **v-model修饰符**：.lazy、.number、.trim（与表单修饰符相同）
7. **v-bind修饰符**：.sync、.camel

## 深入理解

### 1. 事件修饰符

事件修饰符用于处理DOM事件，改变事件的默认行为：

```vue
<template>
  <div>
    <!-- 阻止单击事件继续传播 -->
    <button @click.stop="doThis">点击</button>
    
    <!-- 阻止事件的默认行为（如表单提交） -->
    <form @submit.prevent="onSubmit">
      <input type="submit" value="提交">
    </form>
    
    <!-- 修饰符可以串联使用 -->
    <button @click.stop.prevent="doThat">点击</button>
    
    <!-- 只有事件从元素本身触发时才触发 -->
    <div @click.self="doThat">...</div>
    
    <!-- 事件只触发一次 -->
    <button @click.once="doThisOnce">点击一次</button>
    
    <!-- 使用事件捕获模式添加事件监听器 -->
    <div @click.capture="doThis">...</div>
    
    <!-- 以 passive 模式添加事件监听器 -->
    <div @scroll.passive="onScroll">...</div>
  </div>
</template>
```

### 2. 按键修饰符

用于监听键盘事件，指定特定按键：

```vue
<template>
  <div>
    <!-- 只在回车键按下时触发 -->
    <input @keyup.enter="submit">
    
    <!-- 只在Tab键按下时触发 -->
    <input @keyup.tab="nextField">
    
    <!-- 只在Delete键按下时触发（包括Backspace和Del） -->
    <input @keyup.delete="clear">
    
    <!-- 只在空格键按下时触发 -->
    <input @keyup.space="handleSpace">
    
    <!-- 只在ESC键按下时触发 -->
    <input @keyup.esc="closeModal">
    
    <!-- 方向键修饰符 -->
    <input @keyup.up="moveUp">
    <input @keyup.down="moveDown">
    <input @keyup.left="moveLeft">
    <input @keyup.right="moveRight">
    
    <!-- 可以自定义按键码 -->
    <input @keyup.13="submit"> <!-- 回车键 -->
  </div>
</template>
```

### 3. 系统修饰符

用于监听系统按键（如Ctrl、Alt、Shift、Meta）：

```vue
<template>
  <div>
    <!-- Ctrl + 点击 -->
    <button @click.ctrl="doSomething">Ctrl + 点击</button>
    
    <!-- Alt + 点击 -->
    <button @click.alt="doSomething">Alt + 点击</button>
    
    <!-- Shift + 点击 -->
    <button @click.shift="doSomething">Shift + 点击</button>
    
    <!-- Meta + 点击 (Mac: Command键, Windows: Windows键) -->
    <button @click.meta="doSomething">Meta + 点击</button>
    
    <!-- 任意系统修饰符 -->
    <button @click.ctrl.exact="doSomething">只有Ctrl被按下</button>
    
    <!-- 没有任何系统修饰符 -->
    <button @click.exact="doSomething">没有任何系统修饰符</button>
  </div>
</template>
```

### 4. 鼠标修饰符

用于监听特定鼠标按键事件：

```vue
<template>
  <div>
    <!-- 只在左键点击时触发 -->
    <button @click.left="handleLeftClick">左键点击</button>
    
    <!-- 只在右键点击时触发 -->
    <button @click.right="handleRightClick">右键点击</button>
    
    <!-- 只在中键点击时触发 -->
    <button @click.middle="handleMiddleClick">中键点击</button>
  </div>
</template>
```

### 5. 表单修饰符

用于处理表单输入：

```vue
<template>
  <div>
    <!-- 在"change"时而非"input"时更新 -->
    <input v-model.lazy="msg">
    
    <!-- 自动将用户的输入值转为数值类型 -->
    <input v-model.number="age" type="number">
    
    <!-- 自动过滤用户输入的首尾空白字符 -->
    <input v-model.trim="msg">
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: '',
      age: '',
      number: ''
    };
  }
};
</script>
```

### 6. v-model修饰符详细说明

```vue
<template>
  <div>
    <!-- .lazy: 在 change 事件中同步而不是 input -->
    <input v-model.lazy="msg" placeholder="在change时更新">
    
    <!-- .number: 自动将输入值转换为数值 -->
    <input v-model.number="age" type="number" placeholder="年龄">
    
    <!-- .trim: 自动去除首尾空格 -->
    <input v-model.trim="username" placeholder="用户名">
    
    <!-- 组合使用 -->
    <input v-model.lazy.trim.number="value" placeholder="组合修饰符">
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: '',
      age: 0,
      username: '',
      value: 0
    };
  },
  watch: {
    msg(newVal) {
      console.log('msg 变化:', newVal, typeof newVal); // string
    },
    age(newVal) {
      console.log('age 变化:', newVal, typeof newVal); // number
    }
  }
};
</script>
```

### 7. v-bind修饰符

.sync 修饰符提供了一种语法糖，用于实现子组件向父组件传递数据：

```vue
<!-- 父组件 -->
<template>
  <div>
    <child-component :title.sync="pageTitle" />
    <!-- 等价于 -->
    <child-component 
      :title="pageTitle" 
      @update:title="pageTitle = $event" 
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      pageTitle: '首页'
    };
  }
};
</script>
```

```vue
<!-- 子组件 -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="updateTitle">更新标题</button>
  </div>
</template>

<script>
export default {
  props: ['title'],
  methods: {
    updateTitle() {
      this.$emit('update:title', '新标题');
    }
  }
};
</script>
```

### 8. .camel 修饰符

用于将 v-bind 的属性名驼峰化：

```vue
<template>
  <!-- 在模板中使用驼峰命名 -->
  <svg :view-box.camel="viewBox"></svg>
  
  <!-- 等价于 -->
  <svg :viewBox="viewBox"></svg>
</template>

<script>
export default {
  data() {
    return {
      viewBox: '0 0 100 100'
    };
  }
};
</script>
```

### 实际应用示例

```vue
<template>
  <div class="form-container">
    <!-- 表单提交，阻止默认行为 -->
    <form @submit.prevent="handleSubmit">
      <!-- 用户名，自动去除首尾空格 -->
      <input 
        v-model.trim="username" 
        placeholder="用户名" 
        @keyup.enter="handleSubmit"
      >
      
      <!-- 年龄，自动转为数值 -->
      <input 
        v-model.number="age" 
        type="number" 
        placeholder="年龄"
      >
      
      <!-- 邮箱，使用lazy修饰符在失去焦点时更新 -->
      <input 
        v-model.lazy="email" 
        type="email" 
        placeholder="邮箱"
      >
      
      <!-- 提交按钮，防止重复点击 -->
      <button 
        type="submit" 
        :disabled="submitting"
        @click.once="submitOnce"
      >
        提交
      </button>
    </form>
    
    <!-- 快捷键操作 -->
    <div 
      class="shortcut-area"
      @keydown.ctrl.s.prevent="save"
      @keydown.esc="cancel"
    >
      按 Ctrl+S 保存，按 ESC 取消
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserForm',
  data() {
    return {
      username: '',
      age: null,
      email: '',
      submitting: false
    };
  },
  methods: {
    async handleSubmit() {
      if (this.submitting) return;
      
      this.submitting = true;
      try {
        // 提交表单逻辑
        console.log('提交数据:', { 
          username: this.username, 
          age: this.age, 
          email: this.email 
        });
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('提交成功');
      } catch (error) {
        console.error('提交失败:', error);
        alert('提交失败');
      } finally {
        this.submitting = false;
      }
    },
    save() {
      console.log('保存操作');
      // 保存逻辑
    },
    cancel() {
      console.log('取消操作');
      // 取消逻辑
    },
    submitOnce() {
      console.log('只执行一次的提交');
    }
  }
};
</script>
```

Vue.js的修饰符提供了一种简洁而强大的方式来处理常见的DOM操作，使模板更加清晰易读，减少了事件处理函数中的冗余代码。
