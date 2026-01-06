# flex 属性，主轴交叉轴对齐，改变主轴方向会怎样，如何实现布局（顶部排列，主轴均匀分布）（了解）

**题目**: flex 属性，主轴交叉轴对齐，改变主轴方向会怎样，如何实现布局（顶部排列，主轴均匀分布）（了解）

**答案**:

### Flex 属性详解

#### 容器属性：
1. **flex-direction**: 决定主轴方向
   - row（默认）：水平方向，起点在左端
   - row-reverse：水平方向，起点在右端
   - column：垂直方向，起点在上沿
   - column-reverse：垂直方向，起点在下沿

2. **justify-content**: 定义项目在主轴上的对齐方式
   - flex-start（默认）：左对齐
   - flex-end：右对齐
   - center：居中
   - space-between：两端对齐，项目之间的间隔相等
   - space-around：每个项目两侧的间隔相等
   - space-evenly：每个项目之间的间隔相等

3. **align-items**: 定义项目在交叉轴上的对齐方式
   - stretch（默认）：如果项目未设置高度或设为auto，将占满整个容器的高度
   - flex-start：交叉轴的起点对齐
   - flex-end：交叉轴的终点对齐
   - center：交叉轴的中点对齐
   - baseline：项目的第一行文字的基线对齐

4. **align-content**: 定义多根轴线的对齐方式（当项目换行时）
   - flex-start：与交叉轴的起点对齐
   - flex-end：与交叉轴的终点对齐
   - center：与交叉轴的中点对齐
   - space-between：与交叉轴两端对齐，轴线之间的间隔平均分布
   - space-around：每根轴线两侧的间隔都相等
   - stretch（默认）：轴线占满整个交叉轴

#### 项目属性：
1. **order**: 定义项目的排列顺序，数值越小，排列越靠前
2. **flex-grow**: 定义项目的放大比例
3. **flex-shrink**: 定义项目的缩小比例
4. **flex-basis**: 定义在分配多余空间之前，项目占据的主轴空间
5. **flex**: grow、shrink、basis的简写，默认值为0 1 auto

### 主轴与交叉轴对齐

#### 主轴对齐（justify-content）：
- **flex-start**: 所有项目从主轴起点开始排列
- **center**: 所有项目居中排列
- **space-between**: 第一个项目在起点，最后一个在终点，中间项目平均分布
- **space-around**: 每个项目两侧都有相等间隔
- **space-evenly**: 所有项目之间的间隔都相等

#### 交叉轴对齐（align-items）：
- **stretch**: 项目拉伸以填满容器（默认）
- **flex-start**: 项目在交叉轴起点对齐
- **center**: 项目在交叉轴中心对齐
- **flex-end**: 项目在交叉轴终点对齐

### 改变主轴方向的影响

当改变flex-direction时：
- **row → column**: 主轴从水平变为垂直，原本的左右对齐变成上下对齐
- **column → row**: 主轴从垂直变为水平，原本的上下对齐变成左右对齐
- justify-content和align-items的作用轴也会相应交换

```css
.container {
    display: flex;
    flex-direction: row; /* 主轴为水平方向 */
    justify-content: space-between; /* 水平方向两端对齐 */
    align-items: center; /* 垂直方向居中对齐 */
}

/* 改变主轴方向后 */
.container {
    display: flex;
    flex-direction: column; /* 主轴为垂直方向 */
    justify-content: space-between; /* 垂直方向两端对齐 */
    align-items: center; /* 水平方向居中对齐 */
}
```

### 实现布局：顶部排列，主轴均匀分布

要实现顶部排列且主轴均匀分布的布局，需要使用以下属性：

```css
.container {
    display: flex;
    flex-direction: row; /* 水平主轴 */
    justify-content: space-between; /* 主轴均匀分布 */
    align-items: flex-start; /* 顶部排列（交叉轴起点对齐） */
}
```

或者使用space-around或space-evenly来实现不同的均匀分布效果：

```css
.container {
    display: flex;
    flex-direction: row;
    justify-content: space-around; /* 主轴均匀分布，项目两侧有间隔 */
    align-items: flex-start; /* 顶部排列 */
}
```

### 完整示例

```html
<div class="container">
    <div class="item">项目1</div>
    <div class="item">项目2</div>
    <div class="item">项目3</div>
</div>
```

```css
.container {
    display: flex;
    flex-direction: row;
    justify-content: space-between; /* 主轴均匀分布 */
    align-items: flex-start; /* 顶部排列 */
    height: 200px;
    border: 1px solid #ccc;
}

.item {
    padding: 10px;
    background: #f0f0f0;
    border: 1px solid #999;
}
```

### 总结
- 主轴和交叉轴是相对的概念，取决于flex-direction的设置
- justify-content控制主轴对齐，align-items控制交叉轴对齐
- 改变主轴方向会改变对齐效果的方向
- 要实现顶部排列且主轴均匀分布，使用justify-content: space-between和align-items: flex-start
