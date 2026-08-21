import { Laser } from './Laser.js';

/**
 * Player Spaceship Paddle
 */
export class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.baseWidth = 88;
    this.width = this.baseWidth;
    this.targetWidth = this.baseWidth;
    this.height = 18;

    this.x = canvasWidth / 2;
    this.y = canvasHeight - 40;
    this.vx = 0;
    this.speed = 8.5;

    // Power-up states
    this.laserTimer = 0;       // Seconds remaining
    this.expandTimer = 0;      // Seconds remaining
    this.laserCooldown = 0;    // Cooldown between laser shots (ms)
    this.laserInterval = 220;  // Rapid fire interval

    this.tilt = 0;             // Visual tilt when turning
  }

  resize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.y = canvasHeight - 40;
    this.x = Math.max(this.width / 2, Math.min(this.canvasWidth - this.width / 2, this.x));
  }

  activateLaser(duration = 10) {
    this.laserTimer = duration;
  }

  activateExpand(duration = 15) {
    this.expandTimer = duration;
    this.targetWidth = this.baseWidth * 1.5;
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.vx = 0;
    this.laserTimer = 0;
    this.expandTimer = 0;
    this.targetWidth = this.baseWidth;
    this.width = this.baseWidth;
  }

  update(input, dt, particleSystem) {
    // 1. Power-up Timers
    if (this.laserTimer > 0) {
      this.laserTimer -= dt;
      if (this.laserTimer <= 0) {
        this.laserTimer = 0;
      }
    }

    if (this.expandTimer > 0) {
      this.expandTimer -= dt;
      if (this.expandTimer <= 0) {
        this.expandTimer = 0;
        this.targetWidth = this.baseWidth;
      }
    }

    // Smooth width transition
    this.width += (this.targetWidth - this.width) * 0.1;

    if (this.laserCooldown > 0) {
      this.laserCooldown -= dt * 1000;
    }

    // 2. Movement
    let targetVx = 0;

    if (input.isLeft()) {
      targetVx -= this.speed;
    }
    if (input.isRight()) {
      targetVx += this.speed;
    }



    // Smooth velocity
    this.vx += (targetVx - this.vx) * 0.28;
    this.x += this.vx;

    // Boundaries
    const halfW = this.width / 2;
    if (this.x - halfW < 8) {
      this.x = halfW + 8;
      this.vx = 0;
    } else if (this.x + halfW > this.canvasWidth - 8) {
      this.x = this.canvasWidth - 8 - halfW;
      this.vx = 0;
    }

    // Tilt animation
    this.tilt = this.vx * 0.03;

    // Thruster exhaust particles
    if (particleSystem && Math.random() < 0.8) {
      particleSystem.createThruster(this.x - 12, this.y + this.height / 2, this.vx);
      particleSystem.createThruster(this.x + 12, this.y + this.height / 2, this.vx);
    }
  }

  shootLaser(audioEngine) {
    if (this.laserTimer <= 0 || this.laserCooldown > 0) return null;

    this.laserCooldown = this.laserInterval;
    if (audioEngine) {
      audioEngine.playLaser();
    }

    const halfW = this.width / 2;
    const leftLaser = new Laser(this.x - halfW + 6, this.y - 6);
    const rightLaser = new Laser(this.x + halfW - 6, this.y - 6);

    return [leftLaser, rightLaser];
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.tilt);

    const halfW = this.width / 2;
    const halfH = this.height / 2;

    // Glow aura
    const hasLaser = this.laserTimer > 0;
    const glowColor = hasLaser ? '#ff0055' : (this.expandTimer > 0 ? '#ffd700' : '#00f0ff');
    ctx.shadowBlur = 15;
    ctx.shadowColor = glowColor;

    // Spaceship Hull
    ctx.fillStyle = '#161b2e';
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    // Central cockpit & wings
    ctx.moveTo(-halfW, halfH);
    ctx.lineTo(-halfW + 8, -halfH + 4);
    ctx.lineTo(-halfW + 18, -halfH);
    ctx.lineTo(0, -halfH - 4);
    ctx.lineTo(halfW - 18, -halfH);
    ctx.lineTo(halfW - 8, -halfH + 4);
    ctx.lineTo(halfW, halfH);
    ctx.lineTo(0, halfH - 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Cockpit Core
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Wing Cannons (visual indicator when laser power-up active)
    if (hasLaser) {
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(-halfW + 2, -halfH - 8, 4, 8);
      ctx.fillRect(halfW - 6, -halfH - 8, 4, 8);
    } else {
      ctx.fillStyle = '#5577aa';
      ctx.fillRect(-halfW + 3, -halfH - 4, 3, 5);
      ctx.fillRect(halfW - 6, -halfH - 4, 3, 5);
    }

    // Neon accent stripes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-halfW + 14, 2);
    ctx.lineTo(-10, 2);
    ctx.moveTo(10, 2);
    ctx.lineTo(halfW - 14, 2);
    ctx.stroke();

    ctx.restore();
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }
}
