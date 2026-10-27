# Chrome 电商图片提取插件

## 项目简介

一个 Chrome 浏览器插件，用于一键提取电商页面的商品图片并支持批量下载。

## 技术栈

- JavaScript
- Chrome Extension API（Manifest V3）
- DOM 解析

## 核心功能

1. **图片提取**：向当前页面注入脚本，提取所有商品图片 URL
2. **智能过滤**：排除 logo、图标等无关图片，保留商品主图与详情图
3. **懒加载兼容**：处理 `data-src`、`data-original` 等懒加载属性
4. **批量下载**：通过 `chrome.downloads` API 批量下载图片

## 关键实现

### Manifest 配置

```json
{
  "manifest_version": 3,
  "permissions": ["activeTab", "scripting", "downloads"],
  "action": { "default_popup": "popup.html" }
}
```

### 图片提取函数

```javascript
function extractImages() {
  return Array.from(document.querySelectorAll('img'))
    .map(img => img.dataset.src || img.dataset.original || img.src)
    .filter(src => src && !src.includes('data:image'));
}
```

## 踩坑与解决

| 问题 | 解决方案 |
|---|---|
| 页面 CSP 阻止注入 | 使用 `chrome.scripting.executeScript` 不受页面 CSP 限制 |
| 懒加载图片拿不到 | 同时读取 `data-src` 等属性 |
| 下载文件名冲突 | 用序号前缀命名 |

## 相关文章

详见博客《[Chrome 电商图片提取插件开发](post.html?id=002-chrome-extension)》。
