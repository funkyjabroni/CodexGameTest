export function createHUD(ui, settings) {
  const layer = ui.ensureLayer('hud');
  layer.style.pointerEvents = 'none';
  layer.style.alignItems = 'flex-start';
  layer.style.justifyContent = 'space-between';
  layer.style.padding = '24px';
  layer.style.fontFamily = `'Segoe UI', sans-serif`;
  layer.style.fontSize = '18px';
  layer.style.color = '#f7f1ff';

  const topLeft = document.createElement('div');
  const topRight = document.createElement('div');
  topRight.style.marginLeft = 'auto';
  topRight.style.textAlign = 'right';
  const bottom = document.createElement('div');
  bottom.style.width = '100%';
  bottom.style.textAlign = 'center';
  bottom.style.marginTop = 'auto';

  layer.append(topLeft, topRight, bottom);

  const flashOverlay = document.createElement('div');
  flashOverlay.style.position = 'absolute';
  flashOverlay.style.inset = '0';
  flashOverlay.style.background = 'rgba(255,255,255,0)';
  flashOverlay.style.pointerEvents = 'none';
  flashOverlay.style.transition = 'background 0.4s ease-out';
  layer.appendChild(flashOverlay);

  const captionsBox = document.createElement('div');
  captionsBox.style.position = 'absolute';
  captionsBox.style.bottom = '80px';
  captionsBox.style.left = '50%';
  captionsBox.style.transform = 'translateX(-50%)';
  captionsBox.style.padding = '12px 16px';
  captionsBox.style.borderRadius = '12px';
  captionsBox.style.backdropFilter = 'blur(6px)';
  captionsBox.style.background = 'rgba(10, 12, 24, 0.6)';
  captionsBox.style.fontSize = '16px';
  captionsBox.style.maxWidth = '480px';
  captionsBox.style.display = 'none';
  captionsBox.setAttribute('aria-live', 'polite');
  layer.appendChild(captionsBox);

  let captionTimer = 0;
  let lastCaption = '';

  const update = (context) => {
    const { run, player, renderer } = context;
    layer.style.display = run.active ? 'flex' : 'none';
    if (!run.active || !player) return;

    const stats = player.components.player;
    const healthIcons = Array.from({ length: stats.maxHealth })
      .map((_, i) => (i < stats.health ? '⬢' : '⬡'))
      .join(' ');
    const energyRatio = Math.round((stats.energy / stats.maxEnergy) * 100);
    topLeft.innerHTML = `
      <div><strong>Health</strong> ${healthIcons}</div>
      <div><strong>Energy</strong> ${energyRatio}%</div>
    `;

    topRight.innerHTML = `
      <div><strong>Wave</strong> ${run.wave + 1}</div>
      <div><strong>Score</strong> ${run.score.toLocaleString()}</div>
      <div><strong>Time</strong> ${run.time.toFixed(1)}s</div>
      <div><strong>Seed</strong> ${run.seed}</div>
    `;

    bottom.textContent = `Crew sync: Logan • Kellum • Ethan • Hoff`; // constant flavor text

    if (captionTimer > 0) {
      captionTimer -= context.run.paused ? 0 : context.renderer.performanceMode ? 0.02 : 0.016;
      if (captionTimer <= 0) {
        captionsBox.style.display = 'none';
      }
    }
  };

  const flash = (intensity) => {
    const strength = Math.max(0, Math.min(1, intensity));
    flashOverlay.style.background = `rgba(255,255,255,${0.5 * strength})`;
    requestAnimationFrame(() => {
      flashOverlay.style.background = 'rgba(255,255,255,0)';
    });
  };

  const showCaption = (text, duration) => {
    if (!text) return;
    lastCaption = text;
    captionsBox.textContent = text;
    captionsBox.style.display = 'block';
    captionTimer = duration;
  };

  return {
    update,
    flash,
    showCaption,
  };
}
