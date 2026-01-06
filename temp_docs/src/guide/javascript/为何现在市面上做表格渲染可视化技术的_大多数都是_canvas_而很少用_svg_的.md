# 为何现在市面上做表格渲染可视化技术的，大多数都是 canvas，而很少用 svg 的？（了解）

## 标准答案

Canvas 和 SVG 在表格渲染方面有显著差异：

1. **性能差异**：Canvas 是像素级渲染，性能随元素数量增加变化较小；SVG 是 DOM 节点，每个单元格都创建一个元素，大量元素导致性能下降
2. **内存占用**：Canvas 内存占用相对固定；SVG 随元素数量线性增长
3. **交互处理**：Canvas 需要手动计算坐标实现交互；SVG 原生支持事件处理
4. **渲染方式**：Canvas 适合大量简单元素；SVG 适合少量复杂元素

因此，对于大量数据的表格渲染，Canvas 性能优势明显。

## 深入分析

### 1. Canvas 与 SVG 的核心技术差异

Canvas 和 SVG 代表了两种完全不同的渲染范式：

- **Canvas** 是基于像素的位图渲染技术，使用即时模式（immediate mode），一旦绘制完成，原始形状信息就丢失了，只剩下像素数据。开发者需要手动管理所有绘制状态和交互逻辑。

- **SVG** 是基于矢量的文档对象模型（DOM），使用保留模式（retained mode），每个图形元素都是一个独立的 DOM 节点，具有完整的结构和属性信息。

### 2. 表格渲染的特殊需求

表格渲染具有以下特点：
- 需要处理大量单元格（可能数千到数万个）
- 每个单元格通常包含简单的文本或数值
- 需要支持滚动、排序、筛选等交互
- 频繁的更新和重绘操作

### 3. 性能对比分析

在处理大量数据时，Canvas 和 SVG 的性能表现差异显著：

- Canvas 的性能主要取决于绘制操作的复杂度，与元素数量关系相对较小
- SVG 的性能受 DOM 节点数量直接影响，每个节点都有创建、维护和销毁的开销

## 代码实现

### 1. Canvas 表格渲染实现

```javascript
class CanvasTable {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      rowHeight: options.rowHeight || 30,
      colWidth: options.colWidth || 120,
      headerHeight: options.headerHeight || 40,
      ...options
    };
    
    this.data = [];
    this.columns = [];
    this.scrollX = 0;
    this.scrollY = 0;
    this.visibleRows = [];
    this.visibleCols = [];
    
    this.initCanvas();
  }
  
  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // 设置画布大小
    this.resizeCanvas();
    
    // 绑定事件
    this.bindEvents();
  }
  
  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.width = rect.width;
    this.height = rect.height;
  }
  
  bindEvents() {
    // 滚动事件
    this.container.addEventListener('wheel', this.handleWheel.bind(this));
    
    // 点击事件
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    
    // 窗口大小改变
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.render();
    });
  }
  
  setData(data, columns) {
    this.data = data;
    this.columns = columns;
    this.calculateVisibleRange();
    this.render();
  }
  
  calculateVisibleRange() {
    // 计算可见的行范围
    const firstVisibleRow = Math.floor(this.scrollY / this.options.rowHeight);
    const visibleRowCount = Math.ceil(this.height / this.options.rowHeight) + 2; // +2 for buffer
    this.visibleRows = {
      start: Math.max(0, firstVisibleRow),
      end: Math.min(this.data.length, firstVisibleRow + visibleRowCount)
    };
    
    // 计算可见的列范围
    const firstVisibleCol = Math.floor(this.scrollX / this.options.colWidth);
    const visibleColCount = Math.ceil(this.width / this.options.colWidth) + 2; // +2 for buffer
    this.visibleCols = {
      start: Math.max(0, firstVisibleCol),
      end: Math.min(this.columns.length, firstVisibleCol + visibleColCount)
    };
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 渲染表头
    this.renderHeader();
    
    // 渲染数据行
    this.renderRows();
    
    // 渲染边框
    this.renderGridLines();
  }
  
  renderHeader() {
    const ctx = this.ctx;
    
    // 表头背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, this.width, this.options.headerHeight);
    
    // 绘制表头单元格
    for (let i = this.visibleCols.start; i < this.visibleCols.end; i++) {
      const col = this.columns[i];
      if (!col) continue;
      
      const x = i * this.options.colWidth - this.scrollX;
      if (x > this.width || x + this.options.colWidth < 0) continue;
      
      // 单元格边框
      ctx.strokeStyle = '#dee2e6';
      ctx.strokeRect(x, 0, this.options.colWidth, this.options.headerHeight);
      
      // 文本
      ctx.fillStyle = '#495057';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        col.title || col.key,
        x + 8,
        this.options.headerHeight / 2
      );
    }
  }
  
  renderRows() {
    for (let i = this.visibleRows.start; i < this.visibleRows.end; i++) {
      const rowData = this.data[i];
      if (!rowData) continue;
      
      const y = this.options.headerHeight + (i - this.visibleRows.start) * this.options.rowHeight;
      
      // 奇偶行背景色
      if (i % 2 === 0) {
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = '#f8f9fa';
      }
      
      this.ctx.fillRect(0, y, this.width, this.options.rowHeight);
      
      // 渲染单元格
      for (let j = this.visibleCols.start; j < this.visibleCols.end; j++) {
        const col = this.columns[j];
        if (!col) continue;
        
        const x = j * this.options.colWidth - this.scrollX;
        if (x > this.width || x + this.options.colWidth < 0) continue;
        
        // 单元格边框
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.strokeRect(x, y, this.options.colWidth, this.options.rowHeight);
        
        // 单元格内容
        this.ctx.fillStyle = '#495057';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        const cellValue = rowData[col.key];
        const displayText = cellValue !== undefined ? String(cellValue) : '';
        
        // 文本截断处理
        const maxWidth = this.options.colWidth - 16;
        const truncatedText = this.truncateText(displayText, maxWidth);
        
        this.ctx.fillText(
          truncatedText,
          x + 8,
          y + this.options.rowHeight / 2
        );
      }
    }
  }
  
  renderGridLines() {
    // 绘制垂直网格线
    this.ctx.strokeStyle = '#dee2e6';
    for (let i = this.visibleCols.start; i <= this.visibleCols.end; i++) {
      const x = i * this.options.colWidth - this.scrollX;
      if (x >= 0 && x <= this.width) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
        this.ctx.stroke();
      }
    }
    
    // 绘制水平网格线
    for (let i = this.visibleRows.start; i <= this.visibleRows.end; i++) {
      const y = this.options.headerHeight + (i - this.visibleRows.start) * this.options.rowHeight;
      if (y >= 0 && y <= this.height) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
        this.ctx.stroke();
      }
    }
  }
  
  truncateText(text, maxWidth) {
    const ctx = this.ctx;
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    
    return truncated + '...';
  }
  
  handleWheel(e) {
    e.preventDefault();
    
    // 水平滚动
    if (e.shiftKey) {
      this.scrollX = Math.max(0, this.scrollX + e.deltaX);
    } else {
      // 垂直滚动
      this.scrollY = Math.max(0, this.scrollY + e.deltaY);
    }
    
    this.calculateVisibleRange();
    this.render();
  }
  
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算点击的行列
    const colIndex = Math.floor((x + this.scrollX) / this.options.colWidth);
    const rowIndex = Math.floor((y + this.scrollY - this.options.headerHeight) / this.options.rowHeight) + this.visibleRows.start;
    
    if (rowIndex >= 0 && rowIndex < this.data.length && 
        colIndex >= 0 && colIndex < this.columns.length) {
      // 触发单元格点击事件
      this.onCellClick && this.onCellClick(rowIndex, colIndex, this.data[rowIndex], this.columns[colIndex]);
    }
  }
  
  onCellClick(rowIndex, colIndex, rowData, column) {
    console.log('Cell clicked:', { rowIndex, colIndex, rowData, column });
  }
}

// 使用示例
const container = document.getElementById('canvas-table-container');
const canvasTable = new CanvasTable(container, {
  rowHeight: 35,
  colWidth: 150
});

// 模拟数据
const columns = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
  { key: 'email', title: '邮箱' },
  { key: 'department', title: '部门' }
];

const data = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  age: Math.floor(Math.random() * 50) + 20,
  email: `user${i + 1}@example.com`,
  department: ['技术部', '销售部', '市场部', '人事部'][Math.floor(Math.random() * 4)]
}));

canvasTable.setData(data, columns);
```

### 2. SVG 表格渲染实现

```javascript
class SVGTable {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      rowHeight: options.rowHeight || 30,
      colWidth: options.colWidth || 120,
      headerHeight: options.headerHeight || 40,
      ...options
    };
    
    this.data = [];
    this.columns = [];
    this.svg = null;
    this.tableGroup = null;
    
    this.initSVG();
  }
  
  initSVG() {
    // 创建 SVG 元素
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('overflow', 'hidden');
    
    // 创建表格容器组
    this.tableGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(this.tableGroup);
    
    this.container.appendChild(this.svg);
    
    // 绑定事件
    this.bindEvents();
  }
  
  bindEvents() {
    // 滚动事件（需要自定义实现）
    let isDragging = false;
    let lastX, lastY;
    
    this.svg.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        // 更新表格位置
        const currentTransform = this.tableGroup.getAttribute('transform') || 'translate(0,0)';
        const match = currentTransform.match(/translate\(([-\d.]+),([-\d.]+)\)/);
        let x = match ? parseFloat(match[1]) : 0;
        let y = match ? parseFloat(match[2]) : 0;
        
        x += deltaX;
        y += deltaY;
        
        this.tableGroup.setAttribute('transform', `translate(${x},${y})`);
        
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  
  setData(data, columns) {
    this.data = data;
    this.columns = columns;
    
    // 清空现有内容
    while (this.tableGroup.firstChild) {
      this.tableGroup.removeChild(this.tableGroup.firstChild);
    }
    
    this.render();
  }
  
  render() {
    // 渲染表头
    this.renderHeader();
    
    // 渲染数据行
    this.renderRows();
  }
  
  renderHeader() {
    // 表头背景矩形
    const headerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    headerBg.setAttribute('x', 0);
    headerBg.setAttribute('y', 0);
    headerBg.setAttribute('width', this.columns.length * this.options.colWidth);
    headerBg.setAttribute('height', this.options.headerHeight);
    headerBg.setAttribute('fill', '#f8f9fa');
    headerBg.setAttribute('stroke', '#dee2e6');
    this.tableGroup.appendChild(headerBg);
    
    // 表头单元格
    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      
      // 单元格边框
      const cellRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      cellRect.setAttribute('x', i * this.options.colWidth);
      cellRect.setAttribute('y', 0);
      cellRect.setAttribute('width', this.options.colWidth);
      cellRect.setAttribute('height', this.options.headerHeight);
      cellRect.setAttribute('fill', 'none');
      cellRect.setAttribute('stroke', '#dee2e6');
      this.tableGroup.appendChild(cellRect);
      
      // 文本
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', i * this.options.colWidth + 8);
      text.setAttribute('y', this.options.headerHeight / 2);
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-family', 'Arial');
      text.setAttribute('font-size', '14');
      text.setAttribute('fill', '#495057');
      text.textContent = col.title || col.key;
      this.tableGroup.appendChild(text);
    }
  }
  
  renderRows() {
    for (let i = 0; i < this.data.length; i++) {
      const rowData = this.data[i];
      const y = this.options.headerHeight + i * this.options.rowHeight;
      
      // 行背景
      const rowBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rowBg.setAttribute('x', 0);
      rowBg.setAttribute('y', y);
      rowBg.setAttribute('width', this.columns.length * this.options.colWidth);
      rowBg.setAttribute('height', this.options.rowHeight);
      rowBg.setAttribute('fill', i % 2 === 0 ? '#ffffff' : '#f8f9fa');
      rowBg.setAttribute('stroke', 'none');
      this.tableGroup.appendChild(rowBg);
      
      // 单元格
      for (let j = 0; j < this.columns.length; j++) {
        const col = this.columns[j];
        const x = j * this.options.colWidth;
        
        // 单元格边框
        const cellRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cellRect.setAttribute('x', x);
        cellRect.setAttribute('y', y);
        cellRect.setAttribute('width', this.options.colWidth);
        cellRect.setAttribute('height', this.options.rowHeight);
        cellRect.setAttribute('fill', 'none');
        cellRect.setAttribute('stroke', '#dee2e6');
        this.tableGroup.appendChild(cellRect);
        
        // 单元格文本
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + 8);
        text.setAttribute('y', y + this.options.rowHeight / 2);
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-family', 'Arial');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#495057');
        
        const cellValue = rowData[col.key];
        text.textContent = cellValue !== undefined ? String(cellValue) : '';
        this.tableGroup.appendChild(text);
        
        // 添加点击事件
        cellRect.addEventListener('click', () => {
          this.onCellClick && this.onCellClick(i, j, rowData, col);
        });
      }
    }
  }
  
  onCellClick(rowIndex, colIndex, rowData, column) {
    console.log('SVG Cell clicked:', { rowIndex, colIndex, rowData, column });
  }
}

// 使用示例
const svgContainer = document.getElementById('svg-table-container');
const svgTable = new SVGTable(svgContainer, {
  rowHeight: 35,
  colWidth: 150
});

svgTable.setData(data, columns);
```

### 3. 性能对比测试工具

```javascript
class PerformanceComparison {
  constructor() {
    this.results = {};
  }
  
  // 测试 Canvas 渲染性能
  async testCanvasPerformance(data, columns, iterations = 5) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // 创建 Canvas 表格实例
      const container = document.createElement('div');
      container.style.width = '800px';
      container.style.height = '600px';
      document.body.appendChild(container);
      
      const canvasTable = new CanvasTable(container, {
        rowHeight: 30,
        colWidth: 120
      });
      
      canvasTable.setData(data, columns);
      
      const endTime = performance.now();
      times.push(endTime - startTime);
      
      // 清理
      document.body.removeChild(container);
    }
    
    return {
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      times
    };
  }
  
  // 测试 SVG 渲染性能
  async testSVGPerformance(data, columns, iterations = 5) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // 创建 SVG 表格实例
      const container = document.createElement('div');
      container.style.width = '800px';
      container.style.height = '600px';
      document.body.appendChild(container);
      
      const svgTable = new SVGTable(container, {
        rowHeight: 30,
        colWidth: 120
      });
      
      svgTable.setData(data, columns);
      
      const endTime = performance.now();
      times.push(endTime - startTime);
      
      // 清理
      document.body.removeChild(container);
    }
    
    return {
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      times
    };
  }
  
  // 运行性能对比测试
  async runComparison(rowCounts = [100, 500, 1000, 5000]) {
    const results = {};
    
    for (const rowCount of rowCounts) {
      console.log(`Testing with ${rowCount} rows...`);
      
      // 生成测试数据
      const testColumns = [
        { key: 'id', title: 'ID' },
        { key: 'name', title: 'Name' },
        { key: 'value', title: 'Value' }
      ];
      
      const testData = Array.from({ length: rowCount }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        value: Math.random() * 1000
      }));
      
      // 测试 Canvas
      const canvasResult = await this.testCanvasPerformance(testData, testColumns);
      
      // 测试 SVG
      const svgResult = await this.testSVGPerformance(testData, testColumns);
      
      results[rowCount] = {
        canvas: canvasResult,
        svg: svgResult
      };
      
      console.log(`Canvas avg: ${canvasResult.avgTime.toFixed(2)}ms`);
      console.log(`SVG avg: ${svgResult.avgTime.toFixed(2)}ms`);
    }
    
    return results;
  }
}

// 使用性能对比工具
const perfComparison = new PerformanceComparison();
perfComparison.runComparison([100, 500, 1000]).then(results => {
  console.log('Performance comparison results:', results);
});
```

### 4. 虚拟滚动优化实现

```javascript
class VirtualCanvasTable {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      rowHeight: options.rowHeight || 30,
      colWidth: options.colWidth || 120,
      headerHeight: options.headerHeight || 40,
      bufferRowCount: options.bufferRowCount || 5, // 缓冲行数
      ...options
    };
    
    this.data = [];
    this.columns = [];
    this.scrollY = 0;
    this.visibleStartRow = 0;
    this.visibleEndRow = 0;
    
    this.initCanvas();
  }
  
  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    this.bindEvents();
  }
  
  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.width = rect.width;
    this.height = rect.height;
  }
  
  bindEvents() {
    this.container.addEventListener('wheel', this.handleWheel.bind(this));
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.render();
    });
  }
  
  setData(data, columns) {
    this.data = data;
    this.columns = columns;
    this.updateVisibleRange();
    this.render();
  }
  
  updateVisibleRange() {
    this.visibleStartRow = Math.max(0, Math.floor(this.scrollY / this.options.rowHeight) - this.options.bufferRowCount);
    this.visibleEndRow = Math.min(
      this.data.length,
      Math.ceil((this.scrollY + this.height) / this.options.rowHeight) + this.options.bufferRowCount
    );
  }
  
  handleWheel(e) {
    e.preventDefault();
    
    this.scrollY = Math.max(0, this.scrollY + e.deltaY);
    this.updateVisibleRange();
    
    // 使用 requestAnimationFrame 优化渲染
    if (!this.isRendering) {
      this.isRendering = true;
      requestAnimationFrame(() => {
        this.render();
        this.isRendering = false;
      });
    }
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 渲染表头
    this.renderHeader();
    
    // 渲染可见行
    this.renderVisibleRows();
  }
  
  renderHeader() {
    const ctx = this.ctx;
    
    // 表头背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, this.width, this.options.headerHeight);
    
    // 绘制表头边框
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= this.columns.length; i++) {
      const x = i * this.options.colWidth;
      if (x <= this.width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.options.headerHeight);
        ctx.stroke();
      }
    }
    
    ctx.beginPath();
    ctx.moveTo(0, this.options.headerHeight);
    ctx.lineTo(this.width, this.options.headerHeight);
    ctx.stroke();
    
    // 渲染表头文本
    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      const x = i * this.options.colWidth;
      
      if (x + this.options.colWidth > 0 && x < this.width) {
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const title = col.title || col.key;
        ctx.fillText(title, x + 8, this.options.headerHeight / 2);
      }
    }
  }
  
  renderVisibleRows() {
    for (let i = this.visibleStartRow; i < this.visibleEndRow; i++) {
      const rowData = this.data[i];
      if (!rowData) continue;
      
      const y = this.options.headerHeight + (i - this.visibleStartRow) * this.options.rowHeight - 
                (this.scrollY % this.options.rowHeight);
      
      // 只渲染在可视区域内的行
      if (y + this.options.rowHeight < 0 || y > this.height) continue;
      
      // 行背景
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f8f9fa';
      ctx.fillRect(0, y, this.width, this.options.rowHeight);
      
      // 渲染单元格
      for (let j = 0; j < this.columns.length; j++) {
        const col = this.columns[j];
        const x = j * this.options.colWidth;
        
        if (x + this.options.colWidth > 0 && x < this.width) {
          // 单元格边框
          ctx.strokeStyle = '#dee2e6';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, this.options.colWidth, this.options.rowHeight);
          
          // 单元格内容
          ctx.fillStyle = '#495057';
          ctx.font = '12px Arial';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          
          const cellValue = rowData[col.key];
          const displayText = cellValue !== undefined ? String(cellValue) : '';
          
          // 文本截断
          const maxWidth = this.options.colWidth - 16;
          const truncatedText = this.truncateText(displayText, maxWidth, ctx);
          
          ctx.fillText(truncatedText, x + 8, y + this.options.rowHeight / 2);
        }
      }
    }
  }
  
  truncateText(text, maxWidth, ctx) {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    
    return truncated + '...';
  }
}

// 使用虚拟滚动的 Canvas 表格
const virtualContainer = document.getElementById('virtual-table-container');
const virtualTable = new VirtualCanvasTable(virtualContainer, {
  rowHeight: 35,
  colWidth: 150
});

virtualTable.setData(data, columns);
```

## 实际应用场景

### 1. 大数据表格场景

Canvas 特别适合以下场景：
- 金融交易数据展示（大量实时数据）
- 日志分析表格（成千上万条记录）
- 数据科学应用（大型数据集可视化）
- 企业级报表系统

### 2. 选择 Canvas 还是 SVG 的决策树

```javascript
function chooseTableTechnology(dataSize, interactionLevel, updateFrequency) {
  // 数据量大（>10000行）且更新频繁 -> Canvas
  if (dataSize > 10000 && updateFrequency > 10) {
    return 'Canvas';
  }
  
  // 需要复杂交互且数据量小 -> SVG
  if (interactionLevel === 'high' && dataSize < 1000) {
    return 'SVG';
  }
  
  // 中等数据量，中等交互 -> 可考虑虚拟滚动的 Canvas
  if (dataSize > 1000 && dataSize < 10000) {
    return 'Virtual Canvas';
  }
  
  // 默认选择 Canvas（性能更好）
  return 'Canvas';
}
```

## 注意事项

1. **内存管理**：Canvas 需要注意清理不再使用的资源
2. **可访问性**：Canvas 不如 SVG 便于屏幕阅读器访问
3. **交互复杂性**：Canvas 需要手动处理事件和坐标计算
4. **响应式设计**：Canvas 需要额外处理缩放和分辨率适配
5. **浏览器兼容性**：现代浏览器都支持，但需考虑旧版本
6. **调试困难**：Canvas 内容难以通过开发者工具检查
7. **文本渲染**：Canvas 文本渲染可能在不同设备上表现不一致

## 总结

Canvas 在表格渲染方面相比 SVG 具有显著的性能优势，特别是在处理大量数据时。虽然 SVG 提供了更好的 DOM 操作和事件处理能力，但其在处理大量元素时的性能瓶颈使其不适合大数据量的表格场景。选择哪种技术应根据具体的应用场景、数据量大小、交互需求和性能要求来决定。
