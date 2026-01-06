# 如何实现预览 PDF 文件？（了解）

**题目**: 如何实现预览 PDF 文件？（了解）

**答案**:

在 Web 应用中实现 PDF 预览有多种方案，以下是几种主要的实现方式：

## 1. 使用 HTML5 `<embed>` 标签

最简单的 PDF 预览方式，直接使用 HTML5 的 `<embed>` 标签：

```html
<!-- 使用 embed 标签 -->
<embed src="path/to/document.pdf" type="application/pdf" width="100%" height="600px">

<!-- 或使用 object 标签 -->
<object data="path/to/document.pdf" type="application/pdf" width="100%" height="600px">
  <p>您的浏览器不支持 PDF 预览，请<a href="path/to/document.pdf">点击下载</a>文件。</p>
</object>

<!-- 或使用 iframe 标签 -->
<iframe src="path/to/document.pdf" width="100%" height="600px"></iframe>
```

## 2. 使用 PDF.js 库（推荐）

PDF.js 是 Mozilla 开发的 JavaScript 库，可以在浏览器中显示 PDF 文件，无需服务器支持。

### 安装 PDF.js

```bash
npm install pdfjs-dist
```

### 基础实现

```html
<!DOCTYPE html>
<html>
<head>
  <title>PDF 预览</title>
  <style>
    #pdf-container {
      width: 100%;
      height: 600px;
      overflow: auto;
    }
    
    .pdf-page {
      margin: 10px auto;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="pdf-controls">
    <button id="prev-page">上一页</button>
    <button id="next-page">下一页</button>
    <span>页码: <span id="page-num"></span> / <span id="page-count"></span></span>
  </div>
  <div id="pdf-container"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
  <script>
    // 设置 PDF.js 的 worker 路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    const scale = 1.5;

    /**
     * 渲染 PDF 页面
     */
    function renderPage(num) {
      pageRendering = true;
      
      // 获取页面
      pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        
        // 准备 canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // 将 canvas 添加到容器
        const container = document.getElementById('pdf-container');
        container.innerHTML = '';
        container.appendChild(canvas);
        
        // 渲染页面
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        renderTask.promise.then(function() {
          pageRendering = false;
          if (pageNumPending !== null) {
            // 新页面渲染完成后，渲染等待的页面
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });
      });
      
      // 更新页码显示
      document.getElementById('page-num').textContent = num;
    }

    /**
     * 检查页面是否渲染完成
     */
    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }

    /**
     * 显示上一页
     */
    function onPrevPage() {
      if (pageNum <= 1) {
        return;
      }
      pageNum--;
      queueRenderPage(pageNum);
    }

    /**
     * 显示下一页
     */
    function onNextPage() {
      if (pageNum >= pdfDoc.numPages) {
        return;
      }
      pageNum++;
      queueRenderPage(pageNum);
    }

    // 绑定事件
    document.getElementById('prev-page').addEventListener('click', onPrevPage);
    document.getElementById('next-page').addEventListener('click', onNextPage);

    // 加载 PDF 文件
    const url = 'path/to/document.pdf';
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      document.getElementById('page-count').textContent = pdfDoc.numPages;
      renderPage(pageNum);
    }).catch(function(error) {
      console.error('PDF 加载失败:', error);
    });
  </script>
</body>
</html>
```

### 使用 PDF.js 的高级实现

```javascript
import * as pdfjsLib from 'pdfjs-dist';

// PDF 预览类
class PDFViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      url: options.url,
      workerSrc: options.workerSrc || 'node_modules/pdfjs-dist/build/pdf.worker.js',
      scale: options.scale || 1.5,
      rotation: options.rotation || 0,
      ...options
    };
    
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageRendering = false;
    this.pageNumPending = null;
    
    // 设置 worker 路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = this.options.workerSrc;
    
    this.init();
  }
  
  async init() {
    try {
      // 加载 PDF
      this.pdfDoc = await pdfjsLib.getDocument(this.options.url).promise;
      
      // 渲染第一页
      await this.renderPage(this.pageNum);
      
      // 触发加载完成事件
      this.onLoadComplete && this.onLoadComplete(this.pdfDoc);
    } catch (error) {
      console.error('PDF 加载失败:', error);
      this.onError && this.onError(error);
    }
  }
  
  async renderPage(num) {
    this.pageRendering = true;
    
    try {
      const page = await this.pdfDoc.getPage(num);
      const viewport = page.getViewport({ 
        scale: this.options.scale,
        rotation: this.options.rotation
      });
      
      // 创建 canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // 清空容器并添加 canvas
      this.container.innerHTML = '';
      this.container.appendChild(canvas);
      
      // 渲染页面
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
      this.pageRendering = false;
      
      // 处理等待的页面渲染
      if (this.pageNumPending !== null) {
        await this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }
      
      // 触发页面渲染完成事件
      this.onPageRender && this.onPageRender(num);
    } catch (error) {
      console.error('页面渲染失败:', error);
    }
  }
  
  queueRenderPage(num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }
  
  goToPage(num) {
    if (num < 1 || num > this.pdfDoc.numPages) {
      return;
    }
    this.pageNum = num;
    this.queueRenderPage(num);
  }
  
  nextPage() {
    if (this.pageNum < this.pdfDoc.numPages) {
      this.pageNum++;
      this.queueRenderPage(this.pageNum);
    }
  }
  
  prevPage() {
    if (this.pageNum > 1) {
      this.pageNum--;
      this.queueRenderPage(this.pageNum);
    }
  }
  
  zoomIn() {
    this.options.scale += 0.1;
    this.renderPage(this.pageNum);
  }
  
  zoomOut() {
    this.options.scale = Math.max(0.5, this.options.scale - 0.1);
    this.renderPage(this.pageNum);
  }
  
  rotate() {
    this.options.rotation = (this.options.rotation + 90) % 360;
    this.renderPage(this.pageNum);
  }
}

// 使用示例
const viewer = new PDFViewer(
  document.getElementById('pdf-container'),
  {
    url: 'path/to/document.pdf',
    scale: 1.2
  }
);

// 绑定事件
viewer.onLoadComplete = (pdfDoc) => {
  console.log('PDF 加载完成，共', pdfDoc.numPages, '页');
};

viewer.onPageRender = (pageNum) => {
  console.log('页面', pageNum, '渲染完成');
};

viewer.onError = (error) => {
  console.error('发生错误:', error);
};
```

## 3. 使用 React 实现 PDF 预览

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// 设置 worker 路径
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ file, onDocumentLoadSuccess }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    onDocumentLoadSuccess && onDocumentLoadSuccess({ numPages });
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <button onClick={previousPage} disabled={pageNumber <= 1}>
          上一页
        </button>
        <span>
          页码: {pageNumber} / {numPages}
        </span>
        <button onClick={nextPage} disabled={pageNumber >= numPages}>
          下一页
        </button>
        <button onClick={zoomOut}>缩小</button>
        <button onClick={zoomIn}>放大</button>
      </div>
      <div ref={containerRef} className="pdf-container">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>加载中...</div>}
          error={<div>加载失败</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
```

## 4. 使用原生 fetch + PDF.js 实现

```javascript
class PDFPreviewer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      scale: options.scale || 1.5,
      rotation: options.rotation || 0,
      ...options
    };
    
    // 设置 worker 路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'path/to/pdf.worker.js';
  }
  
  async loadPDF(pdfUrl) {
    try {
      // 获取 PDF 文件的 ArrayBuffer
      const response = await fetch(pdfUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // 加载 PDF
      this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // 渲染第一页
      await this.renderPage(1);
      
      return this.pdfDoc;
    } catch (error) {
      console.error('PDF 加载失败:', error);
      throw error;
    }
  }
  
  async renderPage(pageNum) {
    if (!this.pdfDoc) {
      throw new Error('PDF 文档未加载');
    }
    
    if (pageNum < 1 || pageNum > this.pdfDoc.numPages) {
      throw new Error('无效的页码');
    }
    
    const page = await this.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ 
      scale: this.options.scale,
      rotation: this.options.rotation
    });
    
    // 创建 canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // 清空容器并添加 canvas
    this.container.innerHTML = '';
    this.container.appendChild(canvas);
    
    // 渲染页面
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    const renderTask = page.render(renderContext);
    await renderTask.promise;
    
    return page;
  }
  
  async renderAllPages() {
    if (!this.pdfDoc) {
      throw new Error('PDF 文档未加载');
    }
    
    // 创建容器用于显示所有页面
    this.container.innerHTML = '';
    
    for (let i = 1; i <= this.pdfDoc.numPages; i++) {
      const page = await this.pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: this.options.scale });
      
      // 创建 canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // 添加到容器
      this.container.appendChild(canvas);
      
      // 渲染页面
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      await renderTask.promise;
      
      // 添加分页符
      if (i < this.pdfDoc.numPages) {
        const pageBreak = document.createElement('div');
        pageBreak.style.height = '20px';
        this.container.appendChild(pageBreak);
      }
    }
  }
}

// 使用示例
const previewer = new PDFPreviewer(document.getElementById('pdf-container'));
previewer.loadPDF('path/to/document.pdf')
  .then(pdfDoc => {
    console.log('PDF 加载成功，共', pdfDoc.numPages, '页');
  })
  .catch(error => {
    console.error('PDF 加载失败:', error);
  });
```

## 5. 安全考虑

在实现 PDF 预览时需要注意安全问题：

```javascript
// 验证 PDF URL 的安全性
function validatePDFUrl(url) {
  try {
    const parsedUrl = new URL(url);
    
    // 检查协议
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('不支持的协议');
    }
    
    // 检查域名是否在白名单中
    const allowedDomains = ['example.com', 'trusted-domain.com'];
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      throw new Error('域名不在白名单中');
    }
    
    return true;
  } catch (error) {
    console.error('URL 验证失败:', error);
    return false;
  }
}

// 使用 CORS 代理加载 PDF（防止跨域问题）
function loadPDFWithProxy(pdfUrl) {
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const safeUrl = proxyUrl + encodeURIComponent(pdfUrl);
  
  return fetch(safeUrl)
    .then(response => response.arrayBuffer())
    .then(data => pdfjsLib.getDocument({ data }).promise);
}
```

## 总结

PDF 预览的实现方式有：

1. **HTML5 标签方式**：简单但功能有限，依赖浏览器原生支持
2. **PDF.js**：功能强大，兼容性好，推荐使用
3. **react-pdf**：React 专用，易于集成
4. **自定义实现**：根据需求定制功能

选择哪种方式取决于项目需求、浏览器兼容性要求和功能复杂度。
