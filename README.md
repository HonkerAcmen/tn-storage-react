# 伏羲文化存储系统 - 文件存储管理系统

一个基于 Next.js 和 React 的现代化文件存储管理系统，提供直观的用户界面和丰富的文件管理功能。

## ✨ 功能特性

### 📁 文件管理
- **我的云** - 仪表板视图，展示存储概览和最近文件
- **所有文件** - 完整的文件浏览器，支持文件夹导航和面包屑导航
- **最近的文件** - 快速访问最近访问、上传或修改的文件
- **收藏** - 管理收藏的文件和文件夹
- **已删除文件** - 回收站功能，支持恢复和永久删除

### 🔧 文件操作
- ✅ 文件上传（支持多文件上传）
- ✅ 文件下载
- ✅ 文件分享
- ✅ 文件重命名
- ✅ 文件删除（移至回收站）
- ✅ 文件收藏/取消收藏
- ✅ 文件夹创建和导航
- ✅ 文件详情查看
- ✅ 文件搜索

### 🎨 用户体验
- 响应式设计，适配各种屏幕尺寸
- 直观的图标和视觉反馈
- 流畅的导航体验
- 实时搜索功能
- 面包屑导航支持深层文件夹结构

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) - React 全栈框架
- **UI 库**: [Ant Design 5](https://ant.design/) - 企业级 UI 组件库
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **语言**: [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- **图标**: [React Icons](https://react-icons.github.io/react-icons/) - 丰富的图标库
- **图表**: [ECharts](https://echarts.apache.org/) - 数据可视化
- **状态管理**: React Context API + Custom Hooks

## 📦 项目结构

```
tn-storage-react/
├── src/
│   ├── components/          # 通用组件
│   │   ├── files/          # 文件相关组件
│   │   ├── FileListItem.tsx
│   │   └── ...
│   ├── contexts/            # React Context
│   │   └── FileDataContext.tsx
│   ├── features/            # 功能模块
│   │   └── files/
│   │       ├── hooks/      # 自定义 Hooks
│   │       └── services/   # 业务逻辑服务
│   ├── pages/              # Next.js 页面
│   │   ├── _components/   # 页面组件
│   │   └── index.tsx
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   │   ├── fileSystem/    # 文件系统工具
│   │   ├── format/        # 格式化工具
│   │   └── constants/     # 常量定义
│   └── styles/            # 全局样式
├── public/                 # 静态资源
└── package.json
```

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm / yarn / pnpm / bun

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```

### 代码检查

```bash
npm run lint
```

## 📖 使用说明

### 基本操作

1. **上传文件**: 点击左侧边栏的"上传"按钮，选择要上传的文件
2. **浏览文件**: 在"所有文件"视图中，点击文件夹进入子目录
3. **文件操作**: 点击文件右侧的菜单按钮，可以执行下载、分享、重命名、删除等操作
4. **收藏文件**: 在文件菜单中点击"添加到收藏"
5. **搜索文件**: 使用顶部搜索栏快速查找文件
6. **恢复文件**: 在"已删除文件"视图中，可以恢复或永久删除文件

### 文件夹导航

- 在"所有文件"视图中，支持完整的文件夹导航
- 使用面包屑导航快速返回上级目录
- 在其他视图中点击文件夹会自动跳转到"所有文件"视图查看文件夹内容

## 🏗️ 架构设计

### 模块化设计

项目采用功能模块化的架构：

- **Features**: 按功能划分的模块，包含相关的 hooks 和 services
- **Components**: 可复用的 UI 组件
- **Utils**: 纯函数工具库，不依赖业务逻辑
- **Contexts**: 全局状态管理

### 自定义 Hooks

- `useFileActions` - 统一管理文件操作逻辑
- `useFileMenu` - 生成文件操作菜单
- `useFavorites` - 收藏功能管理
- `useDeletedFiles` - 回收站功能管理

### 服务层

- `fileOperations` - 文件操作服务（下载、分享、重命名等）
- `fileService` - 文件系统 API 服务

## 🔄 数据流

1. **文件系统数据**: 通过 `FileDataContext` 全局管理
2. **本地存储**: 使用 localStorage 持久化收藏和删除记录
3. **状态更新**: 通过 Context API 和自定义 Hooks 实现响应式更新

## 🎯 开发计划

### 已实现功能 ✅
- [x] 文件列表展示
- [x] 文件夹导航
- [x] 文件上传
- [x] 文件操作（下载、分享、重命名、删除）
- [x] 收藏功能
- [x] 回收站功能
- [x] 搜索功能
- [x] 文件详情查看

### 待实现功能 🚧
- [ ] 真实的文件上传 API 集成
- [ ] 文件预览功能
- [ ] 批量操作
- [ ] 拖拽上传
- [ ] 文件分享链接生成
- [ ] 用户权限管理
- [ ] 文件版本控制

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 进行代码格式化
- 组件和函数使用清晰的命名
- 添加必要的注释和文档

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 优秀的 React 框架
- [Ant Design](https://ant.design/) - 企业级 UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

如有问题或建议，欢迎提交 Issue！
