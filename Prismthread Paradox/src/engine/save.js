const defaultSettings = {
  palette: 'default',
  performanceMode: false,
  masterVolume: 0.5,
  musicVolume: 0.3,
  screenShake: 0.6,
  flashIntensity: 0.7,
  bindings: {},
};

const defaultProfile = {
  metaThreads: 0,
  bestScore: 0,
  unlocked: {},
};

export function createSaveSystem(prefix) {
  const safeGet = (key, fallback) => {
    try {
      const value = localStorage.getItem(`${prefix}.${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch (err) {
      console.warn('Save load failed', err);
      return fallback;
    }
  };

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(`${prefix}.${key}`, JSON.stringify(value));
    } catch (err) {
      console.warn('Save write failed', err);
    }
  };

  return {
    loadSettings() {
      return { ...defaultSettings, ...safeGet('settings', {}) };
    },
    saveSettings(settings) {
      safeSet('settings', settings);
    },
    loadProfile() {
      return { ...defaultProfile, ...safeGet('profile', {}) };
    },
    saveProfile(profile) {
      safeSet('profile', profile);
    },
    clearAll() {
      localStorage.removeItem(`${prefix}.settings`);
      localStorage.removeItem(`${prefix}.profile`);
    },
  };
}
