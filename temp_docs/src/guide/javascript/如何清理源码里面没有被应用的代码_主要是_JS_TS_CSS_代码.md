# 如何清理源码里面没有被应用的代码，主要是 JS、TS、CSS 代码？（了解）

**题目**: 如何清理源码里面没有被应用的代码，主要是 JS、TS、CSS 代码？（了解）

## 标准答案

清理源码中未使用的代码（Dead Code Elimination）是前端工程化的重要环节，主要通过以下方式实现：

1. **Tree Shaking**: Webpack、Rollup 等构建工具提供的功能，自动移除未使用的 ES6 模块
2. **静态代码分析工具**: 如 ESLint（no-unused-vars 规则）、ts-unused-exports 等
3. **CSS 优化工具**: PurgeCSS、UnCSS 等工具移除未使用的 CSS 规则
4. **手动清理**: 结合代码审查和重构实践

## 深入分析

### 1. Tree Shaking（摇树优化）
Tree Shaking 是一种基于 ES6 模块语法的优化技术，它能够移除 JavaScript 上下文中未引用的代码。这种技术依赖于 ES6 的静态结构特性（import/export 语句必须在顶层作用域），构建工具在编译时分析模块依赖关系，标记并移除未使用的导出。

### 2. 静态代码分析
静态分析工具通过解析代码语法结构来识别未使用的变量、函数、类等。这类工具不执行代码，而是分析代码的语法树，因此可以发现语法层面的死代码。

### 3. CSS 优化
CSS 优化工具通过分析 HTML 和 CSS 文件，识别出在页面中未被使用的 CSS 规则并将其移除。这在使用大型 CSS 框架时特别有效。

### 4. 工具集成
在现代前端项目中，这些工具通常集成到构建流程中，形成完整的死代码清理方案。

## 代码实现

```javascript
// 1. Webpack Tree Shaking 配置示例
// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'production', // 生产模式自动启用 tree-shaking
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  optimization: {
    usedExports: true, // 标记未使用的导出
    sideEffects: false, // 假设所有模块都没有副作用
    // 或者指定具体的副作用文件
    // sideEffects: ['./src/some-side-effectful-file.js', '*.css']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false // 保持 ES6 模块语法，不转换为 CommonJS
              }]
            ]
          }
        }
      }
    ]
  }
};

// 2. 未使用的代码示例（会被 Tree Shaking 移除）
// utils.js
export const usedFunction = () => {
  return 'This function is used';
};

// 这个函数没有被导入使用，会被 Tree Shaking 移除
export const unusedFunction = () => {
  return 'This function is not used';
};

// 3. ESLint 配置检测未使用的变量
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // 检测未使用的变量
    'no-unused-vars': 'error',
    // 检测函数定义但未使用
    'no-unused-funcs': 'error',
    // 检测导入但未使用的模块
    'no-unused-imports': 'error'
  },
};

// 4. TypeScript 检测未使用的导出
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,      // 检测未使用的局部变量
    "noUnusedParameters": true,  // 检测未使用的参数
    "exactOptionalPropertyTypes": true
  }
}

// 5. 自定义检测工具 - 检测未使用的函数和变量
class DeadCodeDetector {
  constructor() {
    this.usedIdentifiers = new Set();
    this.allIdentifiers = new Map();
  }

  // 模拟分析代码中的标识符使用情况
  analyzeCode(code) {
    // 这里是简化的示例，实际工具会使用 AST 解析
    const lines = code.split('\n');
    const identifiers = [];
    
    lines.forEach((line, index) => {
      // 检测函数定义
      const functionMatch = line.match(/function\s+(\w+)/);
      if (functionMatch) {
        identifiers.push({
          name: functionMatch[1],
          type: 'function',
          line: index + 1,
          defined: true
        });
      }
      
      // 检测变量定义
      const varMatch = line.match(/(const|let|var)\s+(\w+)/);
      if (varMatch) {
        identifiers.push({
          name: varMatch[2],
          type: 'variable',
          line: index + 1,
          defined: true
        });
      }
      
      // 检测函数调用
      const callMatch = line.match(/(\w+)\s*\(/);
      if (callMatch) {
        identifiers.push({
          name: callMatch[1],
          type: 'usage',
          line: index + 1,
          defined: false
        });
      }
    });
    
    return identifiers;
  }

  // 检测未使用的代码
  findDeadCode(code) {
    const identifiers = this.analyzeCode(code);
    const definedItems = new Map();
    const usedItems = new Set();
    
    identifiers.forEach(item => {
      if (item.defined) {
        definedItems.set(item.name, item);
      } else {
        usedItems.add(item.name);
      }
    });
    
    const deadCode = [];
    definedItems.forEach((item, name) => {
      if (!usedItems.has(name)) {
        deadCode.push(item);
      }
    });
    
    return deadCode;
  }
}

// 6. PurgeCSS 配置示例 - 用于清理未使用的 CSS
// purgecss.config.js
module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.js',
    './src/**/*.jsx',
    './src/**/*.ts',
    './src/**/*.tsx'
  ],
  css: [
    './src/**/*.css',
    './node_modules/bootstrap/dist/css/bootstrap.min.css'
  ],
  // 可以保留特定的类名
  safelist: [
    'active',
    'show',
    /^btn-/,
    // 保留包含特定关键词的类名
  ],
  // 移除特定的类名
  blocklist: [
    'unused-class'
  ]
};

// 7. 自动化清理脚本示例
const fs = require('fs');
const path = require('path');

class CodeCleaner {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.jsFiles = [];
    this.cssFiles = [];
  }

  // 查找项目中的 JS/TS 文件
  findFiles() {
    const walk = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walk(filePath);
        } else if (file.match(/\.(js|ts|jsx|tsx)$/)) {
          this.jsFiles.push(filePath);
        } else if (file.match(/\.(css|scss|less)$/)) {
          this.cssFiles.push(filePath);
        }
      });
    };
    
    walk(this.projectPath);
  }

  // 分析导入导出关系
  analyzeImports() {
    const imports = new Map();
    const exports = new Map();
    
    this.jsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // 查找导入语句
      const importMatches = content.match(/import\s+.*?\s+from\s+['"].*?['"]/g);
      if (importMatches) {
        importMatches.forEach(imp => {
          // 简化的导入分析
          const importedFile = imp.match(/from\s+['"](.*)['"]/)[1];
          imports.set(file, [...(imports.get(file) || []), importedFile]);
        });
      }
      
      // 查找导出语句
      const exportMatches = content.match(/export\s+(default\s+)?\w+/g);
      if (exportMatches) {
        exports.set(file, exportMatches);
      }
    });
    
    return { imports, exports };
  }

  // 检测未使用的导出
  findUnusedExports() {
    const { imports, exports } = this.analyzeImports();
    const unusedExports = [];
    
    exports.forEach((exportList, file) => {
      // 检查是否有其他文件导入这个文件的导出
      let isUsed = false;
      
      imports.forEach((importList, importerFile) => {
        importList.forEach(importedFile => {
          if (path.resolve(path.dirname(importerFile), importedFile) === path.resolve(file)) {
            isUsed = true;
          }
        });
      });
      
      if (!isUsed) {
        unusedExports.push({
          file,
          exports: exportList
        });
      }
    });
    
    return unusedExports;
  }

  // 生成清理报告
  generateReport() {
    this.findFiles();
    const unusedExports = this.findUnusedExports();
    
    console.log('=== 未使用的导出检测报告 ===');
    unusedExports.forEach(item => {
      console.log(`文件: ${item.file}`);
      item.exports.forEach(exp => {
        console.log(`  - 未使用的导出: ${exp}`);
      });
    });
    
    return unusedExports;
  }
}

// 使用示例
// const cleaner = new CodeCleaner('./src');
// const report = cleaner.generateReport();

// 8. 实际项目中使用的 package.json 脚本
/*
{
  "scripts": {
    "lint": "eslint src/ --ext .js,.ts,.jsx,.tsx",
    "lint:unused": "ts-unused-exports tsconfig.json",
    "css:purge": "purgecss --config purgecss.config.js",
    "analyze": "webpack-bundle-analyzer dist/bundle.js"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "ts-unused-exports": "^0.0.10",
    "@fullhuman/postcss-purgecss": "^5.0.0",
    "webpack-bundle-analyzer": "^4.0.0"
  }
}
*/

// 9. 自定义 ESLint 规则检测未使用的代码
// 自定义规则示例
function createNoUnusedImportsRule() {
  return {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow unused imports',
        category: 'Best Practices',
        recommended: false
      },
      fixable: 'code',
      schema: []
    },
    create: function(context) {
      const imported = [];
      
      return {
        ImportDeclaration(node) {
          node.specifiers.forEach(specifier => {
            imported.push({
              name: specifier.local.name,
              node: specifier
            });
          });
        },
        
        Identifier(node) {
          const index = imported.findIndex(item => item.name === node.name);
          if (index !== -1) {
            // 标记为已使用
            imported[index].used = true;
          }
        },
        
        'Program:exit': function() {
          imported.forEach(item => {
            if (!item.used) {
              context.report({
                node: item.node,
                message: `'${item.name}' is defined but never used`
              });
            }
          });
        }
      };
    }
  };
}

console.log('代码清理工具初始化完成');
```

## 实际应用场景

1. **项目重构**: 在大型项目重构过程中，识别并清理废弃代码
2. **性能优化**: 减少打包体积，提升加载速度
3. **代码维护**: 保持代码库整洁，降低维护成本
4. **团队协作**: 通过自动化工具确保代码质量
5. **CI/CD 集成**: 在持续集成流程中自动检测死代码

通过综合运用这些工具和技术，可以有效清理项目中的死代码，保持代码库的整洁和高效。
