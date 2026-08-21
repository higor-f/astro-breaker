/**
 * Particle System for Astro-Breaker
 * Manages bursts, impacts, thruster exhausts and glowing visual effects.
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  createExplosion(x, y, color = '#ff0055', count = 25, speedMax = 4.5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * speedMax + 0.8;
      const size = Math.random() * 3.5 + 1.5;
      const life = Math.random() * 25 + 20;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        life,
        maxLife: life,
        color,
        glow: true,
        decay: 0.96
      });
    }
  }

  createImpact(x, y, color = '#00f0ff', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.5;
      const size = Math.random() * 2 + 1;
      const life = Math.random() * 12 + 8;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        life,
        maxLife: life,
        color,
        glow: true,
        decay: 0.94
      });
    }
  }

  createThruster(x, y, vx = 0) {
    this.particles.push({
      x: x + (Math.random() * 6 - 3),
      y: y,
      vx: (Math.random() - 0.5) * 0.8 + vx * 0.2,
      vy: Math.random() * 2.5 + 2.0,
      size: Math.random() * 3 + 1.5,
      life: 14,
      maxLife: 14,
      color: Math.random() > 0.4 ? '#00f0ff' : '#ff9900',
      glow: true,
      decay: 0.92
    });
  }

  createPowerUpSparks(x, y, color = '#ffff00', count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0, // slight upward float
        size: Math.random() * 3 + 2,
        life: 25,
        maxLife: 25,
        color,
        glow: true,
        decay: 0.95
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.decay;
      p.vy *= p.decay;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  clear() {
    this.particles = [];
  }
}
