export function createDebugOverlay(ui, settings) {
  const layer = ui.ensureLayer('debug');
  layer.style.pointerEvents = 'none';
  layer.style.alignItems = 'flex-start';
  layer.style.justifyContent = 'flex-start';
  layer.style.padding = '12px';
  layer.style.fontFamily = 'monospace';
  layer.style.fontSize = '14px';
  layer.style.color = 'rgba(255,255,255,0.7)';
  layer.style.display = 'none';

  let enabled = false;
  let lastToggle = 0;

  window.addEventListener('keydown', (ev) => {
    if (ev.key === '~' || ev.key === '`') {
      const now = performance.now();
      if (now - lastToggle < 200) return;
      lastToggle = now;
      enabled = !enabled;
      layer.style.display = enabled ? 'flex' : 'none';
    }
  });

  const update = ({ dt, frame, ecs }) => {
    if (!enabled) return;
    const fps = (1 / Math.max(0.0001, dt)).toFixed(1);
    layer.textContent = `FPS: ${fps}\nEntities: ${ecs.entities.size}\nFrame: ${frame}`;
  };

  return { update };
}
