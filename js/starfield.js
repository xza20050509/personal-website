/**
 * 星空背景 - Canvas 实现
 * 性能优化：
 * - requestAnimationFrame 驱动
 * - 移动端减少星点密度
 * - 页面隐藏时暂停动画
 * - 尊重 prefers-reduced-motion
 */
class Starfield {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.animationId = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    this.resize();
    this.createStars();
    this.bindEvents();
    if (!this.reducedMotion) {
      this.start();
    } else {
      this.draw(); // 只画一次静态星点
    }
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(dpr, dpr);
  }

  createStars() {
    // 移动端减少星点数量
    const isMobile = this.width < 768;
    const area = this.width * this.height;
    const density = isMobile ? 6000 : 4000; // 每颗星覆盖的面积
    const count = Math.floor(area / density);

    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.3,
        baseOpacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const star of this.stars) {
      const opacity = this.reducedMotion
        ? star.baseOpacity
        : star.baseOpacity * (0.6 + 0.4 * Math.sin(star.phase));

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      this.ctx.fill();
    }
  }

  animate() {
    // 更新闪烁相位
    for (const star of this.stars) {
      star.phase += star.twinkleSpeed;
    }
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.animationId) return;
    this.animate();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  bindEvents() {
    // 窗口大小变化
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.createStars();
        if (this.reducedMotion) this.draw();
      }, 200);
    });

    // 页面隐藏时暂停动画
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else if (!this.reducedMotion) {
        this.start();
      }
    });
  }
}

// 暴露到全局
window.Starfield = Starfield;
