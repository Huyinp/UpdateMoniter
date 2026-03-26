# UpdateMoniter

游戏资源更新监控桌面应用，用于监控三个游戏更新平台（云更新、易乐游、顺网科技）的游戏更新信息。

## 功能特性

- 🎮 **多平台监控**: 同时监控云更新、易乐游、顺网科技三个平台
- 📊 **数据聚合**: 按游戏名称聚合，展示各平台的更新时间和大小
- 🔍 **搜索过滤**: 支持按游戏名称搜索
- ⏱️ **自动刷新**: 每 5 分钟自动刷新数据
- 🔄 **手动刷新**: 支持手动点击刷新
- 💻 **桌面应用**: Electron + Vue3 开发，原生桌面体验

## 技术栈

- Electron 28+
- Vue 3.4+ (Composition API)
- TypeScript 5.0+
- Vite 5.0+

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run electron:build
```

构建完成后，可执行文件位于 `release/win-unpacked/` 目录。

## 数据说明

| 平台 | 数据来源 | 字段 |
|------|----------|------|
| 云更新 | HTML 页面 | 更新时间、小更新量、游戏总大小 |
| 易乐游 | HTML 页面 | 更新时间 |
| 顺网科技 | JSON API | 更新时间、小更新量、游戏总大小 |

## 目录结构

```
UpdateMoniter/
├── electron/          # Electron 主进程
├── src/               # Vue 源代码
│   ├── components/   # Vue 组件
│   ├── types/        # TypeScript 类型
│   └── assets/       # 静态资源
├── release/          # 构建输出
└── node_modules/    # 依赖
```

## License

MIT
