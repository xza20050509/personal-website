# 个人展示网站 技术设计文档（TECH_DESIGN）

| 项 | 内容 |
|---|---|
| 产品名称 | 肖子安的个人展示网站 |
| 文档版本 | v1.0 |
| 最后更新 | 2026-10-27 |
| 关联文档 | PRD.md |

---

## 1. 技术栈选择

### 1.1 选型原则

本项目作为课程作业，核心约束为：**零构建、纯静态、可直接部署到 GitHub Pages**。因此技术选型遵循以下原则：

- 不引入任何构建工具（无 Vite / Webpack / npm）；
- 不依赖 Node.js 运行时；
- 第三方库通过 CDN 引入，避免本地安装；
- 代码结构简单清晰，便于老师评审与后续维护。

### 1.2 技术栈总览

| 类别 | 选型 | 说明 |
|---|---|---|
| 前端结构 | HTML5（多页面） | 每个功能模块一个 HTML 文件，不使用 SPA |
| 样式 | 原生 CSS + CSS 变量 | 零依赖，便于主题管理与响应式 |
| 交互逻辑 | 原生 JavaScript（ES6+） | 不使用框架，直接操作 DOM |
| Markdown 渲染 | marked.js（CDN） | 轻量 Markdown 解析器，用于博客正文 |
| 代码高亮 | highlight.js（CDN） | 配合 marked.js 实现代码块语法高亮 |
| 图标 | 内联 SVG 或 Unicode | 不依赖图标字体库 |
| 部署 | GitHub Pages | 直接推送仓库即可发布 |

### 1.3 为什么不选 SPA / 框架

| 方案 | 不选原因 |
|---|---|
| Vue / React + Vite | 需要构建步骤，与"零构建"约束冲突 |
| Astro / Hugo | 需要 Node.js 运行构建，部署前需生成静态文件 |
| 单页应用（SPA） | 需自行实现路由与内容切换，对纯静态站点增加复杂度；且 SEO 不如多页面友好 |

### 1.4 CDN 依赖清单

| 库 | 版本 | 用途 | 加载方式 |
|---|---|---|---|
| marked | ^9.x | Markdown → HTML 转换 | `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js">` |
| highlight.js | ^11.x | 代码块语法高亮 | `<link>` CSS + `<script>` JS |

> 若部署环境无法访问 CDN（如内网），可将上述库下载到 `assets/vendor/` 目录本地引用。

---

## 2. 项目目录结构

```
personal-website/
├── index.html                  # 首页（Hero + 技能 + 项目 + 博客入口）
├── skills.html                 # 技能详情页（可选，也可合并到首页锚点）
├── projects.html               # 项目列表页
├── project-detail.html         # 项目详情页（通过 URL 参数加载）
├── blog.html                   # 博客列表页
├── post.html                   # 博客详情页（通过 URL 参数加载）
├── 404.html                    # 404 页面
│
├── css/
│   ├── variables.css           # CSS 变量（配色、间距、断点）
│   ├── base.css                # 全局基础样式（reset、排版）
│   ├── layout.css              # 布局与响应式（导航、网格、容器）
│   ├── components.css          # 通用组件（卡片、按钮、标签、代码块）
│   ├── starfield.css           # 星空背景相关样式
│   └── pages/
│       ├── home.css            # 首页专属样式
│       ├── projects.css        # 项目页专属样式
│       └── blog.css            # 博客页专属样式
│
├── js/
│   ├── main.js                 # 全局逻辑（导航、主题、星空背景初始化）
│   ├── starfield.js            # 星空背景 Canvas 实现
│   ├── data-loader.js          # 统一数据加载器（fetch JSON）
│   ├── markdown.js             # Markdown 渲染封装（marked + highlight）
│   ├── router.js               # URL 参数解析与页面路由辅助
│   └── pages/
│       ├── home.js             # 首页数据渲染
│       ├── projects.js         # 项目列表渲染
│       ├── project-detail.js   # 项目详情渲染
│       ├── blog.js             # 博客列表渲染
│       └── post.js             # 博客详情渲染
│
├── data/
│   ├── profile.json            # 个人信息数据
│   ├── skills.json             # 技能数据
│   ├── projects.json           # 项目列表元数据
│   └── blog.json               # 博客文章元数据列表
│
├── content/
│   └── blog/                   # 博客正文 Markdown 文件
│       ├── 001-git-basics.md
│       ├── 002-chrome-extension.md
│       └── 003-lora-finetune.md
│
├── assets/
│   ├── images/                 # 图片资源（头像、项目封面、博客封面）
│   │   ├── avatar.png
│   │   ├── projects/
│   │   └── blog/
│   └── icons/                  # SVG 图标
│
└── README.md                   # 项目说明（部署方法等）
```

### 2.1 目录设计说明

| 目录 | 职责 |
|---|---|
| 根目录 HTML | 每个页面一个 HTML 文件，结构清晰，SEO 友好 |
| `css/` | 样式按职责拆分，`variables.css` 统一管理主题变量 |
| `js/` | 逻辑按模块拆分，`pages/` 存放页面专属脚本 |
| `data/` | 所有结构化数据以 JSON 存储，内容与代码分离 |
| `content/blog/` | 博客正文以 Markdown 文件存储，便于写作 |
| `assets/` | 图片、图标等静态资源 |

---

## 3. 数据模型

所有结构化数据以 **JSON 文件** 存储，运行时通过 `fetch()` 异步加载。博客正文以 **Markdown 文件** 存储。

### 3.1 profile.json（个人信息）

对应 PRD F01 个人介绍。

```json
{
  "name": "肖子安",
  "university": "大连民族大学",
  "major": "物联网工程",
  "grade": "2024级",
  "tagline": "热爱物联网与 AI 的全栈探索者",
  "avatar": "assets/images/avatar.png",
  "social": [
    { "type": "github", "label": "GitHub", "url": "https://github.com/yourname" },
    { "type": "email", "label": "Email", "url": "mailto:your@email.com" },
    { "type": "zhihu", "label": "知乎", "url": "https://zhihu.com/people/xxx" }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| name | string | 是 | 姓名 |
| university | string | 是 | 学校 |
| major | string | 是 | 专业 |
| grade | string | 是 | 年级 |
| tagline | string | 是 | 一句话定位 |
| avatar | string | 否 | 头像相对路径，缺失时显示占位 |
| social | array | 否 | 社交链接列表，`type` 用于匹配图标 |

### 3.2 skills.json（技能数据）

对应 PRD F02 技能展示。

```json
[
  {
    "category": "编程语言",
    "skills": [
      { "name": "C 语言", "level": 4 },
      { "name": "Java", "level": 3 },
      { "name": "Python", "level": 4 }
    ]
  },
  {
    "category": "硬件 / 嵌入式",
    "skills": [
      { "name": "单片机", "level": 3 }
    ]
  },
  {
    "category": "后端框架",
    "skills": [
      { "name": "Spring Boot", "level": 3 }
    ]
  },
  {
    "category": "AI / 大模型",
    "skills": [
      { "name": "AI 大模型应用", "level": 4 },
      { "name": "LoRA 微调训练", "level": 3 }
    ]
  },
  {
    "category": "版本控制",
    "skills": [
      { "name": "Git", "level": 3 }
    ]
  },
  {
    "category": "前端",
    "skills": [
      { "name": "浏览器插件开发", "level": 3 }
    ]
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| category | string | 是 | 技能分类名称 |
| skills | array | 是 | 该分类下的技能列表 |
| skills[].name | string | 是 | 技能名称 |
| skills[].level | number | 是 | 熟练度 1-5，整数 |

**渲染规则**：
- `level` 用 5 格进度条或圆点可视化；
- 同时显示数字（如 "4/5"），颜色不作为唯一信息载体。

### 3.3 projects.json（项目数据）

对应 PRD F03 项目展示。

```json
[
  {
    "id": "git-practice",
    "title": "Git 版本控制练习",
    "summary": "Git 常用命令与协作流程练习",
    "cover": "assets/images/projects/git.png",
    "tags": ["Git"],
    "date": "2024-09",
    "link": "https://github.com/yourname/git-practice",
    "detail": "content/projects/git-practice.md"
  },
  {
    "id": "chrome-ecommerce-extension",
    "title": "Chrome 电商图片提取插件",
    "summary": "浏览器插件，提取电商页面商品图片",
    "cover": "assets/images/projects/chrome-ext.png",
    "tags": ["JavaScript", "Chrome Extension API"],
    "date": "2024-11",
    "link": "https://github.com/yourname/ecommerce-img-extractor",
    "detail": "content/projects/chrome-extension.md"
  },
  {
    "id": "lora-finetune",
    "title": "大模型 LoRA 微调训练",
    "summary": "基于 LoRA 的大模型微调实践",
    "cover": "assets/images/projects/lora.png",
    "tags": ["Python", "Hugging Face", "LoRA"],
    "date": "2025-03",
    "link": "https://github.com/yourname/lora-finetune",
    "detail": "content/projects/lora-finetune.md"
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 项目唯一标识，用于 URL 参数 |
| title | string | 是 | 项目名称 |
| summary | string | 是 | 一句话简介 |
| cover | string | 否 | 封面图路径，缺失显示占位 |
| tags | array | 是 | 技术栈标签 |
| date | string | 否 | 完成时间 YYYY-MM |
| link | string | 否 | 项目外链，新标签页打开 |
| detail | string | 否 | 项目详情 Markdown 文件路径 |

**排序规则**：默认按 `date` 倒序排列。

### 3.4 blog.json（博客元数据）

对应 PRD F04 博客列表。

```json
[
  {
    "id": "001-git-basics",
    "title": "Git 常用命令与协作流程速查",
    "summary": "整理日常开发中最常用的 Git 命令与团队协作流程",
    "date": "2024-10-15",
    "category": "工具",
    "tags": ["Git", "版本控制"],
    "cover": "assets/images/blog/git.png",
    "content": "content/blog/001-git-basics.md"
  },
  {
    "id": "002-chrome-extension",
    "title": "从零开发 Chrome 电商图片提取插件",
    "summary": "记录 Chrome Extension 的开发流程与踩坑经验",
    "date": "2024-12-01",
    "category": "前端",
    "tags": ["Chrome Extension", "JavaScript"],
    "cover": "assets/images/blog/chrome.png",
    "content": "content/blog/002-chrome-extension.md"
  },
  {
    "id": "003-lora-finetune",
    "title": "大模型 LoRA 微调实践笔记",
    "summary": "基于 Hugging Face 进行 LoRA 微调的完整流程",
    "date": "2025-04-10",
    "category": "AI",
    "tags": ["LoRA", "大模型", "Hugging Face"],
    "cover": "assets/images/blog/lora.png",
    "content": "content/blog/003-lora-finetune.md"
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 文章唯一标识，用于 URL 参数 |
| title | string | 是 | 文章标题 |
| summary | string | 是 | 摘要，列表页展示 |
| date | string | 是 | 发布日期 YYYY-MM-DD |
| category | string | 否 | 分类 |
| tags | array | 否 | 标签列表 |
| cover | string | 否 | 封面图 |
| content | string | 是 | Markdown 正文文件路径 |

**排序规则**：按 `date` 倒序。

### 3.5 博客正文 Markdown 规范

`content/blog/*.md` 文件需遵循以下规范：

1. **不包含 Front Matter**：元数据已在 `blog.json` 中定义，Markdown 文件只含正文；
2. **支持的 Markdown 语法**：标题（`#`-`######`）、段落、列表、代码块、图片、链接、表格、引用、粗体、斜体；
3. **代码块**：使用三反引号包裹，并指定语言以启用语法高亮：
   ````markdown
   ```python
   print("Hello, LoRA!")
   ```
   ````
4. **图片**：使用相对路径或外链，建议存放在 `assets/images/blog/` 下。

### 3.6 数据加载策略

由于纯静态站点通过 `fetch()` 加载 JSON/Markdown，需注意：

- **本地预览**：直接双击打开 HTML 时，浏览器会因 `file://` 协议阻止 `fetch()`。需通过本地静态服务器预览（见部署章节）；
- **加载失败容错**：每个数据加载器需实现错误处理，加载失败时显示友好提示，不阻塞页面其他部分；
- **缓存**：浏览器会自动缓存 JSON/MD 文件，更新内容后需清除缓存或加版本号。

---

## 4. 关键技术点

### 4.1 星空背景实现

对应 PRD F09。

**技术选型**：**Canvas 2D** 实现，原因：
- 可精确控制星点数量、大小、闪烁频率；
- GPU 加速友好，性能优于大量 DOM 元素；
- 可根据设备性能动态调整星点密度。

**实现要点**（`js/starfield.js`）：

```javascript
// 伪代码框架
class Starfield {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.animationId = null;
  }

  init() {
    // 1. 设置 canvas 尺寸为窗口大小（devicePixelRatio 适配高清屏）
    // 2. 根据屏幕面积生成星点（数量 = 面积 / 系数，移动端减少）
    // 3. 每个星点属性：x, y, radius, baseOpacity, twinkleSpeed, phase
    // 4. 检测 prefers-reduced-motion，决定是否启用动画
  }

  draw() {
    // 1. 清空画布
    // 2. 绘制深蓝渐变背景（可选，也可由 CSS 提供）
    // 3. 遍历星点，根据 phase 计算当前透明度，绘制圆形
    // 4. 更新 phase，请求下一帧
  }

  start() { /* requestAnimationFrame 循环 */ }
  stop() { /* cancelAnimationFrame */ }
  resize() { /* 窗口尺寸变化时重新生成星点 */ }
}
```

**性能优化**：

| 优化点 | 措施 |
|---|---|
| 高清屏适配 | `canvas.width = window.innerWidth * devicePixelRatio`，`ctx.scale(dpr, dpr)` |
| 星点密度 | 移动端（< 768px）星点数量减半 |
| 动画帧率 | 使用 `requestAnimationFrame`，浏览器自动调度 |
| 减少重绘 | 只绘制星点，背景渐变交给 CSS |
| 页面不可见时暂停 | 监听 `visibilitychange`，页面隐藏时 `stop()` |
| 减少动态效果 | `prefers-reduced-motion: reduce` 时只绘制静态星点，不闪烁 |

**CSS 配合**（`css/starfield.css`）：

```css
/* 背景容器固定定位，铺满视口，置于内容之下 */
.starfield-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

/* 页面背景色兜底（Canvas 加载前） */
body {
  background-color: var(--bg-deep);
}
```

### 4.2 响应式布局

对应 PRD F08。

**实现方式**：CSS 媒体查询 + 流式布局。

**断点定义**（`css/variables.css`）：

```css
:root {
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
}
```

**布局策略**：

| 区域 | 桌面端（≥1024px） | 平板（768-1024px） | 手机（<768px） |
|---|---|---|---|
| 导航栏 | 横向完整菜单 | 横向菜单 | 汉堡菜单 |
| Hero 区 | 左右两栏 | 左右两栏或上下 | 上下堆叠 |
| 技能卡片 | 3 列网格 | 2 列 | 1 列 |
| 项目卡片 | 3 列网格 | 2 列 | 1 列 |
| 博客列表 | 2-3 列 | 2 列 | 1 列 |
| 正文宽度 | max-width: 800px 居中 | 同左 | 100% - 内边距 |

**核心 CSS 技术**：
- `display: grid` + `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` 实现自适应列数；
- `flex-wrap: wrap` 处理标签、导航项换行；
- `clamp()` 函数实现流体排版：`font-size: clamp(1rem, 2vw, 1.5rem)`；
- 图片 `max-width: 100%; height: auto`。

**汉堡菜单实现**（`js/main.js`）：

```javascript
// 伪代码
const menuBtn = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
menuBtn.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});
// 点击菜单项后自动收起
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMenu.classList.remove('active'));
});
```

### 4.3 Markdown 渲染

对应 PRD F05 博客详情页、F03 项目详情。

**实现流程**（`js/markdown.js`）：

```javascript
// 伪代码
import 'marked';      // CDN 引入后全局可用 marked
import 'highlight.js'; // CDN 引入后全局可用 hljs

// 配置 marked 使用 highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,        // 换行符转换为 <br>
  gfm: true            // 支持 GitHub Flavored Markdown
});

async function renderMarkdown(filePath, container) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error('加载失败');
    const mdText = await response.text();
    container.innerHTML = marked.parse(mdText);
    // 重新触发代码高亮（marked 9.x 需手动调用）
    container.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  } catch (err) {
    container.innerHTML = '<p class="error">文章加载失败，请稍后重试。</p>';
  }
}
```

**XSS 防护**：

marked.js 默认会转义 HTML 标签，但若启用 `marked.setOptions({ mangle: false, headerIds: false })` 等需注意。本项目不允许 Markdown 中嵌入原始 HTML（marked 默认行为会转义），因此 XSS 风险较低。如需更严格，可引入 DOMPurify（CDN）对渲染结果二次过滤。

**代码块复制按钮**（P1 功能，可后续添加）：

在每个 `<pre>` 后注入一个复制按钮，点击后调用 `navigator.clipboard.writeText()`。

### 4.4 数据加载与容错

**统一加载器**（`js/data-loader.js`）：

```javascript
// 伪代码
async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function loadText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

// 带缓存的加载器（简单内存缓存）
const cache = new Map();
async function loadJSONCached(path) {
  if (cache.has(path)) return cache.get(path);
  const data = await loadJSON(path);
  cache.set(path, data);
  return data;
}
```

**容错策略**：

| 场景 | 处理 |
|---|---|
| JSON 文件不存在 | 控制台报错，页面显示"数据加载失败"占位 |
| Markdown 文件不存在 | 详情页显示"文章不存在" + 返回链接 |
| 图片加载失败 | `onerror` 回退为占位图 |
| CDN 库加载失败 | 检测 `typeof marked === 'undefined'`，提示"渲染组件加载失败" |

### 4.5 URL 参数解析

项目详情与博客详情通过 URL 参数传递 ID：

```
project-detail.html?id=git-practice
post.html?id=001-git-basics
```

**解析实现**（`js/router.js`）：

```javascript
// 伪代码
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// 找不到 ID 时的处理
const id = getQueryParam('id');
if (!id) {
  // 重定向到列表页或显示提示
  window.location.href = 'projects.html';
}
```

---

## 5. 页面结构与路由方案

### 5.1 页面清单

| 页面 | 文件 | 对应 PRD 功能 | 说明 |
|---|---|---|---|
| 首页 | `index.html` | F01, F02, F03(列表), F04(列表), F06, F07, F09 | 单页锚点导航，包含 Hero、技能、项目预览、博客预览 |
| 项目列表 | `projects.html` | F03 | 完整项目卡片列表 |
| 项目详情 | `project-detail.html` | F03 | 通过 `?id=` 加载单个项目 |
| 博客列表 | `blog.html` | F04 | 完整文章列表 |
| 博客详情 | `post.html` | F05 | 通过 `?id=` 加载单篇文章 |
| 404 | `404.html` | F05 异常 | 资源不存在时的错误页 |

### 5.2 首页结构（index.html）

首页采用**锚点单页**结构，通过导航栏平滑滚动到各区块：

```html
<body>
  <canvas class="starfield-canvas"></canvas>      <!-- 星空背景 -->

  <header class="site-header">                      <!-- 固定导航栏 -->
    <nav>
      <a href="#hero">首页</a>
      <a href="#skills">技能</a>
      <a href="#projects">项目</a>
      <a href="#blog">博客</a>
      <a href="#contact">联系</a>
    </nav>
  </header>

  <main>
    <section id="hero">...</section>                <!-- F01 个人介绍 -->
    <section id="skills">...</section>              <!-- F02 技能展示 -->
    <section id="projects">...</section>            <!-- F03 项目预览（3个卡片 + "查看全部"） -->
    <section id="blog">...</section>                <!-- F04 博客预览（最新3篇 + "查看全部"） -->
    <section id="contact">...</section>             <!-- F07 联系方式 -->
  </main>

  <footer>...</footer>

  <script src="js/starfield.js"></script>
  <script src="js/main.js"></script>
  <script src="js/pages/home.js"></script>
</body>
```

### 5.3 项目页结构

**项目列表页（projects.html）**：

- 展示 `projects.json` 中所有项目的卡片网格；
- 每个卡片点击后跳转 `project-detail.html?id={id}`；
- 卡片包含封面、标题、摘要、标签、日期。

**项目详情页（project-detail.html）**：

- 页面加载时从 URL 读取 `id`；
- 从 `projects.json` 中查找匹配项目；
- 若 `detail` 字段存在，fetch 对应 Markdown 并渲染；
- 顶部显示项目标题、标签、日期、外链；
- 底部显示"返回项目列表"按钮。

### 5.4 博客页结构

**博客列表页（blog.html）**：

- 展示 `blog.json` 中所有文章；
- 按日期倒序；
- 每条显示标题、摘要、日期、分类、标签；
- 点击跳转 `post.html?id={id}`。

**博客详情页（post.html）**：

- 读取 `id` → 查找 `blog.json` → 获取 `content` 路径；
- fetch Markdown → marked 渲染 → 注入正文容器；
- 顶部：标题、日期、分类、标签；
- 底部：上一篇 / 下一篇导航（按日期相邻），返回列表按钮。

### 5.5 导航方案

**混合导航模式**：

| 场景 | 导航方式 |
|---|---|
| 首页内部跳转 | 锚点 `#skills` + `scroll-behavior: smooth` |
| 首页 → 项目列表 / 博客列表 | 页面跳转 `projects.html` / `blog.html` |
| 列表 → 详情 | 页面跳转 + URL 参数 `post.html?id=xxx` |
| 详情 → 列表 | "返回"按钮 / 浏览器后退 |
| 各页面 → 首页 | 导航栏"首页"链接 → `index.html` |

**导航高亮**：

- 首页：通过 `IntersectionObserver` 监听各 section，当前可见 section 对应的导航项高亮；
- 独立页面（项目/博客）：根据当前页面 URL 设置对应导航项高亮。

### 5.6 资源引用路径

为兼容 GitHub Pages 子路径部署（如 `https://username.github.io/personal-website/`），所有资源引用使用**相对路径**：

```html
<!-- 正确：相对路径 -->
<link rel="stylesheet" href="css/variables.css">
<script src="js/main.js"></script>
<img src="assets/images/avatar.png">

<!-- 错误：绝对路径（子路径部署会 404） -->
<link rel="stylesheet" href="/css/variables.css">
```

JSON 数据与 Markdown 文件的路径也使用相对路径，相对于 HTML 文件所在目录。

---

## 6. CSS 变量与主题

### 6.1 颜色变量（`css/variables.css`）

```css
:root {
  /* 背景色 */
  --bg-deep: #0a0e27;          /* 深空蓝，页面底色 */
  --bg-card: rgba(255, 255, 255, 0.05);  /* 卡片半透明背景 */
  --bg-card-hover: rgba(255, 255, 255, 0.08);

  /* 文字色 */
  --text-primary: #e8eaf6;     /* 主文字，接近白色 */
  --text-secondary: #a0a4c0;   /* 次要文字 */
  --text-muted: #6b7094;       /* 弱化文字 */

  /* 强调色 */
  --accent-primary: #4fc3f7;   /* 青蓝，主强调 */
  --accent-secondary: #b39ddb; /* 紫色，次强调 */

  /* 边框与分割线 */
  --border: rgba(255, 255, 255, 0.1);

  /* 状态色 */
  --success: #81c784;
  --error: #e57373;
}
```

### 6.2 间距与圆角变量

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;
  --space-2xl: 96px;

  --container-max: 1200px;
}
```

### 6.3 深色主题实现

本项目默认深色主题，主题切换（F10）为 P1 功能。若后续实现亮色模式，通过切换 `<html>` 上的 `data-theme="light"` 属性覆盖变量：

```css
[data-theme="light"] {
  --bg-deep: #f5f5f7;
  --bg-card: rgba(0, 0, 0, 0.04);
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --accent-primary: #1976d2;
  --border: rgba(0, 0, 0, 0.1);
}
```

---

## 7. 部署方案

### 7.1 本地预览

由于 `fetch()` 在 `file://` 协议下被浏览器阻止，需启动本地静态服务器：

```powershell
# 方式一：Python 内置服务器
python -m http.server 8000

# 方式二：Node.js（若已安装）
npx serve .
```

然后访问 `http://localhost:8000`。

### 7.2 GitHub Pages 部署

1. 将代码推送到 GitHub 仓库；
2. 仓库 Settings → Pages → Source 选择 `main` 分支 `/` 根目录；
3. 等待部署完成，访问 `https://<username>.github.io/<repo-name>/`；
4. 若使用自定义域名，在仓库根目录添加 `CNAME` 文件，内容为域名。

### 7.3 路径适配注意事项

GitHub Pages 项目站点部署在子路径下（如 `/personal-website/`），因此：
- 所有内部链接与资源引用使用**相对路径**（见 5.6）；
- 不使用以 `/` 开头的绝对路径；
- `<base>` 标签方式不推荐（会影响锚点），坚持相对路径。

---

## 8. 功能与 PRD 映射

| PRD 功能 | 实现模块 | 关键文件 |
|---|---|---|
| F01 个人介绍 | 首页 Hero 区 | `index.html`, `data/profile.json`, `js/pages/home.js` |
| F02 技能展示 | 首页技能区 | `index.html`, `data/skills.json`, `css/components.css` |
| F03 项目展示 | 项目列表 + 详情 | `projects.html`, `project-detail.html`, `data/projects.json` |
| F04 博客列表 | 博客列表页 | `blog.html`, `data/blog.json` |
| F05 博客详情 | 博客详情页 | `post.html`, `js/markdown.js`, `content/blog/*.md` |
| F06 导航与路由 | 全站导航 | `js/main.js`, `js/router.js` |
| F07 联系方式 | 首页 + 页脚 | `index.html`, `data/profile.json` |
| F08 响应式布局 | 全站 | `css/layout.css`, `css/variables.css` |
| F09 星空背景 | 全站背景 | `js/starfield.js`, `css/starfield.css` |
| F10 主题切换（P1） | 预留 | `css/variables.css` 已定义亮色变量 |
| F11 搜索（P1） | 预留 | 数据已结构化，可前端过滤 |
| F12 分类筛选（P1） | 预留 | `blog.json` 含 category/tags 字段 |
