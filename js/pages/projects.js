/**
 * 项目列表页逻辑
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('projects-list');
  if (!container) return;

  try {
    const projects = await DataLoader.loadJSON('data/projects.json');
    // 按日期倒序
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = DataLoader.renderProjectCards(projects);
  } catch (err) {
    container.innerHTML = '<p class="error-msg">项目数据加载失败</p>';
  }
});
