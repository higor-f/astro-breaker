/**
 * Starfield with multi-layer parallax and speed warp effects
 */
export class Starfield {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stars = [];
    this.numStars = 90;
    this.init();
  }

  init() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        color: ['#00f0ff', '#ff007f', '#ffffff', '#7df9ff', '#b388ff'][Math.floor(Math.random() * 5)]
      });
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.init();
  }

  update(speedMultiplier = 1.0) {
    for (const star of this.stars) {
      star.y += star.speed * speedMultiplier;
      star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;

      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const star of this.stars) {
      ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
      ctx.fillStyle = star.color;
      ctx.shadowBlur = star.size * 3;
      ctx.shadowColor = star.color;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
