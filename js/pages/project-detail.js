/**
 * 项目详情页逻辑
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('project-detail');
  if (!container) return;

  const id = Router.getQueryParam('id');
  if (!id) {
    container.innerHTML = '<p class="error-msg">未指定项目 ID</p>';
    return;
  }

  try {
    const projects = await DataLoader.loadJSON('data/projects.json');
    const project = projects.find(p => p.id === id);

    if (!project) {
      container.innerHTML = `
        <div class="empty-state">
          <p>未找到该项目。</p>
          <a href="projects.html" class="btn btn--outline">返回项目列表</a>
        </div>
      `;
      return;
    }

    document.title = `${project.title} - 肖子安的个人网站`;

    container.innerHTML = `
      <a href="projects.html" class="back-link">← 返回项目列表</a>
      <article class="project-detail">
        <header class="project-detail__header">
          <h1>${project.title}</h1>
          <div class="project-detail__meta">
            ${project.date ? `<span>📅 ${project.date}</span>` : ''}
          </div>
          <div class="project-detail__tags">
            ${project.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          ${project.link ? `
            <a href="${project.link}" class="btn btn--primary project-detail__link" target="_blank" rel="noopener noreferrer">
              查看项目 →
            </a>
          ` : ''}
        </header>
        <div class="project-detail__content" id="project-content">
          <p class="loading">加载详情中...</p>
        </div>
      </article>
    `;

    // 加载 Markdown 详情
    const contentEl = document.getElementById('project-content');
    if (project.detail) {
      await MarkdownRenderer.renderFromFile(project.detail, contentEl);
    } else {
      contentEl.innerHTML = `<p>${project.summary}</p>`;
    }
  } catch (err) {
    container.innerHTML = '<p class="error-msg">项目加载失败</p>';
  }
});
