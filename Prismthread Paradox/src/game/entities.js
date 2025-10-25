import { gameConfig } from './config.js';

export function spawnPlayer(ecs, settings, profile) {
  const base = gameConfig.player;
  const bonuses = profile.unlocked || {};
  const speedBonus = bonuses.warpStride ? 1.1 : 1;
  const maxHealth = base.maxHealth + (bonuses.resonantCore ? 1 : 0);
  const maxEnergy = base.maxEnergy + (bonuses.echoReservoir ? 20 : 0);

  return ecs.createEntity({
    transform: { x: 640, y: 360 },
    motion: { vx: 0, vy: 0 },
    player: {
      name: 'Kyle',
      crew: ['Logan', 'Kellum', 'Ethan', 'Hoff'],
      energy: maxEnergy,
      maxEnergy,
      health: maxHealth,
      maxHealth,
      speed: base.speed * speedBonus,
      invuln: 0,
    },
    pulse: { cooldown: 0 },
    collider: { radius: base.radius },
  });
}

export function spawnEnemy(ecs, rng, type, config, arena) {
  const angle = rng.random() * Math.PI * 2;
  const radius = Math.min(arena.width, arena.height) * 0.45;
  const entity = ecs.createEntity({
    transform: {
      x: arena.width / 2 + Math.cos(angle) * radius,
      y: arena.height / 2 + Math.sin(angle) * radius,
    },
    motion: { vx: 0, vy: 0 },
    collider: { radius: config.radius },
    enemy: {
      type,
      health: config.health,
      behavior: config.behavior,
      data: config,
      stateTime: 0,
      target: null,
    },
    renderable: { colorIndex: config.colorIndex, pulse: 0 },
  });
  return entity;
}

export function spawnProjectile(ecs, origin, direction, speed, source) {
  const entity = ecs.createEntity({
    transform: { x: origin.x, y: origin.y },
    motion: { vx: direction.x * speed, vy: direction.y * speed },
    collider: { radius: 8 },
    projectile: { damage: 1, source },
    renderable: { colorIndex: 2, pulse: 0 },
  });
  return entity;
}

export function spawnBoss(ecs, arena, config) {
  return ecs.createEntity({
    transform: { x: arena.width / 2, y: arena.height / 2 },
    motion: { vx: 0, vy: 0 },
    collider: { radius: config.radius },
    boss: {
      name: config.name,
      health: config.health,
      maxHealth: config.health,
      phaseIndex: 0,
      timer: 0,
    },
    renderable: { colorIndex: 1, pulse: 0 },
  });
}
