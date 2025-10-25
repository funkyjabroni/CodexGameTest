const palettes = {
  default: ['#0f0b1f', '#4c4dff', '#f6f1ff', '#f96ad7', '#53ffd6'],
  deuteranopia: ['#101223', '#4b6aff', '#fefefe', '#f06ad7', '#61f4ff'],
  protanopia: ['#0d1024', '#3b78ff', '#fdf9ff', '#a96ef4', '#58ffd3'],
  tritanopia: ['#0c1125', '#6d5bff', '#f7f7fa', '#ff9461', '#4fffa6'],
};

export function createRenderer(canvas, settings) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let paletteKey = settings.palette || 'default';
  let palette = palettes[paletteKey];
  let frame = 0;
  let performanceMode = settings.performanceMode ?? false;
  let shake = { x: 0, y: 0, power: 0 };

  const setPalette = (key) => {
    paletteKey = key in palettes ? key : 'default';
    palette = palettes[paletteKey];
    settings.palette = paletteKey;
  };

  const addShake = (strength) => {
    shake.power = Math.min(20, shake.power + strength * (settings.screenShake ?? 0.6) * 10);
  };

  const beginFrame = (perfMode = false) => {
    performanceMode = perfMode;
    frame += 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (shake.power > 0.01) {
      shake.x = (Math.random() - 0.5) * shake.power;
      shake.y = (Math.random() - 0.5) * shake.power;
      shake.power *= 0.85;
    } else {
      shake.x = shake.y = 0;
      shake.power = 0;
    }
    ctx.translate(shake.x, shake.y);
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, palette[0]);
    grad.addColorStop(1, '#05080f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawCircle = (x, y, r, color, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const drawPoly = (points, color, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const drawText = (text, x, y, options = {}) => {
    const { align = 'center', size = 24, color = palette[2], baseline = 'middle' } = options;
    ctx.save();
    ctx.font = `600 ${size}px 'Segoe UI', sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const drawRect = (x, y, w, h, color, alpha = 1, radius = 0) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    if (radius > 0) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  };

  return {
    ctx,
    get palette() {
      return palette;
    },
    get frame() {
      return frame;
    },
    beginFrame,
    drawCircle,
    drawPoly,
    drawText,
    drawRect,
    setPalette,
    addShake,
    get performanceMode() {
      return performanceMode;
    },
  };
}

export { palettes };
