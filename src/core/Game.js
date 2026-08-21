import { SoundEngine } from './Audio.js';
import { InputHandler } from './Input.js';
import { Starfield } from '../vfx/Starfield.js';
import { ParticleSystem } from '../vfx/ParticleSystem.js';
import { Paddle } from '../entities/Paddle.js';
import { Ball } from '../entities/Ball.js';
import { PowerUpType } from '../entities/PowerUp.js';
import { LevelManager } from '../levels/LevelManager.js';
import { HUD } from '../ui/HUD.js';

export const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_TRANSITION: 'LEVEL_TRANSITION',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.canvasWidth = 480;
    this.canvasHeight = 640;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.state = GameState.MENU;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('astro_breaker_hi') || '0', 10);
    this.lives = 3;
    this.currentLevel = 1;
    this.maxLevel = 5;

    // Subsystems
    this.audio = new SoundEngine();
    this.input = new InputHandler(this.canvas);
    this.starfield = new Starfield(this.canvasWidth, this.canvasHeight);
    this.particles = new ParticleSystem();
    this.levelManager = new LevelManager(this.canvasWidth, this.canvasHeight);
    this.hud = new HUD();

    // Entities
    this.paddle = new Paddle(this.canvasWidth, this.canvasHeight);
    this.balls = [];
    this.aliens = [];
    this.lasers = [];
    this.powerUps = [];

    this.lastTime = 0;
    this.levelTransitionTimer = 0;

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
  }

  handleResize() {
    // Keep canvas 480x640 internal resolution while fitting container
    const container = this.canvas.parentElement;
    if (!container) return;

    const contWidth = container.clientWidth;
    const contHeight = container.clientHeight;
    const aspect = this.canvasWidth / this.canvasHeight;

    let targetWidth = contWidth;
    let targetHeight = contWidth / aspect;

    if (targetHeight > contHeight) {
      targetHeight = contHeight;
      targetWidth = contHeight * aspect;
    }

    this.canvas.style.width = `${targetWidth}px`;
    this.canvas.style.height = `${targetHeight}px`;
  }

  startNewGame() {
    this.audio.init();
    this.audio.startBGM();

    this.score = 0;
    this.lives = 3;
    this.currentLevel = 1;
    this.lasers = [];
    this.powerUps = [];
    this.particles.clear();

    this.paddle.reset();
    this.loadLevel(this.currentLevel);

    this.state = GameState.PLAYING;
    this.hud.showBanner(`WAVE ${this.currentLevel}`, this.getLevelTitle(this.currentLevel));
  }

  loadLevel(levelIndex) {
    this.currentLevel = levelIndex;
    this.aliens = this.levelManager.loadLevel(levelIndex);
    this.lasers = [];
    this.powerUps = [];

    // Spawn initial ball attached to paddle
    this.balls = [new Ball(this.paddle.x, this.paddle.y - 20)];
    this.paddle.reset();
  }

  getLevelTitle(level) {
    const titles = {
      1: 'PRIMEIRO CONTATO',
      2: 'DEFESA BLINDADA',
      3: 'ESQUADRÃO VELOZ',
      4: 'FORTALEZA ESPACIAL',
      5: 'A NAVE-MÃE'
    };
    return titles[level] || `SUPER ONDA ${level}`;
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
    }
  }

  update(dt) {
    // Check Pause / Mute shortcuts
    if (this.input.isPauseJustPressed()) {
      if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
        this.togglePause();
      }
    }

    if (this.input.isMuteJustPressed()) {
      this.audio.toggleMute();
    }

    // Always update visual background
    this.starfield.update(this.state === GameState.PLAYING ? 1.5 : 0.4);
    this.particles.update();
    this.hud.update(dt);

    if (this.state === GameState.PLAYING) {
      this.updatePlaying(dt);
    } else if (this.state === GameState.LEVEL_TRANSITION) {
      this.updateLevelTransition(dt);
    }

    this.input.clearFrame();
  }

  updatePlaying(dt) {
    // 1. Update Paddle & Check Laser Shooting
    this.paddle.update(this.input, dt, this.particles);

    if (this.input.isAction() && this.paddle.laserTimer > 0) {
      const newLasers = this.paddle.shootLaser(this.audio);
      if (newLasers) {
        this.lasers.push(...newLasers);
      }
    }

    // Launch ball if stuck and action pressed
    if (this.input.isActionJustPressed()) {
      for (const ball of this.balls) {
        if (ball.isStuck) {
          ball.launch();
          this.audio.playPaddleHit();
        }
      }
    }

    // 2. Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.update();
      if (laser.markedForDeletion) {
        this.lasers.splice(i, 1);
        continue;
      }

      // Check collision with aliens
      for (const alien of this.aliens) {
        if (this.checkLaserAlienCollision(laser, alien)) {
          laser.markedForDeletion = true;
          this.particles.createImpact(laser.x, laser.y, '#ff0055', 6);
          const destroyed = alien.takeDamage(1);

          if (destroyed) {
            this.handleAlienDestroyed(alien);
          } else {
            this.audio.playBounce(true);
          }
          break;
        }
      }
    }

    // 3. Update Balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      const result = ball.update(this.paddle, this.canvasWidth, this.canvasHeight);

      if (result === 'wall_hit') {
        this.audio.playBounce(false);
        this.particles.createImpact(ball.pos.x, ball.pos.y, '#00f0ff', 5);
      } else if (result === 'dead') {
        this.balls.splice(i, 1);
        continue;
      }

      // Check Paddle collision
      if (!ball.isStuck && ball.vel.y > 0) {
        if (this.checkBallPaddleCollision(ball, this.paddle)) {
          ball.bounceOffPaddle(this.paddle);
          this.audio.playPaddleHit();
          this.particles.createImpact(ball.pos.x, ball.pos.y, '#00ffcc', 8);
        }
      }

      // Check Alien collisions
      for (const alien of this.aliens) {
        if (this.checkBallAlienCollision(ball, alien)) {
          const destroyed = alien.takeDamage(1);
          if (destroyed) {
            this.handleAlienDestroyed(alien);
          } else {
            this.audio.playBounce(true);
            this.particles.createImpact(ball.pos.x, ball.pos.y, alien.baseColor, 6);
          }
          break; // Resolve one collision per frame per ball
        }
      }
    }

    // 4. Update Aliens
    for (let i = this.aliens.length - 1; i >= 0; i--) {
      const alien = this.aliens[i];
      alien.update(dt);
      if (alien.markedForDeletion) {
        this.aliens.splice(i, 1);
      }
    }

    // 5. Update Power-Ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      pu.update(this.canvasHeight);

      if (pu.markedForDeletion) {
        this.powerUps.splice(i, 1);
        continue;
      }

      // Check pickup with paddle
      if (this.checkPowerUpPaddleCollision(pu, this.paddle)) {
        this.applyPowerUp(pu);
        this.powerUps.splice(i, 1);
      }
    }

    // 6. Check Loss of Balls / Life
    if (this.balls.length === 0) {
      this.handleLoseLife();
    }

    // 7. Check Level Complete
    if (this.aliens.length === 0) {
      this.handleLevelComplete();
    }
  }

  handleAlienDestroyed(alien) {
    this.addScore(alien.scoreValue);
    this.audio.playExplosion(alien.type === 'BOSS');
    this.particles.createExplosion(
      alien.x + alien.width / 2,
      alien.y + alien.height / 2,
      alien.baseColor,
      alien.type === 'BOSS' ? 50 : 25
    );

    // Roll power-up
    const drop = alien.rollPowerUpDrop(0.18);
    if (drop) {
      this.powerUps.push(drop);
    }
  }

  applyPowerUp(powerUp) {
    this.audio.playPowerUp();
    this.particles.createPowerUpSparks(powerUp.x, powerUp.y, powerUp.config.color, 20);
    this.addScore(150);

    switch (powerUp.type) {
      case PowerUpType.LASER:
        this.paddle.activateLaser(10);
        this.hud.showToast('CANHÃO LASER ATIVADO!', '#ff0055');
        break;

      case PowerUpType.MULTIBALL:
        this.spawnMultiBalls();
        this.hud.showToast('MULTI-BALL ATIVADA!', '#00f0ff');
        break;

      case PowerUpType.EXPAND:
        this.paddle.activateExpand(15);
        this.hud.showToast('NAVE EXPANDIDA!', '#ffd700');
        break;

      case PowerUpType.EXTRA_LIFE:
        this.lives = Math.min(5, this.lives + 1);
        this.hud.showToast('VIDA EXTRA!', '#00ff88');
        break;
    }
  }

  spawnMultiBalls() {
    const currentBalls = [...this.balls];
    for (const ball of currentBalls) {
      if (ball.isStuck) continue;

      const ball1 = new Ball(ball.pos.x, ball.pos.y, ball.radius);
      ball1.isStuck = false;
      ball1.speed = ball.speed;
      const angle1 = ball.vel.heading() + 0.35;
      ball1.vel.set(Math.cos(angle1) * ball1.speed, Math.sin(angle1) * ball1.speed);

      const ball2 = new Ball(ball.pos.x, ball.pos.y, ball.radius);
      ball2.isStuck = false;
      ball2.speed = ball.speed;
      const angle2 = ball.vel.heading() - 0.35;
      ball2.vel.set(Math.cos(angle2) * ball2.speed, Math.sin(angle2) * ball2.speed);

      this.balls.push(ball1, ball2);
    }
  }

  handleLoseLife() {
    this.lives--;
    this.audio.playLoseLife();

    if (this.lives <= 0) {
      this.state = GameState.GAME_OVER;
      this.audio.playGameOver();
      this.audio.stopBGM();
      this.checkHighScore();
    } else {
      // Reset paddle & ball
      this.paddle.reset();
      this.lasers = [];
      this.balls = [new Ball(this.paddle.x, this.paddle.y - 20)];
      this.hud.showToast(`VIDAS RESTANTES: ${this.lives}`, '#ff3366');
    }
  }

  handleLevelComplete() {
    this.audio.playLevelUp();
    this.addScore(1000 * this.currentLevel);

    if (this.currentLevel === this.maxLevel) {
      this.state = GameState.VICTORY;
      this.checkHighScore();
    } else {
      this.state = GameState.LEVEL_TRANSITION;
      this.levelTransitionTimer = 2.0;
      this.hud.showBanner(`WAVE ${this.currentLevel} LIMPA!`, 'PREPARE-SE PARA A PRÓXIMA ONDA');
    }
  }

  continueToEndless() {
    this.state = GameState.LEVEL_TRANSITION;
    this.levelTransitionTimer = 1.0;
  }

  updateLevelTransition(dt) {
    this.levelTransitionTimer -= dt;
    if (this.levelTransitionTimer <= 0) {
      this.loadLevel(this.currentLevel + 1);
      this.state = GameState.PLAYING;
      this.hud.showBanner(`WAVE ${this.currentLevel}`, this.getLevelTitle(this.currentLevel));
    }
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('astro_breaker_hi', String(this.highScore));
    }
  }

  checkHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('astro_breaker_hi', String(this.highScore));
    }
  }

  // --- Collision Detection Utilities ---
  checkBallPaddleCollision(ball, paddle) {
    const pb = paddle.getBounds();
    return (
      ball.pos.x + ball.radius >= pb.left &&
      ball.pos.x - ball.radius <= pb.right &&
      ball.pos.y + ball.radius >= pb.top &&
      ball.pos.y - ball.radius <= pb.bottom
    );
  }

  checkBallAlienCollision(ball, alien) {
    const ab = alien.getBounds();
    // Find closest point on alien box to ball circle
    const closestX = Math.max(ab.left, Math.min(ball.pos.x, ab.right));
    const closestY = Math.max(ab.top, Math.min(ball.pos.y, ab.bottom));

    const distX = ball.pos.x - closestX;
    const distY = ball.pos.y - closestY;
    const distSq = distX * distX + distY * distY;

    if (distSq < ball.radius * ball.radius) {
      // Rebound direction resolution
      const overlapLeft = Math.abs(ball.pos.x + ball.radius - ab.left);
      const overlapRight = Math.abs(ab.right - (ball.pos.x - ball.radius));
      const overlapTop = Math.abs(ball.pos.y + ball.radius - ab.top);
      const overlapBottom = Math.abs(ab.bottom - (ball.pos.y - ball.radius));

      const minOverlapX = Math.min(overlapLeft, overlapRight);
      const minOverlapY = Math.min(overlapTop, overlapBottom);

      if (minOverlapX < minOverlapY) {
        ball.vel.x = -ball.vel.x;
      } else {
        ball.vel.y = -ball.vel.y;
      }

      ball.increaseSpeed(1.015);
      return true;
    }

    return false;
  }

  checkLaserAlienCollision(laser, alien) {
    const lb = laser.getBounds();
    const ab = alien.getBounds();
    return (
      lb.left < ab.right &&
      lb.right > ab.left &&
      lb.top < ab.bottom &&
      lb.bottom > ab.top
    );
  }

  checkPowerUpPaddleCollision(powerUp, paddle) {
    const pub = powerUp.getBounds();
    const pb = paddle.getBounds();
    return (
      pub.left < pb.right &&
      pub.right > pb.left &&
      pub.top < pb.bottom &&
      pub.bottom > pb.top
    );
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 1. Draw Starfield
    this.starfield.draw(this.ctx);

    // 2. Draw Entities
    for (const alien of this.aliens) {
      alien.draw(this.ctx);
    }

    for (const pu of this.powerUps) {
      pu.draw(this.ctx);
    }

    for (const laser of this.lasers) {
      laser.draw(this.ctx);
    }

    this.paddle.draw(this.ctx);

    for (const ball of this.balls) {
      ball.draw(this.ctx);
    }

    // 3. Draw VFX Particles
    this.particles.draw(this.ctx);

    // 4. Draw HUD
    this.hud.draw(this.ctx, this);

    // 5. Draw Modal Overlays if not strictly in gameplay
    this.renderOverlays();
  }

  renderOverlays() {
    if (this.state === GameState.MENU) {
      this.drawMenuOverlay();
    } else if (this.state === GameState.PAUSED) {
      this.drawPauseOverlay();
    } else if (this.state === GameState.GAME_OVER) {
      this.drawGameOverOverlay();
    } else if (this.state === GameState.VICTORY) {
      this.drawVictoryOverlay();
    }
  }

  drawMenuOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(6, 10, 26, 0.75)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#00f0ff';

    // Title
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = '900 32px "Courier New", monospace';
    this.ctx.fillText('ASTRO-BREAKER', this.canvasWidth / 2, 200);

    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#ff00ff';
    this.ctx.fillStyle = '#ff77ff';
    this.ctx.font = 'bold 13px "Courier New", monospace';
    this.ctx.fillText('SPACE INVADERS × BREAKOUT', this.canvasWidth / 2, 235);

    // Prompt
    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    this.ctx.globalAlpha = pulse;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px "Courier New", monospace';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = '#ffffff';
    this.ctx.fillText('PRESSIONE ESPAÇO OU CLIQUE', this.canvasWidth / 2, 340);
    this.ctx.fillText('PARA JOGAR', this.canvasWidth / 2, 365);

    // Instructions summary
    this.ctx.globalAlpha = 0.85;
    this.ctx.fillStyle = '#88a0cc';
    this.ctx.font = '12px "Courier New", monospace';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText('◄ ► / A D / Mouse / Touch : Mover', this.canvasWidth / 2, 450);
    this.ctx.fillText('ESPAÇO : Lançar Bola / Atirar Canhão', this.canvasWidth / 2, 475);
    this.ctx.fillText('P : Pausar  |  M : Som', this.canvasWidth / 2, 500);

    this.ctx.restore();
  }

  drawPauseOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(6, 10, 26, 0.7)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 16;
    this.ctx.shadowColor = '#ffd700';
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 28px "Courier New", monospace';
    this.ctx.fillText('JOGO PAUSADO', this.canvasWidth / 2, this.canvasHeight / 2 - 20);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px "Courier New", monospace';
    this.ctx.fillText('Pressione P ou Espaço para continuar', this.canvasWidth / 2, this.canvasHeight / 2 + 20);
    this.ctx.restore();
  }

  drawGameOverOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(16, 6, 18, 0.85)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#ff0055';
    this.ctx.fillStyle = '#ff0055';
    this.ctx.font = '900 32px "Courier New", monospace';
    this.ctx.fillText('GAME OVER', this.canvasWidth / 2, 220);

    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px "Courier New", monospace';
    this.ctx.fillText(`PONTUAÇÃO FINAL: ${this.score}`, this.canvasWidth / 2, 290);
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillText(`RECORDE: ${this.highScore}`, this.canvasWidth / 2, 320);

    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    this.ctx.globalAlpha = pulse;
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = 'bold 15px "Courier New", monospace';
    this.ctx.fillText('CLIQUE OU ESPAÇO PARA REINICIAR', this.canvasWidth / 2, 400);

    this.ctx.restore();
  }

  drawVictoryOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(6, 20, 30, 0.88)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 24;
    this.ctx.shadowColor = '#00ff88';
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = '900 30px "Courier New", monospace';
    this.ctx.fillText('VITÓRIA DA TERRA!', this.canvasWidth / 2, 210);

    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 15px "Courier New", monospace';
    this.ctx.fillText('A FROTA ALIENÍGENA FOI DESTRUÍDA!', this.canvasWidth / 2, 250);
    this.ctx.fillText(`PONTOS TOTAIS: ${this.score}`, this.canvasWidth / 2, 295);

    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    this.ctx.globalAlpha = pulse;
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 15px "Courier New", monospace';
    this.ctx.fillText('ESPAÇO: JOGAR MODO INFINITO', this.canvasWidth / 2, 370);

    this.ctx.restore();
  }
}
