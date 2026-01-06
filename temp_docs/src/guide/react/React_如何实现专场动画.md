# React-如何实现专场动画？（了解）

**题目**: React-如何实现专场动画？（了解）

**答案**:

在React中实现专场动画（通常是指页面或组件之间的过渡动画）有多种方法，以下是几种常见的实现方式：

## 1. 使用 React Transition Group

React Transition Group 是一个专门用于处理组件挂载/卸载时过渡动画的库。

```bash
npm install react-transition-group
```

```jsx
import { CSSTransition } from 'react-transition-group';
import './PageTransition.css';

function PageTransition({ children, location, timeout = 300 }) {
  return (
    <CSSTransition
      key={location.key}
      timeout={timeout}
      classNames="page-transition"
      unmountOnExit
    >
      {children}
    </CSSTransition>
  );
}

// CSS文件 (PageTransition.css)
.page-transition-enter {
  opacity: 0;
  transform: translateX(100%);
}

.page-transition-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 300ms ease-in-out;
}

.page-transition-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-transition-exit-active {
  opacity: 0;
  transform: translateX(-100%);
  transition: all 300ms ease-in-out;
}
```

## 2. 使用 Framer Motion

Framer Motion 是一个功能强大的动画库，支持复杂的动画效果。

```bash
npm install framer-motion
```

```jsx
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <AnimatePresence mode="wait">
      {currentPage === 'home' && (
        <motion.div
          key="home"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          <HomePage />
        </motion.div>
      )}
      {currentPage === 'about' && (
        <motion.div
          key="about"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <AboutPage />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 3. 使用 React Router 与动画结合

```jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Home />
          </motion.div>
        } />
        <Route path="/about" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <About />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}
```

## 4. 使用 CSS 动画和状态管理

```jsx
import React, { useState, useEffect } from 'react';

function PageTransition({ children, direction = 'right' }) {
  const [animationState, setAnimationState] = useState('enter');
  const [currentChildren, setCurrentChildren] = useState(children);

  useEffect(() => {
    setCurrentChildren(children);
    setAnimationState('enter');
  }, [children]);

  const handleAnimationEnd = () => {
    if (animationState === 'exit') {
      setAnimationState('enter');
    }
  };

  const getAnimationClass = () => {
    switch (animationState) {
      case 'enter':
        return `slide-in-${direction}`;
      case 'exit':
        return `slide-out-${direction === 'right' ? 'left' : 'right'}`;
      default:
        return '';
    }
  };

  return (
    <div
      className={`page-container ${getAnimationClass()}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {currentChildren}
    </div>
  );
}

// CSS
/*
.page-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide-in-right {
  animation: slideInRight 0.3s ease-in-out forwards;
}

.slide-out-left {
  animation: slideOutLeft 0.3s ease-in-out forwards;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slideOutLeft {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
*/
```

## 5. 自定义 Hook 实现页面切换动画

```jsx
import { useState, useEffect } from 'react';

function usePageTransition() {
  const [transitionState, setTransitionState] = useState({
    page: null,
    direction: 'forward',
    animation: 'idle'
  });

  const navigateTo = (newPage, direction = 'forward') => {
    setTransitionState(prev => ({
      ...prev,
      animation: 'exiting',
      direction
    }));

    setTimeout(() => {
      setTransitionState({
        page: newPage,
        direction,
        animation: 'entering'
      });
    }, 150); // 匹配动画时长
  };

  return [transitionState, navigateTo];
}

// 使用示例
function App() {
  const [transitionState, navigateTo] = usePageTransition();
  
  return (
    <div className={`page-wrapper transition-${transitionState.animation}`}>
      {transitionState.page}
    </div>
  );
}
```

## 6. 使用 React Spring

```bash
npm install react-spring
```

```jsx
import { useTransition, animated } from 'react-spring';

function PageSwitcher({ currentPage }) {
  const transitions = useTransition(currentPage, {
    from: { opacity: 0, transform: 'translateX(100%)' },
    enter: { opacity: 1, transform: 'translateX(0%)' },
    leave: { opacity: 0, transform: 'translateX(-100%)' },
    config: { tension: 250, friction: 20 }
  });

  return transitions((style, page) =>
    <animated.div style={style}>
      {page === 'home' && <HomePage />}
      {page === 'about' && <AboutPage />}
    </animated.div>
  );
}
```

## 关键要点

1. **性能优化**：使用 `transform` 和 `opacity` 属性进行动画，避免触发布局重排
2. **动画流畅性**：合理设置动画时长（通常 200-500ms）
3. **用户体验**：动画应该增强而非干扰用户体验
4. **可访问性**：提供关闭动画的选项，考虑用户偏好（`prefers-reduced-motion`）

这些方法可以根据项目需求和复杂度选择使用，从简单的 CSS 动画到复杂的第三方库都有相应的解决方案。
