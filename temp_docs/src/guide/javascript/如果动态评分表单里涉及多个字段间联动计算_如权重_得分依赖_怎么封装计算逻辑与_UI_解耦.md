# 如果动态评分表单里涉及多个字段间联动计算（如权重、得分依赖），怎么封装计算逻辑与 UI 解耦？（了解）

**题目**: 如果动态评分表单里涉及多个字段间联动计算（如权重、得分依赖），怎么封装计算逻辑与 UI 解耦？（了解）

## 标准答案

动态评分表单中字段联动计算的解耦方案包括：1) 创建独立的计算引擎类，封装所有联动逻辑；2) 使用观察者模式监听字段变化并触发计算；3) 采用状态管理方案（如Redux/Vuex）集中管理表单状态；4) 实现依赖图算法动态计算字段依赖关系；5) 使用发布-订阅模式实现数据变更通知。

## 详细解析

### 1. 计算引擎模式

创建独立的计算引擎类，将所有联动计算逻辑封装在其中，与UI完全分离。引擎负责：
- 维护字段依赖关系图
- 监听字段值变化
- 自动触发相关字段的重新计算
- 提供计算结果给UI层

### 2. 观察者模式

使用观察者模式实现字段值变化的监听和通知：
- 字段作为被观察对象
- 依赖字段作为观察者
- 当字段值变化时，通知所有依赖该字段的观察者

### 3. 状态管理方案

使用集中式状态管理（如Redux、Vuex）：
- 将表单状态和计算逻辑统一管理
- UI组件只负责展示，不包含计算逻辑
- 通过action触发状态更新和计算

### 4. 依赖图算法

构建字段依赖关系图，使用拓扑排序算法确定计算顺序：
- 节点：表单字段
- 边：依赖关系
- 计算顺序：拓扑排序结果

## 完整代码实现

### 计算引擎实现

```javascript
// 字段联动计算引擎
class FormCalculationEngine {
  constructor() {
    this.fields = new Map();           // 存储字段信息
    this.dependencies = new Map();     // 存储依赖关系
    this.calculations = new Map();     // 存储计算规则
    this.observers = new Map();        // 存储观察者
    this.formulaCache = new Map();     // 计算公式缓存
  }

  // 添加字段
  addField(fieldId, initialValue = null, config = {}) {
    this.fields.set(fieldId, {
      id: fieldId,
      value: initialValue,
      dependencies: config.dependencies || [],
      dependentFields: config.dependentFields || [],
      calculation: config.calculation || null,
      type: config.type || 'text',
      ...config
    });

    // 建立依赖关系
    if (config.dependencies) {
      config.dependencies.forEach(depId => {
        this.addDependency(depId, fieldId);
      });
    }

    return this;
  }

  // 添加依赖关系
  addDependency(dependentFieldId, targetFieldId) {
    if (!this.dependencies.has(dependentFieldId)) {
      this.dependencies.set(dependentFieldId, new Set());
    }
    this.dependencies.get(dependentFieldId).add(targetFieldId);
    return this;
  }

  // 设置计算规则
  setCalculation(fieldId, calculationFunction) {
    this.calculations.set(fieldId, calculationFunction);
    return this;
  }

  // 设置字段值
  setFieldValue(fieldId, value) {
    const field = this.fields.get(fieldId);
    if (!field) {
      throw new Error(`Field ${fieldId} does not exist`);
    }

    // 保存旧值
    const oldValue = field.value;
    
    // 更新字段值
    field.value = value;

    // 触发依赖该字段的字段重新计算
    this.triggerDependentCalculations(fieldId);

    // 通知观察者
    this.notifyObservers(fieldId, oldValue, value);

    return this;
  }

  // 获取字段值
  getFieldValue(fieldId) {
    const field = this.fields.get(fieldId);
    return field ? field.value : null;
  }

  // 触发依赖计算
  triggerDependentCalculations(fieldId) {
    const dependentFields = this.dependencies.get(fieldId);
    if (!dependentFields) return;

    // 使用拓扑排序确保计算顺序正确
    const sortedFields = this.topologicalSort([...dependentFields]);
    
    for (const depFieldId of sortedFields) {
      this.calculateField(depFieldId);
    }
  }

  // 计算字段值
  calculateField(fieldId) {
    const field = this.fields.get(fieldId);
    if (!field || !field.calculation) {
      return;
    }

    try {
      // 获取依赖字段的值
      const dependencyValues = {};
      if (field.dependencies) {
        field.dependencies.forEach(depId => {
          dependencyValues[depId] = this.getFieldValue(depId);
        });
      }

      // 执行计算
      const newValue = field.calculation(dependencyValues, this);

      // 设置新值
      this.setFieldValue(fieldId, newValue);
    } catch (error) {
      console.error(`计算字段 ${fieldId} 时出错:`, error);
    }
  }

  // 拓扑排序（用于确定计算顺序）
  topologicalSort(fieldIds) {
    const visited = new Set();
    const result = [];

    const dfs = (fieldId) => {
      if (visited.has(fieldId)) return;
      visited.add(fieldId);

      const field = this.fields.get(fieldId);
      if (field && field.dependencies) {
        field.dependencies.forEach(depId => {
          if (fieldIds.includes(depId)) {
            dfs(depId);
          }
        });
      }

      result.push(fieldId);
    };

    fieldIds.forEach(fieldId => {
      if (!visited.has(fieldId)) {
        dfs(fieldId);
      }
    });

    return result;
  }

  // 添加观察者
  addObserver(fieldId, callback) {
    if (!this.observers.has(fieldId)) {
      this.observers.set(fieldId, []);
    }
    this.observers.get(fieldId).push(callback);
    return this;
  }

  // 通知观察者
  notifyObservers(fieldId, oldValue, newValue) {
    const callbacks = this.observers.get(fieldId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(fieldId, oldValue, newValue);
        } catch (error) {
          console.error(`通知观察者时出错:`, error);
        }
      });
    }
  }

  // 获取所有字段值
  getAllFieldValues() {
    const values = {};
    for (const [fieldId, field] of this.fields) {
      values[fieldId] = field.value;
    }
    return values;
  }

  // 批量设置字段值
  setFieldValues(values) {
    for (const [fieldId, value] of Object.entries(values)) {
      this.setFieldValue(fieldId, value);
    }
    return this;
  }

  // 验证表单
  validateForm() {
    const errors = {};
    
    for (const [fieldId, field] of this.fields) {
      if (field.validator) {
        const isValid = field.validator(field.value, this.getAllFieldValues());
        if (!isValid) {
          errors[fieldId] = field.errorMessage || `字段 ${fieldId} 验证失败`;
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // 重置表单
  reset() {
    for (const [fieldId, field] of this.fields) {
      field.value = field.defaultValue || null;
    }
    return this;
  }

  // 导出表单数据
  exportData() {
    const data = {};
    for (const [fieldId, field] of this.fields) {
      data[fieldId] = {
        value: field.value,
        type: field.type,
        dependencies: field.dependencies
      };
    }
    return data;
  }
}

// 使用示例
const engine = new FormCalculationEngine();

// 添加评分表单字段
engine
  .addField('weight1', 30, {
    type: 'number',
    dependencies: [],
    dependentFields: ['score1', 'total']
  })
  .addField('weight2', 40, {
    type: 'number',
    dependencies: [],
    dependentFields: ['score2', 'total']
  })
  .addField('weight3', 30, {
    type: 'number',
    dependencies: [],
    dependentFields: ['score3', 'total']
  })
  .addField('score1', 85, {
    type: 'number',
    dependencies: ['weight1'],
    dependentFields: ['total']
  })
  .addField('score2', 90, {
    type: 'number',
    dependencies: ['weight2'],
    dependentFields: ['total']
  })
  .addField('score3', 78, {
    type: 'number',
    dependencies: ['weight3'],
    dependentFields: ['total']
  })
  .addField('total', 0, {
    type: 'number',
    dependencies: ['weight1', 'weight2', 'weight3', 'score1', 'score2', 'score3'],
    calculation: (deps) => {
      // 计算加权总分
      const total = (deps.weight1 * deps.score1 + 
                    deps.weight2 * deps.score2 + 
                    deps.weight3 * deps.score3) / 100;
      return Math.round(total * 100) / 100; // 保留两位小数
    }
  });

// 设置计算规则
engine
  .setCalculation('score1', (deps) => {
    // 示例：根据权重调整得分
    return deps.weight1 > 0 ? deps.score1 : 0;
  })
  .setCalculation('score2', (deps) => {
    return deps.weight2 > 0 ? deps.score2 : 0;
  })
  .setCalculation('score3', (deps) => {
    return deps.weight3 > 0 ? deps.score3 : 0;
  });

// 添加观察者监听字段变化
engine.addObserver('total', (fieldId, oldValue, newValue) => {
  console.log(`总分从 ${oldValue} 变更为 ${newValue}`);
});
```

### React组件实现（UI层）

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FormCalculationEngine } from './FormCalculationEngine';

// 评分表单UI组件
const RatingForm = ({ initialData = {} }) => {
  const [engine] = useState(() => new FormCalculationEngine());
  const [fieldValues, setFieldValues] = useState({});
  const [errors, setErrors] = useState({});

  // 初始化引擎
  useEffect(() => {
    // 添加字段
    engine
      .addField('weight1', initialData.weight1 || 30, {
        type: 'number',
        dependencies: [],
        dependentFields: ['score1', 'total']
      })
      .addField('weight2', initialData.weight2 || 40, {
        type: 'number',
        dependencies: [],
        dependentFields: ['score2', 'total']
      })
      .addField('weight3', initialData.weight3 || 30, {
        type: 'number',
        dependencies: [],
        dependentFields: ['score3', 'total']
      })
      .addField('score1', initialData.score1 || 85, {
        type: 'number',
        dependencies: ['weight1'],
        dependentFields: ['total']
      })
      .addField('score2', initialData.score2 || 90, {
        type: 'number',
        dependencies: ['weight2'],
        dependentFields: ['total']
      })
      .addField('score3', initialData.score3 || 78, {
        type: 'number',
        dependencies: ['weight3'],
        dependentFields: ['total']
      })
      .addField('total', initialData.total || 0, {
        type: 'number',
        dependencies: ['weight1', 'weight2', 'weight3', 'score1', 'score2', 'score3'],
        calculation: (deps) => {
          const total = (deps.weight1 * deps.score1 + 
                        deps.weight2 * deps.score2 + 
                        deps.weight3 * deps.score3) / 100;
          return Math.round(total * 100) / 100;
        }
      });

    // 设置观察者
    engine.addObserver('total', (fieldId, oldValue, newValue) => {
      setFieldValues(prev => ({ ...prev, [fieldId]: newValue }));
    });

    // 设置其他字段观察者
    ['weight1', 'weight2', 'weight3', 'score1', 'score2', 'score3'].forEach(fieldId => {
      engine.addObserver(fieldId, (fieldId, oldValue, newValue) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: newValue }));
      });
    });

    // 初始化字段值
    setFieldValues(engine.getAllFieldValues());
  }, [engine, initialData]);

  // 处理字段值变化
  const handleFieldChange = useCallback((fieldId, value) => {
    // 转换值类型
    const processedValue = engine.fields.get(fieldId)?.type === 'number' 
      ? Number(value) 
      : value;
    
    engine.setFieldValue(fieldId, processedValue);
    
    // 验证表单
    const validation = engine.validateForm();
    setErrors(validation.errors);
  }, [engine]);

  // 提交表单
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const validation = engine.validateForm();
    if (validation.isValid) {
      console.log('表单数据:', engine.getAllFieldValues());
      alert('提交成功！');
    } else {
      setErrors(validation.errors);
    }
  }, [engine]);

  // 重置表单
  const handleReset = useCallback(() => {
    engine.reset();
    setFieldValues(engine.getAllFieldValues());
    setErrors({});
  }, [engine]);

  return (
    <div className="rating-form">
      <h2>动态评分表单</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>权重1:</label>
          <input
            type="number"
            value={fieldValues.weight1 || ''}
            onChange={(e) => handleFieldChange('weight1', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>得分1:</label>
          <input
            type="number"
            value={fieldValues.score1 || ''}
            onChange={(e) => handleFieldChange('score1', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>权重2:</label>
          <input
            type="number"
            value={fieldValues.weight2 || ''}
            onChange={(e) => handleFieldChange('weight2', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>得分2:</label>
          <input
            type="number"
            value={fieldValues.score2 || ''}
            onChange={(e) => handleFieldChange('score2', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>权重3:</label>
          <input
            type="number"
            value={fieldValues.weight3 || ''}
            onChange={(e) => handleFieldChange('weight3', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>得分3:</label>
          <input
            type="number"
            value={fieldValues.score3 || ''}
            onChange={(e) => handleFieldChange('score3', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>总分:</label>
          <input
            type="number"
            value={fieldValues.total || ''}
            readOnly
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </div>
        
        {errors.total && (
          <div className="error-message">{errors.total}</div>
        )}
        
        <div className="form-actions">
          <button type="submit">提交</button>
          <button type="button" onClick={handleReset}>重置</button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;
```

### Vue组件实现（UI层）

```vue
<template>
  <div class="rating-form">
    <h2>动态评分表单</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>权重1:</label>
        <input
          type="number"
          :value="fieldValues.weight1 || ''"
          @input="handleFieldChange('weight1', $event.target.value)"
        />
      </div>
      
      <div class="form-group">
        <label>得分1:</label>
        <input
          type="number"
          :value="fieldValues.score1 || ''"
          @input="handleFieldChange('score1', $event.target.value)"
        />
      </div>
      
      <div class="form-group">
        <label>权重2:</label>
        <input
          type="number"
          :value="fieldValues.weight2 || ''"
          @input="handleFieldChange('weight2', $event.target.value)"
        />
      </div>
      
      <div class="form-group">
        <label>得分2:</label>
        <input
          type="number"
          :value="fieldValues.score2 || ''"
          @input="handleFieldChange('score2', $event.target.value)"
        />
      </div>
      
      <div class="form-group">
        <label>权重3:</label>
        <input
          type="number"
          :value="fieldValues.weight3 || ''"
          @input="handleFieldChange('weight3', $event.target.value)"
        />
      </div>
      
      <div class="form-group">
        <label>得分3:</label>
        <input
          type="number"
          :value="fieldValues.score3 || ''"
          @input="handleFieldChange('score3', $event.target.value)"
        />
      </div>
      
      <div class="form-group">
        <label>总分:</label>
        <input
          type="number"
          :value="fieldValues.total || ''"
          readonly
          style="background-color: #f0f0f0;"
        />
      </div>
      
      <div v-if="errors.total" class="error-message">
        {{ errors.total }}
      </div>
      
      <div class="form-actions">
        <button type="submit">提交</button>
        <button type="button" @click="handleReset">重置</button>
      </div>
    </form>
  </div>
</template>

<script>
import { FormCalculationEngine } from './FormCalculationEngine';

export default {
  name: 'RatingForm',
  props: {
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      engine: null,
      fieldValues: {},
      errors: {}
    };
  },
  mounted() {
    this.engine = new FormCalculationEngine();
    
    // 添加字段
    this.engine
      .addField('weight1', this.initialData.weight1 || 30, {
        type: 'number',
        dependencies: [],
        dependentFields: ['score1', 'total']
      })
      .addField('weight2', this.initialData.weight2 || 40, {
        type: 'number',
        dependencies: [],
        dependentFields: ['score2', 'total']
      })
      .addField('weight3', this.initialData.weight3 || 30, {
        type: 'number',
        dependencies: [],
        dependentFields: ['score3', 'total']
      })
      .addField('score1', this.initialData.score1 || 85, {
        type: 'number',
        dependencies: ['weight1'],
        dependentFields: ['total']
      })
      .addField('score2', this.initialData.score2 || 90, {
        type: 'number',
        dependencies: ['weight2'],
        dependentFields: ['total']
      })
      .addField('score3', this.initialData.score3 || 78, {
        type: 'number',
        dependencies: ['weight3'],
        dependentFields: ['total']
      })
      .addField('total', this.initialData.total || 0, {
        type: 'number',
        dependencies: ['weight1', 'weight2', 'weight3', 'score1', 'score2', 'score3'],
        calculation: (deps) => {
          const total = (deps.weight1 * deps.score1 + 
                        deps.weight2 * deps.score2 + 
                        deps.weight3 * deps.score3) / 100;
          return Math.round(total * 100) / 100;
        }
      });

    // 设置观察者
    this.engine.addObserver('total', (fieldId, oldValue, newValue) => {
      this.$set(this.fieldValues, fieldId, newValue);
    });

    // 设置其他字段观察者
    ['weight1', 'weight2', 'weight3', 'score1', 'score2', 'score3'].forEach(fieldId => {
      this.engine.addObserver(fieldId, (fieldId, oldValue, newValue) => {
        this.$set(this.fieldValues, fieldId, newValue);
      });
    });

    // 初始化字段值
    this.fieldValues = { ...this.engine.getAllFieldValues() };
  },
  methods: {
    handleFieldChange(fieldId, value) {
      // 转换值类型
      const processedValue = this.engine.fields.get(fieldId)?.type === 'number' 
        ? Number(value) 
        : value;
      
      this.engine.setFieldValue(fieldId, processedValue);
      
      // 验证表单
      const validation = this.engine.validateForm();
      this.errors = { ...validation.errors };
    },
    handleSubmit() {
      const validation = this.engine.validateForm();
      if (validation.isValid) {
        console.log('表单数据:', this.engine.getAllFieldValues());
        alert('提交成功！');
      } else {
        this.errors = { ...validation.errors };
      }
    },
    handleReset() {
      this.engine.reset();
      this.fieldValues = { ...this.engine.getAllFieldValues() };
      this.errors = {};
    }
  }
};
</script>

<style scoped>
.rating-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: red;
  margin-top: 5px;
}

.form-actions {
  margin-top: 20px;
}

.form-actions button {
  margin-right: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: #007bff;
  color: white;
}

.form-actions button[type="button"] {
  background-color: #6c757d;
  color: white;
}
</style>
```

## 实际应用场景

### 1. 绩效考核系统
- 权重分配：不同考核项的权重总和为100%
- 得分计算：根据权重和单项得分计算总分
- 等级评定：根据总分自动评定绩效等级

### 2. 项目评估系统
- 多维度评分：技术能力、团队协作、创新能力等
- 动态权重：根据不同项目类型调整权重
- 综合评分：自动计算加权平均分

### 3. 教育评分系统
- 成绩计算：平时成绩、期中考试、期末考试的加权计算
- 学分统计：根据课程学分和成绩计算绩点
- 等级转换：分数到等级的自动转换

## 注意事项

1. 性能优化：避免循环依赖导致无限计算
2. 错误处理：计算过程中的异常需要妥善处理
3. 缓存策略：对于复杂计算可以使用缓存提升性能
4. 扩展性：设计时要考虑未来新增字段的便利性
5. 测试覆盖：联动计算逻辑需要充分的单元测试
