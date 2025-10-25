const defaultBindings = {
  moveUp: ['KeyW', 'ArrowUp'],
  moveDown: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  weave: ['Space'],
  pulse: ['KeyJ'],
  pause: ['Escape'],
};

export function createInput(canvas, settings, save) {
  const bindings = { ...defaultBindings, ...settings.bindings };
  const state = new Map();
  const listeners = new Map();
  let lastPointer = { x: 0, y: 0 };
  let capturing = null;

  const press = (code, pressed) => {
    state.set(code, pressed);
    for (const [action, keys] of Object.entries(bindings)) {
      if (keys.includes(code)) {
        const handlers = listeners.get(action);
        if (handlers) {
          handlers.forEach((fn) => fn(pressed));
        }
      }
    }
  };

  const handler = (ev) => {
    if (capturing) {
      ev.preventDefault();
      bindings[capturing] = [ev.code];
      capturing = null;
      settings.bindings = { ...bindings };
      save.saveSettings(settings);
      return;
    }
    if (ev.repeat) return;
    press(ev.code, ev.type === 'keydown');
  };

  window.addEventListener('keydown', handler);
  window.addEventListener('keyup', handler);

  canvas.addEventListener('pointermove', (ev) => {
    const rect = canvas.getBoundingClientRect();
    lastPointer = {
      x: ((ev.clientX - rect.left) / rect.width) * canvas.width,
      y: ((ev.clientY - rect.top) / rect.height) * canvas.height,
    };
  });

  const pointerButtons = new Set();
  canvas.addEventListener('pointerdown', (ev) => {
    pointerButtons.add(ev.button);
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointerup', (ev) => {
    pointerButtons.delete(ev.button);
    canvas.releasePointerCapture(ev.pointerId);
  });

  return {
    captureBinding(action) {
      capturing = action;
    },
    getPointer() {
      return lastPointer;
    },
    isPointerDown(button = 0) {
      return pointerButtons.has(button);
    },
    isPressed(action) {
      const keys = bindings[action] || [];
      return keys.some((code) => state.get(code));
    },
    onAction(action, fn) {
      if (!listeners.has(action)) listeners.set(action, new Set());
      listeners.get(action).add(fn);
      return () => listeners.get(action)?.delete(fn);
    },
    getMovementVector() {
      const x = (this.isPressed('moveRight') ? 1 : 0) - (this.isPressed('moveLeft') ? 1 : 0);
      const y = (this.isPressed('moveDown') ? 1 : 0) - (this.isPressed('moveUp') ? 1 : 0);
      const len = Math.hypot(x, y) || 1;
      return { x: x / len, y: y / len };
    },
    bindings,
    resetBindings() {
      Object.assign(bindings, defaultBindings);
      settings.bindings = { ...bindings };
      save.saveSettings(settings);
    },
  };
}
