/**
 * 数据加载器 - 统一 fetch JSON / Markdown
 * 提供内存缓存与错误处理
 */
const DataLoader = (() => {
  const cache = new Map();

  /**
   * 加载 JSON 文件
   * @param {string} path - 相对路径
   * @returns {Promise<any>} 解析后的数据
   */
  async function loadJSON(path) {
    if (cache.has(path)) return cache.get(path);

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${path}`);
      }
      const data = await response.json();
      cache.set(path, data);
      return data;
    } catch (err) {
      console.error(`[DataLoader] 加载 JSON 失败: ${path}`, err);
      throw err;
    }
  }

  /**
   * 加载文本文件（Markdown 等）
   * @param {string} path - 相对路径
   * @returns {Promise<string>} 文本内容
   */
  async function loadText(path) {
    if (cache.has(path)) return cache.get(path);

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${path}`);
      }
      const text = await response.text();
      cache.set(path, text);
      return text;
    } catch (err) {
      console.error(`[DataLoader] 加载文本失败: ${path}`, err);
      throw err;
    }
  }

  /**
   * 图片加载失败时替换为占位
   * @param {HTMLImageElement} img
   * @param {string} text - 占位文字
   */
  function handleImageError(img, text = '') {
    img.onerror = null;
    // 用渐变背景 + 文字替代
    const parent = img.parentElement;
    if (parent) {
      parent.style.display = 'flex';
      parent.style.alignItems = 'center';
      parent.style.justifyContent = 'center';
      parent.style.background = 'linear-gradient(135deg, #4fc3f7, #b39ddb)';
      parent.style.color = '#0a0e27';
      parent.style.fontWeight = '700';
      parent.style.fontSize = '1.5rem';
      if (text) parent.textContent = text;
      img.remove();
    } else {
      img.style.display = 'none';
    }
  }

  /**
   * 渲染项目卡片 HTML
   * @param {Array} projects - 项目数据数组
   * @returns {string} HTML 字符串
   */
  function renderProjectCards(projects) {
    return projects.map(p => `
      <div class="card project-card" onclick="window.location.href='project-detail.html?id=${p.id}'">
        <div class="project-card__cover" data-cover="${p.title}">
          ${p.cover ? `<img src="${p.cover}" alt="${p.title}" onerror="DataLoader.handleImageError(this, this.parentElement.dataset.cover.charAt(0))">` : p.title.charAt(0)}
        </div>
        <h3 class="project-card__title">${p.title}</h3>
        <p class="project-card__summary">${p.summary}</p>
        <div class="project-card__footer">
          <div class="project-card__tags">
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <span class="project-card__date">${p.date || ''}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * 渲染博客列表项 HTML
   * @param {Array} posts - 文章数据数组
   * @returns {string} HTML 字符串
   */
  function renderBlogItems(posts) {
    if (posts.length === 0) {
      return '<p class="empty-state">还没有文章，敬请期待。</p>';
    }
    return posts.map(p => `
      <div class="blog-item" onclick="window.location.href='post.html?id=${p.id}'">
        <div class="blog-item__cover" data-cover="${p.title}">
          ${p.cover ? `<img src="${p.cover}" alt="${p.title}" onerror="DataLoader.handleImageError(this, this.parentElement.dataset.cover.charAt(0))">` : p.title.charAt(0)}
        </div>
        <div class="blog-item__content">
          <h3 class="blog-item__title">${p.title}</h3>
          <p class="blog-item__summary">${p.summary}</p>
          <div class="blog-item__meta">
            <span>${p.date}</span>
            ${p.category ? `<span class="blog-item__category">${p.category}</span>` : ''}
            <div class="blog-item__tags">
              ${(p.tags || []).slice(0, 2).map(t => `<span class="tag tag--secondary">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  return { loadJSON, loadText, handleImageError, renderProjectCards, renderBlogItems };
})();

window.DataLoader = DataLoader;
