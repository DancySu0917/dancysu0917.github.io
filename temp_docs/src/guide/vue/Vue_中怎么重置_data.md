# Vue 中怎么重置 data? （高薪常问）

**题目**: Vue 中怎么重置 data? （高薪常问）

## 标准答案

在 Vue 中重置 data 有多种方法：1) 保存初始数据的副本，在需要时进行恢复；2) 使用 Object.assign() 方法将初始数据重新赋值给当前 data；3) 在 Vue 3 中可以使用 setup() 函数中的 ref 或 reactive 对象进行重置。最常用的方法是将初始数据保存为组件的一个属性，然后在重置时将其复制回 data。

## 深入理解

### 1. 保存初始数据并恢复

这是最常用和推荐的方法，通过保存初始数据的深拷贝，在需要时恢复：

```javascript
export default {
  data() {
    const initialData = {
      name: '',
      email: '',
      age: 18,
      hobbies: [],
      profile: {
        bio: '',
        avatar: ''
      }
    };
    
    return {
      initialData: JSON.parse(JSON.stringify(initialData)), // 保存初始数据的深拷贝
      name: initialData.name,
      email: initialData.email,
      age: initialData.age,
      hobbies: [...initialData.hobbies], // 数组需要单独处理
      profile: { ...initialData.profile } // 对象需要单独处理
    };
  },
  methods: {
    // 重置数据
    resetData() {
      // 方法1: 使用 Object.assign
      Object.assign(this.$data, this.initialData);
      
      // 或者方法2: 逐个赋值
      // this.name = this.initialData.name;
      // this.email = this.initialData.email;
      // this.age = this.initialData.age;
      // this.hobbies = [...this.initialData.hobbies];
      // this.profile = { ...this.initialData.profile };
    }
  }
}
```

### 2. 使用 Object.assign() 方法

```javascript
export default {
  data() {
    return {
      name: '',
      email: '',
      age: 18,
      hobbies: [],
      profile: {
        bio: '',
        avatar: ''
      }
    };
  },
  methods: {
    // 保存初始状态
    saveInitialState() {
      this.initialState = { ...this.$data };
    },
    
    // 重置数据
    resetData() {
      if (this.initialState) {
        Object.assign(this.$data, this.initialState);
      }
    }
  },
  mounted() {
    // 组件挂载后保存初始状态
    this.saveInitialState();
  }
}
```

### 3. 深拷贝重置方法

对于包含嵌套对象的复杂数据结构，需要使用深拷贝：

```javascript
// 深拷贝函数
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

export default {
  data() {
    const initialData = {
      user: {
        name: 'John',
        contact: {
          email: 'john@example.com',
          phone: '123-456-7890'
        }
      },
      settings: {
        preferences: {
          theme: 'light',
          notifications: true
        }
      }
    };
    
    return {
      initialData: deepClone(initialData), // 使用深拷贝
      user: deepClone(initialData.user),
      settings: deepClone(initialData.settings)
    };
  },
  methods: {
    resetData() {
      // 深拷贝重置
      this.user = deepClone(this.initialData.user);
      this.settings = deepClone(this.initialData.settings);
    }
  }
}
```

### 4. 使用 $set 方法重置响应式数据

对于 Vue 2 中的响应式数据，有时需要使用 $set 确保响应性：

```javascript
export default {
  data() {
    return {
      dynamicData: {}
    };
  },
  methods: {
    resetDynamicData() {
      const initialDynamicData = {
        field1: 'initial value 1',
        field2: 'initial value 2'
      };
      
      // 清空现有数据
      Object.keys(this.dynamicData).forEach(key => {
        this.$delete(this.dynamicData, key);
      });
      
      // 重新设置数据以保持响应性
      Object.keys(initialDynamicData).forEach(key => {
        this.$set(this.dynamicData, key, initialDynamicData[key]);
      });
    }
  }
}
```

### 5. Vue 3 中的重置方法

在 Vue 3 中，使用 Composition API 重置数据：

```javascript
import { ref, reactive } from 'vue';

export default {
  setup() {
    // 使用 ref
    const formData = ref({
      name: '',
      email: '',
      age: 18
    });
    
    const initialFormData = {
      name: '',
      email: '',
      age: 18
    };
    
    // 使用 reactive
    const state = reactive({
      user: {
        name: 'John',
        email: 'john@example.com'
      },
      settings: {
        theme: 'light',
        notifications: true
      }
    });
    
    const initialState = {
      user: {
        name: 'John',
        email: 'john@example.com'
      },
      settings: {
        theme: 'light',
        notifications: true
      }
    };
    
    const resetFormData = () => {
      // 重置 ref
      formData.value = { ...initialFormData };
    };
    
    const resetState = () => {
      // 重置 reactive 对象
      Object.assign(state, initialState);
    };
    
    return {
      formData,
      state,
      resetFormData,
      resetState
    };
  }
}
```

### 6. 使用 mixin 实现通用重置功能

可以创建一个 mixin 来实现通用的数据重置功能：

```javascript
// resetMixin.js
export const resetMixin = {
  methods: {
    // 保存初始数据
    saveInitialData() {
      this._initialData = JSON.parse(JSON.stringify(this.$data));
    },
    
    // 重置数据
    resetData(excludeFields = []) {
      if (this._initialData) {
        Object.keys(this._initialData).forEach(key => {
          if (!excludeFields.includes(key)) {
            this[key] = this._initialData[key];
          }
        });
      }
    }
  },
  mounted() {
    this.saveInitialData();
  }
};

// 在组件中使用
export default {
  mixins: [resetMixin],
  data() {
    return {
      name: '',
      email: '',
      age: 18,
      submitted: false
    };
  },
  methods: {
    submitForm() {
      // 提交表单后重置，但保留 submitted 状态
      this.resetData(['submitted']);
    }
  }
}
```

### 7. 实际应用示例

```javascript
// 表单组件示例
export default {
  name: 'UserForm',
  data() {
    const initialFormData = {
      user: {
        name: '',
        email: '',
        age: 18,
        gender: 'male'
      },
      preferences: {
        newsletter: true,
        notifications: false,
        theme: 'light'
      },
      errors: {}
    };
    
    return {
      initialFormData: JSON.parse(JSON.stringify(initialFormData)),
      user: { ...initialFormData.user },
      preferences: { ...initialFormData.preferences },
      errors: { ...initialFormData.errors },
      isSubmitting: false
    };
  },
  methods: {
    // 重置表单
    resetForm() {
      // 重置表单数据但保留某些状态
      this.user = { ...this.initialFormData.user };
      this.preferences = { ...this.initialFormData.preferences };
      this.errors = { ...this.initialFormData.errors };
    },
    
    // 提交表单
    async submitForm() {
      this.isSubmitting = true;
      try {
        // 提交逻辑
        await this.submitData();
        
        // 提交成功后重置表单
        this.resetForm();
      } catch (error) {
        this.errors = error.response.data.errors;
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // 重置并关闭表单
    cancelForm() {
      this.resetForm();
      this.$emit('cancel');
    }
  }
}
```

### 8. 注意事项

- 使用 `JSON.parse(JSON.stringify())` 进行深拷贝时，要注意函数、undefined、Symbol 和循环引用无法被正确处理
- 对于包含复杂对象的数据，建议使用专门的深拷贝库如 lodash 的 cloneDeep
- 在重置数据时，注意保持 Vue 的响应性
- 考虑使用计算属性或监听器来处理相关数据的联动变化
- 在表单验证场景中，重置时应同时清除验证错误信息

### 9. 性能考虑

- 频繁重置大型数据对象可能影响性能，考虑只重置必要的字段
- 对于复杂嵌套对象，深拷贝操作可能比较耗时
- 在 Vue 3 中，由于 Proxy 的使用，响应性处理更加高效
