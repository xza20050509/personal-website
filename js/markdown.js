/**
 * Markdown 渲染封装
 * 依赖 marked.js 与 highlight.js（CDN 引入）
 */
const MarkdownRenderer = (() => {
  let markedAvailable = false;
  let hljsAvailable = false;

  function checkDeps() {
    markedAvailable = typeof marked !== 'undefined';
    hljsAvailable = typeof hljs !== 'undefined';

    if (markedAvailable && hljsAvailable) {
      marked.setOptions({
        breaks: true,
        gfm: true
      });
    }
  }

  /**
   * 将 Markdown 文本渲染为 HTML 并注入容器
   * @param {string} mdText - Markdown 原文
   * @param {HTMLElement} container - 目标容器
   */
  function render(mdText, container) {
    checkDeps();

    if (!markedAvailable) {
      container.innerHTML = '<p class="error-msg">渲染组件加载失败，请检查网络连接。</p>';
      return;
    }

    try {
      const html = marked.parse(mdText);
      container.innerHTML = html;

      // 代码高亮
      if (hljsAvailable) {
        container.querySelectorAll('pre code').forEach(block => {
          hljs.highlightElement(block);
        });
      }

      // 外链处理：新标签页打开
      container.querySelectorAll('a[href^="http"]').forEach(a => {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      });
    } catch (err) {
      console.error('[MarkdownRenderer] 渲染失败:', err);
      container.innerHTML = '<p class="error-msg">内容渲染失败。</p>';
    }
  }

  /**
   * 从文件加载 Markdown 并渲染
   * @param {string} filePath - Markdown 文件路径
   * @param {HTMLElement} container - 目标容器
   */
  async function renderFromFile(filePath, container) {
    try {
      const mdText = await DataLoader.loadText(filePath);
      render(mdText, container);
    } catch (err) {
      container.innerHTML = '<p class="error-msg">文章加载失败，请稍后重试。</p>';
    }
  }

  return { render, renderFromFile };
})();

window.MarkdownRenderer = MarkdownRenderer;
