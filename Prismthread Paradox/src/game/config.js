export const gameConfig = {
  arena: { width: 1100, height: 620 },
  player: {
    speed: 240,
    radius: 18,
    energyRegen: 12,
    maxEnergy: 100,
    maxHealth: 5,
  },
  enemies: {
    // Enemy names follow woven-thread theme.
    PrismGnats: {
      radius: 14,
      speed: 140,
      health: 2,
      colorIndex: 3,
      behavior: 'swarm',
      weight: 3,
    },
    LoomStalkers: {
      radius: 20,
      speed: 90,
      health: 5,
      colorIndex: 4,
      behavior: 'dash',
      windup: 0.9,
      weight: 2,
    },
    EchoMenders: {
      radius: 22,
      speed: 60,
      health: 4,
      colorIndex: 1,
      behavior: 'support',
      healAmount: 1,
      weight: 1,
    },
  },
  boss: {
    name: 'The Snarl',
    radius: 90,
    health: 80,
    phases: [
      { threshold: 0.66, pattern: 'spirals' },
      { threshold: 0.33, pattern: 'rifts' },
      { threshold: 0, pattern: 'overload' },
    ],
  },
  relics: [
    { id: 'warpStride', name: 'Warp Stride', description: '+10% movement', bonus: { speed: 1.1 } },
    { id: 'resonantCore', name: 'Resonant Core', description: '+1 max health', bonus: { maxHealth: 1 } },
    {
      id: 'echoReservoir',
      name: 'Echo Reservoir',
      description: '+20 max energy',
      bonus: { maxEnergy: 20 },
    },
  ],
  waves: [
    { time: 15, budget: 8 },
    { time: 30, budget: 12 },
    { time: 45, budget: 15 },
    { time: 60, budget: 20 },
  ],
};
