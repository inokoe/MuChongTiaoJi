# 🎯 MuChongTiaoJi - 小木虫调剂信息自动爬虫

[![Auto Crawler Data Update](https://github.com/ImaginingMaker/MuChongTiaoJi/actions/workflows/crawler.yml/badge.svg)](https://github.com/ImaginingMaker/MuChongTiaoJi/actions/workflows/crawler.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

一个基于 TypeScript 的自动化爬虫项目，专门用于爬取小木虫论坛（muchong.com）的研究生调剂招生信息，支持自动数据更新和前端展示。

## ✨ 功能特性

### 🔄 自动化爬虫

- **智能爬取**：自动爬取小木虫论坛调剂信息版块的最新招生信息
- **详情解析**：深度解析帖子详情页面，提取学校、专业、年级、招生状态等结构化信息
- **定时更新**：通过 GitHub Actions 实现每日 4 次自动更新（北京时间 08:00, 14:00, 20:00, 02:00）
- **智能去重**：基于内容哈希自动识别和去重重复信息

### 🛡️ 反反爬机制

- **用户代理池**：使用随机 User-Agent 池，模拟真实浏览器访问
- **智能延时**：随机请求间隔，避免被服务器识别为爬虫
- **错误重试**：网络请求失败时自动重试机制

### 📊 数据管理

- **结构化存储**：爬取的数据以 JSON 格式存储，便于后续处理
- **增量更新**：只更新有变化的数据，提高处理效率
- **版本控制**：利用 Git 自动提交和推送更新的数据

### 🖥️ 前端展示

- **现代 UI**：基于 React + Ant Design 构建的现代化用户界面
- **响应式设计**：支持桌面和移动设备访问
- **数据可视化**：清晰展示招生信息的各项细节

## 🛠️ 技术栈

### 后端爬虫

- **Node.js** - JavaScript 运行时环境
- **TypeScript** - 类型安全的 JavaScript 超集
- **Axios** - HTTP 客户端库
- **Cheerio** - 服务端 jQuery 实现，用于 HTML 解析
- **@imaginerlabs/user-agent-generator** - 用户代理生成器

### 前端界面

- **React 19** - 用户界面构建库
- **Ant Design** - 企业级 UI 组件库
- **Vite** - 现代化前端构建工具
- **TypeScript** - 类型安全保障

### 开发工具

- **Prettier** - 代码格式化工具
- **GitHub Actions** - 持续集成/持续部署

## 📦 安装使用

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/ImaginingMaker/MuChongTiaoJi.git
cd MuChongTiaoJi

# 安装依赖
npm install
```

### 运行项目

#### 爬虫模式

```bash
# 开发模式运行爬虫
npm run dev
```

#### 前端界面

```bash
# 开发模式运行前端
npm run dev:web

# 构建前端
npm run build:web
```

## 📁 项目结构

```
MuChongTiaoJi/
├── src/                    # 源代码目录
│   ├── crawler/           # 爬虫相关代码
│   │   ├── config.ts      # 爬虫配置文件
│   │   ├── index.ts       # 爬虫主入口
│   │   └── utils.ts       # 爬虫工具函数
│   ├── types/             # TypeScript 类型定义
│   └── web/               # 前端相关代码
├── web/                   # 前端资源文件
│   └── assets/
│       └── source.json    # 爬取的数据文件
├── .github/               # GitHub Actions 配置
│   └── workflows/
│       └── crawler.yml    # 自动爬虫工作流
├── dist/                  # 构建输出目录
├── package.json           # 项目配置文件
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明文档
```

## 🔧 配置说明

### 爬虫配置

在 `src/crawler/config.ts` 中可以配置：

- `INDEX_URL`: 目标页面 URL
- `UA_POOL_SIZE`: 用户代理池大小

### GitHub Actions 配置

在 `.github/workflows/crawler.yml` 中配置自动运行时间：

- 默认每天 4 次运行（UTC 时间 0:00, 6:00, 12:00, 18:00）
- 支持手动触发运行

## 📈 数据格式

爬取的数据以以下格式存储：

```json
{
  "tag": "博士招生",
  "title": "招生标题",
  "url": "帖子链接",
  "id": "唯一标识符",
  "timestamp": 1749216941300,
  "detail": {
    "forumMix": {
      "school": "学校名称",
      "major": "专业信息",
      "grade": "年级",
      "quota": "招生名额",
      "status": "招生状态",
      "contact": "联系方式"
    },
    "content": "详细内容"
  },
  "ok": true
}
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源。详细信息请查看 [LICENSE](LICENSE) 文件。

## ⚠️ 免责声明

本项目仅用于学习和研究目的。使用本项目时请遵守相关网站的 robots.txt 协议和服务条款。请勿用于商业用途或对目标网站造成负担。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/ImaginingMaker/MuChongTiaoJi/issues)
- 发起 [Discussion](https://github.com/ImaginingMaker/MuChongTiaoJi/discussions)

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
