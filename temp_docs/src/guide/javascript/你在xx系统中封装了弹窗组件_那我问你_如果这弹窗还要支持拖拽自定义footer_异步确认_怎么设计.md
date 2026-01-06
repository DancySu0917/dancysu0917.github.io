# 你在xx系统中封装了弹窗组件，那我问你：如果这弹窗还要支持拖拽自定义footer、异步确认，怎么设计？（了解）

**题目**: 你在xx系统中封装了弹窗组件，那我问你：如果这弹窗还要支持拖拽自定义footer、异步确认，怎么设计？（了解）

**答案**:

设计一个支持拖拽、自定义footer和异步确认的弹窗组件，需要考虑以下几个方面：

## 1. 拖拽功能实现

```jsx
import React, { useState, useRef, useEffect } from 'react';

const DraggablePopup = ({ 
  visible, 
  onClose, 
  title, 
  children, 
  footer,
  onDragStart,
  onDragEnd
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);
  const headerRef = useRef(null);

  // 处理拖拽开始
  const handleMouseDown = (e) => {
    if (!headerRef.current || !headerRef.current.contains(e.target)) {
      return;
    }
    
    const rect = popupRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setOffset({ x: offsetX, y: offsetY });
    setDragging(true);
    
    if (onDragStart) onDragStart();
  };

  // 处理鼠标移动
  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    
    // 边界检测
    const maxX = window.innerWidth - popupRef.current.offsetWidth;
    const maxY = window.innerHeight - popupRef.current.offsetHeight;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  // 处理鼠标释放
  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      if (onDragEnd) onDragEnd();
    }
  };

  // 添加全局事件监听
  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, offset]);

  // 重置位置当弹窗显示时
  useEffect(() => {
    if (visible) {
      // 居中显示
      setPosition({
        x: (window.innerWidth - 400) / 2,
        y: (window.innerHeight - 300) / 2
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div 
        ref={popupRef}
        className="popup-content"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          cursor: dragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        <div 
          ref={headerRef}
          className="popup-header"
          style={{ cursor: 'move' }}
        >
          {title}
        </div>
        <div className="popup-body">
          {children}
        </div>
        {footer && (
          <div className="popup-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
```

## 2. 自定义Footer设计

```jsx
// 自定义Footer组件
const CustomFooter = ({ 
  onCancel, 
  onOk, 
  okText = '确定', 
  cancelText = '取消', 
  okLoading = false,
  okDisabled = false,
  cancelDisabled = false,
  customButtons = []
}) => {
  return (
    <div className="custom-footer">
      {/* 自定义按钮区域 */}
      {customButtons.map((btn, index) => (
        <button
          key={index}
          className={`btn ${btn.className || ''}`}
          onClick={btn.onClick}
          disabled={btn.disabled}
        >
          {btn.text}
        </button>
      ))}
      
      {/* 默认取消按钮 */}
      <button
        className="btn btn-cancel"
        onClick={onCancel}
        disabled={cancelDisabled}
      >
        {cancelText}
      </button>
      
      {/* 默认确认按钮 */}
      <button
        className="btn btn-ok"
        onClick={onOk}
        disabled={okDisabled || okLoading}
        loading={okLoading}
      >
        {okLoading ? '加载中...' : okText}
      </button>
    </div>
  );
};

// 使用示例
const MyPopup = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);
    try {
      // 异步操作
      await someAsyncOperation();
      setVisible(false);
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const customFooter = (
    <CustomFooter
      onCancel={() => setVisible(false)}
      onOk={handleOk}
      okLoading={loading}
      customButtons={[
        {
          text: '保存并继续',
          onClick: handleSaveAndContinue,
          className: 'btn-secondary'
        }
      ]}
    />
  );

  return (
    <DraggablePopup
      visible={visible}
      title="自定义弹窗"
      footer={customFooter}
      onClose={() => setVisible(false)}
    >
      <div>弹窗内容</div>
    </DraggablePopup>
  );
};
```

## 3. 异步确认处理

```jsx
// 异步确认处理器
class AsyncConfirmHandler {
  constructor() {
    this.pendingOperations = new Map();
  }

  // 执行异步确认
  async executeAsyncConfirm(operationKey, asyncFunction, options = {}) {
    const { 
      onBeforeConfirm, 
      onConfirmSuccess, 
      onConfirmError,
      showLoading = true 
    } = options;

    if (this.pendingOperations.has(operationKey)) {
      return; // 避免重复提交
    }

    try {
      if (onBeforeConfirm) onBeforeConfirm();

      this.pendingOperations.set(operationKey, true);

      const result = await asyncFunction();
      
      if (onConfirmSuccess) onConfirmSuccess(result);
      
      return result;
    } catch (error) {
      if (onConfirmError) onConfirmError(error);
      throw error;
    } finally {
      this.pendingOperations.delete(operationKey);
    }
  }

  // 检查操作是否正在进行
  isOperationPending(operationKey) {
    return this.pendingOperations.has(operationKey);
  }
}

// 弹窗组件中使用异步确认处理器
const PopupWithAsyncConfirm = ({ 
  visible, 
  onClose, 
  onAsyncConfirm,
  title,
  children
}) => {
  const [loading, setLoading] = useState(false);
  const asyncHandler = useRef(new AsyncConfirmHandler());

  const handleConfirm = async () => {
    if (asyncHandler.current.isOperationPending('confirm')) {
      return; // 避免重复提交
    }

    try {
      setLoading(true);
      await asyncHandler.current.executeAsyncConfirm(
        'confirm',
        onAsyncConfirm,
        {
          onBeforeConfirm: () => setLoading(true),
          onConfirmSuccess: (result) => {
            console.log('确认成功', result);
            onClose(); // 确认成功后关闭弹窗
          },
          onConfirmError: (error) => {
            console.error('确认失败', error);
            // 可以显示错误提示
          }
        }
      );
    } catch (error) {
      // 错误已在onConfirmError中处理
    } finally {
      setLoading(false);
    }
  };

  const customFooter = (
    <div className="popup-footer">
      <button onClick={onClose}>取消</button>
      <button 
        onClick={handleConfirm} 
        disabled={loading}
        className={loading ? 'loading' : ''}
      >
        {loading ? '确认中...' : '确认'}
      </button>
    </div>
  );

  return (
    <DraggablePopup
      visible={visible}
      title={title}
      footer={customFooter}
      onClose={onClose}
    >
      {children}
    </DraggablePopup>
  );
};
```

## 4. 完整的高级弹窗组件

```jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Popup.css'; // 样式文件

const AdvancedPopup = ({
  visible,
  onClose,
  title,
  children,
  footer,
  width = 400,
  height,
  draggable = true,
  closable = true,
  mask = true,
  maskClosable = true,
  asyncConfirm = false,
  onAsyncConfirm,
  confirmLoading = false,
  onDragStart,
  onDragEnd
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const popupRef = useRef(null);
  const headerRef = useRef(null);
  const asyncHandlerRef = useRef(new AsyncConfirmHandler());

  // 处理拖拽逻辑
  const handleMouseDown = useCallback((e) => {
    if (!draggable || !headerRef.current || !headerRef.current.contains(e.target)) {
      return;
    }
    
    const rect = popupRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setOffset({ x: offsetX, y: offsetY });
    setDragging(true);
    
    if (onDragStart) onDragStart();
  }, [draggable, onDragStart]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    
    // 边界检测
    const maxX = window.innerWidth - (popupRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (popupRef.current?.offsetHeight || 0);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [dragging, offset]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(false);
      if (onDragEnd) onDragEnd();
    }
  }, [dragging, onDragEnd]);

  // 异步确认处理
  const handleAsyncConfirm = async () => {
    if (!onAsyncConfirm || asyncHandlerRef.current.isOperationPending('confirm')) {
      return;
    }

    try {
      setLoading(true);
      await asyncHandlerRef.current.executeAsyncConfirm(
        'confirm',
        onAsyncConfirm,
        {
          onBeforeConfirm: () => setLoading(true),
          onConfirmSuccess: (result) => {
            console.log('确认成功', result);
            onClose && onClose();
          },
          onConfirmError: (error) => {
            console.error('确认失败', error);
            // 这里可以添加错误提示
          }
        }
      );
    } catch (error) {
      // 错误已在内部处理
    } finally {
      setLoading(false);
    }
  };

  // 事件监听
  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // 防止文本选中
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  // 初始化位置
  useEffect(() => {
    if (visible) {
      setPosition({
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - (height || 300)) / 2
      });
    }
  }, [visible, width, height]);

  if (!visible) return null;

  return (
    <div 
      className={`popup-overlay ${mask ? 'mask' : ''}`}
      onClick={(e) => {
        if (maskClosable && e.target === e.currentTarget) {
          onClose && onClose();
        }
      }}
    >
      <div 
        ref={popupRef}
        className={`popup-content ${dragging ? 'dragging' : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          width: `${width}px`,
          height: height ? `${height}px` : 'auto',
          cursor: dragging ? 'grabbing' : (draggable ? 'move' : 'default')
        }}
        onMouseDown={draggable ? handleMouseDown : undefined}
      >
        <div 
          ref={headerRef}
          className="popup-header"
          style={{ cursor: draggable ? 'move' : 'default' }}
        >
          {title && <h3>{title}</h3>}
          {closable && (
            <button className="popup-close" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        <div className="popup-body">
          {children}
        </div>
        {footer && (
          <div className="popup-footer">
            {typeof footer === 'function' 
              ? footer({ 
                  onAsyncConfirm: handleAsyncConfirm,
                  loading: loading || confirmLoading
                })
              : footer
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPopup;
```

## 5. 使用示例

```jsx
// 使用示例
const App = () => {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({});

  const handleAsyncConfirm = async () => {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('表单数据提交:', formData);
    // 实际的提交逻辑
  };

  const customFooter = ({ onAsyncConfirm, loading }) => (
    <div className="custom-footer">
      <button onClick={() => setVisible(false)}>取消</button>
      <button 
        onClick={onAsyncConfirm} 
        disabled={loading}
      >
        {loading ? '提交中...' : '提交'}
      </button>
    </div>
  );

  return (
    <div>
      <button onClick={() => setVisible(true)}>打开弹窗</button>
      
      <AdvancedPopup
        visible={visible}
        title="高级弹窗示例"
        onClose={() => setVisible(false)}
        draggable={true}
        footer={customFooter}
        onAsyncConfirm={handleAsyncConfirm}
        width={500}
      >
        <form>
          <input 
            type="text" 
            placeholder="输入数据" 
            value={formData.input || ''}
            onChange={(e) => setFormData({...formData, input: e.target.value})}
          />
        </form>
      </AdvancedPopup>
    </div>
  );
};
```

## 设计要点总结

1. **拖拽功能**：通过鼠标事件监听实现，注意边界检测和性能优化
2. **自定义Footer**：支持灵活的按钮配置，可传入自定义渲染函数
3. **异步确认**：防重复提交、加载状态管理、错误处理
4. **组件可配置性**：提供丰富的props来满足不同使用场景
5. **用户体验**：加载状态反馈、操作确认、错误处理

这种设计模式可以很好地满足复杂业务场景下的弹窗需求。
