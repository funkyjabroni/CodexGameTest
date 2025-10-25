// Lightweight WebAudio manager with procedural SFX and adaptive layers.
export function createAudio(settings) {
  let ctx = null;
  let master = null;
  const layers = new Map();
  let musicGain = null;

  const ensureContext = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = settings.masterVolume ?? 0.5;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = settings.musicVolume ?? 0.3;
      musicGain.connect(master);
      createMusicLayers();
    }
    if (ctx.state === 'suspended') ctx.resume();
  };

  const createMusicLayers = () => {
    if (!ctx) return;
    const tempos = [0.5, 1, 1.5];
    tempos.forEach((tempo, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 110 * Math.pow(1.33, index);
      const gain = ctx.createGain();
      gain.gain.value = index === 0 ? 0.3 : 0;
      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.value = tempo / 4;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain).connect(musicGain);
      osc.start();
      lfo.start();
      layers.set(index, { osc, gain, target: gain.gain.value });
    });
  };

  const playSfx = ({ type = 'pulse', pitch = 440, duration = 0.2, volume = 0.6 }) => {
    ensureContext();
    const osc = ctx.createOscillator();
    osc.type = type === 'pulse' ? 'square' : type === 'burst' ? 'sawtooth' : 'sine';
    const gain = ctx.createGain();
    gain.gain.value = volume;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, now + duration);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  };

  const setMusicState = (intensity) => {
    ensureContext();
    for (const [index, layer] of layers.entries()) {
      const target = Math.min(1, Math.max(0, intensity - index * 0.4));
      layer.target = target * (settings.musicVolume ?? 0.3);
    }
  };

  const update = () => {
    if (!ctx) return;
    for (const layer of layers.values()) {
      const current = layer.gain.gain.value;
      layer.gain.gain.value = current + (layer.target - current) * 0.02;
    }
  };

  return {
    ensureContext,
    playSfx,
    setMusicState,
    setMasterVolume(v) {
      ensureContext();
      master.gain.value = v;
      settings.masterVolume = v;
    },
    setMusicVolume(v) {
      ensureContext();
      musicGain.gain.value = v;
      settings.musicVolume = v;
    },
    update,
  };
}
