/**
 * PowerUp Item
 * Drops from destroyed aliens with a 15% chance.
 */
export const PowerUpType = {
  LASER: 'LASER',
  MULTIBALL: 'MULTIBALL',
  EXPAND: 'EXPAND',
  EXTRA_LIFE: 'EXTRA_LIFE'
};

export class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type || this.getRandomType();
    this.width = 28;
    this.height = 18;
    this.vy = 2.2;
    this.markedForDeletion = false;
    this.pulse = 0;

    this.config = this.getTypeConfig();
  }

  getRandomType() {
    const roll = Math.random();
    if (roll < 0.35) return PowerUpType.LASER;
    if (roll < 0.70) return PowerUpType.MULTIBALL;
    if (roll < 0.92) return PowerUpType.EXPAND;
    return PowerUpType.EXTRA_LIFE;
  }

  getTypeConfig() {
    switch (this.type) {
      case PowerUpType.LASER:
        return {
          label: 'LASER',
          symbol: '⚡',
          color: '#ff0055',
          glow: '#ff5599',
          name: 'Canhão Laser'
        };
      case PowerUpType.MULTIBALL:
        return {
          label: 'MULTI',
          symbol: '✦',
          color: '#00f0ff',
          glow: '#7df9ff',
          name: 'Multi-Ball'
        };
      case PowerUpType.EXPAND:
        return {
          label: 'WIDE',
          symbol: '⟷',
          color: '#ffd700',
          glow: '#ffee55',
          name: 'Nave Expandida'
        };
      case PowerUpType.EXTRA_LIFE:
        return {
          label: 'LIFE',
          symbol: '♥',
          color: '#00ff88',
          glow: '#55ffaa',
          name: 'Vida Extra'
        };
      default:
        return {
          label: 'BONUS',
          symbol: '★',
          color: '#ffffff',
          glow: '#ffffff',
          name: 'Bonus'
        };
    }
  }

  update(canvasHeight) {
    this.y += this.vy;
    this.pulse += 0.08;

    if (this.y - this.height > canvasHeight) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.save();
    const glowScale = Math.sin(this.pulse) * 4 + 8;
    ctx.shadowBlur = glowScale;
    ctx.shadowColor = this.config.glow;

    // Capsule background
    ctx.fillStyle = '#0a0d1a';
    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 2;

    const rx = this.x - this.width / 2;
    const ry = this.y - this.height / 2;

    ctx.beginPath();
    ctx.roundRect(rx, ry, this.width, this.height, 6);
    ctx.fill();
    ctx.stroke();

    // Center icon/symbol
    ctx.fillStyle = this.config.color;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.symbol, this.x, this.y);

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
