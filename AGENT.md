# UpdateMoniter - 资源更新监控桌面应用

## 1. 项目概述

- **项目名称**: UpdateMoniter
- **项目类型**: Electron + Vue3 + TypeScript 桌面应用
- **核心功能**: 监控三个游戏更新平台（云更新、易乐游、顺网科技）的游戏更新信息，按游戏名称聚合展示，支持自动刷新和搜索
- **目标用户**: 需要监控网吧游戏更新信息的运维人员

## 2. 技术栈

- **框架**: Electron 28+
- **前端**: Vue 3.4+ (Composition API)
- **语言**: TypeScript 5.0+
- **构建工具**: Vite 5.0+
- **打包工具**: electron-builder
- **HTTP 请求**: axios
- **HTML 解析**: cheerio

## 3. 数据源

| 平台 | URL | 备注 |
|------|-----|------|
| 云更新 | https://yungengxin.com/game/update | HTML 页面抓取 |
| 易乐游 | https://www.yileyoo.com/game/list | HTML 页面抓取 |
| 顺网科技 | https://home.icafe8.com/resource/queryResourcePage | JSON API |

## 4. UI/UX 规范

### 4.1 布局结构

- **窗口**: 单窗口应用，标准原生窗口边框
- **尺寸**: 最小 800x600，默认 1000x700
- **布局**:
  - 顶部: 标题栏 + 刷新按钮
  - 搜索栏: 游戏名称搜索
  - 中部: 资源列表表格（主内容区）
  - 底部: 状态栏（最后更新时间、刷新倒计时）

### 4.2 表格结构

```
| 游戏名称 | 云更新 (数量)    | 易乐游 (数量) | 顺网科技 (数量) |
|          | 更新时间|小更新量|总大小 | 更新时间 | 更新时间|小更新量|总大小 |
```

- **云更新列**: 更新时间、小更新量、游戏总大小
- **易乐游列**: 更新时间（无大小数据）
- **顺网科技列**: 更新时间、小更新量、游戏总大小
- **表头显示各平台游戏数量**

### 4.3 视觉设计

- **配色方案**:
  - 主色: `#2563eb` (蓝色)
  - 背景: `#f8fafc` (浅灰白)
  - 卡片背景: `#ffffff`
  - 文字主色: `#1e293b`
  - 文字次色: `#64748b`
  - 边框: `#e2e8f0`
  - 平台标题背景: `#e0e7ff`

- **字体**:
  - 主字体: `"Inter", "Segoe UI", system-ui, sans-serif`
  - 等宽字体: `"JetBrains Mono", "Consolas", monospace` (用于大小数字)
  - 标题: 18px, font-weight: 600
  - 正文: 14px, font-weight: 400
  - 表格: 12px

- **间距系统**: 4px 基础单位

- **视觉效果**:
  - 卡片阴影: `0 1px 3px rgba(0,0,0,0.1)`
  - 按钮 hover: 背景色加深
  - 过渡动画: 150ms ease-out

### 4.4 组件清单

1. **Header 组件**
   - 应用标题
   - 手动刷新按钮（带 loading 状态）

2. **ResourceTable 组件**
   - 搜索栏（按游戏名称过滤）
   - 表格展示（按顺网更新时间倒序）
   - 表头显示平台更新数量
   - 行 hover 高亮

3. **StatusBar 组件**
   - 显示最后刷新时间
   - 显示下次自动刷新倒计时
   - 显示数据源数量

4. **Loading 组件**
   - 全屏 loading 遮罩

## 5. 功能规范

### 5.1 核心功能

#### 5.1.1 数据抓取
- **云更新**: 从 HTML 页面解析表格，获取：游戏名称、更新时间、更新量（列3）、游戏大小（列2）
- **易乐游**: 从 HTML 页面解析表格，获取：游戏名称、更新时间
- **顺网科技**: 从 JSON API 获取：resourceName、updateTime（HH:MM:SS）、updateSize（*1024转MB）、pkgSize（*1024转MB）

#### 5.1.2 数据展示
- 按游戏名称聚合三个平台的数据
- 按顺网更新时间倒序排列
- 支持按游戏名称搜索过滤

#### 5.1.3 自动刷新
- 每 5 分钟自动刷新一次
- 显示倒计时
- 刷新时显示 loading 状态

#### 5.1.4 手动刷新
- 点击刷新按钮立即刷新
- 刷新期间按钮显示 loading 状态
- 刷新完成后重置倒计时

### 5.2 数据字段

```typescript
interface PlatformInfo {
  name: string           // 平台名称
  updateTime: string     // 更新时间
  fileSize: number      // 小更新量（MB）
  totalSize?: number    // 游戏总大小（MB）
  downloadUrl: string   // 下载链接（已废弃）
}

interface ResourceItem {
  name: string
  platforms: {
    云更新?: PlatformInfo
    易乐游?: PlatformInfo
    顺网科技?: PlatformInfo
  }
}
```

## 6. 项目结构

```
UpdateMoniter/
├── .gitignore
├── AGENT.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── electron/
│   ├── main.ts           # Electron 主进程 + 抓取逻辑
│   └── preload.ts        # 预加载脚本
├── src/
│   ├── main.ts           # Vue 入口
│   ├── App.vue           # 根组件
│   ├── scraper.ts        # 备用抓取模块
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts      # TypeScript 类型定义
│   ├── assets/
│   │   └── styles/
│   │       └── main.css
│   └── components/
│       ├── Header.vue
│       ├── ResourceTable.vue
│       ├── StatusBar.vue
│       └── Loading.vue
└── release/              # 打包输出目录
```

## 7. 验收标准

### 7.1 功能验收

- [x] 应用启动后显示主界面
- [x] 成功抓取三个平台数据
- [x] 数据正确展示在表格中（游戏名称 + 三个平台列）
- [x] 每 5 分钟自动刷新数据
- [x] 手动刷新按钮功能正常
- [x] 刷新期间显示 loading 状态
- [x] 状态栏显示最后刷新时间和倒计时
- [x] 表头显示各平台更新数量
- [x] 支持按游戏名称搜索

### 7.2 视觉验收

- [x] 界面布局符合设计规范
- [x] 颜色、字体符合视觉规范
- [x] 响应式适配（最小 800x600）
- [x] 动画过渡流畅

### 7.3 技术验收

- [x] TypeScript 无编译错误
- [ ] Electron 打包后正常运行
- [x] 错误处理完善

## 8. 运行命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run electron:build
```
