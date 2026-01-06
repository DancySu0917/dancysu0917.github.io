# CSS3 新增伪类，以及伪元素？（必会）

**题目**: CSS3 新增伪类，以及伪元素？（必会）

**答案**:

### CSS3 新增伪类（Pseudo-classes）

伪类用于选择元素的特定状态或位置，CSS3引入了许多新的伪类选择器：

#### 结构性伪类
1. **:nth-child(n)**
   - 选择父元素的第n个子元素
   ```css
   li:nth-child(2) { color: red; } /* 选择第二个li元素 */
   ```

2. **:nth-last-child(n)**
   - 从后往前数的第n个子元素
   ```css
   li:nth-last-child(2) { color: blue; } /* 选择倒数第二个li元素 */
   ```

3. **:nth-of-type(n)**
   - 选择同类型元素中的第n个
   ```css
   p:nth-of-type(2) { font-weight: bold; } /* 选择第二个p元素 */
   ```

4. **:nth-last-of-type(n)**
   - 从后往前数同类型元素中的第n个
   ```css
   p:nth-last-of-type(1) { margin-bottom: 0; } /* 选择最后一个p元素 */
   ```

5. **:first-child** / **:last-child**
   - 选择第一个或最后一个子元素
   ```css
   li:first-child { margin-top: 0; }
   li:last-child { margin-bottom: 0; }
   ```

6. **:first-of-type** / **:last-of-type**
   - 选择同类型元素中的第一个或最后一个
   ```css
   p:first-of-type { text-indent: 2em; }
   ```

7. **:only-child** / **:only-of-type**
   - 选择唯一的子元素或唯一类型的元素
   ```css
   div:only-child { background: yellow; }
   ```

#### 状态性伪类
1. **:target**
   - 选择当前活动的目标元素（URL中的锚点）
   ```css
   #section:target { background: #ffeb3b; }
   ```

2. **:enabled** / **:disabled**
   - 选择启用或禁用的表单元素
   ```css
   input:disabled { opacity: 0.5; }
   ```

3. **:checked**
   - 选择被选中的单选按钮或复选框
   ```css
   input:checked + label { color: green; }
   ```

4. **:not(selector)**
   - 否定伪类，选择不符合指定条件的元素
   ```css
   p:not(.special) { color: gray; }
   ```

#### 表单相关伪类
1. **:valid** / **:invalid**
   - 选择符合或不符合验证规则的表单元素
   ```css
   input:valid { border: 2px solid green; }
   input:invalid { border: 2px solid red; }
   ```

2. **:required** / **:optional**
   - 选择必需或可选的表单元素
   ```css
   input:required { border-left: 3px solid red; }
   ```

3. **:in-range** / **:out-of-range**
   - 选择在或不在指定范围内的数值输入
   ```css
   input:out-of-range { background: #ffdddd; }
   ```

### CSS3 新增伪元素（Pseudo-elements）

伪元素用于创建虚拟的DOM元素，CSS3规范中伪元素使用双冒号(::)表示：

1. **::before** / **::after**
   - 在元素内容前后插入虚拟内容
   ```css
   .quote::before { content: """; }
   .quote::after { content: """; }
   ```

2. **::first-line**
   - 选择元素的第一行
   ```css
   p::first-line { font-weight: bold; }
   ```

3. **::first-letter**
   - 选择元素的第一个字母
   ```css
   p::first-letter { font-size: 2em; }
   ```

4. **::selection**
   - 选择用户选中的文本
   ```css
   ::selection { background: #ffeb3b; }
   ```

5. **::placeholder**
   - 选择输入框的占位符文本
   ```css
   input::placeholder { color: #999; }
   ```

### CSS4 新增伪类（部分）
1. **:matches()** - 选择匹配列表中任意一个选择器的元素
2. **:has()** - 选择包含特定子元素的元素
3. **:focus-within** - 元素本身或其子元素获得焦点时

### 实际应用示例

#### 1. 表格隔行变色
```css
tr:nth-child(even) { background-color: #f2f2f2; }
tr:nth-child(odd) { background-color: #ffffff; }
```

#### 2. 表单验证样式
```css
input:valid { border: 2px solid #28a745; }
input:invalid { border: 2px solid #dc3545; }
input:focus:invalid { outline: 2px solid #dc3545; }
```

#### 3. 导航菜单样式
```css
.nav li:nth-child(1) { background-color: #ff6b6b; }
.nav li:nth-child(2) { background-color: #4ecdc4; }
.nav li:nth-child(3) { background-color: #45b7d1; }
```

### 总结
- 伪类选择元素的特定状态或位置，使用单冒号(:)
- 伪元素创建虚拟DOM元素，使用双冒号(::)
- CSS3新增了大量实用的伪类和伪元素，大大增强了CSS的选择和样式能力
- 这些选择器可以单独使用，也可以组合使用以实现更精确的选择
