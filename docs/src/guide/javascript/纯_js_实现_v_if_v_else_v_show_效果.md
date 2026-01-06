# 纯 js 实现 v-if v-else v-show 效果？（了解）

**题目**: 纯 js 实现 v-if v-else v-show 效果？（了解）

## 标准答案

v-if 和 v-show 是 Vue.js 中的条件渲染指令，它们的实现原理可以通过原生 JavaScript 模拟：
- v-if：条件为真时渲染元素，为假时完全移除元素
- v-show：始终渲染元素，通过 CSS display 属性控制显示/隐藏

## 深入理解

### v-if 的原生 JavaScript 实现

v-if 指令的特点是条件为真时渲染元素，为假时完全移除元素（DOM 中不存在），具有惰性渲染的特点。

```javascript
// 模拟 v-if 指令
class VIf {
  constructor(condition, element) {
    this.condition = condition;
    this.element = element;
    this.placeholder = document.createComment('v-if');
    this.parentNode = element.parentNode;
    this.rendered = false;
    this.render();
  }

  update(condition) {
    if (this.condition !== condition) {
      this.condition = condition;
      this.render();
    }
  }

  render() {
    if (this.condition && !this.rendered) {
      // 条件为真，插入元素
      this.parentNode.replaceChild(this.element, this.placeholder);
      this.rendered = true;
    } else if (!this.condition && this.rendered) {
      // 条件为假，移除元素并插入占位符
      this.parentNode.replaceChild(this.placeholder, this.element);
      this.rendered = false;
    }
  }
}

// 使用示例
const element = document.querySelector('#myElement');
const vIf = new VIf(true, element); // 初始显示
vIf.update(false); // 隐藏元素，从 DOM 中移除
vIf.update(true);  // 显示元素，重新插入 DOM
```

### v-show 的原生 JavaScript 实现

v-show 指令无论条件真假都会渲染元素，只是通过 CSS 的 display 属性控制显示/隐藏，元素始终存在于 DOM 中。

```javascript
// 模拟 v-show 指令
class VShow {
  constructor(condition, element) {
    this.condition = condition;
    this.element = element;
    this.render();
  }

  update(condition) {
    if (this.condition !== condition) {
      this.condition = condition;
      this.render();
    }
  }

  render() {
    this.element.style.display = this.condition ? '' : 'none';
  }
}

// 使用示例
const element = document.querySelector('#myElement');
const vShow = new VShow(true, element); // 初始显示
vShow.update(false); // 隐藏元素，设置 display: none
vShow.update(true);  // 显示元素，恢复 display 属性
```

### v-if/v-else 的原生 JavaScript 实现

Vue.js 中的 v-if/v-else 实现了一组条件渲染逻辑，可以扩展上面的 v-if 实现来支持 v-else。

```javascript
// 模拟 v-if/v-else 指令
class VIfElse {
  constructor(ifCondition, ifElement, elseElement) {
    this.ifCondition = ifCondition;
    this.ifElement = ifElement;
    this.elseElement = elseElement;
    this.ifPlaceholder = document.createComment('v-if');
    this.elsePlaceholder = document.createComment('v-else');
    this.parentNode = ifElement.parentNode;
    this.rendered = { if: false, else: false };
    this.render();
  }

  update(ifCondition) {
    if (this.ifCondition !== ifCondition) {
      this.ifCondition = ifCondition;
      this.render();
    }
  }

  render() {
    if (this.ifCondition) {
      // 显示 if 元素，隐藏 else 元素
      if (!this.rendered.if) {
        this.parentNode.replaceChild(this.ifElement, this.ifPlaceholder);
        this.rendered.if = true;
      }
      if (this.rendered.else) {
        this.parentNode.replaceChild(this.elsePlaceholder, this.elseElement);
        this.rendered.else = false;
      }
    } else {
      // 显示 else 元素，隐藏 if 元素
      if (this.rendered.if) {
        this.parentNode.replaceChild(this.ifPlaceholder, this.ifElement);
        this.rendered.if = false;
      }
      if (!this.rendered.else) {
        this.parentNode.replaceChild(this.elseElement, this.elsePlaceholder);
        this.rendered.else = true;
      }
    }
  }
}

// 使用示例
const ifElement = document.querySelector('#ifElement');
const elseElement = document.querySelector('#elseElement');
const vIfElse = new VIfElse(true, ifElement, elseElement); // 初始显示 if 元素
vIfElse.update(false); // 显示 else 元素
vIfElse.update(true);  // 显示 if 元素
```

### 性能对比与使用场景

1. **v-if vs v-show**：
   - v-if：切换开销大，适合条件很少改变的场景
   - v-show：初始渲染开销大，适合频繁切换的场景

2. **性能优化考虑**：
   - 对于频繁切换的元素，使用 v-show 更高效
   - 对于很少改变的条件，使用 v-if 更节省资源

### 在实际项目中的应用

```javascript
// 实际项目中的条件渲染函数
function conditionalRender(condition, element, type = 'if') {
  if (type === 'if') {
    // v-if 实现
    const placeholder = document.createComment('conditional-render');
    const parent = element.parentNode;
    let isRendered = false;
    
    return function update(newCondition) {
      if (newCondition && !isRendered) {
        parent.replaceChild(element, placeholder);
        isRendered = true;
      } else if (!newCondition && isRendered) {
        parent.replaceChild(placeholder, element);
        isRendered = false;
      }
    };
  } else if (type === 'show') {
    // v-show 实现
    return function update(newCondition) {
      element.style.display = newCondition ? '' : 'none';
    };
  }
}

// 使用示例
const loadingElement = document.querySelector('#loading');
const updateLoading = conditionalRender(true, loadingElement, 'show');
updateLoading(false); // 隐藏加载指示器
updateLoading(true);  // 显示加载指示器
```

这种实现方式可以帮助我们理解 Vue.js 的条件渲染原理，同时在没有 Vue.js 的环境中也能实现类似的效果。
