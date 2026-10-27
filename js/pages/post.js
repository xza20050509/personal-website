/**
 * 博客详情页逻辑
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('post-detail');
  if (!container) return;

  const id = Router.getQueryParam('id');
  if (!id) {
    container.innerHTML = '<p class="error-msg">未指定文章 ID</p>';
    return;
  }

  try {
    const posts = await DataLoader.loadJSON('data/blog.json');
    const post = posts.find(p => p.id === id);

    if (!post) {
      container.innerHTML = `
        <div class="empty-state">
          <p>未找到该文章。</p>
          <a href="blog.html" class="btn btn--outline">返回博客列表</a>
        </div>
      `;
      return;
    }

    document.title = `${post.title} - 肖子安的个人网站`;

    // 计算上一篇/下一篇（按日期倒序排列后的相邻文章）
    const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const idx = sorted.findIndex(p => p.id === id);
    const prev = idx < sorted.length - 1 ? sorted[idx + 1] : null;
    const next = idx > 0 ? sorted[idx - 1] : null;

    container.innerHTML = `
      <a href="blog.html" class="back-link">← 返回博客列表</a>
      <article class="post-detail">
        <header class="post-detail__header">
          <h1 class="post-detail__title">${post.title}</h1>
          <div class="post-detail__meta">
            <span>📅 ${post.date}</span>
            ${post.category ? `<span>📂 ${post.category}</span>` : ''}
          </div>
          ${post.tags && post.tags.length ? `
            <div class="post-detail__tags">
              ${post.tags.map(t => `<span class="tag tag--secondary">${t}</span>`).join('')}
            </div>
          ` : ''}
        </header>
        <div class="post-detail__content article-content" id="post-content">
          <p class="loading">加载文章中...</p>
        </div>
      </article>

      <nav class="post-nav">
        ${prev ? `
          <a href="post.html?id=${prev.id}" class="post-nav__item">
            <div class="post-nav__label">← 上一篇</div>
            <div class="post-nav__title">${prev.title}</div>
          </a>
        ` : '<div class="post-nav__item post-nav__item--disabled"><div class="post-nav__label">← 上一篇</div><div class="post-nav__title">没有更多了</div></div>'}
        ${next ? `
          <a href="post.html?id=${next.id}" class="post-nav__item" style="text-align:right">
            <div class="post-nav__label">下一篇 →</div>
            <div class="post-nav__title">${next.title}</div>
          </a>
        ` : '<div class="post-nav__item post-nav__item--disabled" style="text-align:right"><div class="post-nav__label">下一篇 →</div><div class="post-nav__title">没有更多了</div></div>'}
      </nav>
    `;

    // 加载 Markdown 正文
    const contentEl = document.getElementById('post-content');
    await MarkdownRenderer.renderFromFile(post.content, contentEl);
  } catch (err) {
    container.innerHTML = '<p class="error-msg">文章加载失败</p>';
  }
});
