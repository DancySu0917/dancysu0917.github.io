# vue-cli 都做了哪些事儿，有哪些功能？（了解）

**题目**: vue-cli 都做了哪些事儿，有哪些功能？（了解）

**答案**:

Vue CLI（Vue Command Line Interface）是 Vue.js 官方提供的命令行工具，它为 Vue.js 项目的快速开发提供了完整的脚手架和开发环境。Vue CLI 主要做了以下几件事：

### 1. 项目脚手架生成
Vue CLI 提供了快速创建新项目的功能，通过 `vue create` 命令可以快速生成一个包含基础配置的 Vue.js 项目结构。

```bash
# 创建新项目
vue create my-project

# 使用预设配置创建项目
vue create -p my-preset my-project
```

### 2. 自动化配置
Vue CLI 自动配置了开发所需的各种工具和库，包括：
- Webpack 配置（包括开发服务器、热重载、生产构建等）
- Babel 配置（支持 ES6+ 语法转换）
- CSS 预处理器支持（Sass, Less, Stylus 等）
- TypeScript 支持
- 单元测试配置（Jest, Mocha 等）
- E2E 测试配置（Cypress, Nightwatch 等）

### 3. 插件系统
Vue CLI 提供了强大的插件系统，允许开发者扩展 CLI 的功能：
- 插件可以修改 webpack 配置
- 插件可以注入命令
- 插件可以生成代码模板
- 常用插件包括：@vue/cli-plugin-babel、@vue/cli-plugin-eslint、@vue/cli-plugin-router、@vue/cli-plugin-vuex 等

### 4. 开发服务器
Vue CLI 提供了一个基于 webpack-dev-server 的开发服务器，具有以下功能：
- 热模块替换（HMR）
- 代理 API 请求
- 自动打开浏览器
- 错误和警告提示

### 5. 生产构建
Vue CLI 提供了优化的生产构建功能：
- 代码压缩和混淆
- Tree-shaking（移除未使用的代码）
- 代码分割
- 静态资源优化
- 源映射生成

### 6. UI 界面
Vue CLI 提供了图形化用户界面，通过 `vue ui` 命令启动，可以：
- 可视化创建和管理项目
- 管理插件
- 配置项目
- 查看任务和依赖

### 7. 预设和插件管理
Vue CLI 支持预设配置，允许开发者保存和重用项目配置：
- 可以创建自定义预设
- 支持插件的安装和管理
- 支持项目配置的版本控制

### 8. 项目配置管理
Vue CLI 提供了多种方式来管理项目配置：
- vue.config.js 文件
- package.json 中的 vue 字段
- 命令行参数

### 9. 代码生成
Vue CLI 提供了代码生成器，可以通过图形界面或命令行快速生成组件、视图等代码模板。

### 10. 现代化开发体验
Vue CLI 整合了现代化前端开发所需的各种工具和最佳实践，提供了：
- 模块热替换
- 代码分割
- 预加载和预获取
- PostCSS 自动前缀
- ESLint 代码规范检查
- Prettier 代码格式化

Vue CLI 的主要功能包括：

1. **项目创建**：快速生成项目结构
2. **依赖管理**：自动安装项目依赖
3. **开发工具**：提供开发服务器、构建工具等
4. **插件生态**：丰富的插件生态系统
5. **配置管理**：灵活的配置选项
6. **测试支持**：单元测试和 E2E 测试集成
7. **部署支持**：优化的生产构建

总的来说，Vue CLI 极大地简化了 Vue.js 项目的搭建和配置过程，让开发者可以专注于业务逻辑的开发，而不是构建工具的配置。
