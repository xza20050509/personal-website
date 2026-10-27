/**
 * 全局逻辑 - 导航、星空背景初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  // 初始化星空背景
  const canvas = document.querySelector('.starfield-canvas');
  if (canvas) {
    new Starfield(canvas);
  }

  // 汉堡菜单
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isOpen = navMenu.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // 点击菜单项后收起
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 点击页面其他区域关闭菜单
  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // 导航高亮 - 首页锚点滚动监听
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  // 当前年份
  const yearEl = document.querySelector('.current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
