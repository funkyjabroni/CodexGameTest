export function createUIManager(root) {
  const layers = new Map();

  const ensureLayer = (name) => {
    if (!layers.has(name)) {
      const el = document.createElement('div');
      el.className = `ui-layer ui-${name}`;
      el.style.position = 'absolute';
      el.style.inset = '0';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.pointerEvents = 'none';
      root.appendChild(el);
      layers.set(name, el);
    }
    return layers.get(name);
  };

  const clearLayer = (name) => {
    const layer = ensureLayer(name);
    layer.innerHTML = '';
  };

  const show = (name, builder) => {
    const layer = ensureLayer(name);
    clearLayer(name);
    layer.style.pointerEvents = 'auto';
    layer.style.display = 'flex';
    builder(layer);
  };

  const hide = (name) => {
    const layer = ensureLayer(name);
    layer.style.pointerEvents = 'none';
    layer.style.display = 'none';
  };

  return { ensureLayer, clearLayer, show, hide };
}
