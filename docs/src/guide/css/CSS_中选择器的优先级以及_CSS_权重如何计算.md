# CSS 中选择器的优先级以及 CSS 权重如何计算？（必会）

**题目**: CSS 中选择器的优先级以及 CSS 权重如何计算？（必会）

**答案**:

CSS选择器的优先级（特异性/Specificity）决定了当多个CSS规则应用于同一个元素时，哪个规则会被应用。CSS权重计算遵循以下规则：

## CSS优先级计算规则

CSS选择器的优先级是通过一个四元组 (a, b, c, d) 来计算的：

- a: 内联样式的数量（style属性）
- b: ID选择器的数量
- c: 类选择器、属性选择器和伪类的数量
- d: 元素选择器和伪元素的数量

## 优先级权重等级

从高到低的优先级：

1. **!important** - 最高优先级（不推荐滥用）
2. **内联样式** (style="...") - 1,0,0,0
3. **ID选择器** (#example) - 0,1,0,0
4. **类选择器、属性选择器、伪类** (.example, [type="text"], :hover) - 0,0,1,0
5. **元素选择器、伪元素** (div, p, ::before) - 0,0,0,1
6. **通用选择器** (*, +, ~) - 0,0,0,0
7. **继承样式** - 最低优先级

## 计算示例

```css
/* 权重: 0,0,0,1 */
div {
    color: red;
}

/* 权重: 0,0,1,0 */
.example {
    color: blue;
}

/* 权重: 0,0,1,1 */
div.example {
    color: green;
}

/* 权重: 0,1,0,0 */
#myId {
    color: yellow;
}

/* 权重: 0,1,1,1 */
#myId.example div {
    color: purple;
}

/* 权重: 1,0,0,0 (内联样式) */
<div style="color: orange;">文本</div>
```

## 更多具体示例

```css
/* 权重: 0,0,0,1 */
p { color: red; }

/* 权重: 0,0,0,2 */
ul li { color: blue; }

/* 权重: 0,0,1,1 */
li.class { color: green; }

/* 权重: 0,0,2,1 */
ul.class1 li.class2 { color: yellow; }

/* 权重: 0,1,0,0 */
#footer { color: purple; }

/* 权重: 0,1,0,1 */
#footer p { color: orange; }

/* 权重: 0,1,1,1 */
#footer p.class { color: pink; }

/* 权重: 0,2,0,0 */
#header #footer { color: black; }
```

## 特殊情况

1. **伪类和伪元素**：
   - :hover, :focus, :active, :nth-child() 等伪类权重为 0,0,1,0
   - ::before, ::after, ::first-line 等伪元素权重为 0,0,0,1

2. **属性选择器**：
   - [type="text"] 权重为 0,0,1,0

3. **否定伪类**：
   - :not() 的权重等于其参数的选择器权重
   - :not(.class) 权重为 0,0,1,0

## !important 规则

```css
p {
    color: red !important;  /* 最高优先级 */
}

#myId p {
    color: blue;  /* 通常会更高，但由于!important，red会胜出 */
}
```

## 同权重时的处理

当两个规则具有相同权重时，后定义的规则会覆盖先定义的规则（CSS文件中后面的规则，或HTML中后出现的样式）。

## 最佳实践

1. 尽量避免使用 !important，除非绝对必要
2. 使用类而不是ID来增加特异性，这样更灵活
3. 遵循"移动优先"原则，从简单选择器到复杂选择器
4. 使用CSS预处理器（如Sass、Less）来管理复杂的CSS结构

理解CSS选择器的优先级有助于更好地控制页面样式，避免样式冲突问题。
