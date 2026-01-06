# 前端如何用 canvas 来做电影院选票功能？（了解）
**题目**: 前端如何用 canvas 来做电影院选票功能？（了解）

## 标准答案

使用Canvas实现电影院选票功能的核心是：通过Canvas API绘制座位图，监听鼠标事件处理座位选择，维护座位状态数据，实现选座逻辑。主要涉及Canvas绘图、事件处理、状态管理、性能优化等技术点。

## 详细解析

### 1. Canvas选座功能原理

Canvas选座功能是通过在Canvas元素上绘制座位网格，并为每个座位区域绑定点击事件来实现的。用户点击座位时，通过坐标计算确定点击的座位，然后更新座位状态。

### 2. 核心技术要点

- Canvas绘图API：绘制座位、选中状态、已售状态等
- 事件处理：鼠标点击事件，坐标转换
- 状态管理：维护座位的选中、已售、可选状态
- 性能优化：避免频繁重绘，使用离屏Canvas等

### 3. 实现难点

- 座位坐标计算：将屏幕坐标转换为座位索引
- 状态同步：确保UI状态与数据状态一致
- 响应式适配：适配不同屏幕尺寸
- 性能优化：大量座位渲染的性能问题

## 代码实现

### 1. 基础Canvas选座组件

```javascript
class CinemaSeatSelector {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // 配置选项
    this.options = {
      seatWidth: options.seatWidth || 30,
      seatHeight: options.seatHeight || 30,
      seatGap: options.seatGap || 5,
      rows: options.rows || 10,
      cols: options.cols || 15,
      selectedColor: options.selectedColor || '#FF6B6B',
      availableColor: options.availableColor || '#4ECDC4',
      bookedColor: options.bookedColor || '#AAAAAA',
      selectedBorderColor: options.selectedBorderColor || '#FF0000',
      ...options
    };
    
    // 座位状态：0-可选，1-已售，2-已选
    this.seats = Array(this.options.rows).fill(null).map(() => 
      Array(this.options.cols).fill(0)
    );
    
    // 已选座位列表
    this.selectedSeats = [];
    
    // 绑定事件
    this.bindEvents();
    
    // 初始化绘制
    this.draw();
  }
  
  // 绘制座位图
  draw() {
    const { width, height, seatWidth, seatHeight, seatGap, rows, cols } = this.options;
    
    // 设置Canvas尺寸
    this.canvas.width = width || (cols * (seatWidth + seatGap) + seatGap);
    this.canvas.height = height || (rows * (seatHeight + seatGap) + seatGap);
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制座位
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (seatWidth + seatGap) + seatGap;
        const y = row * (seatHeight + seatGap) + seatGap;
        
        // 根据座位状态设置颜色
        let fillColor, borderColor;
        switch (this.seats[row][col]) {
          case 0: // 可选
            fillColor = this.options.availableColor;
            borderColor = '#333';
            break;
          case 1: // 已售
            fillColor = this.options.bookedColor;
            borderColor = '#666';
            break;
          case 2: // 已选
            fillColor = this.options.selectedColor;
            borderColor = this.options.selectedBorderColor;
            break;
          default:
            fillColor = this.options.availableColor;
            borderColor = '#333';
        }
        
        this.drawSeat(x, y, seatWidth, seatHeight, fillColor, borderColor);
      }
    }
  }
  
  // 绘制单个座位
  drawSeat(x, y, width, height, fillColor, borderColor) {
    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 2;
    
    // 绘制圆角矩形
    this.roundRect(x, y, width, height, 4);
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  // 绘制圆角矩形
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
  
  // 绑定事件
  bindEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const seat = this.getSeatAtPosition(x, y);
      if (seat) {
        this.toggleSeat(seat.row, seat.col);
      }
    });
  }
  
  // 根据坐标获取座位
  getSeatAtPosition(x, y) {
    const { seatWidth, seatHeight, seatGap, rows, cols } = this.options;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seatX = col * (seatWidth + seatGap) + seatGap;
        const seatY = row * (seatHeight + seatGap) + seatGap;
        
        if (x >= seatX && x <= seatX + seatWidth && 
            y >= seatY && y <= seatY + seatHeight) {
          return { row, col, x: seatX, y: seatY };
        }
      }
    }
    
    return null;
  }
  
  // 切换座位状态
  toggleSeat(row, col) {
    // 已售座位不能选择
    if (this.seats[row][col] === 1) {
      return;
    }
    
    // 切换座位状态
    if (this.seats[row][col] === 0) {
      // 检查是否达到最大选择数量
      if (this.selectedSeats.length >= (this.options.maxSelection || 6)) {
        alert('最多只能选择6个座位！');
        return;
      }
      
      this.seats[row][col] = 2; // 设置为已选
      this.selectedSeats.push({ row, col });
    } else if (this.seats[row][col] === 2) {
      this.seats[row][col] = 0; // 设置为可选
      this.selectedSeats = this.selectedSeats.filter(seat => 
        !(seat.row === row && seat.col === col)
      );
    }
    
    // 重新绘制
    this.draw();
    
    // 触发选座变化事件
    this.onSeatChange && this.onSeatChange(this.selectedSeats);
  }
  
  // 设置座位状态
  setSeatStatus(row, col, status) {
    if (row >= 0 && row < this.options.rows && 
        col >= 0 && col < this.options.cols) {
      this.seats[row][col] = status;
      this.draw();
    }
  }
  
  // 设置多个座位状态
  setSeatsStatus(seatList, status) {
    seatList.forEach(({ row, col }) => {
      this.setSeatStatus(row, col, status);
    });
  }
  
  // 获取已选座位
  getSelectedSeats() {
    return [...this.selectedSeats];
  }
  
  // 重置选座
  resetSelection() {
    for (let row = 0; row < this.options.rows; row++) {
      for (let col = 0; col < this.options.cols; col++) {
        if (this.seats[row][col] === 2) {
          this.seats[row][col] = 0;
        }
      }
    }
    this.selectedSeats = [];
    this.draw();
  }
  
  // 设置选座变化回调
  onSeatChange(callback) {
    this.onSeatChange = callback;
  }
}

// 使用示例
function initCinemaSeatSelector() {
  const selector = new CinemaSeatSelector('seatCanvas', {
    rows: 10,
    cols: 15,
    maxSelection: 4,
    seatWidth: 35,
    seatHeight: 35,
    seatGap: 8
  });
  
  // 预设一些已售座位
  const bookedSeats = [
    { row: 2, col: 5 }, { row: 3, col: 7 }, { row: 4, col: 3 },
    { row: 5, col: 8 }, { row: 6, col: 1 }, { row: 7, col: 12 }
  ];
  selector.setSeatsStatus(bookedSeats, 1); // 1表示已售
  
  // 监听选座变化
  selector.onSeatChange((selectedSeats) => {
    console.log('已选座位:', selectedSeats);
    document.getElementById('selectedInfo').textContent = 
      `已选择 ${selectedSeats.length} 个座位`;
  });
  
  return selector;
}
```

### 2. 高级功能实现

```javascript
// 带有性能优化和高级功能的座位选择器
class AdvancedCinemaSeatSelector extends CinemaSeatSelector {
  constructor(canvasId, options = {}) {
    super(canvasId, options);
    
    // 缓存已绘制的座位，避免重复绘制
    this.seatCache = new Map();
    // 缩放和平移
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    // 拖拽
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    
    this.initAdvancedFeatures();
  }
  
  initAdvancedFeatures() {
    // 添加缩放功能
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomIntensity = 0.1;
      const oldScale = this.scale;
      
      if (e.deltaY < 0) {
        this.scale *= (1 + zoomIntensity);
      } else {
        this.scale *= (1 - zoomIntensity);
      }
      
      // 限制缩放范围
      this.scale = Math.max(0.5, Math.min(3, this.scale));
      
      // 计算缩放中心点
      this.offsetX = mouseX - ((mouseX - this.offsetX) * this.scale / oldScale);
      this.offsetY = mouseY - ((mouseY - this.offsetY) * this.scale / oldScale);
      
      this.draw();
    });
    
    // 添加拖拽功能
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastX = e.clientX - this.offsetX;
      this.lastY = e.clientY - this.offsetY;
      this.canvas.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.offsetX = e.clientX - this.lastX;
        this.offsetY = e.clientY - this.lastY;
        this.draw();
      }
    });
    
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'default';
    });
  }
  
  // 重写绘制方法，添加缩放和平移
  draw() {
    const { width, height, seatWidth, seatHeight, seatGap, rows, cols } = this.options;
    
    // 设置Canvas尺寸
    this.canvas.width = width || (cols * (seatWidth + seatGap) + seatGap);
    this.canvas.height = height || (rows * (seatHeight + seatGap) + seatGap);
    
    // 应用变换
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    
    // 清空画布
    this.ctx.clearRect(-this.offsetX/this.scale, -this.offsetY/this.scale, 
                      this.canvas.width/this.scale, this.canvas.height/this.scale);
    
    // 绘制座位
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (seatWidth + seatGap) + seatGap;
        const y = row * (seatHeight + seatGap) + seatGap;
        
        // 根据座位状态设置颜色
        let fillColor, borderColor;
        switch (this.seats[row][col]) {
          case 0: // 可选
            fillColor = this.options.availableColor;
            borderColor = '#333';
            break;
          case 1: // 已售
            fillColor = this.options.bookedColor;
            borderColor = '#666';
            break;
          case 2: // 已选
            fillColor = this.options.selectedColor;
            borderColor = this.options.selectedBorderColor;
            break;
          default:
            fillColor = this.options.availableColor;
            borderColor = '#333';
        }
        
        this.drawSeat(x, y, seatWidth, seatHeight, fillColor, borderColor);
      }
    }
    
    // 绘制屏幕
    this.drawScreen();
    
    this.ctx.restore();
  }
  
  // 绘制屏幕
  drawScreen() {
    const { seatWidth, seatHeight, seatGap, rows, cols } = this.options;
    const screenX = (cols * (seatWidth + seatGap) + seatGap) / 2 - 100;
    const screenY = 20;
    
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(screenX, screenY, 200, 20);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('银幕', screenX + 100, screenY + 15);
  }
  
  // 重写获取座位位置的方法，考虑缩放和平移
  getSeatAtPosition(x, y) {
    // 反向应用变换
    const transformedX = (x - this.offsetX) / this.scale;
    const transformedY = (y - this.offsetY) / this.scale;
    
    const { seatWidth, seatHeight, seatGap, rows, cols } = this.options;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seatX = col * (seatWidth + seatGap) + seatGap;
        const seatY = row * (seatHeight + seatGap) + seatGap;
        
        if (transformedX >= seatX && transformedX <= seatX + seatWidth && 
            transformedY >= seatY && transformedY <= seatY + seatHeight) {
          return { row, col, x: seatX, y: seatY };
        }
      }
    }
    
    return null;
  }
  
  // 添加性能优化：只重绘变化的座位
  updateSeat(row, col) {
    const { seatWidth, seatHeight, seatGap } = this.options;
    const x = col * (seatWidth + seatGap) + seatGap;
    const y = row * (seatHeight + seatGap) + seatGap;
    
    // 应用变换
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    
    // 根据座位状态设置颜色
    let fillColor, borderColor;
    switch (this.seats[row][col]) {
      case 0: // 可选
        fillColor = this.options.availableColor;
        borderColor = '#333';
        break;
      case 1: // 已售
        fillColor = this.options.bookedColor;
        borderColor = '#666';
        break;
      case 2: // 已选
        fillColor = this.options.selectedColor;
        borderColor = this.options.selectedBorderColor;
        break;
      default:
        fillColor = this.options.availableColor;
        borderColor = '#333';
    }
    
    this.drawSeat(x, y, seatWidth, seatHeight, fillColor, borderColor);
    
    this.ctx.restore();
  }
  
  // 批量更新座位状态
  updateSeats(seatList) {
    seatList.forEach(({ row, col }) => {
      this.updateSeat(row, col);
    });
  }
}

// 座位选择统计和验证
class SeatSelectionValidator {
  constructor(seatSelector) {
    this.seatSelector = seatSelector;
  }
  
  // 验证选座是否符合规则（例如连续座位）
  validateContinuousSeats(maxGap = 1) {
    const selectedSeats = this.seatSelector.getSelectedSeats();
    if (selectedSeats.length <= 1) return true;
    
    // 按行和列排序
    const sortedSeats = selectedSeats.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });
    
    // 检查是否在同一行且连续
    const firstRow = sortedSeats[0].row;
    for (let i = 1; i < sortedSeats.length; i++) {
      if (sortedSeats[i].row !== firstRow) {
        // 如果不在同一行，检查是否符合连续规则
        if (sortedSeats[i].row - sortedSeats[i-1].row > maxGap) {
          return false;
        }
      } else {
        // 在同一行，检查列是否连续
        if (sortedSeats[i].col - sortedSeats[i-1].col > maxGap + 1) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // 计算选座价格
  calculatePrice(selectedSeats, pricePerSeat = 50) {
    // 根据座位位置调整价格（例如前排便宜，后排贵）
    return selectedSeats.reduce((total, seat) => {
      const rowFactor = 1 + (seat.row / this.seatSelector.options.rows) * 0.5; // 后排更贵
      return total + (pricePerSeat * rowFactor);
    }, 0);
  }
  
  // 获取选座统计信息
  getSelectionStats() {
    const selectedSeats = this.seatSelector.getSelectedSeats();
    const bookedSeats = [];
    
    // 统计座位状态
    for (let row = 0; row < this.seatSelector.options.rows; row++) {
      for (let col = 0; col < this.seatSelector.options.cols; col++) {
        if (this.seatSelector.seats[row][col] === 1) {
          bookedSeats.push({ row, col });
        }
      }
    }
    
    return {
      totalSeats: this.seatSelector.options.rows * this.seatSelector.options.cols,
      availableSeats: this.seatSelector.options.rows * this.seatSelector.options.cols - 
                      bookedSeats.length - selectedSeats.length,
      bookedSeats: bookedSeats.length,
      selectedSeats: selectedSeats.length,
      occupancyRate: ((bookedSeats.length + selectedSeats.length) / 
                     (this.seatSelector.options.rows * this.seatSelector.options.cols) * 100).toFixed(2) + '%'
    };
  }
}
```

### 3. React组件封装

```jsx
import React, { useEffect, useRef, useState } from 'react';

const CanvasSeatSelector = ({ 
  rows = 10, 
  cols = 15, 
  maxSelection = 6,
  onSeatChange,
  initialBookedSeats = []
}) => {
  const canvasRef = useRef(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatSelector, setSeatSelector] = useState(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      // 初始化座位选择器
      const selector = new AdvancedCinemaSeatSelector(canvasRef.current, {
        rows,
        cols,
        maxSelection
      });
      
      // 设置初始已售座位
      selector.setSeatsStatus(initialBookedSeats, 1);
      
      // 监听座位变化
      selector.onSeatChange((seats) => {
        setSelectedSeats(seats);
        onSeatChange && onSeatChange(seats);
      });
      
      setSeatSelector(selector);
      
      // 组件卸载时清理
      return () => {
        selector.canvas.removeEventListener('click');
      };
    }
  }, [rows, cols, maxSelection, initialBookedSeats]);
  
  const resetSelection = () => {
    if (seatSelector) {
      seatSelector.resetSelection();
    }
  };
  
  const confirmSelection = () => {
    if (selectedSeats.length > 0) {
      alert(`已选择 ${selectedSeats.length} 个座位: ${selectedSeats.map(s => `第${s.row+1}行${s.col+1}列`).join(', ')}`);
    } else {
      alert('请先选择座位');
    }
  };
  
  return (
    <div className="seat-selector-container">
      <h3>选择座位</h3>
      <div className="seat-controls">
        <button onClick={resetSelection}>重置选择</button>
        <button onClick={confirmSelection} disabled={selectedSeats.length === 0}>
          确认选择 ({selectedSeats.length})
        </button>
      </div>
      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          style={{ border: '1px solid #ccc', cursor: 'pointer' }}
        />
      </div>
      <div className="seat-info">
        <p>已选择座位: {selectedSeats.length}/{maxSelection}</p>
        <div className="seat-legend">
          <div><span style={{ backgroundColor: '#4ECDC4', display: 'inline-block', width: '15px', height: '15px', marginRight: '5px' }}></span> 可选</div>
          <div><span style={{ backgroundColor: '#FF6B6B', display: 'inline-block', width: '15px', height: '15px', marginRight: '5px' }}></span> 已选</div>
          <div><span style={{ backgroundColor: '#AAAAAA', display: 'inline-block', width: '15px', height: '15px', marginRight: '5px' }}></span> 已售</div>
        </div>
      </div>
    </div>
  );
};

// 使用示例
const App = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const handleSeatChange = (seats) => {
    setSelectedSeats(seats);
  };
  
  return (
    <div>
      <h1>电影院选座系统</h1>
      <CanvasSeatSelector
        rows={8}
        cols={12}
        maxSelection={4}
        onSeatChange={handleSeatChange}
        initialBookedSeats={[
          { row: 2, col: 3 }, { row: 2, col: 4 },
          { row: 4, col: 6 }, { row: 5, col: 8 }
        ]}
      />
    </div>
  );
};
```

## 实际应用场景

1. **电影院在线选票**：用户在线选择座位，系统实时更新座位状态，防止重复选择。

2. **演出场馆座位选择**：音乐会、话剧等演出的座位选择系统，支持不同区域、不同价格的座位。

3. **体育场馆座位管理**：足球场、篮球馆等体育赛事的座位选择和管理。

4. **交通工具座位预订**：高铁、飞机等交通工具的座位选择系统。

5. **会议室预订系统**：企业内部会议室座位或工位的预订管理。

## 总结

Canvas实现电影院选票功能是一个综合性的前端项目，涉及图形绘制、事件处理、状态管理、性能优化等多个技术点。通过合理的设计和实现，可以创建出用户体验良好的选座系统。关键是要处理好性能优化问题，特别是当座位数量较多时，需要考虑如何减少重绘次数，提升渲染效率。
