/**
 * In-Game Heads Up Display (HUD)
 */
export class HUD {
  constructor() {
    this.bannerText = '';
    this.bannerSubtext = '';
    this.bannerTimer = 0;
    this.bannerAlpha = 0;

    this.toastText = '';
    this.toastTimer = 0;
    this.toastColor = '#00f0ff';
  }

  showBanner(text, subtext = '', duration = 2.5) {
    this.bannerText = text;
    this.bannerSubtext = subtext;
    this.bannerTimer = duration;
    this.bannerAlpha = 1;
  }

  showToast(text, color = '#00f0ff', duration = 1.8) {
    this.toastText = text;
    this.toastColor = color;
    this.toastTimer = duration;
  }

  update(dt) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer < 0.5) {
        this.bannerAlpha = Math.max(0, this.bannerTimer / 0.5);
      }
    }

    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
    }
  }

  draw(ctx, game) {
    ctx.save();

    // 1. Top HUD Bar
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textBaseline = 'top';

    // Score
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#00f0ff';
    ctx.textAlign = 'left';
    const scoreStr = String(game.score).padStart(6, '0');
    ctx.fillText(`SCORE: ${scoreStr}`, 16, 14);

    // High Score
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.textAlign = 'center';
    const hiScoreStr = String(game.highScore).padStart(6, '0');
    ctx.fillText(`HI: ${hiScoreStr}`, game.canvasWidth / 2, 14);

    // Wave / Level
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.textAlign = 'right';
    ctx.fillText(`WAVE ${game.currentLevel}`, game.canvasWidth - 16, 14);

    // 2. Lives Indicators (Miniature Spaceships)
    const startLifeX = 16;
    const lifeY = 34;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';

    for (let i = 0; i < game.lives; i++) {
      this.drawMiniShip(ctx, startLifeX + i * 18, lifeY);
    }

    // 3. Power-Up Status Indicators & Cooldown bars
    let powerUpOffset = 0;

    // Laser Bar
    if (game.paddle.laserTimer > 0) {
      this.drawPowerUpBar(
        ctx,
        game.canvasWidth - 110,
        34 + powerUpOffset * 16,
        'LASER',
        game.paddle.laserTimer / 10,
        '#ff0055'
      );
      powerUpOffset++;
    }

    // Wide Paddle Bar
    if (game.paddle.expandTimer > 0) {
      this.drawPowerUpBar(
        ctx,
        game.canvasWidth - 110,
        34 + powerUpOffset * 16,
        'WIDE',
        game.paddle.expandTimer / 15,
        '#ffd700'
      );
    }

    // 4. Wave Start Banner
    if (this.bannerTimer > 0) {
      ctx.globalAlpha = this.bannerAlpha;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00f0ff';

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillText(this.bannerText, game.canvasWidth / 2, game.canvasHeight / 2 - 30);

      if (this.bannerSubtext) {
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.shadowColor = '#00f0ff';
        ctx.fillText(this.bannerSubtext, game.canvasWidth / 2, game.canvasHeight / 2 + 5);
      }
    }

    // 5. Toast Message (Power-up pickup notification)
    if (this.toastTimer > 0) {
      ctx.globalAlpha = Math.min(1, this.toastTimer / 0.3);
      ctx.textAlign = 'center';
      ctx.fillStyle = this.toastColor;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.toastColor;
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.fillText(this.toastText, game.canvasWidth / 2, game.canvasHeight - 80);
    }

    ctx.restore();
  }

  drawMiniShip(ctx, x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x + 5, y + 4);
    ctx.lineTo(x, y + 2);
    ctx.lineTo(x - 5, y + 4);
    ctx.closePath();
    ctx.fill();
  }

  drawPowerUpBar(ctx, x, y, label, progress, color) {
    const w = 94;
    const h = 10;

    ctx.fillStyle = color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = color;
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, x - 32, y + 1);

    // Bar background
    ctx.fillStyle = '#111827';
    ctx.fillRect(x, y, w, h);

    // Bar fill
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, Math.max(0, (w - 2) * progress), h - 2);

    // Bar border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}
