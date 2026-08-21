/**
 * Laser Projectile
 * Fired vertically from player ship's wing cannons.
 */
export class Laser {
  constructor(x, y, vy = -12) {
    this.x = x;
    this.y = y;
    this.width = 4;
    this.height = 14;
    this.vy = vy;
    this.markedForDeletion = false;
    this.color = '#ff0055';
    this.glowColor = '#ff3388';
  }

  update() {
    this.y += this.vy;
    if (this.y + this.height < 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.glowColor;
    ctx.fillStyle = '#ffffff';

    // Core beam
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);

    // Outer glow aura
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width / 2 - 1, this.y + 2, this.width + 2, this.height - 4);
    ctx.restore();
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}
