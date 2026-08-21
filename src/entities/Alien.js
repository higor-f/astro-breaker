import { PowerUp } from './PowerUp.js';

export const AlienType = {
  GREEN: 'GREEN',
  RED: 'RED',
  MOBILE: 'MOBILE',
  BOSS: 'BOSS'
};

/**
 * Alien Enemy Entity (Brick equivalent)
 */
export class Alien {
  constructor(x, y, width = 42, height = 24, type = AlienType.GREEN, options = {}) {
    this.initialX = x;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.markedForDeletion = false;

    // Movement options
    this.patrolRange = options.patrolRange || 45;
    this.patrolSpeed = options.patrolSpeed || 1.8;
    this.patrolTime = Math.random() * Math.PI * 2;

    this.flashTimer = 0;
    this.animTimer = Math.random() * 100;

    this.setupType();
  }

  setupType() {
    switch (this.type) {
      case AlienType.GREEN:
        this.maxHp = 1;
        this.hp = 1;
        this.scoreValue = 100;
        this.baseColor = '#00ff66';
        this.glowColor = '#55ffa0';
        break;

      case AlienType.RED:
        this.maxHp = 3;
        this.hp = 3;
        this.scoreValue = 250;
        this.baseColor = '#ff2244';
        this.glowColor = '#ff6677';
        break;

      case AlienType.MOBILE:
        this.maxHp = 2;
        this.hp = 2;
        this.scoreValue = 400;
        this.baseColor = '#bc13fe';
        this.glowColor = '#e066ff';
        break;

      case AlienType.BOSS:
        this.maxHp = 12;
        this.hp = 12;
        this.scoreValue = 1500;
        this.baseColor = '#ff9900';
        this.glowColor = '#ffcc00';
        this.width = 68;
        this.height = 34;
        break;

      default:
        this.maxHp = 1;
        this.hp = 1;
        this.scoreValue = 100;
        this.baseColor = '#00f0ff';
        this.glowColor = '#7df9ff';
    }
  }

  takeDamage(amount = 1) {
    this.hp -= amount;
    this.flashTimer = 8; // Flash white for 8 frames

    if (this.hp <= 0) {
      this.markedForDeletion = true;
      return true; // Destroyed
    }
    return false; // Still alive
  }

  update(dt = 1 / 60) {
    this.animTimer += 0.08;

    if (this.flashTimer > 0) {
      this.flashTimer--;
    }

    // Horizontal patrol for mobile aliens and bosses
    if (this.type === AlienType.MOBILE || this.type === AlienType.BOSS) {
      this.patrolTime += this.patrolSpeed * dt * 2.5;
      this.x = this.initialX + Math.sin(this.patrolTime) * this.patrolRange;
    }
  }

  rollPowerUpDrop(dropChance = 0.15) {
    if (Math.random() < dropChance) {
      return new PowerUp(this.x + this.width / 2, this.y + this.height / 2);
    }
    return null;
  }

  draw(ctx) {
    ctx.save();

    const isFlashing = this.flashTimer > 0;
    const color = isFlashing ? '#ffffff' : this.baseColor;
    const glow = isFlashing ? '#ffffff' : this.glowColor;

    ctx.shadowBlur = 10;
    ctx.shadowColor = glow;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const flap = Math.sin(this.animTimer) * 2;

    if (this.type === AlienType.GREEN) {
      // Classic Invader shape (Crab/Bug)
      ctx.beginPath();
      // Body
      ctx.roundRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8, 4);
      ctx.fill();

      // Antennae
      ctx.fillRect(this.x + 8, this.y, 3, 5);
      ctx.fillRect(this.x + this.width - 11, this.y, 3, 5);

      // Claws / Tentacles
      ctx.fillRect(this.x, this.y + 8 + flap, 4, 10);
      ctx.fillRect(this.x + this.width - 4, this.y + 8 + flap, 4, 10);

      // Eyes
      ctx.fillStyle = '#060a14';
      ctx.fillRect(this.x + 11, this.y + 8, 4, 4);
      ctx.fillRect(this.x + this.width - 15, this.y + 8, 4, 4);

    } else if (this.type === AlienType.RED) {
      // Armored Invader with Shield Segments
      ctx.beginPath();
      ctx.roundRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4, 6);
      ctx.fill();

      // Armor plating outline
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffeeee';
      ctx.stroke();

      // HP indicators on armor (dots)
      for (let i = 0; i < this.maxHp; i++) {
        ctx.fillStyle = i < this.hp ? '#ffffff' : '#441111';
        ctx.beginPath();
        ctx.arc(cx - (this.maxHp - 1) * 6 + i * 12, this.y + this.height - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Visor Eye
      ctx.fillStyle = '#fffa00';
      ctx.fillRect(cx - 8, this.y + 6, 16, 4);

    } else if (this.type === AlienType.MOBILE) {
      // Jet / Saucer Invader
      ctx.beginPath();
      ctx.moveTo(this.x, cy);
      ctx.lineTo(cx, this.y + 2);
      ctx.lineTo(this.x + this.width, cy);
      ctx.lineTo(cx + 8, this.y + this.height - 2);
      ctx.lineTo(cx - 8, this.y + this.height - 2);
      ctx.closePath();
      ctx.fill();

      // Glowing thrusters
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(cx - 5, this.y + this.height - 4, 10, 3 + flap);

      // Center orb
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === AlienType.BOSS) {
      // Mothership Boss
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, 10);
      ctx.fill();

      // Boss Armor & Details
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Core Reactor
      ctx.fillStyle = '#ff0033';
      ctx.beginPath();
      ctx.arc(cx, cy, 7 + flap, 0, Math.PI * 2);
      ctx.fill();

      // Health bar above boss
      const barW = this.width;
      const barH = 4;
      ctx.fillStyle = '#331111';
      ctx.fillRect(this.x, this.y - 8, barW, barH);
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(this.x, this.y - 8, barW * (this.hp / this.maxHp), barH);
    }

    ctx.restore();
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}
