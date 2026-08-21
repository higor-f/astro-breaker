/**
 * Input Handler for Astro-Breaker
 * Supports Keyboard (Arrows, WASD, Space), Mouse, and Touch/Mobile Controls.
 */
export class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressed = new Set();

    this.mouse = {
      x: null,
      y: null,
      isDown: false,
      active: false
    };

    this.touch = {
      isLeft: false,
      isRight: false,
      isAction: false,
      active: false
    };

    this.setupKeyboard();
    this.setupMouse();
    this.setupTouch();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser scrolling with space or arrow keys during game
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  setupMouse() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
      this.mouse.active = true;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.justPressed.add('MouseAction');
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.isDown = false;
    });
  }

  setupTouch() {
    // Virtual touch control button event attachments can be handled via HUD or direct touches
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const touch = e.touches[0];
      this.mouse.x = (touch.clientX - rect.left) * scaleX;
      this.mouse.isDown = true;
      this.touch.active = true;
      this.justPressed.add('TouchAction');
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const touch = e.touches[0];
      this.mouse.x = (touch.clientX - rect.left) * scaleX;
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      this.mouse.isDown = false;
    });
  }

  isLeft() {
    return (
      this.keys.has('ArrowLeft') ||
      this.keys.has('KeyA') ||
      this.touch.isLeft
    );
  }

  isRight() {
    return (
      this.keys.has('ArrowRight') ||
      this.keys.has('KeyD') ||
      this.touch.isRight
    );
  }

  isAction() {
    return (
      this.keys.has('Space') ||
      this.keys.has('ArrowUp') ||
      this.keys.has('KeyW') ||
      this.mouse.isDown ||
      this.touch.isAction
    );
  }

  isActionJustPressed() {
    const pressed = (
      this.justPressed.has('Space') ||
      this.justPressed.has('ArrowUp') ||
      this.justPressed.has('KeyW') ||
      this.justPressed.has('MouseAction') ||
      this.justPressed.has('TouchAction')
    );
    return pressed;
  }

  isPauseJustPressed() {
    return this.justPressed.has('KeyP') || this.justPressed.has('Escape');
  }

  isMuteJustPressed() {
    return this.justPressed.has('KeyM');
  }

  clearFrame() {
    this.justPressed.clear();
  }
}
