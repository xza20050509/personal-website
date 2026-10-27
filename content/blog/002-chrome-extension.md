# Chrome 电商图片提取插件开发

## 需求背景

做电商分析作业时，需要批量下载某商品页面的所有图片。手动右键保存太慢，于是萌生了写一个 Chrome 插件的想法——一键提取当前页面的商品图片并批量下载。

## 技术方案

### 为什么选 Chrome 插件

- 直接运行在浏览器中，可以访问页面 DOM
- Chrome Extension API 提供了下载、标签页管理等能力
- 纯前端实现，不需要后端

### 核心 API

| API | 用途 |
|---|---|
| `chrome.scripting.executeScript` | 向页面注入脚本，提取图片 |
| `chrome.downloads.download` | 触发文件下载 |
| `chrome.storage.local` | 存储配置 |
| `chrome.action` | 工具栏图标与 popup |

## 开发流程

### 1. 创建 manifest.json

这是插件的配置文件，Chrome 以此识别插件：

```json
{
  "manifest_version": 3,
  "name": "电商图片提取器",
  "version": "1.0",
  "description": "一键提取电商页面商品图片",
  "permissions": ["activeTab", "scripting", "downloads"],
  "action": {
    "default_popup": "popup.html"
  }
}
```

> Manifest V3 是当前最新版本，V2 已逐步废弃。

### 2. 设计 popup 界面

`popup.html` 是点击插件图标后弹出的小窗口：

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <h3>图片提取器</h3>
  <div id="count">已找到 0 张图片</div>
  <button id="extract">提取图片</button>
  <button id="download" disabled>批量下载</button>
  <script src="popup.js"></script>
</body>
</html>
```

### 3. 注入脚本提取图片

点击"提取图片"后，向当前标签页注入脚本：

```javascript
// popup.js
document.getElementById('extract').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractImages
  });

  const images = results[0].result;
  document.getElementById('count').textContent = `已找到 ${images.length} 张图片`;
  window.images = images;
  document.getElementById('download').disabled = false;
});

// 在页面上下文中执行的函数
function extractImages() {
  const imgs = document.querySelectorAll('img');
  return Array.from(imgs)
    .map(img => img.src)
    .filter(src => src && !src.includes('data:image'));
}
```

### 4. 批量下载

```javascript
document.getElementById('download').addEventListener('click', () => {
  window.images.forEach((url, index) => {
    chrome.downloads.download({
      url: url,
      filename: `product-image-${index + 1}.jpg`,
      saveAs: false
    });
  });
});
```

### 5. 过滤电商图片

通用提取会拿到 logo、广告等无关图片。针对电商页面做优化：

```javascript
function extractImages() {
  const imgs = document.querySelectorAll('img');
  return Array.from(imgs)
    .map(img => img.src)
    .filter(src => {
      // 排除小图标（尺寸过滤）
      // 排除 data URI
      // 优先保留商品图常见路径关键词
      return src && !src.includes('data:image') &&
             (src.includes('img') || src.includes('image') || src.includes('product'));
    });
}
```

## 踩坑记录

### 坑 1：CSP 限制

部分网站设置了严格的 Content-Security-Policy，注入脚本可能失败。

**解决**：用 `chrome.scripting.executeScript` 注入的函数不受页面 CSP 限制（这是 MV3 的优势）。

### 坑 2：图片懒加载

电商页面大量使用懒加载，`img.src` 可能是占位图。

**解决**：同时读取 `data-src`、`data-original` 等懒加载属性：

```javascript
function getRealSrc(img) {
  return img.src || img.dataset.src || img.dataset.original || '';
}
```

### 坑 3：下载文件名冲突

不同商品的图片可能重名，导致覆盖。

**解决**：用时间戳或序号前缀命名。

### 坑 4：跨域图片

某些 CDN 图片有防盗链，直接下载会失败。

**解决**：在下载请求中添加 `Referer` 头（需要在 manifest 中声明 `webRequest` 权限）。

## 测试方法

1. 打开 `chrome://extensions`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"，选择插件目录
4. 访问电商商品页，点击插件图标测试

## 总结

这个插件让我第一次完整经历了"需求 → 方案 → 实现 → 调试"的开发流程。Chrome 插件开发并不难，关键是理解 Manifest 配置和 API 的异步调用方式。

后续可以优化的方向：
- 支持自定义图片尺寸过滤
- 支持选择下载格式（原图 / 缩略图）
- 添加图片预览网格
- 支持打包为 zip 下载
