/**
 * 博客列表页逻辑
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('blog-list');
  if (!container) return;

  try {
    const posts = await DataLoader.loadJSON('data/blog.json');
    // 按日期倒序
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = DataLoader.renderBlogItems(posts);
  } catch (err) {
    container.innerHTML = '<p class="error-msg">博客数据加载失败</p>';
  }
});
