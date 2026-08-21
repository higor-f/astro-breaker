import { Game, GameState } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  // UI Elements
  const btnStart = document.getElementById('btnStart');
  const btnRestart = document.getElementById('btnRestart');
  const btnPause = document.getElementById('btnPause');
  const btnMute = document.getElementById('btnMute');
  const btnScanlines = document.getElementById('btnScanlines');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const scanlinesOverlay = document.getElementById('scanlines');

  // Mobile Touch Controls
  const btnTouchLeft = document.getElementById('btnTouchLeft');
  const btnTouchRight = document.getElementById('btnTouchRight');
  const btnTouchAction = document.getElementById('btnTouchAction');

  // Button actions
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      game.startNewGame();
    });
  }

  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      game.startNewGame();
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      game.togglePause();
      btnPause.innerText = game.state === GameState.PAUSED ? '▶ RESUMIR' : '⏸ PAUSAR';
    });
  }

  if (btnMute) {
    btnMute.addEventListener('click', () => {
      const isMuted = game.audio.toggleMute();
      btnMute.innerText = isMuted ? '🔇 SOM: OFF' : '🔊 SOM: ON';
      btnMute.classList.toggle('active', !isMuted);
    });
  }

  if (btnScanlines && scanlinesOverlay) {
    btnScanlines.addEventListener('click', () => {
      const isActive = scanlinesOverlay.classList.toggle('active');
      btnScanlines.innerText = isActive ? '📺 CRT: ON' : '📺 CRT: OFF';
      btnScanlines.classList.toggle('active', isActive);
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      const elem = document.querySelector('.game-wrapper');
      if (!document.fullscreenElement) {
        elem.requestFullscreen?.().catch((err) => console.log(err));
      } else {
        document.exitFullscreen?.();
      }
    });
  }

  // Canvas Click / Tap handling for menu navigation
  canvas.addEventListener('click', () => {
    if (game.state === GameState.MENU) {
      game.startNewGame();
    } else if (game.state === GameState.GAME_OVER) {
      game.startNewGame();
    } else if (game.state === GameState.VICTORY) {
      game.continueToEndless();
    }
  });

  // Mobile Touch Buttons Listeners
  if (btnTouchLeft) {
    const setLeft = (val) => { game.input.touch.isLeft = val; };
    btnTouchLeft.addEventListener('touchstart', (e) => { e.preventDefault(); setLeft(true); }, { passive: false });
    btnTouchLeft.addEventListener('touchend', (e) => { e.preventDefault(); setLeft(false); }, { passive: false });
    btnTouchLeft.addEventListener('mousedown', () => setLeft(true));
    btnTouchLeft.addEventListener('mouseup', () => setLeft(false));
    btnTouchLeft.addEventListener('mouseleave', () => setLeft(false));
  }

  if (btnTouchRight) {
    const setRight = (val) => { game.input.touch.isRight = val; };
    btnTouchRight.addEventListener('touchstart', (e) => { e.preventDefault(); setRight(true); }, { passive: false });
    btnTouchRight.addEventListener('touchend', (e) => { e.preventDefault(); setRight(false); }, { passive: false });
    btnTouchRight.addEventListener('mousedown', () => setRight(true));
    btnTouchRight.addEventListener('mouseup', () => setRight(false));
    btnTouchRight.addEventListener('mouseleave', () => setRight(false));
  }

  if (btnTouchAction) {
    const setAction = (val) => {
      game.input.touch.isAction = val;
      if (val) {
        game.input.justPressed.add('TouchAction');
        if (game.state === GameState.MENU || game.state === GameState.GAME_OVER) {
          game.startNewGame();
        } else if (game.state === GameState.VICTORY) {
          game.continueToEndless();
        }
      }
    };
    btnTouchAction.addEventListener('touchstart', (e) => { e.preventDefault(); setAction(true); }, { passive: false });
    btnTouchAction.addEventListener('touchend', (e) => { e.preventDefault(); setAction(false); }, { passive: false });
    btnTouchAction.addEventListener('mousedown', () => setAction(true));
    btnTouchAction.addEventListener('mouseup', () => setAction(false));
    btnTouchAction.addEventListener('mouseleave', () => setAction(false));
  }

  // Keyboard shortcut listener for start/restart/continue on space
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      if (game.state === GameState.MENU || game.state === GameState.GAME_OVER) {
        game.startNewGame();
      } else if (game.state === GameState.VICTORY) {
        game.continueToEndless();
      }
    }
  });

  // Game Loop with fixed delta-time protection
  let lastTime = performance.now();

  function gameLoop(currentTime) {
    const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap delta time at 100ms
    lastTime = currentTime;

    game.update(dt);
    game.render();

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
