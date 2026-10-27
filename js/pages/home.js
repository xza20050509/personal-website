/**
 * 首页逻辑 - 个人介绍、技能、项目预览、博客预览、联系方式
 */
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadProfile(),
    loadSkills(),
    loadProjectsPreview(),
    loadBlogPreview()
  ]);
});

/**
 * 加载个人信息
 */
async function loadProfile() {
  const container = document.getElementById('hero-content');
  if (!container) return;

  try {
    const profile = await DataLoader.loadJSON('data/profile.json');

    // 社交链接 SVG 图标
    const icons = {
      github: '<svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
      email: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
      zhihu: '<svg viewBox="0 0 24 24"><path d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0H5.721zm2.42 5.43c.602 0 1.09.49 1.09 1.09v5.85c0 .6-.488 1.09-1.09 1.09H7.09v2.94c0 .27-.22.49-.49.49h-.98a.49.49 0 01-.49-.49v-2.94H4.32a1.09 1.09 0 01-1.09-1.09V6.52c0-.6.49-1.09 1.09-1.09h3.82zm8.12 0h3.92c.6 0 1.09.49 1.09 1.09v5.85c0 .6-.49 1.09-1.09 1.09h-1.91v2.94c0 .27-.22.49-.49.49h-.98a.49.49 0 01-.49-.49v-2.94h-.05a1.09 1.09 0 01-1.09-1.09V6.52c0-.6.49-1.09 1.09-1.09z"/></svg>'
    };

    const socialHtml = (profile.social || [])
      .map(s => `
        <a href="${s.url}" class="social-link" target="_blank" rel="noopener noreferrer">
          ${icons[s.type] || ''}<span>${s.label}</span>
        </a>
      `).join('');

    container.innerHTML = `
      <p class="hero__greeting">你好，我是</p>
      <h1 class="hero__name">${profile.name}</h1>
      <p class="hero__title">${profile.university} · ${profile.major} · ${profile.grade}</p>
      <p class="hero__tagline">${profile.tagline}</p>
      <div class="social-links">${socialHtml}</div>
    `;

    // 头像处理
    const avatarEl = document.getElementById('hero-avatar');
    if (avatarEl && profile.avatar) {
      const img = new Image();
      img.src = profile.avatar;
      img.alt = profile.name;
      img.onload = () => {
        avatarEl.innerHTML = '';
        avatarEl.appendChild(img);
      };
      img.onerror = () => {
        avatarEl.textContent = profile.name.charAt(0);
      };
    } else if (avatarEl) {
      avatarEl.textContent = profile.name.charAt(0);
    }
  } catch (err) {
    container.innerHTML = '<p class="error-msg">个人信息加载失败</p>';
  }
}

/**
 * 加载技能
 */
async function loadSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  try {
    const skills = await DataLoader.loadJSON('data/skills.json');

    container.innerHTML = skills.map(group => `
      <div class="skill-category">
        <h3 class="skill-category__title">${group.category}</h3>
        ${group.skills.map(s => `
          <div class="skill-bar">
            <span class="skill-bar__name">${s.name}</span>
            <div class="skill-bar__track">
              <div class="skill-bar__fill" style="width: ${s.level * 20}%"></div>
            </div>
            <span class="skill-bar__level">${s.level}/5</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p class="error-msg">技能数据加载失败</p>';
  }
}

/**
 * 加载项目预览（首页只显示前 3 个）
 */
async function loadProjectsPreview() {
  const container = document.getElementById('projects-preview');
  if (!container) return;

  try {
    const projects = await DataLoader.loadJSON('data/projects.json');
    container.innerHTML = DataLoader.renderProjectCards(projects.slice(0, 3));
  } catch (err) {
    container.innerHTML = '<p class="error-msg">项目数据加载失败</p>';
  }
}

/**
 * 加载博客预览（首页只显示最新 3 篇）
 */
async function loadBlogPreview() {
  const container = document.getElementById('blog-preview');
  if (!container) return;

  try {
    const posts = await DataLoader.loadJSON('data/blog.json');
    // 按日期倒序
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = DataLoader.renderBlogItems(posts.slice(0, 3));
  } catch (err) {
    container.innerHTML = '<p class="error-msg">博客数据加载失败</p>';
  }
}
