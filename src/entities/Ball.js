import { Vector2D } from '../core/Vector2D.js';

/**
 * Energy Ball / Esfera de Energia
 */
export class Ball {
  constructor(x, y, radius = 6) {
    this.pos = new Vector2D(x, y);
    this.vel = new Vector2D(0, 0);
    this.radius = radius;
    this.baseSpeed = 7.0;
    this.speed = this.baseSpeed;
    this.isStuck = true; // Attached to paddle at start
    this.markedForDeletion = false;
    this.trail = [];
    this.maxTrail = 8;
    this.color = '#00ffff';
    this.glowColor = '#7df9ff';
  }

  launch(angle = -Math.PI / 2 + (Math.random() * 0.4 - 0.2)) {
    this.isStuck = false;
    this.vel.set(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  update(paddle, canvasWidth, canvasHeight) {
    if (this.isStuck) {
      this.pos.x = paddle.x;
      this.pos.y = paddle.y - paddle.height / 2 - this.radius - 2;
      this.trail = [];
      return;
    }

    // Save trail position
    this.trail.push({ x: this.pos.x, y: this.pos.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    // Move
    this.pos.add(this.vel);

    // Bounce off Left / Right walls
    if (this.pos.x - this.radius <= 0) {
      this.pos.x = this.radius;
      this.vel.x = Math.abs(this.vel.x);
      return 'wall_hit';
    } else if (this.pos.x + this.radius >= canvasWidth) {
      this.pos.x = canvasWidth - this.radius;
      this.vel.x = -Math.abs(this.vel.x);
      return 'wall_hit';
    }

    // Bounce off Top wall
    if (this.pos.y - this.radius <= 0) {
      this.pos.y = this.radius;
      this.vel.y = Math.abs(this.vel.y);
      return 'wall_hit';
    }

    // Bottom out of bounds check
    if (this.pos.y - this.radius > canvasHeight) {
      this.markedForDeletion = true;
      return 'dead';
    }

    return null;
  }

  /**
   * Rebound off player paddle with dynamic angle based on impact point
   */
  bounceOffPaddle(paddle) {
    // Determine relative hit point: -1 (far left) to 1 (far right)
    const hitPoint = (this.pos.x - paddle.x) / (paddle.width / 2);
    const clampedHit = Math.max(-0.95, Math.min(0.95, hitPoint));

    // Calculate reflection angle between -70° and +70° from vertical
    const maxAngle = (70 * Math.PI) / 180;
    const bounceAngle = clampedHit * maxAngle - Math.PI / 2;

    // Apply new velocity vector
    this.vel.set(
      Math.cos(bounceAngle) * this.speed,
      Math.sin(bounceAngle) * this.speed
    );

    // Prevent ball from sticking inside paddle
    this.pos.y = paddle.y - paddle.height / 2 - this.radius - 1;
  }

  increaseSpeed(multiplier = 1.05, maxSpeed = 11.5) {
    this.speed = Math.min(maxSpeed, this.speed * multiplier);
    const currentAngle = this.vel.heading();
    this.vel.set(
      Math.cos(currentAngle) * this.speed,
      Math.sin(currentAngle) * this.speed
    );
  }

  draw(ctx) {
    ctx.save();

    // Draw glowing trail
    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      const alpha = (i + 1) / (this.trail.length + 1) * 0.45;
      const size = this.radius * (0.4 + (i / this.trail.length) * 0.6);

      ctx.fillStyle = this.glowColor;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw main energy sphere
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 14;
    ctx.shadowColor = this.glowColor;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner energetic core
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  getBounds() {
    return {
      left: this.pos.x - this.radius,
      right: this.pos.x + this.radius,
      top: this.pos.y - this.radius,
      bottom: this.pos.y + this.radius
    };
  }
}
