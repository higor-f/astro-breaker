import { Alien, AlienType } from '../entities/Alien.js';

/**
 * Level Manager
 * Defines designed waves 1 to 5 and procedural endless waves afterwards.
 */
export class LevelManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.currentLevel = 1;
  }

  resize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  loadLevel(levelIndex) {
    this.currentLevel = levelIndex;
    const aliens = [];
    const colWidth = 48;
    const rowHeight = 32;
    const startY = 65;

    switch (levelIndex) {
      case 1:
        // Level 1: Classic Green Armada (3 rows x 8 cols)
        this.buildGrid(aliens, {
          rows: 3,
          cols: 8,
          colWidth,
          rowHeight,
          startY,
          typePattern: () => AlienType.GREEN
        });
        break;

      case 2:
        // Level 2: Armored Reinforcements (4 rows: 2 Red, 2 Green)
        this.buildGrid(aliens, {
          rows: 4,
          cols: 9,
          colWidth,
          rowHeight,
          startY,
          typePattern: (r) => (r < 2 ? AlienType.RED : AlienType.GREEN)
        });
        break;

      case 3:
        // Level 3: Mobile Vanguard (Mobile in front, Red middle, Green back)
        this.buildGrid(aliens, {
          rows: 4,
          cols: 8,
          colWidth: 52,
          rowHeight: 34,
          startY,
          typePattern: (r) => {
            if (r === 3) return AlienType.MOBILE;
            if (r === 1 || r === 2) return AlienType.RED;
            return AlienType.GREEN;
          }
        });
        break;

      case 4:
        // Level 4: Space Fortress (Pyramid / Diamond cluster with Mobile wings)
        this.buildFortress(aliens, startY);
        break;

      case 5:
        // Level 5: Mothership Boss + Elite Escorts
        this.buildBossLevel(aliens, startY);
        break;

      default:
        // Endless Procedural Waves (> 5)
        this.buildEndlessLevel(aliens, levelIndex, startY);
        break;
    }

    return aliens;
  }

  buildGrid(aliens, { rows, cols, colWidth, rowHeight, startY, typePattern }) {
    const totalWidth = cols * colWidth;
    const startX = (this.canvasWidth - totalWidth) / 2 + (colWidth - 40) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * colWidth;
        const y = startY + r * rowHeight;
        const type = typePattern(r, c);

        aliens.push(new Alien(x, y, 40, 22, type, {
          patrolRange: 35 + (c % 2) * 15,
          patrolSpeed: 1.5 + (r * 0.2)
        }));
      }
    }
  }

  buildFortress(aliens, startY) {
    const cols = 9;
    const rows = 5;
    const colWidth = 48;
    const rowHeight = 30;
    const totalWidth = cols * colWidth;
    const startX = (this.canvasWidth - totalWidth) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Checkerboard / Fortress layout
        if ((r + c) % 2 === 0) {
          const x = startX + c * colWidth;
          const y = startY + r * rowHeight;
          const isWing = c === 0 || c === cols - 1;
          const type = isWing ? AlienType.MOBILE : (r <= 2 ? AlienType.RED : AlienType.GREEN);

          aliens.push(new Alien(x, y, 42, 22, type, {
            patrolRange: isWing ? 40 : 25,
            patrolSpeed: 2.0
          }));
        }
      }
    }
  }

  buildBossLevel(aliens, startY) {
    // 1. Central Boss Mothership
    const bossX = this.canvasWidth / 2 - 34;
    const bossY = startY + 15;
    aliens.push(new Alien(bossX, bossY, 68, 34, AlienType.BOSS, {
      patrolRange: 120,
      patrolSpeed: 1.6
    }));

    // 2. Mobile escorts
    const escorts = [-90, -45, 45, 90];
    for (const offset of escorts) {
      aliens.push(new Alien(
        this.canvasWidth / 2 + offset - 20,
        startY + 75,
        40, 22,
        AlienType.MOBILE,
        { patrolRange: 30, patrolSpeed: 2.2 }
      ));
    }

    // 3. Shield line of Armored Reds
    const redCols = 7;
    const startRedX = (this.canvasWidth - redCols * 48) / 2;
    for (let c = 0; c < redCols; c++) {
      aliens.push(new Alien(
        startRedX + c * 48,
        startY + 120,
        42, 22,
        AlienType.RED
      ));
    }
  }

  buildEndlessLevel(aliens, levelIndex, startY) {
    const cycle = levelIndex - 5;
    const rows = Math.min(6, 4 + Math.floor(cycle / 2));
    const cols = 9;
    const colWidth = 48;
    const rowHeight = 30;
    const totalWidth = cols * colWidth;
    const startX = (this.canvasWidth - totalWidth) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * colWidth;
        const y = startY + r * rowHeight;
        
        let type = AlienType.GREEN;
        const rand = Math.random();
        if (rand < 0.35 + cycle * 0.05) type = AlienType.RED;
        else if (rand < 0.65 + cycle * 0.05) type = AlienType.MOBILE;

        aliens.push(new Alien(x, y, 42, 22, type, {
          patrolRange: 30 + Math.random() * 25,
          patrolSpeed: 1.8 + cycle * 0.15
        }));
      }
    }
  }
}
