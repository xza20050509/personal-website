# AGENTS.md — AI 开发规范

> 本文档面向协助开发本项目的 AI Agent。所有代码与文档变更必须遵循本规范。
> 产品需求与技术设计的唯一真相来源（SSOT）：
> - 需求：[PRD.md](./PRD.md)
> - 技术设计：[TECH_DESIGN.md](./TECH_DESIGN.md)
>
> 本文档只规定"怎么写代码"，不重复需求与设计决策。若本文档与上述 SSOT 冲突，以 SSOT 为准。

---

## 1. 项目概述

### 1.1 项目定位

肖子安的个人展示网站（课程作业）。纯静态站点，部署到 GitHub Pages，展示个人介绍、技能、项目、博客。

### 1.2 技术栈

| 类别 | 选型 | 约束 |
|---|---|---|
| 结构 | HTML5 多页面 | 不使用 SPA 框架 |
| 样式 | 原生 CSS + CSS 变量 | 不使用 Tailwind/SCSS 等预处理器 |
| 逻辑 | 原生 JavaScript（ES6+） | 不使用 Vue/React 等框架 |
| 第三方库 | marked.js、highlight.js | 通过 CDN 引入，不安装到本地 |
| 数据 | JSON + Markdown 文件 | `fetch()` 加载，无后端 |
| 部署 | GitHub Pages | 零构建，推送即发布 |

### 1.3 本地运行

由于 `fetch()` 在 `file://` 协议下被浏览器阻止，必须通过本地静态服务器预览：

```powershell
# 方式一：Python（推荐，Windows 通常自带）
python -m http.server 8000

# 方式二：Node.js
npx serve .
```

访问 `http://localhost:8000`。

---

## 2. 开发规范

### 2.1 目录结构

严格遵循以下结构，新增文件须归入对应目录：

```
personal-website/
├── *.html                  # 页面文件（每个页面一个）
├── css/
│   ├── variables.css       # CSS 变量（颜色、间距、断点）
│   ├── base.css            # 全局 reset 与排版
│   ├── layout.css          # 布局与响应式
│   ├── components.css      # 通用组件样式
│   ├── starfield.css       # 星空背景样式
│   └── pages/*.css         # 页面专属样式
├── js/
│   ├── main.js             # 全局逻辑（导航、主题）
│   ├── starfield.js        # 星空背景 Canvas
│   ├── data-loader.js      # 数据加载器
│   ├── markdown.js         # Markdown 渲染封装
│   ├── router.js           # URL 参数解析
│   └── pages/*.js          # 页面专属逻辑
├── data/
│   ├── profile.json
│   ├── skills.json
│   ├── projects.json
│   └── blog.json
├── content/blog/*.md       # 博客正文
└── assets/                 # 图片、图标
```

**DO**：
- 新增页面时，HTML 放根目录，专属 CSS 放 `css/pages/`，专属 JS 放 `js/pages/`；
- 新增数据类型时，在 `data/` 下新建 JSON 文件；
- 新增博客文章时，Markdown 放 `content/blog/`，元数据写入 `data/blog.json`。

**DON'T**：
- 不要在根目录散落 CSS/JS 文件；
- 不要在 HTML 中内联超过 5 行的 `<style>` 或 `<script>`，应抽到独立文件；
- 不要创建 `node_modules/`、`dist/`、`.vite/` 等构建相关目录。

### 2.2 文件命名

| 类型 | 规则 | 示例 |
|---|---|---|
| HTML 页面 | 小写 + 连字符 | `project-detail.html` |
| CSS 文件 | 小写 + 连字符 | `variables.css`、`home.css` |
| JS 文件 | 小写 + 连字符 | `starfield.js`、`data-loader.js` |
| JSON 数据 | 小写 + 连字符 | `projects.json` |
| Markdown 博客 | 序号-短标题 | `001-git-basics.md` |
| 图片资源 | 小写 + 连字符 | `avatar.png`、`lora-cover.webp` |

**DO**：
- 文件名全部小写，单词间用连字符 `-`；
- 博客 Markdown 用三位数字序号前缀，便于排序。

### 2.3 HTML 规范

**DO**：
- 使用语义化标签：`<header>` `<nav>` `<main>` `<section>` `<article>` `<footer>`；
- 所有 `<img>` 必须有 `alt` 属性；
- 外链添加 `rel="noopener noreferrer"`；
- 资源引用使用**相对路径**（不用 `/` 开头的绝对路径）。

```html
<!-- DO -->
<img src="assets/images/avatar.png" alt="肖子安的头像">
<a href="https://github.com/xxx" target="_blank" rel="noopener noreferrer">GitHub</a>
<link rel="stylesheet" href="css/variables.css">
<script src="js/main.js"></script>
```

```html
<!-- DON'T -->
<img src="/assets/images/avatar.png">          <!-- 绝对路径，子路径部署会 404 -->
<a href="https://github.com/xxx" target="_blank">GitHub</a>  <!-- 缺少 rel -->
<div class="header">...</div>                  <!-- 应用 <header> -->
```

### 2.4 CSS 规范

**DO**：
- 所有颜色、间距、圆角、断点通过 CSS 变量定义在 `css/variables.css`；
- 类名采用 BEM 风格：`block__element--modifier`；
- 媒体查询断点统一使用 `--breakpoint-mobile: 768px`、`--breakpoint-tablet: 1024px`；
- 布局优先用 Flexbox / Grid，少用浮动；
- 动画使用 `transform` / `opacity`，避免触发重排的属性。

```css
/* DO */
:root { --accent: #4fc3f7; --radius-md: 8px; }

.card__title { color: var(--accent); }

@media (max-width: 768px) {
  .card { grid-template-columns: 1fr; }
}

/* DON'T */
.card .title { color: #4fc3f7; }    /* 不用变量、不遵循 BEM */
@media (max-width: 700px) { ... }    /* 断点不统一 */
.card:hover { margin-top: -5px; }    /* margin 动画触发重排 */
```

### 2.5 JavaScript 规范

**DO**：
- 使用 `const` / `let`，不使用 `var`；
- 使用模板字符串拼接 HTML，避免 `+` 拼接；
- DOM 操作前检查元素是否存在：`if (!el) return`；
- 所有 `fetch()` 调用必须有 `try/catch` 错误处理；
- 用 `addEventListener` 绑定事件，不用内联 `onclick`；
- 复杂逻辑添加注释说明。

```javascript
// DO
async function loadProjects() {
  try {
    const res = await fetch('data/projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('加载项目失败:', err);
    return [];
  }
}

const btn = document.querySelector('.btn');
if (btn) {
  btn.addEventListener('click', () => { /* ... */ });
}
```

```javascript
// DON'T
var data = fetch('data/projects.json');   // 无 await、无错误处理、用 var
btn.onclick = function() {};              // 内联事件
el.innerHTML = '<div>' + name + '</div>'; // 字符串拼接、XSS 风险
```

**DON'T**：
- 不要在前端代码中硬编码任何密钥、Token；
- 不要直接使用 `innerHTML` 插入未经过滤的用户内容（博客 Markdown 由 marked.js 渲染，默认转义 HTML）；
- 不要使用 `alert()` / `confirm()` 作为交互反馈。

---

## 3. 数据约定

### 3.1 JSON 数据结构

所有 JSON 文件存放于 `data/` 目录。字段定义以 TECH_DESIGN.md 第 3 节为准，此处仅列关键字段约束。

#### profile.json

```json
{
  "name": "肖子安",
  "university": "大连民族大学",
  "major": "物联网工程",
  "grade": "2024级",
  "tagline": "...",
  "avatar": "assets/images/avatar.png",
  "social": [
    { "type": "github", "label": "GitHub", "url": "https://..." }
  ]
}
```

**约束**：`social[].type` 取值必须与 `assets/icons/` 下的图标文件名对应（用于匹配图标）。

#### skills.json

```json
[
  {
    "category": "编程语言",
    "skills": [
      { "name": "Python", "level": 4 }
    ]
  }
]
```

**约束**：`level` 为 1-5 的整数。

#### projects.json

```json
[
  {
    "id": "git-practice",
    "title": "...",
    "summary": "...",
    "cover": "assets/images/projects/xxx.png",
    "tags": ["Git"],
    "date": "2024-09",
    "link": "https://...",
    "detail": "content/projects/xxx.md"
  }
]
```

**约束**：
- `id` 全局唯一，使用小写字母 + 连字符；
- `date` 格式为 `YYYY-MM`；
- `detail` 指向 Markdown 文件，可为空字符串表示无详情。

#### blog.json

```json
[
  {
    "id": "001-git-basics",
    "title": "...",
    "summary": "...",
    "date": "2024-10-15",
    "category": "工具",
    "tags": ["Git"],
    "cover": "assets/images/blog/xxx.png",
    "content": "content/blog/001-git-basics.md"
  }
]
```

**约束**：
- `id` 与 Markdown 文件名（不含扩展名）一致；
- `date` 格式为 `YYYY-MM-DD`；
- `content` 必须指向存在的 Markdown 文件。

### 3.2 博客 Markdown 格式

`content/blog/*.md` 文件遵循以下规则：

**DO**：
- 文件只包含正文，不写 Front Matter（元数据在 `blog.json`）；
- 使用标准 Markdown 语法：标题、列表、代码块、图片、链接、表格、引用；
- 代码块指定语言以启用语法高亮：

````markdown
```python
print("Hello")
```
````

- 图片使用相对路径，存放于 `assets/images/blog/`。

**DON'T**：
- 不要在 Markdown 中嵌入原始 HTML（marked.js 会转义，但不保证完全安全）；
- 不要使用 HTML 注释 `<!-- -->` 作为元数据；
- 不要在正文中写文章标题（标题由 `blog.json` 的 `title` 字段提供）。

### 3.3 新增数据流程

新增博客文章时，必须同步完成以下两步：

1. 在 `content/blog/` 下创建 Markdown 文件；
2. 在 `data/blog.json` 中添加对应元数据条目（`id` 与文件名一致）。

只做其中一步会导致页面显示异常。

---

## 4. 测试要求

本项目无自动化测试框架，采用**人工检查清单**验证功能。每次功能变更后，对照以下清单逐项检查。

### 4.1 功能检查清单

| # | 检查项 | 预期结果 |
|---|---|---|
| 1 | 访问 `index.html` | 星空背景渲染，首屏显示姓名、学校专业、定位 |
| 2 | 导航栏点击"技能" | 平滑滚动到技能区，显示分类卡片与熟练度 |
| 3 | 导航栏点击"项目" | 跳转到 `projects.html`，显示项目卡片网格 |
| 4 | 点击项目卡片 | 跳转到 `project-detail.html?id=xxx`，显示项目详情 |
| 5 | 导航栏点击"博客" | 跳转到 `blog.html`，显示文章列表 |
| 6 | 点击文章标题 | 跳转到 `post.html?id=xxx`，Markdown 正文正确渲染 |
| 7 | 代码块 | 语法高亮生效，语言着色正确 |
| 8 | 外链点击 | 在新标签页打开，不跳离当前站 |
| 9 | 移动端（<768px） | 汉堡菜单可用，布局单列，无横向滚动条 |
| 10 | 平板（768-1024px） | 项目/技能卡片 2 列，导航正常 |
| 11 | 桌面端（≥1024px） | 项目卡片 3 列，导航完整显示 |
| 12 | 图片加载失败 | 显示占位图，不出现破图图标 |
| 13 | JSON 加载失败 | 显示"数据加载失败"提示，不白屏 |
| 14 | 无效文章 ID | 显示友好提示，提供返回链接 |

### 4.2 性能检查

| # | 检查项 | 预期 |
|---|---|---|
| 1 | 首屏加载时间（4G） | ≤ 2 秒 |
| 2 | 星空背景帧率 | ≥ 30fps，无明显掉帧 |
| 3 | 页面滚动 | 流畅，星空背景不卡顿 |
| 4 | 切换标签页后回来 | 星空动画恢复正常，不死循环 |

### 4.3 可访问性检查

| # | 检查项 | 预期 |
|---|---|---|
| 1 | 键盘 Tab 导航 | 可依次聚焦所有交互元素 |
| 2 | focus 状态 | 焦点元素有可见轮廓 |
| 3 | 图片 alt | 所有内容图片有替代文本 |
| 4 | 系统开启"减少动态效果" | 星空停止闪烁，过渡动画关闭 |

### 4.4 浏览器兼容性

在以下浏览器最近两个大版本中验证：
- Chrome / Edge
- Firefox
- Safari
- iOS Safari
- Android Chrome

---

## 5. 注意事项

### 5.1 GitHub Pages 子路径部署

GitHub Pages 项目站点部署在子路径下（如 `https://username.github.io/personal-website/`）。

**DO**：
- 所有内部链接与资源引用使用**相对路径**（`css/...`、`js/...`、`assets/...`、`data/...`）；
- 页面间跳转使用相对路径（`projects.html`、`post.html?id=xxx`）。

**DON'T**：
- 不要使用 `/css/style.css` 这类以 `/` 开头的绝对路径；
- 不要使用 `<base href="/">`（会破坏相对路径与锚点）。

### 5.2 相对路径基准

JSON 与 Markdown 的加载路径相对于**当前 HTML 文件**所在目录。

```
当前页面：project-detail.html（位于根目录）
加载数据：fetch('data/projects.json')  →  正确
加载正文：fetch('content/projects/git.md')  →  正确
```

如果未来页面放入子目录，需相应调整路径层级（如 `../data/...`）。

### 5.3 XSS 安全

**DO**：
- 用户提供的内容（博客 Markdown）通过 marked.js 渲染，marked 默认转义 HTML；
- 动态插入 DOM 时优先用 `textContent`，仅在内容为受控 HTML 时用 `innerHTML`；
- 外链统一添加 `rel="noopener noreferrer"`。

**DON'T**：
- 不要直接用 `innerHTML` 插入 `blog.json` 中的 `title`、`summary` 等字段（用 `textContent`）；
- 不要在 Markdown 中写 `<script>` 标签。

### 5.4 星空背景性能优化

**DO**：
- 使用 Canvas 2D + `requestAnimationFrame`，不操作大量 DOM；
- 高清屏适配：`canvas.width = innerWidth * devicePixelRatio`，`ctx.scale(dpr, dpr)`；
- 移动端（<768px）星点数量减半；
- 监听 `visibilitychange`，页面隐藏时停止动画；
- 检测 `prefers-reduced-motion: reduce`，只画静态星点不闪烁。

**DON'T**：
- 不要用几百个 `<div>` 模拟星星（DOM 操作开销大）；
- 不要用 `setInterval` 驱动动画（用 `requestAnimationFrame`）；
- 不要在动画循环中修改会触发重排的属性。

### 5.5 本地预览与 fetch 限制

**DO**：
- 本地预览必须用静态服务器（`python -m http.server 8000`），不要直接双击 HTML；
- 验证 `fetch()` 加载 JSON/MD 是否正常，控制台无 CORS 或 404 错误。

**DON'T**：
- 不要用 `file://` 协议打开页面（fetch 会失败）。

### 5.6 缓存与更新

GitHub Pages 对静态资源有缓存。更新内容后：

**DO**：
- 修改 JSON/Markdown 后，若浏览器显示旧内容，硬刷新（Ctrl+F5）；
- 必要时在资源引用后加版本号查询参数：`data/blog.json?v=2`。

### 5.7 变更边界

**DO**：
- 修改数据（JSON/Markdown）不需要改动 HTML/CSS/JS；
- 新增页面需同步更新导航栏链接；
- 修改 CSS 变量会全站生效，确认影响范围。

**DON'T**：
- 不要在没有更新 `blog.json` 的情况下新增 Markdown 文件；
- 不要在没有更新 `projects.json` 的情况下新增项目详情页。

---

## 6. 文档与资源索引

| 文档 | 用途 |
|---|---|
| [PRD.md](./PRD.md) | 产品需求（功能、优先级、非功能需求） |
| [TECH_DESIGN.md](./TECH_DESIGN.md) | 技术设计（技术栈、目录结构、数据模型、关键技术点） |
| [AGENTS.md](./AGENTS.md) | 本文件，AI 开发规范 |

开发前先读 PRD 明确"做什么"，再读 TECH_DESIGN 明确"怎么做"，最后遵循本规范"写代码"。
