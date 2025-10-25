import { gameConfig } from './config.js';

export function createWorldGenerator(rng) {
  const generateWave = (depth) => {
    const config = [];
    const budget = gameConfig.waves[Math.min(depth, gameConfig.waves.length - 1)].budget;
    let remaining = budget;
    const enemyEntries = Object.entries(gameConfig.enemies);
    while (remaining > 0) {
      const [name, data] = rng.choice(enemyEntries);
      remaining -= 1;
      const id = `${name}-${Math.floor(rng.random() * 1e6)}`;
      config.push({ type: name, ...data, id });
    }
    return config;
  };

  const generateRunSeed = (explicitSeed) => {
    const seed = rng.reseed(explicitSeed);
    return seed;
  };

  return {
    generateWave,
    generateRunSeed,
    arena: gameConfig.arena,
    gameConfig,
  };
}
